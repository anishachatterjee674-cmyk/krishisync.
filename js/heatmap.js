// KrishiSync - Government Block Officer Village Heatmap & Macro Analytics Engine
const HeatmapEngine = {
  mapInstance: null,
  markersLayer: null,
  currentFilter: 'all',
  
  // Real agricultural villages in Purba Bardhaman & Hooghly blocks
  villagesData: [
    {
      id: 'v1',
      name: 'Memari (Village Radhakantapur)',
      block: 'Memari-I',
      district: 'Purba Bardhaman',
      lat: 23.1842,
      lng: 88.1126,
      samplesCount: 142,
      avgPh: 5.1, // Highly Acidic
      avgMoisture: 23, // Drought
      soilHealthScore: 54,
      primaryCrop: 'Aman Paddy & Potato',
      status: 'CRITICAL_ACIDIC',
      recommendedAction: 'Immediate dispatch of 35 Metric Tonnes Agricultural Lime / Dolomite under National Soil Health Mission. Allocate 50% subsidy to 142 registered farmers.',
      pacsName: 'Memari Central Cooperative Society (PACS)',
      actionTaken: false
    },
    {
      id: 'v2',
      name: 'Kalna (Village Baidyapur)',
      block: 'Kalna-II',
      district: 'Purba Bardhaman',
      lat: 23.2185,
      lng: 88.3644,
      samplesCount: 98,
      avgPh: 6.8, // Optimal
      avgMoisture: 52, // Optimal
      soilHealthScore: 89,
      primaryCrop: 'Boro Paddy & Jute',
      status: 'OPTIMAL',
      recommendedAction: 'Soil health is exemplary. Maintain regular organic matter addition and standard balanced N-P-K (10:26:26).',
      pacsName: 'Baidyapur Farmers Service Cooperative',
      actionTaken: false
    },
    {
      id: 'v3',
      name: 'Bhatar (Village Mahata)',
      block: 'Bhatar',
      district: 'Purba Bardhaman',
      lat: 23.4187,
      lng: 87.9056,
      samplesCount: 175,
      avgPh: 4.8, // Severe Acidity
      avgMoisture: 31,
      soilHealthScore: 48,
      primaryCrop: 'Paddy & Mustard',
      status: 'CRITICAL_ACIDIC',
      recommendedAction: 'Severe soil acidity causing phosphorus fixation. Priority supply of 60 MT Dolomite needed before Rabi sowing season.',
      pacsName: 'Bhatar Krishi Unnayan Samity',
      actionTaken: false
    },
    {
      id: 'v4',
      name: 'Ausgram (Village Guskara)',
      block: 'Ausgram-I',
      district: 'Purba Bardhaman',
      lat: 23.4983,
      lng: 87.7523,
      samplesCount: 110,
      avgPh: 5.4, // Acidic
      avgMoisture: 19, // Severe Drought
      soilHealthScore: 50,
      primaryCrop: 'Paddy & Vegetables',
      status: 'DROUGHT_ACIDIC',
      recommendedAction: 'Dual alert: Acidic soil + low moisture (<20%). Mobilize mobile solar irrigation pump units and distribute soil conditioner.',
      pacsName: 'Guskara Block Multi-Purpose Cooperative',
      actionTaken: false
    },
    {
      id: 'v5',
      name: 'Katwa (Village Dainhat)',
      block: 'Katwa-II',
      district: 'Purba Bardhaman',
      lat: 23.6152,
      lng: 88.1678,
      samplesCount: 84,
      avgPh: 6.5, // Good
      avgMoisture: 60,
      soilHealthScore: 86,
      primaryCrop: 'Paddy & Sesame',
      status: 'OPTIMAL',
      recommendedAction: 'Soil parameters healthy. Recommend micro-nutrient zinc sulfate application (5 kg/acre) for higher grain yield.',
      pacsName: 'Dainhat Agri Marketing Society',
      actionTaken: false
    },
    {
      id: 'v6',
      name: 'Jamalpur (Village Chakdighi)',
      block: 'Jamalpur',
      district: 'Purba Bardhaman',
      lat: 23.0645,
      lng: 87.9892,
      samplesCount: 164,
      avgPh: 5.3, // Acidic
      avgMoisture: 44,
      soilHealthScore: 61,
      primaryCrop: 'Potato & Paddy',
      status: 'CRITICAL_ACIDIC',
      recommendedAction: 'Potato belt with recurrent soil acidification from excessive DAP usage. Route 40 MT lime with 50% subsidy to prevent scab disease.',
      pacsName: 'Chakdighi Samabaya Krishi Samity',
      actionTaken: false
    },
    {
      id: 'v7',
      name: 'Singur (Village Gopalnagar)',
      block: 'Singur',
      district: 'Hooghly',
      lat: 22.8124,
      lng: 88.2321,
      samplesCount: 205,
      avgPh: 6.7, // Optimal
      avgMoisture: 48,
      soilHealthScore: 88,
      primaryCrop: 'Multi-crop Vegetables & Paddy',
      status: 'OPTIMAL',
      recommendedAction: 'Balanced fertile alluvium. Promote bio-fertilizers (Azotobacter, PSB) to lower chemical input expenditure.',
      pacsName: 'Singur Vegetable Growers Cooperative',
      actionTaken: false
    },
    {
      id: 'v8',
      name: 'Tarakeswar (Village Talpur)',
      block: 'Tarakeswar',
      district: 'Hooghly',
      lat: 22.8845,
      lng: 88.0210,
      samplesCount: 132,
      avgPh: 5.6, // Moderate Acidic
      avgMoisture: 24, // Low moisture
      soilHealthScore: 64,
      primaryCrop: 'Potato & Jute',
      status: 'MODERATE_ACIDIC',
      recommendedAction: 'Recommend 150 kg lime/acre and check for sprinkler subsidy eligibility under PMKSY.',
      pacsName: 'Tarakeswar Cold Storage Cooperative',
      actionTaken: false
    },
    {
      id: 'v9',
      name: 'Arambagh (Village Mayapur)',
      block: 'Arambagh',
      district: 'Hooghly',
      lat: 22.8792,
      lng: 87.7812,
      samplesCount: 153,
      avgPh: 5.2, // Acidic
      avgMoisture: 38,
      soilHealthScore: 58,
      primaryCrop: 'Paddy & Mustard',
      status: 'CRITICAL_ACIDIC',
      recommendedAction: 'Acid red alluvium transition. Send block technical team for demonstration plot of lime + green manuring (Dhaincha).',
      pacsName: 'Arambagh Central Cooperative Bank Branch',
      actionTaken: false
    },
    {
      id: 'v10',
      name: 'Shantipur (Village Gobindapur)',
      block: 'Shantipur',
      district: 'Nadia',
      lat: 23.2514,
      lng: 88.4357,
      samplesCount: 95,
      avgPh: 7.2, // Slightly Alkaline / Neutral
      avgMoisture: 55,
      soilHealthScore: 84,
      primaryCrop: 'Vegetables & Floriculture',
      status: 'OPTIMAL',
      recommendedAction: 'Neutral pH with high organic matter. Excellent for marigold and cabbage production.',
      pacsName: 'Shantipur Farmers Association',
      actionTaken: false
    },
    {
      id: 'v11',
      name: 'Raina (Village Shyamsundar)',
      block: 'Raina-I',
      district: 'Purba Bardhaman',
      lat: 23.0924,
      lng: 87.8765,
      samplesCount: 122,
      avgPh: 5.0, // Critical Acidic
      avgMoisture: 21,
      soilHealthScore: 51,
      primaryCrop: 'Paddy & Pulses',
      status: 'CRITICAL_ACIDIC',
      recommendedAction: 'Emergency allocation: 40 MT Dolomitic lime required for 200 acres. Mobilize KVK Burdwan extension team.',
      pacsName: 'Shyamsundar Primary Agri Credit Society',
      actionTaken: false
    },
    {
      id: 'v12',
      name: 'Khandaghosh (Village Saspur)',
      block: 'Khandaghosh',
      district: 'Purba Bardhaman',
      lat: 23.2141,
      lng: 87.6912,
      samplesCount: 104,
      avgPh: 5.5,
      avgMoisture: 42,
      soilHealthScore: 66,
      primaryCrop: 'Paddy & Potato',
      status: 'MODERATE_ACIDIC',
      recommendedAction: 'Lime requirement: 120 kg/acre. High farmer willingness for Krishak Bandhu input subsidy linkage.',
      pacsName: 'Khandaghosh Farmers Samity',
      actionTaken: false
    }
  ],

  initMap(containerId = 'govtHeatmap') {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Center map around Purba Bardhaman & Hooghly agricultural belt
    if (!this.mapInstance && typeof L !== 'undefined') {
      this.mapInstance = L.map(containerId, {
        center: [23.24, 88.05],
        zoom: 10,
        scrollWheelZoom: true
      });

      // OpenStreetMap clean free tiles (No API key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(this.mapInstance);

      this.markersLayer = L.layerGroup().addTo(this.mapInstance);
      this.renderMarkers();
    } else if (this.mapInstance) {
      setTimeout(() => this.mapInstance.invalidateSize(), 200);
    }
  },

  renderMarkers() {
    if (!this.mapInstance || !this.markersLayer) return;
    this.markersLayer.clearLayers();

    const filtered = this.villagesData.filter(v => {
      if (this.currentFilter === 'all') return true;
      if (this.currentFilter === 'critical_acidic') return v.avgPh < 5.6;
      if (this.currentFilter === 'drought') return v.avgMoisture < 25;
      if (this.currentFilter === 'optimal') return v.avgPh >= 6.3 && v.avgPh <= 7.5;
      return true;
    });

    filtered.forEach(v => {
      let pinColor = '#10B981'; // green optimal
      let pulseClass = '';
      if (v.avgPh < 5.3) {
        pinColor = '#EF4444'; // Red Critical Acidic
        pulseClass = 'animate-pulse';
      } else if (v.avgPh < 6.0) {
        pinColor = '#F59E0B'; // Amber Moderate Acidic
      } else if (v.avgPh > 7.5) {
        pinColor = '#8B5CF6'; // Purple Alkaline
      }

      // Add circle indicator on map
      const circle = L.circleMarker([v.lat, v.lng], {
        radius: Math.min(24, Math.max(12, Math.round(v.samplesCount / 8))),
        fillColor: pinColor,
        color: '#ffffff',
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.65
      });

      // Tooltip & Popup
      const popupHtml = `
        <div class="p-3 font-sans" style="min-width: 260px;">
          <div class="flex items-center justify-between border-b pb-2 mb-2">
            <div>
              <span class="text-xs uppercase tracking-wider text-slate-500 font-semibold">${v.block} Block</span>
              <h4 class="font-bold text-slate-900 text-sm">${v.name}</h4>
            </div>
            <span class="px-2 py-0.5 text-xs font-bold rounded-full ${
              v.avgPh < 5.5 ? 'bg-red-100 text-red-700' : (v.avgPh < 6.2 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700')
            }">pH ${v.avgPh}</span>
          </div>
          
          <div class="grid grid-cols-2 gap-2 text-xs mb-3">
            <div class="bg-slate-50 p-1.5 rounded">
              <span class="text-slate-500 block">Soil Moisture</span>
              <span class="font-bold ${v.avgMoisture < 25 ? 'text-blue-600 font-extrabold' : 'text-slate-800'}">${v.avgMoisture}% ${v.avgMoisture < 25 ? '💧 Dry' : ''}</span>
            </div>
            <div class="bg-slate-50 p-1.5 rounded">
              <span class="text-slate-500 block">Farmers Tested</span>
              <span class="font-bold text-slate-800">${v.samplesCount} wands</span>
            </div>
            <div class="bg-slate-50 p-1.5 rounded col-span-2">
              <span class="text-slate-500 block">Primary Crop</span>
              <span class="font-semibold text-slate-800">${v.primaryCrop}</span>
            </div>
          </div>

          <div class="bg-amber-50 border border-amber-200 text-amber-900 p-2 rounded text-xs mb-3">
            <strong>Govt Recommendation:</strong>
            <p class="mt-1">${v.recommendedAction}</p>
          </div>

          <div class="flex items-center justify-between pt-1">
            <span class="text-xs text-slate-500">PACS: ${v.pacsName}</span>
            <button onclick="HeatmapEngine.showInterventionModal('${v.id}')" class="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded shadow-sm">
              Action Plan
            </button>
          </div>
        </div>
      `;

      circle.bindPopup(popupHtml);
      this.markersLayer.addLayer(circle);
    });
  },

  setFilter(filterType) {
    this.currentFilter = filterType;
    this.renderMarkers();
  },

  getMacroMetrics() {
    const totalSamples = this.villagesData.reduce((acc, v) => acc + v.samplesCount, 0);
    const criticalAcidityVillages = this.villagesData.filter(v => v.avgPh < 5.6).length;
    const droughtStressedVillages = this.villagesData.filter(v => v.avgMoisture < 25).length;
    const totalDolomiteNeededMT = this.villagesData
      .filter(v => v.avgPh < 6.0)
      .reduce((acc, v) => acc + Math.round(v.samplesCount * 0.25), 0);

    return {
      totalSamples,
      criticalAcidityVillages,
      droughtStressedVillages,
      totalDolomiteNeededMT,
      totalVillagesTracked: this.villagesData.length
    };
  },

  showInterventionModal(villageId) {
    const village = this.villagesData.find(v => v.id === villageId);
    if (!village) return;

    const modal = document.getElementById('interventionModal');
    if (!modal) return;

    document.getElementById('modalVillageTitle').innerText = village.name;
    document.getElementById('modalBlockName').innerText = `${village.block}, ${village.district}`;
    document.getElementById('modalPhStat').innerText = `pH ${village.avgPh}`;
    document.getElementById('modalMoistStat').innerText = `${village.avgMoisture}% Moisture`;
    document.getElementById('modalFarmersTested').innerText = `${village.samplesCount} Farmers Synced`;
    document.getElementById('modalActionPlan').innerText = village.recommendedAction;
    document.getElementById('modalPacsInfo').innerText = village.pacsName;

    // Attach active village id to confirm button
    const confirmBtn = document.getElementById('confirmDispatchBtn');
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        village.actionTaken = true;
        alert(`✅ OFFICIAL SANCTION GRANTED!\n\nDispatched 35 MT Subsidized Agricultural Dolomite to:\n${village.pacsName}\n\nSMS notifications queued for ${village.samplesCount} registered farmers.`);
        modal.classList.add('hidden');
        this.renderMarkers();
      };
    }

    modal.classList.remove('hidden');
  }
};
