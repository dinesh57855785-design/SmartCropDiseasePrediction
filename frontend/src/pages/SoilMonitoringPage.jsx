import { useState, useRef, useEffect } from 'react';
import { advisorAPI } from '../services/api';

const TRANSLATIONS = {
  ta: {
    title: "🪨 மண் கண்காணிப்பு மற்றும் பகுப்பாய்வு",
    subtitle: "விவரங்களை கைமுறையாக உள்ளிட்டு அல்லது புகைப்படத்தைப் பயன்படுத்தி மண்ணின் தரத்தை பகுப்பாய்வு செய்யுங்கள்",
    tab_manual: "📊 கைமுறை பகுப்பாய்வு",
    tab_manual_desc: "மண் அளவுருக்களை உள்ளிடவும்",
    tab_ai: "📸 AI பட பகுப்பாய்வு",
    tab_ai_desc: "மண்ணின் புகைப்படத்தை எடுக்கவும்/பதிவேற்றவும்",
    
    // Manual Form labels
    soil_type: "மண் வகை",
    ph: "மண் pH (1–14)",
    nitrogen: "தழைச்சத்து (N)",
    phosphorus: "மணிச்சத்து (P)",
    potassium: "சாம்பல்சத்து (K)",
    organic_matter: "கரிம கரிமப்பொருள்",
    moisture: "மண்ணின் ஈரப்பதம்",
    ec: "மின் கடத்துத்திறன் (EC dS/m)",
    texture: "மண்ணின் பதம்",
    btn_analyze_manual: "🔬 மண் தரத்தை பகுப்பாய்வு செய்",
    analyzing_manual: "🔬 மண் தரவு பகுப்பாய்வு செய்யப்படுகிறது...",
    
    // AI Section
    ai_banner: "🤖 AI மண் பட பகுப்பாய்வு — உங்கள் மண்ணின் புகைப்படத்தை எடுக்கவும் அல்லது பதிவேற்றவும். எங்கள் AI அதன் நிறத்தின் அடிப்படையில் மண் வகையையும் அதற்குரிய பயிர்களையும் பரிந்துரைக்கும்.",
    btn_upload: "📁 படம் பதிவேற்றவும்",
    upload_desc: "JPG, PNG, WEBP கோப்புகள்",
    btn_camera: "📷 கேமரா",
    camera_desc: "சாதன கேமராவைப் பயன்படுத்தவும்",
    btn_usb_camera: "🔌 USB கேமரா",
    usb_camera_desc: "USB வெப்கேமரா பயன்படுத்தவும்",
    btn_analyze_ai: "🔬 மண் படத்தை பகுப்பாய்வு செய்",
    analyzing_ai: "🔬 மண் படம் பகுப்பாய்வு செய்யப்படுகிறது...",
    btn_clear: "துடைக்கவும்",
    
    // Results
    result_suitability: "🌱 பொருத்தமான பயிர்கள் மேட்ரிக்ஸ்",
    result_suitable_crops: "✅ மிகவும் பொருத்தமான பயிர்கள்",
    result_unsuitable_crops: "⚠️ மண் திருத்தம் தேவைப்படும் பயிர்கள்",
    result_unsuitable_none: "எதுவுமில்லை — மண் அனைத்து பயிர்களுக்கும் உகந்தது!",
    result_agronomic: "📋 வேளாண் பகுப்பாய்வு",
    result_fertilizer: "🧪 உரப் பரிந்துரைகள்",
    result_organic: "🌿 இயற்கை மேம்பாடுகள்",
    
    // AI results keys
    ai_prediction: "AI கணிப்பு",
    ai_observed_color: "கண்டறியப்பட்ட நிறம்:",
    ai_farming_recommendations: "🌿 விவசாயப் பரிந்துரைகள்",
    ai_disclaimer: "முக்கியம்: இரசாயன உரங்கள் மற்றும் பூச்சிக்கொல்லி பரிந்துரைகள் பொதுவான வழிகாட்டுதல்கள் மட்டுமே.",
    
    // Camera modal
    modal_title_camera: "📷 கேமரா",
    modal_title_usb: "🔌 USB கேமரா",
    camera_err_perm: "கேமராவை அணுக அனுமதி வழங்கவும்",
    camera_btn_grant: "Start Camera (அனுமதி கோரவும்)",
    camera_select_device: "கேமராவைத் தேர்ந்தெடுக்கவும்:",
    btn_capture: "படம் பிடிக்கவும் (Capture)",
    btn_retake: "மீண்டும் எடுக்கவும் (Retake)",
    btn_use_photo: "புகைப்படத்தைப் பயன்படுத்தவும் (Use Photo)",
    btn_close: "மூடவும் (Close)",
    btn_start_camera: "கேமராவைத் தொடங்கு (Start Camera)",
    btn_stop_camera: "கேமராவை நிறுத்து (Stop Camera)",
    usb_err_fallback: "USB கேமரா கண்டறியப்படவில்லை. உங்கள் ஃபோனில் படம் பிடித்து பதிவேற்ற கீழே உள்ள பொத்தானைப் பயன்படுத்தவும்:",
  },
  en: {
    title: "🪨 Soil Monitoring & Analysis",
    subtitle: "Analyze soil using manual parameters or AI image prediction",
    tab_manual: "📊 Manual Analysis",
    tab_manual_desc: "Enter soil parameters",
    tab_ai: "📸 AI Image Analysis",
    tab_ai_desc: "Upload/capture soil photo",
    
    // Manual Form labels
    soil_type: "Soil Type",
    ph: "Soil pH (1–14)",
    nitrogen: "Nitrogen (N)",
    phosphorus: "Phosphorus (P)",
    potassium: "Potassium (K)",
    organic_matter: "Organic Matter",
    moisture: "Soil Moisture",
    ec: "EC (dS/m)",
    texture: "Soil Texture",
    btn_analyze_manual: "🔬 Analyze Soil Quality",
    analyzing_manual: "🔬 Analyzing Soil Data...",
    
    // AI Section
    ai_banner: "🤖 AI Soil Image Analysis — Take a photo of your soil or upload an existing image. Our AI will predict the soil type and provide crop recommendations based on visual color analysis.",
    btn_upload: "📁 Upload Image",
    upload_desc: "JPG, PNG, WEBP files",
    btn_camera: "📷 Camera",
    camera_desc: "Use device camera",
    btn_usb_camera: "🔌 USB Camera",
    usb_camera_desc: "Use USB Webcam",
    btn_analyze_ai: "🔬 Analyze Soil Image",
    analyzing_ai: "🔬 Analyzing Soil Image...",
    btn_clear: "Clear",
    
    // Results
    result_suitability: "🌱 Crop Suitability Matrix",
    result_suitable_crops: "✅ Highly Suitable Crops",
    result_unsuitable_crops: "⚠️ Crops Requiring Soil Amendment",
    result_unsuitable_none: "None — soil parameters are versatile!",
    result_agronomic: "📋 Agronomic Analysis",
    result_fertilizer: "🧪 Fertilizer Recommendations",
    result_organic: "🌿 Organic Improvements",
    
    // AI results keys
    ai_prediction: "AI PREDICTION",
    ai_observed_color: "Observed color:",
    ai_farming_recommendations: "🌿 Farming Recommendations",
    ai_disclaimer: "Important: Chemical fertilizer and pesticide recommendations are general guidelines only.",
    
    // Camera modal
    modal_title_camera: "📷 Camera",
    modal_title_usb: "🔌 USB Camera",
    camera_err_perm: "Please grant camera access permission",
    camera_btn_grant: "Start Camera (Request Permission)",
    camera_select_device: "Select Camera Device:",
    btn_capture: "Capture Photo",
    btn_retake: "Retake",
    btn_use_photo: "Use Photo",
    btn_close: "Close",
    btn_start_camera: "Start Camera",
    btn_stop_camera: "Stop Camera",
    usb_err_fallback: "USB Camera not found. Please upload a photo from your device instead:",
  }
};

export default function SoilMonitoringPage() {
  const [lang, setLang] = useState(localStorage.getItem('selected_lang') || 'ta');
  const t = TRANSLATIONS[lang];

  const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'ai'

  // ── Manual Analysis State ──────────────────────────────────────────────────
  const [form, setForm] = useState({
    soil_type: 'Sandy Soil',
    ph: '6.5',
    N: '200',
    P: '15',
    K: '300',
    ec: '0.8',
    oc: '0.7',
    S: '10',
    zn: '0.5',
    fe: '1.0',
    cu: '0.8',
    Mn: '5.0',
    B: '0.5',
    nitrogen: 'Medium',
    phosphorus: 'Medium',
    potassium: 'High',
    organic_matter: 'Medium',
    moisture: 'Moderate',
    texture: 'Coarse',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── AI Image Analysis State ────────────────────────────────────────────────
  const [soilImage, setSoilImage] = useState(null);
  const [soilPreview, setSoilPreview] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const uploadRef = useRef();

  // Camera preview state variables
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [cameraPermissionError, setCameraPermissionError] = useState(false);
  const [isUsbMode, setIsUsbMode] = useState(false);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedPreview, setCapturedPreview] = useState(null);
  const videoRef = useRef(null);

  // Sync language selection dynamically from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setLang(localStorage.getItem('selected_lang') || 'ta');
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Clean language formatting helpers
  const cleanTa = (str) => {
    if (!str) return 'பொருந்தாது';
    let clean = String(str);
    clean = clean.replace(/\s*\([a-zA-Z\s,_\-]+\)/g, '');
    const dict = {
      'Tomato': 'தக்காளி',
      'Potato': 'உருளைக்கிழங்கு',
      'Rice': 'நெல்',
      'Corn': 'சோளம்',
      'Maize': 'சோளம்',
      'Apple': 'ஆப்பிள்',
      'Grape': 'திராட்சை',
      'Pepper': 'குடைமிளகாய்',
      'Bell Pepper': 'குடைமிளகாய்',
      'Cotton': 'பருத்தி',
      'Groundnut': 'வேர்க்கடலை',
      'Sugarcane': 'கரும்பு',
      'Wheat': 'கோதுமை',
      'Other': 'இதர',
      'Sandy Soil': 'மணல் மண்',
      'Clay Soil': 'களிமண்',
      'Loam Soil': 'வண்டல் மண்',
      'Silt Soil': 'வண்டல் மண்',
      'Black Cotton Soil': 'கரிசல் மண்',
      'Red Soil': 'செம்மண்',
      'Low': 'குறைவு',
      'Medium': 'நடுத்தரம்',
      'High': 'அதிகம்',
      'Moderate': 'மிதமானது',
      'Dry': 'வறண்டது',
      'Soft': 'மென்மையானது',
      'Hard': 'கடினமானது',
    };
    Object.keys(dict).forEach(key => {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      clean = clean.replace(regex, dict[key]);
    });
    return clean;
  };

  const cleanEn = (str) => {
    if (!str) return 'N/A';
    let clean = String(str);
    clean = clean.replace(/[\u0B80-\u0BFF]+\s*\(?/g, '').replace(/\)/g, '').trim();
    return clean;
  };

  const formatText = (str) => {
    return lang === 'ta' ? cleanTa(str) : cleanEn(str);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await advisorAPI.analyzeSoil(form);
      setResult(res.data);
      localStorage.setItem('last_soil_analysis', JSON.stringify(res.data));
    } catch (err) {
      setError(err.response?.data?.error || 'Soil analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAiError('Please upload a valid image (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setAiError('Image too large. Please upload an image smaller than 10 MB.');
      return;
    }
    setSoilImage(file);
    setSoilPreview(URL.createObjectURL(file));
    setAiResult(null);
    setAiError('');
  };

  const handleAIAnalyze = async () => {
    if (!soilImage) { setAiError('Please select or capture a soil image first.'); return; }
    setAiLoading(true);
    setAiError('');
    const fd = new FormData();
    fd.append('image', soilImage);
    try {
      const res = await advisorAPI.analyzeSoilImage(fd);
      setAiResult(res.data);
      const formattedSoil = {
        soil_type: res.data.soil_type_prediction,
        ph_level: 6.5,
        soil_summary: `AI Visual analysis: ${res.data.soil_type_prediction}`,
        suitable_crops: res.data.suitable_crops || [],
        fertilizer_recommendations: res.data.recommendations || [],
        organic_improvements: res.data.soil_characteristics || [],
        irrigation_advice: "Visual color estimate recommendation applied.",
        explanations: [res.data.disclaimer]
      };
      localStorage.setItem('last_soil_analysis', JSON.stringify(formattedSoil));
    } catch (err) {
      setAiError(err.response?.data?.error || 'AI analysis failed.');
    } finally {
      setAiLoading(false);
    }
  };

  // Camera request handlers
  const requestCameraPermission = async (deviceId = '') => {
    setCameraPermissionError(false);
    setCapturedBlob(null);
    setCapturedPreview(null);
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
    }

    try {
      const constraints = deviceId 
        ? { video: { deviceId: { exact: deviceId } } }
        : { video: { facingMode: 'environment' } };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
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
          }
        } else if (videoDevs.length > 0) {
          setSelectedCameraId(videoDevs[0].deviceId);
        }
      } else if (videoDevs.length > 0 && !deviceId) {
        setSelectedCameraId(videoDevs[0].deviceId);
      }
    } catch (err) {
      console.error(err);
      setCameraPermissionError(true);
    }
  };

  const openCamera = (isUsb = false) => {
    setIsUsbMode(isUsb);
    setShowCameraModal(true);
    setCameraPermissionError(false);
    setCameraActive(false);
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
      handleImageFile(file);
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

  const clearAI = () => { setSoilImage(null); setSoilPreview(null); setAiResult(null); setAiError(''); };

  return (
    <div style={{ minHeight: '100vh', background: '#0d1f0d', padding: '6rem 1.5rem 2rem', fontFamily: 'Inter, sans-serif', color: '#e8f5e9' }}>
      <div style={{ maxWidth: 950, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, color: '#7dd56f', margin: 0 }}>
            {t.title}
          </h1>
          <p style={{ color: '#81c784', marginTop: '.5rem' }}>
            {t.subtitle}
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem' }}>
          {[
            { key: 'manual', label: t.tab_manual, desc: t.tab_manual_desc },
            { key: 'ai', label: t.tab_ai, desc: t.tab_ai_desc },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                background: activeTab === tab.key
                  ? 'linear-gradient(135deg, #4caf50, #2e7d32)'
                  : 'rgba(29,52,29,0.5)',
                color: '#fff',
                border: activeTab === tab.key ? 'none' : '1px solid #2d5a27',
                borderRadius: 12,
                padding: '.85rem 1rem',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '.9rem',
                transition: 'all .2s',
                textAlign: 'center',
              }}
            >
              <div>{tab.label}</div>
              <div style={{ fontSize: '.75rem', fontWeight: 400, opacity: .8, marginTop: '.1rem' }}>{tab.desc}</div>
            </button>
          ))}
        </div>

        {/* ── MANUAL ANALYSIS TAB ─────────────────────────────────────────── */}
        {activeTab === 'manual' && (
          <>
            <form onSubmit={handleManualSubmit} style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 20, padding: '1.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>

                <div>
                  <label style={labelStyle}>{t.soil_type}</label>
                  <select name="soil_type" value={form.soil_type} onChange={handleChange} style={selectStyle}>
                    <option value="Sandy Soil">{formatText("Sandy Soil")}</option>
                    <option value="Clay Soil">{formatText("Clay Soil")}</option>
                    <option value="Loam Soil">{formatText("Loam Soil")}</option>
                    <option value="Silt Soil">{formatText("Silt Soil")}</option>
                    <option value="Black Cotton Soil">{formatText("Black Cotton Soil")}</option>
                    <option value="Red Soil">{formatText("Red Soil")}</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>{t.ph}</label>
                  <input type="number" step="0.1" min="1" max="14" name="ph" value={form.ph} onChange={handleChange} style={inputStyle} required />
                </div>

                <div>
                  <label style={labelStyle}>{t.nitrogen}</label>
                  <select name="nitrogen" value={form.nitrogen} onChange={handleChange} style={selectStyle}>
                    <option value="Low">{formatText("Low")}</option>
                    <option value="Medium">{formatText("Medium")}</option>
                    <option value="High">{formatText("High")}</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>{t.phosphorus}</label>
                  <select name="phosphorus" value={form.phosphorus} onChange={handleChange} style={selectStyle}>
                    <option value="Low">{formatText("Low")}</option>
                    <option value="Medium">{formatText("Medium")}</option>
                    <option value="High">{formatText("High")}</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>{t.potassium}</label>
                  <select name="potassium" value={form.potassium} onChange={handleChange} style={selectStyle}>
                    <option value="Low">{formatText("Low")}</option>
                    <option value="Medium">{formatText("Medium")}</option>
                    <option value="High">{formatText("High")}</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>{t.organic_matter}</label>
                  <select name="organic_matter" value={form.organic_matter} onChange={handleChange} style={selectStyle}>
                    <option value="Low">{formatText("Low")}</option>
                    <option value="Medium">{formatText("Medium")}</option>
                    <option value="High">{formatText("High")}</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>{t.moisture}</label>
                  <select name="moisture" value={form.moisture} onChange={handleChange} style={selectStyle}>
                    <option value="Dry">{formatText("Dry")}</option>
                    <option value="Moderate">{formatText("Moderate")}</option>
                    <option value="High">{formatText("High")}</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>{t.ec}</label>
                  <input type="number" step="0.1" name="ec" value={form.ec} onChange={handleChange} style={inputStyle} />
                </div>
              </div>

              {/* === AI Soil Fertility Parameters === */}
              <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid #2d5a2766', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1rem' }}>
                <div style={{ color: '#7dd56f', fontWeight: 700, fontSize: '.88rem', marginBottom: '.5rem' }}>
                  🧪 {lang === 'ta' ? 'AI கணிப்புக்கான ஊட்டச்சத்து மதிப்புகள் (மண் ஆய்வு அறிக்கையிலிருந்து)' : 'Nutrient Values for AI Fertility Prediction (from Soil Test Report)'}
                </div>
                <div style={{ color: '#a5d6a7', fontSize: '.76rem', marginBottom: '.75rem', opacity: 0.8 }}>
                  {lang === 'ta' ? 'இயல்புநிலை மதிப்புகள் மாதிரி பகுப்பாய்வுக்கு வழங்கப்பட்டுள்ளன. உங்கள் மண் ஆய்வு அறிக்கையிலிருந்து உண்மையான மதிப்புகளை உள்ளிடவும்.' : 'Default values provided for sample analysis. Enter actual values from your soil test report for accurate prediction.'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '.65rem' }}>
                  {[
                    {name:'N', label:'N - Nitrogen (mg/kg)', placeholder:'e.g. 200'},
                    {name:'P', label:'P - Phosphorus (mg/kg)', placeholder:'e.g. 15'},
                    {name:'K', label:'K - Potassium (mg/kg)', placeholder:'e.g. 300'},
                    {name:'oc', label:'OC - Organic Carbon (%)', placeholder:'e.g. 0.7'},
                    {name:'S', label:'S - Sulfur (mg/kg)', placeholder:'e.g. 10'},
                    {name:'zn', label:'Zn - Zinc (mg/kg)', placeholder:'e.g. 0.5'},
                    {name:'fe', label:'Fe - Iron (mg/kg)', placeholder:'e.g. 1.0'},
                    {name:'cu', label:'Cu - Copper (mg/kg)', placeholder:'e.g. 0.8'},
                    {name:'Mn', label:'Mn - Manganese (mg/kg)', placeholder:'e.g. 5.0'},
                    {name:'B', label:'B - Boron (mg/kg)', placeholder:'e.g. 0.5'},
                  ].map(field => (
                    <div key={field.name}>
                      <label style={{...labelStyle, fontSize: '.76rem'}}>{field.label}</label>
                      <input
                        type="number"
                        step="0.01"
                        name={field.name}
                        value={form[field.name] || ''}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div style={{ background: 'rgba(244,67,54,0.12)', border: '1px solid #f44336', borderRadius: 10, padding: '.8rem 1rem', color: '#ef9a9a', marginBottom: '1rem' }}>
                  ⚠️ {error}
                </div>
              )}

              <button type="submit" disabled={loading} style={btnStyle}>
                {loading ? t.analyzing_manual : t.btn_analyze_manual}
              </button>
            </form>

            {/* Manual Results */}
            {result && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* AI Prediction Banner */}
                {result.ai_soil_result && (
                  <div style={{ background: 'rgba(29,52,29,0.95)', border: '2px solid #7dd56f', borderRadius: 20, padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ color: '#a5d6a7', fontSize: '.85rem', fontWeight: 600, marginBottom: '.5rem', letterSpacing: 1 }}>
                      🤖 {lang === 'ta' ? 'AI மண் தரம் கணிப்பு' : 'AI SOIL FERTILITY PREDICTION'}
                    </div>
                    <div style={{ color: '#7dd56f', fontSize: '2rem', fontWeight: 900, marginBottom: '.5rem' }}>
                      {result.ai_soil_result}
                    </div>
                    <div style={{ color: '#a5d6a7', fontSize: '.9rem', marginBottom: '.3rem' }}>
                      {lang === 'ta' ? 'நம்பகத்தன்மை' : 'Confidence'}: <strong style={{color:'#fff'}}>{result.confidence_percent || (result.confidence ? (result.confidence * 100).toFixed(1) : 'N/A')}%</strong>
                    </div>
                    <div style={{ color: '#81c784', fontSize: '.82rem', opacity: 0.85 }}>
                      {result.analysis_type || 'AI Model Prediction'}
                    </div>
                    {result.soil_condition && (
                      <div style={{ marginTop: '.75rem', background: 'rgba(0,0,0,0.25)', borderRadius: 10, padding: '.6rem 1rem', color: '#c8e6c9', fontSize: '.88rem' }}>
                        📊 {result.soil_condition}
                      </div>
                    )}
                    {result.possible_problem && (
                      <div style={{ marginTop: '.5rem', background: 'rgba(255,152,0,0.1)', border: '1px solid #ff980044', borderRadius: 10, padding: '.6rem 1rem', color: '#ffcc80', fontSize: '.85rem' }}>
                        ⚠️ {result.possible_problem}
                      </div>
                    )}
                  </div>
                )}
                <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 20, padding: '1.75rem' }}>
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#7dd56f', fontWeight: 800, fontSize: '1.3rem', margin: '0 0 1rem' }}>
                    {t.result_suitability}
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div style={{ background: 'rgba(76,175,80,0.1)', border: '1px solid #4caf5044', borderRadius: 14, padding: '1.25rem' }}>
                      <h3 style={{ color: '#7dd56f', fontSize: '1rem', fontWeight: 700, margin: '0 0 .75rem' }}>{t.result_suitable_crops}</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                        {result.suitable_crops.map((c) => (
                          <span key={c} style={{ background: '#4caf5022', border: '1px solid #4caf50', color: '#a5d6a7', padding: '.3rem .8rem', borderRadius: 20, fontSize: '.88rem', fontWeight: 600 }}>{formatText(c)}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ background: 'rgba(244,67,54,0.1)', border: '1px solid #f4433644', borderRadius: 14, padding: '1.25rem' }}>
                      <h3 style={{ color: '#ef9a9a', fontSize: '1rem', fontWeight: 700, margin: '0 0 .75rem' }}>{t.result_unsuitable_crops}</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                        {result.unsuitable_crops?.length > 0 ? result.unsuitable_crops.map((c) => (
                          <span key={c} style={{ background: '#f4433622', border: '1px solid #f44336', color: '#ef9a9a', padding: '.3rem .8rem', borderRadius: 20, fontSize: '.88rem', fontWeight: 600 }}>{formatText(c)}</span>
                        )) : <span style={{ color: '#a5d6a7', fontSize: '.85rem' }}>{t.result_unsuitable_none}</span>}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 20, padding: '1.75rem' }}>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', color: '#7dd56f', fontWeight: 800, fontSize: '1.2rem', marginBottom: '1rem' }}>{t.result_agronomic}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                    {result.explanations?.map((exp, idx) => (
                      <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', borderLeft: '4px solid #7dd56f', borderRadius: 8, padding: '.85rem 1rem', color: '#c8e6c9', fontSize: '.9rem' }}>
                        💡 {formatText(exp)}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 16, padding: '1.25rem' }}>
                    <h3 style={{ color: '#ffb74d', fontSize: '1rem', fontWeight: 700, margin: '0 0 .75rem' }}>{t.result_fertilizer}</h3>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#c8e6c9', fontSize: '.88rem', lineHeight: 1.6 }}>
                      {result.fertilizer_recommendations?.map((f, i) => <li key={i}>{formatText(f)}</li>)}
                    </ul>
                  </div>
                  <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 16, padding: '1.25rem' }}>
                    <h3 style={{ color: '#81c784', fontSize: '1rem', fontWeight: 700, margin: '0 0 .75rem' }}>{t.result_organic}</h3>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#c8e6c9', fontSize: '.88rem', lineHeight: 1.6 }}>
                      {result.organic_improvements?.map((o, i) => <li key={i}>{formatText(o)}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── AI IMAGE ANALYSIS TAB ───────────────────────────────────────── */}
        {activeTab === 'ai' && (
          <div>
            {/* Info Banner */}
            <div style={{ background: 'rgba(33,150,243,0.1)', border: '1px solid #2196f3', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.5rem', fontSize: '.88rem', color: '#90caf9' }}>
              {t.ai_banner}
            </div>

            {/* Camera / Upload Options */}
            <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 20, padding: '1.75rem', marginBottom: '1.5rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => uploadRef.current.click()}
                  style={{ background: 'rgba(0,0,0,0.3)', border: '2px dashed #2d5a27', borderRadius: 14, padding: '1rem', cursor: 'pointer', color: '#a5d6a7', fontSize: '.9rem', fontWeight: 600, textAlign: 'center' }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '.2rem' }}>📁</div>
                  {t.btn_upload}
                  <div style={{ fontSize: '.7rem', fontWeight: 400, marginTop: '.1rem', opacity: .8 }}>{t.upload_desc}</div>
                </button>
                <button
                  type="button"
                  onClick={() => openCamera(false)}
                  style={{ background: 'rgba(76,175,80,0.1)', border: '2px dashed #4caf50', borderRadius: 14, padding: '1rem', cursor: 'pointer', color: '#7dd56f', fontSize: '.9rem', fontWeight: 600, textAlign: 'center' }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '.2rem' }}>📷</div>
                  {t.btn_camera}
                  <div style={{ fontSize: '.7rem', fontWeight: 400, marginTop: '.1rem', opacity: .8 }}>{t.camera_desc}</div>
                </button>
                <button
                  type="button"
                  onClick={() => openCamera(true)}
                  style={{ background: 'rgba(0,188,212,0.1)', border: '2px dashed #00bcd4', borderRadius: 14, padding: '1rem', cursor: 'pointer', color: '#00e5ff', fontSize: '.9rem', fontWeight: 600, textAlign: 'center' }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '.2rem' }}>🔌</div>
                  {t.btn_usb_camera}
                  <div style={{ fontSize: '.7rem', fontWeight: 400, marginTop: '.1rem', opacity: .8 }}>{t.usb_camera_desc}</div>
                </button>
              </div>

              {/* Hidden upload ref */}
              <input ref={uploadRef} type="file" accept="image/*" hidden onChange={(e) => handleImageFile(e.target.files[0])} />

              {/* Image Preview */}
              {soilPreview && (
                <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
                  <img src={soilPreview} alt="Soil preview" style={{ maxHeight: 220, maxWidth: '100%', borderRadius: 12, objectFit: 'contain', border: '1px solid #2d5a27' }} />
                  <div style={{ marginTop: '.5rem', color: '#81c784', fontSize: '.82rem' }}>{soilImage?.name}</div>
                </div>
              )}

              {aiError && (
                <div style={{ background: 'rgba(244,67,54,0.12)', border: '1px solid #f44336', borderRadius: 10, padding: '.8rem 1rem', color: '#ef9a9a', marginBottom: '1rem', fontSize: '.88rem' }}>
                  ⚠️ {aiError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '.75rem' }}>
                <button onClick={handleAIAnalyze} disabled={aiLoading || !soilImage} style={{
                  flex: 1,
                  background: aiLoading || !soilImage ? '#3a5a3a' : 'linear-gradient(135deg, #4caf50, #2e7d32)',
                  color: '#fff', border: 'none', borderRadius: 10, padding: '.85rem',
                  fontWeight: 700, fontSize: '1rem', cursor: aiLoading || !soilImage ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(76,175,80,0.3)',
                }}>
                  {aiLoading ? t.analyzing_ai : t.btn_analyze_ai}
                </button>
                {soilImage && (
                  <button onClick={clearAI} style={{ background: 'rgba(0,0,0,0.3)', color: '#ef9a9a', border: '1px solid #f4433644', borderRadius: 10, padding: '0 1rem', fontWeight: 600, cursor: 'pointer' }}>
                    {t.btn_clear}
                  </button>
                )}
              </div>
            </div>

            {/* AI Results */}
            {aiResult && !aiLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Prediction Banner */}
                <div style={{ background: 'linear-gradient(135deg, #1a2e1a, #1e3a1e)', border: '1px solid #4caf50', borderRadius: 20, padding: '1.5rem' }}>
                  <div style={{ fontSize: '.8rem', color: '#a5d6a7', fontWeight: 600, letterSpacing: 1 }}>{t.ai_prediction.toUpperCase()}</div>
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#7dd56f', fontWeight: 800, fontSize: '1.6rem', margin: '.25rem 0 .5rem' }}>
                    🪨 {formatText(aiResult.soil_type_prediction)}
                  </h2>
                  <div style={{ fontSize: '.88rem', color: '#81c784', marginBottom: '.75rem' }}>
                    {t.ai_observed_color} <strong style={{ color: '#a5d6a7' }}>{formatText(aiResult.soil_color_observed)}</strong>
                  </div>
                </div>

                {/* Soil Characteristics */}
                <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 20, padding: '1.5rem' }}>
                  <h3 style={{ color: '#7dd56f', fontFamily: 'Outfit, sans-serif', fontWeight: 700, margin: '0 0 .75rem' }}>📋 {t.result_agronomic}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                    {aiResult.soil_characteristics?.map((c, i) => (
                      <div key={i} style={{ background: 'rgba(0,0,0,0.3)', borderLeft: '4px solid #7dd56f', borderRadius: 8, padding: '.65rem 1rem', color: '#c8e6c9', fontSize: '.9rem' }}>
                        💡 {formatText(c)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Crops */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 16, padding: '1.25rem' }}>
                    <h3 style={{ color: '#7dd56f', fontSize: '1rem', fontWeight: 700, margin: '0 0 .75rem' }}>{t.result_suitable_crops}</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                      {aiResult.suitable_crops?.map((c) => (
                        <span key={c} style={{ background: '#4caf5022', border: '1px solid #4caf50', color: '#a5d6a7', padding: '.3rem .8rem', borderRadius: 20, fontSize: '.88rem', fontWeight: 600 }}>{formatText(c)}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 16, padding: '1.25rem' }}>
                    <h3 style={{ color: '#ef9a9a', fontSize: '1rem', fontWeight: 700, margin: '0 0 .75rem' }}>{t.result_unsuitable_crops}</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                      {aiResult.unsuitable_crops?.length > 0
                        ? aiResult.unsuitable_crops.map((c) => (
                          <span key={c} style={{ background: '#f4433622', border: '1px solid #f44336', color: '#ef9a9a', padding: '.3rem .8rem', borderRadius: 20, fontSize: '.88rem', fontWeight: 600 }}>{formatText(c)}</span>
                        ))
                        : <span style={{ color: '#a5d6a7', fontSize: '.85rem' }}>{t.result_unsuitable_none}</span>}
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 16, padding: '1.25rem' }}>
                  <h3 style={{ color: '#ffb74d', fontSize: '1rem', fontWeight: 700, margin: '0 0 .75rem' }}>{t.ai_farming_recommendations}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                    {aiResult.recommendations?.map((r, i) => (
                      <div key={i} style={{ background: 'rgba(0,0,0,0.2)', borderLeft: '3px solid #ffb74d', borderRadius: 7, padding: '.5rem .75rem', color: '#c8e6c9', fontSize: '.88rem' }}>
                        ✓ {formatText(r)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disclaimer */}
                <div style={{ background: 'rgba(255,152,0,0.08)', border: '1px solid #ff980044', borderRadius: 12, padding: '1rem', color: '#ffcc80', fontSize: '.82rem', lineHeight: 1.6 }}>
                  ⚠️ {t.ai_disclaimer} {formatText(aiResult.disclaimer)}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* In-page Camera Streaming Modal */}
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
                <button
                  onClick={() => requestCameraPermission(selectedCameraId)}
                  style={{
                    background: '#4caf50', color: '#fff', border: 'none',
                    borderRadius: 8, padding: '0.75rem 1.5rem', fontWeight: 700,
                    cursor: 'pointer', boxShadow: '0 4px 10px rgba(76,175,80,0.3)'
                  }}
                >
                  {t.camera_btn_grant}
                </button>
              </div>
            ) : (
              <div>
                {cameraDevices.length > 1 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ color: '#a5d6a7', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>
                      {t.camera_select_device}
                    </label>
                    <select
                      value={selectedCameraId}
                      onChange={(e) => handleCameraChange(e.target.value)}
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
                    <img src={capturedPreview} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: cameraActive ? 'block' : 'none' }}
                    />
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {!cameraActive && !capturedPreview && (
                    <button
                      onClick={() => requestCameraPermission(selectedCameraId)}
                      style={{ background: '#4caf50', color: '#fff', border: 'none', borderRadius: 10, padding: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {t.btn_start_camera}
                    </button>
                  )}

                  {cameraActive && !capturedPreview && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <button
                        onClick={capturePhoto}
                        style={{ background: '#4caf50', color: '#fff', border: 'none', borderRadius: 10, padding: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {t.btn_capture}
                      </button>
                      <button
                        onClick={stopCamera}
                        style={{ background: 'rgba(244,67,54,0.2)', border: '1px solid #f44336', color: '#ff8a65', borderRadius: 10, padding: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {t.btn_stop_camera}
                      </button>
                    </div>
                  )}

                  {capturedPreview && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <button
                        onClick={retakePhoto}
                        style={{ background: '#ff9800', color: '#fff', border: 'none', borderRadius: 10, padding: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {t.btn_retake}
                      </button>
                      <button
                        onClick={usePhoto}
                        style={{ background: '#4caf50', color: '#fff', border: 'none', borderRadius: 10, padding: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {t.btn_use_photo}
                      </button>
                    </div>
                  )}

                  <button
                    onClick={stopCamera}
                    style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '0.75rem', fontWeight: 700, cursor: 'pointer', marginTop: '0.25rem' }}
                  >
                    {t.btn_close}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = { display: 'block', color: '#a5d6a7', fontSize: '.83rem', fontWeight: 600, marginBottom: '.3rem' };
const selectStyle = { width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid #2d5a27', borderRadius: 8, padding: '.65rem 1rem', color: '#e8f5e9', fontSize: '.9rem' };
const inputStyle = { width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid #2d5a27', borderRadius: 8, padding: '.65rem 1rem', color: '#e8f5e9', fontSize: '.9rem', outline: 'none' };
const btnStyle = { width: '100%', background: 'linear-gradient(135deg, #4caf50, #2e7d32)', color: '#fff', border: 'none', borderRadius: 10, padding: '.85rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' };
