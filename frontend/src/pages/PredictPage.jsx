import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { diseaseAPI, advisorAPI, iotAPI } from '../services/api';
import { useLang } from '../contexts/LanguageContext';

const CONFIDENCE_CONFIG = {
  very_low: { color: '#f44336', bg: 'rgba(244,67,54,0.12)', label_ta: 'மிகவும் குறைவு', label_en: 'Very Low', icon: '🔴' },
  low:      { color: '#ff9800', bg: 'rgba(255,152,0,0.12)',  label_ta: 'குறைவு',      label_en: 'Low',      icon: '🟠' },
  moderate: { color: '#ffc107', bg: 'rgba(255,193,7,0.12)',  label_ta: 'நடுத்தரம்', label_en: 'Moderate', icon: '🟡' },
  high:     { color: '#8bc34a', bg: 'rgba(139,195,74,0.12)', label_ta: 'அதிகம்',     label_en: 'High',     icon: '🟢' },
  very_high:{ color: '#4caf50', bg: 'rgba(76,175,80,0.12)',  label_ta: 'மிகவும் அதிகம்', label_en: 'Very High', icon: '✅' },
};

const SEVERITY_CONFIG = {
  Low:      { color: '#4caf50', label_ta: 'குறைந்த தீவிரம்', label_en: 'Low Severity' },
  Medium:   { color: '#ff9800', label_ta: 'நடுத்தர தீவிரம்', label_en: 'Medium Severity' },
  High:     { color: '#f44336', label_ta: 'அதிக தீவிரம்', label_en: 'High Severity' },
  Critical: { color: '#9c27b0', label_ta: 'மிகவும் தீவிரமானது', label_en: 'Critical' },
};

const CROP_REQUIREMENTS = {
  Tomato:    { minMoisture: 45, maxMoisture: 70, minWater: 35, maxWater: 70 },
  Potato:    { minMoisture: 45, maxMoisture: 65, minWater: 35, maxWater: 65 },
  Rice:      { minMoisture: 60, maxMoisture: 85, minWater: 55, maxWater: 85 },
  Corn:      { minMoisture: 40, maxMoisture: 65, minWater: 35, maxWater: 65 },
  Maize:     { minMoisture: 40, maxMoisture: 65, minWater: 35, maxWater: 65 },
  Apple:     { minMoisture: 45, maxMoisture: 65, minWater: 40, maxWater: 65 },
  Grape:     { minMoisture: 40, maxMoisture: 60, minWater: 35, maxWater: 60 },
  Cotton:    { minMoisture: 35, maxMoisture: 60, minWater: 35, maxWater: 60 },
  Groundnut: { minMoisture: 40, maxMoisture: 65, minWater: 35, maxWater: 60 },
  Sugarcane: { minMoisture: 50, maxMoisture: 75, minWater: 50, maxWater: 75 },
  Pepper:    { minMoisture: 45, maxMoisture: 65, minWater: 40, maxWater: 65 },
  Default:   { minMoisture: 40, maxMoisture: 70, minWater: 30, maxWater: 75 },
};

const TRANSLATIONS = {
  ta: {
    // Analyzer header
    analyzer_title: "🔬 பயிர் பகுப்பாய்வி",
    analyzer_subtitle: "இலை, மண் மற்றும் நீர் ஆகிய மூன்றையும் பகுப்பாய்வு செய்து முழுமையான விவசாயத் தீர்வைப் பெறுங்கள்.",

    // Tab names
    tab_leaf: "🌿 இலை",
    tab_soil: "🟫 மண்",
    tab_water: "💧 நீர்",

    // Leaf section
    predict_card_title: "🌿 இலை நோய் பகுப்பாய்வு",
    upload_image: "📁 படம் பதிவேற்றவும்",
    take_photo: "📷 கேமரா",
    usb_camera: "🔌 USB கேமரா",
    select_crop: "பயிரைத் தேர்ந்தெடுக்கவும்:",
    auto_detect: "பயிரை தானாகக் கண்டறி",
    btn_predict: "🔬 கணிப்பு செய்க",
    detect_lbl: "கண்டறியப்பட்டது",
    confidence_lbl: "நம்பகத்தன்மை",
    severity_lbl: "தீவிரம்",
    organic_tab: "🌿 இயற்கை சிகிச்சை",
    chemical_tab: "🧪 வேதி சிகிச்சை",
    prevention_tab: "🛡️ தடுப்பு நடவடிக்கைகள்",
    btn_get_report: "📄 முழு அறிக்கை பெறுக",
    alert_lbl: "பாதுகாப்பு எச்சரிக்கை",
    alert_chemical_msg: "⚠️ வேதி உரங்கள் மற்றும் பூச்சிக்கொல்லிகளைப் பயன்படுத்தும் முன்னர் தயாரிப்பு லேபிளை கவனமாகப் படிக்கவும்.",
    healthy_msg: "உங்கள் பயிர் ஆரோக்கியமாக உள்ளது!",
    healthy_desc: "தொடர் கண்காணிப்பு, முறையான நீர்ப்பாசனம் மற்றும் வழக்கமான பராமரிப்பு முறைகளைப் பின்பற்றவும்.",
    tips_lbl: "விவசாய குறிப்புகள்",
    symptoms_lbl: "அறிகுறிகள்",
    desc_lbl: "நோயின் விளக்கம்",
    treatment_lbl: "இலை நோய் சிகிச்சை வழிமுறை",
    dosage_lbl: "தேவைப்படும் அளவு",
    instructions_lbl: "செய்முறை வழிமுறைகள்",
    error_no_image: "தயவுசெய்து ஒரு புகைப்படத்தை முதலில் தேர்ந்தெடுக்கவும்.",
    error_invalid_image: "படங்களை மட்டுமே பதிவேற்றவும் (JPG, PNG, WEBP).",
    analyzing_leaf: "⏳ இலை பகுப்பாய்வு செய்யப்படுகிறது...",
    leaf_placeholder: "இலையின் புகைப்படத்தைப் பதிவேற்றி \"கணிப்பு செய்க\" பொத்தானை அழுத்தவும்.",
    retake_clear: "🔄 மீண்டும் எடுக்கவும்",
    drag_hint: "இலையின் புகைப்படத்தைப் பதிவேற்றவும்",
    take_leaf_photo: "புகைப்படம் எடு",
    from_gallery: "படத்தொகுப்பு",

    // Soil section
    soil_title: "🟫 மண் AI பகுப்பாய்வு",
    soil_subtitle: "மண்ணின் புகைப்படத்தை எடுக்கவும் அல்லது பதிவேற்றவும். AI மண் வகையை கணிக்கும்.",
    btn_analyze_soil: "🔬 மண் படத்தை பகுப்பாய்வு செய்",
    analyzing_soil: "⏳ மண் படம் பகுப்பாய்வு செய்யப்படுகிறது...",
    soil_class_lbl: "கண்டறியப்பட்ட மண் வகை",
    soil_condition_lbl: "மண் நிலை",
    soil_problem_lbl: "சாத்தியமான பிரச்சனை",
    soil_improvement_lbl: "மண் மேம்பாடு",
    soil_organic_lbl: "🌿 இயற்கை முறைகள்",
    soil_crops_lbl: "🌾 பரிந்துரைக்கப்படும் பயிர்கள்",
    soil_lab_note: "pH, NPK, EC, TDS மதிப்புகளுக்கு ஆய்வக மண் பரிசோதனை தேவை.",
    soil_placeholder: "மண்ணின் புகைப்படத்தைப் பதிவேற்றி \"பகுப்பாய்வு\" பொத்தானை அழுத்தவும்.",
    soil_model_not_ready: "மண் AI மாதிரி தயாரில்லை. பயிற்சி முடியும் வரை காத்திருக்கவும்.",
    soil_drag_hint: "மண்ணின் புகைப்படத்தைப் பதிவேற்றவும்",
    take_soil_photo: "மண் புகைப்படம்",
    data_unavailable: "தரவு கிடைக்கவில்லை",
    top_predictions_lbl: "முதல் 3 கணிப்புகள்",

    // Water section
    water_title: "💧 நீர் AI பகுப்பாய்வு",
    water_subtitle: "நீர் ஆதாரத்தின் புகைப்படத்தை எடுக்கவும் அல்லது பதிவேற்றவும். AI நீர் நிலையை பகுப்பாய்வு செய்யும்.",
    btn_analyze_water: "🔬 நீர் படத்தை பகுப்பாய்வு செய்",
    analyzing_water: "⏳ நீர் படம் பகுப்பாய்வு செய்யப்படுகிறது...",
    water_status_lbl: "நீர் நிலை",
    water_condition_lbl: "கள நீர் நிலை",
    water_color_lbl: "கண்டறியப்பட்ட நிறம்",
    water_suitability_lbl: "உகந்த தன்மை",
    water_observations_lbl: "கண்டறிதல்கள்",
    water_recommendations_lbl: "🛡️ பரிந்துரைகள்",
    water_risks_lbl: "🚨 சாத்தியமான அபாயங்கள்",
    water_placeholder: "நீர் ஆதாரத்தின் புகைப்படத்தைப் பதிவேற்றி \"பகுப்பாய்வு\" பொத்தானை அழுத்தவும்.",
    water_lab_note: "pH, TDS, EC மதிப்புகளுக்கு ஆய்வக நீர் பரிசோதனை தேவை.",
    water_drag_hint: "நீர் ஆதாரத்தின் புகைப்படத்தைப் பதிவேற்றவும்",
    take_water_photo: "நீர் புகைப்படம்",

    // Boost / Complete Solution
    boost_btn: "🚀 உங்கள் பயிரை மேம்படுத்துங்கள்",
    boost_title: "🚀 உங்கள் பயிரை மேம்படுத்துங்கள் — முழுமையான தீர்வு",
    boost_loading: "⏳ முழுமையான விவசாயத் தீர்வு கணக்கிடப்படுகிறது...",
    complete_solution_title: "📋 முழுமையான தீர்வு",
    priority_lbl: "முன்னுரிமை",
    final_rec_lbl: "இறுதி விவசாயப் பரிந்துரை",
    leaf_condition: "இலை நிலை",
    soil_condition: "மண் நிலை",
    water_condition_boost: "நீர் நிலை",
    next_action: "அடுத்த நடவடிக்கை",
    scan_again: "மீண்டும் படம் பிடி",
    no_analysis_yet: "முதலில் குறைந்தபட்சம் ஒரு பகுப்பாய்வு செய்யுங்கள்.",
    image_required: "படம் தேவை",
    not_analyzed: "பகுப்பாய்வு செய்யப்படவில்லை",
    healthy: "ஆரோக்கியமானது",
    problem_found: "பிரச்சனை கண்டறியப்பட்டது",
    solution_lbl: "தீர்வு",
    problem_lbl: "பிரச்சனை",

    // IoT sensor supplement
    sensor_soil_lbl: "நேரடி மண் சென்சார்",
    sensor_water_lbl: "நேரடி நீர் சென்சார்",
    sensor_unavailable: "சென்சார் தரவு கிடைக்கவில்லை",

    // Camera modal
    modal_title_camera: "📷 கேமரா",
    modal_title_usb: "🔌 USB கேமரா",
    camera_err_perm: "கேமராவை அணுக அனுமதி வழங்கவும்",
    camera_btn_grant: "கேமராவை இயக்கு",
    camera_select_device: "கேமராவைத் தேர்ந்தெடுக்கவும்:",
    btn_capture: "படம் பிடிக்கவும்",
    btn_retake: "மீண்டும் எடுக்கவும்",
    btn_use_photo: "புகைப்படத்தைப் பயன்படுத்தவும்",
    btn_close: "மூடவும்",
    btn_start_camera: "கேமராவைத் தொடங்கு",
    btn_stop_camera: "கேமராவை நிறுத்து",
    usb_err_fallback: "USB கேமரா கண்டறியப்படவில்லை. படத்தைப் பதிவேற்ற பொத்தானைப் பயன்படுத்தவும்:",

    // Common
    error_lbl: "பிழை",
    retry_lbl: "மீண்டும் முயற்சிக்கவும்",
    loading_lbl: "ஏற்றுகிறது...",
    result_lbl: "முடிவு",
    upload_lbl: "பதிவேற்றவும்",
    camera_lbl: "கேமரா",
    analyze_lbl: "பகுப்பாய்வு",
  },
  en: {
    // Analyzer header
    analyzer_title: "🔬 Crop Analyzer",
    analyzer_subtitle: "Analyze Leaf, Soil, and Water to generate a complete precision farming solution.",

    // Tab names
    tab_leaf: "🌿 Leaf",
    tab_soil: "🟫 Soil",
    tab_water: "💧 Water",

    // Leaf section
    predict_card_title: "🌿 Leaf Disease Analysis",
    upload_image: "📁 Upload Image",
    take_photo: "📷 Camera",
    usb_camera: "🔌 USB Camera",
    select_crop: "Select Crop:",
    auto_detect: "Auto-detect crop",
    btn_predict: "🔬 Predict Leaf Disease",
    detect_lbl: "Detected",
    confidence_lbl: "Confidence",
    severity_lbl: "Severity",
    organic_tab: "🌿 Organic Treatment",
    chemical_tab: "🧪 Chemical Treatment",
    prevention_tab: "🛡️ Prevention",
    btn_get_report: "📄 Get Full Report",
    alert_lbl: "Safety Warning",
    alert_chemical_msg: "⚠️ Always read product labels carefully before applying chemical treatments.",
    healthy_msg: "Your crop appears healthy!",
    healthy_desc: "Continue regular monitoring, proper nutrition, and good agricultural practices.",
    tips_lbl: "Farming Tips",
    symptoms_lbl: "Symptoms",
    desc_lbl: "Disease Description",
    treatment_lbl: "LEAF SOLUTION",
    dosage_lbl: "Dosage",
    instructions_lbl: "Instructions",
    error_no_image: "Please select an image first.",
    error_invalid_image: "Please upload a valid image file (JPG, PNG, WEBP).",
    analyzing_leaf: "⏳ Analyzing Leaf...",
    leaf_placeholder: "Upload leaf image and click \"Predict\" to see diagnosis & solution.",
    retake_clear: "🔄 Retake / Clear",
    drag_hint: "Click or drag leaf photo here",
    take_leaf_photo: "TAKE LEAF PHOTO",
    from_gallery: "FROM GALLERY",

    // Soil section
    soil_title: "🟫 Soil AI Analysis",
    soil_subtitle: "Upload or capture a soil photo. AI will classify the soil type and recommend suitable crops.",
    btn_analyze_soil: "🔬 Analyze Soil Image",
    analyzing_soil: "⏳ Analyzing Soil Image...",
    soil_class_lbl: "Detected Soil Type",
    soil_condition_lbl: "Soil Condition",
    soil_problem_lbl: "Possible Problem",
    soil_improvement_lbl: "Soil Improvement",
    soil_organic_lbl: "🌿 Organic Methods",
    soil_crops_lbl: "🌾 Recommended Crops",
    soil_lab_note: "pH, NPK, EC, TDS values require laboratory soil testing.",
    soil_placeholder: "Upload soil image and click \"Analyze\" to see soil classification & recommendations.",
    soil_model_not_ready: "Soil AI model not yet trained. Please wait until training completes.",
    soil_drag_hint: "Click or drag soil photo here",
    take_soil_photo: "SOIL PHOTO",
    data_unavailable: "Data unavailable",
    top_predictions_lbl: "Top 3 Predictions",

    // Water section
    water_title: "💧 Water AI Analysis",
    water_subtitle: "Upload or capture a water source photo. AI will assess the visible water condition.",
    btn_analyze_water: "🔬 Analyze Water Image",
    analyzing_water: "⏳ Analyzing Water Image...",
    water_status_lbl: "Water Status",
    water_condition_lbl: "Field Water Condition",
    water_color_lbl: "Observed Color",
    water_suitability_lbl: "Suitability",
    water_observations_lbl: "Observations",
    water_recommendations_lbl: "🛡️ Recommendations",
    water_risks_lbl: "🚨 Possible Risks",
    water_placeholder: "Upload water source image and click \"Analyze\" to see water condition assessment.",
    water_lab_note: "pH, TDS, EC values require laboratory water testing.",
    water_drag_hint: "Click or drag water photo here",
    take_water_photo: "WATER PHOTO",

    // Boost / Complete Solution
    boost_btn: "🚀 BOOST YOUR CROP",
    boost_title: "🚀 BOOST YOUR CROP — COMPLETE SOLUTION",
    boost_loading: "⏳ Generating Complete Farming Plan...",
    complete_solution_title: "📋 COMPLETE SOLUTION",
    priority_lbl: "PRIORITY",
    final_rec_lbl: "FINAL FARMING RECOMMENDATION",
    leaf_condition: "LEAF CONDITION",
    soil_condition: "SOIL CONDITION",
    water_condition_boost: "WATER CONDITION",
    next_action: "Next Action",
    scan_again: "SCAN AGAIN",
    no_analysis_yet: "Complete at least one analysis first.",
    image_required: "Image Required",
    not_analyzed: "Not Analyzed",
    healthy: "Healthy",
    problem_found: "Problem Found",
    solution_lbl: "Solution",
    problem_lbl: "Problem",

    // IoT sensor supplement
    sensor_soil_lbl: "Live Soil Sensor",
    sensor_water_lbl: "Live Water Sensor",
    sensor_unavailable: "Sensor data unavailable",

    // Camera modal
    modal_title_camera: "📷 Camera",
    modal_title_usb: "🔌 USB Camera",
    camera_err_perm: "Please grant camera access permission",
    camera_btn_grant: "Start Camera",
    camera_select_device: "Select Camera Device:",
    btn_capture: "Capture Photo",
    btn_retake: "Retake",
    btn_use_photo: "Use Photo",
    btn_close: "Close",
    btn_start_camera: "Start Camera",
    btn_stop_camera: "Stop Camera",
    usb_err_fallback: "USB Camera not found. Please upload a photo from your device instead:",

    // Common
    error_lbl: "Error",
    retry_lbl: "Retry",
    loading_lbl: "Loading...",
    result_lbl: "Result",
    upload_lbl: "Upload",
    camera_lbl: "Camera",
    analyze_lbl: "Analyze",
  }
};

export default function PredictPage() {
  const { lang, setLang } = useLang();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ta;

  // ── Active section (leaf / soil / water) ──
  const [activeSection, setActiveSection] = useState('leaf');

  // ── Leaf Prediction state ──
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [cropName, setCropName] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('organic');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();
  const cameraDirectRef = useRef();

  // ── Soil Image state ──
  const [soilImage, setSoilImage] = useState(null);
  const [soilPreview, setSoilPreview] = useState(null);
  const [soilResult, setSoilResult] = useState(null);
  const [soilLoading, setSoilLoading] = useState(false);
  const [soilError, setSoilError] = useState('');
  const [soilDragging, setSoilDragging] = useState(false);
  const soilFileRef = useRef();
  const soilCameraDirectRef = useRef();

  // ── Water Image state ──
  const [waterImage, setWaterImage] = useState(null);
  const [waterPreview, setWaterPreview] = useState(null);
  const [waterResult, setWaterResult] = useState(null);
  const [waterLoading, setWaterLoading] = useState(false);
  const [waterError, setWaterError] = useState('');
  const [waterDragging, setWaterDragging] = useState(false);
  const waterFileRef = useRef();
  const waterCameraDirectRef = useRef();

  // ── Camera modal state (shared) ──
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [cameraPermissionError, setCameraPermissionError] = useState(false);
  const [isUsbMode, setIsUsbMode] = useState(false);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedPreview, setCapturedPreview] = useState(null);
  const [cameraTarget, setCameraTarget] = useState('leaf'); // which section camera is for
  const videoRef = useRef(null);

  // ── Boost Your Crop state ──
  const [showBoostSection, setShowBoostSection] = useState(false);
  const [boostLoading, setBoostLoading] = useState(false);

  // ── IoT sensor telemetry (supplementary, not primary) ──
  const [sensorData, setSensorData] = useState(null);
  const [sensorLoading, setSensorLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchLatestSensorData = async () => {
      try {
        setSensorLoading(true);
        const res = await iotAPI.getLatest();
        if (isMounted) {
          if (res.data?.status === 'success' && res.data?.data) {
            setSensorData(res.data.data);
          } else {
            setSensorData(null);
          }
        }
      } catch (err) {
        if (isMounted) setSensorData(null);
      } finally {
        if (isMounted) setSensorLoading(false);
      }
    };

    fetchLatestSensorData();
    const interval = setInterval(fetchLatestSensorData, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // ── Clean language formatting helpers (existing) ──
  const cleanTa = (str) => {
    if (!str) return 'பொருந்தாது';
    let clean = String(str);
    clean = clean.replace(/\s*\([a-zA-Z\s,_\-]+\)/g, '');
    const dict = {
      'Tomato': 'தக்காளி', 'Potato': 'உருளைக்கிழங்கு', 'Rice': 'நெல்',
      'Corn': 'சோளம்', 'Maize': 'சோளம்', 'Apple': 'ஆப்பிள்', 'Grape': 'திராட்சை',
      'Pepper': 'குடைமிளகாய்', 'Bell Pepper': 'குடைமிளகாய்', 'Cotton': 'பருத்தி',
      'Groundnut': 'வேர்க்கடலை', 'Sugarcane': 'கரும்பு', 'Wheat': 'கோதுமை',
      'Other': 'இதர',
      'Early Blight': 'ஆரம்ப கால கருகல் நோய்', 'Late Blight': 'பிற்கால கருகல் நோய்',
      'Bacterial Spot': 'பாக்டீரியா இலைப்புள்ளி நோய்', 'Leaf Mold': 'இலை அச்சு நோய்',
      'Septoria Leaf Spot': 'செப்டோரியா இலைப்புள்ளி நோய்', 'Spider Mites': 'சிலந்தி பூச்சி தாக்குதல்',
      'Target Spot': 'இலக்கு புள்ளி நோய்', 'Yellow Leaf Curl Virus': 'இலை சுருள் நச்சுயிரி',
      'Mosaic Virus': 'மொசைக் நச்சுயிரி', 'Apple Scab': 'ஆப்பிள் சொறி நோய்',
      'Black Rot': 'கருப்பு அழுகல் நோய்', 'Cedar Apple Rust': 'ஆப்பிள் துரு நோய்',
      'Powdery Mildew': 'சாம்பல் நோய்', 'Common Rust': 'துரு நோய்',
      'Northern Leaf Blight': 'வடக்கு இலை கருகல் நோய்', 'Esca': 'கருப்பு அம்மை நோய்',
      'Black Measles': 'கருப்பு அம்மை நோய்', 'Leaf Blight': 'இலை கருகல் நோய்',
      'Citrus Greening': 'சிட்ரஸ் கிரீனிங் நோய்', 'Healthy': 'ஆரோக்கியமானது',
    };
    Object.keys(dict).forEach(key => {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      clean = clean.replace(regex, dict[key]);
    });
    return clean;
  };

  const cleanEn = (str) => {
    if (!str) return 'N/A';
    return String(str).replace(/[\u0B80-\u0BFF]+\s*\(?/g, '').replace(/\)/g, '').trim();
  };

  const formatText = (str) => (lang === 'ta' ? cleanTa(str) : cleanEn(str));

  const handleLangChange = (newLang) => {
    setLang(newLang);
  };

  // ── Camera system (shared across Leaf/Soil/Water) ──
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const requestCameraPermission = async (deviceId = '') => {
    setCameraPermissionError(false);
    setCapturedBlob(null);
    setCapturedPreview(null);
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
    }

    try {
      // Build constraints: prefer rear camera (environment) on mobile, exact device if specified
      let constraints;
      if (deviceId) {
        constraints = { video: { deviceId: { exact: deviceId } } };
      } else {
        constraints = { video: { facingMode: { ideal: 'environment' } } };
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (constraintErr) {
        // Fallback: try any camera if environment-specific request fails
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      setCameraStream(stream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevs = devices.filter(d => d.kind === 'videoinput');
      setCameraDevices(videoDevs);

      if (isUsbMode && !deviceId) {
        const usbDev = videoDevs.find(d =>
          d.label.toLowerCase().includes('usb') ||
          d.label.toLowerCase().includes('external') ||
          d.label.toLowerCase().includes('android') ||
          d.label.toLowerCase().includes('camera2')
        );
        if (usbDev) {
          setSelectedCameraId(usbDev.deviceId);
          stream.getTracks().forEach(t => t.stop());
          const usbStream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: usbDev.deviceId } } });
          setCameraStream(usbStream);
          setCameraActive(true);
          if (videoRef.current) {
            videoRef.current.srcObject = usbStream;
            await videoRef.current.play().catch(() => {});
          }
        } else if (videoDevs.length > 0) {
          setSelectedCameraId(videoDevs[0].deviceId);
        }
      } else if (videoDevs.length > 0 && !deviceId) {
        setSelectedCameraId(videoDevs[0].deviceId);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraPermissionError(true);
    }
  };

  const handleCameraChange = (deviceId) => {
    setSelectedCameraId(deviceId);
    requestCameraPermission(deviceId);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          setCapturedBlob(blob);
          setCapturedPreview(URL.createObjectURL(blob));
          setCameraActive(false);
        }
      }, 'image/jpeg', 0.95);
    }
  };

  const retakePhoto = () => {
    setCapturedBlob(null);
    setCapturedPreview(null);
    setCameraActive(true);
    setTimeout(() => {
      if (videoRef.current && cameraStream) {
        videoRef.current.srcObject = cameraStream;
      }
    }, 100);
  };

  const usePhoto = () => {
    if (capturedBlob) {
      const file = new File([capturedBlob], 'camera_capture.jpg', { type: 'image/jpeg' });
      if (cameraTarget === 'leaf') handleLeafFile(file);
      else if (cameraTarget === 'soil') handleSoilFile(file);
      else if (cameraTarget === 'water') handleWaterFile(file);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
    setCapturedBlob(null);
    setCapturedPreview(null);
    setShowCameraModal(false);
  };

  const openCamera = (target, usb = false) => {
    setCameraTarget(target);
    setIsUsbMode(usb);
    setShowCameraModal(true);
    requestCameraPermission();
  };

  // ── Leaf handlers (preserved from original) ──
  const handleLeafFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError(t.error_invalid_image); return; }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError('');
  };

  const handleLeafDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleLeafFile(e.dataTransfer.files[0]);
  };

  const handleLeafSubmit = async () => {
    if (!image) { setError(t.error_no_image); return; }
    setLoading(true);
    setError('');
    const fd = new FormData();
    fd.append('image', image);
    if (cropName) fd.append('crop_name', cropName);
    try {
      const { data } = await diseaseAPI.predict(fd);
      setResult(data);
      setActiveTab('organic');
      const analysisSnapshot = {
        prediction: {
          id: data.prediction_id,
          disease: data.predicted_disease,
          confidence: data.confidence,
          is_healthy: data.is_healthy,
          crop_name: data.crop_name || cropName,
          timestamp: new Date().toISOString(),
        },
        sensor: sensorData || null,
      };
      localStorage.setItem('last_prediction', JSON.stringify(analysisSnapshot));
    } catch (err) {
      setError(err.response?.data?.error || (lang === 'ta' ? 'கணிப்பு தோல்வியடைந்தது.' : 'Prediction failed.'));
    } finally {
      setLoading(false);
    }
  };

  // ── Soil handlers ──
  const handleSoilFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setSoilError(t.error_invalid_image); return; }
    setSoilImage(file);
    setSoilPreview(URL.createObjectURL(file));
    setSoilResult(null);
    setSoilError('');
  };

  const handleSoilDrop = (e) => {
    e.preventDefault();
    setSoilDragging(false);
    handleSoilFile(e.dataTransfer.files[0]);
  };

  const handleSoilSubmit = async () => {
    if (!soilImage) { setSoilError(t.error_no_image); return; }
    setSoilLoading(true);
    setSoilError('');
    const fd = new FormData();
    fd.append('image', soilImage);
    fd.append('lang', lang);
    try {
      const { data } = await advisorAPI.analyzeSoilImageV2(fd);
      setSoilResult(data);
      localStorage.setItem('last_soil_analysis', JSON.stringify(data));
    } catch (err) {
      const errData = err.response?.data;
      if (err.response?.status === 503) {
        setSoilError(lang === 'ta' ? (errData?.message_ta || t.soil_model_not_ready) : (errData?.message || t.soil_model_not_ready));
      } else {
        setSoilError(errData?.error || (lang === 'ta' ? 'மண் பகுப்பாய்வு தோல்வியடைந்தது.' : 'Soil analysis failed.'));
      }
    } finally {
      setSoilLoading(false);
    }
  };

  // ── Water handlers ──
  const handleWaterFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setWaterError(t.error_invalid_image); return; }
    setWaterImage(file);
    setWaterPreview(URL.createObjectURL(file));
    setWaterResult(null);
    setWaterError('');
  };

  const handleWaterDrop = (e) => {
    e.preventDefault();
    setWaterDragging(false);
    handleWaterFile(e.dataTransfer.files[0]);
  };

  const handleWaterSubmit = async () => {
    if (!waterImage) { setWaterError(t.error_no_image); return; }
    setWaterLoading(true);
    setWaterError('');
    const fd = new FormData();
    fd.append('image', waterImage);
    try {
      const { data } = await advisorAPI.analyzeWaterImage(fd);
      setWaterResult(data);
      localStorage.setItem('last_water_analysis', JSON.stringify(data));
    } catch (err) {
      setWaterError(err.response?.data?.error || (lang === 'ta' ? 'நீர் பகுப்பாய்வு தோல்வியடைந்தது.' : 'Water analysis failed.'));
    } finally {
      setWaterLoading(false);
    }
  };

  // ── Boost Your Crop Handler ──
  const handleBoostYourCrop = async () => {
    setBoostLoading(true);
    // If leaf image attached but not predicted yet, trigger prediction
    if (image && !result) {
      try {
        const fd = new FormData();
        fd.append('image', image);
        if (cropName) fd.append('crop_name', cropName);
        const { data } = await diseaseAPI.predict(fd);
        setResult(data);
        setActiveTab('organic');
      } catch (err) {
        setError(err.response?.data?.error || (lang === 'ta' ? 'இலை நோய் கணிப்பு தோல்வியடைந்தது.' : 'Leaf prediction failed.'));
      }
    }
    setShowBoostSection(true);
    setBoostLoading(false);
    setTimeout(() => {
      const el = document.getElementById('boost-your-crop-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  // ── Derived values ──
  const conf = result?.confidence_info;
  const confCfg = conf ? (CONFIDENCE_CONFIG[conf.key] || CONFIDENCE_CONFIG.moderate) : null;
  const di = result?.disease_info;
  const sevCfg = di ? (SEVERITY_CONFIG[di.severity] || SEVERITY_CONFIG.Medium) : null;

  // ── Section tab configs ──
  const sectionTabs = [
    { key: 'leaf', label: t.tab_leaf, color: '#4caf50', hasResult: !!result },
    { key: 'soil', label: t.tab_soil, color: '#8d6e63', hasResult: !!soilResult },
    { key: 'water', label: t.tab_water, color: '#29b6f6', hasResult: !!waterResult },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0d1f0d', padding: '5rem 0 2rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1rem' }}>

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.5rem, 4vw, 2.1rem)', fontWeight: 800, color: '#7dd56f', margin: 0 }}>
              {t.analyzer_title}
            </h1>
            <p style={{ color: '#81c784', marginTop: '.4rem', margin: 0, fontSize: '0.9rem' }}>
              {t.analyzer_subtitle}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(0,0,0,0.3)', padding: '0.25rem', borderRadius: 8, border: '1px solid #2d5a27' }}>
            <button onClick={() => handleLangChange('ta')} style={{
              background: lang === 'ta' ? '#4caf50' : 'transparent',
              color: lang === 'ta' ? '#fff' : '#a5d6a7',
              border: 'none', borderRadius: 6, padding: '0.4rem 0.8rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem'
            }}>தமிழ்</button>
            <button onClick={() => handleLangChange('en')} style={{
              background: lang === 'en' ? '#4caf50' : 'transparent',
              color: lang === 'en' ? '#fff' : '#a5d6a7',
              border: 'none', borderRadius: 6, padding: '0.4rem 0.8rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem'
            }}>English</button>
          </div>
        </div>

        {/* ── MAIN LAYOUT: Tabs + Content ── */}
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }} className="analyzer-main-layout">

          {/* ── LEFT SIDEBAR TABS (desktop) ── */}
          <div className="analyzer-sidebar" style={{
            display: 'flex', flexDirection: 'column', gap: '0.5rem',
            minWidth: 160, position: 'sticky', top: '80px',
          }}>
            {sectionTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                style={{
                  background: activeSection === tab.key
                    ? `linear-gradient(135deg, ${tab.color}, ${tab.color}cc)`
                    : 'rgba(29,52,29,0.85)',
                  color: activeSection === tab.key ? '#fff' : '#c8e6c9',
                  border: activeSection === tab.key ? `2px solid ${tab.color}` : '1px solid #2d5a27',
                  borderRadius: 14, padding: '1rem 1.25rem',
                  fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
                  textAlign: 'left', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  boxShadow: activeSection === tab.key ? `0 4px 15px ${tab.color}44` : 'none',
                }}
              >
                <span>{tab.label}</span>
                {tab.hasResult && <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.2)', padding: '0.15rem 0.4rem', borderRadius: 6 }}>✓</span>}
              </button>
            ))}
          </div>

          {/* ── MOBILE HORIZONTAL TABS ── */}
          <div className="analyzer-mobile-tabs" style={{ display: 'none' }}>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              {sectionTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveSection(tab.key)}
                  style={{
                    background: activeSection === tab.key
                      ? `linear-gradient(135deg, ${tab.color}, ${tab.color}cc)`
                      : 'rgba(29,52,29,0.85)',
                    color: activeSection === tab.key ? '#fff' : '#c8e6c9',
                    border: activeSection === tab.key ? `2px solid ${tab.color}` : '1px solid #2d5a27',
                    borderRadius: 12, padding: '0.7rem 1.2rem',
                    fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                    whiteSpace: 'nowrap', flex: '1 1 0',
                    transition: 'all 0.2s', minWidth: 0,
                  }}
                >
                  {tab.label} {tab.hasResult ? '✓' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* ── RIGHT CONTENT AREA ── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* ═══════════════ LEAF SECTION ═══════════════ */}
            {activeSection === 'leaf' && (
              <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 20, padding: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
                <h2 style={{ color: '#7dd56f', fontSize: '1.2rem', marginTop: 0, marginBottom: '1rem', borderBottom: '1px solid #2d5a27', paddingBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>
                  {t.predict_card_title}
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
                  {/* Drop Zone */}
                  <div>
                    <div
                      onClick={() => fileRef.current.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={handleLeafDrop}
                      style={{
                        border: `2px dashed ${dragging ? '#7dd56f' : '#2d5a27'}`,
                        borderRadius: 12, padding: '1.25rem', textAlign: 'center',
                        cursor: 'pointer', transition: 'all .2s',
                        background: dragging ? 'rgba(76,175,80,0.08)' : 'rgba(0,0,0,0.2)',
                        marginBottom: '0.75rem',
                      }}
                    >
                      {preview ? (
                        <div>
                          <img src={preview} alt="Preview" style={{ maxHeight: 180, maxWidth: '100%', borderRadius: 8, objectFit: 'contain', display: 'block', margin: '0 auto' }} />
                          <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                            <button type="button" onClick={(e) => { e.stopPropagation(); setImage(null); setPreview(null); setResult(null); }}
                              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #81c784', color: '#c8e6c9', borderRadius: 6, padding: '0.25rem 0.6rem', fontSize: '0.78rem', cursor: 'pointer' }}
                            >{t.retake_clear}</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ fontSize: '2.5rem', marginBottom: '.4rem' }}>🌿</div>
                          <p style={{ color: '#a5d6a7', margin: 0, fontSize: '0.86rem' }}>{t.drag_hint}</p>
                        </>
                      )}
                    </div>

                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => handleLeafFile(e.target.files[0])} />
                    <input ref={cameraDirectRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => handleLeafFile(e.target.files[0])} />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.4rem', marginBottom: '0.75rem' }}>
                      <button type="button" onClick={() => cameraDirectRef.current?.click()}
                        style={{ background: 'linear-gradient(135deg, #2e7d32, #43a047)', border: 'none', borderRadius: 8, padding: '.6rem .4rem', color: '#fff', fontWeight: 800, fontSize: '.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.3rem' }}
                      ><span>📷</span><span>{t.take_leaf_photo}</span></button>
                      <button type="button" onClick={() => fileRef.current?.click()}
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid #388e3c', borderRadius: 8, padding: '.6rem .4rem', color: '#c8e6c9', fontWeight: 700, fontSize: '.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.3rem' }}
                      ><span>🖼️</span><span>{t.from_gallery}</span></button>
                    </div>

                    <div style={{ marginBottom: '0.75rem' }}>
                      <label style={{ color: '#a5d6a7', fontSize: '.78rem', fontWeight: 600, display: 'block', marginBottom: '.3rem' }}>
                        {t.select_crop}
                      </label>
                      <select value={cropName} onChange={(e) => setCropName(e.target.value)}
                        style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid #2d5a27', borderRadius: 8, padding: '.5rem 0.7rem', color: '#e8f5e9', fontSize: '.83rem' }}
                      >
                        <option value="">{t.auto_detect}</option>
                        <option value="Tomato">{formatText("Tomato")}</option>
                        <option value="Potato">{formatText("Potato")}</option>
                        <option value="Rice">{formatText("Rice")}</option>
                        <option value="Corn">{formatText("Corn (maize)")}</option>
                        <option value="Apple">{formatText("Apple")}</option>
                        <option value="Grape">{formatText("Grape")}</option>
                        <option value="Pepper">{formatText("Pepper, bell")}</option>
                        <option value="Cotton">{formatText("Cotton")}</option>
                        <option value="Groundnut">{formatText("Groundnut")}</option>
                        <option value="Sugarcane">{formatText("Sugarcane")}</option>
                        <option value="Other">{formatText("Other")}</option>
                      </select>
                    </div>

                    {error && (
                      <div style={{ background: 'rgba(244,67,54,0.12)', border: '1px solid #f44336', borderRadius: 8, padding: '.5rem .7rem', color: '#ef9a9a', marginBottom: '0.75rem', fontSize: '.8rem' }}>
                        ⚠️ {error}
                      </div>
                    )}

                    <button onClick={handleLeafSubmit} disabled={loading || !image}
                      style={{
                        width: '100%', background: loading || !image ? '#3a5a3a' : 'linear-gradient(135deg, #4caf50, #2e7d32)',
                        color: '#fff', border: 'none', borderRadius: 8, padding: '.7rem', fontWeight: 700, fontSize: '.9rem',
                        cursor: loading || !image ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(76,175,80,0.2)'
                      }}
                    >
                      {loading ? t.analyzing_leaf : t.btn_predict}
                    </button>
                  </div>

                  {/* Leaf Result */}
                  <div>
                    {result ? (
                      <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #2d5a27', borderRadius: 14, padding: '1.1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.75rem' }}>
                          <div>
                            <div style={{ color: '#66bb6a', fontSize: '.72rem', fontWeight: 700, letterSpacing: 1 }}>{t.detect_lbl.toUpperCase()}</div>
                            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 800, color: result.is_healthy ? '#7dd56f' : '#ff8a65', margin: '0.2rem 0' }}>
                              {result.is_healthy ? '✅ ' : '🦠 '}{formatText(result.predicted_disease)}
                            </h3>
                            {di && (
                              <span style={{ display: 'inline-block', background: sevCfg.color + '22', border: `1px solid ${sevCfg.color}`, color: sevCfg.color, borderRadius: 20, padding: '.12rem .5rem', fontSize: '.72rem', fontWeight: 700 }}>
                                {lang === 'ta' ? sevCfg.label_ta : sevCfg.label_en}
                              </span>
                            )}
                          </div>
                          <div style={{ textAlign: 'center', minWidth: 80 }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: confCfg?.color }}>{conf?.percent}%</div>
                            <div style={{ color: confCfg?.color, fontSize: '.72rem', fontWeight: 600 }}>{confCfg?.icon} {t.confidence_lbl}</div>
                          </div>
                        </div>

                        {/* LEAF SOLUTION Panel */}
                        <div style={{ borderTop: '1px solid #2d5a27', paddingTop: '0.75rem', marginTop: '0.4rem' }}>
                          <div style={{ color: '#7dd56f', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <span>💊</span><span>{t.treatment_lbl}</span>
                          </div>

                          {result.is_healthy ? (
                            <div style={{ background: 'rgba(76,175,80,0.1)', border: '1px solid #4caf50', borderRadius: 10, padding: '0.75rem', color: '#c8e6c9', fontSize: '0.85rem' }}>
                              🌱 <strong>{t.healthy_msg}</strong> {t.healthy_desc}
                            </div>
                          ) : (
                            di && (
                              <div>
                                <div style={{ display: 'flex', gap: '.35rem', marginBottom: '.6rem', flexWrap: 'wrap' }}>
                                  {['organic', 'chemical', 'prevention'].map((tab) => (
                                    <button key={tab} onClick={() => setActiveTab(tab)}
                                      style={{
                                        background: activeTab === tab ? 'linear-gradient(135deg, #4caf50, #2e7d32)' : 'rgba(0,0,0,0.4)',
                                        color: activeTab === tab ? '#fff' : '#a5d6a7',
                                        border: '1px solid #2d5a27', borderRadius: 6,
                                        padding: '.3rem .65rem', fontWeight: 600, cursor: 'pointer', fontSize: '.76rem',
                                      }}
                                    >{tab === 'organic' ? t.organic_tab : tab === 'chemical' ? t.chemical_tab : t.prevention_tab}</button>
                                  ))}
                                </div>

                                {activeTab === 'organic' && (
                                  <TreatmentPanel title={t.treatment_lbl} dosage_lbl={t.dosage_lbl} instr_lbl={t.instructions_lbl}
                                    treatment={formatText(di.organic_treatment)} dosage={formatText(di.organic_dosage)} instructions={formatText(di.organic_instructions)}
                                    color="#4caf50" icon="🌿" />
                                )}
                                {activeTab === 'chemical' && (
                                  <>
                                    <TreatmentPanel title={t.treatment_lbl} dosage_lbl={t.dosage_lbl} instr_lbl={t.instructions_lbl}
                                      treatment={formatText(di.chemical_treatment)} dosage={formatText(di.chemical_dosage)} instructions={formatText(di.chemical_instructions)}
                                      color="#ff9800" icon="🧪" />
                                    <div style={{ background: 'rgba(255,152,0,0.08)', border: '1px solid #ff9800', borderRadius: 8, padding: '.4rem .65rem', marginTop: '.4rem', color: '#ffcc80', fontSize: '.75rem' }}>
                                      {t.alert_chemical_msg}
                                    </div>
                                  </>
                                )}
                                {activeTab === 'prevention' && (
                                  <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid #2d5a27', borderRadius: 10, padding: '.75rem' }}>
                                    <Section title={t.prevention_tab} content={formatText(di.prevention)} />
                                    {di.farming_tips && <Section title={t.tips_lbl} content={formatText(di.farming_tips)} />}
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>

                        {/* Integrated Soil & Leaf Solution Panel */}
                        <div style={{ borderTop: '1px solid #5d4037', paddingTop: '0.85rem', marginTop: '0.85rem', background: 'rgba(93,64,55,0.15)', borderRadius: 12, padding: '0.85rem' }}>
                          <div style={{ color: '#d7ccc8', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span>🪨</span>
                            <span>{lang === 'ta' ? 'மண் மற்றும் இலை நோய் ஒருங்கிணைந்த தீர்வு' : 'Soil & Leaf Health Comprehensive Solution'}</span>
                          </div>
                          
                          <div style={{ color: '#ffcc80', fontSize: '0.83rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.5 }}>
                            ⚠️ {lang === 'ta' 
                              ? 'உங்கள் இலையில் காணப்படும் நோய்கள் உங்கள் மண்ணின் சத்து மற்றும் வடிகால் குறைபாடுகளாலும் ஏற்பட வாய்ப்புள்ளது. எனவே முதலில் உங்கள் மண்ணின் ஆரோக்கியத்தை அதிகரிக்க வேண்டும்.' 
                              : 'Your leaf problems are directly influenced by soil health and nutrient balance. First improve your soil condition to eliminate root stress and boost leaf immunity.'}
                          </div>

                          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '0.75rem', fontSize: '0.82rem', color: '#c8e6c9', lineHeight: 1.6 }}>
                            <div style={{ marginBottom: '0.4rem' }}>
                              <strong>1. 🌿 {lang === 'ta' ? 'மண் ஆரோக்கியத்தை அதிகரித்தல்:' : 'Increase Soil Organic Health:'}</strong>
                              <div>{lang === 'ta' ? 'செடியின் அடியில் 5-10 கிலோ மண்புழு உரம் அல்லது தொழுவுரம் இட்டு மண் வளத்தை பெருக்கவும்.' : 'Apply 5-10 kg well-decomposed vermicompost or FYM per plant to enrich organic carbon.'}</div>
                            </div>
                            <div style={{ marginBottom: '0.4rem' }}>
                              <strong>2. 🧪 {lang === 'ta' ? 'மண் pH மற்றும் சத்து சமநிலை:' : 'pH & Micronutrient Balance:'}</strong>
                              <div>{lang === 'ta' ? 'மண்ணின் pH அளவை 6.0 - 7.0 க்குள் பராமரிக்கவும். வேர் வளர்ச்சிக்கு மணிச்சத்தை (Phosphorus) சரியாக அளிக்கவும்.' : 'Maintain soil pH between 6.0 - 7.0. Apply solubor or zinc sulphate if leaves show interveinal chlorosis.'}</div>
                            </div>
                            <div>
                              <strong>3. 💧 {lang === 'ta' ? 'நீர் வடிகால் வசதி:' : 'Soil Drainage & Moisture:'}</strong>
                              <div>{lang === 'ta' ? 'வேர் அழுகல் மற்றும் பூஞ்சை தொற்றை தடுக்க வயலில் அதிகப்படியான நீர் தேங்காமல் வடிகால் வசதி செய்யவும்.' : 'Ensure field furrows and root drainage channels are clear to prevent waterlogging and fungal sporation.'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px dashed #2d5a27', borderRadius: 14, padding: '2rem', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🍂</div>
                        <p style={{ color: '#81c784', margin: 0, fontSize: '0.88rem' }}>{t.leaf_placeholder}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════ SOIL SECTION ═══════════════ */}
            {activeSection === 'soil' && (
              <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #5d4037', borderRadius: 20, padding: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
                <h2 style={{ color: '#d7ccc8', fontSize: '1.2rem', marginTop: 0, marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>
                  {t.soil_title}
                </h2>
                <p style={{ color: '#a1887f', fontSize: '0.85rem', margin: '0 0 1rem', borderBottom: '1px solid #5d4037', paddingBottom: '0.75rem' }}>
                  {t.soil_subtitle}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
                  {/* Soil Upload */}
                  <div>
                    <div
                      onClick={() => soilFileRef.current.click()}
                      onDragOver={(e) => { e.preventDefault(); setSoilDragging(true); }}
                      onDragLeave={() => setSoilDragging(false)}
                      onDrop={handleSoilDrop}
                      style={{
                        border: `2px dashed ${soilDragging ? '#8d6e63' : '#5d4037'}`,
                        borderRadius: 12, padding: '1.25rem', textAlign: 'center',
                        cursor: 'pointer', transition: 'all .2s',
                        background: soilDragging ? 'rgba(141,110,99,0.12)' : 'rgba(0,0,0,0.2)',
                        marginBottom: '0.75rem',
                      }}
                    >
                      {soilPreview ? (
                        <div>
                          <img src={soilPreview} alt="Soil Preview" style={{ maxHeight: 180, maxWidth: '100%', borderRadius: 8, objectFit: 'contain', display: 'block', margin: '0 auto' }} />
                          <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                            <button type="button" onClick={(e) => { e.stopPropagation(); setSoilImage(null); setSoilPreview(null); setSoilResult(null); }}
                              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #8d6e63', color: '#d7ccc8', borderRadius: 6, padding: '0.25rem 0.6rem', fontSize: '0.78rem', cursor: 'pointer' }}
                            >{t.retake_clear}</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ fontSize: '2.5rem', marginBottom: '.4rem' }}>🟫</div>
                          <p style={{ color: '#a1887f', margin: 0, fontSize: '0.86rem' }}>{t.soil_drag_hint}</p>
                        </>
                      )}
                    </div>

                    <input ref={soilFileRef} type="file" accept="image/*" hidden onChange={(e) => handleSoilFile(e.target.files[0])} />
                    <input ref={soilCameraDirectRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => handleSoilFile(e.target.files[0])} />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.4rem', marginBottom: '0.75rem' }}>
                      <button type="button" onClick={() => soilCameraDirectRef.current?.click()}
                        style={{ background: 'linear-gradient(135deg, #5d4037, #795548)', border: 'none', borderRadius: 8, padding: '.6rem .4rem', color: '#fff', fontWeight: 800, fontSize: '.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.3rem' }}
                      ><span>📷</span><span>{t.take_soil_photo}</span></button>
                      <button type="button" onClick={() => soilFileRef.current?.click()}
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid #5d4037', borderRadius: 8, padding: '.6rem .4rem', color: '#d7ccc8', fontWeight: 700, fontSize: '.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.3rem' }}
                      ><span>🖼️</span><span>{t.from_gallery}</span></button>
                    </div>

                    {soilError && (
                      <div style={{ background: 'rgba(244,67,54,0.12)', border: '1px solid #f44336', borderRadius: 8, padding: '.5rem .7rem', color: '#ef9a9a', marginBottom: '0.75rem', fontSize: '.8rem' }}>
                        ⚠️ {soilError}
                        <button onClick={handleSoilSubmit} style={{ marginLeft: '0.5rem', background: 'rgba(255,255,255,0.1)', border: '1px solid #ef9a9a', color: '#ef9a9a', borderRadius: 4, padding: '0.15rem 0.4rem', fontSize: '0.72rem', cursor: 'pointer' }}>
                          {t.retry_lbl}
                        </button>
                      </div>
                    )}

                    <button onClick={handleSoilSubmit} disabled={soilLoading || !soilImage}
                      style={{
                        width: '100%', background: soilLoading || !soilImage ? '#3a3a3a' : 'linear-gradient(135deg, #795548, #5d4037)',
                        color: '#fff', border: 'none', borderRadius: 8, padding: '.7rem', fontWeight: 700, fontSize: '.9rem',
                        cursor: soilLoading || !soilImage ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(93,64,55,0.3)'
                      }}
                    >
                      {soilLoading ? t.analyzing_soil : t.btn_analyze_soil}
                    </button>
                  </div>

                  {/* Soil Result */}
                  <div>
                    {soilResult ? (
                      <div style={{ background: 'rgba(93,64,55,0.2)', border: '1px solid #8d6e63', borderRadius: 14, padding: '1.1rem' }}>
                        {/* Predicted Class */}
                        <div style={{ marginBottom: '0.75rem' }}>
                          <div style={{ color: '#a1887f', fontSize: '.72rem', fontWeight: 700, letterSpacing: 1 }}>{t.soil_class_lbl.toUpperCase()}</div>
                          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem', fontWeight: 800, color: '#d7ccc8', margin: '0.2rem 0' }}>
                            🟫 {soilResult.ai_soil_class}
                          </h3>
                          {soilResult.confidence_percent && (
                            <span style={{ display: 'inline-block', background: 'rgba(141,110,99,0.3)', border: '1px solid #8d6e63', color: '#bcaaa4', borderRadius: 20, padding: '.12rem .6rem', fontSize: '.75rem', fontWeight: 700 }}>
                              {t.confidence_lbl}: {soilResult.confidence_percent}%
                            </span>
                          )}
                        </div>

                        {/* Top 3 predictions */}
                        {soilResult.top_predictions?.length > 0 && (
                          <div style={{ marginBottom: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '0.6rem' }}>
                            <div style={{ color: '#a1887f', fontSize: '.72rem', fontWeight: 700, marginBottom: '0.3rem' }}>{t.top_predictions_lbl}</div>
                            {soilResult.top_predictions.map((p, i) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: i === 0 ? '#d7ccc8' : '#8d6e63', fontSize: '0.8rem', padding: '0.15rem 0' }}>
                                <span>{i + 1}. {p.class}</span>
                                <span>{p.confidence}%</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Condition */}
                        {soilResult.soil_condition && (
                          <div style={{ marginBottom: '0.6rem' }}>
                            <div style={{ color: '#a1887f', fontSize: '.72rem', fontWeight: 700 }}>{t.soil_condition_lbl}</div>
                            <p style={{ color: '#d7ccc8', fontSize: '.85rem', margin: '0.2rem 0', lineHeight: 1.5 }}>{soilResult.soil_condition}</p>
                          </div>
                        )}

                        {/* Problem */}
                        {soilResult.possible_problem && (
                          <div style={{ marginBottom: '0.6rem', background: 'rgba(255,152,0,0.08)', padding: '0.5rem 0.7rem', borderRadius: 8 }}>
                            <div style={{ color: '#ffb74d', fontSize: '.72rem', fontWeight: 700 }}>⚠️ {t.soil_problem_lbl}</div>
                            <p style={{ color: '#ffe0b2', fontSize: '.83rem', margin: '0.2rem 0', lineHeight: 1.5 }}>{soilResult.possible_problem}</p>
                          </div>
                        )}

                        {/* Improvement */}
                        {soilResult.improvement && (
                          <div style={{ marginBottom: '0.6rem' }}>
                            <div style={{ color: '#81c784', fontSize: '.72rem', fontWeight: 700 }}>🔧 {t.soil_improvement_lbl}</div>
                            <p style={{ color: '#c8e6c9', fontSize: '.83rem', margin: '0.2rem 0', lineHeight: 1.5 }}>{soilResult.improvement}</p>
                          </div>
                        )}

                        {/* Organic Methods */}
                        {soilResult.organic_methods && (
                          <div style={{ marginBottom: '0.6rem' }}>
                            <div style={{ color: '#81c784', fontSize: '.72rem', fontWeight: 700 }}>{t.soil_organic_lbl}</div>
                            <p style={{ color: '#c8e6c9', fontSize: '.83rem', margin: '0.2rem 0', lineHeight: 1.5 }}>{soilResult.organic_methods}</p>
                          </div>
                        )}

                        {/* Recommended Crops */}
                        {soilResult.recommended_crops && (
                          <div style={{ marginBottom: '0.6rem' }}>
                            <div style={{ color: '#a5d6a7', fontSize: '.72rem', fontWeight: 700 }}>{t.soil_crops_lbl}</div>
                            <p style={{ color: '#c8e6c9', fontSize: '.83rem', margin: '0.2rem 0', lineHeight: 1.5 }}>{soilResult.recommended_crops}</p>
                          </div>
                        )}

                        {/* Complete Soil Solution Panel */}
                        {(soilResult.improvement || soilResult.organic_methods) && (
                          <div style={{ background: 'linear-gradient(135deg, rgba(46,125,50,0.2), rgba(93,64,55,0.15))', border: '1.5px solid #4caf50', borderRadius: 10, padding: '0.85rem', marginTop: '0.5rem' }}>
                            <div style={{ color: '#7dd56f', fontWeight: 800, fontSize: '0.82rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <span>🌱</span>
                              <span>{lang === 'ta' ? 'முழுமையான மண் தீர்வு' : 'Complete Soil Solution'}</span>
                            </div>
                            <ol style={{ margin: 0, paddingLeft: '1.1rem', color: '#c8e6c9', fontSize: '0.8rem', lineHeight: 1.7 }}>
                              {soilResult.improvement && (
                                <li><strong style={{ color: '#81c784' }}>{lang === 'ta' ? 'மண் மேம்பாடு:' : 'Step 1 — Soil Improvement:'}</strong> {soilResult.improvement}</li>
                              )}
                              {soilResult.organic_methods && (
                                <li><strong style={{ color: '#81c784' }}>{lang === 'ta' ? 'இயற்கை முறை:' : 'Step 2 — Organic Methods:'}</strong> {soilResult.organic_methods}</li>
                              )}
                              {soilResult.recommended_crops && (
                                <li><strong style={{ color: '#81c784' }}>{lang === 'ta' ? 'பரிந்துரைக்கப்படும் பயிர்கள்:' : 'Step 3 — Grow Suitable Crops:'}</strong> {soilResult.recommended_crops}</li>
                              )}
                              <li><strong style={{ color: '#81c784' }}>{lang === 'ta' ? 'கடைசி படி:' : 'Step 4 — Monitor & Test:'}</strong> {lang === 'ta' ? 'மண் மேம்படுத்திய பிறகு 4-6 வாரங்களில் மண் பரிசோதனை செய்யவும்.' : 'After improvement, test soil again in 4–6 weeks to track progress.'}</li>
                            </ol>
                          </div>
                        )}

                        {/* Lab note */}
                        <div style={{ background: 'rgba(255,152,0,0.06)', border: '1px solid #5d4037', borderRadius: 8, padding: '0.5rem 0.7rem', marginTop: '0.5rem', color: '#a1887f', fontSize: '.75rem' }}>
                          ℹ️ {t.soil_lab_note}
                          <br />
                          <span style={{ color: '#8d6e63' }}>pH: {t.data_unavailable} | NPK: {t.data_unavailable} | EC: {t.data_unavailable} | TDS: {t.data_unavailable}</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: 'rgba(93,64,55,0.15)', border: '1px dashed #5d4037', borderRadius: 14, padding: '2rem', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏔️</div>
                        <p style={{ color: '#a1887f', margin: 0, fontSize: '0.88rem' }}>{t.soil_placeholder}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════ WATER SECTION ═══════════════ */}
            {activeSection === 'water' && (
              <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #01579b', borderRadius: 20, padding: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
                <h2 style={{ color: '#81d4fa', fontSize: '1.2rem', marginTop: 0, marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>
                  {t.water_title}
                </h2>
                <p style={{ color: '#4fc3f7', fontSize: '0.85rem', margin: '0 0 1rem', borderBottom: '1px solid #01579b', paddingBottom: '0.75rem' }}>
                  {t.water_subtitle}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
                  {/* Water Upload */}
                  <div>
                    <div
                      onClick={() => waterFileRef.current.click()}
                      onDragOver={(e) => { e.preventDefault(); setWaterDragging(true); }}
                      onDragLeave={() => setWaterDragging(false)}
                      onDrop={handleWaterDrop}
                      style={{
                        border: `2px dashed ${waterDragging ? '#29b6f6' : '#01579b'}`,
                        borderRadius: 12, padding: '1.25rem', textAlign: 'center',
                        cursor: 'pointer', transition: 'all .2s',
                        background: waterDragging ? 'rgba(41,182,246,0.08)' : 'rgba(0,0,0,0.2)',
                        marginBottom: '0.75rem',
                      }}
                    >
                      {waterPreview ? (
                        <div>
                          <img src={waterPreview} alt="Water Preview" style={{ maxHeight: 180, maxWidth: '100%', borderRadius: 8, objectFit: 'contain', display: 'block', margin: '0 auto' }} />
                          <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                            <button type="button" onClick={(e) => { e.stopPropagation(); setWaterImage(null); setWaterPreview(null); setWaterResult(null); }}
                              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #29b6f6', color: '#b3e5fc', borderRadius: 6, padding: '0.25rem 0.6rem', fontSize: '0.78rem', cursor: 'pointer' }}
                            >{t.retake_clear}</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ fontSize: '2.5rem', marginBottom: '.4rem' }}>💧</div>
                          <p style={{ color: '#4fc3f7', margin: 0, fontSize: '0.86rem' }}>{t.water_drag_hint}</p>
                        </>
                      )}
                    </div>

                    <input ref={waterFileRef} type="file" accept="image/*" hidden onChange={(e) => handleWaterFile(e.target.files[0])} />
                    <input ref={waterCameraDirectRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => handleWaterFile(e.target.files[0])} />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.4rem', marginBottom: '0.75rem' }}>
                      <button type="button" onClick={() => waterCameraDirectRef.current?.click()}
                        style={{ background: 'linear-gradient(135deg, #01579b, #0288d1)', border: 'none', borderRadius: 8, padding: '.6rem .4rem', color: '#fff', fontWeight: 800, fontSize: '.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.3rem' }}
                      ><span>📷</span><span>{t.take_water_photo}</span></button>
                      <button type="button" onClick={() => waterFileRef.current?.click()}
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid #01579b', borderRadius: 8, padding: '.6rem .4rem', color: '#b3e5fc', fontWeight: 700, fontSize: '.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.3rem' }}
                      ><span>🖼️</span><span>{t.from_gallery}</span></button>
                    </div>

                    {waterError && (
                      <div style={{ background: 'rgba(244,67,54,0.12)', border: '1px solid #f44336', borderRadius: 8, padding: '.5rem .7rem', color: '#ef9a9a', marginBottom: '0.75rem', fontSize: '.8rem' }}>
                        ⚠️ {waterError}
                        <button onClick={handleWaterSubmit} style={{ marginLeft: '0.5rem', background: 'rgba(255,255,255,0.1)', border: '1px solid #ef9a9a', color: '#ef9a9a', borderRadius: 4, padding: '0.15rem 0.4rem', fontSize: '0.72rem', cursor: 'pointer' }}>
                          {t.retry_lbl}
                        </button>
                      </div>
                    )}

                    <button onClick={handleWaterSubmit} disabled={waterLoading || !waterImage}
                      style={{
                        width: '100%', background: waterLoading || !waterImage ? '#2a3a4a' : 'linear-gradient(135deg, #0277bd, #01579b)',
                        color: '#fff', border: 'none', borderRadius: 8, padding: '.7rem', fontWeight: 700, fontSize: '.9rem',
                        cursor: waterLoading || !waterImage ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(2,119,189,0.3)'
                      }}
                    >
                      {waterLoading ? t.analyzing_water : t.btn_analyze_water}
                    </button>
                  </div>

                  {/* Water Result */}
                  <div>
                    {waterResult ? (
                      <div style={{ background: 'rgba(2,119,189,0.15)', border: '1px solid #0288d1', borderRadius: 14, padding: '1.1rem' }}>
                        {/* Status */}
                        <div style={{ marginBottom: '0.75rem' }}>
                          <div style={{ color: '#4fc3f7', fontSize: '.72rem', fontWeight: 700, letterSpacing: 1 }}>{t.water_status_lbl.toUpperCase()}</div>
                          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 800, color: '#b3e5fc', margin: '0.2rem 0' }}>
                            💧 {waterResult.water_status || waterResult.field_water_availability}
                          </h3>
                        </div>

                        {/* Condition */}
                        {waterResult.water_condition && (
                          <div style={{ marginBottom: '0.6rem' }}>
                            <div style={{ color: '#4fc3f7', fontSize: '.72rem', fontWeight: 700 }}>{t.water_condition_lbl}</div>
                            <p style={{ color: '#b3e5fc', fontSize: '.85rem', margin: '0.2rem 0' }}>{waterResult.water_condition}</p>
                          </div>
                        )}

                        {/* Color observed */}
                        {waterResult.color_observed && (
                          <div style={{ marginBottom: '0.6rem' }}>
                            <div style={{ color: '#4fc3f7', fontSize: '.72rem', fontWeight: 700 }}>{t.water_color_lbl}</div>
                            <p style={{ color: '#b3e5fc', fontSize: '.85rem', margin: '0.2rem 0' }}>{waterResult.color_observed}</p>
                          </div>
                        )}

                        {/* Suitability */}
                        {waterResult.suitability && (
                          <div style={{ marginBottom: '0.6rem' }}>
                            <div style={{ color: '#4fc3f7', fontSize: '.72rem', fontWeight: 700 }}>{t.water_suitability_lbl}</div>
                            <p style={{ color: '#e1f5fe', fontSize: '.85rem', margin: '0.2rem 0', fontWeight: 600 }}>{waterResult.suitability}</p>
                          </div>
                        )}

                        {/* Observations */}
                        {waterResult.observations?.length > 0 && (
                          <div style={{ marginBottom: '0.6rem' }}>
                            <div style={{ color: '#4fc3f7', fontSize: '.72rem', fontWeight: 700 }}>{t.water_observations_lbl}</div>
                            <ul style={{ margin: '0.2rem 0', paddingLeft: '1.2rem', color: '#b3e5fc', fontSize: '.83rem', lineHeight: 1.5 }}>
                              {waterResult.observations.map((o, i) => <li key={i}>{o}</li>)}
                            </ul>
                          </div>
                        )}

                        {/* Recommendations */}
                        {waterResult.recommendations?.length > 0 && (
                          <div style={{ marginBottom: '0.6rem', background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '0.6rem' }}>
                            <div style={{ color: '#81d4fa', fontSize: '.72rem', fontWeight: 700, marginBottom: '0.2rem' }}>{t.water_recommendations_lbl}</div>
                            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#b3e5fc', fontSize: '.83rem', lineHeight: 1.5 }}>
                              {waterResult.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                          </div>
                        )}

                        {/* Risks */}
                        {waterResult.risks?.length > 0 && (
                          <div style={{ marginBottom: '0.5rem' }}>
                            <div style={{ color: '#ffb74d', fontSize: '.72rem', fontWeight: 700 }}>{t.water_risks_lbl}</div>
                            <ul style={{ margin: '0.2rem 0', paddingLeft: '1.2rem', color: '#ffe0b2', fontSize: '.83rem', lineHeight: 1.5 }}>
                              {waterResult.risks.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                          </div>
                        )}

                        {/* Lab note */}
                        <div style={{ background: 'rgba(2,119,189,0.1)', border: '1px solid #01579b', borderRadius: 8, padding: '0.5rem 0.7rem', marginTop: '0.5rem', color: '#4fc3f7', fontSize: '.75rem' }}>
                          ℹ️ {t.water_lab_note}
                          <br />
                          <span style={{ color: '#0288d1' }}>pH: {t.data_unavailable} | TDS: {t.data_unavailable} | EC: {t.data_unavailable}</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: 'rgba(2,119,189,0.1)', border: '1px dashed #01579b', borderRadius: 14, padding: '2rem', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌊</div>
                        <p style={{ color: '#4fc3f7', margin: 0, fontSize: '0.88rem' }}>{t.water_placeholder}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── BOOST YOUR CROP BUTTON ── */}
        <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={handleBoostYourCrop}
            disabled={boostLoading}
            style={{
              width: '100%', background: 'linear-gradient(135deg, #2e7d32, #1b5e20)',
              color: '#ffffff', border: '2px solid #7dd56f', borderRadius: 16,
              padding: '1rem 1.5rem', fontSize: 'clamp(0.95rem, 3vw, 1.15rem)', fontWeight: 800,
              fontFamily: 'Outfit, sans-serif', cursor: boostLoading ? 'wait' : 'pointer',
              boxShadow: '0 8px 25px rgba(46,125,50,0.4)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s ease-in-out'
            }}
          >
            {boostLoading ? t.boost_loading : t.boost_btn}
          </button>
        </div>

        {/* ── BOOST YOUR CROP — COMPLETE SOLUTION ── */}
        {showBoostSection && (
          <div id="boost-your-crop-section" style={{ animation: 'fadeIn 0.4s ease' }}>
            {(() => {
              const hasLeafResult = !!result;
              const hasLeafProblem = result && !result.is_healthy;
              const hasSoilResult = !!soilResult;
              const hasWaterResult = !!waterResult;
              const hasSoilProblem = hasSoilResult && soilResult.possible_problem;
              const hasWaterProblem = hasWaterResult && (waterResult.irrigation_required || waterResult.water_status?.toLowerCase().includes('low') || waterResult.water_status?.toLowerCase().includes('excess'));
              const activeCrop = result?.crop_name || cropName || '';

              // Priority steps
              const priorityList = [];
              let pIndex = 1;

              if (hasLeafProblem) {
                priorityList.push({
                  step: pIndex++,
                  title: lang === 'ta' ? `${formatText(activeCrop || 'பயிர்')} இலை நோயைக் கட்டுப்படுத்தல்` : `Control ${activeCrop || 'crop'} leaf disease`,
                  action: lang === 'ta' ? `கண்டறியப்பட்ட ${formatText(result?.predicted_disease)} நோய்க்கு உடனடியாகப் பரிந்துரைக்கப்பட்ட சிகிச்சையைப் பயன்படுத்தவும்.` : `Apply recommended treatment for ${formatText(result?.predicted_disease)}.`
                });
              }

              if (hasSoilProblem) {
                priorityList.push({
                  step: pIndex++,
                  title: lang === 'ta' ? 'மண் நிலையை மேம்படுத்தல்' : 'Improve soil condition',
                  action: lang === 'ta' ? (soilResult.improvement || 'இயற்கை உரங்கள் மூலம் மண் வளத்தை மேம்படுத்தவும்.') : (soilResult.improvement || 'Apply organic amendments to improve soil quality.')
                });
              }

              if (hasWaterProblem) {
                priorityList.push({
                  step: pIndex++,
                  title: lang === 'ta' ? 'நீர்ப்பாசன சீரமைப்பு' : 'Adjust water management',
                  action: lang === 'ta' ? (waterResult.recommendations?.[0] || 'நீர்ப்பாசன முறையைச் சீரமைக்கவும்.') : (waterResult.recommendations?.[0] || 'Adjust irrigation scheduling.')
                });
              }

              if (priorityList.length === 0) {
                priorityList.push({
                  step: 1,
                  title: lang === 'ta' ? 'வழக்கமான பராமரிப்பைத் தொடர்தல்' : 'Maintain optimal practices',
                  action: lang === 'ta' ? 'முறையான நீர்ப்பாசனம் மற்றும் வழக்கமான பராமரிப்பு முறைகளைப் பின்பற்றவும்.' : 'Continue regular crop monitoring and standard practices.'
                });
              }

              // Final recommendation
              let finalStatement = '';
              const anyProblem = hasLeafProblem || hasSoilProblem || hasWaterProblem;
              const anyResult = hasLeafResult || hasSoilResult || hasWaterResult;
              if (!anyResult) {
                finalStatement = lang === 'ta' ? t.no_analysis_yet : t.no_analysis_yet;
              } else if (!anyProblem) {
                finalStatement = lang === 'ta'
                  ? 'பகுப்பாய்வு செய்யப்பட்ட அனைத்தும் உகந்த நிலையில் உள்ளன. தொடர் கண்காணிப்பு மற்றும் தற்போதைய விவசாய முறைகளைப் பின்பற்றவும்.'
                  : 'All analyzed factors are in optimal condition. Continue regular monitoring and maintain current farming practices.';
              } else {
                finalStatement = lang === 'ta'
                  ? `${hasLeafProblem ? formatText(result?.predicted_disease) + ' நோய் கண்டறியப்பட்டுள்ளது. ' : ''}${hasSoilProblem ? 'மண் நிலை மேம்படுத்தப்பட வேண்டும். ' : ''}${hasWaterProblem ? 'நீர் மேலாண்மை சீரமைக்கப்பட வேண்டும். ' : ''}மேலே குறிப்பிட்ட முன்னுரிமை நடவடிக்கைகளைப் பின்பற்றவும்.`
                  : `${hasLeafProblem ? `Leaf disease (${formatText(result?.predicted_disease)}) detected. ` : ''}${hasSoilProblem ? 'Soil condition needs improvement. ' : ''}${hasWaterProblem ? 'Water management needs adjustment. ' : ''}Follow the priority actions listed above.`;
              }

              return (
                <div style={{
                  background: 'linear-gradient(135deg, #152d15, #1b381b)',
                  border: '2px solid #7dd56f', borderRadius: 20, padding: '1.5rem',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.4)', marginBottom: '1.5rem'
                }}>
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#7dd56f', fontSize: '1.3rem', fontWeight: 800, marginTop: 0, marginBottom: '1rem', borderBottom: '1px solid #2d5a27', paddingBottom: '0.6rem' }}>
                    {t.boost_title}
                  </h2>

                  {/* 3 Pillars Summary */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: '0.85rem', border: `1px solid ${hasLeafProblem ? '#ff7043' : '#4caf50'}44` }}>
                      <div style={{ color: '#81c784', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                        🌿 {t.leaf_condition}
                      </div>
                      <div style={{ color: hasLeafResult ? (hasLeafProblem ? '#ff7043' : '#4caf50') : '#ffb74d', fontWeight: 700, fontSize: '0.85rem' }}>
                        {hasLeafResult ? (hasLeafProblem ? `⚠️ ${formatText(result.predicted_disease)}` : `✅ ${t.healthy}`) : `⚪ ${t.not_analyzed}`}
                      </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: '0.85rem', border: `1px solid ${hasSoilProblem ? '#ff9800' : '#8d6e63'}44` }}>
                      <div style={{ color: '#81c784', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                        🟫 {t.soil_condition}
                      </div>
                      <div style={{ color: hasSoilResult ? (hasSoilProblem ? '#ffb74d' : '#4caf50') : '#8d6e63', fontWeight: 700, fontSize: '0.85rem' }}>
                        {hasSoilResult ? (hasSoilProblem ? `⚠️ ${soilResult.ai_soil_class}` : `✅ ${soilResult.ai_soil_class}`) : `⚪ ${t.not_analyzed}`}
                      </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: '0.85rem', border: `1px solid ${hasWaterProblem ? '#0288d1' : '#29b6f6'}44` }}>
                      <div style={{ color: '#81c784', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                        💧 {t.water_condition_boost}
                      </div>
                      <div style={{ color: hasWaterResult ? (hasWaterProblem ? '#81d4fa' : '#4caf50') : '#0288d1', fontWeight: 700, fontSize: '0.85rem' }}>
                        {hasWaterResult ? `${hasWaterProblem ? '⚠️' : '✅'} ${waterResult.water_status}` : `⚪ ${t.not_analyzed}`}
                      </div>
                    </div>
                  </div>

                  {/* COMPLETE SOLUTION — Structured flow */}
                  <h3 style={{ color: '#7dd56f', fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                    {t.complete_solution_title}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    {/* Leaf Flow */}
                    {hasLeafResult && (
                      <SolutionFlowCard
                        icon="🌿" section={t.tab_leaf}
                        problem={hasLeafProblem ? formatText(result.predicted_disease) : null}
                        solution={hasLeafProblem ? (di ? formatText(di.organic_treatment) : '') : (lang === 'ta' ? 'ஆரோக்கியமானது — தொடர் கண்காணிப்பு செய்யவும்.' : 'Healthy — continue regular monitoring.')}
                        color="#4caf50" lang={lang} t={t}
                      />
                    )}

                    {/* Soil Flow */}
                    {hasSoilResult && (
                      <SolutionFlowCard
                        icon="🟫" section={t.tab_soil}
                        problem={hasSoilProblem ? soilResult.possible_problem : null}
                        solution={soilResult.improvement || soilResult.organic_methods || (lang === 'ta' ? 'மண் நிலை உகந்தது.' : 'Soil condition is suitable.')}
                        color="#8d6e63" lang={lang} t={t}
                      />
                    )}

                    {/* Soil → Leaf Connection Panel */}
                    {hasLeafProblem && hasSoilResult && (
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(93,64,55,0.25), rgba(46,125,50,0.15))',
                        border: '1.5px solid #8d6e63',
                        borderRadius: 12, padding: '1rem',
                      }}>
                        <div style={{ color: '#ffb74d', fontWeight: 800, fontSize: '0.88rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>🔗</span>
                          <span>{lang === 'ta' ? 'உங்கள் இலை பிரச்சனைக்கு மண் காரணமாக இருக்கலாம்' : 'Your Leaf Problem May Be Caused By Soil Condition'}</span>
                        </div>
                        <div style={{ color: '#ffe0b2', fontSize: '0.82rem', lineHeight: 1.6, marginBottom: '0.6rem' }}>
                          {lang === 'ta'
                            ? `கண்டறியப்பட்ட மண் வகை "${soilResult.ai_soil_class}" — இந்த மண்ணில் ${soilResult.possible_problem || 'பிரச்சனைகள்'} இருப்பதால் ${formatText(result?.predicted_disease)} போன்ற இலை நோய்கள் ஏற்படலாம். மண்ணை சரிசெய்வது இலை நோயின் திரும்புவதை தடுக்கும்.`
                            : `Detected soil type "${soilResult.ai_soil_class}" — ${soilResult.possible_problem || 'soil issues present'} can directly cause or worsen ${formatText(result?.predicted_disease)} in your crop. Fixing the soil first will prevent the leaf disease from recurring.`
                          }
                        </div>
                        <div style={{ fontWeight: 700, color: '#81c784', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                          {lang === 'ta' ? '✅ மண்ணை சரிசெய்ய உடனடி நடவடிக்கைகள்:' : '✅ Immediate Steps to Fix Your Soil:'}
                        </div>
                        <ol style={{ margin: 0, paddingLeft: '1.2rem', color: '#c8e6c9', fontSize: '0.82rem', lineHeight: 1.7 }}>
                          {soilResult.improvement && (
                            <li><strong>{lang === 'ta' ? 'மண் மேம்பாடு:' : 'Soil Improvement:'}</strong> {soilResult.improvement}</li>
                          )}
                          {soilResult.organic_methods && (
                            <li><strong>{lang === 'ta' ? 'இயற்கை முறை:' : 'Organic Method:'}</strong> {soilResult.organic_methods}</li>
                          )}
                          {soilResult.soil_condition && (
                            <li><strong>{lang === 'ta' ? 'தற்போதைய மண் நிலை:' : 'Current Soil Condition:'}</strong> {soilResult.soil_condition}</li>
                          )}
                          <li><strong>{lang === 'ta' ? 'பரிந்துரைக்கப்படும் பயிர்கள்:' : 'Recommended Crops for this Soil:'}</strong> {soilResult.recommended_crops || (lang === 'ta' ? 'தரவு இல்லை' : 'N/A')}</li>
                        </ol>
                        <div style={{ marginTop: '0.6rem', background: 'rgba(255,183,77,0.1)', border: '1px solid #ffb74d44', borderRadius: 8, padding: '0.5rem 0.75rem', color: '#ffe0b2', fontSize: '0.78rem', lineHeight: 1.5 }}>
                          💡 {lang === 'ta'
                            ? 'முதலில் மண்ணை சரிசெய்யுங்கள், பிறகு இலை நோய்க்கு சிகிச்சை செய்யுங்கள். இதன் மூலம் நோய் மீண்டும் வராது.'
                            : 'Fix the soil first, then treat the leaf disease. This prevents recurrence and builds long-term crop immunity.'
                          }
                        </div>
                      </div>
                    )}

                    {/* Water Flow */}
                    {hasWaterResult && (
                      <SolutionFlowCard
                        icon="💧" section={t.tab_water}
                        problem={hasWaterProblem ? (waterResult.water_condition || waterResult.water_status) : null}
                        solution={waterResult.recommendations?.[0] || (lang === 'ta' ? 'நீர் நிலை உகந்தது.' : 'Water condition is suitable.')}
                        color="#0288d1" lang={lang} t={t}
                      />
                    )}
                  </div>

                  {/* Priority */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ color: '#7dd56f', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span>🎯</span><span>{t.priority_lbl}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {priorityList.map((item, idx) => (
                        <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(76,175,80,0.25)', borderRadius: 10, padding: '0.65rem 0.85rem' }}>
                          <div style={{ color: '#ffb74d', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.15rem' }}>
                            {item.step}. {item.title}
                          </div>
                          <div style={{ color: '#c8e6c9', fontSize: '0.82rem', lineHeight: 1.5 }}>
                            {item.action}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Final Recommendation */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(46,125,50,0.35), rgba(27,94,32,0.45))',
                    border: '1.5px solid #4caf50', borderRadius: 14, padding: '1rem'
                  }}>
                    <div style={{ color: '#7dd56f', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span>🤖</span><span>{t.final_rec_lbl}</span>
                    </div>
                    <p style={{ margin: 0, color: '#f1f8e9', fontSize: '0.95rem', lineHeight: 1.6, fontWeight: 600, fontStyle: 'italic' }}>
                      {finalStatement}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => { setActiveSection('leaf'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      style={{ background: 'linear-gradient(135deg, #1565c0, #1e88e5)', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    ><span>🔄</span><span>{t.scan_again}</span></button>

                    <Link to={`/report?lang=${lang}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none', background: 'linear-gradient(135deg, #4caf50, #2e7d32)', color: '#fff', padding: '0.65rem 1.25rem', borderRadius: 8, fontWeight: 700, fontSize: '0.88rem' }}
                    ><span>📄</span><span>{t.btn_get_report}</span></Link>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

      </div>

      {/* ── CAMERA MODAL ── */}
      {showCameraModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            background: '#1b351b', border: '2px solid #2d5a27', borderRadius: 20,
            width: '100%', maxWidth: 500, padding: '1.5rem', position: 'relative'
          }}>
            <h3 style={{ color: '#7dd56f', marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isUsbMode ? t.modal_title_usb : t.modal_title_camera}
            </h3>

            {cameraPermissionError ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <p style={{ color: '#ff8a65', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                  {t.camera_err_perm}
                </p>
                <button onClick={() => requestCameraPermission(selectedCameraId)}
                  style={{ background: '#4caf50', color: '#fff', border: 'none', borderRadius: 8, padding: '0.75rem 1.5rem', fontWeight: 700, cursor: 'pointer' }}
                >{t.camera_btn_grant}</button>
              </div>
            ) : (
              <div>
                {cameraDevices.length > 1 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ color: '#a5d6a7', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>
                      {t.camera_select_device}
                    </label>
                    <select value={selectedCameraId} onChange={(e) => handleCameraChange(e.target.value)}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid #2d5a27', borderRadius: 8, padding: '0.5rem', color: '#fff' }}
                    >
                      {cameraDevices.map(d => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label || `Camera ${cameraDevices.indexOf(d) + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div style={{ background: '#000', borderRadius: 12, overflow: 'hidden', position: 'relative', aspectRatio: '4/3', marginBottom: '1rem' }}>
                  {capturedPreview ? (
                    <img src={capturedPreview} alt="Captured Frame" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: cameraActive ? 'block' : 'none' }} />
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {!cameraActive && !capturedPreview && (
                    <button onClick={() => requestCameraPermission(selectedCameraId)} style={{ background: '#4caf50', color: '#fff', border: 'none', borderRadius: 10, padding: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                      {t.btn_start_camera}
                    </button>
                  )}

                  {cameraActive && !capturedPreview && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <button onClick={capturePhoto} style={{ background: '#4caf50', color: '#fff', border: 'none', borderRadius: 10, padding: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                        {t.btn_capture}
                      </button>
                      <button onClick={stopCamera} style={{ background: 'rgba(244,67,54,0.2)', border: '1px solid #f44336', color: '#ff8a65', borderRadius: 10, padding: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                        {t.btn_stop_camera}
                      </button>
                    </div>
                  )}

                  {capturedPreview && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <button onClick={retakePhoto} style={{ background: '#ff9800', color: '#fff', border: 'none', borderRadius: 10, padding: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                        {t.btn_retake}
                      </button>
                      <button onClick={usePhoto} style={{ background: '#4caf50', color: '#fff', border: 'none', borderRadius: 10, padding: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                        {t.btn_use_photo}
                      </button>
                    </div>
                  )}

                  <button onClick={stopCamera} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '0.75rem', fontWeight: 700, cursor: 'pointer', marginTop: '0.25rem' }}>
                    {t.btn_close}
                  </button>
                </div>
              </div>
            )}

            {isUsbMode && !navigator.mediaDevices && (
              <div style={{ borderTop: '1px solid #2d5a27', marginTop: '1rem', paddingTop: '1rem' }}>
                <p style={{ color: '#a5d6a7', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{t.usb_err_fallback}</p>
                <input type="file" accept="image/*" capture="environment" onChange={(e) => {
                  const file = e.target.files[0];
                  if (cameraTarget === 'leaf') handleLeafFile(file);
                  else if (cameraTarget === 'soil') handleSoilFile(file);
                  else if (cameraTarget === 'water') handleWaterFile(file);
                  stopCamera();
                }} style={{ width: '100%', color: '#a5d6a7' }} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Responsive CSS ── */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .analyzer-sidebar { display: none !important; }
          .analyzer-mobile-tabs { display: block !important; }
          .analyzer-main-layout { flex-direction: column !important; }
        }
      `}</style>
    </div>
  );
}

// ── Helper Components ──

function Section({ title, content }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <h3 style={{ color: '#7dd56f', fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '.3rem', fontSize: '.95rem' }}>{title}</h3>
      <p style={{ color: '#c8e6c9', fontSize: '.85rem', lineHeight: 1.7, margin: 0 }}>{content}</p>
    </div>
  );
}

function TreatmentPanel({ title, dosage_lbl, instr_lbl, treatment, dosage, instructions, color, icon }) {
  return (
    <div style={{ background: `${color}11`, border: `1px solid ${color}44`, borderRadius: 12, padding: '1rem' }}>
      <div style={{ marginBottom: '.6rem' }}>
        <span style={{ color: '#a5d6a7', fontSize: '.75rem', fontWeight: 600 }}>{icon} {title}</span>
        <p style={{ color: '#e8f5e9', fontWeight: 600, margin: '.15rem 0 0', fontSize: '.9rem' }}>{treatment}</p>
      </div>
      <div style={{ marginBottom: '.6rem' }}>
        <span style={{ color: '#a5d6a7', fontSize: '.75rem', fontWeight: 600 }}>⚗️ {dosage_lbl}</span>
        <p style={{ color: '#c8e6c9', margin: '.15rem 0 0', fontSize: '.85rem', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '.3rem .5rem', borderRadius: 6 }}>{dosage}</p>
      </div>
      <div>
        <span style={{ color: '#a5d6a7', fontSize: '.75rem', fontWeight: 600 }}>📋 {instr_lbl}</span>
        <p style={{ color: '#c8e6c9', margin: '.15rem 0 0', fontSize: '.82rem', lineHeight: 1.7 }}>{instructions}</p>
      </div>
    </div>
  );
}

function SolutionFlowCard({ icon, section, problem, solution, color, lang, t }) {
  return (
    <div style={{ background: 'rgba(0,0,0,0.25)', border: `1px solid ${color}44`, borderRadius: 12, padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, color, fontSize: '0.9rem' }}>
        <span>{icon}</span><span>{section}</span>
      </div>
      {problem ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ color: '#ffb74d', fontSize: '0.78rem', fontWeight: 700 }}>⚠️ {t.problem_lbl}:</span>
            <span style={{ color: '#ffe0b2', fontSize: '0.82rem' }}>{problem}</span>
          </div>
          <div style={{ color: '#2d5a27', fontSize: '1rem', textAlign: 'center' }}>↓</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.3rem' }}>
            <span style={{ color: '#81c784', fontSize: '0.78rem', fontWeight: 700 }}>✅ {t.solution_lbl}:</span>
            <span style={{ color: '#c8e6c9', fontSize: '0.82rem', lineHeight: 1.4 }}>{solution}</span>
          </div>
        </>
      ) : (
        <div style={{ color: '#81c784', fontSize: '0.82rem' }}>✅ {solution}</div>
      )}
    </div>
  );
}
