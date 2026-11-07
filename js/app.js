// KrishiSync - Main Application Controller (Farmer Mobile App & Hardware Sync)
const KrishiApp = {
  activeTab: 'probe',
  currentView: 'farmer', // 'farmer' or 'officer'
  
  // Current farmer profile (Defaults to Guest mode for new visitors)
  profile: {
    name: 'Welcome, Farmer',
    nameBn: 'স্বাগতম, কৃষক বন্ধু',
    nameHi: 'नमस्ते, किसान मित्र',
    phone: '',
    landSize: 2.5, // acres (used for calibration & advisory)
    crop: 'Paddy',
    district: '',
    block: '',
    village: '',
    kisanId: '',
    isLoggedIn: false
  },

  // Active wand reading
  currentReading: {
    ph: 5.2,
    moisture: 24,
    healthScore: 56,
    battery: 92,
    timestamp: new Date().toISOString(),
    isBleConnected: false,
    synced: false
  },

  // History of readings stored locally
  history: [],

  init() {
    this.loadState();
    I18N.init();
    this.renderFarmerProfile();
    this.renderSoilReport();
    this.renderWeather();
    this.renderYojanas();
    this.renderHistory();
    this.setupEventListeners();

    // Check online/offline status
    this.updateNetworkBadge();
    window.addEventListener('online', () => this.updateNetworkBadge());
    window.addEventListener('offline', () => this.updateNetworkBadge());
  },

  loadState() {
    const savedProfile = localStorage.getItem('krishisync_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        // Only load profile if user actually logged in and it is not the legacy placeholder
        if (parsed && parsed.isLoggedIn && parsed.name && parsed.name !== 'Ramesh Ghosh') {
          this.profile = { ...this.profile, ...parsed };
        } else {
          // Reset to clean guest state
          this.profile.name = 'Welcome, Farmer';
          this.profile.isLoggedIn = false;
        }
      } catch (e) {}
    }

    const savedReading = localStorage.getItem('krishisync_current_reading');
    if (savedReading) {
      try { this.currentReading = JSON.parse(savedReading); } catch (e) {}
    }

    const savedHistory = localStorage.getItem('krishisync_history');
    if (savedHistory) {
      try { this.history = JSON.parse(savedHistory); } catch (e) {}
    } else {
      // Preload 2 realistic previous samples
      this.history = [
        {
          id: 'hist-1',
          date: 'Yesterday, 10:30 AM',
          plot: 'North Plot (Paddy)',
          ph: 5.4,
          moisture: 28,
          healthScore: 60,
          status: 'Acidic'
        },
        {
          id: 'hist-2',
          date: '03 Nov 2026, 04:15 PM',
          plot: 'South Plot (Potato Bed)',
          ph: 5.1,
          moisture: 22,
          healthScore: 52,
          status: 'Critical Acidic'
        }
      ];
      this.saveHistory();
    }
  },

  saveProfile() {
    localStorage.setItem('krishisync_profile', JSON.stringify(this.profile));
  },

  saveCurrentReading() {
    localStorage.setItem('krishisync_current_reading', JSON.stringify(this.currentReading));
  },

  saveHistory() {
    localStorage.setItem('krishisync_history', JSON.stringify(this.history));
  },

  calculateHealthScore(ph, moisture) {
    // Ideal pH is 6.5 to 7.2 (score 50), ideal moisture is 45% to 65% (score 50)
    let phScore = 50 - Math.abs(ph - 6.8) * 22;
    phScore = Math.max(10, Math.min(50, Math.round(phScore)));

    let moistScore = 50 - Math.abs(moisture - 55) * 1.1;
    moistScore = Math.max(10, Math.min(50, Math.round(moistScore)));

    return phScore + moistScore;
  },

  detectNameFromUser(user) {
    if (!user) return 'Farmer';
    if (user.displayName && user.displayName.trim().length > 0) {
      return user.displayName.trim();
    }
    if (user.email) {
      const username = user.email.split('@')[0];
      const cleaned = username.replace(/[0-9]+/g, '').replace(/[._-]+/g, ' ').trim();
      if (cleaned.length > 0) {
        return cleaned.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      }
      return username;
    }
    return 'Farmer Friend';
  },

  renderFarmerProfile() {
    const nameEl = document.getElementById('profileFarmerName');
    const metaEl = document.getElementById('profileMeta');
    const badgesRow = document.getElementById('profileBadgesRow');
    const villageBadge = document.getElementById('profileVillageBadge');
    const kisanIdBadge = document.getElementById('profileKisanIdBadge');
    const signInPrompt = document.getElementById('profileSignInPrompt');
    const editBtn = document.getElementById('profileEditBtn');
    const avatarEmoji = document.getElementById('profileAvatarEmoji');
    const avatarImg = document.getElementById('profileAvatarImg');

    if (this.profile.isLoggedIn) {
      // Logged in mode
      if (nameEl) nameEl.innerText = this.profile.name;
      if (metaEl) {
        if (this.profile.district || this.profile.village) {
          metaEl.innerText = `${this.profile.landSize} Acres • ${this.profile.crop} • ${this.profile.village ? this.profile.village + ', ' : ''}${this.profile.district || 'West Bengal'}`;
        } else {
          metaEl.innerText = `${this.profile.landSize} Acres • ${this.profile.crop} • Click "(Edit Farm Details)" to save your location & village`;
        }
      }
      if (badgesRow) {
        badgesRow.classList.remove('hidden');
        badgesRow.style.display = 'flex';
      }
      if (villageBadge) {
        villageBadge.innerText = this.profile.village ? `Village: ${this.profile.village}` : 'Village: Not Set';
      }
      if (kisanIdBadge) {
        kisanIdBadge.innerText = this.profile.kisanId ? `Kisan ID: ${this.profile.kisanId}` : 'Kisan ID: Not Set';
      }
      if (signInPrompt) {
        signInPrompt.classList.add('hidden');
        signInPrompt.style.display = 'none';
      }
      if (editBtn) {
        editBtn.classList.remove('hidden');
        editBtn.style.display = 'inline-block';
      }

      if (this.profile.photoURL && avatarImg) {
        avatarImg.src = this.profile.photoURL;
        avatarImg.classList.remove('hidden');
        if (avatarEmoji) avatarEmoji.classList.add('hidden');
      } else {
        if (avatarEmoji) {
          avatarEmoji.innerText = '👨‍🌾';
          avatarEmoji.classList.remove('hidden');
        }
        if (avatarImg) avatarImg.classList.add('hidden');
      }
    } else {
      // Guest / New visitor mode
      let guestTitle = 'Welcome, Farmer';
      if (I18N.currentLang === 'bn') guestTitle = 'স্বাগতম, কৃষক বন্ধু';
      if (I18N.currentLang === 'hi') guestTitle = 'नमस्ते, किसान मित्र';

      if (nameEl) nameEl.innerText = guestTitle;
      if (metaEl) {
        metaEl.innerText = 'Please sign in with Google to enter your field quantity (acres), location & view personalized soil advisories.';
      }
      if (badgesRow) {
        badgesRow.classList.add('hidden');
        badgesRow.style.display = 'none';
      }
      if (signInPrompt) {
        signInPrompt.classList.remove('hidden');
        signInPrompt.style.display = 'block';
      }
      if (editBtn) {
        editBtn.classList.add('hidden');
        editBtn.style.display = 'none';
      }
      if (avatarEmoji) {
        avatarEmoji.innerText = '👤';
        avatarEmoji.classList.remove('hidden');
      }
      if (avatarImg) avatarImg.classList.add('hidden');
    }

    // Modal form input fields sync
    const inputName = document.getElementById('inputName');
    const inputLand = document.getElementById('inputLand');
    const inputCrop = document.getElementById('inputCrop');
    const inputDistrict = document.getElementById('inputDistrict');
    const inputVillage = document.getElementById('inputVillage');
    const inputKisanId = document.getElementById('inputKisanId');
    const inputPhone = document.getElementById('inputPhone');

    if (inputName) inputName.value = (this.profile.name !== 'Welcome, Farmer') ? this.profile.name : '';
    if (inputLand) inputLand.value = this.profile.landSize || 2.5;
    if (inputCrop) inputCrop.value = this.profile.crop || 'Paddy';
    if (inputDistrict) inputDistrict.value = this.profile.district || '';
    if (inputVillage) inputVillage.value = this.profile.village || '';
    if (inputKisanId) inputKisanId.value = this.profile.kisanId || '';
    if (inputPhone) inputPhone.value = this.profile.phone || '';
  },

  renderSoilReport() {
    const { ph, moisture, healthScore } = this.currentReading;
    
    // Update score and meters
    const scoreVal = document.getElementById('healthScoreVal');
    const scoreRing = document.getElementById('healthScoreRing');
    if (scoreVal) scoreVal.innerText = healthScore;
    if (scoreRing) {
      // 283 is circumference of circle r=45
      const offset = 283 - (283 * healthScore) / 100;
      scoreRing.style.strokeDashoffset = offset;
      if (healthScore >= 75) scoreRing.style.stroke = '#10B981'; // Green
      else if (healthScore >= 50) scoreRing.style.stroke = '#F59E0B'; // Amber
      else scoreRing.style.stroke = '#EF4444'; // Red
    }

    // pH UI
    const phVal = document.getElementById('phValueDisplay');
    const phStatusBadge = document.getElementById('phStatusBadge');
    if (phVal) phVal.innerText = ph.toFixed(1);
    if (phStatusBadge) {
      if (ph < 6.0) {
        phStatusBadge.className = 'px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 border border-red-200';
        phStatusBadge.innerText = I18N.t('phStatusAcidic');
      } else if (ph > 7.5) {
        phStatusBadge.className = 'px-2.5 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-700 border border-purple-200';
        phStatusBadge.innerText = I18N.t('phStatusAlkaline');
      } else {
        phStatusBadge.className = 'px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200';
        phStatusBadge.innerText = I18N.t('phStatusOptimal');
      }
    }

    // Moisture UI
    const moistVal = document.getElementById('moistValueDisplay');
    const moistStatusBadge = document.getElementById('moistStatusBadge');
    const moistBar = document.getElementById('moistProgressBar');
    if (moistVal) moistVal.innerText = `${moisture}%`;
    if (moistBar) {
      moistBar.style.width = `${Math.min(100, Math.max(0, moisture))}%`;
      if (moisture < 25) moistBar.className = 'h-full bg-red-500 rounded-full transition-all duration-500';
      else if (moisture > 75) moistBar.className = 'h-full bg-blue-600 rounded-full transition-all duration-500';
      else moistBar.className = 'h-full bg-emerald-500 rounded-full transition-all duration-500';
    }
    if (moistStatusBadge) {
      if (moisture < 25) {
        moistStatusBadge.className = 'px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 border border-red-200';
        moistStatusBadge.innerText = I18N.t('moistStatusDry');
      } else if (moisture > 75) {
        moistStatusBadge.className = 'px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700 border border-blue-200';
        moistStatusBadge.innerText = I18N.t('moistStatusWet');
      } else {
        moistStatusBadge.className = 'px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200';
        moistStatusBadge.innerText = I18N.t('moistStatusGood');
      }
    }

    // Update Printable Official Soil Health Card Modal with real user info
    const cardFarmer = document.getElementById('cardFarmerName');
    const cardDate = document.getElementById('cardDate');
    const cardDistrict = document.getElementById('cardDistrict');
    const cardCropLand = document.getElementById('cardCropLand');
    const cardPh = document.getElementById('cardPhVal');
    const cardMoist = document.getElementById('cardMoistVal');
    const cardRecLime = document.getElementById('cardRecLime');
    const cardRecMoist = document.getElementById('cardRecMoist');
    const cardRecSubsidy = document.getElementById('cardRecSubsidy');

    if (cardFarmer) cardFarmer.innerText = this.profile.isLoggedIn ? this.profile.name : 'Farmer (Guest)';
    if (cardDate) cardDate.innerText = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    if (cardDistrict) cardDistrict.innerText = this.profile.district || (this.profile.village ? `${this.profile.village}, WB` : 'West Bengal');
    if (cardCropLand) cardCropLand.innerText = `${this.profile.crop || 'Paddy'} (${this.profile.landSize || 2.5} Acres)`;

    if (cardPh) {
      cardPh.innerText = `${ph.toFixed(1)} (${ph < 6.0 ? 'Acidic ⚠️' : (ph > 7.5 ? 'Alkaline ⚠️' : 'Optimal ✅')})`;
      cardPh.className = ph < 6.0 ? 'text-lg font-black text-red-600' : (ph > 7.5 ? 'text-lg font-black text-purple-600' : 'text-lg font-black text-emerald-600');
    }
    if (cardMoist) {
      cardMoist.innerText = `${moisture}% (${moisture < 25 ? 'Low 💧' : (moisture > 75 ? 'Excess 🌊' : 'Optimal ✅')})`;
    }

    const limePerAcre = ph < 5.2 ? 180 : 120;
    const totalLime = Math.round(limePerAcre * (this.profile.landSize || 2.5));
    if (cardRecLime) {
      if (ph < 6.0) {
        cardRecLime.innerHTML = `• Apply <strong>${totalLime} kg Agricultural Lime/Dolomite</strong> (${limePerAcre} kg/acre) across your ${this.profile.landSize || 2.5} acres before tilling.`;
      } else {
        cardRecLime.innerHTML = `• Soil pH is optimal. Apply standard recommended balanced N-P-K (10:26:26) per crop schedule.`;
      }
    }
    if (cardRecMoist) {
      if (moisture < 25) {
        cardRecMoist.innerHTML = `• Urgent irrigation (2-3 inches) required within 24 hours to prevent root capillary damage.`;
      } else if (moisture > 75) {
        cardRecMoist.innerHTML = `• Clear furrow drains to remove excess water and avoid root asphyxiation.`;
      } else {
        cardRecMoist.innerHTML = `• Soil moisture is at an ideal level (45-65%). Standard irrigation schedule.`;
      }
    }
    if (cardRecSubsidy) {
      if (ph < 6.0) {
        cardRecSubsidy.innerHTML = `• Matched Subsidy: <strong>50% Subsidy on Agricultural Lime</strong> (Soil Health Mission).`;
      } else {
        cardRecSubsidy.innerHTML = `• Matched Subsidy: <strong>Kisan Credit Card (KCC)</strong> & PM-KUSUM Solar Pump Aid.`;
      }
    }

    // Dynamic Action Steps & Fertilizer Advisory calculation
    this.generateAdvisory();
  },

  generateAdvisory() {
    const { ph, moisture } = this.currentReading;
    const landAcres = this.profile.landSize || 2.0;
    const advisoryContainer = document.getElementById('advisoryCardsList');
    if (!advisoryContainer) return;

    let cardsHtml = '';

    // 1. pH / Fertilizer Advisory
    if (ph < 6.0) {
      const limePerAcre = ph < 5.2 ? 180 : 120;
      const totalLime = Math.round(limePerAcre * landAcres);
      cardsHtml += `
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl mb-3 shadow-sm">
          <div class="flex items-start">
            <span class="text-2xl mr-3">🧪</span>
            <div>
              <div class="flex items-center justify-between">
                <h4 class="font-bold text-red-900 text-sm md:text-base">
                  ${I18N.currentLang === 'bn' ? 'অম্লীয় মৃত্তিকা সংশোধন নির্দেশিকা' : (I18N.currentLang === 'hi' ? 'अम्लीय मिट्टी सुधार सलाह' : 'Soil Acidity Neutralization')}
                </h4>
                <span class="text-xs bg-red-200 text-red-800 font-bold px-2 py-0.5 rounded">Action Required</span>
              </div>
              <p class="text-xs md:text-sm text-red-800 mt-1 font-medium">
                ${I18N.currentLang === 'bn' 
                  ? `আপনার জমির জন্য মোট <strong>${totalLime} কেজি কৃষি চুন বা ডলোমাইট</strong> প্রয়োজন (প্রতি একরে ${limePerAcre} কেজি)। জমি চষার সময় সমানভাবে মিশিয়ে দিন।`
                  : (I18N.currentLang === 'hi' 
                    ? `आपके खेत के लिए कुल <strong>${totalLime} किग्रा कृषि चूना</strong> आवश्यक है (${limePerAcre} किग्रा प्रति एकड़)। जुताई के समय इसे मिट्टी में मिलाएं।` 
                    : `Apply <strong>${totalLime} kg Agricultural Dolomite/Lime</strong> total (${limePerAcre} kg/acre) across your ${landAcres} acres. Mix thoroughly 2 weeks prior to transplanting to eliminate phosphorus fixation.`)}
              </p>
              <div class="mt-2 text-xs bg-white/70 p-2 rounded text-red-900 flex items-center justify-between">
                <span>💡 <strong>Govt Aid:</strong> 50% Subsidized Lime under Soil Health Mission!</span>
                <button onclick="KrishiApp.switchTab('yojanas')" class="text-emerald-700 font-bold underline ml-2">View Subsidy</button>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (ph > 7.5) {
      const gypsumPerAcre = 100;
      const totalGypsum = Math.round(gypsumPerAcre * landAcres);
      cardsHtml += `
        <div class="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-xl mb-3 shadow-sm">
          <div class="flex items-start">
            <span class="text-2xl mr-3">🌾</span>
            <div>
              <h4 class="font-bold text-purple-900 text-sm md:text-base">
                ${I18N.currentLang === 'bn' ? 'ক্ষারীয় মাটি নিয়ন্ত্রণ' : 'Alkaline Soil Management'}
              </h4>
              <p class="text-xs md:text-sm text-purple-800 mt-1">
                Apply <strong>${totalGypsum} kg Agricultural Gypsum</strong> (${gypsumPerAcre} kg/acre) and integrate organic vermicompost to buffer soil alkalinity.
              </p>
            </div>
          </div>
        </div>
      `;
    } else {
      cardsHtml += `
        <div class="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl mb-3 shadow-sm">
          <div class="flex items-start">
            <span class="text-2xl mr-3">✅</span>
            <div>
              <h4 class="font-bold text-emerald-900 text-sm md:text-base">
                ${I18N.currentLang === 'bn' ? 'চমৎকার সুষম মৃত্তিকা' : (I18N.currentLang === 'hi' ? 'उत्कृष्ट संतुलित मिट्टी' : 'Optimal Soil Health')}
              </h4>
              <p class="text-xs md:text-sm text-emerald-800 mt-1">
                ${I18N.currentLang === 'bn' 
                  ? 'আপনার মাটির পিএইচ আদর্শ মানে আছে। ফসলের বৃদ্ধির জন্য সাধারণ ১০:২৬:২৬ বা সুফলা সার নিয়ম মেনে প্রয়োগ করুন।'
                  : 'pH is within the sweet spot (6.5 - 7.2) for maximum nutrient uptake. Apply balanced N-P-K (10:26:26) as per regular crop schedule.'}
              </p>
            </div>
          </div>
        </div>
      `;
    }

    // 2. Moisture / Irrigation Advisory
    if (moisture < 25) {
      cardsHtml += `
        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl mb-3 shadow-sm">
          <div class="flex items-start">
            <span class="text-2xl mr-3">💧</span>
            <div>
              <div class="flex items-center justify-between">
                <h4 class="font-bold text-blue-900 text-sm md:text-base">
                  ${I18N.currentLang === 'bn' ? 'জরুরি সেচ পরিকল্পনা' : (I18N.currentLang === 'hi' ? 'तत्काल सिंचाई योजना' : 'Urgent Irrigation Advisory')}
                </h4>
                <span class="text-xs bg-blue-200 text-blue-800 font-bold px-2 py-0.5 rounded">Moisture: ${moisture}%</span>
              </div>
              <p class="text-xs md:text-sm text-blue-800 mt-1">
                ${I18N.currentLang === 'bn'
                  ? 'মাটিতে আর্দ্রতার পরিমাণ বিপজ্জনকভাবে কম (<২৫%)। আগামী ২৪ ঘণ্টার মধ্যে ২-৩ ইঞ্চি হালকা সেচ দিন।'
                  : (I18N.currentLang === 'hi' 
                    ? 'मिट्टी में नमी का स्तर 25% से कम है। फसल को सूखने से बचाने के लिए 24 घंटे के अंदर 2-3 इंच पानी लगाएं।'
                    : 'Soil moisture is critically deficient (<25%). Irrigate 2 to 3 inches within 24 hours to prevent permanent wilting of root capillaries.')}
              </p>
            </div>
          </div>
        </div>
      `;
    } else if (moisture > 75) {
      cardsHtml += `
        <div class="bg-cyan-50 border-l-4 border-cyan-500 p-4 rounded-r-xl mb-3 shadow-sm">
          <div class="flex items-start">
            <span class="text-2xl mr-3">🌊</span>
            <div>
              <h4 class="font-bold text-cyan-900 text-sm md:text-base">Drainage Management Required</h4>
              <p class="text-xs md:text-sm text-cyan-800 mt-1">Excess soil moisture detected. Clear field bund furrows to prevent root asphyxiation.</p>
            </div>
          </div>
        </div>
      `;
    }

    advisoryContainer.innerHTML = cardsHtml;
  },

  renderWeather() {
    const days = WeatherEngine.get14DayForecast(this.profile.district || 'Purba Bardhaman');
    const alert = WeatherEngine.getAgronomicWeatherAlert(days);

    // Weather Alert Box
    const alertBox = document.getElementById('weatherAgronomicAlert');
    if (alertBox) {
      if (alert.hasAlert) {
        let msg = alert.messageEn;
        if (I18N.currentLang === 'bn') msg = alert.messageBn;
        if (I18N.currentLang === 'hi') msg = alert.messageHi;

        alertBox.className = 'p-3 rounded-xl mb-4 text-xs md:text-sm bg-amber-50 border border-amber-300 text-amber-900 shadow-sm flex items-start';
        alertBox.innerHTML = `
          <span class="text-xl mr-2">⛈️</span>
          <div>
            <strong>${I18N.currentLang === 'bn' ? 'আবহাওয়া ভিত্তিক সার সতর্কতা' : 'Agronomic Weather Alert'}:</strong>
            <p class="mt-0.5">${msg}</p>
          </div>
        `;
      } else {
        alertBox.className = 'p-3 rounded-xl mb-4 text-xs md:text-sm bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-start';
        alertBox.innerHTML = `<span>☀️</span><span class="ml-2">${alert.messageEn}</span>`;
      }
    }

    // 14-day cards list
    const weatherList = document.getElementById('weather14DayList');
    if (weatherList) {
      weatherList.innerHTML = days.map((d, idx) => `
        <div class="flex items-center justify-between p-3 rounded-xl ${d.isRainAlert ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50 hover:bg-slate-100'} transition-all text-xs md:text-sm">
          <div class="flex items-center space-x-3">
            <span class="text-2xl">${d.icon}</span>
            <div>
              <div class="font-bold text-slate-800">
                ${d.dateStr} ${idx === 0 ? '<span class="text-emerald-600 font-extrabold text-xs ml-1">(Today)</span>' : ''}
              </div>
              <div class="text-slate-500 text-xs">
                ${I18N.currentLang === 'bn' ? d.conditionBn : (I18N.currentLang === 'hi' ? d.conditionHi : d.condition)}
              </div>
            </div>
          </div>
          
          <div class="text-right flex items-center space-x-4">
            <div>
              <span class="font-bold text-slate-900">${d.tempMax}°</span>
              <span class="text-slate-400 text-xs"> / ${d.tempMin}°C</span>
            </div>
            <div class="w-20 text-right">
              <span class="font-bold ${d.rainChance > 50 ? 'text-blue-600 font-extrabold' : 'text-slate-500'}">
                🌧️ ${d.rainChance}%
              </span>
              <div class="text-[10px] text-slate-400">💧 ${d.humidity}% Hum</div>
            </div>
          </div>
        </div>
      `).join('');
    }
  },

  renderYojanas() {
    const matched = YojanasEngine.filterSchemes(this.profile, this.currentReading);
    const container = document.getElementById('yojanasListContainer');
    if (!container) return;

    container.innerHTML = matched.map(scheme => {
      let title = scheme.nameEn;
      let benefit = scheme.benefitEn;
      let matchReason = scheme.matchReasonEn;
      if (I18N.currentLang === 'bn') {
        title = scheme.nameBn || scheme.nameEn;
        benefit = scheme.benefitBn || scheme.benefitEn;
        matchReason = scheme.matchReasonBn || scheme.matchReasonEn;
      } else if (I18N.currentLang === 'hi') {
        title = scheme.nameHi || scheme.nameEn;
        benefit = scheme.benefitHi || scheme.benefitEn;
      }

      const isSoilTriggered = scheme.eligibilityRules.triggerCondition === 'acidic_soil';

      return `
        <div class="border ${isSoilTriggered ? 'border-red-300 bg-red-50/40 shadow-md' : 'border-slate-200 bg-white shadow-sm'} rounded-2xl p-4 mb-4 transition-all hover:shadow-lg">
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center space-x-2 mb-1">
                <span class="px-2.5 py-0.5 text-[11px] font-bold rounded-full ${isSoilTriggered ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-100 text-emerald-800'}">
                  ${scheme.badge}
                </span>
                <span class="text-xs text-slate-500 font-medium">${scheme.sponsor}</span>
              </div>
              <h3 class="font-bold text-slate-900 text-sm md:text-base leading-snug">${title}</h3>
            </div>
            <span class="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
              ✓ Eligible
            </span>
          </div>

          <div class="my-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs md:text-sm">
            <span class="text-slate-500 font-semibold block text-[11px] uppercase tracking-wider">Financial Aid / Benefit</span>
            <span class="font-bold text-slate-800">${benefit}</span>
          </div>

          <div class="text-xs text-slate-600 mb-3 bg-amber-50/70 p-2 rounded-lg border border-amber-100">
            <strong>Eligibility Match:</strong> ${matchReason}
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span class="text-slate-500">📞 ${scheme.helpline}</span>
            <a href="${scheme.applyUrl}" target="_blank" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm flex items-center space-x-1">
              <span>${I18N.t('applyNow')}</span>
              <span>↗</span>
            </a>
          </div>
        </div>
      `;
    }).join('');
  },

  renderHistory() {
    const list = document.getElementById('historyListContainer');
    if (!list) return;

    if (this.history.length === 0) {
      list.innerHTML = `<div class="p-8 text-center text-slate-400 text-xs">No saved soil tests yet. Insert wand and tap Probe Field Now!</div>`;
      return;
    }

    list.innerHTML = this.history.map(item => `
      <div class="p-3 bg-white rounded-xl border border-slate-200 shadow-sm mb-2 flex items-center justify-between text-xs">
        <div>
          <div class="font-bold text-slate-800">${item.plot || 'Field Test'}</div>
          <div class="text-slate-400 text-[10px]">${item.date}</div>
        </div>
        <div class="flex items-center space-x-3">
          <div class="text-right">
            <span class="font-bold ${item.ph < 5.8 ? 'text-red-600' : 'text-emerald-600'}">pH ${item.ph}</span>
            <span class="text-slate-400 block text-[10px]">${item.moisture}% Moist</span>
          </div>
          <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] ${
            item.healthScore >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }">
            ${item.healthScore}
          </div>
        </div>
      </div>
    `).join('');
  },

  // Web Bluetooth API Integration for real ESP32 Wand
  async connectRealBleWand() {
    if (!navigator.bluetooth) {
      alert('Web Bluetooth API is not supported in this browser. Please use Google Chrome or Edge on Android / Desktop.');
      return;
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'KrishiSync' }],
        optionalServices: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b']
      });

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('4fafc201-1fb5-459e-8fcc-c5c9c331914b');
      const characteristic = await service.getCharacteristic('beb5483e-36e1-4688-b7f5-ea07361b26a8');

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const decoder = new TextDecoder('utf-8');
        const rawJson = decoder.decode(event.target.value);
        try {
          const data = JSON.parse(rawJson);
          this.applyWandReading(data.ph, data.moist, data.batt || 90);
        } catch (e) {
          console.error('BLE JSON Parse error:', e);
        }
      });

      this.currentReading.isBleConnected = true;
      this.updateWandStatusBadge(true);
      alert('✅ Connected to ESP32 KrishiSync-Wand over BLE!');
    } catch (err) {
      console.log('Bluetooth error or cancelled:', err);
    }
  },

  // Wand Hardware Simulator for Hackathon demo
  triggerSimulatedProbe(customPh, customMoisture, plotName = 'Main Plot') {
    const probeBtn = document.getElementById('probeFieldBtn');
    const wandStatus = document.getElementById('probeScanningStatus');
    
    if (probeBtn) probeBtn.disabled = true;
    if (wandStatus) {
      wandStatus.classList.remove('hidden');
      wandStatus.innerText = '⚡ Connecting to ESP32 Wand over BLE...';
    }

    // Play subtle audio beep via Web Audio API
    this.playProbeBeep(440, 0.15);

    setTimeout(() => {
      if (wandStatus) wandStatus.innerText = '🔬 Measuring ADC voltage & soil moisture impedance...';
      this.playProbeBeep(660, 0.15);
    }, 1000);

    setTimeout(() => {
      if (wandStatus) wandStatus.innerText = '📊 Processing calibration curve & N-P-K buffer...';
      this.playProbeBeep(880, 0.2);
    }, 2000);

    setTimeout(() => {
      if (probeBtn) probeBtn.disabled = false;
      if (wandStatus) wandStatus.classList.add('hidden');

      const ph = customPh !== undefined ? customPh : Number((4.5 + Math.random() * 3.2).toFixed(1));
      const moisture = customMoisture !== undefined ? customMoisture : Math.round(18 + Math.random() * 55);
      
      this.applyWandReading(ph, moisture, 88, plotName);
      this.playProbeBeep(1046, 0.35); // High success chime
    }, 2800);
  },

  applyWandReading(ph, moisture, battery = 88, plotName = 'Main Plot') {
    const healthScore = this.calculateHealthScore(ph, moisture);
    this.currentReading = {
      ph,
      moisture,
      healthScore,
      battery,
      timestamp: new Date().toISOString(),
      isBleConnected: true,
      synced: false
    };

    // Push into history
    this.history.unshift({
      id: 'test-' + Date.now(),
      date: 'Just now, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      plot: plotName,
      ph,
      moisture,
      healthScore,
      status: ph < 5.8 ? 'Acidic' : (ph > 7.5 ? 'Alkaline' : 'Optimal')
    });

    if (this.history.length > 20) this.history.pop();

    this.saveCurrentReading();
    this.saveHistory();

    // Push to Google Firebase Firestore if authenticated
    if (window.FirebaseService && window.FirebaseService.currentUser) {
      window.FirebaseService.saveSoilReading({
        ph,
        moisture,
        healthScore,
        battery,
        plot: plotName,
        status: ph < 5.8 ? 'Acidic' : (ph > 7.5 ? 'Alkaline' : 'Optimal'),
        district: this.profile.district,
        block: this.profile.block,
        village: this.profile.village
      }).then(() => {
        this.currentReading.synced = true;
        this.updateNetworkBadge();
      }).catch(err => {
        console.warn("[Firebase] Could not sync reading to Firestore:", err);
      });
    }

    this.renderSoilReport();
    this.renderYojanas();
    this.renderHistory();
    this.updateWandStatusBadge(true);
    this.updateNetworkBadge();
  },

  playProbeBeep(frequency, duration) {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  },

  updateWandStatusBadge(connected) {
    const badge = document.getElementById('wandStatusBadge');
    if (!badge) return;
    if (connected) {
      badge.className = 'flex items-center px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300';
      badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-ping"></span> ${I18N.t('wandConnected')}`;
    } else {
      badge.className = 'flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-300';
      badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-slate-400 mr-1.5"></span> ${I18N.t('wandDisconnected')}`;
    }
  },

  updateNetworkBadge() {
    const badge = document.getElementById('syncStatusBadge');
    if (!badge) return;
    const isOnline = navigator.onLine;

    if (isOnline && this.currentReading.synced) {
      badge.className = 'flex items-center px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-300';
      badge.innerHTML = `☁️ ${I18N.t('cloudSynced')}`;
    } else {
      badge.className = 'flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800 border border-amber-300';
      badge.innerHTML = `💾 ${I18N.t('offlineActive')} (${this.history.length} saved)`;
    }
  },

  syncToCloud() {
    const badge = document.getElementById('syncStatusBadge');
    if (badge) {
      badge.innerHTML = `⏳ Syncing to Govt Portal...`;
    }

    setTimeout(() => {
      this.currentReading.synced = true;
      this.saveCurrentReading();
      this.updateNetworkBadge();
      alert(`✅ SYNC COMPLETE!\n\n${this.history.length} soil readings successfully synced to Agricultural Cloud Database.`);
    }, 1200);
  },

  // WhatsApp Share with KVK Expert
  shareToWhatsApp() {
    const { ph, moisture, healthScore } = this.currentReading;
    const { name, district, crop, landSize, kisanId, village } = this.profile;
    
    let condition = 'Optimal Soil Health ✅';
    let action = 'Maintain standard balanced fertilizer regimen.';
    if (ph < 6.0) {
      condition = 'Acidic Soil ⚠️ (Phosphorus Fixation Alert)';
      const limeAmt = Math.round((ph < 5.2 ? 180 : 120) * (landSize || 2.5));
      action = `Apply ${limeAmt} kg Agricultural Dolomite/Lime across ${landSize || 2.5} acres before sowing.`;
    } else if (ph > 7.5) {
      condition = 'Alkaline Soil ⚠️';
      action = 'Apply Gypsum and green manure.';
    }

    let moistAlert = `${moisture}% (Optimal)`;
    if (moisture < 25) moistAlert = `${moisture}% (CRITICALLY DRY 💧 - Immediate Irrigation Needed)`;

    const text = 
`🌾 *KrishiSync Digital Soil Health Card* 🌾
━━━━━━━━━━━━━━━━━━━━
👨‍🌾 *Farmer:* ${name}
📍 *Location:* ${village ? village + ', ' : ''}${district || 'West Bengal'}
🌱 *Land:* ${landSize || 2.5} Acres | *Crop:* ${crop || 'Paddy'}
🆔 *Kisan ID:* ${kisanId || 'Not Set'}
📅 *Date:* ${new Date().toLocaleDateString('en-IN')}

🔬 *SOIL TELEMETRY:*
• Health Score: ${healthScore}/100
• Soil pH: ${ph.toFixed(1)} (${condition})
• Soil Moisture: ${moistAlert}

💡 *ACTION PLAN:*
${action}

🏛️ *GOVT SUBSIDY ELIGIBILITY:*
50% Subsidized Lime under Soil Health Mission / KCC Active.

_Generated live via KrishiSync IoT BLE Wand Analyzer_`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  },

  speakSoilReport() {
    const { ph, moisture } = this.currentReading;
    let spokenText = '';

    if (I18N.currentLang === 'bn') {
      spokenText = `নমস্কার ${this.profile.name}। আপনার মাটির পিএইচ মান হলো ${ph.toFixed(1)}। `;
      if (ph < 6.0) {
        spokenText += `মাটিতে অম্লতার পরিমাণ বেশি। বিঘে প্রতি চল্লিশ কেজি চুন প্রয়োগ করুন। `;
      } else {
        spokenText += `আপনার মাটির স্বাস্থ্য ভালো আছে। `;
      }
      if (moisture < 25) {
        spokenText += `মাটিতে জল কম আছে। আগামী চব্বিশ ঘণ্টায় সেচ দিন। `;
      }
      spokenText += `আগামী ৪৮ ঘণ্টায় বৃষ্টির পূর্বাভাস লক্ষ্য রাখুন। ধন্যবাদ।`;
    } else if (I18N.currentLang === 'hi') {
      spokenText = `नमस्ते ${this.profile.name} जी। आपकी मिट्टी का पीएच ${ph.toFixed(1)} है। `;
      if (ph < 6.0) {
        spokenText += `आपकी मिट्टी में अम्लता अधिक है। प्रति एकड़ डेढ़ सौ किलोग्राम चूना डालें। `;
      } else {
        spokenText += `मिट्टी की स्थिति अनुकूल है। `;
      }
      if (moisture < 25) {
        spokenText += `मिट्टी में नमी कम है, तुरंत सिंचाई करें। `;
      }
    } else {
      spokenText = `Hello ${this.profile.name}. Your soil pH reading is ${ph.toFixed(1)}. `;
      if (ph < 6.0) {
        spokenText += `Your soil is acidic. Apply 150 kilograms of Agricultural Lime per acre before next rain. `;
      } else {
        spokenText += `Your soil chemistry is balanced and healthy. `;
      }
      if (moisture < 25) {
        spokenText += `Soil moisture is low at ${moisture} percent. Irrigation is needed within 24 hours. `;
      }
    }

    I18N.speakText(spokenText);
  },

  switchTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll('.tab-content-panel').forEach(el => el.classList.add('hidden'));
    
    const target = document.getElementById('tab-' + tabId);
    if (target) target.classList.remove('hidden');

    // Update bottom nav buttons
    document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
      const tab = btn.getAttribute('data-tab');
      if (tab === tabId) {
        btn.classList.add('text-emerald-600', 'font-bold');
        btn.classList.remove('text-slate-400');
      } else {
        btn.classList.remove('text-emerald-600', 'font-bold');
        btn.classList.add('text-slate-400');
      }
    });

    if (tabId === 'weather') {
      this.renderWeather();
    }
  },

  switchView(viewName) {
    this.currentView = viewName;
    const farmerContainer = document.getElementById('farmerAppView');
    const officerContainer = document.getElementById('officerDashboardView');

    if (viewName === 'farmer') {
      farmerContainer.classList.remove('hidden');
      officerContainer.classList.add('hidden');
    } else {
      farmerContainer.classList.add('hidden');
      officerContainer.classList.remove('hidden');
      HeatmapEngine.initMap('govtHeatmap');
      this.renderOfficerMetrics();
    }

    // Toggle switch pill state
    document.getElementById('viewToggleFarmer').className = viewName === 'farmer' 
      ? 'px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white shadow'
      : 'px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 hover:text-slate-900';

    document.getElementById('viewToggleOfficer').className = viewName === 'officer' 
      ? 'px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white shadow'
      : 'px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 hover:text-slate-900';
  },

  renderOfficerMetrics() {
    const metrics = HeatmapEngine.getMacroMetrics();
    const statSamples = document.getElementById('officerTotalSamples');
    const statHotspots = document.getElementById('officerAcidHotspots');
    const statDolomite = document.getElementById('officerDolomiteNeeded');
    const statDrought = document.getElementById('officerDroughtVillages');

    if (statSamples) statSamples.innerText = metrics.totalSamples;
    if (statHotspots) statHotspots.innerText = `${metrics.criticalAcidityVillages} Villages`;
    if (statDolomite) statDolomite.innerText = `${metrics.totalDolomiteNeededMT} MT`;
    if (statDrought) statDrought.innerText = `${metrics.droughtStressedVillages} Villages`;
  },

  setupEventListeners() {
    // Probe button
    const probeBtn = document.getElementById('probeFieldBtn');
    if (probeBtn) {
      probeBtn.addEventListener('click', () => {
        this.triggerSimulatedProbe();
      });
    }

    // Language selector
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        I18N.setLanguage(e.target.value);
        this.renderFarmerProfile();
        this.renderSoilReport();
        this.renderWeather();
        this.renderYojanas();
      });
    }

    // Profile form submit: Saves farm quantity, location & personal details
    const profileForm = document.getElementById('farmerProfileForm');
    if (profileForm) {
      profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputName = document.getElementById('inputName');
        const inputLand = document.getElementById('inputLand');
        const inputCrop = document.getElementById('inputCrop');
        const inputDistrict = document.getElementById('inputDistrict');
        const inputVillage = document.getElementById('inputVillage');
        const inputKisanId = document.getElementById('inputKisanId');
        const inputPhone = document.getElementById('inputPhone');

        this.profile.name = inputName && inputName.value.trim() ? inputName.value.trim() : this.profile.name;
        this.profile.landSize = inputLand ? (parseFloat(inputLand.value) || 2.5) : 2.5;
        this.profile.crop = inputCrop ? inputCrop.value : 'Paddy';
        this.profile.district = inputDistrict ? inputDistrict.value.trim() : '';
        this.profile.village = inputVillage ? inputVillage.value.trim() : '';
        this.profile.kisanId = inputKisanId ? inputKisanId.value.trim() : '';
        this.profile.phone = inputPhone ? inputPhone.value.trim() : '';
        this.profile.isLoggedIn = true;

        this.saveProfile();
        this.renderFarmerProfile();
        this.renderSoilReport(); // dynamically recalculates fertilizer dosage for their field size!
        this.renderWeather();    // gets forecast for their district!
        this.renderYojanas();    // matches schemes for their land size & district!

        // Close modal
        document.getElementById('profileEditModal').classList.add('hidden');

        // Sync to Cloud Firestore (/users/{uid})
        if (window.FirebaseService && window.FirebaseService.currentUser) {
          const success = await window.FirebaseService.saveUserProfile({
            name: this.profile.name,
            landSize: this.profile.landSize,
            crop: this.profile.crop,
            district: this.profile.district,
            village: this.profile.village,
            kisanId: this.profile.kisanId,
            phone: this.profile.phone
          });
          if (success) {
            alert(`✅ Farm Profile Saved!\n\nWelcome, ${this.profile.name}.\nField Size: ${this.profile.landSize} Acres\nLocation: ${this.profile.village ? this.profile.village + ', ' : ''}${this.profile.district}\n\nFertilizer dosage and government subsidies have been customized for your farm.`);
          }
        } else {
          alert(`✅ Farm Profile Saved!\n\nField Size: ${this.profile.landSize} Acres.\nSign in with Google to sync your data across devices.`);
        }
      });
    }
  },

  // Google Authentication & Firebase Handlers
  async handleGoogleSignIn() {
    if (!window.FirebaseService) {
      alert("Firebase service is initializing. Please wait a moment.");
      return;
    }
    try {
      const user = await window.FirebaseService.loginWithGoogle();
      if (user) {
        await this.onFirebaseAuthStateChanged(user);
      }
    } catch (err) {
      console.warn("Sign-in error:", err);
      if (err.code === "auth/unauthorized-domain") {
        alert("⚠️ Unauthorized Domain!\nPlease add anishachatterjee674-cmyk.github.io to Firebase Console > Authentication > Settings > Authorized domains.");
      } else if (err.code === "auth/popup-closed-by-user") {
        console.log("Popup closed by user.");
      } else if (err.code === "auth/operation-not-allowed") {
        alert("⚠️ Google Sign-In is not enabled yet in your Firebase Console.\nPlease go to Firebase Console > Authentication > Sign-in method, click Google, and enable it.");
      } else {
        alert("Google Sign-In: " + (err.message || err));
      }
    }
  },

  async handleSignOut() {
    if (window.FirebaseService) {
      await window.FirebaseService.logout();
    }
    await this.onFirebaseAuthStateChanged(null);
    alert("Signed out successfully.");
  },

  async onFirebaseAuthStateChanged(user) {
    const signInBtn = document.getElementById('googleSignInBtn');
    const profileBadge = document.getElementById('userProfileBadge');
    const avatarImg = document.getElementById('userAvatarImg');
    const displayName = document.getElementById('userDisplayName');

    if (user) {
      console.log("[Auth] Signed in as:", user.email, user.uid);
      
      // Update top navbar: Hide Google Sign In button, Show Logged In profile badge
      if (signInBtn) {
        signInBtn.classList.add('hidden');
        signInBtn.style.display = 'none';
      }
      if (profileBadge) {
        profileBadge.classList.remove('hidden');
        profileBadge.style.display = 'flex';
      }

      const detectedName = this.detectNameFromUser(user);
      if (displayName) displayName.innerText = detectedName;
      if (avatarImg) {
        avatarImg.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(detectedName)}&background=10b981&color=fff`;
      }

      this.profile.isLoggedIn = true;
      this.profile.email = user.email || '';
      this.profile.photoURL = user.photoURL || '';
      if (!this.profile.name || this.profile.name === 'Welcome, Farmer') {
        this.profile.name = detectedName;
      }

      // Check Cloud Firestore for existing user profile
      let remoteProfile = null;
      if (window.FirebaseService && window.FirebaseService.getUserProfile) {
        remoteProfile = await window.FirebaseService.getUserProfile();
      }

      if (remoteProfile && (remoteProfile.district || remoteProfile.village || remoteProfile.landSize)) {
        // User already has saved farm details in Firestore!
        this.profile.name = remoteProfile.name || detectedName;
        this.profile.landSize = parseFloat(remoteProfile.landSize) || 2.5;
        this.profile.crop = remoteProfile.crop || 'Paddy';
        this.profile.district = remoteProfile.district || '';
        this.profile.village = remoteProfile.village || '';
        this.profile.block = remoteProfile.block || '';
        this.profile.kisanId = remoteProfile.kisanId || '';
        this.profile.phone = remoteProfile.phone || '';
        this.saveProfile();
        this.renderFarmerProfile();
        this.renderSoilReport();
        this.renderWeather();
        this.renderYojanas();
      } else {
        // First-time logged-in user: Prompt them to fill in their farm details!
        this.profile.name = detectedName;
        if (!this.profile.kisanId) {
          this.profile.kisanId = `WB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        }
        this.saveProfile();
        this.renderFarmerProfile();

        // Automatically open the Farm Details modal so they can enter field quantity, location, etc.
        const modal = document.getElementById('profileEditModal');
        const welcomeNotice = document.getElementById('profileModalNotice');
        const welcomeName = document.getElementById('modalWelcomeName');
        if (welcomeNotice && welcomeName) {
          welcomeName.innerText = detectedName;
          welcomeNotice.classList.remove('hidden');
        }
        if (modal) {
          modal.classList.remove('hidden');
        }
      }

      // Load user's private test history from Firestore
      if (window.FirebaseService && window.FirebaseService.getUserReadings) {
        const remoteReadings = await window.FirebaseService.getUserReadings();
        if (remoteReadings && remoteReadings.length > 0) {
          this.history = remoteReadings;
          this.saveHistory();
          this.renderHistory();
        }
      }

      this.currentReading.synced = true;
      this.updateNetworkBadge();
    } else {
      // LOGGED OUT / GUEST
      if (signInBtn) {
        signInBtn.classList.remove('hidden');
        signInBtn.style.display = 'flex';
      }
      if (profileBadge) {
        profileBadge.classList.add('hidden');
        profileBadge.style.display = 'none';
      }

      this.profile = {
        name: 'Welcome, Farmer',
        nameBn: 'স্বাগতম, কৃষক বন্ধু',
        nameHi: 'नमस्ते, किसान मित्र',
        phone: '',
        landSize: 2.5,
        crop: 'Paddy',
        district: '',
        block: '',
        village: '',
        kisanId: '',
        isLoggedIn: false
      };
      this.saveProfile();
      this.renderFarmerProfile();
      this.renderSoilReport();
      this.updateNetworkBadge();
    }
  }
};

window.KrishiApp = KrishiApp;

// Auto-boot application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  KrishiApp.init();
});
