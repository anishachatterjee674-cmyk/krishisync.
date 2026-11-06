// KrishiSync - 14-Day Micro-Weather & Agronomic Advisory Engine
const WeatherEngine = {
  districts: [
    { name: 'Purba Bardhaman (Burdwan)', lat: 23.2324, lng: 87.8615, soilType: 'Alluvial & Lateritic' },
    { name: 'Hooghly (Singur / Arambagh)', lat: 22.9038, lng: 88.3966, soilType: 'Gangetic Alluvium' },
    { name: 'Nadia (Krishnanagar / Shantipur)', lat: 23.4013, lng: 88.5015, soilType: 'Clayey Loam' },
    { name: 'Birbhum (Suri / Bolpur)', lat: 23.9059, lng: 87.5246, soilType: 'Red Laterite (Acidic)' },
    { name: 'Bankura (Bishnupur)', lat: 23.2319, lng: 87.0784, soilType: 'Laterite Gravel' },
    { name: 'Murshidabad (Berhampore)', lat: 24.0988, lng: 88.2679, soilType: 'Silt Loam' },
    { name: 'Paschim Medinipur', lat: 22.4257, lng: 87.3199, soilType: 'Laterite & Acidic' }
  ],

  get14DayForecast(districtName = 'Purba Bardhaman (Burdwan)') {
    const today = new Date();
    const days = [];
    const conditionPool = [
      { textEn: 'Sunny & Clear', textBn: 'রোদঝলমলে পরিষ্কার আকাশ', textHi: 'साफ एवं धूपदार मौसम', icon: '☀️', rainChance: 5, rainMm: 0 },
      { textEn: 'Partly Cloudy', textBn: 'আংশিক মেঘলা', textHi: 'आंशिक बादल', icon: '⛅', rainChance: 15, rainMm: 0 },
      { textEn: 'Moderate Rain Expected', textBn: 'মাঝারি বৃষ্টির সম্ভাবনা', textHi: 'मध्यम बारिश का अनुमान', icon: '🌧️', rainChance: 75, rainMm: 18 },
      { textEn: 'Heavy Thunderstorms', textBn: 'বজ্রবিদ্যুৎসহ ভারী বৃষ্টি', textHi: 'गरज के साथ भारी बारिश', icon: '⛈️', rainChance: 90, rainMm: 42 },
      { textEn: 'Light Drizzle', textBn: 'হালকা গুঁড়ি গুঁড়ি বৃষ্টি', textHi: 'हल्की बूंदाबांदी', icon: '🌦️', rainChance: 40, rainMm: 4 },
      { textEn: 'Clear & Humid', textBn: 'উষ্ণ ও আর্দ্র আবহাওয়া', textHi: 'गर्म व उमस भरा दिन', icon: '🌤️', rainChance: 10, rainMm: 0 }
    ];

    // Seed realistic upcoming weather pattern for demo
    // Days 2 and 3 have forecasted rain so the Smart Fertilizer alert triggers!
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      let condition;
      if (i === 0) {
        condition = conditionPool[1]; // today partly cloudy
      } else if (i === 2) {
        condition = conditionPool[2]; // Day +2 Moderate Rain (Triggers fertilizer advisory warning!)
      } else if (i === 3) {
        condition = conditionPool[3]; // Day +3 Thunderstorms
      } else {
        condition = conditionPool[(i * 3 + 1) % conditionPool.length];
      }

      const tempMax = Math.round(30 + Math.sin(i) * 3);
      const tempMin = Math.round(22 + Math.cos(i) * 2);
      const humidity = Math.round(65 + Math.sin(i * 1.5) * 15);
      const windSpeed = Math.round(12 + Math.cos(i) * 6);

      days.push({
        dayIndex: i,
        dateStr: date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
        dateRaw: date,
        condition: condition.textEn,
        conditionBn: condition.textBn,
        conditionHi: condition.textHi,
        icon: condition.icon,
        rainChance: condition.rainChance,
        rainMm: condition.rainMm,
        tempMax,
        tempMin,
        humidity,
        windSpeed,
        isRainAlert: condition.rainChance >= 65 && i <= 3
      });
    }

    return days;
  },

  getAgronomicWeatherAlert(forecastDays) {
    // Check if rain expected in next 48-72 hours
    const nearRain = forecastDays.slice(0, 3).find(d => d.rainChance >= 60);
    if (nearRain) {
      return {
        hasAlert: true,
        type: 'RAIN_WARNING',
        day: nearRain.dateStr,
        rainChance: nearRain.rainChance,
        messageEn: `⚠️ WEATHER WARNING: ${nearRain.rainChance}% chance of rainfall on ${nearRain.dateStr}. DO NOT apply urea or surface lime today! Heavy rain causes fertilizer leaching and runoff loss. Wait until after the rain passes.`,
        messageBn: `⚠️ আবহাওয়া সতর্কতা: ${nearRain.dateStr}-এ ${nearRain.rainChance}% বৃষ্টির সম্ভাবনা রয়েছে। আজ জমিতে ইউরিয়া বা চুন ছড়াবেন না! বৃষ্টির জলে সারের অপচয় ও ধুয়ে যাওয়ার আশঙ্কা রয়েছে।`,
        messageHi: `⚠️ मौसम चेतावनी: ${nearRain.dateStr} को ${nearRain.rainChance}% बारिश का अनुमान है। आज यूरिया या चूना न छिड़कें! बारिश में खाद बह जाने का खतरा है।`
      };
    }
    
    // Check high humidity
    const humidDay = forecastDays[0];
    if (humidDay.humidity > 80 && humidDay.tempMax > 28) {
      return {
        hasAlert: true,
        type: 'DISEASE_ALERT',
        messageEn: `🌾 PEST/FUNGAL WATCH: High humidity (${humidDay.humidity}%) and warm weather favor Rice Blast & Sheath Blight. Inspect lower stems regularly.`,
        messageBn: `🌾 রোগবালাই সতর্কতা: উচ্চ আর্দ্রতা (${humidDay.humidity}%) ও উষ্ণতার কারণে ধানে ব্লাস্ট রোগের সম্ভাবনা বেশি। ধানের গোড়া নিয়মিত লক্ষ্য করুন।`,
        messageHi: `🌾 कीट/फफूंद चेतावनी: हवा में अधिक नमी (${humidDay.humidity}%) से धान में ब्लास्ट रोग का खतरा बढ़ जाता है। फसल की नियमित निगरानी करें।`
      };
    }

    return {
      hasAlert: false,
      type: 'NORMAL',
      messageEn: 'Weather conditions are stable for general farm operations, soil tilling, and planting.',
      messageBn: 'বর্তমানে আবহাওয়া কৃষি কাজের জন্য সম্পূর্ণ অনুকূল।',
      messageHi: 'वर्तमान में मौसम सामान्य कृषि कार्यों के लिए पूरी तरह अनुकूल है।'
    };
  }
};
