import { Language } from '../types/advisory';

export interface AppTranslations {
  // Navigation
  navAdvisoryFlow: string;
  navOverview: string;
  navClimateHub: string;
  navFarmers: string;
  navHistory: string;
  navPresentation: string;
  navExitDemo: string;
  navSignIn: string;
  navVerified: string;
  navAdvisoryDemo: string;
  
  // Hero Banner
  heroBadge: string;
  heroTitle1: string;
  heroTitle2: string;
  heroDesc: string;
  heroSmallholders: string;
  heroSatellite: string;
  heroVoiceSms: string;
  heroRestart: string;
  
  // Stepper Steps
  step1Label: string;
  step1Sub: string;
  step2Label: string;
  step2Sub: string;
  step3Label: string;
  step3Sub: string;
  step4Label: string;
  step4Sub: string;
  step5Label: string;
  step5Sub: string;
  step6Label: string;
  step6Sub: string;
  
  // Step 1: Farmer Profile
  step1Heading: string;
  step1Subtext: string;
  farmerNameLabel: string;
  mobileNumberLabel: string;
  farmLocationLabel: string;
  useGpsButton: string;
  detectingGps: string;
  soilTypeLabel: string;
  farmAcreageLabel: string;
  languageLabel: string;
  continueButton: string;
  quickPersonaPatil: string;
  quickPersonaDevi: string;
  quickPersonaKumar: string;
  
  // Step 2: Crop
  step2Heading: string;
  step2Subtext: string;
  sowingDateLabel: string;
  growthStageLabel: string;
  irrigationLabel: string;
  symptomsLabel: string;
  continueToProcessing: string;
  
  // Step 3: Processing
  step3Heading: string;
  step3Subtext: string;
  generateAdvisoryButton: string;
  processingModels: string;
  telemetryIngestion: string;
  
  // Step 4: Climate
  step4Heading: string;
  step4AirTemp: string;
  step4RainChance: string;
  step4Humidity: string;
  step4Wind: string;
  step4Soil: string;
  proceedToRec: string;
  
  // Step 5: Recommendation
  step5Heading: string;
  whatToDoHeading: string;
  whyItMattersHeading: string;
  whenHeading: string;
  riskIgnoredHeading: string;
  financialImpactHeading: string;
  proceedToDelivery: string;
  
  // Step 6: Delivery
  step6Heading: string;
  step6Subtext: string;
  voiceIvrTitle: string;
  smsTitle: string;
  whatsappTitle: string;
  playAudio: string;
  stopAudio: string;
  dispatchButton: string;
  speakingDialect: string;
}

export const TRANSLATIONS: Record<Language, AppTranslations> = {
  en: {
    navAdvisoryFlow: 'Farmer Advisory Flow',
    navOverview: 'Overview Dashboard',
    navClimateHub: 'Climate Intelligence',
    navFarmers: 'Farmers Directory',
    navHistory: 'Advisory & Audit Logs',
    navPresentation: 'Presentation',
    navExitDemo: 'Exit Demo',
    navSignIn: 'Farmer Sign In',
    navVerified: 'Verified',
    navAdvisoryDemo: 'Advisory Demo',

    heroBadge: 'Interactive Farm Demonstration',
    heroTitle1: 'Climate Intelligence.',
    heroTitle2: 'Delivered to Every Farmer.',
    heroDesc: 'Transforming live satellite atmospheric data and 3-depth root soil physics into direct, actionable farming directives delivered over zero-internet GSM Voice IVR and SMS.',
    heroSmallholders: 'Smallholder Farmers',
    heroSatellite: 'Open-Meteo & NASA Telemetry',
    heroVoiceSms: 'Regional Voice IVR & SMS',
    heroRestart: 'Restart Flow',

    step1Label: 'Farmer Profile',
    step1Sub: 'Location & Phone',
    step2Label: 'Crop & Stage',
    step2Sub: 'Field Context',
    step3Label: 'AI Processing',
    step3Sub: 'Data Reasoning',
    step4Label: 'Climate Intel',
    step4Sub: 'Weather & Soil',
    step5Label: 'Recommendation',
    step5Sub: '"What to do?"',
    step6Label: 'Delivery Hub',
    step6Sub: 'Voice & SMS',

    step1Heading: 'Farmer Profile & Farm Location',
    step1Subtext: 'Identify the smallholder farmer and connect their field coordinates with live weather feeds.',
    farmerNameLabel: 'FARMER FULL NAME',
    mobileNumberLabel: 'MOBILE / PHONE NUMBER',
    farmLocationLabel: 'FARM LOCATION & GPS',
    useGpsButton: 'Use Current Location',
    detectingGps: 'Detecting GPS...',
    soilTypeLabel: 'SOIL TYPE',
    farmAcreageLabel: 'FARM ACREAGE (ACRES)',
    languageLabel: 'PREFERRED ADVISORY LANGUAGE',
    continueButton: 'Continue',
    quickPersonaPatil: 'Ramesh Patil (Sugarcane)',
    quickPersonaDevi: 'Sunita Devi (Wheat)',
    quickPersonaKumar: 'Rajesh Kumar (Paddy Rice)',

    step2Heading: 'Select Cultivated Crop & Phenological Stage',
    step2Subtext: 'Target crop parameters guide specific vulnerability thresholds and root-zone water requirements.',
    sowingDateLabel: 'SOWING DATE',
    growthStageLabel: 'ESTIMATED PHENOLOGY GROWTH STAGE',
    irrigationLabel: 'IRRIGATION INFRASTRUCTURE',
    symptomsLabel: 'OBSERVED FIELD SYMPTOMS (OPTIONAL)',
    continueToProcessing: 'Continue to AI Reasoning',

    step3Heading: 'AI Agronomic Reasoning Engine',
    step3Subtext: 'Integrating numerical weather models, NASA surface solar physics, and 3-depth root-zone soil telemetry.',
    generateAdvisoryButton: 'Synthesize Actionable Advisory',
    processingModels: 'Running AI Agro-Physics Models...',
    telemetryIngestion: 'Telemetry Ingestion & Calibration',

    step4Heading: "Today's Agro-Weather & Soil Assessment",
    step4AirTemp: 'Air Temp',
    step4RainChance: 'Rain Chance',
    step4Humidity: 'Humidity',
    step4Wind: 'Wind Vector',
    step4Soil: 'Root Soil Moisture',
    proceedToRec: 'Proceed to Recommendation',

    step5Heading: 'Actionable Agronomic Recommendation',
    whatToDoHeading: 'What Should the Farmer Do?',
    whyItMattersHeading: 'Why It Matters (Scientific Rationale)',
    whenHeading: 'Recommended Timing',
    riskIgnoredHeading: 'Risk If Ignored',
    financialImpactHeading: 'Estimated Input Cost Preserved',
    proceedToDelivery: 'Proceed to Dispatch & Delivery',

    step6Heading: 'Multichannel Zero-Internet Delivery Hub',
    step6Subtext: 'Deliver tailored operational guidance across accessible GSM Voice IVR phone calls, DLT SMS, and WhatsApp.',
    voiceIvrTitle: 'VOICE CALL (IVR)',
    smsTitle: 'DIRECT SMS',
    whatsappTitle: 'WHATSAPP CLOUD',
    playAudio: 'Play Voice Call Audio',
    stopAudio: 'Stop Audio',
    dispatchButton: 'Dispatch Advisory Now',
    speakingDialect: 'Voice Call Active (TTS Dialect)',
  },

  hi: {
    navAdvisoryFlow: 'किसान सलाह प्रवाह',
    navOverview: 'अवलोकन डैशबोर्ड',
    navClimateHub: 'मौसम विज्ञान केंद्र',
    navFarmers: 'किसान निर्देशिका',
    navHistory: 'सलाह एवं ऑडिट लॉग',
    navPresentation: 'प्रस्तुति मोड',
    navExitDemo: 'डेमो बंद करें',
    navSignIn: 'किसान लॉगिन',
    navVerified: 'सत्यापित',
    navAdvisoryDemo: 'कृषि सलाह',

    heroBadge: 'इंटरैक्टिव खेत प्रदर्शन',
    heroTitle1: 'मौसम विज्ञान।',
    heroTitle2: 'हर किसान के द्वार तक।',
    heroDesc: 'उपग्रह मौसम डेटा और 3-स्तरीय मिट्टी नमी को सीधे, आसान कृषि निर्देशों में बदलकर बिना इंटरनेट वॉइस कॉल और एसएमएस द्वारा किसानों तक पहुंचाना।',
    heroSmallholders: 'छोटे व सीमांत किसान',
    heroSatellite: 'ओपन-मीटियो एवं नासा डेटा',
    heroVoiceSms: 'क्षेत्रीय भाषा वॉइस कॉल व SMS',
    heroRestart: 'पुनः शुरू करें',

    step1Label: 'किसान प्रोफ़ाइल',
    step1Sub: 'स्थान और मोबाइल',
    step2Label: 'फसल एवं अवस्था',
    step2Sub: 'खेत का संदर्भ',
    step3Label: 'एआई विश्लेषण',
    step3Sub: 'मौसम एवं मिट्टी तर्क',
    step4Label: 'जलवायु डेटा',
    step4Sub: 'तापमान व नमी',
    step5Label: 'कृषि सलाह',
    step5Sub: '"अब क्या करें?"',
    step6Label: 'डिलीवरी केंद्र',
    step6Sub: 'वॉइस कॉल एवं SMS',

    step1Heading: 'किसान प्रोफ़ाइल एवं खेत का स्थान',
    step1Subtext: 'किसान की पहचान दर्ज करें और खेत के जीपीएस को लाइव उपग्रह मौसम प्रणाली से जोड़ें।',
    farmerNameLabel: 'किसान का पूरा नाम',
    mobileNumberLabel: 'मोबाइल / फोन नंबर',
    farmLocationLabel: 'खेत का स्थान एवं जीपीएस',
    useGpsButton: 'वर्तमान जीपीएस स्थान लें',
    detectingGps: 'जीपीएस खोजा जा रहा है...',
    soilTypeLabel: 'मिट्टी का प्रकार',
    farmAcreageLabel: 'खेत का क्षेत्रफल (एकड़)',
    languageLabel: 'पसंदीदा सलाह की भाषा',
    continueButton: 'आगे बढ़ें',
    quickPersonaPatil: 'रमेश पाटिल (गन्ना)',
    quickPersonaDevi: 'सुनीता देवी (गेहूं)',
    quickPersonaKumar: 'राजेश कुमार (धान चावल)',

    step2Heading: 'बोई गई फसल एवं विकास अवस्था चुनें',
    step2Subtext: 'फसल और उसकी अवस्था के आधार पर सिंचाई, कीट और छिड़काव की सुरक्षा तय होती है।',
    sowingDateLabel: 'बुवाई की तारीख',
    growthStageLabel: 'फसल की वर्तमान विकास अवस्था',
    irrigationLabel: 'सिंचाई का साधन',
    symptomsLabel: 'खेत में दिखे लक्षण (वैकल्पिक)',
    continueToProcessing: 'एआई विश्लेषण शुरू करें',

    step3Heading: 'एआई कृषि तर्क इंजन',
    step3Subtext: 'मौसम पूर्वानुमान, नासा सौर विकिरण और 3-स्तरीय मिट्टी नमी का एकीकृत विश्लेषण।',
    generateAdvisoryButton: 'सटीक कृषि सलाह तैयार करें',
    processingModels: 'एआई कृषि मॉडल चल रहे हैं...',
    telemetryIngestion: 'डेटा एकत्रीकरण एवं गणना',

    step4Heading: "आज का कृषि-मौसम एवं मिट्टी परीक्षण",
    step4AirTemp: 'हवा का तापमान',
    step4RainChance: 'बारिश की संभावना',
    step4Humidity: 'नमी (आर्द्रता)',
    step4Wind: 'हवा की गति व दिशा',
    step4Soil: 'जड़ों में मिट्टी नमी',
    proceedToRec: 'सलाह देखने के लिए आगे बढ़ें',

    step5Heading: 'सीधी एवं व्यावहारिक कृषि सलाह',
    whatToDoHeading: 'किसान को अब क्या करना चाहिए?',
    whyItMattersHeading: 'यह क्यों जरूरी है (वैज्ञानिक कारण)',
    whenHeading: 'सलाह का समय',
    riskIgnoredHeading: 'अनदेखा करने पर होने वाला नुकसान',
    financialImpactHeading: 'बचत अनुमान (खाद व पानी की बचत)',
    proceedToDelivery: 'वॉइस व एसएमएस भेजने के लिए आगे बढ़ें',

    step6Heading: 'मल्टीचैनल डिलीवरी हब (बिना इंटरनेट)',
    step6Subtext: 'सरल कीपैड फोन पर स्वचालित वॉइस कॉल (आईवीआर), एसएमएस और व्हाट्सएप द्वारा सलाह भेजें।',
    voiceIvrTitle: 'वॉइस कॉल (IVR)',
    smsTitle: 'डायरेक्ट एसएमएस',
    whatsappTitle: 'व्हाट्सएप क्लाउड',
    playAudio: 'वॉइस कॉल सुनें',
    stopAudio: 'ऑडियो रोकें',
    dispatchButton: 'सलाह तुरंत भेजें',
    speakingDialect: 'वॉइस कॉल सक्रिय (हिन्दी भाषा)',
  },

  mr: {
    navAdvisoryFlow: 'शेतकरी सल्ला प्रवाह',
    navOverview: 'मुख्य डॅशबोर्ड',
    navClimateHub: 'हवामान माहिती केंद्र',
    navFarmers: 'शेतकरी यादी',
    navHistory: 'सल्ला व ऑडिट नोंदी',
    navPresentation: 'सादरीकरण मोड',
    navExitDemo: 'डेमो बंद करा',
    navSignIn: 'शेतकरी लॉगिन',
    navVerified: 'सत्यापित',
    navAdvisoryDemo: 'शेती सल्ला',

    heroBadge: 'थेट शेती प्रात्यक्षिक',
    heroTitle1: 'हवामान बुद्धिमत्ता.',
    heroTitle2: 'प्रत्येक शेतकऱ्यापर्यंत.',
    heroDesc: 'उपग्रह हवामान डेटा आणि ३-स्तरीय जमिनीतील ओलावा थेट सोप्या शेती सल्ल्यात रूपांतरित करून विना-इंटरनेट व्हॉईस कॉल व एसएमएस द्वारे शेतकऱ्यांपर्यंत पोहोचवणे.',
    heroSmallholders: 'अल्पभूधारक शेतकरी',
    heroSatellite: 'ओपन-मिटिओ व नासा डेटा',
    heroVoiceSms: 'स्थानिक व्हॉईस कॉल व SMS',
    heroRestart: 'पुन्हा सुरू करा',

    step1Label: 'शेतकरी प्रोफाइल',
    step1Sub: 'स्थान आणि मोबाइल',
    step2Label: 'पीक आणि अवस्था',
    step2Sub: 'शेताचा संदर्भ',
    step3Label: 'एआय विश्लेषण',
    step3Sub: 'हवामान व जमीन तर्क',
    step4Label: 'हवामान डेटा',
    step4Sub: 'तापमान व ओलावा',
    step5Label: 'कृषी सल्ला',
    step5Sub: '"आता काय करावे?"',
    step6Label: 'डिलिव्हरी केंद्र',
    step6Sub: 'व्हॉईस कॉल व SMS',

    step1Heading: 'शेतकरी माहिती आणि शेताचे स्थान',
    step1Subtext: 'शेतकऱ्याची नोंदणी करा आणि शेताचे जीपीएस थेट उपग्रह हवामान प्रणालीशी जोडा.',
    farmerNameLabel: 'शेतकऱ्याचे संपूर्ण नाव',
    mobileNumberLabel: 'मोबाईल / फोन नंबर',
    farmLocationLabel: 'शेताचे स्थान आणि जीपीएस',
    useGpsButton: 'सध्याचे जीपीएस स्थान घ्या',
    detectingGps: 'जीपीएस शोधत आहे...',
    soilTypeLabel: 'मातीचा प्रकार',
    farmAcreageLabel: 'शेताचे क्षेत्रफळ (एकर)',
    languageLabel: 'पसंतीची सल्ला भाषा',
    continueButton: 'पुढे चला',
    quickPersonaPatil: 'रमेश पाटील (ऊस)',
    quickPersonaDevi: 'सुनीता देवी (गहू)',
    quickPersonaKumar: 'राजेश कुमार (भात)',

    step2Heading: 'लागवड केलेले पीक आणि वाढीची अवस्था निवडा',
    step2Subtext: 'पिकाच्या अवस्थेनुसार पाणी व्यवस्थापन, फवारणी आणि खत नियोजनाचा अचूक सल्ला मिळतो.',
    sowingDateLabel: 'पेरणीची तारीख',
    growthStageLabel: 'पिकाची सध्याची वाढीची अवस्था',
    irrigationLabel: 'सिंचन सुविधा',
    symptomsLabel: 'शेतात आढळलेली लक्षणे (ऐच्छिक)',
    continueToProcessing: 'एआय विश्लेषण सुरू करा',

    step3Heading: 'एआय कृषी तर्क प्रणाली',
    step3Subtext: 'हवामान अंदाज, नासा सौर ऊर्जा आणि जमिनीतील ३ पातळ्यांमधील ओलाव्याचे एकत्रित विश्लेषण.',
    generateAdvisoryButton: 'अचूक शेती सल्ला तयार करा',
    processingModels: 'एआय कृषी मॉडेल्स विश्लेषण करत आहेत...',
    telemetryIngestion: 'डेटा संकलन आणि गणिती प्रक्रिया',

    step4Heading: "आजचे हवामान व जमिनीचा ओलावा अहवाल",
    step4AirTemp: 'हवेचे तापमान',
    step4RainChance: 'पावसाची शक्यता',
    step4Humidity: 'हवेतील आर्द्रता',
    step4Wind: 'वाऱ्याचा वेग व दिशा',
    step4Soil: 'मुळांमधील मातीचा ओलावा',
    proceedToRec: 'सल्ला पाहण्यासाठी पुढे चला',

    step5Heading: 'थेट आणि कृतीयोग्य कृषी सल्ला',
    whatToDoHeading: 'शेतकऱ्याने आता नेमके काय करावे?',
    whyItMattersHeading: 'हे का महत्त्वाचे आहे (वैज्ञानिक कारण)',
    whenHeading: 'योग्य वेळ',
    riskIgnoredHeading: 'दुर्लक्ष केल्यास संभाव्य नुकसान',
    financialImpactHeading: 'अपेक्षित बचत (खते व पाण्याचा खर्च वाचवा)',
    proceedToDelivery: 'व्हॉईस व एसएमएस पाठवण्यासाठी पुढे चला',

    step6Heading: 'मल्टीचनेल डिलिव्हरी केंद्र (विना-इंटरनेट)',
    step6Subtext: 'साध्या कीपॅड फोनवर स्वयंचलित व्हॉईस कॉल (IVR), एसएमएस आणि व्हॉट्सॲप द्वारे सल्ला पाठवा.',
    voiceIvrTitle: 'व्हॉईस कॉल (IVR)',
    smsTitle: 'थेट एसएमएस',
    whatsappTitle: 'व्हॉट्सॲप क्लाउड',
    playAudio: 'व्हॉईस कॉल ऐका',
    stopAudio: 'ऑडिओ थांबवा',
    dispatchButton: 'सल्ला त्वरित पाठवा',
    speakingDialect: 'व्हॉईस कॉल सुरू (मराठी भाषा)',
  },

  te: {
    navAdvisoryFlow: 'రైతు సలహా ప్రక్రియ',
    navOverview: 'అవలోకనం డాష్‌బోర్డ్',
    navClimateHub: 'వాతావరణ కేంద్రం',
    navFarmers: 'రైతుల డైరెక్టరీ',
    navHistory: 'సలహా & ఆడిట్ లాగ్‌లు',
    navPresentation: 'ప్రదర్శన మోడ్',
    navExitDemo: 'డెమో నిష్క్రమించు',
    navSignIn: 'రైతు లాగిన్',
    navVerified: 'ధృవీకరించబడింది',
    navAdvisoryDemo: 'వ్యవసాయ సలహా',

    heroBadge: 'ఇంటరాక్టివ్ వ్యవసాయ ప్రదర్శన',
    heroTitle1: 'వాతావరణ మేధస్సు.',
    heroTitle2: 'ప్రతి రైతుకు చేరువగా.',
    heroDesc: 'ఉపగ్రహ వాతావరణం మరియు నేల తేమను సులభమైన వ్యవసాయ సలహాలుగా మార్చి, ఇంటర్నెట్ లేని వాయిస్ కాల్ మరియు SMS ద్వారా రైతులకు చేరవేయడం.',
    heroSmallholders: 'చిన్నకారు రైతులు',
    heroSatellite: 'ఓపెన్-మీటియో & నాసా డేటా',
    heroVoiceSms: 'ప్రాంతీయ వాయిస్ కాల్ & SMS',
    heroRestart: 'మొదటి నుండి ప్రారంభించండి',

    step1Label: 'రైతు ప్రొఫైల్',
    step1Sub: 'స్థానం మరియు ఫోన్',
    step2Label: 'పంట & దశ',
    step2Sub: 'పొలం వివరాలు',
    step3Label: 'AI విశ్లేషణ',
    step3Sub: 'డేటా ప్రాసెసింగ్',
    step4Label: 'వాతావరణం',
    step4Sub: 'ఉష్ణోగ్రత & తేమ',
    step5Label: 'వ్యవసాయ సలహా',
    step5Sub: '"ఇప్పుడు ఏమి చేయాలి?"',
    step6Label: 'సందేశ కేంద్రం',
    step6Sub: 'వాయిస్ & SMS',

    step1Heading: 'రైతు ప్రొఫైల్ మరియు పొలం స్థానం',
    step1Subtext: 'రైతు వివరాలను నమోదు చేసి, పొలం GPSని ఉపగ్రహ వాతావరణ వ్యవస్థకు అనుసంధానించండి.',
    farmerNameLabel: 'రైతు పూర్తి పేరు',
    mobileNumberLabel: 'మొబైల్ / ఫోన్ నంబర్',
    farmLocationLabel: 'పొలం స్థానం & GPS',
    useGpsButton: 'ప్రస్తుత GPS తీసుకోండి',
    detectingGps: 'GPS శోధిస్తోంది...',
    soilTypeLabel: 'నేల రకం',
    farmAcreageLabel: 'పొలం విస్తీర్ణం (ఎకరాలు)',
    languageLabel: 'సలహా భాష',
    continueButton: 'ముందుకు సాగండి',
    quickPersonaPatil: 'రమేష్ పాటిల్ (చెరకు)',
    quickPersonaDevi: 'సునీతా దేవి (గోధుమ)',
    quickPersonaKumar: 'రాజేష్ కుమార్ (వరి వరి)',

    step2Heading: 'పంట మరియు పెరుగుదల దశను ఎంచుకోండి',
    step2Subtext: 'పంట దశ ఆధారంగా నీటిపారుదల, తెగుళ్ల రక్షణ మరియు ఎరువుల సమర్థవంతమైన నిర్వహణ సాధ్యమవుతుంది.',
    sowingDateLabel: 'విత్తిన తేదీ',
    growthStageLabel: 'ప్రస్తుత పెరుగుదల దశ',
    irrigationLabel: 'నీటిపారుదల వనరు',
    symptomsLabel: 'గమనించిన లక్షణాలు (ఐచ్ఛికం)',
    continueToProcessing: 'AI విశ్లేషణ ప్రారంభించండి',

    step3Heading: 'AI వ్యవసాయ విశ్లేషణ వ్యవస్థ',
    step3Subtext: 'వాతావరణ అంచనా, సౌర వికిరణం మరియు నేల తేమ యొక్క సమగ్ర విశ్లేషణ.',
    generateAdvisoryButton: 'ఖచ్చితమైన సలహాను రూపొందించండి',
    processingModels: 'AI మోడల్స్ విశ్లేషిస్తున్నాయి...',
    telemetryIngestion: 'డేటా విశ్లేషణ జరుగుతోంది',

    step4Heading: "నేటి వ్యవసాయ వాతావరణం మరియు నేల నివేదిక",
    step4AirTemp: 'ఉష్ణోగ్రత',
    step4RainChance: 'వర్షం అవకాశం',
    step4Humidity: 'తేమ శాతం',
    step4Wind: 'గాలి వేగం',
    step4Soil: 'నేల తేమ శాతం',
    proceedToRec: 'సలహాను చూడటానికి ముందుకు సాగండి',

    step5Heading: 'ఆచరణాత్మక వ్యవసాయ సలహా',
    whatToDoHeading: 'రైతు ఇప్పుడు ఏమి చేయాలి?',
    whyItMattersHeading: 'ఇది ఎందుకు ముఖ్యం (శాస్త్రీయ కారణం)',
    whenHeading: 'సరైన సమయం',
    riskIgnoredHeading: 'విస్మరిస్తే కలిగే నష్టం',
    financialImpactHeading: 'ఖర్చు ఆదా (నీరు మరియు ఎరువుల ఆదా)',
    proceedToDelivery: 'వాయిస్ & SMS పంపడానికి ముందుకు సాగండి',

    step6Heading: 'మల్టీఛానల్ డెలివరీ హబ్ (ఇంటర్నెట్ అవసరం లేదు)',
    step6Subtext: 'కీప్యాడ్ ఫోన్‌లలో ఆటోమేటెడ్ వాయిస్ కాల్ (IVR), SMS మరియు వాట్సాప్ ద్వారా సలహాలు పంపండి.',
    voiceIvrTitle: 'వాయిస్ కాల్ (IVR)',
    smsTitle: 'డైరెక్ట్ SMS',
    whatsappTitle: 'వాట్సాప్ క్లౌడ్',
    playAudio: 'వాయిస్ కాల్ వినండి',
    stopAudio: 'ఆడియో ఆపు',
    dispatchButton: 'సలహాను ఇప్పుడే పంపండి',
    speakingDialect: 'వాయిస్ కాల్ నడుస్తోంది (తెలుగు)',
  },

  sw: {
    navAdvisoryFlow: 'Mtiririko wa Ushauri wa Mkulima',
    navOverview: 'Dashibodi Kuu',
    navClimateHub: 'Kituo cha Hali ya Hewa',
    navFarmers: 'Orodha ya Wakulima',
    navHistory: 'Kumbukumbu za Ushauri',
    navPresentation: 'Uwasilishaji',
    navExitDemo: 'Toka Onyesho',
    navSignIn: 'Ingia kama Mkulima',
    navVerified: 'Imethibitishwa',
    navAdvisoryDemo: 'Onyesho la Ushauri',

    heroBadge: 'Onyesho la Kilimo Shirikishi',
    heroTitle1: 'Sayansi ya Hali ya Hewa.',
    heroTitle2: 'Kwa Kila Mkulima.',
    heroDesc: 'Kubadilisha data ya satelaiti ya hali ya hewa na unyevu wa udongo kuwa maelekezo rahisi ya kilimo yanayotolewa kupitia Simu ya Sauti na SMS bila mtandao.',
    heroSmallholders: 'Wakulima Wadogo',
    heroSatellite: 'Data ya Open-Meteo & NASA',
    heroVoiceSms: 'Simu ya Sauti na SMS za Kikanda',
    heroRestart: 'Anza Upya',

    step1Label: 'Wasifu wa Mkulima',
    step1Sub: 'Eneo na Simu',
    step2Label: 'Zao na Hatua',
    step2Sub: 'Muktadha wa Shamba',
    step3Label: 'Uchambuzi wa AI',
    step3Sub: 'Tathmini ya Data',
    step4Label: 'Hali ya Hewa',
    step4Sub: 'Hewa na Udongo',
    step5Label: 'Ushauri wa Kilimo',
    step5Sub: '"Nini cha kufanya?"',
    step6Label: 'Kituo cha Ujumbe',
    step6Sub: 'Sauti na SMS',

    step1Heading: 'Wasifu wa Mkulima na Eneo la Shamba',
    step1Subtext: 'Sajili mkulima na unganisha kuratibu za shamba na mifumo ya satelaiti ya hali ya hewa.',
    farmerNameLabel: 'JINA KAMILI LA MKULIMA',
    mobileNumberLabel: 'NAMBARI YA SIMU YA MKONONI',
    farmLocationLabel: 'ENEO LA SHAMBA NA GPS',
    useGpsButton: 'Tumia Eneo la GPS la Sasa',
    detectingGps: 'Inatafuta GPS...',
    soilTypeLabel: 'AINA YA UDONGO',
    farmAcreageLabel: 'UKUBWA WA SHAMBA (EKARI)',
    languageLabel: 'LUGHA INAYOPENDWA YA USHAURI',
    continueButton: 'Endelea',
    quickPersonaPatil: 'Ramesh Patil (Miwa)',
    quickPersonaDevi: 'Sunita Devi (Ngano)',
    quickPersonaKumar: 'Rajesh Kumar (Mpunga)',

    step2Heading: 'Chagua Zao Lililolimwa na Hatua ya Ukuaji',
    step2Subtext: 'Hatua ya zao inaongoza mahitaji maalum ya maji na ulinzi dhidi ya wadudu.',
    sowingDateLabel: 'TAREHE YA KUPANDA',
    growthStageLabel: 'HATUA YA UKUAJI YA SASA',
    irrigationLabel: 'MFUMO WA UMWAGILIAJI',
    symptomsLabel: 'DALILI ZILIZOONEKANA SHAMBANI (SI LAZIMA)',
    continueToProcessing: 'Endelea na Uchambuzi wa AI',

    step3Heading: 'Injini ya Ushauri wa Kilimo ya AI',
    step3Subtext: 'Kuunganisha mifano ya hali ya hewa, mionzi ya jua ya NASA na unyevu wa udongo kwenye viwango 3 vya mizizi.',
    generateAdvisoryButton: 'Tengeneza Ushauri Mahususi',
    processingModels: 'Mifano ya AI inafanya kazi...',
    telemetryIngestion: 'Ukusanyaji na Uchambuzi wa Data',

    step4Heading: "Tathmini ya Hali ya Hewa na Udongo ya Leo",
    step4AirTemp: 'Joto la Hewa',
    step4RainChance: 'Uwezekano wa Mvua',
    step4Humidity: 'Unyevu wa Hewa',
    step4Wind: 'Kasi ya Upepo',
    step4Soil: 'Unyevu wa Mizizi',
    proceedToRec: 'Endelea Kuona Ushauri',

    step5Heading: 'Ushauri Mahususi wa Kilimo Unaotekelezeka',
    whatToDoHeading: 'Mkulima Anapaswa Kufanya Nini Sasa?',
    whyItMattersHeading: 'Kwa Nini Ni Muhimu (Sababu za Kisayansi)',
    whenHeading: 'Muda Unaopendekezwa',
    riskIgnoredHeading: 'Athari Iwapo Ushauri Utapuuzwa',
    financialImpactHeading: 'Makadirio ya Gharama Zilizookolewa',
    proceedToDelivery: 'Endelea Kutuma Ujumbe na Sauti',

    step6Heading: 'Kituo cha Kutuma Ujumbe (Bila Mtandao)',
    step6Subtext: 'Tuma ushauri kwa simu za kawaida kupitia Simu ya Sauti ya Kiotomatiki (IVR), SMS na WhatsApp.',
    voiceIvrTitle: 'SIMU YA SAUTI (IVR)',
    smsTitle: 'SMS YA MOJA KWA MOJA',
    whatsappTitle: 'WHATSAPP CLOUD',
    playAudio: 'Sikiliza Simu ya Sauti',
    stopAudio: 'Simamisha Sauti',
    dispatchButton: 'Tuma Ushauri Sasa',
    speakingDialect: 'Simu ya Sauti Inafanya Kazi (Kiswahili)',
  }
};

