import { FarmerProfile, WeatherCondition, DayForecast, SoilMoistureDepth, AIAdvisory, MetricSummary } from '../types/advisory';

export const INITIAL_METRICS: MetricSummary = {
  totalFarmersServed: 14820,
  activeAdvisoriesCount: 3418,
  climateRisksDetected: 194,
  advisoriesDeliveredCount: 38940,
  waterSavedLiters: 12450000,
  pesticideSavedPct: 34.2,
};

export const SAMPLE_FARMERS: FarmerProfile[] = [
  {
    id: 'f-101',
    name: 'Ramesh Patil',
    phone: '+91 98234 11209',
    avatar: '👨🏽‍🌾',
    location: {
      village: 'Dindori',
      district: 'Nashik',
      state: 'Maharashtra',
      country: 'India',
      coordinates: [20.2036, 73.8315],
      elevationMeters: 580,
      microZoneName: 'Godavari Basin Micro-Zone 4',
    },
    preferredLanguage: 'mr',
    landHoldingAcres: 3.5,
    cropHistory: ['Tomato', 'Grapes', 'Soybean'],
    activeCropId: 'Tomato',
    lastAdvisoryDate: '2 hours ago',
    trustScore: 96,
  },
  {
    id: 'f-102',
    name: 'Savitri Devi',
    phone: '+91 94150 88312',
    avatar: '👩🏽‍🌾',
    location: {
      village: 'Chebrolu',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      country: 'India',
      coordinates: [16.2001, 80.5284],
      elevationMeters: 35,
      microZoneName: 'Krishna Delta Agro-Zone 2',
    },
    preferredLanguage: 'te',
    landHoldingAcres: 2.0,
    cropHistory: ['Cotton', 'Chilli', 'Paddy (Rice)'],
    activeCropId: 'Cotton',
    lastAdvisoryDate: 'Yesterday',
    trustScore: 92,
  },
  {
    id: 'f-103',
    name: 'Gurpreet Singh',
    phone: '+91 98140 55431',
    avatar: '👳🏽‍♂️',
    location: {
      village: 'Samrala',
      district: 'Ludhiana',
      state: 'Punjab',
      country: 'India',
      coordinates: [30.8354, 76.1915],
      elevationMeters: 262,
      microZoneName: 'Central Plain Agro-Zone 1',
    },
    preferredLanguage: 'hi',
    landHoldingAcres: 5.0,
    cropHistory: ['Wheat', 'Paddy (Rice)', 'Mustard'],
    activeCropId: 'Wheat',
    lastAdvisoryDate: '3 days ago',
    trustScore: 98,
  },
  {
    id: 'f-104',
    name: 'Kipchoge Mwangi',
    phone: '+254 722 458 912',
    avatar: '👨🏿‍🌾',
    location: {
      village: 'Maseno',
      district: 'Kisumu',
      state: 'Western Province',
      country: 'Kenya',
      coordinates: [-0.0039, 34.6033],
      elevationMeters: 1500,
      microZoneName: 'Lake Victoria Highland Agro-Zone',
    },
    preferredLanguage: 'sw',
    landHoldingAcres: 1.8,
    cropHistory: ['Maize', 'Coffee', 'Beans'],
    activeCropId: 'Maize',
    lastAdvisoryDate: '4 hours ago',
    trustScore: 89,
  }
];

export const MOCK_WEATHER_CURRENT: WeatherCondition = {
  currentTempC: 31.4,
  feelsLikeC: 34.8,
  rainProbabilityPct: 82,
  humidityPct: 78,
  windSpeedKmh: 18,
  windDirection: 'SW (220°)',
  solarRadiationWm2: 620,
  evapotranspirationMm: 4.2,
  nextRainExpectedInHours: 14,
  rainExpectedMm: 38.5,
  summary: 'Heavy convective thunderstorm front developing across micro-zone within next 14-18 hours.',
  uvIndex: 7,
  dewPointC: 23.1,
};

export const MOCK_SOIL_DEPTHS: SoilMoistureDepth[] = [
  {
    depthRange: '0 - 10 cm (Topsoil / Seed zone)',
    percentage: 68,
    status: 'Optimal',
    idealRange: [45, 70],
  },
  {
    depthRange: '10 - 40 cm (Active Root Zone)',
    percentage: 74,
    status: 'Saturated',
    idealRange: [50, 75],
  },
  {
    depthRange: '40 - 100 cm (Subsoil Reservoir)',
    percentage: 82,
    status: 'Saturated',
    idealRange: [55, 80],
  },
];

export const MOCK_FORECAST_7DAY: DayForecast[] = [
  { day: 'Today', date: 'Sept 10', tempMax: 32, tempMin: 22, rainChance: 82, rainMm: 38.5, weatherCode: 'storm', riskTag: 'Rain Alert' },
  { day: 'Thu', date: 'Sept 11', tempMax: 29, tempMin: 21, rainChance: 65, rainMm: 18.2, weatherCode: 'rainy', riskTag: 'Hold Spray' },
  { day: 'Fri', date: 'Sept 12', tempMax: 30, tempMin: 20, rainChance: 30, rainMm: 3.1, weatherCode: 'cloudy', riskTag: 'Pest Risk' },
  { day: 'Sat', date: 'Sept 13', tempMax: 32, tempMin: 22, rainChance: 15, rainMm: 0.0, weatherCode: 'partly-cloudy', riskTag: 'Optimal' },
  { day: 'Sun', date: 'Sept 14', tempMax: 33, tempMin: 23, rainChance: 10, rainMm: 0.0, weatherCode: 'sunny', riskTag: 'Optimal' },
  { day: 'Mon', date: 'Sept 15', tempMax: 34, tempMin: 23, rainChance: 20, rainMm: 0.5, weatherCode: 'sunny', riskTag: 'Irrigate' },
  { day: 'Tue', date: 'Sept 16', tempMax: 33, tempMin: 22, rainChance: 25, rainMm: 1.0, weatherCode: 'partly-cloudy', riskTag: 'Optimal' },
];

export const MOCK_DEFAULT_ADVISORY: AIAdvisory = {
  id: 'adv-2026-0910-01',
  farmerId: 'f-101',
  farmerName: 'Ramesh Patil',
  cropName: 'Tomato',
  growthStage: 'Flowering & Booting',
  soilType: 'Black Clay Soil (Vertisol)',
  irrigationType: 'Drip Irrigation',
  createdAt: 'Just now (Synced with Open-Meteo)',
  riskLevel: 'WATCH',
  confidencePct: 92,

  immediateAction: 'Delay scheduled irrigation by 36 hours & postpone fungal foliar spray until Friday morning.',
  whyItMatters: 'Convective thunderstorm of 38mm is 82% probable starting tomorrow afternoon. In-situ probe is unavailable; advice is derived from atmospheric precipitation balance. Irrigating now will trigger root hypoxia and flower drop.',
  recommendedTiming: 'Immediate window: Next 36 hours (Sept 10 - Sept 12). Resume normal schedule Sept 13.',
  impactPotential: 'Prevents 15-20% premature flower abortion and optimizes pumping energy while protecting root aeration.',

  translations: {
    en: {
      immediateAction: 'Delay scheduled irrigation by 36 hours & postpone fungal foliar spray until Friday morning.',
      whyItMatters: 'Convective thunderstorm of 38mm is 82% probable starting tomorrow afternoon. In-situ soil probe is unavailable on this plot; advice is derived from atmospheric rainfall balance. Irrigating now will trigger root hypoxia and flower drop.',
      recommendedTiming: 'Next 36 hours (Sept 10 - Sept 12). Resume normal schedule Sept 13.',
      smsBody: 'INDRADHANU KRISHI ADVISORY: Ramesh ji, heavy rain (38mm) expected tomorrow in Dindori. DO NOT irrigate tomato crop for 36 hours. Postpone all chemical spray to Friday morning. Helpline: 1800-INDRA.',
      voiceScript: 'Namaskar Ramesh Patil ji. This is your automated Indradhanu farm weather assistant. In your village Dindori, our satellites detect heavy rainfall of 38 millimeters within the next 24 to 36 hours. Please pause all drip irrigation immediately to protect your flowering tomato crop from waterlogging and flower drop. Postpone spray until Friday morning. Thank you.'
    },
    hi: {
      immediateAction: 'अगले 36 घंटे तक सिंचाई रोकें और फफूंदनाशक छिड़काव शुक्रवार सुबह तक टालें।',
      whyItMatters: 'कल दोपहर से 38 मिमी भारी बारिश की 82% संभावना है। भारी बारिश से खेत में जलभराव का खतरा है। पानी देने से फूल झड़ सकते हैं और जड़ें सड़ सकती हैं।',
      recommendedTiming: 'अगले 36 घंटे (10 से 12 सितंबर तक)। 13 सितंबर से सामान्य सिंचाई शुरू करें।',
      smsBody: 'इंद्रधनुष कृषि सलाह: रमेश जी, डिंडोरी में कल 38 मिमी भारी बारिश का अनुमान है। टमाटर में 36 घंटे तक पानी न दें और छिड़काव शुक्रवार तक टालें। टोल फ्री: 1800-INDRA',
      voiceScript: 'नमस्ते रमेश पाटिल जी। इंद्रधनुष किसान सेवा से यह जरूरी मौसम सलाह है। आपके गांव डिंडोरी में अगले 24 से 36 घंटों में 38 मिलीमीटर भारी बारिश होने की पूरी संभावना है। कृपया अपनी टमाटर की फसल में ड्रिप सिंचाई तुरंत रोक दें जिससे फूल न गिरें। कीटनाशक छिड़काव शुक्रवार सुबह करें। धन्यवाद।'
    },
    mr: {
      immediateAction: 'पुढील ३६ तास ठिबक सिंचन थांबवा आणि बुरशीनाशक फवारणी शुक्रवार सकाळपर्यंत पुढे ढकला.',
      whyItMatters: 'उद्या दुपारपासून ३८ मिमी जोरदार पावसाची शक्यता आहे. पावसामुळे जमिनीत पाणी साचून टोमॅटोचे फुलगळ होण्याची दाट भीती आहे.',
      recommendedTiming: 'पुढील ३६ तास (१० ते १२ सप्टेंबर). १३ सप्टेंबरपासून पूर्ववत पाणी द्या.',
      smsBody: 'इंद्रधनुष कृषी सल्ला: रमेश जी, दिंडोरी भागात उद्या ३८ मिमी जोरदार पाऊस अपेक्षित आहे. टोमॅटो पिकाला ३६ तास पाणी देऊ नका आणि फवारणी शुक्रवारपर्यंत पुढे ढकला. हेल्पलाईन: 1800-INDRA',
      voiceScript: 'नमस्कार रमेश पाटील साहेब. इंद्रधनुष हवामान कृषी सेवेतून बोलत आहोत. आपल्या दिंडोरी परिसरामध्ये पुढील २४ ते ३६ तासांत ३८ मिलीमीटर जोरदार अवकाळी पाऊस होण्याची शक्यता उपग्रहाद्वारे नोंदवली गेली आहे. टोमॅटो पिकाची फुलगळ वाचवण्यासाठी ठिबक सिंचन त्वरित थांबवा. फवारणी शुक्रवार सकाळी करा. धन्यवाद.'
    },
    te: {
      immediateAction: 'తదుపరి 36 గంటల పాటు నీటిపారుదలని నిలిపివేయండి మరియు మందుల పిచికారీని శుక్రవారం ఉదయానికి వాయిదా వేయండి.',
      whyItMatters: 'రేపు మధ్యాహ్నం నుండి 38 మి.మీ భారీ వర్షం కురిసే అవకాశం 82% ఉంది. వర్షం వల్ల నేలలో నీరు నిలిచిపోయే ప్రమాదం ఉంది. ఇప్పుడు నీరు పెడితే పువ్వు రాలిపోయే ప్రమాదం ఉంది.',
      recommendedTiming: 'తదుపరి 36 గంటలు (సెప్టెంబర్ 10 - 12). సెప్టెంబర్ 13 నుండి సాధారణ నీటిపారుదల.',
      smsBody: 'ఇంద్రధనుష్ వ్యవసాయ సలహా: రమేష్ గారు, రేపు 38 మి.మీ వర్షం కురిసే అవకాశం ఉంది. 36 గంటల పాటు టమాటా పంటకు నీరు పెట్టవద్దు. పిచికారీని శుక్రవారానికి వాయిదా వేయండి.',
      voiceScript: 'నమస్కారం రమేష్ పాటిల్ గారు. ఇంద్రధనుష్ రైతు వాతావరణ సేవ. మీ ప్రాంతంలో రాగల 24 నుండి 36 గంటల్లో భారీ వర్షం కురిసే అవకాశం ఉంది. దయచేసి టమాటా తోటకు నీరు పెట్టడం ఆపండి. ధన్యవాదాలు.'
    },
    sw: {
      immediateAction: 'Sitisha umwagiliaji kwa saa 36 zijazo na usubiri kupulizia dawa hadi Ijumaa asubuhi.',
      whyItMatters: 'Mvua kubwa ya milimita 38 inatarajiwa kesho mchana. Mvua kubwa itasababisha mafuriko ya maji shambani. Kumwagilia sasa kutasababisha maua ya nyanya kupukutika.',
      recommendedTiming: 'Saa 36 zijazo (Sept 10 - Sept 12). Rejelea umwagiliaji kawaida tarehe 13 Sept.',
      smsBody: 'USHAURI WA INDRADHANU: Ramesh, mvua kubwa (38mm) inatarajiwa kesho. USIMWAGILIE nyanya kwa saa 36. Hairisha kupulizia dawa hadi Ijumaa asubuhi.',
      voiceScript: 'Hujambo mkulima mwenzetu. Huu ni ushauri muhimu kutoka Indradhanu. Katika eneo lako, mvua kubwa ya milimita 38 inakaribia ndani ya saa 24 zijazo. Tafadhali sitisha umwagiliaji mara moja ili kulinda maua ya mazao yako. Asante sana.'
    }
  },

  actionSteps: [
    'Turn off automated drip pumps immediately until Saturday morning.',
    'Clear drainage furrows between tomato beds to avoid pooling at stem collars.',
    'Postpone copper oxychloride fungicide foliar spray to Friday 07:00 AM (post-rain wash window).',
    'Prepare potassium silicate support spray after rain subsides to boost cuticle strength.'
  ],

  scientificReasoning: [
    'NASA POWER Thermal Heat Index indicates stable air temp (31°C) with sudden convective moisture build-up (Dew point: 23.1°C).',
    'Open-Meteo High Resolution Radar tracks 38.5mm cumulonimbus storm cluster moving from southwest at 18 km/h.',
    'Biophysical Crop Model: Cumulative rainfall forecast will satisfy root hydration; in-situ sensor absent so soil weight reallocated.'
  ],

  climateTriggers: [
    { title: 'Rain Probability', value: '82% (38.5 mm)', trend: 'rising', severity: 'critical' },
    { title: 'Soil Sensor Telemetry', value: 'Unavailable (Reallocated)', trend: 'stable', severity: 'normal' },
    { title: 'Evapotranspiration', value: '4.2 mm/day', trend: 'falling', severity: 'normal' },
    { title: 'Wind Gust Window', value: '28 km/h SW', trend: 'rising', severity: 'caution' }
  ],

  channels: {
    sms: {
      sent: true,
      deliveredAt: '12:04 PM • 4G Jio Cell Tower',
      carrier: 'Jio Telecom Agri-SMS Gateway',
      characterCount: 156,
      body: 'INDRADHANU KRISHI ADVISORY: Ramesh ji, heavy rain (38mm) expected tomorrow in Dindori. DO NOT irrigate tomato crop for 36 hours. Postpone chemical spray to Friday morning.'
    },
    voice: {
      sent: true,
      callDurationSec: 42,
      answeredAt: '12:05 PM • Pickup (42 sec)',
      voiceTone: 'Friendly Regional Agronomist',
      transcript: 'Namaskar Ramesh Patil ji. This is your automated Indradhanu farm weather assistant. In your village Dindori, our satellites detect heavy rainfall of 38 millimeters within the next 24 to 36 hours. Your soil moisture is currently very high. Please pause all drip irrigation immediately to protect your flowering tomato crop from waterlogging and flower drop. Postpone spray until Friday morning. Thank you.'
    },
    whatsapp: {
      sent: true,
      deliveredAt: '12:04 PM',
      readAt: '12:06 PM (Read by Farmer)'
    }
  }
};

export const CROPS_CONFIG = [
  { name: 'Tomato', icon: '🍅', idealSoil: 'Alluvial / Black Loam', season: 'Kharif / Rabi', waterDemand: 'Moderate' },
  { name: 'Wheat', icon: '🌾', idealSoil: 'Clay Loam / Alluvial', season: 'Rabi', waterDemand: 'Moderate to High' },
  { name: 'Paddy (Rice)', icon: '🌱', idealSoil: 'Clay / Silt Clay', season: 'Kharif', waterDemand: 'High' },
  { name: 'Cotton', icon: '☁️', idealSoil: 'Black Clay (Vertisol)', season: 'Kharif', waterDemand: 'Moderate' },
  { name: 'Maize', icon: '🌽', idealSoil: 'Well-drained Loam', season: 'Kharif / Spring', waterDemand: 'Moderate' },
  { name: 'Mustard', icon: '🌼', idealSoil: 'Light to Heavy Loam', season: 'Rabi', waterDemand: 'Low to Moderate' },
  { name: 'Sugarcane', icon: '🎋', idealSoil: 'Deep Rich Loam', season: 'Annual', waterDemand: 'Very High' },
  { name: 'Coffee', icon: '☕', idealSoil: 'Volcanic / Laterite', season: 'Perennial', waterDemand: 'High' },
];

export const HISTORICAL_ADVISORIES = [
  {
    id: 'adv-hist-01',
    farmerName: 'Ramesh Patil',
    crop: 'Tomato',
    village: 'Dindori, Nashik',
    date: 'Sept 10, 2026',
    adviceType: 'Irrigation & Spray Delay',
    riskLevel: 'WATCH' as const,
    channelDelivered: 'Voice Call + SMS',
    outcome: 'Verified: 36mm rain arrived. Prevented root hypoxia & protected blossom retention.',
    status: 'Delivered & Acted Upon'
  },
  {
    id: 'adv-hist-02',
    farmerName: 'Savitri Devi',
    crop: 'Cotton',
    village: 'Chebrolu, Guntur',
    date: 'Sept 08, 2026',
    adviceType: 'Whitefly Pest Risk Warning',
    riskLevel: 'HIGH RISK' as const,
    channelDelivered: 'Voice Call (Telugu)',
    outcome: 'Farmer sprayed neem oil proactively. Leaf curl incidence reduced by 85%.',
    status: 'Delivered & Acted Upon'
  },
  {
    id: 'adv-hist-03',
    farmerName: 'Gurpreet Singh',
    crop: 'Wheat',
    village: 'Samrala, Ludhiana',
    date: 'Sept 05, 2026',
    adviceType: 'Heat Stress Early Alert',
    riskLevel: 'SAFE' as const,
    channelDelivered: 'SMS (Hindi)',
    outcome: 'Applied light evening sprinkler cycle to reduce canopy temperature.',
    status: 'Delivered & Acted Upon'
  },
  {
    id: 'adv-hist-04',
    farmerName: 'Kipchoge Mwangi',
    crop: 'Maize',
    village: 'Maseno, Kisumu',
    date: 'Sept 02, 2026',
    adviceType: 'Top-Dressing Fertilizer Timing',
    riskLevel: 'SAFE' as const,
    channelDelivered: 'SMS (Swahili)',
    outcome: 'Applied urea 4 hours prior to gentle 12mm soaking rain. Nutrient absorption optimal.',
    status: 'Delivered & Acted Upon'
  }
];
