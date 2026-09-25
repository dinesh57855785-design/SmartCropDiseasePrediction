import { useState, useEffect } from 'react';
import { weatherAPI, advisorAPI } from '../services/api';
import { useLang } from '../contexts/LanguageContext';
import { tr } from '../i18n/translations';

// Practical farming tips shown for every day — simple farmer-friendly language
const PRACTICAL_TIPS_EN = [
  '💧 Water the crop if the soil feels dry when you touch it',
  '🌿 Remove weeds growing around the plant base',
  '🔍 Check leaves and stems for any disease symptoms or unusual spots',
  '☀️ Ensure the plant gets enough sunlight and proper spacing',
  '🪱 Apply suitable compost or natural fertilizer if the plant looks pale',
  '🐛 Remove any visible pests by hand or use neem oil spray',
  '✂️ Remove any dead or yellowing leaves to keep the plant healthy',
  '📏 Check if the plant is growing at the expected height for its stage',
];

const PRACTICAL_TIPS_TA = [
  '💧 மண்ணைத் தொட்டுப் பார்க்கும்போது உலர்வாக இருந்தால் பயிருக்கு நீர் பாய்ச்சுங்கள்',
  '🌿 செடியின் அடிப்பகுதியில் வளரும் களைகளை அகற்றுங்கள்',
  '🔍 இலைகள் மற்றும் தண்டுகளில் நோய் அறிகுறிகள் உள்ளதா எனச் சரிபார்க்கவும்',
  '☀️ செடிக்கு போதுமான சூரிய ஒளி மற்றும் சரியான இடைவெளி கிடைப்பதை உறுதிசெய்யுங்கள்',
  '🪱 செடி வெளிறிப் போனால் பொருத்தமான மக்கிய உரம் அல்லது இயற்கை உரம் இடுங்கள்',
  '🐛 தெரியும் பூச்சிகளை கையால் அகற்றுங்கள் அல்லது வேப்பெண்ணெய் தெளிக்கவும்',
  '✂️ செடியை ஆரோக்கியமாக வைக்க இறந்த அல்லது மஞ்சளான இலைகளை அகற்றுங்கள்',
  '📏 செடி அதன் நிலைக்கு எதிர்பார்க்கப்படும் உயரத்தில் வளர்கிறதா எனச் சரிபார்க்கவும்',
];

export default function FarmingPlannerPage() {
  const { lang } = useLang();
  const t = (key) => tr(lang, key);
  const PRACTICAL_TIPS = lang === 'ta' ? PRACTICAL_TIPS_TA : PRACTICAL_TIPS_EN;

  const [crop, setCrop] = useState('Tomato');
  const [stage, setStage] = useState('Vegetative Growth');
  const [plannerData, setPlannerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lat] = useState(13.08);
  const [lon] = useState(80.27);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [seasonalData, setSeasonalData] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);

  const fetchPlanner = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await weatherAPI.getPlanner({ lat, lon, crop, stage });
      setPlannerData(res.data);
      setExpandedDay(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate 14-day farming plan.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSeasonal = async (dateStr) => {
    try {
      const month = new Date(dateStr).getMonth() + 1;
      const res = await advisorAPI.getSeasonalSuggestions({ month, lang: 'en' });
      setSeasonalData(res.data);
    } catch (e) { /* ignore */ }
  };

  useEffect(() => {
    fetchPlanner();
  }, [crop, stage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedDate) {
      fetchSeasonal(selectedDate);
    }
  }, [selectedDate]);

  // Find the plan day that matches the selected date
  const selectedDayPlan = plannerData?.daily_14_day_plan?.find(
    (d) => d.date === selectedDate
  );

  // Rotate practical tips based on day index
  const getTipsForDay = (dayIndex) => {
    const startIdx = dayIndex % PRACTICAL_TIPS.length;
    const tips = [];
    for (let i = 0; i < 3; i++) {
      tips.push(PRACTICAL_TIPS[(startIdx + i) % PRACTICAL_TIPS.length]);
    }
    return tips;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0d1f0d', padding: '6rem 1.5rem 2rem', fontFamily: 'Inter, sans-serif', color: '#e8f5e9' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, color: '#7dd56f', margin: 0 }}>
            {t('planner_header')}
          </h1>
          <p style={{ color: '#81c784', marginTop: '.5rem' }}>
            {t('planner_header_desc')}
          </p>
        </div>

        {/* Controls Card */}
        <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 20, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>

            <div>
              <label style={labelStyle}>{t('planner_select_crop')}</label>
              <select value={crop} onChange={(e) => setCrop(e.target.value)} style={selectStyle}>
                <option>Rice</option>
                <option>Maize</option>
                <option>Tomato</option>
                <option>Potato</option>
                <option>Cotton</option>
                <option>Groundnut</option>
                <option>Sugarcane</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>{t('planner_farming_stage')}</label>
              <select value={stage} onChange={(e) => setStage(e.target.value)} style={selectStyle}>
                <option>Land Preparation</option>
                <option>Seedling</option>
                <option>Vegetative Growth</option>
                <option>Flowering</option>
                <option>Fruiting</option>
                <option>Harvesting</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>{t('planner_jump_date')}</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ ...selectStyle, colorScheme: 'dark' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button onClick={fetchPlanner} disabled={loading} style={btnStyle}>
                {loading ? t('planner_update_btn_loading') : t('planner_update_btn')}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(244,67,54,0.12)', border: '1px solid #f44336', borderRadius: 10, padding: '.8rem 1rem', color: '#ef9a9a', marginBottom: '1.5rem' }}>
            ⚠️ {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#7dd56f' }}>
            <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>🌱</div>
            <p>{t('planner_generating')}</p>
          </div>
        )}

        {/* Fallback when no data and not loading — prevents blank page */}
        {!plannerData && !loading && !error && (
          <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 20, padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📅</div>
            <p style={{ color: '#81c784', fontSize: '1rem', marginBottom: '1rem' }}>{t('planner_no_data')}</p>
            <p style={{ color: '#5a8a5a', fontSize: '0.85rem' }}>{t('planner_no_data_hint')}</p>
          </div>
        )}

        {/* Seasonal Suggestions Card based on Selected Date */}
        {seasonalData && (
          <div style={{ background: 'linear-gradient(135deg, #182e18, #1f421f)', border: '1.5px solid #2e7d32', borderRadius: 20, padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.4rem' }}>🗓️</span>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', color: '#7dd56f', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                  Seasonal Guidance: {seasonalData.season} ({seasonalData.months})
                </h3>
              </div>
              <span style={{ background: 'rgba(76,175,80,0.15)', border: '1px solid #4caf50', color: '#81c784', padding: '0.2rem 0.6rem', borderRadius: 12, fontSize: '0.78rem', fontWeight: 700 }}>
                Month: {new Date(selectedDate).toLocaleString('default', { month: 'long' })}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {/* Suitable Crops */}
              <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 12, padding: '1rem', border: '1px solid rgba(76,175,80,0.2)' }}>
                <div style={{ color: '#81c784', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem' }}>🌾 Recommended Crops to Plant</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {seasonalData.suitable_crops?.map((c, i) => (
                    <span key={i} style={{ background: 'rgba(76,175,80,0.15)', color: '#c8e6c9', padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.8rem', border: '1px solid rgba(76,175,80,0.3)' }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Activities */}
              <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 12, padding: '1rem', border: '1px solid rgba(76,175,80,0.2)' }}>
                <div style={{ color: '#81c784', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem' }}>📋 Season Activities</div>
                <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#c8e6c9', fontSize: '0.82rem', lineHeight: 1.5 }}>
                  {seasonalData.farming_activities?.slice(0, 3).map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>

              {/* Precautions */}
              <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 12, padding: '1rem', border: '1px solid rgba(244,67,54,0.2)' }}>
                <div style={{ color: '#ef9a9a', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem' }}>⚠️ Season Precautions</div>
                <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#ffcdd2', fontSize: '0.82rem', lineHeight: 1.5 }}>
                  {seasonalData.precautions?.slice(0, 3).map((prec, i) => (
                    <li key={i}>{prec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {plannerData && !loading && (
          <div>
            {/* Today's Assistant Guidance */}
            <div style={{ background: 'linear-gradient(135deg, #1a2e1a, #2e5d2b)', border: '1px solid #4caf50', borderRadius: 20, padding: '1.75rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#7dd56f', fontWeight: 800, fontSize: '1.3rem', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                {t('planner_assistant_title')}: {crop} — {stage}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <Block title={t('planner_what_now')} text={plannerData.today_guidance?.what_to_do_now} color="#4caf50" icon="✅" />
                <Block title={t('planner_what_next')} text={plannerData.today_guidance?.what_to_do_next} color="#2196f3" icon="🚀" />
                <Block title={t('planner_what_avoid')} text={plannerData.today_guidance?.what_to_avoid} color="#f44336" icon="🛑" />
                <Block title={t('planner_irrigation')} text={plannerData.today_guidance?.irrigation_recommendation} color="#00bcd4" icon="💧" />
                <Block title={t('planner_nutrients')} text={plannerData.today_guidance?.nutrient_recommendation} color="#ff9800" icon="🧪" />
                <Block title={t('planner_disease_pest')} text={`${plannerData.today_guidance?.disease_monitoring || ''} ${plannerData.today_guidance?.pest_monitoring || ''}`} color="#9c27b0" icon="🔬" />
              </div>
            </div>

            {/* Selected Date Highlight */}
            {selectedDayPlan && (
              <div style={{ background: 'rgba(76,175,80,0.12)', border: '2px solid #4caf50', borderRadius: 20, padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', color: '#7dd56f', fontWeight: 800, fontSize: '1.15rem', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  {t('planner_selected_date')}: {formatDate(selectedDayPlan.date)} — Day {selectedDayPlan.day}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  <div>
                    <div style={{ color: '#a5d6a7', fontSize: '.8rem', fontWeight: 600, marginBottom: '.3rem' }}>{t('planner_weather_label')}</div>
                    <div style={{ color: '#e8f5e9', fontWeight: 600 }}>{selectedDayPlan.weather}</div>
                    <div style={{ marginTop: '.5rem', color: '#7dd56f', fontWeight: 600, fontSize: '.85rem' }}>
                      {selectedDayPlan.status_badge}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#a5d6a7', fontSize: '.8rem', fontWeight: 600, marginBottom: '.3rem' }}>{t('planner_activity_label')}</div>
                    <div style={{ color: '#e8f5e9', fontSize: '.95rem', lineHeight: 1.5 }}>{selectedDayPlan.recommended_activity}</div>
                  </div>
                  <div>
                    <div style={{ color: '#ef9a9a', fontSize: '.8rem', fontWeight: 600, marginBottom: '.3rem' }}>{t('planner_avoid_label')}</div>
                    <div style={{ color: '#ef9a9a', fontSize: '.9rem', lineHeight: 1.5 }}>{selectedDayPlan.avoid_activity}</div>
                  </div>
                </div>
                {/* Practical tips for the selected day */}
                <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(76,175,80,0.3)', paddingTop: '1rem' }}>
                  <div style={{ color: '#7dd56f', fontWeight: 700, fontSize: '.9rem', marginBottom: '.5rem' }}>{t('planner_practical_tips')}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                    {getTipsForDay(selectedDayPlan.day - 1).map((tip, i) => (
                      <div key={i} style={{ color: '#c8e6c9', fontSize: '.88rem', padding: '.35rem .75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 8, borderLeft: '3px solid #4caf50' }}>
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 14-Day Timeline */}
            <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 20, padding: '1.75rem' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', color: '#7dd56f', fontWeight: 800, fontSize: '1.2rem', marginBottom: '1.25rem' }}>
                {t('planner_timeline_title')}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                {plannerData.daily_14_day_plan.map((day, idx) => {
                  const isSelected = day.date === selectedDate;
                  const isExpanded = expandedDay === day.day;
                  return (
                    <div
                      key={day.day}
                      onClick={() => setExpandedDay(isExpanded ? null : day.day)}
                      style={{
                        background: isSelected ? 'rgba(76,175,80,0.15)' : 'rgba(0,0,0,0.25)',
                        border: isSelected ? '2px solid #4caf50' : '1px solid rgba(45,90,39,0.4)',
                        borderRadius: 14,
                        padding: '1rem 1.25rem',
                        cursor: 'pointer',
                        transition: 'all .2s',
                      }}
                    >
                      {/* Day Header Row */}
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        {/* Date Badge */}
                        <div style={{
                          minWidth: 80, textAlign: 'center',
                          background: isSelected ? 'rgba(76,175,80,0.2)' : 'rgba(76,175,80,0.08)',
                          padding: '.5rem .75rem', borderRadius: 10,
                          border: `1px solid ${isSelected ? '#4caf50' : '#4caf5033'}`,
                        }}>
                          <div style={{ color: '#7dd56f', fontWeight: 800, fontSize: '1rem' }}>Day {day.day}</div>
                          <div style={{ color: '#81c784', fontSize: '.72rem' }}>{formatDate(day.date)}</div>
                        </div>

                        {/* Activity Info */}
                        <div style={{ flex: 1, minWidth: 220 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.25rem', flexWrap: 'wrap', gap: '.3rem' }}>
                            <span style={{ fontSize: '.8rem', color: '#a5d6a7', fontWeight: 600 }}>🌤️ {day.weather}</span>
                            <span style={{
                              background: 'rgba(76,175,80,0.15)', border: '1px solid #4caf50',
                              color: '#7dd56f', padding: '.1rem .55rem', borderRadius: 12,
                              fontSize: '.75rem', fontWeight: 700,
                            }}>
                              {day.status_badge}
                            </span>
                          </div>
                          <div style={{ color: '#e8f5e9', fontSize: '.92rem', fontWeight: 600, marginBottom: '.2rem' }}>
                            👉 {day.recommended_activity}
                          </div>
                          <div style={{ color: '#ef9a9a', fontSize: '.8rem' }}>⚠️ {day.avoid_activity}</div>
                        </div>

                        <div style={{ color: '#5a8a5a', fontSize: '.8rem', alignSelf: 'center' }}>
                          {isExpanded ? '▲' : '▼'}
                        </div>
                      </div>

                      {/* Expanded Practical Tips */}
                      {isExpanded && (
                        <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(76,175,80,0.2)', paddingTop: '.75rem' }}>
                          <div style={{ color: '#7dd56f', fontWeight: 700, fontSize: '.85rem', marginBottom: '.4rem' }}>{t('planner_practical_tasks')}</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
                            {getTipsForDay(idx).map((tip, i) => (
                              <div key={i} style={{ color: '#c8e6c9', fontSize: '.85rem', padding: '.3rem .7rem', background: 'rgba(0,0,0,0.2)', borderRadius: 7, borderLeft: '3px solid #4caf50' }}>
                                {tip}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '1rem', color: '#5a8a5a', fontSize: '.78rem', textAlign: 'center' }}>
                {t('planner_timeline_hint')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Block({ title, text, color, icon }) {
  return (
    <div style={{ background: 'rgba(0,0,0,0.3)', borderLeft: `4px solid ${color}`, borderRadius: 10, padding: '1rem' }}>
      <div style={{ color, fontWeight: 700, fontSize: '.9rem', marginBottom: '.3rem', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
        <span>{icon}</span> {title}
      </div>
      <p style={{ color: '#c8e6c9', fontSize: '.86rem', lineHeight: 1.5, margin: 0 }}>{text}</p>
    </div>
  );
}

const labelStyle = { display: 'block', color: '#a5d6a7', fontSize: '.85rem', fontWeight: 600, marginBottom: '.3rem' };
const selectStyle = { width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid #2d5a27', borderRadius: 8, padding: '.65rem 1rem', color: '#e8f5e9', fontSize: '.9rem' };
const btnStyle = { width: '100%', background: 'linear-gradient(135deg, #4caf50, #2e7d32)', color: '#fff', border: 'none', borderRadius: 8, padding: '.7rem', fontWeight: 700, cursor: 'pointer' };
