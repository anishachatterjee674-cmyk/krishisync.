// KrishiSync - Government Agricultural Schemes & Subsidy Engine
// Curated dataset of Central & West Bengal Government Schemes with dynamic eligibility matching

const YojanasEngine = {
  schemes: [
    {
      id: 'wb-krishak-bandhu',
      nameEn: 'Krishak Bandhu (Assured Assistance & Life Insurance)',
      nameBn: 'কৃষক বন্ধু (নিশ্চিত আয় ও জীবনবীমা যোজনা)',
      nameHi: 'कृषक बंधु योजना (निश्चित आय एवं बीमा)',
      sponsor: 'Government of West Bengal',
      type: 'Direct Income Support',
      benefitEn: '₹10,000 / year (₹5,000 Kharif + ₹5,000 Rabi) for 1+ acre; Pro-rata min ₹4,000 for marginal farmers. Free ₹2 Lakh accidental death cover.',
      benefitBn: 'প্রতি বছর সর্বোচ্চ ১০,০০০ টাকা (দুটি কিস্তিতে) এবং ২ লক্ষ টাকার বিনামূল্যে মৃত্যু বীমা।',
      benefitHi: 'प्रति वर्ष ₹10,000 तक नकद सहायता (दो किश्तों में) एवं ₹2 लाख का निःशुल्क जीवन बीमा।',
      eligibilityRules: {
        maxLand: 100, // all land sizes eligible
        crops: ['All', 'Paddy', 'Potato', 'Jute', 'Mustard', 'Vegetables', 'Wheat'],
        state: 'West Bengal'
      },
      matchReasonEn: 'Applicable to all documented agricultural landowners and recorded Bhagchasi (sharecroppers) in West Bengal.',
      matchReasonBn: 'পশ্চিমবঙ্গের সকল নথিভুক্ত কৃষক ও ভাগচাষীদের জন্য ১০০% প্রযোজ্য।',
      applyUrl: 'https://krishakbandhu.wb.gov.in',
      helpline: '033-2214-5555 / 83369-57370',
      badge: 'State Flagship'
    },
    {
      id: 'wb-bangla-shasya-bima',
      nameEn: 'Bangla Shasya Bima (BSB) - 100% Free Crop Insurance',
      nameBn: 'বাংলা শস্য বীমা (বিএসবি) - সম্পূর্ণ বিনামূল্যে ফসল বীমা',
      nameHi: 'बांग्ला शस्य बीमा (BSB) - 100% निःशुल्क फसल बीमा',
      sponsor: 'Government of West Bengal',
      type: 'Crop Loss Protection',
      benefitEn: '100% Premium paid by WB State Govt for non-commercial crops (Paddy, Jute, Maize, Wheat). Direct payout for drought, flood, or pest attack.',
      benefitBn: 'চাষীকে কোনো প্রিমিয়াম দিতে হয় না। খরা, বন্যা বা অতিবৃষ্টিতে ফসলের ক্ষতি হলে সরাসরি অ্যাকাউন্টে ক্ষতিপূরণ।',
      benefitHi: 'किसानों के लिए शून्य प्रीमियम। बाढ़ या सूखे से नुकसान पर सीधा बैंक खाते में मुआवजा।',
      eligibilityRules: {
        maxLand: 100,
        crops: ['All', 'Paddy', 'Potato', 'Jute', 'Mustard', 'Wheat'],
        state: 'West Bengal'
      },
      matchReasonEn: 'Covers notified blocks of Bengal with remote sensing and automated weather station crop-cutting loss estimation.',
      matchReasonBn: 'আপনার নির্বাচিত ফসলের জন্য সরকার সম্পূর্ণ বীমা খরচ বহন করছে।',
      applyUrl: 'https://banglashasyabima.net',
      helpline: '1800-103-1100',
      badge: 'Zero Premium'
    },
    {
      id: 'central-pm-kisan',
      nameEn: 'PM-KISAN Samman Nidhi',
      nameBn: 'প্রধানমন্ত্রী কিসান সম্মান নিধি (পিএম-কিসান)',
      nameHi: 'प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)',
      sponsor: 'Central Government (GoI)',
      type: 'Income Support',
      benefitEn: '₹6,000 per year transferred in 3 equal four-monthly installments of ₹2,000 directly to Aadhaar-seeded bank account.',
      benefitBn: 'প্রতি চার মাস অন্তর ২০০০ টাকা করে বছরে মোট ৬,০০০ টাকা সরাসরি ব্যাংক অ্যাকাউন্টে জমা।',
      benefitHi: 'प्रति वर्ष ₹6,000 की नकद सहायता (3 किस्तों में ₹2,000-₹2,000) सीधे खाते में।',
      eligibilityRules: {
        maxLand: 50,
        crops: ['All'],
        state: 'All'
      },
      matchReasonEn: 'Direct Benefit Transfer for all landholding farmer families across India.',
      matchReasonBn: 'সমস্ত যোগ্য কৃষিজীবী পরিবারের জন্য কেন্দ্রীয় নগদ সহায়তা।',
      applyUrl: 'https://pmkisan.gov.in',
      helpline: '155261 / 1800-11-5526',
      badge: 'Central DBT'
    },
    {
      id: 'soil-health-lime-subsidy',
      nameEn: 'National Mission on Soil Health - Subsidized Agricultural Lime',
      nameBn: 'মৃত্তিকা স্বাস্থ্য মিশন - ভরতুকি মূল্যে কৃষি চুন ও ডলোমাইট বিতরণ',
      nameHi: 'मृदा स्वास्थ्य मिशन - रियायती दर पर कृषि चूना व डोलोमाइट',
      sponsor: 'Ministry of Agriculture & WB Agri Dept',
      type: 'Soil Ameliorant Subsidy',
      benefitEn: '50% subsidy (up to ₹2,500/ha) on Agricultural Grade Lime, Dolomite, or Basic Slag for reclaiming acidic soil (pH < 6.0).',
      benefitBn: 'অম্লীয় মাটির চিকিৎসার জন্য কৃষি চুন বা ডলোমাইটে ৫০% সরকারি ভরতুকি (হেক্টর প্রতি সর্বোচ্চ ২৫০০ টাকা)।',
      benefitHi: 'अम्लीय मिट्टी सुधार हेतु कृषि चूने पर 50% सरकारी अनुदान (अधिकतम ₹2,500 प्रति हेक्टेयर)।',
      eligibilityRules: {
        triggerCondition: 'acidic_soil', // Triggered if pH < 6.0!
        maxLand: 10,
        crops: ['All'],
        state: 'All'
      },
      matchReasonEn: '⚡ SPECIAL MATCH: Activated because your KrishiSync probe detected an acidic soil pH (< 6.0)!',
      matchReasonBn: '⚡ বিশেষ সুযোগ: আপনার মাটির পিএইচ অম্লীয় (pH < ৬.০) ধরা পড়ায় এই অনুদান আপনার জন্য সক্রিয় হয়েছে!',
      applyUrl: 'https://soilhealth.dac.gov.in',
      helpline: '011-2338-3370',
      badge: '⚡ Soil Triggered'
    },
    {
      id: 'pmksy-micro-irrigation',
      nameEn: 'PM Krishi Sinchayee Yojana (Per Drop More Crop - Drip & Sprinkler)',
      nameBn: 'প্রধানমন্ত্রী কৃষি সিঞ্চায়ী যোজনা (বিন্দু ও ফোয়ারা সেচ অনুদান)',
      nameHi: 'प्रधानमंत्री कृषि सिंचाई योजना (ड्रिप एवं फव्वारा सिंचाई सब्सिडी)',
      sponsor: 'GoI & West Bengal CADC',
      type: 'Irrigation Modernization',
      benefitEn: '55% subsidy for Small & Marginal farmers (45% for others) on installation of Drip and Sprinkler irrigation systems.',
      benefitBn: 'ক্ষুদ্র ও প্রান্তিক চাষীদের জন্য ড্রিপ ও স্প্রিংকলার সেচ যন্ত্রপাতিতে ৫৫% পর্যন্ত বিশাল সরকারি অনুদান।',
      benefitHi: 'सूक्ष्म सिंचाई (ड्रिप/स्प्रिंकलर) लगाने पर 55% तक की भारी सरकारी सब्सिडी।',
      eligibilityRules: {
        triggerCondition: 'dry_soil', // Triggered if moisture < 30% or small/marginal farmer
        maxLand: 12.5,
        crops: ['Potato', 'Vegetables', 'Mustard', 'Paddy', 'All'],
        state: 'All'
      },
      matchReasonEn: '⚡ WATER CONSERVATION: Recommended to combat your field\'s low soil moisture readings and save 40% water.',
      matchReasonBn: '⚡ জলসংরক্ষণ: আপনার জমিতে জলের টান থাকায় আধুনিক সেচ ব্যবস্থার জন্য এই অনুদান অত্যন্ত উপযোগী।',
      applyUrl: 'https://pmksy.gov.in',
      helpline: '1800-180-1551',
      badge: 'Water Saving'
    },
    {
      id: 'wb-smam-mechanization',
      nameEn: 'Sub-Mission on Agricultural Mechanization (FARM MACHINERY SUBSIDY)',
      nameBn: 'কৃষি যান্ত্রিকীকরণ মিশন (ট্রাক্টর ও পাওয়ার টিলার ক্রয়ে ভরতুকি)',
      nameHi: 'कृषि यंत्रीकरण उप-मिशन (कृषि यंत्रों पर 50-80% अनुदान)',
      sponsor: 'Dept of Agriculture, West Bengal',
      type: 'Machinery Subsidy',
      benefitEn: '50% to 80% subsidy on Power Tillers, Rotavators, Solar Water Pumps, and Mini Tractors via Custom Hiring Centers (CHC).',
      benefitBn: 'পাওয়ার টিলার, রোটাভেটর ও কৃষি যন্ত্রপাতিতে ৫০% থেকে ৮০% পর্যন্ত আর্থিক ছাড়।',
      benefitHi: 'पॉवर टिलर, रोटावेटर एवं सोलर पंप खरीदने पर 50% से 80% तक की छूट।',
      eligibilityRules: {
        maxLand: 25,
        crops: ['All'],
        state: 'West Bengal'
      },
      matchReasonEn: 'Available for farmer groups, self-help groups (SHG), and individual verified farmers in West Bengal.',
      matchReasonBn: 'পশ্চিমবঙ্গের নথিভুক্ত কৃষক ও স্বনির্ভর গোষ্ঠীর জন্য উপলব্ধ।',
      applyUrl: 'https://matirkatha.net',
      helpline: '033-2225-8334',
      badge: 'Mechanization'
    }
  ],

  filterSchemes(profile, soilReading) {
    const { landSize = 2.0, crop = 'Paddy', state = 'West Bengal' } = profile;
    const ph = soilReading ? soilReading.ph : 6.5;
    const moisture = soilReading ? soilReading.moisture : 45;

    return this.schemes.filter(scheme => {
      const rules = scheme.eligibilityRules;
      
      // Land size check
      if (rules.maxLand && landSize > rules.maxLand) {
        return false;
      }
      
      // Crop check
      if (rules.crops && !rules.crops.includes('All') && !rules.crops.includes(crop)) {
        return false;
      }

      // Soil-triggered conditions
      if (rules.triggerCondition === 'acidic_soil') {
        // High priority if soil is actually acidic
        return ph < 6.4;
      }
      
      if (rules.triggerCondition === 'dry_soil') {
        // Recommended if soil moisture is dry or farmer grows potato/veggies
        return moisture < 40 || ['Potato', 'Vegetables', 'Mustard'].includes(crop);
      }

      return true;
    }).sort((a, b) => {
      // Put soil-triggered schemes right at top if condition matches
      if (a.eligibilityRules.triggerCondition && !b.eligibilityRules.triggerCondition) return -1;
      if (!a.eligibilityRules.triggerCondition && b.eligibilityRules.triggerCondition) return 1;
      return 0;
    });
  }
};
