export type SupportedLanguage = 'mr' | 'hi' | 'te' | 'en';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  native: string;
  welcomeVoice: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'mr', label: 'Marathi', native: 'मराठी', welcomeVoice: 'नमस्कार, आपली भाषा निवडा' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', welcomeVoice: 'नमस्ते, अपनी भाषा चुनें' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', welcomeVoice: 'నమస్కారం, మీ భాషను ఎంచుకోండి' },
  { code: 'en', label: 'English', native: 'English', welcomeVoice: 'Welcome, select your language' },
];

export const translations: Record<SupportedLanguage, Record<string, string>> = {
  mr: {
    // Welcome & App
    appName: 'इंद्रधनुष',
    tagline: 'अचूक हवामान आणि शेती सल्लागार',
    selectLanguage: 'आपली भाषा निवडा',
    continue: 'पुढे जा',
    save: 'जतन करा',
    loading: 'कृपया प्रतीक्षा करा...',
    retry: 'पुन्हा प्रयत्न करा',
    cancel: 'रद्द करा',

    // Auth
    enterPhone: 'आपला मोबाईल नंबर टाका',
    phonePlaceholder: '१० अंकी मोबाईल नंबर',
    sendOtp: 'ओटीपी (OTP) पाठवा',
    enterOtp: '६ अंकी ओटीपी टाका',
    verifyOtp: 'ओटीपी पडताळा',
    invalidPhone: 'कृपया वैध मोबाईल नंबर प्रविष्ट करा',
    invalidOtp: 'कृपया ६ अंकी वैध ओटीपी टाका',
    resendOtp: 'पुन्हा ओटीपी पाठवा',
    logout: 'लॉग आऊट',
    logoutConfirm: 'आपण खरोखर बाहेर पडू इच्छिता?',

    // Profile & Registration
    farmerProfile: 'शेतकरी माहिती',
    fullName: 'पूर्ण नाव',
    namePlaceholder: 'उदा. रमेश पाटील',
    village: 'गाव',
    villagePlaceholder: 'आपल्या गावाचे नाव',
    district: 'जिल्हा',
    districtPlaceholder: 'उदा. पुणे',
    state: 'राज्य',
    preferredChannel: 'सल्ला मिळवण्याचे माध्यम',
    consentOptIn: 'हवामान संदेश व व्हॉइस कॉल सुरू ठेवा',
    optedOutNotice: 'आपण संदेश बंद केले आहेत (STOP)',
    trustScore: 'विश्वास निर्देशांक',

    // Farms & GPS
    farmsTitle: 'माझी शेतजमीन',
    addFarm: 'नवीन शेत जोडा',
    farmName: 'शेताचे नाव',
    acreage: 'क्षेत्रफळ (एकर)',
    soilType: 'मातीचा प्रकार',
    irrigationSource: 'पाणीपुरवठा साधन',
    captureGps: 'जीपीएस (GPS) द्वारे स्थान निश्चित करा',
    gpsSuccess: 'शेताचे अक्षांश-रेखांश अचूक नोंदवले!',
    gpsDetecting: 'उपग्रहावरून स्थान शोधत आहे...',
    gpsError: 'जीपीएस स्थान मिळवता आले नाही',

    // Crops & Phenology
    cropsTitle: 'माझी पिके',
    addCrop: 'पीक नोंदणी करा',
    selectCrop: 'पिकाची निवड करा',
    variety: 'पिकाची जात / वाण',
    sowingDate: 'पेरणी / लागवड तारीख',
    growthStage: 'पिकाची सद्य स्थिती (वाढ टप्पा)',
    updateStage: 'वाढ टप्पा बदला',
    stageEstimated: 'तारखेनुसार अंदाजित टप्पा',

    // Climate
    weatherTitle: 'शेतातील हवामान',
    currentWeather: 'सद्य स्थिती',
    temperature: 'तापमान',
    humidity: 'हवेतील ओलावा',
    rainProb: 'पाऊस शक्यता',
    windSpeed: 'वाऱ्याचा वेग',
    forecast7Days: 'पुढील ७ दिवसांचा हवामान अंदाज',
    soilSensor: 'जमिनीतील ओलावा सेन्सर',
    sensorModelEstimated: 'मॉडेल अंदाजित (सेन्सर प्रतीक्षेत)',

    // Risk
    riskTitle: 'पीक हवामान जोखीम',
    overallRisk: 'एकूण जोखीम पातळी',
    riskLow: 'सुरक्षित (कमी जोखीम)',
    riskModerate: 'मध्यम जोखीम',
    riskHigh: 'धोका (जास्त जोखीम)',
    riskCritical: 'अतिधोकादायक',
    riskWaterlogging: 'पाणी साचण्याचा धोका',
    riskHeat: 'उष्णतेचा ताण',
    riskCold: 'थंडीचा ताण',
    riskWind: 'जोरदार वाऱ्याचा धोका',
    riskDisease: 'रोगास अनुकूल हवामान',

    // Advisories
    advisoryTitle: 'शेती सल्ला',
    actionRequired: 'तात्काळ काय करावे?',
    whyItMatters: 'हे का गरजेचे आहे?',
    timing: 'कधी करावे?',
    riskIfIgnored: 'सल्ला न पाळल्यास नुकसान',
    listenVoice: 'सल्ला ऑडिओ ऐका',
    playingAudio: 'सल्ला ऐकवत आहे...',
    markDone: 'सल्ला पाळला (Mark as Done)',
    actionRecorded: 'आपला प्रतिसाद नोंदवला गेला!',
    feedbackTitle: 'सल्ला उपयुक्तता व शेती बचत',
    waterSavedReported: 'बचत झालेले पाणी (लिटर)',
    lossAvoidedReported: 'टाळलेले आर्थिक नुकसान (रुपये)',

    // Offline & Sync
    offlineMode: 'इंटरनेट बंद आहे • ऑफलाइन मोड सुरू',
    offlineNotice: 'पूर्वी डाऊनलोड केलेले सल्ले विना-इंटरनेट उपलब्ध आहेत.',
    syncedJustNow: 'सर्व माहिती अद्ययावत झाली',
    syncPending: 'नेटवर्क आल्यावर आपोआप सिंक होईल',

    // Tabs
    tabHome: 'मुख्य',
    tabWeather: 'हवामान',
    tabRisk: 'जोखीम',
    tabFarms: 'शेती',
    tabProfile: 'माहिती',
  },

  hi: {
    // Welcome & App
    appName: 'इंद्रधनुष',
    tagline: 'सटीक मौसम और कृषि सलाह',
    selectLanguage: 'अपनी भाषा चुनें',
    continue: 'आगे बढ़ें',
    save: 'सुरक्षित करें',
    loading: 'कृपया प्रतीक्षा करें...',
    retry: 'पुनः प्रयास करें',
    cancel: 'रद्द करें',

    // Auth
    enterPhone: 'अपना मोबाइल नंबर दर्ज करें',
    phonePlaceholder: '10 अंकों का मोबाइल नंबर',
    sendOtp: 'ओटीपी (OTP) भेजें',
    enterOtp: '6 अंकों का ओटीपी दर्ज करें',
    verifyOtp: 'सत्यापित करें',
    invalidPhone: 'कृपया मान्य मोबाइल नंबर दर्ज करें',
    invalidOtp: 'कृपया 6 अंकों का सही ओटीपी दर्ज करें',
    resendOtp: 'दोबारा ओटीपी भेजें',
    logout: 'लॉग आउट',
    logoutConfirm: 'क्या आप बाहर निकलना चाहते हैं?',

    // Profile & Registration
    farmerProfile: 'किसान प्रोफ़ाइल',
    fullName: 'पूरा नाम',
    namePlaceholder: 'उदा. रामेश्वर सिंह',
    village: 'गाँव',
    villagePlaceholder: 'गाँव का नाम',
    district: 'ज़िला',
    districtPlaceholder: 'उदा. नासिक',
    state: 'राज्य',
    preferredChannel: 'सलाह प्राप्ति का माध्यम',
    consentOptIn: 'मौसम एसएमएस और वॉयस कॉल चालू रखें',
    optedOutNotice: 'आपने संदेश सेवा बंद की है (STOP)',
    trustScore: 'विश्वास सूचकांक',

    // Farms & GPS
    farmsTitle: 'मेरे खेत',
    addFarm: 'नया खेत जोड़ें',
    farmName: 'खेत का नाम',
    acreage: 'क्षेत्रफल (एकड़)',
    soilType: 'मिट्टी का प्रकार',
    irrigationSource: 'सिंचाई का साधन',
    captureGps: 'जीपीएस (GPS) से खेत का स्थान दर्ज करें',
    gpsSuccess: 'खेत का स्थान सफलतापूर्वक दर्ज किया गया!',
    gpsDetecting: 'उपग्रह से स्थान खोजा जा रहा है...',
    gpsError: 'स्थान प्राप्त करने में विफल',

    // Crops & Phenology
    cropsTitle: 'मेरी फसलें',
    addCrop: 'फसल दर्ज करें',
    selectCrop: 'फसल चुनें',
    variety: 'किस्म / वैरायटी',
    sowingDate: 'बुवाई की तारीख',
    growthStage: 'फसल की वर्तमान अवस्था (Growth Stage)',
    updateStage: 'अवस्था बदलें',
    stageEstimated: 'तारीख अनुसार अनुमानित अवस्था',

    // Climate
    weatherTitle: 'खेत का मौसम',
    currentWeather: 'वर्तमान मौसम',
    temperature: 'तापमान',
    humidity: 'हवा में नमी',
    rainProb: 'बारिश की संभावना',
    windSpeed: 'हवा की गति',
    forecast7Days: 'अगले 7 दिनों का मौसम पूर्वानुमान',
    soilSensor: 'मिट्टी की नमी सेंसर',
    sensorModelEstimated: 'मॉडल अनुमानित (सेंसर प्रतीक्षित)',

    // Risk
    riskTitle: 'फसल मौसम जोखिम',
    overallRisk: 'कुल जोखिम स्तर',
    riskLow: 'सुरक्षित (कम जोखिम)',
    riskModerate: 'मध्यम जोखिम',
    riskHigh: 'खतरा (अधिक जोखिम)',
    riskCritical: 'अति गंभीर जोखिम',
    riskWaterlogging: 'जलभराव का खतरा',
    riskHeat: 'लू / गर्मी का तनाव',
    riskCold: 'पाला / ठंड का जोखिम',
    riskWind: 'तेज हवा का खतरा',
    riskDisease: 'रोग अनुकूल मौसम',

    // Advisories
    advisoryTitle: 'कृषि सलाह',
    actionRequired: 'तुरंत क्या करें?',
    whyItMatters: 'यह क्यों जरूरी है?',
    timing: 'कब करें?',
    riskIfIgnored: 'न मानने पर नुकसान',
    listenVoice: 'सलाह ऑडियो सुनें',
    playingAudio: 'सलाह सुनाई जा रही है...',
    markDone: 'सलाह पर अमल किया (Mark as Done)',
    actionRecorded: 'आपकी प्रतिक्रिया दर्ज कर ली गई है!',
    feedbackTitle: 'सलाह प्रभाव और बचत',
    waterSavedReported: 'बचत हुआ पानी (लीटर)',
    lossAvoidedReported: 'बचाया गया संभावित नुकसान (रुपये)',

    // Offline & Sync
    offlineMode: 'इंटरनेट बंद • ऑफ़लाइन मोड चालू',
    offlineNotice: 'पहले डाउनलोड की गई सलाह बिना इंटरनेट उपलब्ध है।',
    syncedJustNow: 'सभी डेटा अपडेट हो गया है',
    syncPending: 'नेटवर्क आने पर स्वतः सिंक होगा',

    // Tabs
    tabHome: 'मुख्य',
    tabWeather: 'मौसम',
    tabRisk: 'जोखिम',
    tabFarms: 'खेत',
    tabProfile: 'प्रोफ़ाइल',
  },

  te: {
    // Welcome & App
    appName: 'ఇంద్రధనుష్',
    tagline: 'ఖచ్చితమైన వాతావరణ మరియు వ్యవసాయ సలహా',
    selectLanguage: 'మీ భాషను ఎంచుకోండి',
    continue: 'ముందుకు సాగండి',
    save: 'భద్రపరచండి',
    loading: 'దయచేసి వేచి ఉండండి...',
    retry: 'మళ్ళీ ప్రయత్నించండి',
    cancel: 'రద్దు చేయండి',

    // Auth
    enterPhone: 'మీ మొబైల్ నంబర్ నమోదు చేయండి',
    phonePlaceholder: '10 అంకెల మొబైల్ నంబర్',
    sendOtp: 'ఓటీపీ (OTP) పంపండి',
    enterOtp: '6 అంకెల ఓటీపీ నమోదు చేయండి',
    verifyOtp: 'ఓటీపీ ధృవీకరించండి',
    invalidPhone: 'దయచేసి సరైన మొబైల్ నంబర్ ఇవ్వండి',
    invalidOtp: 'దయచేసి సరైన 6 అంకెల ఓటీపీ నమోదు చేయండి',
    resendOtp: 'మళ్లీ ఓటీపీ పంపండి',
    logout: 'లాగ్ అవుట్',
    logoutConfirm: 'మీరు ఖచ్చితంగా నిష్క్రమించాలనుకుంటున్నారా?',

    // Profile & Registration
    farmerProfile: 'రైతు వివరాలు',
    fullName: 'పూర్తి పేరు',
    namePlaceholder: 'ఉదా: వెంకటేశ్వర రావు',
    village: 'గ్రామం',
    villagePlaceholder: 'గ్రామం పేరు',
    district: 'జిల్లా',
    districtPlaceholder: 'ఉదా: గుంటూరు',
    state: 'రాష్ట్రం',
    preferredChannel: 'సలహాలు పొందే మార్గం',
    consentOptIn: 'వాతావరణ హెచ్చరిక కాల్స్ & SMS అనుమతించు',
    optedOutNotice: 'మీరు సందేశాలను నిలిపివేశారు (STOP)',
    trustScore: 'విశ్వసనీయత స్కోరు',

    // Farms & GPS
    farmsTitle: 'నా వ్యవసాయ భూమి',
    addFarm: 'కొత్త పొలం జోడించండి',
    farmName: 'పొలం పేరు',
    acreage: 'విస్తీర్ణం (ఎకరాలు)',
    soilType: 'నేల రకం',
    irrigationSource: 'నీటి వనరు',
    captureGps: 'జీపీఎస్ (GPS) ద్వారా స్థానాన్ని గుర్తించండి',
    gpsSuccess: 'పొలం లొకేషన్ ఖచ్చితంగా నమోదైంది!',
    gpsDetecting: 'ఉపగ్రహం ద్వారా స్థానం వెతుకుతోంది...',
    gpsError: 'జీపీఎస్ స్థానాన్ని పొందలేకపోయాము',

    // Crops & Phenology
    cropsTitle: 'నా పంటలు',
    addCrop: 'పంటను నమోదు చేయండి',
    selectCrop: 'పంటను ఎంచుకోండి',
    variety: 'పంట రకం / వంగడం',
    sowingDate: 'విత్తిన / నాటిన తేదీ',
    growthStage: 'పంట ప్రస్తుత దశ (Growth Stage)',
    updateStage: 'పంట దశను మార్చండి',
    stageEstimated: 'తేదీ ఆధారంగా అంచనా వేసిన దశ',

    // Climate
    weatherTitle: 'పొలంలో వాతావరణం',
    currentWeather: 'ప్రస్తుత వాతావరణం',
    temperature: 'ఉష్ణోగ్రత',
    humidity: 'గాలిలో తేమ',
    rainProb: 'వర్షం సంభావ్యత',
    windSpeed: 'గాలి వేగం',
    forecast7Days: 'రాబోయే 7 రోజుల వాతావరణ సూచన',
    soilSensor: 'నేల తేమ సెన్సార్',
    sensorModelEstimated: 'మోడల్ అంచనా (సెన్సార్ పెండింగ్)',

    // Risk
    riskTitle: 'పంట వాతావరణ ముప్పు',
    overallRisk: 'మొత్తం ముప్పు స్థాయి',
    riskLow: 'సురక్షితం (తక్కువ ముప్పు)',
    riskModerate: 'మధ్యస్థ ముప్పు',
    riskHigh: 'ప్రమాదం (అధిక ముప్పు)',
    riskCritical: 'తీవ్రమైన ప్రమాదం',
    riskWaterlogging: 'నీరు నిలిచే ముప్పు',
    riskHeat: 'ఎండ తీవ్రత',
    riskCold: 'చలి తీవ్రత',
    riskWind: 'తీవ్రమైన ఈదురు గాలులు',
    riskDisease: 'తెగుళ్లకు అనుకూల వాతావరణం',

    // Advisories
    advisoryTitle: 'వ్యవసాయ సలహా',
    actionRequired: 'వెంటనే ఏమి చేయాలి?',
    whyItMatters: 'ఇది ఎందుకు ముఖ్యం?',
    timing: 'ఎప్పుడు చేయాలి?',
    riskIfIgnored: 'సలహా పాటించకపోతే నష్టం',
    listenVoice: 'సలహా ఆడియో వినండి',
    playingAudio: 'సలహా వినిపిస్తోంది...',
    markDone: 'సలహా పాటించాను (Mark as Done)',
    actionRecorded: 'మీ స్పందన నమోదైంది!',
    feedbackTitle: 'సలహా ప్రయోజనం & పొదుపు',
    waterSavedReported: 'పొదుపు చేసిన నీరు (లీటర్లు)',
    lossAvoidedReported: 'నివారించిన ఆర్థిక నష్టం (రూపాయలు)',

    // Offline & Sync
    offlineMode: 'ఇంటర్నెట్ లేదు • ఆఫ్‌లైన్ మోడ్',
    offlineNotice: 'గతంలో డౌన్‌లోడ్ చేసిన సలహాలు ఇంటర్నెట్ లేకుండా అందుబాటులో ఉన్నాయి.',
    syncedJustNow: 'వివరాలన్నీ అప్‌డేట్ అయ్యాయి',
    syncPending: 'నెట్‌వర్క్ రాగానే ఆటోమేటిక్‌గా సింక్ అవుతుంది',

    // Tabs
    tabHome: 'హోమ్',
    tabWeather: 'వాతావరణం',
    tabRisk: 'ముప్పు',
    tabFarms: 'పొలాలు',
    tabProfile: 'ప్రొఫైల్',
  },

  en: {
    // Welcome & App
    appName: 'Indradhanu',
    tagline: 'Hyperlocal Climate & Crop Advisory',
    selectLanguage: 'Select Your Language',
    continue: 'Continue',
    save: 'Save Changes',
    loading: 'Please wait...',
    retry: 'Retry',
    cancel: 'Cancel',

    // Auth
    enterPhone: 'Enter Mobile Number',
    phonePlaceholder: '10-digit phone number',
    sendOtp: 'Send OTP',
    enterOtp: 'Enter 6-digit OTP',
    verifyOtp: 'Verify & Sign In',
    invalidPhone: 'Please enter a valid 10-digit mobile number',
    invalidOtp: 'Please enter the valid 6-digit verification code',
    resendOtp: 'Resend OTP',
    logout: 'Log Out',
    logoutConfirm: 'Are you sure you want to sign out?',

    // Profile & Registration
    farmerProfile: 'Farmer Profile',
    fullName: 'Full Name',
    namePlaceholder: 'e.g. Ramesh Patil',
    village: 'Village',
    villagePlaceholder: 'Village name',
    district: 'District',
    districtPlaceholder: 'e.g. Pune',
    state: 'State',
    preferredChannel: 'Advisory Channel',
    consentOptIn: 'Receive Weather Voice Calls & SMS',
    optedOutNotice: 'You have unsubscribed from automated alerts (STOP)',
    trustScore: 'Trust Score',

    // Farms & GPS
    farmsTitle: 'My Farm Plots',
    addFarm: 'Add New Farm Plot',
    farmName: 'Farm / Plot Name',
    acreage: 'Acreage (Acres)',
    soilType: 'Soil Type',
    irrigationSource: 'Irrigation Source',
    captureGps: 'Capture Location via GPS',
    gpsSuccess: 'GPS Coordinates Captured Successfully!',
    gpsDetecting: 'Acquiring satellite GPS coordinates...',
    gpsError: 'Could not acquire GPS coordinates',

    // Crops & Phenology
    cropsTitle: 'Cultivated Crops',
    addCrop: 'Register Crop',
    selectCrop: 'Select Crop',
    variety: 'Crop Variety / Hybrid',
    sowingDate: 'Sowing / Planting Date',
    growthStage: 'Current Growth Stage',
    updateStage: 'Update Stage',
    stageEstimated: 'Estimated Stage based on planting date',

    // Climate
    weatherTitle: 'Farm Climate',
    currentWeather: 'Current Weather',
    temperature: 'Temperature',
    humidity: 'Humidity',
    rainProb: 'Precipitation Chance',
    windSpeed: 'Wind Speed',
    forecast7Days: '7-Day Weather Forecast',
    soilSensor: 'Soil Moisture Sensor',
    sensorModelEstimated: 'Model Estimated (Hardware Sensor Pending)',

    // Risk
    riskTitle: 'Crop Climate Risk Radar',
    overallRisk: 'Overall Crop Risk',
    riskLow: 'Safe (Low Risk)',
    riskModerate: 'Moderate Risk',
    riskHigh: 'High Risk Alert',
    riskCritical: 'Critical Emergency',
    riskWaterlogging: 'Waterlogging Risk',
    riskHeat: 'Heat Stress Risk',
    riskCold: 'Low Temperature Frost',
    riskWind: 'High Wind Threat',
    riskDisease: 'Disease Conducive Weather',

    // Advisories
    advisoryTitle: 'Farm Advisory',
    actionRequired: 'What Action Should You Take?',
    whyItMatters: 'Why is this Important?',
    timing: 'When to Perform?',
    riskIfIgnored: 'Risk if Ignored',
    listenVoice: 'Listen to Spoken Note',
    playingAudio: 'Playing Spoken Advisory...',
    markDone: 'Mark as Completed (Done)',
    actionRecorded: 'Your field response has been recorded!',
    feedbackTitle: 'Field Outcome & Water Saved',
    waterSavedReported: 'Water Saved (Liters)',
    lossAvoidedReported: 'Economic Loss Avoided (INR ₹)',

    // Offline & Sync
    offlineMode: 'Offline Mode • Zero Internet',
    offlineNotice: 'Previously downloaded advisories are available without connectivity.',
    syncedJustNow: 'All data synchronized with cloud',
    syncPending: 'Changes will sync automatically when online',

    // Tabs
    tabHome: 'Home',
    tabWeather: 'Weather',
    tabRisk: 'Risks',
    tabFarms: 'Farms',
    tabProfile: 'Profile',
  },
};

export const TRANSLATIONS = translations;
export default translations;

