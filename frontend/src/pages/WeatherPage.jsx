import { useState, useEffect } from 'react';
import { weatherAPI } from '../services/api';
import { useLang } from '../contexts/LanguageContext';
import { tr } from '../i18n/translations';

const RISK_CONFIG = {
  Low: { color: '#4caf50', bg: 'rgba(76,175,80,0.1)', icon: '✅' },
  Medium: { color: '#ff9800', bg: 'rgba(255,152,0,0.1)', icon: '⚠️' },
  High: { color: '#f44336', bg: 'rgba(244,67,54,0.1)', icon: '🔴' },
};

const PRIORITY_COLOR = { high: '#f44336', medium: '#ff9800', low: '#4caf50' };

const QUICK_LOCATIONS = [
  { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Coimbatore', lat: 11.0168, lon: 76.9558 },
  { name: 'Madurai', lat: 9.9252, lon: 78.1198 },
  { name: 'Tiruchirappalli', lat: 10.7905, lon: 78.7047 },
  { name: 'Salem', lat: 11.6643, lon: 78.1460 },
];

export default function WeatherPage() {
  const { lang } = useLang();
  const t = tr(lang);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationStatus, setLocationStatus] = useState('idle'); // idle | getting | got | error
  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');
  const [activeDay, setActiveDay] = useState(null);
  const [showManual, setShowManual] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Chennai');

  const fetchWeather = async (lat, lon) => {
    setLoading(true);
    setError('');
    try {
      const res = await weatherAPI.getForecast(lat, lon);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch weather data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch default location on mount so weather page never sits empty
  useEffect(() => {
    fetchWeather(13.0827, 80.2707);
  }, []);

  const getLocation = () => {
    setLocationStatus('getting');
    setError('');
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Please enter coordinates manually.');
      setLocationStatus('error');
      setShowManual(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationStatus('got');
        setSelectedCity('GPS Location');
        fetchWeather(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setError('Location access denied. Loaded default location forecast.');
        setLocationStatus('error');
        setShowManual(true);
      }
    );
  };

  const handleManualSubmit = () => {
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    if (isNaN(lat) || isNaN(lon)) { setError('Please enter valid latitude and longitude.'); return; }
    setSelectedCity(`${lat.toFixed(2)}, ${lon.toFixed(2)}`);
    fetchWeather(lat, lon);
  };

  const handleSelectCity = (loc) => {
    setSelectedCity(loc.name);
    fetchWeather(loc.lat, loc.lon);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0d1f0d', padding: '6rem 1.5rem 2rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, color: '#7dd56f', margin: 0 }}>
            🌤️ {lang === 'ta' ? 'வானிலை அடிப்படையிலான விவசாய ஆலோசனை' : 'Weather-Based Farming Advisor'}
          </h1>
          <p style={{ color: '#81c784', marginTop: '.5rem' }}>
            {lang === 'ta' ? 'உண்மையான வானிலை முன்னறிவிப்பின் அடிப்படையில் 14 நாள் ஸ்மார்ட் விவசாயப் பரிந்துரைகள்' : '14-day smart farming recommendations based on real weather forecast'}
          </p>
        </div>

        {/* Quick Location Pills & Actions */}
        <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 20, padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <span style={{ color: '#a5d6a7', fontSize: '0.85rem', fontWeight: 600 }}>📍 {lang === 'ta' ? 'இடம்:' : 'Location:'} </span>
              <span style={{ color: '#7dd56f', fontWeight: 800, fontSize: '0.95rem' }}>{selectedCity}</span>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {QUICK_LOCATIONS.map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => handleSelectCity(loc)}
                  style={{
                    background: selectedCity === loc.name ? 'linear-gradient(135deg, #4caf50, #2e7d32)' : 'rgba(0,0,0,0.3)',
                    color: selectedCity === loc.name ? '#fff' : '#a5d6a7',
                    border: '1px solid #2d5a27', borderRadius: 8, padding: '0.35rem 0.75rem',
                    fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  {loc.name}
                </button>
              ))}
              <button
                onClick={getLocation}
                disabled={locationStatus === 'getting'}
                style={{
                  background: 'rgba(76,175,80,0.15)', color: '#7dd56f',
                  border: '1px solid #4caf50', borderRadius: 8, padding: '0.35rem 0.75rem',
                  fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer'
                }}
              >
                {locationStatus === 'getting' ? '📡 Getting...' : '📍 GPS'}
              </button>
              <button
                onClick={() => setShowManual(!showManual)}
                style={{ background: 'transparent', color: '#66bb6a', border: '1px solid #2d5a27', borderRadius: 8, padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '.82rem' }}
              >
                ✏️ {lang === 'ta' ? 'கையாள்' : 'Custom Lat/Lon'}
              </button>
            </div>
          </div>

          {showManual && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '.75rem', justifyContent: 'center', flexWrap: 'wrap', borderTop: '1px dashed #2d5a27', paddingTop: '1rem' }}>
              <input value={manualLat} onChange={(e) => setManualLat(e.target.value)}
                placeholder="Latitude (e.g. 13.08)"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #2d5a27', borderRadius: 8, padding: '.6rem 1rem', color: '#e8f5e9', width: 180 }} />
              <input value={manualLon} onChange={(e) => setManualLon(e.target.value)}
                placeholder="Longitude (e.g. 80.27)"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #2d5a27', borderRadius: 8, padding: '.6rem 1rem', color: '#e8f5e9', width: 180 }} />
              <button onClick={handleManualSubmit}
                style={{ background: 'linear-gradient(135deg,#4caf50,#2e7d32)', color: '#fff', border: 'none', borderRadius: 8, padding: '.6rem 1.5rem', fontWeight: 700, cursor: 'pointer' }}>
                {lang === 'ta' ? 'வானிலை பெறுக' : 'Get Weather'}
              </button>
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(244,67,54,0.1)', border: '1px solid #f44336', borderRadius: 10, padding: '.75rem 1rem', color: '#ef9a9a', marginTop: '1rem', fontSize: '.88rem' }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', color: '#7dd56f', padding: '3rem', fontSize: '1.1rem' }}>
            🌍 {lang === 'ta' ? 'வானிலை பெறப்படுகிறது மற்றும் விவசாய பரிந்துரைகள் உருவாக்கப்படுகின்றன...' : 'Fetching weather and generating farming advice…'}
          </div>
        )}

        {data && !loading && (
          <div>
            {/* Summary Banner */}
            <div style={{ background: 'rgba(29,52,29,0.9)', border: '1px solid #2d5a27', borderRadius: 20, padding: '1.5rem', marginBottom: '1rem' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#7dd56f', fontWeight: 700, marginTop: 0, marginBottom: '.5rem', fontSize: '1.2rem' }}>
                📋 {lang === 'ta' ? '14-நாள் விவசாய சுருக்கம்' : '14-Day Farming Summary'}
              </h2>
              <p style={{ color: '#c8e6c9', margin: 0, lineHeight: 1.7 }}>{data.summary}</p>
              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: '.75rem', marginTop: '1rem' }}>
                {[
                  { label: lang === 'ta' ? 'மொத்த மழை' : 'Total Rain', value: `${data.statistics.total_rain_mm} mm`, icon: '🌧️' },
                  { label: lang === 'ta' ? 'மழை நாட்கள்' : 'Rainy Days', value: data.statistics.rainy_days, icon: '🌂' },
                  { label: lang === 'ta' ? 'அதிகபட்ச வெப்பம்' : 'Max Temp', value: `${data.statistics.max_temp}°C`, icon: '🌡️' },
                  { label: lang === 'ta' ? 'சராசரி ஈரம்' : 'Avg Humidity', value: `${data.statistics.avg_humidity_pct}%`, icon: '💧' },
                ].map((s) => (
                  <div key={s.label} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '.75rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.4rem' }}>{s.icon}</div>
                    <div style={{ color: '#e8f5e9', fontWeight: 700, fontSize: '1.1rem' }}>{s.value}</div>
                    <div style={{ color: '#81c784', fontSize: '.75rem' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Panel */}
            <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 20, padding: '1.5rem', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', color: '#7dd56f', fontWeight: 700, marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>
                🚨 {lang === 'ta' ? 'அபாய மதிப்பீடு' : 'Risk Assessment'}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '.75rem' }}>
                {Object.entries(data.risks).map(([key, level]) => {
                  const rc = RISK_CONFIG[level] || RISK_CONFIG.Low;
                  const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                  return (
                    <div key={key} style={{ background: rc.bg, border: `1px solid ${rc.color}44`, borderRadius: 10, padding: '.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#c8e6c9', fontSize: '.85rem' }}>{label}</span>
                      <span style={{ color: rc.color, fontWeight: 700, fontSize: '.85rem' }}>{rc.icon} {level}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommendations */}
            <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 20, padding: '1.5rem', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', color: '#7dd56f', fontWeight: 700, marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>
                💡 {lang === 'ta' ? 'விவசாய பரிந்துரைகள்' : 'Farming Recommendations'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                {data.recommendations.map((rec, i) => (
                  <div key={i} style={{ background: `${PRIORITY_COLOR[rec.priority] || '#4caf50'}11`, border: `1px solid ${PRIORITY_COLOR[rec.priority] || '#4caf50'}44`, borderRadius: 12, padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '.5rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{rec.icon}</span>
                      <div>
                        <div style={{ color: '#e8f5e9', fontWeight: 700, marginBottom: '.2rem' }}>{rec.title}</div>
                        <div style={{ color: '#c8e6c9', fontSize: '.9rem', lineHeight: 1.6 }}>{rec.message}</div>
                        <div style={{ color: '#81c784', fontSize: '.8rem', marginTop: '.3rem', fontStyle: 'italic' }}>💬 {rec.reason}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Good Days Summary */}
            <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 20, padding: '1.5rem', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', color: '#7dd56f', fontWeight: 700, marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>
                📅 {lang === 'ta' ? 'பண்ணை நடவடிக்கைகளுக்கான சிறந்த நாட்கள்' : 'Best Days for Farm Activities'}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '.75rem' }}>
                {[
                  { label: lang === 'ta' ? 'நடுதல் நாட்கள்' : 'Planting Days', icon: '🌱', days: data.good_days.planting },
                  { label: lang === 'ta' ? 'தெளிப்பு நாட்கள்' : 'Spray Days', icon: '💨', days: data.good_days.spraying },
                  { label: lang === 'ta' ? 'நீர்ப்பாசன நாட்கள்' : 'Irrigation Days', icon: '💧', days: data.good_days.irrigation },
                ].map((item) => (
                  <div key={item.label} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: '1rem' }}>
                    <div style={{ color: '#7dd56f', fontWeight: 600, marginBottom: '.5rem' }}>{item.icon} {item.label}</div>
                    {item.days.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem' }}>
                        {item.days.map((d) => (
                          <span key={d} style={{ background: 'rgba(76,175,80,0.2)', border: '1px solid #4caf5044', color: '#a5d6a7', borderRadius: 20, padding: '.15rem .6rem', fontSize: '.8rem' }}>
                            Day {d}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#81c784', fontSize: '.85rem' }}>No suitable days found</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 14-Day Forecast Scroll */}
            <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 20, padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', color: '#7dd56f', fontWeight: 700, marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>
                📆 {lang === 'ta' ? '14-நாள் வானிலை முன்னறிவிப்பு' : '14-Day Forecast'}
              </h3>
              <div style={{ display: 'flex', gap: '.5rem', overflowX: 'auto', paddingBottom: '.5rem' }}>
                {data.daily_forecast.map((day) => (
                  <div
                    key={day.day}
                    onClick={() => setActiveDay(activeDay?.day === day.day ? null : day)}
                    style={{
                      minWidth: 90, background: day.is_rainy ? 'rgba(33,150,243,0.12)' : 'rgba(76,175,80,0.1)',
                      border: `1px solid ${day.is_rainy ? '#2196f3' : '#4caf50'}44`,
                      borderRadius: 12, padding: '.75rem .5rem', textAlign: 'center', cursor: 'pointer',
                      transition: 'all .2s', outline: activeDay?.day === day.day ? '2px solid #7dd56f' : 'none',
                    }}
                  >
                    <div style={{ color: '#81c784', fontSize: '.72rem', marginBottom: '.2rem' }}>{day.date.slice(5)}</div>
                    <div style={{ fontSize: '1.4rem' }}>{day.is_rainy ? '🌧️' : day.avg_temp > 35 ? '☀️' : '⛅'}</div>
                    <div style={{ color: '#e8f5e9', fontWeight: 700, fontSize: '.9rem' }}>{Math.round(day.max_temp)}°</div>
                    <div style={{ color: '#81c784', fontSize: '.75rem' }}>{day.precip_mm > 0 ? `${day.precip_mm}mm` : 'Dry'}</div>
                  </div>
                ))}
              </div>

              {/* Day Detail */}
              {activeDay && (
                <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: '1rem' }}>
                  <div style={{ fontFamily: 'Outfit, sans-serif', color: '#7dd56f', fontWeight: 700, marginBottom: '.5rem' }}>Day {activeDay.day} — {activeDay.date}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '.5rem' }}>
                    {[
                      { l: lang === 'ta' ? 'அதிகபட்ச வெப்பநிலை' : 'Max Temp', v: `${activeDay.max_temp}°C` },
                      { l: lang === 'ta' ? 'குறைந்தபட்ச வெப்பநிலை' : 'Min Temp', v: `${activeDay.min_temp}°C` },
                      { l: lang === 'ta' ? 'மழை அளவு' : 'Rainfall', v: `${activeDay.precip_mm} mm` },
                      { l: lang === 'ta' ? 'ஈரப்பதம்' : 'Humidity', v: `${activeDay.avg_humidity}%` },
                      { l: lang === 'ta' ? 'காற்றின் வேகம்' : 'Wind', v: `${activeDay.wind_kmh} km/h` },
                      { l: lang === 'ta' ? 'நிலை' : 'Condition', v: activeDay.weather_desc },
                    ].map((item) => (
                      <div key={item.l} style={{ background: 'rgba(76,175,80,0.08)', borderRadius: 8, padding: '.5rem .75rem' }}>
                        <div style={{ color: '#81c784', fontSize: '.75rem' }}>{item.l}</div>
                        <div style={{ color: '#e8f5e9', fontWeight: 600, fontSize: '.9rem' }}>{item.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
