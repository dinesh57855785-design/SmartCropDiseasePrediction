import { useState, useEffect } from 'react';
import { advisorAPI } from '../services/api';

export default function CropGrowthPage() {
  const [crop, setCrop] = useState('tomato');
  const [stage, setStage] = useState('Vegetative');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchGrowthInfo = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await advisorAPI.getCropGrowth(crop, stage);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load growth recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrowthInfo();
  }, [crop, stage]);

  return (
    <div style={{ minHeight: '100vh', background: '#0d1f0d', padding: '6rem 1.5rem 2rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, color: '#7dd56f', margin: 0 }}>
            🌱 Crop Growth Optimization
          </h1>
          <p style={{ color: '#81c784', marginTop: '.5rem' }}>Enhance crop health, yield, and quality with stage-specific organic and chemical practices</p>
        </div>

        {/* Filters */}
        <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 20, padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ color: '#a5d6a7', fontSize: '.85rem', fontWeight: 600, display: 'block', marginBottom: '.3rem' }}>Select Crop</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid #2d5a27', borderRadius: 8, padding: '.65rem 1rem', color: '#e8f5e9', fontSize: '.9rem' }}
            >
              <option value="tomato">Tomato</option>
              <option value="potato">Potato</option>
              <option value="corn">Corn (Maize)</option>
              <option value="wheat">Wheat</option>
              <option value="rice">Rice</option>
            </select>
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <label style={{ color: '#a5d6a7', fontSize: '.85rem', fontWeight: 600, display: 'block', marginBottom: '.3rem' }}>Growth Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid #2d5a27', borderRadius: 8, padding: '.65rem 1rem', color: '#e8f5e9', fontSize: '.9rem' }}
            >
              {crop === 'tomato' && (
                <>
                  <option value="Seedling">Seedling</option>
                  <option value="Vegetative">Vegetative</option>
                  <option value="Flowering">Flowering</option>
                  <option value="Fruiting">Fruiting</option>
                  <option value="Harvest">Harvest</option>
                </>
              )}
              {crop === 'potato' && (
                <>
                  <option value="Seed Preparation">Seed Preparation</option>
                  <option value="Sprouting">Sprouting</option>
                  <option value="Vegetative">Vegetative</option>
                  <option value="Tuber Initiation">Tuber Initiation</option>
                  <option value="Tuber Bulking">Tuber Bulking</option>
                  <option value="Maturation">Maturation</option>
                </>
              )}
              {crop === 'corn' && (
                <>
                  <option value="Emergence">Emergence</option>
                  <option value="V6 (6 leaves)">V6 Stage</option>
                  <option value="V12">V12 Stage</option>
                  <option value="Tasseling (VT)">Tasseling (VT)</option>
                  <option value="Silking (R1)">Silking (R1)</option>
                  <option value="Grain Fill">Grain Fill</option>
                  <option value="Maturity">Maturity</option>
                </>
              )}
              {crop === 'wheat' && (
                <>
                  <option value="Germination">Germination</option>
                  <option value="Tillering">Tillering</option>
                  <option value="Jointing">Jointing</option>
                  <option value="Heading">Heading</option>
                  <option value="Grain Fill">Grain Fill</option>
                  <option value="Maturity">Maturity</option>
                </>
              )}
              {crop === 'rice' && (
                <>
                  <option value="Nursery">Nursery</option>
                  <option value="Transplanting">Transplanting</option>
                  <option value="Tillering">Tillering</option>
                  <option value="Panicle Initiation">Panicle Initiation</option>
                  <option value="Heading">Heading</option>
                  <option value="Ripening">Ripening</option>
                </>
              )}
            </select>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(244,67,54,0.12)', border: '1px solid #f44336', borderRadius: 10, padding: '.8rem 1rem', color: '#ef9a9a', marginBottom: '1.5rem', fontSize: '.88rem' }}>
            ⚠️ {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', color: '#7dd56f', padding: '3rem', fontSize: '1.1rem' }}>
            🔄 Loading optimization guidelines...
          </div>
        )}

        {data && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* General Tips Card */}
            <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 20, padding: '1.75rem' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#7dd56f', fontWeight: 700, marginTop: 0, marginBottom: '1rem', fontSize: '1.3rem' }}>
                📋 Stage Guidelines for {data.name} ({stage})
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <TipBlock title="💧 Irrigation Advice" text={data.irrigation_tips} icon="💧" />
                <TipBlock title="🐛 Pest Risks" text={data.pest_tips} icon="🐛" />
                <TipBlock title="🦠 Disease Risks" text={data.disease_tips} icon="🦠" />
              </div>
            </div>

            {/* Practices Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
              
              {/* Organic Growth Practices */}
              <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 20, padding: '1.75rem' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', color: '#81c784', fontWeight: 700, marginTop: 0, marginBottom: '1.25rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  🌿 Organic Soil Improvement
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {data.organic.map((org, index) => (
                    <div key={index} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid #2d5a2744', borderRadius: 12, padding: '1rem' }}>
                      <div style={{ color: '#7dd56f', fontWeight: 700, fontSize: '.95rem', marginBottom: '.25rem' }}>{org.practice}</div>
                      <div style={{ color: '#c8e6c9', fontSize: '.88rem', lineHeight: 1.6, marginBottom: '.5rem' }}>{org.description}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem', fontSize: '.8rem' }}>
                        <span style={{ color: '#81c784' }}>🕒 <strong>Timing:</strong> {org.timing}</span>
                        <span style={{ color: '#a5d6a7' }}>🚀 <strong>Benefit:</strong> {org.benefit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chemical/Fertilizer Growth Practices */}
              <div style={{ background: 'rgba(29,52,29,0.85)', border: '1px solid #2d5a27', borderRadius: 20, padding: '1.75rem' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', color: '#ffb74d', fontWeight: 700, marginTop: 0, marginBottom: '1.25rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  🧪 Crop Growth Recommendations
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {data.chemical.map((chem, index) => (
                    <div key={index} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid #ffb74d33', borderRadius: 12, padding: '1rem' }}>
                      <div style={{ color: '#ffb74d', fontWeight: 700, fontSize: '.95rem', marginBottom: '.25rem' }}>{chem.product}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem', fontSize: '.82rem', color: '#c8e6c9', marginBottom: '.5rem' }}>
                        <div><strong>Dosage:</strong> {chem.dosage}</div>
                        <div><strong>Method:</strong> {chem.method}</div>
                        <div><strong>Timing:</strong> {chem.timing}</div>
                      </div>
                      <div style={{ background: 'rgba(244,67,54,0.08)', border: '1px solid #f4433633', borderRadius: 6, padding: '.5rem', fontSize: '.78rem', color: '#ef9a9a', lineHeight: 1.5 }}>
                        ⚠️ <strong>Precautions:</strong> {chem.precautions}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'rgba(255,152,0,0.06)', border: '1px solid #ff980044', borderRadius: 10, padding: '.85rem', marginTop: '1.25rem', color: '#ffcc80', fontSize: '.8rem', lineHeight: 1.5 }}>
                  ⚠️ <strong>Important Safety Notice:</strong> {data.disclaimer}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

function TipBlock({ title, text, icon }) {
  return (
    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: '1rem', border: '1px solid #2d5a2744' }}>
      <div style={{ color: '#7dd56f', fontWeight: 700, fontSize: '.92rem', marginBottom: '.3rem', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
        <span>{icon}</span> {title}
      </div>
      <p style={{ color: '#c8e6c9', fontSize: '.85rem', lineHeight: 1.6, margin: 0 }}>{text}</p>
    </div>
  );
}
