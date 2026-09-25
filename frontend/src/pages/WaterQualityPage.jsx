import { useState, useRef, useEffect } from 'react';
import { advisorAPI } from '../services/api';

const TRANSLATIONS = {
  ta: {
    title: "💧 நீர் தரம் பகுப்பாய்வு",
    subtitle: "கைமுறை அளவுருக்களைப் பயன்படுத்தி அல்லது புகைப்படத்தைப் பயன்படுத்தி நீர்ப்பாசன நீரை மதிப்பீடு செய்யுங்கள்",
    tab_manual: "📊 கைமுறை பகுப்பாய்வு",
    tab_manual_desc: "நீர் அளவுருக்களை உள்ளிடவும்",
    tab_ai: "📸 AI பட பகுப்பாய்வு",
    tab_ai_desc: "நீரின் புகைப்படத்தை எடுக்கவும்/பதிவேற்றவும்",
    
    // Manual Form labels
    ph: "நீர் pH",
    tds: "TDS அளவு (ppm / mg/L)",
    ec: "மின் கடத்துத்திறன் (EC dS/m)",
    salinity: "உவர்ப்புத் தன்மை அபாயம்",
    hardness: "நீர் கடினத்தன்மை",
    btn_analyze_manual: "💧 நீர் தரத்தை பகுப்பாய்வு செய்",
    analyzing_manual: "🔬 நீர் தரவு பகுப்பாய்வு செய்யப்படுகிறது...",
    
    // AI Section
    ai_banner: "🤖 AI நீர் பட பகுப்பாய்வு — உங்கள் நீர் ஆதாரத்தின் புகைப்படத்தை எடுக்கவும் அல்லது பதிவேற்றவும். AI அதன் காட்சி தன்மையை பகுப்பாய்வு செய்து பரிந்துரைகளை வழங்கும்.",
    btn_upload: "📁 படம் பதிவேற்றவும்",
    upload_desc: "JPG, PNG, WEBP கோப்புகள்",
    btn_camera: "📷 கேமரா",
    camera_desc: "சாதன கேமராவைப் பயன்படுத்தவும்",
    btn_usb_camera: "🔌 USB கேமரா",
    usb_camera_desc: "USB வெப்கேமரா பயன்படுத்தவும்",
    btn_analyze_ai: "🔬 நீர் படத்தை பகுப்பாய்வு செய்",
    analyzing_ai: "🔬 நீர் படம் பகுப்பாய்வு செய்யப்படுகிறது...",
    btn_clear: "துடைக்கவும்",
    
    // Results
    result_status: "நிலை",
    result_suitability: "உகந்த தன்மை:",
    result_tested_ph: "சோதிக்கப்பட்ட pH:",
    result_recommended_crops: "🌾 பரிந்துரைக்கப்படும் பயிர்கள்",
    result_risks: "🚨 சாத்தியமான அபாயங்கள்",
    result_precautions: "🛡️ பரிந்துரைக்கப்படும் முன்னெச்சரிக்கைகள்",
    
    // AI results keys
    ai_prediction: "AI பகுப்பாய்வு",
    ai_observed_color: "கண்டறியப்பட்ட நிறம்:",
    ai_observed_clarity: "காட்சித் தெளிவு:",
    ai_disclaimer: "முக்கியம்: காட்சித் தெளிவு மட்டுமே இரசாயன பாதுகாப்பிற்கு உத்தரவாதம் அளிக்காது.",
    
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
    title: "💧 Water Quality Analysis",
    subtitle: "Evaluate irrigation water using parameters or AI image prediction",
    tab_manual: "📊 Manual Analysis",
    tab_manual_desc: "Enter water parameters",
    tab_ai: "📸 AI Image Analysis",
    tab_ai_desc: "Upload/capture water photo",
    
    // Manual Form labels
    ph: "Water pH",
    tds: "TDS (ppm / mg/L)",
    ec: "EC (dS/m)",
    salinity: "Salinity Risk",
    hardness: "Hardness",
    btn_analyze_manual: "💧 Analyze Water Quality",
    analyzing_manual: "🔬 Analyzing Water Data...",
    
    // AI Section
    ai_banner: "🤖 AI Water Image Analysis — Capture or upload a photo of your water source (irrigation channel, tank, pond, borewell). AI will analyze the visible water condition and provide recommendations.",
    btn_upload: "📁 Upload Image",
    upload_desc: "JPG, PNG, WEBP files",
    btn_camera: "📷 Camera",
    camera_desc: "Use device camera",
    btn_usb_camera: "🔌 USB Camera",
    usb_camera_desc: "Use USB Webcam",
    btn_analyze_ai: "🔬 Analyze Water Image",
    analyzing_ai: "🔬 Analyzing Water Image...",
    btn_clear: "Clear",
    
    // Results
    result_status: "STATUS",
    result_suitability: "Suitability:",
    result_tested_ph: "Tested pH:",
    result_recommended_crops: "🌾 Recommended Crops",
    result_risks: "🚨 Possible Risks",
    result_precautions: "🛡️ Recommended Precautions",
    
    // AI results keys
    ai_prediction: "AI ANALYSIS",
    ai_observed_color: "Observed color:",
    ai_observed_clarity: "Visual clarity:",
    ai_disclaimer: "Important: Visual clarity alone does not guarantee chemical safety.",
    
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

export default function WaterQualityPage() {
  const [lang, setLang] = useState(localStorage.getItem('selected_lang') || 'ta');
  const t = TRANSLATIONS[lang];

  const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'ai'

  // ── Manual Analysis State ──────────────────────────────────────────────────
  const [form, setForm] = useState({ ph: '7.2', tds: '450', ec: '0.8', salinity: 'Low', hardness: 'Moderate', CO3: '0', HCO3: '250', Cl: '100', SO4: '50', NO3: '15', TH: '200', Ca: '60', Mg: '30', Na: '50', K: '5', F: '0.5' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── AI Image Analysis State ────────────────────────────────────────────────
  const [waterImage, setWaterImage] = useState(null);
  const [waterPreview, setWaterPreview] = useState(null);
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
      const res = await advisorAPI.analyzeWater(form);
      setResult(res.data);
      localStorage.setItem('last_water_analysis', JSON.stringify(res.data));
    } catch (err) {
      setError(err.response?.data?.error || 'Water analysis failed.');
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
    setWaterImage(file);
    setWaterPreview(URL.createObjectURL(file));
    setAiResult(null);
    setAiError('');
  };

  const handleAIAnalyze = async () => {
    if (!waterImage) { setAiError('Please select or capture a water image first.'); return; }
    setAiLoading(true);
    setAiError('');
    const fd = new FormData();
    fd.append('image', waterImage);
    try {
      const res = await advisorAPI.analyzeWaterImage(fd);
      setAiResult(res.data);
      const formattedWater = {
        ai_water_result: res.data.water_status || 'Visual Assessment',
        analysis_type: res.data.analysis_type || 'AI Visual Surface Estimate',
        suitability: res.data.suitability || res.data.water_status,
        water_status: res.data.water_status,
        ph: null,
        tds_ppm: null,
        recommended_crops: ["Rice", "Maize", "Tomato", "Potato", "Groundnut"],
        risks: res.data.risks || [],
        precautions: res.data.recommendations || [],
        observations: res.data.observations || [],
        chemical_parameters: "Data unavailable (Requires lab test)"
      };
      localStorage.setItem('last_water_analysis', JSON.stringify(formattedWater));
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

  const clearAI = () => { setWaterImage(null); setWaterPreview(null); setAiResult(null); setAiError(''); };

  return (
    <div style={{ minHeight: '100vh', background: '#0d1f0d', padding: '6rem 1.5rem 2rem', fontFamily: 'Inter, sans-serif', color: '#e8f5e9' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

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
                  ? 'linear-gradient(135deg, #0288d1, #01579b)'
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>{t.ph}</label>
                  <input type="number" step="0.1" name="ph" value={form.ph} onChange={handleChange} placeholder="e.g. 7.2" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t.tds}</label>
                  <input type="number" name="tds" value={form.tds} onChange={handleChange} placeholder="e.g. 450" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t.ec}</label>
                  <input type="number" step="0.1" name="ec" value={form.ec} onChange={handleChange} placeholder="e.g. 0.8" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t.salinity}</label>
                  <select name="salinity" value={form.salinity} onChange={handleChange} style={selectStyle}>
                    <option value="Low">{formatText("Low")}</option>
                    <option value="Moderate">{formatText("Moderate")}</option>
                    <option value="High">{formatText("High")}</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{t.hardness}</label>
                  <select name="hardness" value={form.hardness} onChange={handleChange} style={selectStyle}>
                    <option value="Soft">{formatText("Soft")}</option>
                    <option value="Moderate">{formatText("Moderate")}</option>
                    <option value="Hard">{formatText("Hard")}</option>
                  </select>
                </div>
              </div>

              {/* === AI Water Quality Parameters (Groundwater Chemistry) === */}
              <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid #2d5a2766', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1rem' }}>
                <div style={{ color: '#81d4fa', fontWeight: 700, fontSize: '.88rem', marginBottom: '.5rem' }}>
                  🧪 {lang === 'ta' ? 'AI நீர் தர கணிப்புக்கான நீர் வேதியியல் மதிப்புகள்' : 'Water Chemistry for AI Groundwater Quality Prediction'}
                </div>
                <div style={{ color: '#a5d6a7', fontSize: '.76rem', marginBottom: '.75rem', opacity: 0.8 }}>
                  {lang === 'ta' ? 'இந்த மதிப்புகள் நீர் ஆய்வக அறிக்கையிலிருந்து பெறப்படும். இயல்புநிலை மதிப்புகள் மாதிரி பகுப்பாய்வுக்கு வழங்கப்பட்டுள்ளன.' : 'These values come from your water test report. Default values provided for sample analysis. Model trained on 19,029 groundwater samples across India.'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '.65rem' }}>
                  {[
                    {name:'CO3', label:'CO3 - Carbonate (mg/L)', val:'0', placeholder:'e.g. 0'},
                    {name:'HCO3', label:'HCO3 - Bicarbonate (mg/L)', val:'250', placeholder:'e.g. 250'},
                    {name:'Cl', label:'Cl - Chloride (mg/L)', val:'100', placeholder:'e.g. 100'},
                    {name:'SO4', label:'SO4 - Sulphate (mg/L)', val:'50', placeholder:'e.g. 50'},
                    {name:'NO3', label:'NO3 - Nitrate (mg/L)', val:'15', placeholder:'e.g. 15'},
                    {name:'TH', label:'TH - Total Hardness (mg/L)', val:'200', placeholder:'e.g. 200'},
                    {name:'Ca', label:'Ca - Calcium (mg/L)', val:'60', placeholder:'e.g. 60'},
                    {name:'Mg', label:'Mg - Magnesium (mg/L)', val:'30', placeholder:'e.g. 30'},
                    {name:'Na', label:'Na - Sodium (mg/L)', val:'50', placeholder:'e.g. 50'},
                    {name:'K', label:'K - Potassium (mg/L)', val:'5', placeholder:'e.g. 5'},
                    {name:'F', label:'F - Fluoride (mg/L)', val:'0.5', placeholder:'e.g. 0.5'},
                  ].map(field => (
                    <div key={field.name}>
                      <label style={{...labelStyle, fontSize: '.76rem'}}>{field.label}</label>
                      <input
                        type="number"
                        step="0.01"
                        name={field.name}
                        value={form[field.name] !== undefined ? form[field.name] : field.val}
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
                {/* AI Water Quality Prediction Banner */}
                {result.ai_water_result && (
                  <div style={{ background: 'rgba(13,71,161,0.7)', border: '2px solid #2196f3', borderRadius: 20, padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ color: '#90caf9', fontSize: '.85rem', fontWeight: 600, marginBottom: '.5rem', letterSpacing: 1 }}>
                      🤖 {lang === 'ta' ? 'AI நீர் தர வகைப்பாடு' : 'AI GROUNDWATER QUALITY CLASSIFICATION'}
                    </div>
                    <div style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 900, marginBottom: '.4rem' }}>
                      💧 {result.ai_water_result}
                    </div>
                    <div style={{ color: '#90caf9', fontSize: '.9rem', marginBottom: '.3rem' }}>
                      {lang === 'ta' ? 'நம்பகத்தன்மை' : 'Confidence'}: <strong style={{color:'#fff'}}>{result.confidence_percent || (result.confidence ? (result.confidence * 100).toFixed(1) : 'N/A')}%</strong>
                    </div>
                    <div style={{ color: '#81d4fa', fontSize: '.82rem', opacity: 0.85 }}>
                      {result.analysis_type || 'AI Model Classification'} · 97.14% Accuracy
                    </div>
                    {result.water_status && (
                      <div style={{ marginTop: '.75rem', background: 'rgba(0,0,0,0.25)', borderRadius: 10, padding: '.6rem 1rem', color: '#b3e5fc', fontSize: '.88rem' }}>
                        📊 {result.water_status}
                      </div>
                    )}
                    {result.suitability && (
                      <div style={{ marginTop: '.5rem', background: 'rgba(33,150,243,0.1)', border: '1px solid #2196f344', borderRadius: 10, padding: '.6rem 1rem', color: '#e3f2fd', fontSize: '.85rem' }}>
                        🌾 {result.suitability}
                      </div>
                    )}
                  </div>
                )}
                <div style={{ background: 'linear-gradient(135deg, #1e3a1e, #1a2e1a)', border: '1px solid #4caf50', borderRadius: 20, padding: '1.5rem' }}>
                  <span style={{ fontSize: '.8rem', color: '#a5d6a7', fontWeight: 600, letterSpacing: 1 }}>{t.result_status.toUpperCase()}</span>
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#7dd56f', fontWeight: 800, fontSize: '1.5rem', margin: '.2rem 0 .5rem' }}>
                    ✅ {formatText(result.suitability || result.ai_water_result)}
                  </h2>
                  <div style={{ fontSize: '.9rem', color: '#c8e6c9' }}>
                    {t.result_tested_ph} <strong>{result.ph || 'N/A'}</strong> | TDS: <strong>{result.tds_ppm ? `${result.tds_ppm} ppm` : 'N/A'}</strong>
                  </div>
                </div>
                <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 20, padding: '1.5rem' }}>
                  <h3 style={{ color: '#7dd56f', fontFamily: 'Outfit, sans-serif', fontWeight: 700, margin: '0 0 .75rem' }}>{t.result_recommended_crops}</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                    {result.recommended_crops?.map((c) => (
                      <span key={c} style={{ background: '#4caf5022', border: '1px solid #4caf50', color: '#a5d6a7', padding: '.35rem .9rem', borderRadius: 20, fontSize: '.9rem', fontWeight: 600 }}>{formatText(c)}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 16, padding: '1.25rem' }}>
                    <h3 style={{ color: '#ef9a9a', fontSize: '1rem', fontWeight: 700, margin: '0 0 .75rem' }}>{t.result_risks}</h3>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#c8e6c9', fontSize: '.88rem', lineHeight: 1.6 }}>
                      {result.risks?.map((r, i) => <li key={i}>{formatText(r)}</li>)}
                    </ul>
                  </div>
                  <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 16, padding: '1.25rem' }}>
                    <h3 style={{ color: '#81c784', fontSize: '1rem', fontWeight: 700, margin: '0 0 .75rem' }}>{t.result_precautions}</h3>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#c8e6c9', fontSize: '.88rem', lineHeight: 1.6 }}>
                      {result.precautions?.map((p, i) => <li key={i}>{formatText(p)}</li>)}
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
            <div style={{ background: 'rgba(2,136,209,0.1)', border: '1px solid #0288d1', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.5rem', fontSize: '.88rem', color: '#81d4fa' }}>
              {t.ai_banner}
            </div>

            {/* Upload / Camera */}
            <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 20, padding: '1.75rem', marginBottom: '1.5rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => uploadRef.current.click()}
                  style={{ background: 'rgba(0,0,0,0.3)', border: '2px dashed #2d5a27', borderRadius: 14, padding: '1rem', cursor: 'pointer', color: '#a5d6a7', fontSize: '.95rem', fontWeight: 600, textAlign: 'center' }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '.2rem' }}>📁</div>
                  {t.btn_upload}
                  <div style={{ fontSize: '.7rem', fontWeight: 400, marginTop: '.1rem', opacity: .8 }}>{t.upload_desc}</div>
                </button>
                <button
                  type="button"
                  onClick={() => openCamera(false)}
                  style={{ background: 'rgba(76,175,80,0.1)', border: '2px dashed #4caf50', borderRadius: 14, padding: '1rem', cursor: 'pointer', color: '#7dd56f', fontSize: '.95rem', fontWeight: 600, textAlign: 'center' }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '.2rem' }}>📷</div>
                  {t.btn_camera}
                  <div style={{ fontSize: '.7rem', fontWeight: 400, marginTop: '.1rem', opacity: .8 }}>{t.camera_desc}</div>
                </button>
                <button
                  type="button"
                  onClick={() => openCamera(true)}
                  style={{ background: 'rgba(0,188,212,0.1)', border: '2px dashed #00bcd4', borderRadius: 14, padding: '1rem', cursor: 'pointer', color: '#00e5ff', fontSize: '.95rem', fontWeight: 600, textAlign: 'center' }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '.2rem' }}>🔌</div>
                  {t.btn_usb_camera}
                  <div style={{ fontSize: '.7rem', fontWeight: 400, marginTop: '.1rem', opacity: .8 }}>{t.usb_camera_desc}</div>
                </button>
              </div>

              {/* Hidden file input */}
              <input ref={uploadRef} type="file" accept="image/*" hidden onChange={(e) => handleImageFile(e.target.files[0])} />

              {/* Image Preview */}
              {waterPreview && (
                <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
                  <img src={waterPreview} alt="Water preview" style={{ maxHeight: 220, maxWidth: '100%', borderRadius: 12, objectFit: 'contain', border: '1px solid #2d5a27' }} />
                  <div style={{ marginTop: '.5rem', color: '#81c784', fontSize: '.82rem' }}>{waterImage?.name}</div>
                </div>
              )}

              {aiError && (
                <div style={{ background: 'rgba(244,67,54,0.12)', border: '1px solid #f44336', borderRadius: 10, padding: '.8rem 1rem', color: '#ef9a9a', marginBottom: '1rem', fontSize: '.88rem' }}>
                  ⚠️ {aiError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '.75rem' }}>
                <button onClick={handleAIAnalyze} disabled={aiLoading || !waterImage} style={{
                  flex: 1,
                  background: aiLoading || !waterImage ? '#3a5a3a' : 'linear-gradient(135deg, #0288d1, #01579b)',
                  color: '#fff', border: 'none', borderRadius: 10, padding: '.85rem',
                  fontWeight: 700, fontSize: '1rem', cursor: aiLoading || !waterImage ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(2,136,209,0.3)',
                }}>
                  {aiLoading ? t.analyzing_ai : t.btn_analyze_ai}
                </button>
                {waterImage && (
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
                <div style={{ background: 'linear-gradient(135deg, #102a3d, #0b1c2b)', border: '1px solid #0288d1', borderRadius: 20, padding: '1.5rem' }}>
                  <div style={{ fontSize: '.8rem', color: '#81d4fa', fontWeight: 600, letterSpacing: 1 }}>{t.ai_prediction.toUpperCase()}</div>
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#00e5ff', fontWeight: 800, fontSize: '1.6rem', margin: '.25rem 0 .5rem' }}>
                    💧 {formatText(aiResult.suitability)}
                  </h2>
                  <div style={{ fontSize: '.88rem', color: '#81d4fa', marginBottom: '.75rem' }}>
                    {t.ai_observed_color} <strong style={{ color: '#00e5ff' }}>{formatText(aiResult.water_color_observed)}</strong>
                    {' · '}{t.ai_observed_clarity} <strong style={{ color: '#00e5ff' }}>{formatText(aiResult.water_clarity_observed)}</strong>
                  </div>
                </div>

                {/* Recommendations */}
                <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 16, padding: '1.25rem' }}>
                  <h3 style={{ color: '#7dd56f', fontSize: '1rem', fontWeight: 700, margin: '0 0 .75rem' }}>{t.result_recommended_crops}</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                    {aiResult.recommended_crops?.map((c) => (
                      <span key={c} style={{ background: '#4caf5022', border: '1px solid #4caf50', color: '#a5d6a7', padding: '.3rem .8rem', borderRadius: 20, fontSize: '.88rem', fontWeight: 600 }}>{formatText(c)}</span>
                    ))}
                  </div>
                </div>

                {/* Risks / Precautions */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 16, padding: '1.25rem' }}>
                    <h3 style={{ color: '#ef9a9a', fontSize: '1rem', fontWeight: 700, margin: '0 0 .75rem' }}>{t.result_risks}</h3>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#c8e6c9', fontSize: '.88rem', lineHeight: 1.6 }}>
                      {aiResult.risks?.map((r, i) => <li key={i}>{formatText(r)}</li>)}
                    </ul>
                  </div>
                  <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 16, padding: '1.25rem' }}>
                    <h3 style={{ color: '#81c784', fontSize: '1rem', fontWeight: 700, margin: '0 0 .75rem' }}>{t.result_precautions}</h3>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#c8e6c9', fontSize: '.88rem', lineHeight: 1.6 }}>
                      {aiResult.recommendations?.map((p, i) => <li key={i}>{formatText(p)}</li>)}
                    </ul>
                  </div>
                </div>

                {/* Disclaimer */}
                <div style={{ background: 'rgba(2,136,209,0.08)', border: '1px solid #0288d144', borderRadius: 12, padding: '1rem', color: '#81d4fa', fontSize: '.82rem', lineHeight: 1.6 }}>
                  ⚠️ {t.ai_disclaimer} {formatText(aiResult.disclaimer)}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* In-page Camera Modal */}
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

const labelStyle = { display: 'block', color: '#b3e5fc', fontSize: '.85rem', fontWeight: 600, marginBottom: '.3rem' };
const selectStyle = { width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid #0277bd', borderRadius: 8, padding: '.65rem 1rem', color: '#e8f5e9', fontSize: '.9rem' };
const inputStyle = { width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid #0277bd', borderRadius: 8, padding: '.65rem 1rem', color: '#e8f5e9', fontSize: '.9rem', outline: 'none' };
const btnStyle = { width: '100%', background: 'linear-gradient(135deg, #0288d1, #01579b)', color: '#fff', border: 'none', borderRadius: 10, padding: '.85rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' };
