// KrishiSync - Firebase Service Module (Auth & Firestore)
// Uses Firebase v10 CDN ES Modules for zero-build deployment on GitHub Pages

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs,
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export const FirebaseService = {
  app: null,
  auth: null,
  db: null,
  currentUser: null,
  isInitialized: false,

  // Replace this placeholder with your config from Firebase Console:
  // Firebase Console > Project Settings > General > Your Apps > Web app
  defaultConfig: {
    apiKey: "AIzaSyDWSTIL7j8Lfqogae_tE5Ix0k2fxt-eRgc",
    authDomain: "krishi-sync.firebaseapp.com",
    projectId: "krishi-sync",
    storageBucket: "krishi-sync.firebasestorage.app",
    messagingSenderId: "1074546123998",
    appId: "1:1074546123998:web:672620bbf4382fead98e4f",
    measurementId: "G-W6563GPZ8T"
  },

  init(customConfig = null) {
    const config = customConfig || this.loadSavedConfig() || this.defaultConfig;
    
    // Check if configuration is set with real keys
    if (!config.apiKey || config.apiKey === "YOUR_API_KEY") {
      console.warn("[Firebase] Using placeholder configuration. Please enter your Firebase project keys.");
      this.isInitialized = false;
      return false;
    }

    try {
      this.app = initializeApp(config);
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);
      this.isInitialized = true;
      console.log("[Firebase] Successfully initialized with project:", config.projectId);
      return true;
    } catch (err) {
      console.error("[Firebase] Initialization error:", err);
      this.isInitialized = false;
      return false;
    }
  },

  loadSavedConfig() {
    const saved = localStorage.getItem("krishisync_firebase_config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  },

  saveConfig(config) {
    localStorage.setItem("krishisync_firebase_config", JSON.stringify(config));
    return this.init(config);
  },

  // Listen to Auth State
  onAuth(callback) {
    if (!this.isInitialized || !this.auth) {
      callback(null);
      return;
    }
    onAuthStateChanged(this.auth, async (user) => {
      this.currentUser = user;
      if (user) {
        console.log("[Auth] User logged in:", user.displayName, user.uid);
      } else {
        console.log("[Auth] User signed out.");
      }
      callback(user);
    });
  },

  // Google Sign-In Popup
  async loginWithGoogle() {
    if (!this.isInitialized) {
      throw new Error("Firebase is not initialized. Please provide your Firebase configuration keys first.");
    }
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const result = await signInWithPopup(this.auth, provider);
    this.currentUser = result.user;

    // Create / update initial user profile in Firestore
    await this.syncGoogleProfileToFirestore(result.user);
    return result.user;
  },

  // Sign Out
  async logout() {
    if (!this.auth) return;
    await signOut(this.auth);
    this.currentUser = null;
  },

  // Sync Google info to /users/{uid}
  async syncGoogleProfileToFirestore(user) {
    if (!this.db || !user) return;
    const userRef = doc(this.db, "users", user.uid);
    const existing = await getDoc(userRef);

    if (!existing.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName || "Farmer",
        email: user.email,
        photoURL: user.photoURL || "",
        phone: user.phoneNumber || "",
        landSize: 2.5,
        crop: "Paddy",
        district: "Purba Bardhaman",
        block: "Memari-I",
        village: "Radhakantapur",
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
    } else {
      await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
    }
  },

  // Save farmer land/crop profile to /users/{uid}
  async saveUserProfile(profileData) {
    if (!this.db || !this.currentUser) return;
    const userRef = doc(this.db, "users", this.currentUser.uid);
    await setDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp()
    }, { merge: true });
  },

  // Load user profile from /users/{uid}
  async getUserProfile() {
    if (!this.db || !this.currentUser) return null;
    const userRef = doc(this.db, "users", this.currentUser.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  },

  // Save soil test reading to /users/{uid}/readings/{readingId}
  async saveSoilReading(reading) {
    if (!this.db || !this.currentUser) return null;
    
    // 1. Save to private user collection
    const readingsCol = collection(this.db, "users", this.currentUser.uid, "readings");
    const docRef = await addDoc(readingsCol, {
      ph: Number(reading.ph),
      moisture: Number(reading.moisture),
      healthScore: Number(reading.healthScore),
      plot: reading.plot || "Main Field",
      status: reading.status || "Tested",
      battery: reading.battery || 90,
      timestamp: serverTimestamp(),
      farmerUid: this.currentUser.uid
    });

    // 2. Push anonymized record to /public_telemetry for the Government Village Heatmap!
    try {
      const publicCol = collection(this.db, "public_telemetry");
      await addDoc(publicCol, {
        ph: Number(reading.ph),
        moisture: Number(reading.moisture),
        healthScore: Number(reading.healthScore),
        district: reading.district || "Purba Bardhaman",
        block: reading.block || "Memari-I",
        village: reading.village || "Radhakantapur",
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.warn("[Firebase] Could not push to public_telemetry:", e);
    }

    return docRef.id;
  },

  // Fetch past soil tests for current logged-in user
  async getUserReadings(maxResults = 20) {
    if (!this.db || !this.currentUser) return [];
    const readingsCol = collection(this.db, "users", this.currentUser.uid, "readings");
    const q = query(readingsCol, orderBy("timestamp", "desc"), limit(maxResults));
    const snap = await getDocs(q);
    const results = [];
    snap.forEach((doc) => {
      const data = doc.data();
      results.push({
        id: doc.id,
        ...data,
        date: data.timestamp ? new Date(data.timestamp.toDate()).toLocaleString("en-IN") : "Just now"
      });
    });
    return results;
  }
};
