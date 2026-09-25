import { useState, useEffect } from 'react';
import { advisorAPI, diseaseAPI } from '../services/api';
import { useLang } from '../contexts/LanguageContext';

const TAMIL_FONT_LINK = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;600;700;800&display=swap';

const HEADINGS_CONFIG = {
  ta: [
    { key: 'title', label: 'ஸ்மார்ட் பயிர் நோய் அறிக்கை' },
    { key: 'date', label: 'தேதி மற்றும் நேரம்' },
    { key: 'farmer', label: 'விவசாயி பெயர்' },
    { key: 'location', label: 'இடம்' },
    { key: 'crop', label: 'பயிர் பெயர்' },
    { key: 'disease', label: 'நோய் பெயர்' },
    { key: 'confidence', label: 'நம்பகத்தன்மை' },
    { key: 'confidence_exp', label: 'நம்பகத்தன்மை விளக்கம்' },
    { key: 'severity', label: 'தீவிரம்' },
    { key: 'symptoms', label: 'அறிகுறிகள்' },
    { key: 'description', label: 'விளக்கம்' },
    { key: 'organic_treatment', label: 'இயற்கை சிகிச்சை' },
    { key: 'organic_dosage', label: 'இயற்கை மருந்தளவு' },
    { key: 'organic_instructions', label: 'இயற்கை செய்முறை வழிமுறைகள்' },
    { key: 'chemical_treatment', label: 'வேதி சிகிச்சை' },
    { key: 'chemical_dosage', label: 'வேதி மருந்தளவு' },
    { key: 'chemical_instructions', label: 'வேதி செய்முறை வழிமுறைகள்' },
    { key: 'prevention', label: 'தடுப்பு நடவடிக்கைகள்' },
    { key: 'tips', label: 'விவசாய குறிப்புகள்' },
    { key: 'soil', label: 'மண் நிலை' },
    { key: 'water', label: 'நீர் நிலை' },
    { key: 'weather', label: 'வானிலை அடிப்படையிலான பரிந்துரைகள்' },
    { key: 'warning', label: 'பாதுகாப்பு எச்சரிக்கை' },
  ],
  en: [
    { key: 'title', label: 'Smart Crop Disease Report' },
    { key: 'date', label: 'Date and Time' },
    { key: 'farmer', label: 'Farmer Name' },
    { key: 'location', label: 'Location' },
    { key: 'crop', label: 'Crop Name' },
    { key: 'disease', label: 'Disease Name' },
    { key: 'confidence', label: 'Confidence' },
    { key: 'confidence_exp', label: 'Confidence Explanation' },
    { key: 'severity', label: 'Severity' },
    { key: 'symptoms', label: 'Symptoms' },
    { key: 'description', label: 'Description' },
    { key: 'organic_treatment', label: 'Organic Treatment' },
    { key: 'organic_dosage', label: 'Organic Dosage' },
    { key: 'organic_instructions', label: 'Organic Instructions' },
    { key: 'chemical_treatment', label: 'Chemical Treatment' },
    { key: 'chemical_dosage', label: 'Chemical Dosage' },
    { key: 'chemical_instructions', label: 'Chemical Instructions' },
    { key: 'prevention', label: 'Prevention' },
    { key: 'tips', label: 'Farming Tips' },
    { key: 'soil', label: 'Soil Status' },
    { key: 'water', label: 'Water Status' },
    { key: 'weather', label: 'Weather-Based Recommendations' },
    { key: 'warning', label: 'Safety Warning' },
  ]
};

const DICTIONARY_TA = {
  // Crops
  'Tomato': 'தக்காளி',
  'Potato': 'உருளைக்கிழங்கு',
  'Rice': 'நெல்',
  'Corn': 'சோளம்',
  'Maize': 'சோளம்',
  'Corn (maize)': 'சோளம்',
  'Corn maize': 'சோளம்',
  'Corn_(maize)': 'சோளம்',
  'Apple': 'ஆப்பிள்',
  'Grape': 'திராட்சை',
  'Pepper': 'குடைமிளகாய்',
  'Pepper, bell': 'குடைமிளகாய்',
  'Pepper bell': 'குடைமிளகாய்',
  'Bell Pepper': 'குடைமிளகாய்',
  'Cotton': 'பருத்தி',
  'Groundnut': 'வேர்க்கடலை',
  'Sugarcane': 'கரும்பு',
  'Wheat': 'கோதுமை',
  'Soybean': 'சோயாபீன்ஸ்',
  'Squash': 'பூசணிக்காய்',
  'Strawberry': 'ஸ்ட்ராபெரி',
  'Blueberry': 'புளூபெர்ரி',
  'Cherry (including sour)': 'செர்ரி',
  'Cherry including sour': 'செர்ரி',
  'Cherry_(including_sour)': 'செர்ரி',
  'Cherry': 'செர்ரி',
  'Peach': 'பீச்',
  'Orange': 'ஆரஞ்சு',
  'Raspberry': 'ராஸ்பெர்ரி',
  'Other': 'இதர பயிர்கள்',

  // Diseases
  'Early Blight': 'ஆரம்ப கால கருகல் நோய்',
  'Early blight': 'ஆரம்ப கால கருகல் நோய்',
  'Late Blight': 'பிற்கால கருகல் நோய்',
  'Late blight': 'பிற்கால கருகல் நோய்',
  'Bacterial Spot': 'பாக்டீரியா இலைப்புள்ளி நோய்',
  'Bacterial spot': 'பாக்டீரியா இலைப்புள்ளி நோய்',
  'Leaf Mold': 'இலை அச்சு நோய்',
  'Leaf mold': 'இலை அச்சு நோய்',
  'Septoria Leaf Spot': 'செப்டோரியா இலைப்புள்ளி நோய்',
  'Septoria leaf spot': 'செப்டோரியா இலைப்புள்ளி நோய்',
  'Spider Mites': 'சிலந்தி பூச்சி தாக்குதல்',
  'Spider mites': 'சிலந்தி பூச்சி தாக்குதல்',
  'Spider mites Two-spotted spider mite': 'சிலந்தி பூச்சி தாக்குதல்',
  'Two-spotted spider mite': 'இருபுள்ளி சிலந்தி பூச்சி',
  'Target Spot': 'இலக்கு புள்ளி நோய்',
  'Target spot': 'இலக்கு புள்ளி நோய்',
  'Yellow Leaf Curl Virus': 'இலை சுருள் நச்சுயிரி நோய்',
  'Tomato Yellow Leaf Curl Virus': 'தக்காளி இலை சுருள் நச்சுயிரி நோய்',
  'Mosaic Virus': 'மொசைக் நச்சுயிரி நோய்',
  'Tomato mosaic virus': 'தக்காளி மொசைக் நச்சுயிரி நோய்',
  'Apple Scab': 'ஆப்பிள் சொறி நோய்',
  'Apple scab': 'ஆப்பிள் சொறி நோய்',
  'Black Rot': 'கருப்பு அழுகல் நோய்',
  'Black rot': 'கருப்பு அழுகல் நோய்',
  'Cedar Apple Rust': 'சீடர் ஆப்பிள் துரு நோய்',
  'Powdery Mildew': 'சாம்பல் நோய்',
  'Powdery mildew': 'சாம்பல் நோய்',
  'Leaf Scorch': 'இலை தீகல் நோய்',
  'Leaf scorch': 'இலை தீகல் நோய்',
  'Common Rust': 'துரு நோய்',
  'Common rust': 'துரு நோய்',
  'Common rust_': 'துரு நோய்',
  'Northern Leaf Blight': 'வடக்கு இலை கருகல் நோய்',
  'Northern leaf blight': 'வடக்கு இலை கருகல் நோய்',
  'Gray Leaf Spot': 'சாம்பல் இலைப்புள்ளி நோய்',
  'Gray leaf spot': 'சாம்பல் இலைப்புள்ளி நோய்',
  'Cercospora leaf spot': 'செர்கோஸ்போரா இலைப்புள்ளி நோய்',
  'Cercospora leaf spot Gray leaf spot': 'செர்கோஸ்போரா இலைப்புள்ளி நோய்',
  'Esca': 'எஸ்கா கருப்பு அம்மை நோய்',
  'Esca (Black Measles)': 'எஸ்கா கருப்பு அம்மை நோய்',
  'Black Measles': 'கருப்பு அம்மை நோய்',
  'Leaf Blight': 'இலை கருகல் நோய்',
  'Leaf blight': 'இலை கருகல் நோய்',
  'Citrus Greening': 'சிட்ரஸ் கிரீனிங் நோய்',
  'Citrus greening': 'சிட்ரஸ் கிரீனிங் நோய்',
  'Haunglongbing': 'சிட்ரஸ் கிரீனிங் நோய்',
  'Haunglongbing (Citrus greening)': 'சிட்ரஸ் கிரீனிங் நோய்',
  'Healthy': 'ஆரோக்கியமானது',
  'healthy': 'ஆரோக்கியமானது',

  // Severity & Confidence
  'Low Severity': 'குறைந்த தீவிரம்',
  'Medium Severity': 'நடுத்தர தீவிரம்',
  'High Severity': 'அதிக தீவிரம்',
  'Critical': 'மிகவும் தீவிரமானது',
  'Low': 'குறைந்த தீவிரம்',
  'Medium': 'நடுத்தர தீவிரம்',
  'High': 'அதிக தீவிரம்',
  'Very Low Confidence': 'மிகவும் குறைந்த நம்பகத்தன்மை',
  'Low Confidence': 'குறைந்த நம்பகத்தன்மை',
  'Moderate Confidence': 'நடுத்தர நம்பகத்தன்மை',
  'High Confidence': 'அதிக நம்பகத்தன்மை',
  'Very High Confidence': 'மிகவும் அதிக நம்பகத்தன்மை',
  'Moderate': 'மிதமானது',

  // Soil Types & Soil terms
  'Sandy Soil': 'மணல் மண்',
  'Clay Soil': 'களிமண்',
  'Loam Soil': 'வண்டல் மண்',
  'Silt Soil': 'வண்டல் மண்',
  'Black Cotton Soil': 'கரிசல் மண்',
  'Red Soil': 'செம்மண்',
  'Alluvial Soil': 'வண்டல் மண்',
  'Saline Soil': 'உவர் மண்',
  'Dry': 'வறண்டது',
  'Soft': 'மென்மையானது',
  'Hard': 'கடினமானது',
  'Tested': 'பகுப்பாய்வு செய்யப்பட்டது',
  'Not analyzed yet': 'இன்னும் பகுப்பாய்வு செய்யப்படவில்லை',

  // Fertilizers & Soil treatments
  'Urea': 'யூரியா',
  'DAP': 'டி.ஏ.பி உரம்',
  'MOP': 'பொட்டாஷ் உரம்',
  'Potash': 'பொட்டாஷ் உரம்',
  'Vermicompost': 'மண்புழு உரம்',
  'Farmyard manure': 'தொழு உரம்',
  'FYM': 'தொழு உரம்',
  'Neem cake': 'வேப்பம் புண்ணாக்கு',
  'Compost': 'மட்கிய உரம்',
  'Gypsum': 'ஜிப்சம்',
  'Biofertilizer': 'உயிர் உரம்',
  'Trichoderma': 'டிரைக்கோடெர்மா பூஞ்சை',
  'Pseudomonas': 'சூடோமோனாஸ் பாக்டீரியா',
  'Azospirillum': 'அசோஸ்பைரில்லம்',
  'Phosphobacteria': 'பாஸ்போபாக்டீரியா',

  // Water terms
  'Suitable for Irrigation': 'விவசாய நீர்ப்பாசனத்திற்கு மிகவும் உகந்தது',
  'Suitable': 'விவசாயத்திற்கு உகந்தது',
  'Moderately Suitable': 'மிதமான உகந்த தரம்',
  'Unsuitable': 'பாசனத்திற்கு உகந்ததல்ல',
  'Good Quality': 'நல்ல தரம்',
  'Saline': 'உவர்ப்புத் தன்மை',
  'Alkaline': 'காரத்தன்மை',
  'Acidic': 'அமிலத்தன்மை',

  // Locations & common terms
  'Chennai, Tamil Nadu': 'சென்னை, தமிழ்நாடு',
  'Chennai': 'சென்னை',
  'Coimbatore': 'கோயம்புத்தூர்',
  'Madurai': 'மதுரை',
  'Tiruchirappalli': 'திருச்சிராப்பள்ளி',
  'Salem': 'சேலம்',
  'Tirunelveli': 'திருநெல்வேலி',
  'Erode': 'ஈரோடு',
  'Vellore': 'வேலூர்',
  'Thanjavur': 'தஞ்சாவூர்',
  'Dindigul': 'திண்டுக்கல்',
  'Tamil Nadu': 'தமிழ்நாடு',
  'India': 'இந்தியா',
  'Farmer': 'விவசாயி',
};

export default function ReportPage() {
  const { lang: globalLang } = useLang();
  const queryParams = new URLSearchParams(window.location.search);
  const initialLang = queryParams.get('lang') || globalLang || 'ta';

  // Local report language state — changing this ONLY affects report/PDF generation and not other pages
  const [lang, setLangState] = useState(initialLang);
  const [predictionId, setPredictionId] = useState('');
  const [history, setHistory] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLangModal, setShowLangModal] = useState(false);

  // Set language specifically for this Report without overriding global app language
  const setLang = (newLang) => {
    const valid = newLang === 'ta' ? 'ta' : 'en';
    setLangState(valid);
  };

  const headings = HEADINGS_CONFIG[lang] || HEADINGS_CONFIG.ta;

  // Clean pure Tamil helper — removes all English letters and English parenthesized text
  const cleanTa = (str) => {
    if (!str && str !== 0) return 'பொருந்தாது';
    let clean = String(str);

    // Strip specific dataset substrings
    clean = clean
      .replace(/\s*\(including\s+sour\)/gi, '')
      .replace(/\bincluding\s+sour\b/gi, '')
      .replace(/\s*\(maize\)/gi, '')
      .replace(/\bmaize\b/gi, '')
      .replace(/\s*\([a-zA-Z0-9\s,_\-–—/.]+\)/g, '');

    // Replace known dictionary entries
    Object.keys(DICTIONARY_TA).forEach(key => {
      const regex = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      clean = clean.replace(regex, DICTIONARY_TA[key]);
    });

    // Technical units and indicators in Tamil
    clean = clean
      .replace(/\bppm\b/gi, 'பி.பி.எம்')
      .replace(/\bmg\/L\b/gi, 'மி.கி / லிட்டர்')
      .replace(/\bg\/L\b/gi, 'கிராம் / லிட்டர்')
      .replace(/\bml\/L\b/gi, 'மி.லி / லிட்டர்')
      .replace(/\bkg\/ha\b/gi, 'கிலோ / ஹெக்டேர்')
      .replace(/\bpH\b/gi, 'கார அமிலத்தன்மை')
      .replace(/\bEC\b/gi, 'மின் கடத்துத்திறன்')
      .replace(/\bTDS\b/gi, 'மொத்த கரைந்த திடப்பொருட்கள்')
      .replace(/\bN:/g, 'தழைச்சத்து:')
      .replace(/\bP:/g, 'மணிச்சத்து:')
      .replace(/\bK:/g, 'சாம்பல்சத்து:')
      .replace(/\bAM\b/gi, 'முற்பகல்')
      .replace(/\bPM\b/gi, 'பிற்பகல்');

    // Remove any leftover stray English letters/words in Tamil mode
    clean = clean
      .replace(/\s*\([a-zA-Z\s]+\)/g, '')
      .replace(/\b(including|sour|bell|spot|rust|blight|rot|mold|virus|mildew|scorch|mite|mites)\b/gi, '')
      .replace(/[a-zA-Z]+/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*–\s*–\s*/g, ' – ')
      .replace(/^\s*–\s*/, '')
      .replace(/\s*–\s*$/, '')
      .trim();

    return clean || 'பொருந்தாது';
  };

  const cleanEn = (str) => {
    if (!str && str !== 0) return 'N/A';
    let clean = String(str);
    clean = clean
      .replace(/[\u0B80-\u0BFF]+\s*\(?/g, '')
      .replace(/\)/g, '')
      .replace(/\(including sour\)/gi, '')
      .replace(/including sour/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    return clean || 'N/A';
  };

  const getSectionValue = (key) => {
    if (!report || !report.report_sections) return lang === 'ta' ? 'பொருந்தாது' : 'N/A';

    const headerSec = report.report_sections.find(s => s.section === 'header') || {};
    const idSec = report.report_sections.find(s => s.section === 'identification') || {};
    const infoSec = report.report_sections.find(s => s.section === 'disease_info') || {};
    const orgSec = report.report_sections.find(s => s.section === 'organic_treatment') || {};
    const chemSec = report.report_sections.find(s => s.section === 'chemical_treatment') || {};
    const prevSec = report.report_sections.find(s => s.section === 'prevention') || {};
    const tipsSec = report.report_sections.find(s => s.section === 'farming_tips') || {};
    const soilSec = report.report_sections.find(s => s.section === 'soil_analysis') || {};
    const waterSec = report.report_sections.find(s => s.section === 'water_analysis') || {};
    const weatherSec = report.report_sections.find(s => s.section === 'weather') || {};

    const cleanVal = (val) => {
      if (!val && val !== 0) return lang === 'ta' ? 'பொருந்தாது' : 'N/A';
      return lang === 'ta' ? cleanTa(val) : cleanEn(val);
    };

    const cleanList = (arr) => {
      if (!arr || arr.length === 0) return lang === 'ta' ? 'விவரங்கள் இல்லை' : 'No details';
      return arr.map(item => cleanVal(item)).join(', ');
    };

    switch (key) {
      case 'date':
        return cleanVal(headerSec.date);
      case 'farmer':
        return cleanVal(headerSec.farmer);
      case 'location':
        return cleanVal(headerSec.location || (lang === 'ta' ? 'சென்னை, தமிழ்நாடு' : 'Chennai, Tamil Nadu'));
      case 'crop':
        return cleanVal(idSec.crop);
      case 'disease':
        return cleanVal(idSec.disease);
      case 'confidence':
        return cleanVal(idSec.confidence_pct);
      case 'confidence_exp':
        return cleanVal(idSec.confidence_explanation || (lang === 'ta'
          ? 'கண்டறியப்பட்ட நோய் முடிவுகள் விவசாயத் தரவுகளுடன் ஒப்பிடப்பட்டு வழங்கப்பட்டுள்ளது.'
          : 'The result is calculated based on machine learning leaf diagnosis.'));
      case 'severity':
        return cleanVal(infoSec.severity || (lang === 'ta' ? 'நடுத்தர தீவிரம்' : 'Medium Severity'));
      case 'symptoms':
        return cleanVal(infoSec.symptoms || (lang === 'ta'
          ? 'இலைகளில் கருகல் புள்ளிகள், மஞ்சள் நிறமாதல் அல்லது வளர்ச்சி குறைபாடு காணப்படலாம்.'
          : 'Visible leaf spots, yellowing, or growth stunted.'));
      case 'description':
        return cleanVal(infoSec.description || (lang === 'ta'
          ? 'பயிர் நோய்த்தொற்று பூஞ்சை அல்லது பாக்டீரியா பரவலால் ஏற்படுகிறது. ஈரப்பதம் மற்றும் சூடான காலநிலை இந்நோய் பரவ உகந்தது.'
          : 'Plant disease caused by fungal or bacterial pathogen under high humidity conditions.'));
      case 'organic_treatment':
        return cleanVal(orgSec.treatment || (lang === 'ta'
          ? 'வேப்ப எண்ணெய் கரைசல் (3%) அல்லது தாமிர ஆக்சிகுளோரைடு அல்லது டிரைக்கோடெர்மா தெளிப்பு'
          : 'Neem oil spray (3%) or copper-based organic fungicide.'));
      case 'organic_dosage':
        return cleanVal(orgSec.dosage || (lang === 'ta' ? '3 முதல் 5 மிலி / லிட்டர் நீர்' : '3 to 5 ml / L of water'));
      case 'organic_instructions':
        return cleanVal(orgSec.instructions || (lang === 'ta'
          ? 'இலைகளின் இருபுறமும் நன்கு படும்படி அதிகாலையில் அல்லது மாலையில் தெளிக்கவும். பாதிக்கப்பட்ட உதிர்ந்த இலைகளை அகற்றி அழிக்கவும்.'
          : 'Spray thoroughly on both leaf surfaces in early morning or late evening.'));
      case 'chemical_treatment':
        return cleanVal(chemSec.treatment || (lang === 'ta'
          ? 'மேன்கோசெப் அல்லது குளோரோதலோனில் அல்லது மெட்டாலாக்ஸைல்'
          : 'Mancozeb or Chlorothalonil fungicide.'));
      case 'chemical_dosage':
        return cleanVal(chemSec.dosage || (lang === 'ta' ? '2 கிராம் / லிட்டர் நீர்' : '2 g / L of water'));
      case 'chemical_instructions':
        return cleanVal(chemSec.instructions || (lang === 'ta'
          ? 'மருந்து தெளிக்கும் முன் பாதுகாப்பு உபகரணங்களை அணியவும். தயாரிப்பு லேபிளை கவனமாகப் படித்துப் பயன்படுத்தவும்.'
          : 'Follow product label safety instructions strictly before spraying.'));
      case 'prevention':
        return cleanVal(prevSec.content || (idSec.is_healthy
          ? (lang === 'ta' ? 'பயிர் ஆரோக்கியமாக உள்ளது. தொடர் கண்காணிப்பு மற்றும் சரியான நீர்ப்பாசனம் போதுமானது.' : 'Crop is healthy. Maintain regular monitoring and irrigation.')
          : (lang === 'ta' ? 'முறையான பயிர் சுழற்சி முறை பின்பற்றவும். செடிகளுக்கு இடையே நல்ல காற்றோட்டம் இருக்குமாறு நடவும். வயல் வடிகால் வசதியை உறுதி செய்யவும்.' : 'Ensure crop rotation and good soil drainage.')));
      case 'tips':
        return cleanVal(tipsSec.content || (lang === 'ta'
          ? 'பயிர்களை தினமும் கண்காணிக்கவும். தேவையான அளவு மட்டும் நீர்ப்பாசனம் செய்து மண்ணின் வளத்தைப் பாதுகாக்கவும்.'
          : 'Inspect crops regularly and maintain balanced nutrition.'));
      case 'soil':
        if (!soilSec.soil_type && !soilSec.title) return lang === 'ta' ? 'மண் பரிசோதனை செய்யப்படவில்லை.' : 'Soil test not performed.';
        return lang === 'ta' ?
          `மண் வகை: ${cleanTa(soilSec.soil_type || 'வண்டல் மண்')} | கார அமிலத்தன்மை: ${soilSec.ph || 6.8} | பொருத்தமான பயிர்கள்: ${cleanList(soilSec.suitable_crops || ['தக்காளி', 'உருளைக்கிழங்கு', 'நெல்'])} | உரப் பரிந்துரைகள்: ${cleanList(soilSec.fertilizer_recommendations || ['மண்புழு உரம்', 'தொழு உரம்', 'வேப்பம் புண்ணாக்கு'])} | இயற்கை மேம்பாடுகள்: ${cleanList(soilSec.organic_improvements || ['இயற்கை உரம்', 'பசுந்தாள் உரம்'])} | நீர்ப்பாசன ஆலோசனை: ${cleanTa(soilSec.irrigation_advice || 'அதிகாலையில் மிதமான நீர்ப்பாசனம் செய்யவும்.')}` :
          `Soil Type: ${soilSec.soil_type || 'Loam Soil'} | Soil pH: ${soilSec.ph || 6.8} | Suitable Crops: ${cleanList(soilSec.suitable_crops)} | Fertilizers: ${cleanList(soilSec.fertilizer_recommendations)} | Organic Improvements: ${cleanList(soilSec.organic_improvements)} | Irrigation: ${soilSec.irrigation_advice || 'Regular morning irrigation.'}`;
      case 'water':
        if (!waterSec.suitability && !waterSec.title) return lang === 'ta' ? 'நீர் பரிசோதனை செய்யப்படவில்லை.' : 'Water quality test not performed.';
        return lang === 'ta' ?
          `நீரின் தரம்: ${cleanTa(waterSec.suitability || 'விவசாயத்திற்கு உகந்தது')} | கார அமிலத்தன்மை: ${waterSec.ph || 7.2} | மொத்த கரைந்த திடப்பொருட்கள்: ${waterSec.tds_ppm || 420} பி.பி.எம் | பரிந்துரைக்கப்படும் பயிர்கள்: ${cleanList(waterSec.recommended_crops || ['தக்காளி', 'நெல்', 'சோளம்'])} | சாத்தியமான அபாயங்கள்: ${cleanList(waterSec.risks || ['குறைந்த அபாயம்'])} | முன்னெச்சரிக்கைகள்: ${cleanList(waterSec.precautions || ['வழக்கமான வடிகட்டுதல் மற்றும் சொட்டுநீர் பாசனம்'])}` :
          `Water Suitability: ${waterSec.suitability || 'Suitable for Irrigation'} | pH: ${waterSec.ph || 7.2} | TDS: ${waterSec.tds_ppm || 420} ppm | Recommended Crops: ${cleanList(waterSec.recommended_crops)} | Risks: ${cleanList(waterSec.risks)} | Precautions: ${cleanList(waterSec.precautions)}`;
      case 'weather':
        if (!weatherSec.summary && !weatherSec.title) return lang === 'ta' ? 'வானிலை தரவு கிடைக்கவில்லை.' : 'Weather data not available.';
        return lang === 'ta' ?
          `${cleanTa(weatherSec.summary || 'அடுத்த 4 நாட்களில் மிதமான மழை மற்றும் ஈரப்பதம் எதிர்பார்க்கப்படுகிறது.')} | பரிந்துரைகள்: ${cleanList(weatherSec.recommendations || ['மழை நாட்களில் தெளிப்பதைத் தவிர்க்கவும்', 'வடிகால் வாய்க்கால்களைச் சுத்தம் செய்யவும்'])}` :
          `${weatherSec.summary || 'Moderate rainfall and high humidity expected over the next 4 days.'} | Recommendations: ${cleanList(weatherSec.recommendations)}`;
      case 'warning':
        return lang === 'ta' ?
          'வேதி உரங்கள் மற்றும் பூச்சிக்கொல்லிகளைப் பயன்படுத்தும் முன்னர் தயாரிப்பு லேபிளை கவனமாகப் படிக்கவும் மற்றும் உள்ளூர் வேளாண் அலுவலரை கலந்தாலோசிக்கவும்.' :
          'Always read the product label carefully before applying chemical treatments. Consult your local agricultural extension officer.';
      default:
        return lang === 'ta' ? 'பொருந்தாது' : 'N/A';
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await diseaseAPI.getHistory();
      setHistory(res.data);
      if (res.data.length > 0) {
        setPredictionId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load history', err);
    }
  };

  const generateReport = async (overrideLang) => {
    const reportLang = overrideLang || lang;
    setLoading(true);
    setError('');
    setReport(null);

    const weather_data = reportLang === 'ta' ? {
      summary: "அதிக ஈரப்பதம் (சராசரி 78%) மற்றும் அடுத்த 4 நாட்களில் எதிர்பார்க்கப்படும் மழை பூஞ்சை நோய் பரவும் அபாயத்தை அதிகரிக்கும்.",
      recommendations: [
        { message: "மழை எதிர்பார்க்கப்படும் நாட்களில் இலைவழி உரங்கள் அல்லது பூச்சிக்கொல்லிகள் தெளிப்பதைத் தவிர்க்கவும்." },
        { message: "மழை தொடங்குவதற்கு முன் டிரைக்கோடெர்மா அல்லது தாமிர அடிப்படையிலான பூஞ்சைக் கொல்லியைத் தெளிக்கவும்." },
        { message: "வயலில் தண்ணீர் தேங்குவதைத் தடுக்க வடிகால் வாய்க்கால்களைச் சுத்தம் செய்யவும்." }
      ]
    } : {
      summary: "High humidity (average 78%) and expected rain over the next 4 days increase fungal disease risk.",
      recommendations: [
        { message: "Avoid spraying foliar fertilizers or pesticides on expected rainy days." },
        { message: "Apply organic Trichoderma or copper-based preventive fungicide on Day 2 before rain starts." },
        { message: "Clean drainage channels to prevent waterlogging." }
      ]
    };

    let soil_data = null;
    let water_data = null;
    try {
      soil_data = localStorage.getItem('last_soil_analysis') ? JSON.parse(localStorage.getItem('last_soil_analysis')) : null;
      water_data = localStorage.getItem('last_water_analysis') ? JSON.parse(localStorage.getItem('last_water_analysis')) : null;
    } catch { /* ignore */ }

    try {
      const res = await advisorAPI.generateReport({
        lang: reportLang,
        prediction_id: predictionId ? parseInt(predictionId) : null,
        weather_data,
        location: reportLang === 'ta' ? "சென்னை, தமிழ்நாடு" : "Chennai, Tamil Nadu",
        soil_data,
        water_data,
      });
      setReport(res.data);
    } catch (err) {
      setError(err.response?.data?.error || (reportLang === 'ta' ? 'அறிக்கை உருவாக்குவதில் தோல்வி ஏற்பட்டது.' : 'Failed to generate report.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const triggerGenerateReport = () => {
    setShowLangModal(true);
  };

  const handleSelectLangAndGenerate = (selectedLang) => {
    setLang(selectedLang);
    setShowLangModal(false);
    generateReport(selectedLang);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0d1f0d', padding: '6rem 1.5rem 2rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 850, margin: '0 auto' }}>
        
        {/* Controls Card */}
        <div className="no-print" style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 20, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: '#7dd56f', marginTop: 0, marginBottom: '1rem' }}>
            📄 {lang === 'ta' ? 'ஸ்மார்ட் பயிர் நோய் அறிக்கை' : 'Multilingual Farming Report'}
          </h1>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ color: '#a5d6a7', fontSize: '.85rem', fontWeight: 600, display: 'block', marginBottom: '.3rem' }}>
                {lang === 'ta' ? 'அறிக்கை மொழியைத் தேர்ந்தெடுக்கவும்' : 'Select Report Language'}
              </label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid #2d5a27', borderRadius: 8, padding: '.65rem 1rem', color: '#e8f5e9', fontSize: '.9rem' }}
              >
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="en">English (English)</option>
              </select>
            </div>

            <div>
              <label style={{ color: '#a5d6a7', fontSize: '.85rem', fontWeight: 600, display: 'block', marginBottom: '.3rem' }}>
                {lang === 'ta' ? 'நோய் கணிப்பு வரலாற்றைத் தேர்ந்தெடுக்கவும்' : 'Select Prediction Instance'}
              </label>
              <select
                value={predictionId}
                onChange={(e) => setPredictionId(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid #2d5a27', borderRadius: 8, padding: '.65rem 1rem', color: '#e8f5e9', fontSize: '.9rem' }}
              >
                <option value="">{lang === 'ta' ? '-- சமீபத்திய கணிப்பைப் பயன்படுத்தவும் --' : '-- Use Latest Prediction --'}</option>
                {history.map((h) => {
                  const displayTa = cleanTa(h.predicted_disease || h.crop_name);
                  const displayEn = cleanEn(h.predicted_disease || h.crop_name || 'Crop');
                  const dateStr = new Date(h.created_at).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-IN');
                  return (
                    <option key={h.id} value={h.id}>
                      {lang === 'ta' ? displayTa : displayEn} ({dateStr})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(244,67,54,0.12)', border: '1px solid #f44336', borderRadius: 10, padding: '.8rem 1rem', color: '#ef9a9a', marginBottom: '1rem', fontSize: '.88rem' }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '.75rem' }}>
            <button
              onClick={triggerGenerateReport}
              disabled={loading}
              style={{
                flex: 1, background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
                color: '#fff', border: 'none', borderRadius: 10, padding: '.85rem',
                fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(76,175,80,0.3)',
              }}
            >
              {loading ? (lang === 'ta' ? '⏳ அறிக்கை உருவாக்கப்படுகிறது...' : '⏳ Generating Report...') : (lang === 'ta' ? '📄 முழு அறிக்கை உருவாக்கு' : '📄 Generate Full Report')}
            </button>

            {report && (
              <button
                onClick={handlePrint}
                style={{
                  background: 'rgba(0,0,0,0.3)', color: '#7dd56f',
                  border: '1px solid #2d5a27', borderRadius: 10, padding: '0 1.25rem',
                  fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem'
                }}
              >
                🖨️ {lang === 'ta' ? 'அச்சிடு / PDF சேமி' : 'Print / Save PDF'}
              </button>
            )}
          </div>
        </div>

        {/* Language Selection Modal */}
        {showLangModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, padding: '1rem'
          }}>
            <div style={{
              background: '#1b351b', border: '2px solid #4caf50', borderRadius: 20,
              padding: '2rem', maxWidth: 440, width: '100%', textAlign: 'center'
            }}>
              <h3 style={{ color: '#7dd56f', fontFamily: 'Outfit, sans-serif', fontSize: '1.35rem', marginTop: 0, marginBottom: '0.5rem' }}>
                🌐 {lang === 'ta' ? 'அறிக்கை மொழியைத் தேர்ந்தெடுக்கவும்' : 'Select Report Language'}
              </h3>
              <p style={{ color: '#a5d6a7', fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                {lang === 'ta'
                  ? 'முழு அறிக்கையையும் தமிழில் பெற "தமிழ் அறிக்கை" பொத்தானை அழுத்தவும்.'
                  : 'Choose language for the generated precision farming report:'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  onClick={() => handleSelectLangAndGenerate('ta')}
                  style={{
                    background: 'linear-gradient(135deg, #4caf50, #2e7d32)', color: '#fff',
                    border: 'none', borderRadius: 12, padding: '0.95rem', fontWeight: 800,
                    fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                  }}
                >
                  <span>🇮🇳</span>
                  <span>முழுமையான தமிழ் அறிக்கை (Tamil Report)</span>
                </button>
                <button
                  onClick={() => handleSelectLangAndGenerate('en')}
                  style={{
                    background: 'rgba(0,0,0,0.3)', color: '#7dd56f',
                    border: '1px solid #4caf50', borderRadius: 12, padding: '0.95rem', fontWeight: 700,
                    fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                  }}
                >
                  <span>🇬🇧</span>
                  <span>English Report</span>
                </button>
                <button
                  onClick={() => setShowLangModal(false)}
                  style={{
                    background: 'transparent', color: '#81c784', border: 'none',
                    marginTop: '0.5rem', cursor: 'pointer', fontSize: '0.85rem'
                  }}
                >
                  {lang === 'ta' ? 'ரத்து செய்' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unified 23-Heading Report Output */}
        {report && (
          <div
            className="printable-report"
            lang={lang === 'ta' ? 'ta' : 'en'}
            style={{
              background: '#ffffff', color: '#111111', borderRadius: 16, padding: '2.5rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)', minHeight: '800px', border: '1px solid #dddddd',
              fontFamily: lang === 'ta' ? "'Noto Sans Tamil', 'Latha', 'Arial Unicode MS', sans-serif" : 'Inter, sans-serif',
            }}>
            
            {/* 1. Title Section */}
            <div style={{ borderBottom: '3.5px double #2e7d32', paddingBottom: '1.25rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              <h1 style={{ color: '#1b5e20', margin: 0, fontFamily: lang === 'ta' ? "'Noto Sans Tamil', sans-serif" : 'Outfit, sans-serif', fontSize: '2.1rem', fontWeight: 800 }}>
                {headings.find(h => h.key === 'title').label}
              </h1>
            </div>

            {/* Date, Farmer, Location grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#f1f8e9', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid #c5e1a5' }}>
              <div>
                <strong style={{ color: '#2e7d32', fontSize: '0.82rem', display: 'block', textTransform: 'uppercase' }}>
                  {headings.find(h => h.key === 'date').label}
                </strong>
                <span style={{ fontSize: '0.98rem', color: '#333' }}>{getSectionValue('date')}</span>
              </div>
              <div>
                <strong style={{ color: '#2e7d32', fontSize: '0.82rem', display: 'block', textTransform: 'uppercase' }}>
                  {headings.find(h => h.key === 'farmer').label}
                </strong>
                <span style={{ fontSize: '0.98rem', color: '#333' }}>{getSectionValue('farmer')}</span>
              </div>
              <div>
                <strong style={{ color: '#2e7d32', fontSize: '0.82rem', display: 'block', textTransform: 'uppercase' }}>
                  {headings.find(h => h.key === 'location').label}
                </strong>
                <span style={{ fontSize: '0.98rem', color: '#333' }}>{getSectionValue('location')}</span>
              </div>
            </div>

            {/* Crop, Disease, Confidence, Severity Identification grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', background: '#e8f5e9', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid #a5d6a7' }}>
              <div>
                <strong style={{ color: '#2e7d32', fontSize: '0.82rem', display: 'block' }}>
                  {headings.find(h => h.key === 'crop').label}
                </strong>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1b5e20' }}>{getSectionValue('crop')}</span>
              </div>
              <div>
                <strong style={{ color: '#2e7d32', fontSize: '0.82rem', display: 'block' }}>
                  {headings.find(h => h.key === 'disease').label}
                </strong>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#c62828' }}>{getSectionValue('disease')}</span>
              </div>
              <div>
                <strong style={{ color: '#2e7d32', fontSize: '0.82rem', display: 'block' }}>
                  {headings.find(h => h.key === 'confidence').label}
                </strong>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1b5e20' }}>{getSectionValue('confidence')}</span>
              </div>
              <div>
                <strong style={{ color: '#2e7d32', fontSize: '0.82rem', display: 'block' }}>
                  {headings.find(h => h.key === 'severity').label}
                </strong>
                <span style={{ display: 'inline-block', marginTop: '0.25rem', background: '#ffe0b2', color: '#e65100', padding: '0.15rem 0.6rem', borderRadius: 4, fontSize: '0.85rem', fontWeight: 700 }}>
                  {getSectionValue('severity')}
                </span>
              </div>
            </div>

            {/* Confidence explanation banner */}
            <div style={{ background: '#f9fbe7', borderLeft: '4px solid #c0ca33', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem' }}>
              <strong style={{ color: '#1b5e20', fontSize: '0.88rem', display: 'block', marginBottom: '0.25rem' }}>
                {headings.find(h => h.key === 'confidence_exp').label}
              </strong>
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#444', lineHeight: 1.6 }}>{getSectionValue('confidence_exp')}</p>
            </div>

            {/* Symptoms and Description block */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ border: '1px solid #ddd', borderRadius: 10, padding: '1rem' }}>
                <strong style={{ color: '#1b5e20', fontSize: '1rem', display: 'block', marginBottom: '0.4rem', borderBottom: '1px solid #eee', paddingBottom: '0.25rem' }}>
                  {headings.find(h => h.key === 'symptoms').label}
                </strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#333', lineHeight: 1.6 }}>{getSectionValue('symptoms')}</p>
              </div>
              <div style={{ border: '1px solid #ddd', borderRadius: 10, padding: '1rem' }}>
                <strong style={{ color: '#1b5e20', fontSize: '1rem', display: 'block', marginBottom: '0.4rem', borderBottom: '1px solid #eee', paddingBottom: '0.25rem' }}>
                  {headings.find(h => h.key === 'description').label}
                </strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#333', lineHeight: 1.6 }}>{getSectionValue('description')}</p>
              </div>
            </div>

            {/* Organic Treatment Card */}
            <div style={{ border: '1px solid #a5d6a7', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem', background: '#f9fbe7' }}>
              <h3 style={{ margin: '0 0 0.75rem', color: '#2e7d32', fontSize: '1.08rem', borderBottom: '1px dashed #a5d6a7', paddingBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                🌿 {headings.find(h => h.key === 'organic_treatment').label}
              </h3>
              <div style={{ fontSize: '0.92rem', color: '#333', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div><strong>{headings.find(h => h.key === 'organic_treatment').label}:</strong> {getSectionValue('organic_treatment')}</div>
                <div><strong>{headings.find(h => h.key === 'organic_dosage').label}:</strong> {getSectionValue('organic_dosage')}</div>
                <div><strong>{headings.find(h => h.key === 'organic_instructions').label}:</strong> {getSectionValue('organic_instructions')}</div>
              </div>
            </div>

            {/* Chemical Treatment Card */}
            <div style={{ border: '1px solid #ffcc80', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem', background: '#fffde7' }}>
              <h3 style={{ margin: '0 0 0.75rem', color: '#e65100', fontSize: '1.08rem', borderBottom: '1px dashed #ffcc80', paddingBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                🧪 {headings.find(h => h.key === 'chemical_treatment').label}
              </h3>
              <div style={{ fontSize: '0.92rem', color: '#333', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div><strong>{headings.find(h => h.key === 'chemical_treatment').label}:</strong> {getSectionValue('chemical_treatment')}</div>
                <div><strong>{headings.find(h => h.key === 'chemical_dosage').label}:</strong> {getSectionValue('chemical_dosage')}</div>
                <div><strong>{headings.find(h => h.key === 'chemical_instructions').label}:</strong> {getSectionValue('chemical_instructions')}</div>
              </div>
            </div>

            {/* Prevention and Farming Tips grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#f5f5f5', borderRadius: 12, padding: '1.25rem', border: '1px solid #e0e0e0' }}>
                <strong style={{ color: '#2e7d32', fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>
                  🛡️ {headings.find(h => h.key === 'prevention').label}
                </strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#444', lineHeight: 1.6 }}>{getSectionValue('prevention')}</p>
              </div>
              <div style={{ background: '#f5f5f5', borderRadius: 12, padding: '1.25rem', border: '1px solid #e0e0e0' }}>
                <strong style={{ color: '#2e7d32', fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>
                  💡 {headings.find(h => h.key === 'tips').label}
                </strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#444', lineHeight: 1.6 }}>{getSectionValue('tips')}</p>
              </div>
            </div>

            {/* Soil Status */}
            <div style={{ border: '1px solid #d7ccc8', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem', background: '#efebe9' }}>
              <h3 style={{ margin: '0 0 0.75rem', color: '#5d4037', fontSize: '1.08rem', borderBottom: '1px dashed #d7ccc8', paddingBottom: '0.4rem' }}>
                🪨 {headings.find(h => h.key === 'soil').label}
              </h3>
              <div style={{ fontSize: '0.92rem', color: '#333', lineHeight: 1.6 }}>
                {getSectionValue('soil')}
              </div>
            </div>

            {/* Water Status */}
            <div style={{ border: '1px solid #b3e5fc', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem', background: '#e1f5fe' }}>
              <h3 style={{ margin: '0 0 0.75rem', color: '#0277bd', fontSize: '1.08rem', borderBottom: '1px dashed #b3e5fc', paddingBottom: '0.4rem' }}>
                💧 {headings.find(h => h.key === 'water').label}
              </h3>
              <div style={{ fontSize: '0.92rem', color: '#333', lineHeight: 1.6 }}>
                {getSectionValue('water')}
              </div>
            </div>

            {/* Weather recommendations */}
            <div style={{ border: '1px solid #b2dfdb', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem', background: '#e0f2f1' }}>
              <h3 style={{ margin: '0 0 0.75rem', color: '#00796b', fontSize: '1.08rem', borderBottom: '1px dashed #b2dfdb', paddingBottom: '0.4rem' }}>
                🌤️ {headings.find(h => h.key === 'weather').label}
              </h3>
              <div style={{ fontSize: '0.92rem', color: '#333', lineHeight: 1.6 }}>
                {getSectionValue('weather')}
              </div>
            </div>

            {/* 23. Warning Alert Panel */}
            <div style={{ background: '#ffebee', border: '1px solid #ffcdd2', color: '#c62828', borderRadius: 12, padding: '1.25rem', marginTop: '2rem' }}>
              <strong style={{ display: 'block', marginBottom: '0.4rem', fontSize: '1rem' }}>
                ⚠️ {headings.find(h => h.key === 'warning').label}
              </strong>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>
                {getSectionValue('warning')}
              </p>
            </div>

            {/* Print Footer */}
            <div className="print-only" style={{ display: 'none', borderTop: '1px solid #dddddd', marginTop: '3rem', paddingTop: '1rem', textAlign: 'center', fontSize: '.78rem', color: '#666' }}>
              {lang === 'ta'
                ? 'ஸ்மார்ட்கிராப் விவசாய உதவியாளரால் இந்த அறிக்கை உருவாக்கப்பட்டது. பரிந்துரைகளை உள்ளூர் வேளாண் அலுவலரிடம் சரிபார்க்கவும்.'
                : 'Report generated dynamically by SmartCrop Smart Farming Assistant. Always verify recommendations locally.'}
            </div>
          </div>
        )}

      </div>

      <link rel="stylesheet" href={TAMIL_FONT_LINK} />

      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .printable-report {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .printable-report[lang="ta"], .printable-report[lang="ta"] * {
            font-family: 'Noto Sans Tamil', 'Latha', 'Arial Unicode MS', sans-serif !important;
          }
          .print-only {
            display: block !important;
          }
          header, footer, nav, .navbar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
