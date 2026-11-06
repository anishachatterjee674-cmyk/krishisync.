// KrishiSync - Vernacular Language & Voice Engine (English, Bengali, Hindi)
const I18N = {
  currentLang: 'en',
  
  translations: {
    en: {
      appName: 'KrishiSync',
      tagline: 'Smart Soil & Subsidy Companion',
      farmerView: 'Farmer App',
      officerDashboard: 'Govt Officer Dashboard',
      
      // Status badges
      wandConnected: 'Wand Connected (BLE)',
      wandDisconnected: 'Wand Disconnected',
      offlineActive: 'Offline Storage Active',
      cloudSynced: 'Cloud Synced (4G)',
      battery: 'Wand Battery',
      
      // Navigation
      tabProbe: 'Soil Probe',
      tabWeather: '14-Day Weather',
      tabYojanas: 'Subsidies & Yojanas',
      tabAdvisory: 'Smart Advisory',
      tabHistory: 'Test History',
      
      // Probe Screen
      probeTitle: 'Handheld Wand Reading',
      probeSubtitle: 'Insert the probe 4 inches into the soil and tap Probe Field',
      probeBtn: 'Probe Field Now',
      probing: 'Analyzing Soil Chemistry...',
      phLabel: 'Soil pH Level',
      moistureLabel: 'Soil Moisture',
      healthScore: 'Soil Health Score',
      phStatusOptimal: 'Optimal for Crops (pH 6.5 - 7.5)',
      phStatusAcidic: 'Acidic Soil (pH < 6.0)',
      phStatusAlkaline: 'Alkaline Soil (pH > 7.5)',
      moistStatusDry: 'Critically Dry - Irrigation Needed',
      moistStatusGood: 'Optimal Moisture Level',
      moistStatusWet: 'Waterlogged - Improve Drainage',
      
      // Advisory
      advisoryTitle: 'Actionable Soil & Irrigation Plan',
      limeAdvice: 'Apply Agricultural Lime / Dolomite to neutralize soil acidity.',
      gypsumAdvice: 'Apply Agricultural Gypsum or elemental sulfur to balance alkaline soil.',
      optimalAdvice: 'Soil pH is well-balanced. Standard N-P-K fertilization recommended.',
      irrigationAlert: 'Immediate irrigation required within 24 hours.',
      rainWarning: 'Heavy rain predicted in next 48 hours! Hold off fertilizer & lime application to avoid runoff.',
      
      // WhatsApp & Share
      whatsappBtn: 'WhatsApp the Expert (KVK)',
      downloadCardBtn: 'Download Soil Health Card',
      expertSubtitle: 'Send instant PDF & readings to your local Krishi Vigyan Kendra officer or trusted agri-dealer.',
      
      // Yojanas
      yojanaTitle: 'Personalized Government Subsidies',
      yojanaSubtitle: 'Filtered for your landholding, crop type, and soil condition',
      eligibleBadge: '100% Eligible',
      applyNow: 'Apply on Official Portal',
      callHelpline: 'Kisan Helpline',
      subsidyValue: 'Financial Benefit',
      
      // Weather
      weatherTitle: '14-Day Micro-Weather Forecast',
      weatherSubtitle: 'Hyper-local agricultural weather prediction via GPS',
      rainChance: 'Rain Probability',
      humidity: 'Humidity',
      wind: 'Wind Speed',
      temp: 'Temperature',
      
      // Voice
      voiceSummary: 'Listen to Soil Report (Audio)',
      stopVoice: 'Stop Audio',
      
      // Farmer Profile
      profileTitle: 'Farmer & Land Profile',
      farmerName: 'Farmer Name',
      landSize: 'Land Size (Acres)',
      cropType: 'Primary Crop',
      district: 'District / Block',
      saveProfile: 'Update Profile'
    },
    
    bn: {
      appName: 'কৃষিসিংক (KrishiSync)',
      tagline: 'স্মার্ট মৃত্তিকা ও সরকারি যোজনা সাথী',
      farmerView: 'কৃষক অ্যাপ',
      officerDashboard: 'কৃষি আধিকারিক ড্যাশবোর্ড',
      
      // Status badges
      wandConnected: 'মাটি পরীক্ষার যন্ত্র সংযুক্ত (BLE)',
      wandDisconnected: 'যন্ত্র সংযোগ বিচ্ছিন্ন',
      offlineActive: 'অফলাইন ডেটা সংরক্ষণ চালু',
      cloudSynced: 'ক্লাউড সিঙ্ক সফল (৪জি)',
      battery: 'যন্ত্রের ব্যাটারি',
      
      // Navigation
      tabProbe: 'মাটি পরীক্ষা',
      tabWeather: '১৪ দিনের আবহাওয়া',
      tabYojanas: 'সরকারি অনুদান ও যোজনা',
      tabAdvisory: 'সারের পরামর্শ',
      tabHistory: 'পূর্ববর্তী পরীক্ষা',
      
      // Probe Screen
      probeTitle: 'হাতে-ধরা যন্ত্রে মাটির রিপোর্ট',
      probeSubtitle: 'মাটির ৪ ইঞ্চি গভীরে দণ্ডটি প্রবেশ করান এবং বোতাম টিপুন',
      probeBtn: 'মাটি পরীক্ষা করুন',
      probing: 'মাটির রাসায়নিক গুণ বিশ্লেষণ করা হচ্ছে...',
      phLabel: 'মাটির পিএইচ (pH)',
      moistureLabel: 'মাটির আর্দ্রতা',
      healthScore: 'মাটির স্বাস্থ্য স্কোর',
      phStatusOptimal: 'ফসলের জন্য উপযুক্ত (pH ৬.৫ - ৭.৫)',
      phStatusAcidic: 'অত্যধিক অম্লীয় মাটি (pH < ৬.০)',
      phStatusAlkaline: 'ক্ষারীয় মাটি (pH > ৭.৫)',
      moistStatusDry: 'অত্যধিক শুষ্ক - অবিলম্বে সেচ প্রয়োজন',
      moistStatusGood: 'অনুকূল আর্দ্রতা বজায় আছে',
      moistStatusWet: 'জল জমে আছে - নিকাশি প্রয়োজন',
      
      // Advisory
      advisoryTitle: 'সার ও সেচের সঠিক নির্দেশিকা',
      limeAdvice: 'মাটির অম্লতা কমাতে প্রতি একরে কৃষি চুন বা ডলোমাইট প্রয়োগ করুন।',
      gypsumAdvice: 'ক্ষারীয় মাটির ভারসাম্য ফেরাতে কৃষি জিপসাম বা সালফার দিন।',
      optimalAdvice: 'মাটি চমৎকার অবস্থায় আছে। সাধারণ এন-পি-কে সার নিয়ম মেনে প্রয়োগ করুন।',
      irrigationAlert: 'মাটিতে টান ধরেছে! আগামী ২৪ ঘণ্টার মধ্যে ২-৩ ইঞ্চি জলসেচ দিন।',
      rainWarning: 'সতর্কতা: আগামী ৪৮ ঘণ্টায় ভারী বৃষ্টির সম্ভাবনা রয়েছে! সার বা চুন ছড়ানো স্থগিত রাখুন।',
      
      // WhatsApp & Share
      whatsappBtn: 'কেভিকে (KVK) বিশেষজ্ঞকে হোয়াটসঅ্যাপ করুন',
      downloadCardBtn: 'মৃত্তিকা স্বাস্থ্য কার্ড ডাউনলোড',
      expertSubtitle: 'রিপোর্টটি সরাসরি ব্লক কৃষি আধিকারিক বা নিকটস্থ সারের ডিলারকে পাঠিয়ে পরামর্শ নিন।',
      
      // Yojanas
      yojanaTitle: 'আপনার জন্য নির্বাচিত সরকারি যোজনা',
      yojanaSubtitle: 'আপনার জমির পরিমাণ, ফসল ও মাটির ধরনের ভিত্তিতে প্রস্তুত',
      eligibleBadge: 'আপনি যোগ্য',
      applyNow: 'অফিসিয়াল পোর্টালে আবেদন',
      callHelpline: 'কিসান হেল্পলাইন ১৮০০-১৮০-১৫৫১',
      subsidyValue: 'আর্থিক সহায়তা',
      
      // Weather
      weatherTitle: '১৪ দিনের হাইপার-লোকাল আবহাওয়া',
      weatherSubtitle: 'কৃষি ভিত্তিক নির্ভুল বৃষ্টিপাত ও তাপমাত্রার পূর্বাভাস',
      rainChance: 'বৃষ্টির সম্ভাবনা',
      humidity: 'বাতাসের আর্দ্রতা',
      wind: 'বাতাসের গতিবেগ',
      temp: 'তাপমাত্রা',
      
      // Voice
      voiceSummary: 'মুখে শুনে নিন মাটির রিপোর্ট (অডিও)',
      stopVoice: 'অডিও বন্ধ করুন',
      
      // Farmer Profile
      profileTitle: 'কৃষকের পরিচয় ও জমির তথ্য',
      farmerName: 'কৃষকের নাম',
      landSize: 'জমির পরিমাণ (একর)',
      cropType: 'প্রধান ফসল',
      district: 'জেলা / ব্লক',
      saveProfile: 'তথ্য সংরক্ষণ করুন'
    },
    
    hi: {
      appName: 'कृषिसिंक (KrishiSync)',
      tagline: 'स्मार्ट मृदा प्रबंधन एवं सरकारी योजना साथी',
      farmerView: 'किसान ऐप',
      officerDashboard: 'कृषि अधिकारी डैशबोर्ड',
      
      // Status badges
      wandConnected: 'मृदा जांच यंत्र कनेक्टेड (BLE)',
      wandDisconnected: 'यंत्र डिस्कनेक्टेड',
      offlineActive: 'ऑफलाइन स्टोरेज सक्रिय',
      cloudSynced: 'क्लाउड सिंक संपन्न (4G)',
      battery: 'डिवाइस बैटरी',
      
      // Navigation
      tabProbe: 'मिट्टी परीक्षण',
      tabWeather: '14-दिवसीय मौसम',
      tabYojanas: 'सरकारी योजनाएं व सब्सिडी',
      tabAdvisory: 'खाद एवं उर्वरक सलाह',
      tabHistory: 'पिछली जांचें',
      
      // Probe Screen
      probeTitle: 'हैंडहेल्ड यंत्र से मिट्टी परीक्षण',
      probeSubtitle: 'जांच रॉड को मिट्टी में 4 इंच नीचे लगाएं और बटन दबाएं',
      probeBtn: 'अभी मिट्टी जांचें',
      probing: 'मिट्टी की जांच की जा रही है...',
      phLabel: 'मिट्टी का पीएच (pH)',
      moistureLabel: 'मिट्टी की नमी',
      healthScore: 'मृदा स्वास्थ्य स्कोर',
      phStatusOptimal: 'फसल के लिए उत्तम (pH 6.5 - 7.5)',
      phStatusAcidic: 'अम्लीय मिट्टी (pH < 6.0)',
      phStatusAlkaline: 'क्षारीय मिट्टी (pH > 7.5)',
      moistStatusDry: 'अत्यधिक सूखी - तुरंत सिंचाई आवश्यक',
      moistStatusGood: 'नमी का स्तर अनुकूल है',
      moistStatusWet: 'जलभराव - जल निकासी की व्यवस्था करें',
      
      // Advisory
      advisoryTitle: 'खाद व सिंचाई हेतु सटीक कार्ययोजना',
      limeAdvice: 'मिट्टी का अम्लीयपन दूर करने के लिए प्रति एकड़ कृषि चूना/डोलोमाइट डालें।',
      gypsumAdvice: 'क्षारीय मिट्टी को सुधारने के लिए कृषि जिप्सम या गंधक का प्रयोग करें।',
      optimalAdvice: 'मिट्टी की सेहत बहुत अच्छी है। फसल के अनुसार संतुलित N-P-K खाद डालें।',
      irrigationAlert: 'खेत में पानी की कमी है! अगले 24 घंटे में सिंचाई अवश्य करें।',
      rainWarning: 'चेतावनी: अगले 48 घंटों में तेज बारिश का अनुमान है! खाद व कीटनाशक छिड़काव रोक दें।',
      
      // WhatsApp & Share
      whatsappBtn: 'केवीके (KVK) विशेषज्ञ को व्हाट्सएप करें',
      downloadCardBtn: 'मृदा स्वास्थ्य कार्ड डाउनलोड करें',
      expertSubtitle: 'अपनी रिपोर्ट सीधे कृषि विज्ञान केंद्र अधिकारी या खाद विक्रेता को भेजें।',
      
      // Yojanas
      yojanaTitle: 'आपके लिए पात्र सरकारी योजनाएं',
      yojanaSubtitle: 'आपकी भूमि, मुख्य फसल और मिट्टी के आधार पर चयनित',
      eligibleBadge: 'आप पात्र हैं',
      applyNow: 'आधिकारिक पोर्टल पर आवेदन करें',
      callHelpline: 'किसान कॉल सेंटर 1800-180-1551',
      subsidyValue: 'आर्थिक लाभ',
      
      // Weather
      weatherTitle: '14-दिवसीय सटीक मौसम पूर्वानुमान',
      weatherSubtitle: 'जीपीएस आधारित स्थानीय वर्षा व तापमान की जानकारी',
      rainChance: 'बारिश की संभावना',
      humidity: 'हवा में नमी',
      wind: 'हवा की गति',
      temp: 'तापमान',
      
      // Voice
      voiceSummary: 'मिट्टी की रिपोर्ट बोलकर सुनें (ऑडियो)',
      stopVoice: 'ऑडियो रोकें',
      
      // Farmer Profile
      profileTitle: 'किसान व खेत की जानकारी',
      farmerName: 'किसान का नाम',
      landSize: 'जमीन का रकबा (एकड़)',
      cropType: 'मुख्य फसल',
      district: 'जिला / ब्लॉक',
      saveProfile: 'जानकारी सुरक्षित करें'
    }
  },
  
  t(key) {
    const lang = this.currentLang;
    if (this.translations[lang] && this.translations[lang][key]) {
      return this.translations[lang][key];
    }
    return this.translations.en[key] || key;
  },
  
  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('krishisync_lang', lang);
      this.updateDOM();
    }
  },
  
  init() {
    const saved = localStorage.getItem('krishisync_lang');
    if (saved && this.translations[saved]) {
      this.currentLang = saved;
    }
    this.updateDOM();
  },
  
  updateDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });
    
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.setAttribute('placeholder', this.t(key));
    });

    const langSelect = document.getElementById('langSelect');
    if (langSelect) langSelect.value = this.currentLang;
  },
  
  speakText(text) {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-Speech is not supported in this browser.');
      return;
    }
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose voice based on language
    const voices = window.speechSynthesis.getVoices();
    let langCode = 'en-IN';
    if (this.currentLang === 'bn') langCode = 'bn-IN';
    if (this.currentLang === 'hi') langCode = 'hi-IN';
    
    utterance.lang = langCode;
    const matchedVoice = voices.find(v => v.lang.startsWith(this.currentLang) || v.lang.includes(langCode));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
    
    utterance.rate = 0.9; // Slightly slower for clarity
    window.speechSynthesis.speak(utterance);
    return utterance;
  },
  
  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
};
