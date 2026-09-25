import { useState, useEffect } from 'react';
import { diseaseAPI, advisorAPI } from '../services/api';
import { useLang } from '../contexts/LanguageContext';
import { tr } from '../i18n/translations';
// Tamil font for proper Unicode display
const TAMIL_FONT_LINK = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;600;700&display=swap';

export default function ReportHistoryPage() {
  const { lang } = useLang();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await diseaseAPI.getHistory();
        setHistory(res.data);
      } catch (err) {
        setError('Failed to load report history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const openReport = async (item, lang = 'en') => {
    setReportLoading(true);
    const soil_data = localStorage.getItem('last_soil_analysis') ? JSON.parse(localStorage.getItem('last_soil_analysis')) : null;
    const water_data = localStorage.getItem('last_water_analysis') ? JSON.parse(localStorage.getItem('last_water_analysis')) : null;

    try {
      const res = await advisorAPI.generateReport({
        lang,
        prediction_id: item.id,
        location: 'Tamil Nadu, India',
        soil_data,
        water_data,
      });
      setSelectedReport({ data: res.data, item });
    } catch (err) {
      alert('Failed to generate report view.');
    } finally {
      setReportLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const [needToDoData, setNeedToDoData] = useState(null);
  const [needToDoLoading, setNeedToDoLoading] = useState(false);
  const [needToDoItem, setNeedToDoItem] = useState(null);

  const fetchNeedToDo = async (item) => {
    setNeedToDoLoading(true);
    setNeedToDoItem(item);
    const soil_data = localStorage.getItem('last_soil_analysis') ? JSON.parse(localStorage.getItem('last_soil_analysis')) : null;
    const water_data = localStorage.getItem('last_water_analysis') ? JSON.parse(localStorage.getItem('last_water_analysis')) : null;

    try {
      const res = await advisorAPI.getNeedToDo({
        disease: item.predicted_disease,
        is_healthy: item.is_healthy,
        confidence: item.confidence,
        crop_name: item.crop_name,
        soil_data,
        water_data,
        lang: lang,
      });
      setNeedToDoData(res.data);
    } catch (err) {
      alert('Failed to load Need to Do recommendations.');
    } finally {
      setNeedToDoLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0d1f0d', padding: '6rem 1.5rem 2rem', fontFamily: 'Inter, sans-serif', color: '#e8f5e9' }}>
      <div style={{ maxWidth: 950, margin: '0 auto' }}>
        
        <div className="no-print" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, color: '#7dd56f', margin: 0 }}>
              📜 {lang === 'ta' ? 'விவசாய அறிக்கை வரலாறு' : 'Farming Report & Need To Do History'}
            </h1>
            <p style={{ color: '#81c784', marginTop: '.5rem' }}>
              {lang === 'ta' ? 'முந்தைய பயிர் நோய் கண்டறிதல்களை மதிப்பாய்வு செய்யவும்' : 'Review previous crop diagnostics and view actionable "Need to Do" recommendations'}
            </p>
          </div>
        </div>

        {error && (
          <div className="no-print" style={{ background: 'rgba(244,67,54,0.12)', border: '1px solid #f44336', borderRadius: 10, padding: '.8rem 1rem', color: '#ef9a9a', marginBottom: '1.5rem' }}>
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="no-print" style={{ textAlign: 'center', color: '#7dd56f', padding: '3rem' }}>⏳ {tr(lang, 'loading')}</div>
        ) : (
          <div className="no-print" style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 20, padding: '1.5rem', marginBottom: '1.5rem' }}>
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#81c784', padding: '2rem' }}>{tr(lang, 'history_no_records')}</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #2d5a27', color: '#7dd56f' }}>
                      <th style={thStyle}>{tr(lang, 'history_date')}</th>
                      <th style={thStyle}>{tr(lang, 'history_crop')}</th>
                      <th style={thStyle}>{tr(lang, 'history_disease')}</th>
                      <th style={thStyle}>{tr(lang, 'history_confidence')}</th>
                      <th style={thStyle}>{tr(lang, 'history_need_todo')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid rgba(45,90,39,0.3)' }}>
                        <td style={tdStyle}>{new Date(item.created_at).toLocaleDateString()}</td>
                        <td style={tdStyle}>{item.crop_name || '—'}</td>
                        <td style={{ ...tdStyle, color: item.is_healthy ? '#7dd56f' : '#ff8a65', fontWeight: 600 }}>{item.predicted_disease}</td>
                        <td style={{ ...tdStyle, color: '#7dd56f', fontWeight: 700 }}>{Math.round(item.confidence * 100)}%</td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                            <button onClick={() => fetchNeedToDo(item)} style={btnSm('#ff9800')}>📌 {tr(lang, 'history_btn_todo')}</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Need To Do Recommendations Modal */}
        {(needToDoData || needToDoLoading) && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, padding: '1rem'
          }}>
            <div style={{
              background: '#1b351b', border: '2px solid #ff9800', borderRadius: 20,
              padding: '2rem', maxWidth: 650, width: '100%', maxHeight: '85vh', overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,152,0,0.3)', paddingBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ color: '#ffb74d', fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem', margin: 0 }}>
                    📌 {tr(lang, 'history_modal_title')}
                  </h3>
                  <div style={{ color: '#a5d6a7', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                    {tr(lang, 'history_modal_record')} #{needToDoItem?.id} — {needToDoItem?.crop_name || (lang === 'ta' ? 'பயிர்' : 'Crop')} ({needToDoItem?.predicted_disease})
                  </div>
                </div>
                <button onClick={() => setNeedToDoData(null)} style={{ background: 'transparent', color: '#ffcdd2', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✖</button>
              </div>

              {needToDoLoading ? (
                <div style={{ textAlign: 'center', color: '#7dd56f', padding: '2rem' }}>⏳ {tr(lang, 'history_modal_generating')}</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {needToDoData.actions?.map((act, i) => (
                    <div key={i} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(76,175,80,0.25)', borderRadius: 12, padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#7dd56f', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>{act.icon}</span> {act.category}
                        </span>
                        <span style={{ background: 'rgba(76,175,80,0.15)', color: '#81c784', padding: '0.15rem 0.5rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700 }}>
                          {act.status}
                        </span>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#c8e6c9', fontSize: '0.88rem', lineHeight: 1.6 }}>
                        {act.recommendations?.map((r, j) => (
                          <li key={j}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selected Report Viewer */}
        {selectedReport && (
          <div
            className="printable-report"
            lang={selectedReport.data.language === 'ta' ? 'ta' : 'en'}
            style={{
              background: '#ffffff', color: '#111111', borderRadius: 16, padding: '2.5rem', marginTop: '1.5rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)', minHeight: '800px', border: '1px solid #dddddd',
              fontFamily: selectedReport.data.language === 'ta' ? "'Noto Sans Tamil', 'Latha', 'Arial Unicode MS', sans-serif" : 'Inter, sans-serif',
            }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #ddd', paddingBottom: '.75rem' }}>
              <span style={{ fontWeight: 700, color: '#2e7d32' }}>Viewing Report #{selectedReport.item.id} ({selectedReport.data.language.toUpperCase()})</span>
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <button onClick={handlePrint} style={{ background: '#2e7d32', color: '#fff', border: 'none', padding: '.4rem .9rem', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>🖨️ Print / Download PDF</button>
                <button onClick={() => setSelectedReport(null)} style={{ background: '#666', color: '#fff', border: 'none', padding: '.4rem .9rem', borderRadius: 6, cursor: 'pointer' }}>Close</button>
              </div>
            </div>

            {selectedReport.data.report_sections.map((sec, idx) => {
              if (sec.section === 'header') {
                return (
                  <div key={idx} style={{ borderBottom: '2px solid #2e7d32', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h2 style={{ color: '#2e7d32', margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 800 }}>
                        {sec.title}
                      </h2>
                      <span style={{ fontSize: '.85rem', color: '#666' }}>{sec.date}</span>
                    </div>
                    <div style={{ marginTop: '.75rem', fontSize: '.9rem', color: '#444', display: 'flex', gap: '1.5rem' }}>
                      <div>👤 <strong>Farmer:</strong> {sec.farmer}</div>
                      {sec.location && <div>📍 <strong>Location:</strong> {sec.location}</div>}
                    </div>
                  </div>
                );
              }

              if (sec.section === 'identification') {
                return (
                  <div key={idx} style={{ background: '#f1f8e9', borderRadius: 8, padding: '1rem 1.25rem', marginBottom: '1.25rem', border: '1px solid #c5e1a5' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '.8rem', color: '#555', textTransform: 'uppercase', fontWeight: 600 }}>{sec.label_crop}</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1b5e20' }}>{sec.crop}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '.8rem', color: '#555', textTransform: 'uppercase', fontWeight: 600 }}>{sec.label_disease}</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: sec.is_healthy ? '#2e7d32' : '#c62828' }}>{sec.disease}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '.8rem', color: '#555', textTransform: 'uppercase', fontWeight: 600 }}>{sec.label_confidence}</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1b5e20' }}>{sec.confidence_pct}</div>
                      </div>
                    </div>
                    {sec.confidence_explanation && (
                      <div style={{ marginTop: '.75rem', fontSize: '.88rem', color: '#444', borderTop: '1px solid #dcdcdc', paddingTop: '.5rem', fontStyle: 'italic' }}>
                        💡 <strong>{sec.label_confidence_exp}:</strong> {sec.confidence_explanation}
                      </div>
                    )}
                  </div>
                );
              }

              if (sec.section === 'disease_info') {
                return (
                  <div key={idx} style={{ marginBottom: '1.25rem' }}>
                    <div style={{ marginBottom: '.75rem' }}>
                      <span style={{ fontSize: '.8rem', color: '#555', textTransform: 'uppercase', fontWeight: 600 }}>{sec.label_severity}</span>
                      <span style={{ marginLeft: '.5rem', background: '#ffe0b2', color: '#e65100', padding: '.15rem .5rem', borderRadius: 4, fontSize: '.82rem', fontWeight: 700 }}>
                        {sec.severity}
                      </span>
                    </div>
                    <div style={{ marginBottom: '.75rem' }}>
                      <strong style={{ color: '#2e7d32', display: 'block', marginBottom: '.25rem' }}>{sec.label_symptoms}</strong>
                      <p style={{ margin: 0, fontSize: '.9rem', lineHeight: 1.6, color: '#333' }}>{sec.symptoms}</p>
                    </div>
                    <div style={{ marginBottom: '.75rem' }}>
                      <strong style={{ color: '#2e7d32', display: 'block', marginBottom: '.25rem' }}>{sec.label_description}</strong>
                      <p style={{ margin: 0, fontSize: '.9rem', lineHeight: 1.6, color: '#333' }}>{sec.description}</p>
                    </div>
                  </div>
                );
              }

              if (sec.section === 'organic_treatment') {
                return (
                  <div key={idx} style={{ border: '1px solid #a5d6a7', borderRadius: 8, padding: '1rem 1.25rem', marginBottom: '1.25rem', background: '#f9fbe7' }}>
                    <h4 style={{ margin: '0 0 .5rem', color: '#2e7d32', fontSize: '1rem', borderBottom: '1px dashed #a5d6a7', paddingBottom: '.25rem' }}>
                      🌿 {sec.title}
                    </h4>
                    <div style={{ fontSize: '.9rem', color: '#333' }}>
                      <div style={{ marginBottom: '.4rem' }}><strong>Treatment:</strong> {sec.treatment}</div>
                      <div style={{ marginBottom: '.4rem' }}><strong>{sec.label_dosage}:</strong> {sec.dosage}</div>
                      <div><strong>{sec.label_instructions}:</strong> {sec.instructions}</div>
                    </div>
                  </div>
                );
              }

              if (sec.section === 'chemical_treatment') {
                return (
                  <div key={idx} style={{ border: '1px solid #ffcc80', borderRadius: 8, padding: '1rem 1.25rem', marginBottom: '1.25rem', background: '#fffde7' }}>
                    <h4 style={{ margin: '0 0 .5rem', color: '#e65100', fontSize: '1rem', borderBottom: '1px dashed #ffcc80', paddingBottom: '.25rem' }}>
                      🧪 {sec.title}
                    </h4>
                    <div style={{ fontSize: '.9rem', color: '#333' }}>
                      <div style={{ marginBottom: '.4rem' }}><strong>Treatment:</strong> {sec.treatment}</div>
                      <div style={{ marginBottom: '.4rem' }}><strong>{sec.label_dosage}:</strong> {sec.dosage}</div>
                      <div style={{ marginBottom: '.75rem' }}><strong>{sec.label_instructions}:</strong> {sec.instructions}</div>
                      <div style={{ background: '#ffebee', border: '1px solid #ffcdd2', color: '#c62828', borderRadius: 6, padding: '.5rem .75rem', fontSize: '.78rem', lineHeight: 1.5 }}>
                        {sec.disclaimer}
                      </div>
                    </div>
                  </div>
                );
              }

              if (sec.section === 'prevention') {
                return (
                  <div key={idx} style={{ marginBottom: '1.25rem' }}>
                    <strong style={{ color: '#2e7d32', display: 'block', marginBottom: '.25rem' }}>🛡️ {sec.title}</strong>
                    <p style={{ margin: 0, fontSize: '.9rem', lineHeight: 1.6, color: '#333' }}>{sec.content}</p>
                  </div>
                );
              }

              if (sec.section === 'farming_tips') {
                return (
                  <div key={idx} style={{ marginBottom: '1.25rem' }}>
                    <strong style={{ color: '#2e7d32', display: 'block', marginBottom: '.25rem' }}>💡 {sec.title}</strong>
                    <p style={{ margin: 0, fontSize: '.9rem', lineHeight: 1.6, color: '#333' }}>{sec.content}</p>
                  </div>
                );
              }

              if (sec.section === 'soil_analysis') {
                return (
                  <div key={idx} style={{ border: '1px solid #c5e1a5', borderRadius: 8, padding: '1rem 1.25rem', marginBottom: '1.25rem', background: '#f1f8e9' }}>
                    <h4 style={{ margin: '0 0 .5rem', color: '#1b5e20', fontSize: '1.1rem', borderBottom: '1px dashed #c5e1a5', paddingBottom: '.25rem' }}>
                      🪨 {sec.title}
                    </h4>
                    <div style={{ fontSize: '.9rem', color: '#333' }}>
                      <div style={{ marginBottom: '.4rem' }}><strong>{sec.label_soil_type}:</strong> {sec.soil_type} ({sec.soil_summary})</div>
                      <div style={{ marginBottom: '.4rem' }}><strong>{sec.label_ph}:</strong> {sec.ph}</div>
                      <div style={{ marginBottom: '.4rem' }}><strong>{sec.label_suitable}:</strong> {sec.suitable_crops?.join(', ')}</div>
                      <div style={{ marginBottom: '.4rem' }}><strong>{sec.label_fertilizer}:</strong> {sec.fertilizer_recommendations?.join(', ')}</div>
                      <div style={{ marginBottom: '.4rem' }}><strong>{sec.label_organic}:</strong> {sec.organic_improvements?.join(', ')}</div>
                      <div><strong>{sec.label_irrigation}:</strong> {sec.irrigation_advice}</div>
                    </div>
                  </div>
                );
              }

              if (sec.section === 'water_analysis') {
                return (
                  <div key={idx} style={{ border: '1px solid #b3e5fc', borderRadius: 8, padding: '1rem 1.25rem', marginBottom: '1.25rem', background: '#e1f5fe' }}>
                    <h4 style={{ margin: '0 0 .5rem', color: '#0277bd', fontSize: '1.1rem', borderBottom: '1px dashed #b3e5fc', paddingBottom: '.25rem' }}>
                      💧 {sec.title}
                    </h4>
                    <div style={{ fontSize: '.9rem', color: '#333' }}>
                      <div style={{ marginBottom: '.4rem' }}><strong>{sec.label_suitability}:</strong> {sec.suitability}</div>
                      <div style={{ marginBottom: '.4rem' }}><strong>{sec.label_ph}:</strong> {sec.ph} | <strong>{sec.label_tds}:</strong> {sec.tds_ppm} ppm</div>
                      <div style={{ marginBottom: '.4rem' }}><strong>{sec.label_recommended}:</strong> {sec.recommended_crops?.join(', ')}</div>
                      <div style={{ marginBottom: '.4rem' }}><strong>{sec.label_risks}:</strong> {sec.risks?.join(', ')}</div>
                      <div><strong>{sec.label_precautions}:</strong> {sec.precautions?.join(', ')}</div>
                    </div>
                  </div>
                );
              }

              if (sec.section === 'weather') {
                return (
                  <div key={idx} style={{ border: '1px solid #b3e5fc', borderRadius: 8, padding: '1rem 1.25rem', marginBottom: '1.25rem', background: '#e1f5fe' }}>
                    <h4 style={{ margin: '0 0 .5rem', color: '#0277bd', fontSize: '1rem', borderBottom: '1px dashed #b3e5fc', paddingBottom: '.25rem' }}>
                      🌤️ {sec.title}
                    </h4>
                    <p style={{ fontSize: '.88rem', margin: '0 0 .5rem', lineHeight: 1.5, color: '#01579b', fontWeight: 600 }}>{sec.summary}</p>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '.88rem', color: '#333', lineHeight: 1.6 }}>
                      {sec.recommendations.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                );
              }

              if (sec.section === 'warnings') {
                return (
                  <div key={idx} style={{ background: '#ffebee', border: '1px solid #ffcdd2', borderRadius: 8, padding: '1rem 1.25rem', color: '#c62828' }}>
                    <strong style={{ display: 'block', marginBottom: '.4rem' }}>⚠️ {sec.title}</strong>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '.88rem', lineHeight: 1.6 }}>
                      {sec.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                );
              }

              return null;
            })}

            {/* Print Footer */}
            <div className="print-only" style={{ display: 'none', borderTop: '1px solid #dddddd', marginTop: '3rem', paddingTop: '1rem', textAlign: 'center', fontSize: '.75rem', color: '#888' }}>
              Report generated dynamically by SmartCrop Smart Farming Assistant. Always verify recommendations locally.
            </div>
          </div>
        )}

      </div>

      {/* Tamil font */}
      <link rel="stylesheet" href={TAMIL_FONT_LINK} />

      {/* CSS rules for printing report history */}
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

const thStyle = { padding: '.75rem 1rem', textAlign: 'left', fontWeight: 600 };
const tdStyle = { padding: '.75rem 1rem', color: '#e8f5e9' };
const btnSm = (color) => ({ background: color, color: '#fff', border: 'none', borderRadius: 6, padding: '.3rem .6rem', fontSize: '.78rem', fontWeight: 600, cursor: 'pointer' });
