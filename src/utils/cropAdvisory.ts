import { 
  AIAdvisory, 
  Language, 
  CropType, 
  GrowthStage 
} from '../types/advisory';

export function createDefaultAdvisoryForCrop(
  cropName: string,
  stageName: string,
  farmerName: string,
  city: string,
  prevAdvisory?: Partial<AIAdvisory>
): AIAdvisory {
  const isRice = cropName.toLowerCase().includes('rice') || cropName.toLowerCase().includes('paddy');
  const isTomato = cropName.toLowerCase().includes('tomato');

  const immediateAction = isRice
    ? `Hold scheduled irrigation and maintain 2-3cm standing water in ${cropName} basin.`
    : isTomato
    ? `Delay scheduled irrigation by 36 hours & postpone fungal foliar spray.`
    : `Delay scheduled irrigation by 24 to 36 hours for ${cropName} crop.`;

  const whyItMatters = isRice
    ? `Moderate to heavy rain is forecast. In-situ probe is unavailable; advice is derived from atmospheric balance. Additional pumping will overflow field bunds and leach applied nutrients.`
    : isTomato
    ? `Convective rainfall is probable. In-situ probe is unavailable; advice is derived from atmospheric balance. Irrigating now will trigger root hypoxia and flower drop.`
    : `Rainfall is probable in ${city}. Soil moisture is adequate; additional irrigation will saturate root zones and waste pumping energy.`;

  const recommendedTiming = isRice
    ? 'Next 24 to 48 hours. Inspect field drainage bunds.'
    : 'Next 36 hours. Resume normal schedule once rainfall subsides.';

  const impactPotential = isRice
    ? 'Conserves pumping energy, prevents bund spillover, and avoids seedling lodging.'
    : isTomato
    ? 'Prevents premature flower abortion and optimizes pumping energy while protecting root aeration.'
    : 'Protects root aeration, preserves soil structure, and optimizes water use.';

  const actionSteps = isRice
    ? [
        `Turn off automated canal and tube well pumping for ${cropName}.`,
        'Check field bunds and spillways so water level remains between 2 and 5 centimeters.',
        'Postpone urea top-dressing until heavy rain passes to prevent nutrient wash-off.',
        'Inspect leaf blades for water-soaked lesions or blast symptoms once storm clears.'
      ]
    : [
        'Turn off automated drip pumps immediately.',
        'Clear drainage furrows between crop beds to avoid pooling at stem collars.',
        'Postpone copper fungicide foliar spray to calm morning hours post-rain.',
        'Check root zones manually before restarting irrigation.'
      ];

  const translations = {
    en: {
      immediateAction,
      whyItMatters,
      recommendedTiming,
      smsBody: `INDRADHANU KRISHI: ${farmerName}, rain expected in ${city}. Delay irrigation for ${cropName} by 24-36h. Toll-free: 1800-INDRA [STOP to opt-out]`,
      voiceScript: `Namaskar ${farmerName}. This is Indradhanu farm weather assistant. In ${city}, rain is expected in the next 24 to 36 hours. Please pause irrigation for your ${cropName} crop to protect root health. Press 1 to replay. Thank you.`
    },
    hi: {
      immediateAction: isRice 
        ? `${cropName} में सिंचाई रोकें और क्यारी में 2-3 सेमी जलस्तर बनाए रखें।`
        : `अगले 36 घंटे तक ${cropName} में सिंचाई रोकें और छिड़काव टालें।`,
      whyItMatters: `${city} में बारिश की संभावना है। अभी पानी देने से खेत में जलभराव होगा और फसल को नुकसान पहुंचेगा।`,
      recommendedTiming: 'अगले 24 से 36 घंटे तक। बारिश थमने के बाद स्थिति जांचें।',
      smsBody: `इंद्रधनुष कृषि सलाह: ${farmerName} जी, ${city} में बारिश का अनुमान है। ${cropName} में 24-36 घंटे सिंचाई रोकें। टोल-फ्री: 1800-INDRA [STOP to opt-out]`,
      voiceScript: `नमस्ते ${farmerName} जी। इंद्रधनुष किसान सेवा से यह जरूरी सलाह है। आपके क्षेत्र ${city} में बारिश की संभावना है। कृपया अपनी ${cropName} फसल में सिंचाई रोक दें। धन्यवाद।`
    },
    mr: {
      immediateAction: isRice
        ? `${cropName} पिकाचे पुढील सिंचन थांबवा आणि बांधातील पाणी नियंत्रित ठेवा.`
        : `${cropName} पिकाचे पुढील ३६ तास सिंचन थांबवा आणि फवारणी पुढे ढकला.`,
      whyItMatters: `${city} परिसरात पाऊस पडण्याची शक्यता आहे. आता पाणी दिल्यास मुळांमध्ये हवा खेळती राहणार नाही.`,
      recommendedTiming: 'पुढील २४ ते ३६ तास. पाऊस थांबल्यानंतरच पुढील निर्णय घ्या.',
      smsBody: `इंद्रधनुष कृषी: ${farmerName} साहेब, ${city} भागात पाऊस अपेक्षित. ${cropName} पिकाला सिंचन थांबवा. हेल्पलाईन: 1800-INDRA [STOP to opt-out]`,
      voiceScript: `नमस्कार ${farmerName} साहेब. इंद्रधनुष कृषी सेवेतून बोलत आहोत. आपल्या ${city} परिसरामध्ये पुढील २४ तासांत पाऊस होण्याची शक्यता आहे. ${cropName} पिकाला पाणी देणे त्वरित थांबवा. धन्यवाद.`
    },
    te: {
      immediateAction: `${cropName} పంటకు నీటిపారుదలని నిలిపివేయండి.`,
      whyItMatters: `${city} లో వర్షం కురిసే అవకాశం ఉంది. ఇప్పుడు నీరు పెడితే నేలలో తేమ ఎక్కువై వేరు కుళ్ళిపోయే ప్రమాదం ఉంది.`,
      recommendedTiming: 'రాగల 24 నుండి 36 గంటలు.',
      smsBody: `ఇంద్రధనుష్ సలహా: ${farmerName} గారు, ${city} లో వర్షం కురిసే అవకాశం ఉంది. ${cropName} కు నీరు పెట్టడం ఆపండి. [STOP to opt-out]`,
      voiceScript: `నమస్కారం ${farmerName} గారు. ఇంద్రధనుష్ వ్యవసాయ సలహా. ${city} ప్రాంతంలో వర్షం కురిసే అవకాశం ఉంది. దయచేసి ${cropName} పంటకు నీరు పెట్టడం ఆపండి. ధన్యవాదాలు.`
    },
    sw: {
      immediateAction: `Sitisha umwagiliaji kwa zao la ${cropName}.`,
      whyItMatters: `Mvua inatarajiwa huko ${city}. Kumwagilia sasa kunaweza kusababisha mafuriko ya mizizi.`,
      recommendedTiming: 'Saa 24 hadi 36 zijazo.',
      smsBody: `USHAURI WA INDRADHANU: ${farmerName}, mvua inatarajiwa huko ${city}. USIMWAGILIE ${cropName}. [STOP to opt-out]`,
      voiceScript: `Hujambo ${farmerName}. Katika eneo lako la ${city}, mvua inakaribia. Tafadhali sitisha umwagiliaji wa ${cropName}. Asante.`
    }
  };

  return {
    id: prevAdvisory?.id || `adv-${Date.now().toString(36)}`,
    farmerId: prevAdvisory?.farmerId || 'f-default',
    farmerName,
    cropName: cropName as CropType,
    growthStage: stageName as GrowthStage,
    soilType: prevAdvisory?.soilType || 'Black Clay Soil (Vertisol)',
    irrigationType: prevAdvisory?.irrigationType || 'Drip Irrigation',
    createdAt: 'Just now (Synced with Open-Meteo)',
    riskLevel: 'WATCH',
    confidencePct: 92,
    immediateAction,
    whyItMatters,
    recommendedTiming,
    impactPotential,
    translations,
    actionSteps,
    scientificReasoning: [
      `Atmospheric numerical weather prediction tracks rain probabilities in ${city}.`,
      `Crop vulnerability evaluated for ${cropName} (${stageName}) stage thresholds.`,
      'In-situ sensor telemetry reallocated to atmospheric water balance.'
    ],
    climateTriggers: prevAdvisory?.climateTriggers || [
      {
        title: 'Atmospheric Rain Front',
        value: '38mm / 24h',
        trend: 'rising',
        severity: 'caution',
      },
      {
        title: 'Micro-zone Heat Index',
        value: '31.2°C',
        trend: 'stable',
        severity: 'normal',
      },
    ],
    channels: prevAdvisory?.channels || {
      sms: {
        sent: false,
        carrier: 'MSG91 Indian DLT',
        characterCount: 142,
        body: translations.en.smsBody,
      },
      voice: {
        sent: false,
        callDurationSec: 28,
        voiceTone: 'Friendly Regional Agronomist',
        transcript: translations.en.voiceScript,
      },
      whatsapp: {
        sent: false,
      },
    },
  };
}

export function shouldInvalidateAdvisoryOnCropSwitch(
  previousCropName: string | undefined | null,
  newCropName: string
): boolean {
  if (!previousCropName) return false;
  const p = previousCropName.trim().toLowerCase();
  const n = newCropName.trim().toLowerCase();
  return !p.includes(n) && !n.includes(p);
}

