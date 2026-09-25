import { useEffect, useState, useRef } from 'react';
import { diseaseAPI, dashboardAPI, weatherAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LanguageContext';

const CROP_NAME_MAP = {
  'Tomato': { ta: 'தக்காளி', en: 'Tomato' },
  'Potato': { ta: 'உருளைக்கிழங்கு', en: 'Potato' },
  'Rice': { ta: 'நெல்', en: 'Rice' },
  'Corn': { ta: 'சோளம்', en: 'Corn (Maize)' },
  'Maize': { ta: 'சோளம்', en: 'Maize' },
  'Apple': { ta: 'ஆப்பிள்', en: 'Apple' },
  'Grape': { ta: 'திராட்சை', en: 'Grape' },
  'Pepper': { ta: 'குடைமிளகாய்', en: 'Bell Pepper' },
  'Bell Pepper': { ta: 'குடைமிளகாய்', en: 'Bell Pepper' },
  'Cotton': { ta: 'பருத்தி', en: 'Cotton' },
  'Groundnut': { ta: 'வேர்க்கடலை', en: 'Groundnut' },
  'Sugarcane': { ta: 'கரும்பு', en: 'Sugarcane' },
  'Wheat': { ta: 'கோதுமை', en: 'Wheat' },
};

const DISEASE_NAME_MAP = {
  'Early Blight': { ta: 'ஆரம்ப கால கருகல் நோய்', en: 'Early Blight' },
  'Late Blight': { ta: 'பிற்கால கருகல் நோய்', en: 'Late Blight' },
  'Bacterial Spot': { ta: 'பாக்டீரியா இலைப்புள்ளி நோய்', en: 'Bacterial Spot' },
  'Leaf Mold': { ta: 'இலை அச்சு நோய்', en: 'Leaf Mold' },
  'Septoria Leaf Spot': { ta: 'செப்டோரியா இலைப்புள்ளி நோய்', en: 'Septoria Leaf Spot' },
  'Spider Mites': { ta: 'சிலந்தி பூச்சி தாக்குதல்', en: 'Spider Mites' },
  'Target Spot': { ta: 'இலக்கு புள்ளி நோய்', en: 'Target Spot' },
  'Yellow Leaf Curl Virus': { ta: 'இலை சுருள் நச்சுயிரி நோய்', en: 'Yellow Leaf Curl Virus' },
  'Mosaic Virus': { ta: 'மொசைக் நச்சுயிரி நோய்', en: 'Mosaic Virus' },
  'Apple Scab': { ta: 'ஆப்பிள் சொறி நோய்', en: 'Apple Scab' },
  'Black Rot': { ta: 'கருப்பு அழுகல் நோய்', en: 'Black Rot' },
  'Cedar Apple Rust': { ta: 'ஆப்பிள் துரு நோய்', en: 'Cedar Apple Rust' },
  'Powdery Mildew': { ta: 'சாம்பல் நோய்', en: 'Powdery Mildew' },
  'Common Rust': { ta: 'துரு நோய்', en: 'Common Rust' },
  'Northern Leaf Blight': { ta: 'வடக்கு இலை கருகல் நோய்', en: 'Northern Leaf Blight' },
  'Esca': { ta: 'கருப்பு அம்மை நோய்', en: 'Esca (Black Measles)' },
  'Leaf Blight': { ta: 'இலை கருகல் நோய்', en: 'Leaf Blight' },
  'Citrus Greening': { ta: 'சிட்ரஸ் கிரீனிங் நோய்', en: 'Citrus Greening' },
  'Healthy': { ta: 'ஆரோக்கியமானது', en: 'Healthy' },
};

export default function DashboardPage() {
  const { lang, setLang } = useLang();

  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [weatherAdvice, setWeatherAdvice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const weatherTimerRef = useRef(null);

  // Latest crop analysis from PredictPage (stored in localStorage)
  const [lastPrediction, setLastPrediction] = useState(() => {
    try { return JSON.parse(localStorage.getItem('last_prediction')); } catch { return null; }
  });

  // Latest Soil & Water AI analysis
  const [lastSoilResult, setLastSoilResult] = useState(() => {
    try { return JSON.parse(localStorage.getItem('last_soil_analysis')); } catch { return null; }
  });
  const [lastWaterResult, setLastWaterResult] = useState(() => {
    try { return JSON.parse(localStorage.getItem('last_water_analysis')); } catch { return null; }
  });

  // Helper translations
  const formatCrop = (name) => {
    if (!name) return lang === 'ta' ? 'பயிர்' : 'Crop';
    const found = CROP_NAME_MAP[name];
    if (found) return lang === 'ta' ? found.ta : found.en;
    return name;
  };

  const formatDisease = (disease) => {
    if (!disease) return lang === 'ta' ? 'கண்டறியப்படவில்லை' : 'Not Diagnosed';
    const found = DISEASE_NAME_MAP[disease];
    if (found) return lang === 'ta' ? found.ta : found.en;
    return disease;
  };

  // Fetch initial dashboard metrics
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [histRes, statsRes, weatherRes] = await Promise.allSettled([
          diseaseAPI.getHistory(),
          dashboardAPI.getStats(),
          weatherAPI.getForecast(13.08, 80.27),
        ]);
        if (histRes.status === 'fulfilled') setHistory(histRes.value.data);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (weatherRes.status === 'fulfilled') setWeatherAdvice(weatherRes.value.data);
      } catch (err) {
        setError(lang === 'ta' ? 'டாஷ்போர்டு தரவை ஏற்றுவதில் தோல்வி ஏற்பட்டது.' : 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Sync soil and water results from localStorage every 5 seconds
    const localSyncInterval = setInterval(() => {
      try {
        const soil = JSON.parse(localStorage.getItem('last_soil_analysis'));
        const water = JSON.parse(localStorage.getItem('last_water_analysis'));
        const pred = JSON.parse(localStorage.getItem('last_prediction'));
        if (soil) setLastSoilResult(soil);
        if (water) setLastWaterResult(water);
        if (pred) setLastPrediction(pred);
      } catch { /* ignore */ }
    }, 5000);

    // Refresh weather every 5 hours
    const fetchWeather = async () => {
      try {
        const res = await weatherAPI.getForecast(13.08, 80.27);
        setWeatherAdvice(res.data);
      } catch (e) { /* ignore */ }
    };
    weatherTimerRef.current = setInterval(fetchWeather, 5 * 60 * 60 * 1000);

    const handleStorage = (e) => {
      if (e.key === 'last_prediction') {
        try { setLastPrediction(JSON.parse(e.newValue)); } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      clearInterval(localSyncInterval);
      if (weatherTimerRef.current) clearInterval(weatherTimerRef.current);
      window.removeEventListener('storage', handleStorage);
    };
  }, [lang]);

  // Build chart data from history
  const diseaseCounts = history.reduce((acc, p) => {
    const dName = p.predicted_disease || 'Unknown';
    acc[dName] = (acc[dName] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(diseaseCounts).map(([name, count]) => ({
    name: lang === 'ta' ? (DISEASE_NAME_MAP[name]?.ta || name) : name,
    count
  }));

  const healthyCount = history.filter((p) => p.is_healthy).length;
  const diseasedCount = history.length - healthyCount;
  const latestPrediction = history.length > 0 ? history[0] : null;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d1f0d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7dd56f', fontSize: '1.2rem' }}>
        ⏳ {lang === 'ta' ? 'டாஷ்போர்டு ஏற்றப்படுகிறது...' : 'Loading dashboard...'}
      </div>
    );
  }

  // Get top 2 weather alerts
  const alerts = weatherAdvice?.recommendations?.filter((r) => r.priority === 'high') || [];

  return (
    <div style={{ minHeight: '100vh', background: '#0d1f0d', padding: '6rem 1.5rem 2rem', color: '#e8f5e9', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Title & Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.1rem', fontWeight: 800, color: '#7dd56f', margin: 0 }}>
              🌾 {lang === 'ta' ? 'விவசாய டாஷ்போர்டு' : 'Smart Crop Dashboard'}
            </h1>
            <p style={{ color: '#81c784', margin: '.25rem 0 0', fontSize: '0.92rem' }}>
              {lang === 'ta'
                ? 'AI பயிர் நோய் கண்டறிதல் · மண் · நீர் · கள மேலாண்மை'
                : 'AI Crop Disease Diagnostics · Soil · Water · Field Analysis'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
            <Link to="/analyzer" style={actionBtnStyle('#4caf50')}>
              🔬 {lang === 'ta' ? 'பகுப்பாய்வி செய்க' : 'Run Analyzer'}
            </Link>
            <Link to="/weather" style={actionBtnStyle('#0277bd')}>
              🌤️ {lang === 'ta' ? 'வானிலை ஆலோசனை' : 'Weather Advisor'}
            </Link>
          </div>
        </div>



        {error && (
          <div style={{ background: 'rgba(244,67,54,0.15)', border: '1px solid #f44336', borderRadius: '8px', padding: '1rem', color: '#ef9a9a', marginBottom: '1.5rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Smart Alerts & Risks Banner */}
        {alerts.length > 0 && (
          <div style={{ background: 'rgba(244,67,54,0.1)', border: '1px solid #f44336aa', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#ef5350', margin: '0 0 .5rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '.4rem' }}>
              🚨 {lang === 'ta' ? 'அவசர விவசாய எச்சரிக்கைகள்' : 'Urgent Farming Alerts'}
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '.88rem', color: '#ffcdd2', lineHeight: 1.6 }}>
              {alerts.map((al, idx) => (
                <li key={idx}><strong>{al.title}:</strong> {al.message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Latest Crop Analysis Summary Card */}
        {lastPrediction?.prediction && (
          <div style={{ background: 'linear-gradient(135deg, #1a2f1a, #1e3b1e)', border: '1.5px solid #388e3c', borderRadius: '20px', padding: '1.75rem', marginBottom: '1.5rem', boxShadow: '0 8px 25px rgba(0,0,0,0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🌱</span>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem', fontWeight: 800, color: '#7dd56f', margin: 0 }}>
                {lang === 'ta' ? 'சமீபத்திய பயிர் பகுப்பாய்வு' : 'Latest Crop Analysis'}
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#81c784', marginLeft: 'auto' }}>
                {new Date(lastPrediction.prediction.timestamp).toLocaleString(lang === 'ta' ? 'ta-IN' : 'en-IN')}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {/* Disease */}
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: '1rem', border: `1px solid ${lastPrediction.prediction.is_healthy ? '#4caf50' : '#ff7043'}44` }}>
                <div style={{ color: '#81c784', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  🔬 {lang === 'ta' ? 'நோய்' : 'Disease'}
                </div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
                  {formatDisease(lastPrediction.prediction.disease)}
                </div>
                <div style={{ color: lastPrediction.prediction.is_healthy ? '#4caf50' : '#ff7043', fontSize: '0.85rem', fontWeight: 700, marginTop: '0.2rem' }}>
                  {lastPrediction.prediction.is_healthy ? (lang === 'ta' ? '✅ ஆரோக்கியமானது' : '✅ Healthy') : (lang === 'ta' ? '⚠️ பாதிக்கப்பட்டது' : '⚠️ Diseased')} — {(lastPrediction.prediction.confidence * 100).toFixed(1)}% {lang === 'ta' ? 'நம்பகத்தன்மை' : 'Confidence'}
                </div>
              </div>
              {/* Soil */}
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: '1rem', border: '1px solid rgba(76,175,80,0.25)' }}>
                <div style={{ color: '#81c784', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  🪨 {lang === 'ta' ? 'மண்' : 'Soil'}
                </div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
                  {lastSoilResult ? (lastSoilResult.ai_soil_class || lastSoilResult.ai_soil_result || lastSoilResult.soil_type || (lang === 'ta' ? 'பகுப்பாய்வு செய்யப்பட்டது' : 'Tested')) : (lang === 'ta' ? 'இன்னும் பகுப்பாய்வு செய்யப்படவில்லை' : 'Not analyzed yet')}
                </div>
                <div style={{ color: '#a5d6a7', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                  {lastSoilResult ? `${lang === 'ta' ? 'AI மண் சோதனை' : 'AI Soil Test'} · ${lastSoilResult.confidence_percent ? lastSoilResult.confidence_percent + '% ' + (lang === 'ta' ? 'நம்பகத்தன்மை' : 'confidence') : ''}` : (lang === 'ta' ? 'மண் பக்கத்தில் பகுப்பாய்வு செய்யவும்' : 'Run soil analysis on Soil page')}
                </div>
              </div>
              {/* Water */}
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: '1rem', border: '1px solid rgba(76,175,80,0.25)' }}>
                <div style={{ color: '#81c784', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  💧 {lang === 'ta' ? 'நீர்' : 'Water'}
                </div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
                  {lastWaterResult ? (lastWaterResult.water_status || lastWaterResult.ai_water_result || lastWaterResult.suitability || (lang === 'ta' ? 'பகுப்பாய்வு செய்யப்பட்டது' : 'Tested')) : (lang === 'ta' ? 'இன்னும் பகுப்பாய்வு செய்யப்படவில்லை' : 'Not analyzed yet')}
                </div>
                <div style={{ color: '#a5d6a7', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                  {lastWaterResult ? `${lang === 'ta' ? 'AI நீர் சோதனை' : 'AI Water Test'} · ${lastWaterResult.confidence_percent ? lastWaterResult.confidence_percent + '% ' + (lang === 'ta' ? 'நம்பகத்தன்மை' : 'confidence') : ''}` : (lang === 'ta' ? 'நீர் பக்கத்தில் பகுப்பாய்வு செய்யவும்' : 'Run water analysis on Water page')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* UNIFIED SMART CROP HEALTH STATUS: AI DIAGNOSTICS + FIELD TELEMETRY */}
        {/* ========================================================================= */}
        <div style={{ background: 'linear-gradient(135deg, #1a2e1a, #1e3a1e)', border: '1px solid #2d5a27', borderRadius: '18px', padding: '1.75rem', marginBottom: '1.5rem', boxShadow: '0 8px 25px rgba(0,0,0,0.35)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ color: '#7dd56f', fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🌾</span> {lang === 'ta' ? 'ஒருங்கிணைந்த ஸ்மார்ட் பயிர் நிலை பகுப்பாய்வு (இலை + மண் + நீர்)' : 'Smart Crop Condition Analysis (AI Disease + Soil + Field Water)'}
            </h3>
            <Link to="/analyzer" style={{ color: '#a5d6a7', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 700 }}>
              {lang === 'ta' ? 'புதிய AI பகுப்பாய்வு செய்க →' : 'Run New AI Analysis →'}
            </Link>
          </div>

          {latestPrediction ? (
            <div>
              {/* 3 Pillars Overview Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', background: 'rgba(0,0,0,0.25)', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(45,90,39,0.3)', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#81c784', textTransform: 'uppercase', fontWeight: 700 }}>
                    🔬 {lang === 'ta' ? 'கண்டறியப்பட்ட பயிர் & நோய்' : 'Diagnosed Crop & Disease'}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: latestPrediction.is_healthy ? '#4caf50' : '#ff7043', marginTop: '0.2rem' }}>
                    {formatDisease(latestPrediction.predicted_disease)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#a5d6a7', marginTop: '0.15rem' }}>
                    {formatCrop(latestPrediction.crop_name)} &bull; {Math.round(latestPrediction.confidence * 100)}% {lang === 'ta' ? 'நம்பகத்தன்மை' : 'Confidence'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: '#81c784', textTransform: 'uppercase', fontWeight: 700 }}>
                    🪨 {lang === 'ta' ? 'மண் AI பகுப்பாய்வு' : 'Soil AI Analysis'}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e8f5e9', marginTop: '0.2rem' }}>
                    {lastSoilResult ? (lastSoilResult.ai_soil_class || lastSoilResult.ai_soil_result || lastSoilResult.soil_type || (lang === 'ta' ? 'பகுப்பாய்வு செய்யப்பட்டது' : 'Analyzed')) : (lang === 'ta' ? 'இன்னும் பகுப்பாய்வு செய்யப்படவில்லை' : 'Not analyzed yet')}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#a5d6a7', marginTop: '0.15rem' }}>
                    {lastSoilResult ? (lastSoilResult.soil_condition || lastSoilResult.soil_summary || (lang === 'ta' ? 'மண் பக்கத்தைப் பார்க்கவும்' : 'View Soil page for details')) : (lang === 'ta' ? 'மண் பகுப்பாய்வுக்கு செல்லவும்' : 'Go to Soil page to run AI analysis')}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: '#81c784', textTransform: 'uppercase', fontWeight: 700 }}>
                    💧 {lang === 'ta' ? 'நீர் AI பகுப்பாய்வு' : 'Water AI Analysis'}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#81d4fa', marginTop: '0.2rem' }}>
                    {lastWaterResult ? (lastWaterResult.water_status || lastWaterResult.ai_water_result || lastWaterResult.suitability || (lang === 'ta' ? 'பகுப்பாய்வு செய்யப்பட்டது' : 'Analyzed')) : (lang === 'ta' ? 'இன்னும் பகுப்பாய்வு செய்யப்படவில்லை' : 'Not analyzed yet')}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#80cbc4', marginTop: '0.15rem' }}>
                    {lastWaterResult ? (lastWaterResult.water_status || (lang === 'ta' ? 'நீர் பக்கத்தைப் பார்க்கவும்' : 'View Water page for details')) : (lang === 'ta' ? 'நீர் பகுப்பாய்வுக்கு செல்லவும்' : 'Go to Water page to run AI analysis')}
                  </div>
                </div>
              </div>

              {/* Combined Farmer-Friendly Recommendation Banner */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(46,125,50,0.3), rgba(27,94,32,0.4))',
                border: '1.5px solid #4caf50',
                borderRadius: '12px',
                padding: '1.1rem 1.25rem'
              }}>
                <div style={{ fontSize: '0.82rem', color: '#7dd56f', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>🎯</span>
                  <span>{lang === 'ta' ? 'ஒருங்கிணைந்த நடைமுறை பரிந்துரை:' : 'Unified Practical Recommendation:'}</span>
                </div>
                <div style={{ fontSize: '0.95rem', color: '#f1f8e9', lineHeight: 1.55, fontWeight: 500 }}>
                  {latestPrediction.smart_crop_analysis?.combined_recommendation ||
                    (latestPrediction.is_healthy
                      ? (lang === 'ta'
                          ? 'பயிர் ஆரோக்கியமாக உள்ளது. மண் மற்றும் நீர் நிலைகள் உகந்ததாக உள்ளன. தொடர் கண்காணிப்பு மற்றும் வழக்கமான நீர்ப்பாசன முறையைப் பராமரிக்கவும்.'
                          : 'Crop appears healthy. Soil and water conditions are currently suitable. Continue regular scouting and maintain standard irrigation.')
                      : (lang === 'ta'
                          ? `${formatDisease(latestPrediction.predicted_disease)} கண்டறியப்பட்டுள்ளது. பரிந்துரைக்கப்பட்ட இயற்கை/வேதி சிகிச்சை முறைகளைப் பின்பற்றவும்.`
                          : `${latestPrediction.predicted_disease} detected. Apply recommended disease management treatment. Maintain controlled irrigation and good drainage.`))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1.5rem', borderRadius: '14px', textAlign: 'center', color: '#a5d6a7', fontSize: '0.92rem' }}>
              {lang === 'ta' ? 'இதுவரை பயிர் கண்டறிதல் பதிவுகள் இல்லை. ' : 'No crop diagnosis on record yet. '}
              <Link to="/analyzer" style={{ color: '#7dd56f', fontWeight: 700 }}>
                {lang === 'ta' ? 'இலை புகைப்படத்தைப் பதிவேற்றி AI பகுப்பாய்வு செய்யுங்கள்' : 'Upload a crop leaf photo'}
              </Link>
            </div>
          )}
        </div>

        {/* Top Section Grid (Weather Widget + Stats) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          
          {/* Weather Advisor Widget */}
          {weatherAdvice && (
            <div style={{ background: 'linear-gradient(135deg, #1a2e1a, #1e3a1e)', border: '1px solid #2d5a27', borderRadius: '16px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ color: '#7dd56f', fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                  ⛅ {lang === 'ta' ? 'வானிலை சுருக்கம்' : 'Weather Summary'}
                </h3>
                <span style={{ fontSize: '.8rem', color: '#a5d6a7', background: 'rgba(0,0,0,0.3)', padding: '.25rem .6rem', borderRadius: '20px' }}>
                  {lang === 'ta' ? '14-நாள் கண்ணோட்டம்' : '14-Day Outlook'}
                </span>
              </div>
              <p style={{ fontSize: '.9rem', color: '#c8e6c9', lineHeight: 1.6, margin: '0 0 1rem' }}>
                {weatherAdvice.summary}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem', fontSize: '.85rem' }}>
                <div style={weatherStatStyle}>🌧️ {lang === 'ta' ? 'மழை' : 'Rain'}: <strong>{weatherAdvice.statistics.total_rain_mm} mm</strong></div>
                <div style={weatherStatStyle}>🌡️ {lang === 'ta' ? 'அதிகபட்ச வெப்பம்' : 'Max Temp'}: <strong>{weatherAdvice.statistics.max_temp}°C</strong></div>
                <div style={weatherStatStyle}>💧 {lang === 'ta' ? 'ஈரப்பதம்' : 'Humidity'}: <strong>{weatherAdvice.statistics.avg_humidity_pct}%</strong></div>
                <div style={weatherStatStyle}>🌂 {lang === 'ta' ? 'மழை நாட்கள்' : 'Rainy Days'}: <strong>{weatherAdvice.statistics.rainy_days} {lang === 'ta' ? 'நாட்கள்' : 'days'}</strong></div>
              </div>
            </div>
          )}

          {/* Core Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { label: lang === 'ta' ? 'மொத்த பகுப்பாய்வு' : 'Total Analyzed', value: history.length, icon: '🔬', color: '#4caf50' },
              { label: lang === 'ta' ? 'ஆரோக்கியமான பயிர்கள்' : 'Healthy Crops', value: healthyCount, icon: '✅', color: '#66bb6a' },
              { label: lang === 'ta' ? 'கண்டறியப்பட்ட நோய்கள்' : 'Diseases Detected', value: diseasedCount, icon: '🦠', color: '#ff7043' },
              { label: lang === 'ta' ? 'AI உதவியாளர்' : 'Chat Assistant', value: lang === 'ta' ? 'இணைப்பில்' : 'Online', icon: '🤖', color: '#ffa726', link: '/chatbot' },
            ].map((s, idx) => (
              s.link ? (
                <Link to={s.link} key={idx} style={{
                  background: 'linear-gradient(135deg, #1a2e1a, #1e3a1e)',
                  border: '1px solid #2d5a27', borderRadius: '14px', padding: '1.25rem', textAlign: 'center', textDecoration: 'none'
                }}>
                  <div style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{s.icon}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, fontFamily: 'Outfit, sans-serif' }}>{s.value}</div>
                  <div style={{ color: '#a5d6a7', fontSize: '0.8rem', marginTop: '0.25rem' }}>{s.label}</div>
                </Link>
              ) : (
                <div key={idx} style={{
                  background: 'linear-gradient(135deg, #1a2e1a, #1e3a1e)',
                  border: '1px solid #2d5a27', borderRadius: '14px', padding: '1.25rem', textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{s.icon}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, fontFamily: 'Outfit, sans-serif' }}>{s.value}</div>
                  <div style={{ color: '#a5d6a7', fontSize: '0.8rem', marginTop: '0.25rem' }}>{s.label}</div>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Middle Section: Chart & Quick Recommendations */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          
          {/* Bar Chart */}
          {chartData.length > 0 && (
            <div style={{ background: 'linear-gradient(135deg, #1a2e1a, #1e3a1e)', border: '1px solid #2d5a27', borderRadius: '16px', padding: '1.5rem' }}>
              <h2 style={{ color: '#7dd56f', fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                🦠 {lang === 'ta' ? 'நோய் பரவல் அதிர்வெண்' : 'Disease Frequency'}
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fill: '#a5d6a7', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#a5d6a7', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: '#1a2e1a', border: '1px solid #4caf50', borderRadius: '8px', color: '#e8f5e9' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={i % 2 === 0 ? '#4caf50' : '#66bb6a'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Quick Recommendations & Advice */}
          <div style={{ background: 'linear-gradient(135deg, #1a2e1a, #1e3a1e)', border: '1px solid #2d5a27', borderRadius: '16px', padding: '1.5rem' }}>
            <h2 style={{ color: '#7dd56f', fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
              💡 {lang === 'ta' ? 'இன்றைய உடனடி விவசாய பரிந்துரைகள்' : "Today's Quick Recommendations"}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              <div style={recBlockStyle}>
                <strong>🌱 {lang === 'ta' ? 'நடுதல் நிலை:' : 'Planting Status:'}</strong> {lang === 'ta' ? 'இந்த வாரம் நடுவதற்கு ஏற்ற நாட்கள் உள்ளன. விரிவான விவரங்களுக்கு \'வானிலை ஆலோசனை\' பார்க்கவும்.' : "Suitable days detected this week. Click 'Weather Advisor' for details."}
              </div>
              <div style={recBlockStyle}>
                <strong>💧 {lang === 'ta' ? 'நீர்ப்பாசனம்:' : 'Irrigation:'}</strong> {lang === 'ta' ? 'அதிகாலையில் செடியின் அடிப்பகுதியில் நீர் பாய்ச்சவும். மாற்று நனைத்தல்/உலர்த்துதல் முறையைப் பயன்படுத்தவும்.' : 'Water at the base in early morning. Alternate wetting/drying.'}
              </div>
              <div style={recBlockStyle}>
                <strong>🍃 {lang === 'ta' ? 'ஊட்டச்சத்து நடவடிக்கை:' : 'Nutrient Action:'}</strong> {lang === 'ta' ? 'நைட்ரஜன் குறைபாடு இலை மஞ்சள் நிறத்தைக் கண்காணிக்கவும். மண்புழு உரம் இடவும்.' : 'Monitor for nitrogen yellowing. Apply compost/vermicompost top-dress.'}
              </div>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div style={{ background: 'linear-gradient(135deg, #1a2e1a, #1e3a1e)', border: '1px solid #2d5a27', borderRadius: '16px', padding: '1.5rem' }}>
          <h2 style={{ color: '#7dd56f', fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            🕒 {lang === 'ta' ? 'கணிப்பு வரலாறு' : 'Prediction History'}
          </h2>
          {history.length === 0 ? (
            <p style={{ color: '#6a9f6a', textAlign: 'center', padding: '2rem 0' }}>
              {lang === 'ta' ? 'இதுவரை கணிப்புகள் இல்லை. ' : 'No predictions yet. '}
              <Link to="/analyzer" style={{ color: '#7dd56f' }}>
                {lang === 'ta' ? 'முதல் கணிப்பைச் செய்யுங்கள் →' : 'Make your first prediction →'}
              </Link>
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2d5a27' }}>
                    {[
                      lang === 'ta' ? 'தேதி' : 'Date',
                      lang === 'ta' ? 'பயிர்' : 'Crop',
                      lang === 'ta' ? 'நோய்' : 'Disease',
                      lang === 'ta' ? 'நம்பகத்தன்மை' : 'Confidence',
                      lang === 'ta' ? 'நிலை' : 'Status'
                    ].map((h) => (
                      <th key={h} style={{ color: '#7dd56f', fontWeight: 600, padding: '0.75rem 1rem', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((p, i) => (
                    <tr key={p.id || i} style={{ borderBottom: '1px solid rgba(45,90,39,0.4)' }}>
                      <td style={{ padding: '0.75rem 1rem', color: '#a5d6a7' }}>
                        {new Date(p.created_at).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-IN')}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#e8f5e9' }}>{formatCrop(p.crop_name) || '—'}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#e8f5e9', fontWeight: 500 }}>{formatDisease(p.predicted_disease)}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#7dd56f', fontWeight: 700 }}>
                        {Math.round(p.confidence * 100)}%
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{
                          background: p.is_healthy ? 'rgba(76,175,80,0.2)' : 'rgba(255,112,67,0.2)',
                          color: p.is_healthy ? '#4caf50' : '#ff7043',
                          border: `1px solid ${p.is_healthy ? '#4caf50' : '#ff7043'}`,
                          borderRadius: '20px',
                          padding: '0.2rem 0.7rem',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}>
                          {p.is_healthy ? (lang === 'ta' ? '✅ ஆரோக்கியமானது' : '✅ Healthy') : (lang === 'ta' ? '🦠 பாதிக்கப்பட்டது' : '🦠 Diseased')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const actionBtnStyle = (color) => ({
  background: color,
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  padding: '.5rem 1rem',
  fontWeight: 600,
  fontSize: '.85rem',
  textDecoration: 'none',
  display: 'inline-block',
  boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
});

const weatherStatStyle = {
  background: 'rgba(0,0,0,0.25)',
  padding: '.6rem',
  borderRadius: '8px',
  border: '1px solid rgba(45,90,39,0.3)',
  color: '#e8f5e9'
};

const recBlockStyle = {
  background: 'rgba(0,0,0,0.2)',
  padding: '.8rem 1rem',
  borderRadius: '10px',
  borderLeft: '4px solid #7dd56f',
  color: '#c8e6c9',
  fontSize: '.88rem',
  lineHeight: 1.5
};


