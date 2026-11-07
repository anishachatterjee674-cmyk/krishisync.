// KrishiSync - Firebase Service Module (Auth & Firestore)
// Uses Firebase v10 CDN ES Modules for zero-build deployment on GitHub Pages

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export const FirebaseService = {
  app: null,
  auth: null,
  db: null,
  currentUser: null,
  isInitialized: false,

  // Default production config for all users, friends, and judges
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
    let config = customConfig;
    if (!config) {
      const saved = localStorage.getItem("krishisync_firebase_config");
      if (saved) {
        try { config = JSON.parse(saved); } catch (e) {}
      }
    }

    if (!config || !config.apiKey || config.apiKey === "YOUR_API_KEY") {
      config = this.defaultConfig;
    }

    try {
      this.app = getApps().length ? getApp() : initializeApp(config);
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);
      this.isInitialized = true;
      console.log("[Firebase] Successfully connected to project:", config.projectId);

      // Handle redirect sign-in result (for mobile & Edge browsers)
      getRedirectResult(this.auth).then((result) => {
        if (result && result.user) {
          this.currentUser = result.user;
          if (window.KrishiApp && window.KrishiApp.onFirebaseAuthStateChanged) {
            window.KrishiApp.onFirebaseAuthStateChanged(result.user);
          }
        }
      }).catch((err) => {
        console.warn("[Auth] Redirect check error:", err);
      });

      // Listen for Auth changes
      onAuthStateChanged(this.auth, (user) => {
        this.currentUser = user;
        if (window.KrishiApp && window.KrishiApp.onFirebaseAuthStateChanged) {
          window.KrishiApp.onFirebaseAuthStateChanged(user);
        }
      });

      return true;
    } catch (err) {
      console.error("[Firebase] Init error:", err);
      return false;
    }
  },

  // Google Sign-In with automatic popup/redirect fallback
  async loginWithGoogle() {
    if (!this.isInitialized || !this.auth) {
      this.init();
    }
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    
    try {
      const result = await signInWithPopup(this.auth, provider);
      this.currentUser = result.user;
      return result.user;
    } catch (err) {
      console.warn("[Auth] Popup error:", err.code, err.message);

      if (err.code === "auth/unauthorized-domain") {
        alert("⚠️ Unauthorized Domain!\nPlease open Firebase Console > Authentication > Settings > Authorized domains and add:\nanishachatterjee674-cmyk.github.io");
        throw err;
      }

      // If popup was closed or blocked, auto fallback to redirect
      if (err.code === "auth/popup-closed-by-user" || err.code === "auth/popup-blocked" || err.code === "auth/cancelled-popup-request") {
        console.log("[Auth] Switching directly to Google redirect sign-in...");
        return await signInWithRedirect(this.auth, provider);
      }
      throw err;
    }
  },

  // Sign Out
  async logout() {
    if (this.auth) {
      await signOut(this.auth);
      this.currentUser = null;
    }
  },

  // Save farmer profile to /users/{uid} in Firestore
  async saveUserProfile(profileData) {
    if (!this.db || !this.currentUser) return false;
    try {
      const userRef = doc(this.db, "users", this.currentUser.uid);
      await setDoc(userRef, {
        ...profileData,
        uid: this.currentUser.uid,
        email: this.currentUser.email || '',
        photoURL: this.currentUser.photoURL || '',
        updatedAt: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (e) {
      console.error("[Firebase] Error saving user profile:", e);
      return false;
    }
  },

  // Load user profile from /users/{uid} in Firestore
  async getUserProfile() {
    if (!this.db || !this.currentUser) return null;
    try {
      const userRef = doc(this.db, "users", this.currentUser.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data();
      }
    } catch (e) {
      console.warn("[Firebase] Could not get user profile:", e);
    }
    return null;
  },

  // Save soil test reading to /users/{uid}/readings AND /public_telemetry
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

    // 2. Push anonymized record to /public_telemetry for the Government Village Heatmap
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

  // Fetch past soil tests for current user
  async getUserReadings(maxResults = 20) {
    if (!this.db || !this.currentUser) return [];
    try {
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
    } catch (e) {
      console.warn("[Firebase] Could not fetch readings:", e);
      return [];
    }
  }
};
