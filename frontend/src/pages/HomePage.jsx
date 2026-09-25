import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LanguageContext';
import { tr } from '../i18n/translations';

// ── 8 SOIL TYPES AND SOIL AI RECOMMENDATION MAPPING ──────────────────────────
const SOIL_TYPES_DATA = {
  alluvial: {
    id: 'alluvial',
    name_en: 'Alluvial soil',
    name_ta: 'வண்டல் மண்',
    crops_en: ['Oats', 'Barley', 'Field Peas', 'Buckwheat', 'Wheat'],
    crops_ta: ['ஓட்ஸ்', 'பார்லி', 'பீல்ட் பீஸ்', 'பக்வீட்', 'கோதுமை'],
    purpose_en: 'Organic matter + nutrient cycling',
    purpose_ta: 'கரிமப் பொருள் அதிகரிப்பு + ஊட்டச்சத்து சுழற்சியை மேம்படுத்துதல்',
    benefits_en: [
      'Improved soil organic matter and active humus content',
      'Enhanced nutrient cycling and bioavailability for following crops',
      'Balanced soil texture and improved biological activity',
      'Sustained moisture retention and proper root zone aeration'
    ],
    benefits_ta: [
      'கரிமப் பொருள் மற்றும் மட்கு அதிகரிப்பு',
      'ஊட்டச்சத்து சுழற்சி மற்றும் ஊட்டச்சத்து கிடைப்பை மேம்படுத்துதல்',
      'சீரான மண் அமைப்பு மற்றும் மண் நுண்ணுயிரி பெருக்கம்',
      'நீடித்த ஈரப்பதத் தக்கவைப்பு மற்றும் வேர் பகுதி காற்றோட்டம்'
    ]
  },
  black: {
    id: 'black',
    name_en: 'Black soil',
    name_ta: 'கரிசல் மண்',
    crops_en: ['Sorghum-Sudangrass', 'Millet', 'Field Peas', 'Barley', 'Oats'],
    crops_ta: ['சோளம்-சூடாங்கிராஸ்', 'சிறுதானியம்', 'பீல்ட் பீஸ்', 'பார்லி', 'ஓட்ஸ்'],
    purpose_en: 'Improve structure + biomass',
    purpose_ta: 'மண் அமைப்பை மேம்படுத்துதல் + உயிர்த்திரள் அதிகரித்தல்',
    benefits_en: [
      'Improved soil structure and enhanced aggregation',
      'Substantial addition of organic biomass and organic carbon',
      'Reduced deep soil cracking during dry spells',
      'Better root penetration and internal aeration in heavy clay-rich matrix'
    ],
    benefits_ta: [
      'மண் அமைப்பு மற்றும் திரட்சி மேம்பாடு',
      'தாவர உயிர்த்திரள் மற்றும் கரிமக் கரிமம் கணிசமாக அதிகரித்தல்',
      'வறண்ட காலங்களில் ஆழமான மண் வெடிப்புகள் ஏற்படுவதைக் குறைத்தல்',
      'களிமண் தன்மை கொண்ட மண்ணில் சிறந்த வேர் ஊடுருவல் மற்றும் உட்புற காற்றோட்டம்'
    ]
  },
  chalky: {
    id: 'chalky',
    name_en: 'Chalky soil',
    name_ta: 'சுண்ணாம்பு மண்',
    crops_en: ['Barley', 'Oats', 'Field Peas', 'Buckwheat'],
    crops_ta: ['பார்லி', 'ஓட்ஸ்', 'பீல்ட் பீஸ்', 'பக்வீட்'],
    purpose_en: 'Organic matter + nutrient availability',
    purpose_ta: 'கரிமப் பொருள் அதிகரிப்பு + ஊட்டச்சத்து கிடைப்பை மேம்படுத்துதல்',
    benefits_en: [
      'Increased organic matter buffer to improve moisture holding',
      'Enhanced availability of micronutrients (iron, manganese, zinc)',
      'Moderated high-calcium alkalinity stress',
      'Improved biological activity in shallow chalky topsoils'
    ],
    benefits_ta: [
      'ஈரப்பதத்தை தக்கவைக்க மண் கரிமப் பொருள் இடையக அதிகரிப்பு',
      'நுண்ணூட்டச்சத்துக்கள் (இரும்பு, மாங்கனீஸ், துத்தநாகம்) கிடைப்பை மேம்படுத்துதல்',
      'அதிக காரத்தன்மை மற்றும் சுண்ணாம்பு அழுத்தத்தை சீராக்குதல்',
      'ஆழமற்ற சுண்ணாம்பு மேல்மண்ணில் நுண்ணுயிர் செயல்பாட்டை மேம்படுத்துதல்'
    ]
  },
  clay: {
    id: 'clay',
    name_en: 'Clay soil',
    name_ta: 'களிமண்',
    crops_en: ['Cereal Rye', 'Oats', 'Buckwheat', 'Field Peas', 'Sorghum-Sudangrass'],
    crops_ta: ['செரியல் ரை', 'ஓட்ஸ்', 'பக்வீட்', 'பீல்ட் பீஸ்', 'சோளம்-சூடாங்கிராஸ்'],
    purpose_en: 'Root penetration + structure',
    purpose_ta: 'வேர் ஊடுருவலை மேம்படுத்துதல் + மண் அமைப்பை மேம்படுத்துதல்',
    benefits_en: [
      'Strong taproots loosen dense and compacted subsoil layers',
      'Significantly improved soil aggregate structure and water infiltration',
      'Enhanced root penetration channels for subsequent crops',
      'Reduces waterlogging and surface crust formation'
    ],
    benefits_ta: [
      'வலுவான வேர்கள் கடினமான மற்றும் இறுக்கமான அடிமண் அடுக்குகளை தளர்த்துகின்றன',
      'மண் கட்டமைப்பு மற்றும் நீர் ஊடுருவல் திறன் கணிசமாக மேம்படுதல்',
      'அடுத்தடுத்த பயிர்களுக்கான வேர் ஊடுருவல் பாதைகள் உருவாதல்',
      'நீர் தேங்குதல் மற்றும் மேற்பரப்பு இறுக்கப் படிவங்கள் உருவாவதைத் தடுத்தல்'
    ]
  },
  marl: {
    id: 'marl',
    name_en: 'Mary / Marl soil',
    name_ta: 'மார்ல் மண்',
    crops_en: ['Barley', 'Oats', 'Field Peas', 'Buckwheat', 'Wheat'],
    crops_ta: ['பார்லி', 'ஓட்ஸ்', 'பீல்ட் பீஸ்', 'பக்வீட்', 'கோதுமை'],
    purpose_en: 'Organic matter + soil structure',
    purpose_ta: 'கரிமப் பொருள் அதிகரிப்பு + மண் அமைப்பை மேம்படுத்துதல்',
    benefits_en: [
      'Enriched organic matter and active humus reservoir',
      'Improved soil structural stability and friability',
      'Balanced calcium-clay interaction for healthy rhizosphere biology',
      'Optimized nutrient retention and cation exchange capacity'
    ],
    benefits_ta: [
      'கரிமப் பொருள் மற்றும் செயலில் உள்ள மட்கு இருப்பை வளப்படுத்துதல்',
      'மண் கட்டமைப்பு நிலைப்புத்தன்மை மற்றும் மிருதுவான தன்மையை மேம்படுத்துதல்',
      'வேர் பகுதி நுண்ணுயிரிகளுக்கு ஏற்ற சமச்சீர் மண் சூழல்',
      'ஊட்டச்சத்து தக்கவைப்பு மற்றும் பரிமாற்ற திறனை மேம்படுத்துதல்'
    ]
  },
  red: {
    id: 'red',
    name_en: 'Red soil',
    name_ta: 'செம்மண்',
    crops_en: ['Field Peas', 'Horse Gram', 'Millet', 'Buckwheat', 'Oats'],
    crops_ta: ['பீல்ட் பீஸ்', 'கொள்ளு', 'சிறுதானியம்', 'பக்வீட்', 'ஓட்ஸ்'],
    purpose_en: 'Organic matter + nitrogen contribution',
    purpose_ta: 'கரிமப் பொருள் அதிகரிப்பு + நைட்ரஜன் பங்களிப்பு',
    benefits_en: [
      'Substantial addition of organic matter to porous and light soils',
      'Atmospheric nitrogen contribution through symbiotic legume nodulation',
      'Reduced nutrient leaching and improved fertilizer use efficiency',
      'Enhanced moisture-holding capacity during dry intervals'
    ],
    benefits_ta: [
      'நுண்துளை செம்மண்ணில் கணிசமான கரிமப் பொருள் சேர்க்கை',
      'பயறு வகை பயிர்கள் மூலம் வளிமண்டல நைட்ரஜன் சேர்க்கை',
      'ஊட்டச்சத்து கசிவைக் குறைத்தல் மற்றும் உரப் பயன்பாட்டுத் திறனை அதிகரித்தல்',
      'வறட்சி இடைவெளிகளில் ஈரப்பதம் தக்கவைக்கும் திறனை அதிகரித்தல்'
    ]
  },
  sand: {
    id: 'sand',
    name_en: 'Sand / Sandy soil',
    name_ta: 'மணல் மண்',
    crops_en: ['Millet', 'Horse Gram', 'Oats', 'Field Peas', 'Sorghum-Sudangrass'],
    crops_ta: ['சிறுதானியம்', 'கொள்ளு', 'ஓட்ஸ்', 'பீல்ட் பீஸ்', 'சோளம்-சூடாங்கிராஸ்'],
    purpose_en: 'Build organic matter + improve water retention',
    purpose_ta: 'கரிமப் பொருள் அதிகரிப்பு + நீர் தக்கவைப்பை மேம்படுத்துதல்',
    benefits_en: [
      'Rapid buildup of active soil organic matter and humus',
      'Substantially improved water retention and reduced percolation loss',
      'Binds loose sandy particles to minimize wind and water erosion',
      'Greatly improves cation exchange and nutrient holding capacity'
    ],
    benefits_ta: [
      'செயலில் உள்ள மண் கரிமப் பொருள் மற்றும் மட்கை விரைவாக உருவாக்குகிறது',
      'மண்ணின் ஈரப்பதம் மற்றும் நீர் தக்கவைக்கும் திறனை கணிசமாக மேம்படுத்துகிறது',
      'மணல் துகள்களை ஒன்றிணைத்து காற்று மற்றும் நீர் அரிப்பைத் தடுக்கிறது',
      'ஊட்டச்சத்துக்கள் அடித்துச் செல்லப்படாமல் தக்கவைக்கும் திறனை அதிகரிக்கிறது'
    ]
  },
  silt: {
    id: 'silt',
    name_en: 'Silt soil',
    name_ta: 'வண்டல் நுண்மண்',
    crops_en: ['Cereal Rye', 'Oats', 'Field Peas', 'Barley', 'Buckwheat'],
    crops_ta: ['செரியல் ரை', 'ஓட்ஸ்', 'பீல்ட் பீஸ்', 'பார்லி', 'பக்வீட்'],
    purpose_en: 'Structure + erosion/compaction management',
    purpose_ta: 'மண் அமைப்பு மேம்பாடு + அரிப்பு/இறுக்கம் மேலாண்மை',
    benefits_en: [
      'Enhanced aggregate stability to prevent surface crusting and compaction',
      'Effective reduction of topsoil erosion and runoff on slopes',
      'Promotes deep root penetration and healthy soil aeration',
      'Enriches native soil microbiome and humus reserves'
    ],
    benefits_ta: [
      'மேற்பரப்பு இறுக்கம் மற்றும் படிவங்கள் உருவாவதை தடுத்து நிலைப்புத்தன்மையை மேம்படுத்துகிறது',
      'சாய்வு நிலங்களில் மேல்மண் அரிப்பு மற்றும் நீர் வழிந்தோடுதலை பெருமளவு குறைக்கிறது',
      'ஆழமான வேர் வளர்ச்சி மற்றும் ஆரோக்கியமான மண் காற்றோட்டத்தை ஊக்குவிக்கிறது',
      'மண்ணின் இயற்கையான நுண்ணுயிரிகள் மற்றும் மட்கு இருப்பை வளப்படுத்துகிறது'
    ]
  }
};

const SOIL_KEYS = ['alluvial', 'black', 'chalky', 'clay', 'marl', 'red', 'sand', 'silt'];

// Helper to map detected soil string to a valid soil key
function matchSoilKey(rawString) {
  if (!rawString || typeof rawString !== 'string') return null;
  const s = rawString.toLowerCase();
  if (s.includes('alluvial') || s.includes('loam')) return 'alluvial';
  if (s.includes('black')) return 'black';
  if (s.includes('chalk')) return 'chalky';
  if (s.includes('clay')) return 'clay';
  if (s.includes('marl') || s.includes('mary')) return 'marl';
  if (s.includes('red')) return 'red';
  if (s.includes('sand')) return 'sand';
  if (s.includes('silt')) return 'silt';
  return null;
}

export default function HomePage() {
  const { lang, setLang } = useLang();

  // ── Important Things popup state (independent language) ──
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupLang, setPopupLang] = useState('en'); // independent from global lang

  // Load existing Soil AI analysis if available
  const [lastSoilAnalysis, setLastSoilAnalysis] = useState(null);
  const [selectedSoilKey, setSelectedSoilKey] = useState('alluvial');
  const [hasDetectedSoil, setHasDetectedSoil] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('last_soil_analysis');
      if (stored) {
        const parsed = JSON.parse(stored);
        setLastSoilAnalysis(parsed);
        const rawClass = parsed.ai_soil_class || parsed.ai_soil_result || parsed.soil_type || parsed.predicted_soil || '';
        const matched = matchSoilKey(rawClass);
        if (matched) {
          setSelectedSoilKey(matched);
          setHasDetectedSoil(true);
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  // Lock body scroll when popup is open
  useEffect(() => {
    if (popupOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [popupOpen]);

  const currentSoil = SOIL_TYPES_DATA[selectedSoilKey] || SOIL_TYPES_DATA.alluvial;
  const isTa = lang === 'ta';
  const isPopupTa = popupLang === 'ta';

  const features = isTa
    ? [
        { icon: '🤖', title: tr('ta', 'feat_ai_title'), desc: tr('ta', 'feat_ai_desc') },
        { icon: '⚡', title: tr('ta', 'feat_speed_title'), desc: tr('ta', 'feat_speed_desc') },
        { icon: '🌍', title: tr('ta', 'feat_lang_title'), desc: tr('ta', 'feat_lang_desc') },
        { icon: '📊', title: tr('ta', 'feat_hist_title'), desc: tr('ta', 'feat_hist_desc') },
        { icon: '💊', title: tr('ta', 'feat_treat_title'), desc: tr('ta', 'feat_treat_desc') },
        { icon: '🔒', title: tr('ta', 'feat_sec_title'), desc: tr('ta', 'feat_sec_desc') },
      ]
    : [
        { icon: '🤖', title: tr('en', 'feat_ai_title'), desc: tr('en', 'feat_ai_desc') },
        { icon: '⚡', title: tr('en', 'feat_speed_title'), desc: tr('en', 'feat_speed_desc') },
        { icon: '🌍', title: tr('en', 'feat_lang_title'), desc: tr('en', 'feat_lang_desc') },
        { icon: '📊', title: tr('en', 'feat_hist_title'), desc: tr('en', 'feat_hist_desc') },
        { icon: '💊', title: tr('en', 'feat_treat_title'), desc: tr('en', 'feat_treat_desc') },
        { icon: '🔒', title: tr('en', 'feat_sec_title'), desc: tr('en', 'feat_sec_desc') },
      ];

  // ── 12 PROCEDURES CONFIGURATION ─────────────────────────────────────────────
  const procedures = [
    // Procedure 1: Soil Type
    {
      numEn: 'Procedure 1',
      numTa: 'செய்முறை 1',
      titleEn: 'Soil Type',
      titleTa: 'மண் வகை',
      renderEn: () => (
        <div>
          <p style={{ margin: '0 0 0.5rem', color: '#c8e6c9', lineHeight: 1.6 }}>
            {hasDetectedSoil
              ? `Soil AI Detection: ${currentSoil.name_en}`
              : `Soil Type: ${currentSoil.name_en}`}
          </p>
          <div style={{ display: 'inline-block', background: 'rgba(76,175,80,0.2)', border: '1px solid #4caf50', padding: '0.35rem 0.85rem', borderRadius: '8px', color: '#a5d6a7', fontSize: '0.9rem', fontWeight: 600 }}>
            {currentSoil.name_en}
          </div>
        </div>
      ),
      renderTa: () => (
        <div>
          <p style={{ margin: '0 0 0.5rem', color: '#c8e6c9', lineHeight: 1.6 }}>
            {hasDetectedSoil
              ? `மண் AI கண்டறிதல்: ${currentSoil.name_ta}`
              : `மண் வகை: ${currentSoil.name_ta}`}
          </p>
          <div style={{ display: 'inline-block', background: 'rgba(76,175,80,0.2)', border: '1px solid #4caf50', padding: '0.35rem 0.85rem', borderRadius: '8px', color: '#a5d6a7', fontSize: '0.9rem', fontWeight: 600 }}>
            {currentSoil.name_ta}
          </div>
        </div>
      ),
    },
    // Procedure 2: Recommended Crops / Grains
    {
      numEn: 'Procedure 2',
      numTa: 'செய்முறை 2',
      titleEn: 'Recommended Crops / Grains',
      titleTa: 'பரிந்துரைக்கப்படும் பயிர்கள் / தானியங்கள்',
      renderEn: () => (
        <div>
          <p style={{ margin: '0 0 0.6rem', color: '#c8e6c9', lineHeight: 1.6 }}>
            Recommended crops and grains for {currentSoil.name_en}:
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.4rem', color: '#e8f5e9', lineHeight: 1.8 }}>
            {currentSoil.crops_en.map((c, i) => (
              <li key={i}><strong style={{ color: '#7dd56f' }}>{c}</strong></li>
            ))}
          </ul>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#a5d6a7', fontStyle: 'italic', background: 'rgba(0,0,0,0.25)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
            ℹ️ Note: Farmers are not required to grow all listed crops together. Select suitable crops according to season, seed availability, and local farm practices.
          </p>
        </div>
      ),
      renderTa: () => (
        <div>
          <p style={{ margin: '0 0 0.6rem', color: '#c8e6c9', lineHeight: 1.6 }}>
            {currentSoil.name_ta}க்கு பரிந்துரைக்கப்படும் பயிர்கள் / தானியங்கள்:
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.4rem', color: '#e8f5e9', lineHeight: 1.8 }}>
            {currentSoil.crops_ta.map((c, i) => (
              <li key={i}><strong style={{ color: '#7dd56f' }}>{c}</strong></li>
            ))}
          </ul>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#a5d6a7', fontStyle: 'italic', background: 'rgba(0,0,0,0.25)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
            ℹ️ குறிப்பு: பட்டியலில் உள்ள அனைத்து பயிர்களையும் கட்டாயமாக ஒன்றாக பயிரிட வேண்டிய அவசியமில்லை. பருவம், விதை கிடைப்பு மற்றும் உள்ளூர் விவசாய நடைமுறைக்கு ஏற்ப தேர்வு செய்யவும்.
          </p>
        </div>
      ),
    },
    // Procedure 3: Main Purpose
    {
      numEn: 'Procedure 3',
      numTa: 'செய்முறை 3',
      titleEn: 'Main Purpose',
      titleTa: 'முக்கிய நோக்கம்',
      renderEn: () => (
        <div>
          <div style={{ background: 'rgba(46,125,50,0.25)', borderLeft: '4px solid #4caf50', padding: '0.75rem 1rem', borderRadius: '0 8px 8px 0', marginBottom: '0.6rem' }}>
            <strong style={{ color: '#7dd56f', fontSize: '1rem' }}>{currentSoil.purpose_en}</strong>
          </div>
          <p style={{ margin: 0, color: '#c8e6c9', lineHeight: 1.6, fontSize: '0.92rem' }}>
            This target guidance focuses on restoring natural soil equilibrium, replenishing essential organic reserves, and optimizing crop root environment for {currentSoil.name_en}.
          </p>
        </div>
      ),
      renderTa: () => (
        <div>
          <div style={{ background: 'rgba(46,125,50,0.25)', borderLeft: '4px solid #4caf50', padding: '0.75rem 1rem', borderRadius: '0 8px 8px 0', marginBottom: '0.6rem' }}>
            <strong style={{ color: '#7dd56f', fontSize: '1rem' }}>{currentSoil.purpose_ta}</strong>
          </div>
          <p style={{ margin: 0, color: '#c8e6c9', lineHeight: 1.6, fontSize: '0.92rem' }}>
            இந்த இலக்கு வழிகாட்டுதல் {currentSoil.name_ta}க்கான இயற்கை சமநிலையை மீட்டெடுப்பது, அத்தியாவசிய கரிம இருப்பை நிரப்புவது மற்றும் பயிர் வேர் சூழலை மேம்படுத்துவதை முதன்மை நோக்கமாகக் கொண்டுள்ளது.
          </p>
        </div>
      ),
    },
    // Procedure 4: Seed Preparation / Mixing
    {
      numEn: 'Procedure 4',
      numTa: 'செய்முறை 4',
      titleEn: 'Seed Preparation / Mixing',
      titleTa: 'விதை தயாரித்தல் / கலவை',
      renderEn: () => (
        <div>
          <p style={{ margin: '0 0 0.5rem', color: '#c8e6c9', lineHeight: 1.6 }}>
            Recommended cover and soil-improvement crops should be selected according to soil type.
          </p>
          <p style={{ margin: 0, color: '#c8e6c9', lineHeight: 1.6 }}>
            If multiple crops are recommended, they may be selected as a suitable mixture or rotation according to local farming practice. It is not required to mix every listed crop together.
          </p>
        </div>
      ),
      renderTa: () => (
        <div>
          <p style={{ margin: '0 0 0.5rem', color: '#c8e6c9', lineHeight: 1.6 }}>
            மண் வகைக்கு ஏற்ற பரிந்துரைக்கப்பட்ட பயிர்களை தேர்வு செய்து விதைப்பது அவசியம்.
          </p>
          <p style={{ margin: 0, color: '#c8e6c9', lineHeight: 1.6 }}>
            பல பயிர்கள் பரிந்துரைக்கப்பட்டிருந்தால், உள்ளூர் விவசாய நடைமுறை மற்றும் சூழ்நிலைக்கு ஏற்ப கலவை அல்லது பயிர் சுழற்சியாக பயன்படுத்தலாம். அனைத்து பயிர்களையும் எப்போதும் ஒன்றாக கலக்க வேண்டும் என்று அவசியமில்லை.
          </p>
        </div>
      ),
    },
    // Procedure 5: Growing Period
    {
      numEn: 'Procedure 5',
      numTa: 'செய்முறை 5',
      titleEn: 'Growing Period',
      titleTa: 'வளர்ப்பு காலம்',
      renderEn: () => (
        <div>
          <p style={{ margin: '0 0 0.5rem', color: '#c8e6c9', lineHeight: 1.6 }}>
            The crop should be allowed to grow for an appropriate period based on crop type, soil, climate, moisture, and local farming conditions.
          </p>
          <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(76,175,80,0.3)', padding: '0.6rem 0.85rem', borderRadius: '8px', color: '#a5d6a7', fontSize: '0.88rem' }}>
            ⏱️ Growing duration is an approximate general guide (typically 45 to 90 days depending on variety) and varies based on seasonal conditions.
          </div>
        </div>
      ),
      renderTa: () => (
        <div>
          <p style={{ margin: '0 0 0.5rem', color: '#c8e6c9', lineHeight: 1.6 }}>
            பயிர் வகை, மண், காலநிலை, ஈரப்பதம் மற்றும் உள்ளூர் விவசாய சூழ்நிலையைப் பொறுத்து வளர்ப்பு காலம் மாறுபடும்.
          </p>
          <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(76,175,80,0.3)', padding: '0.6rem 0.85rem', borderRadius: '8px', color: '#a5d6a7', fontSize: '0.88rem' }}>
            ⏱️ கால அளவு என்பது பொதுவான மற்றும் தோராயமான வழிகாட்டி மட்டுமே (பயிர் வகையைப் பொறுத்து பொதுவாக 45 முதல் 90 நாட்கள் வரை). இது கள சூழ்நிலைக்கு ஏற்ப மாறுபடும்.
          </div>
        </div>
      ),
    },
    // Procedure 6: Soil Incorporation
    {
      numEn: 'Procedure 6',
      numTa: 'செய்முறை 6',
      titleEn: 'Soil Incorporation',
      titleTa: 'மண்ணில் சேர்த்தல்',
      renderEn: () => (
        <div>
          <p style={{ margin: 0, color: '#c8e6c9', lineHeight: 1.6 }}>
            After sufficient vegetative growth (typically at flowering stage before seed formation), the plant biomass can be incorporated into the soil according to suitable farming practice (such as plowing or tilling into the topsoil).
          </p>
        </div>
      ),
      renderTa: () => (
        <div>
          <p style={{ margin: 0, color: '#c8e6c9', lineHeight: 1.6 }}>
            போதுமான அளவு வளர்ந்த பிறகு (குறிப்பாக பூக்கும் தருணத்தில், விதைகள் உருவாவதற்கு முன்), தாவரத்தின் கரிமப் பொருளை பொருத்தமான விவசாய முறையின் அடிப்படையில் உழவு செய்து மண்ணில் சேர்க்கலாம்.
          </p>
        </div>
      ),
    },
    // Procedure 7: Decomposition / Waiting Period
    {
      numEn: 'Procedure 7',
      numTa: 'செய்முறை 7',
      titleEn: 'Decomposition / Waiting Period',
      titleTa: 'மக்குதல் / காத்திருக்கும் காலம்',
      renderEn: () => (
        <div>
          <p style={{ margin: '0 0 0.5rem', color: '#c8e6c9', lineHeight: 1.6 }}>
            The incorporated organic material needs adequate time to decompose in the soil.
          </p>
          <p style={{ margin: 0, color: '#a5d6a7', fontSize: '0.9rem', lineHeight: 1.5 }}>
            The decomposition period depends on soil temperature, moisture levels, and biological activity, and is not a fixed number of days for every condition.
          </p>
        </div>
      ),
      renderTa: () => (
        <div>
          <p style={{ margin: '0 0 0.5rem', color: '#c8e6c9', lineHeight: 1.6 }}>
            மண்ணில் சேர்க்கப்பட்ட தாவர கரிமப் பொருள் மக்குவதற்கு போதுமான காலம் தேவை.
          </p>
          <p style={{ margin: 0, color: '#a5d6a7', fontSize: '0.9rem', lineHeight: 1.5 }}>
            மக்கும் காலம் என்பது மண் வெப்பநிலை, ஈரப்பதம் மற்றும் நுண்ணுயிர் செயல்பாட்டைப் பொறுத்து மாறுபடும் என்பதால் அனைத்து மண் மற்றும் பயிர்களுக்கும் ஒரே நிரந்தர நாட்கள் அல்ல.
          </p>
        </div>
      ),
    },
    // Procedure 8: Repeat Routine
    {
      numEn: 'Procedure 8',
      numTa: 'செய்முறை 8',
      titleEn: 'Repeat Routine',
      titleTa: 'மீண்டும் செய்யும் முறை',
      renderEn: () => (
        <div>
          <p style={{ margin: 0, color: '#c8e6c9', lineHeight: 1.6 }}>
            Soil-improvement crops can be repeated periodically as part of a suitable crop rotation and long-term soil-management routine.
          </p>
        </div>
      ),
      renderTa: () => (
        <div>
          <p style={{ margin: 0, color: '#c8e6c9', lineHeight: 1.6 }}>
            பொருத்தமான பயிர் சுழற்சி மற்றும் மண் மேலாண்மை முறையின் ஒரு பகுதியாக இந்த மண் மேம்பாட்டு முறையை காலமுறைப்படி மீண்டும் செய்யலாம்.
          </p>
        </div>
      ),
    },
    // Procedure 9: Expected Soil Benefits
    {
      numEn: 'Procedure 9',
      numTa: 'செய்முறை 9',
      titleEn: 'Expected Soil Benefits',
      titleTa: 'எதிர்பார்க்கப்படும் மண் நன்மைகள்',
      renderEn: () => (
        <div>
          <p style={{ margin: '0 0 0.5rem', color: '#c8e6c9', lineHeight: 1.6 }}>
            Relevant expected benefits for {currentSoil.name_en}:
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.4rem', color: '#e8f5e9', lineHeight: 1.7 }}>
            {currentSoil.benefits_en.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      ),
      renderTa: () => (
        <div>
          <p style={{ margin: '0 0 0.5rem', color: '#c8e6c9', lineHeight: 1.6 }}>
            {currentSoil.name_ta}க்கான எதிர்பார்க்கப்படும் நன்மைகள்:
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.4rem', color: '#e8f5e9', lineHeight: 1.7 }}>
            {currentSoil.benefits_ta.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      ),
    },
    // Procedure 10: Organic Soil Improvement
    {
      numEn: 'Procedure 10',
      numTa: 'செய்முறை 10',
      titleEn: 'Organic Soil Improvement',
      titleTa: 'இயற்கை / கரிம மண் மேம்பாடு',
      renderEn: () => (
        <div>
          <p style={{ margin: '0 0 0.5rem', color: '#c8e6c9', lineHeight: 1.6 }}>
            This recommendation is intended as an organic and natural soil-improvement approach using plant biomass and soil organic matter.
          </p>
          <p style={{ margin: 0, color: '#a5d6a7', fontSize: '0.9rem', lineHeight: 1.5 }}>
            It serves as a sustainable biological foundation and does not claim to replace every fertilizer or specialized soil treatment in every situation.
          </p>
        </div>
      ),
      renderTa: () => (
        <div>
          <p style={{ margin: '0 0 0.5rem', color: '#c8e6c9', lineHeight: 1.6 }}>
            இந்த முறையானது தாவர கரிமப் பொருள் மற்றும் மண் கரிமப் பொருளை பயன்படுத்தி இயற்கை / கரிம மண் மேம்பாட்டை நோக்கமாகக் கொண்டது.
          </p>
          <p style={{ margin: 0, color: '#a5d6a7', fontSize: '0.9rem', lineHeight: 1.5 }}>
            இது ஒரு நிலையான உயிரியல் அடித்தளமாகும்; எல்லா உரங்கள் அல்லது அனைத்து மண் சிகிச்சைகளுக்கும் இது முழுமையான மாற்று என்று கூறப்படவில்லை.
          </p>
        </div>
      ),
    },
    // Procedure 11: Important Precautions
    {
      numEn: 'Procedure 11',
      numTa: 'செய்முறை 11',
      titleEn: 'Important Precautions',
      titleTa: 'முக்கிய முன்னெச்சரிக்கைகள்',
      renderEn: () => (
        <ul style={{ margin: 0, paddingLeft: '1.4rem', color: '#c8e6c9', lineHeight: 1.7 }}>
          <li>Do not blindly mix every recommended crop.</li>
          <li>Select crops according to soil, climate, season, and local conditions.</li>
          <li>Avoid excessive water stress.</li>
          <li>Allow adequate decomposition before relying on the organic material as part of soil improvement.</li>
          <li>Follow local agricultural recommendations when necessary.</li>
        </ul>
      ),
      renderTa: () => (
        <ul style={{ margin: 0, paddingLeft: '1.4rem', color: '#c8e6c9', lineHeight: 1.7 }}>
          <li>பரிந்துரைக்கப்பட்ட அனைத்து பயிர்களையும் கண்மூடித்தனமாக ஒன்றாக கலக்க வேண்டாம்.</li>
          <li>மண், காலநிலை, பருவம் மற்றும் உள்ளூர் சூழ்நிலைக்கு ஏற்ற பயிர்களை தேர்வு செய்யவும்.</li>
          <li>அதிக நீர் பற்றாக்குறையை தவிர்க்கவும்.</li>
          <li>கரிமப் பொருள் மக்குவதற்கு போதுமான காலம் வழங்கவும்.</li>
          <li>தேவையான இடங்களில் உள்ளூர் வேளாண்மை நிபுணர்களின் ஆலோசனையைப் பின்பற்றவும்.</li>
        </ul>
      ),
    },
    // Procedure 12: Yearly Soil-Improvement Routine
    {
      numEn: 'Procedure 12',
      numTa: 'செய்முறை 12',
      titleEn: 'Yearly Soil-Improvement Routine',
      titleTa: 'வருடாந்திர மண் மேம்பாட்டு முறை',
      renderEn: () => (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.4rem',
            background: 'rgba(0,0,0,0.35)',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            border: '1px solid #2d5a27',
            color: '#e8f5e9',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            marginBottom: '0.6rem'
          }}>
            <span style={{ color: '#7dd56f', fontWeight: 700 }}>Select suitable crops</span>
            <span style={{ color: '#4caf50' }}>→</span>
            <span style={{ color: '#7dd56f', fontWeight: 700 }}>Prepare / sow seeds</span>
            <span style={{ color: '#4caf50' }}>→</span>
            <span style={{ color: '#7dd56f', fontWeight: 700 }}>Grow for an appropriate period</span>
            <span style={{ color: '#4caf50' }}>→</span>
            <span style={{ color: '#7dd56f', fontWeight: 700 }}>Incorporate plant biomass</span>
            <span style={{ color: '#4caf50' }}>→</span>
            <span style={{ color: '#7dd56f', fontWeight: 700 }}>Allow decomposition</span>
            <span style={{ color: '#4caf50' }}>→</span>
            <span style={{ color: '#7dd56f', fontWeight: 700 }}>Repeat through suitable crop rotation</span>
          </div>
          <p style={{ margin: 0, color: '#a5d6a7', fontSize: '0.88rem', fontStyle: 'italic' }}>
            ℹ️ This yearly routine is a flexible cycle to be adapted to local seasonal conditions and is not a rigid universal calendar.
          </p>
        </div>
      ),
      renderTa: () => (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.4rem',
            background: 'rgba(0,0,0,0.35)',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            border: '1px solid #2d5a27',
            color: '#e8f5e9',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            marginBottom: '0.6rem'
          }}>
            <span style={{ color: '#7dd56f', fontWeight: 700 }}>பொருத்தமான பயிர்களை தேர்வு செய்தல்</span>
            <span style={{ color: '#4caf50' }}>→</span>
            <span style={{ color: '#7dd56f', fontWeight: 700 }}>விதை தயாரித்தல் / விதைத்தல்</span>
            <span style={{ color: '#4caf50' }}>→</span>
            <span style={{ color: '#7dd56f', fontWeight: 700 }}>பொருத்தமான காலத்திற்கு வளர்த்தல்</span>
            <span style={{ color: '#4caf50' }}>→</span>
            <span style={{ color: '#7dd56f', fontWeight: 700 }}>தாவர கரிமப் பொருளை மண்ணில் சேர்த்தல்</span>
            <span style={{ color: '#4caf50' }}>→</span>
            <span style={{ color: '#7dd56f', fontWeight: 700 }}>மக்குவதற்கு காலம் வழங்குதல்</span>
            <span style={{ color: '#4caf50' }}>→</span>
            <span style={{ color: '#7dd56f', fontWeight: 700 }}>பொருத்தமான பயிர் சுழற்சியில் மீண்டும் செய்தல்</span>
          </div>
          <p style={{ margin: 0, color: '#a5d6a7', fontSize: '0.88rem', fontStyle: 'italic' }}>
            ℹ️ இது அனைத்து விவசாய நிலங்களுக்கும் ஒரே கட்டாய கால அட்டவணை அல்ல; உள்ளூர் விவசாய பருவத்திற்கு ஏற்ப நெகிழ்வாகப் பயன்படுத்தப்பட வேண்டும்.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0d1f0d', color: '#e8f5e9', fontFamily: 'Inter, sans-serif' }}>
      
      {/* ── TOP-RIGHT LANGUAGE SELECTOR BAR ─────────────────────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '5.2rem 1.5rem 0.5rem',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'inline-flex',
          gap: '0.35rem',
          background: 'rgba(0,0,0,0.5)',
          padding: '0.3rem',
          borderRadius: '10px',
          border: '1px solid #2d5a27',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        }}>
          <button
            type="button"
            id="home-lang-ta-btn"
            onClick={() => setLang('ta')}
            style={{
              background: isTa ? '#4caf50' : 'transparent',
              color: isTa ? '#fff' : '#a5d6a7',
              border: 'none',
              borderRadius: '8px',
              padding: '0.45rem 1rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.88rem',
              transition: 'all 0.2s',
            }}
          >
            🇮🇳 தமிழ்
          </button>
          <button
            type="button"
            id="home-lang-en-btn"
            onClick={() => setLang('en')}
            style={{
              background: !isTa ? '#4caf50' : 'transparent',
              color: !isTa ? '#fff' : '#a5d6a7',
              border: 'none',
              borderRadius: '8px',
              padding: '0.45rem 1rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.88rem',
              transition: 'all 0.2s',
            }}
          >
            🌐 English
          </button>
        </div>
      </div>

      {/* ── HERO SECTION ────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1a2e1a 0%, #2d5a27 60%, #1b5e20 100%)',
        padding: '2.5rem 2rem 3.5rem',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '3.8rem', marginBottom: '0.75rem' }}>🌾</div>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 800,
          fontFamily: 'Outfit, sans-serif',
          background: 'linear-gradient(135deg, #7dd56f, #28a745)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem',
        }}>
          {isTa ? tr('ta', 'home_title') : tr('en', 'home_title')}
        </h1>
        <p style={{
          fontSize: '1.15rem',
          color: '#a5d6a7',
          maxWidth: '680px',
          margin: '0 auto 2rem',
          lineHeight: 1.7,
        }}>
          {isTa ? tr('ta', 'home_subtitle') : tr('en', 'home_subtitle')}
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/analyzer" style={{
            background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
            color: '#fff',
            padding: '0.85rem 2rem',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '1rem',
            boxShadow: '0 4px 20px rgba(76,175,80,0.4)',
            transition: 'transform 0.2s',
          }}>
            {isTa ? tr('ta', 'home_btn_analyzer') : tr('en', 'home_btn_analyzer')}
          </Link>
          <Link to="/dashboard" style={{
            background: 'transparent',
            color: '#7dd56f',
            padding: '0.85rem 2rem',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '1rem',
            border: '2px solid #4caf50',
          }}>
            {isTa ? tr('ta', 'nav_dashboard') : tr('en', 'nav_dashboard')}
          </Link>
        </div>
      </div>

      {/* ── FEATURES SECTION ─────────────────────────────────────────────────── */}
      <div style={{ padding: '3.5rem 2rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.9rem', fontWeight: 700, color: '#7dd56f', marginBottom: '2.5rem', fontFamily: 'Outfit, sans-serif' }}>
          {isTa ? tr('ta', 'home_why_title') : tr('en', 'home_why_title')}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {features.map((f, idx) => (
            <div key={idx} style={{
              background: 'linear-gradient(135deg, #1a2e1a, #1e3a1e)',
              border: '1px solid #2d5a27',
              borderRadius: '16px',
              padding: '1.75rem',
              textAlign: 'center',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{f.icon}</div>
              <h3 style={{ color: '#7dd56f', fontWeight: 700, marginBottom: '0.65rem', fontSize: '1.1rem' }}>{f.title}</h3>
              <p style={{ color: '#a5d6a7', lineHeight: 1.6, fontSize: '0.92rem', margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FLOATING "IMPORTANT THINGS" ICON BUTTON ─────────────────────────── */}
      <button
        type="button"
        id="important-things-fab"
        onClick={() => setPopupOpen(true)}
        aria-label="Important Things to Do"
        style={{
          position: 'fixed',
          bottom: '90px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
          border: '2.5px solid #7dd56f',
          color: '#fff',
          fontSize: '1.65rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 90,
          boxShadow: '0 6px 28px rgba(76,175,80,0.5)',
          animation: 'importantPulse 2.5s ease-in-out infinite',
          transition: 'transform 0.2s',
        }}
      >
        📋
      </button>

      {/* ── IMPORTANT THINGS POPUP / MODAL ─────────────────────────────────── */}
      {popupOpen && (
        <div
          id="important-things-overlay"
          onClick={() => setPopupOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            id="important-things-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(180deg, #0f200f 0%, #142814 100%)',
              border: '1.5px solid #2d5a27',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              animation: 'popupSlideIn 0.25s ease-out',
            }}
          >
            {/* ── Modal Header (sticky) ─────────────────────────────────── */}
            <div style={{
              position: 'sticky',
              top: 0,
              zIndex: 5,
              background: 'linear-gradient(135deg, #1a2e1a, #1e3a1e)',
              borderBottom: '1px solid #2d5a27',
              borderRadius: '20px 20px 0 0',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.5rem' }}>📋</span>
                <h2 style={{
                  margin: 0,
                  color: '#7dd56f',
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 'clamp(1.1rem, 3vw, 1.45rem)',
                  fontWeight: 800,
                }}>
                  {isPopupTa ? 'செய்ய வேண்டிய முக்கியமானவை' : 'Important Things to Do'}
                </h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Popup-local language toggle */}
                <div style={{
                  display: 'inline-flex',
                  gap: '0.25rem',
                  background: 'rgba(0,0,0,0.4)',
                  padding: '0.2rem',
                  borderRadius: '8px',
                  border: '1px solid #2d5a27',
                }}>
                  <button
                    type="button"
                    onClick={() => setPopupLang('en')}
                    style={{
                      background: !isPopupTa ? '#4caf50' : 'transparent',
                      color: !isPopupTa ? '#fff' : '#a5d6a7',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.3rem 0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      transition: 'all 0.2s',
                    }}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setPopupLang('ta')}
                    style={{
                      background: isPopupTa ? '#4caf50' : 'transparent',
                      color: isPopupTa ? '#fff' : '#a5d6a7',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.3rem 0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      transition: 'all 0.2s',
                    }}
                  >
                    தமிழ்
                  </button>
                </div>
                {/* Close button */}
                <button
                  type="button"
                  onClick={() => setPopupOpen(false)}
                  aria-label="Close"
                  style={{
                    background: 'rgba(244,67,54,0.2)',
                    border: '1px solid #f4433680',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    color: '#ef9a9a',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* ── Modal Body ─────────────────────────────────────────── */}
            <div style={{ padding: '1.5rem' }}>

              {/* Intro blurb */}
              <p style={{
                color: '#c8e6c9',
                fontSize: '0.98rem',
                maxWidth: '700px',
                margin: '0 0 1.5rem',
                lineHeight: 1.6,
                textAlign: 'center',
              }}>
                {isPopupTa
                  ? 'Soil AI மண் வகைப்பாட்டின் அடிப்படையில் இயற்கை மற்றும் கரிம மண் மேம்பாட்டு வழிகாட்டுதல்.'
                  : 'Practical organic soil-improvement guidance based on Soil AI soil classification.'}
              </p>

              {/* Soil Detection Status Banner */}
              {hasDetectedSoil && lastSoilAnalysis && (
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid #4caf50',
                  borderRadius: '12px',
                  padding: '0.65rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#a5d6a7',
                  fontSize: '0.88rem',
                  marginBottom: '1.25rem',
                }}>
                  <span>🌱</span>
                  <span>
                    {isPopupTa
                      ? `சமீபத்திய Soil AI பகுப்பாய்வு மூலம் கண்டறியப்பட்டது: ${currentSoil.name_ta}`
                      : `Detected from latest Soil AI analysis: ${currentSoil.name_en}`}
                  </span>
                </div>
              )}

              {/* Soil Type Selection Tabs */}
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <div style={{
                  color: '#81c784',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '0.65rem',
                }}>
                  {isPopupTa ? 'மண் வகையைத் தேர்ந்தெடுக்கவும்:' : 'Select Soil Type to Explore:'}
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.4rem',
                  justifyContent: 'center',
                }}>
                  {SOIL_KEYS.map((key) => {
                    const s = SOIL_TYPES_DATA[key];
                    const isActive = selectedSoilKey === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedSoilKey(key)}
                        style={{
                          background: isActive ? '#4caf50' : 'rgba(0,0,0,0.35)',
                          color: isActive ? '#fff' : '#c8e6c9',
                          border: isActive ? '1px solid #81c784' : '1px solid rgba(76,175,80,0.3)',
                          borderRadius: '8px',
                          padding: '0.45rem 0.85rem',
                          fontWeight: isActive ? 700 : 500,
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          transition: 'all 0.2s',
                        }}
                      >
                        {isPopupTa ? s.name_ta : s.name_en}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Soil Summary Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #1a2e1a, #1e3a1e)',
                border: '1.5px solid #2d5a27',
                borderRadius: '14px',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
              }}>
                <div>
                  <div style={{ color: '#81c784', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    🟫 {isPopupTa ? 'மண் வகை' : 'Soil Type'}
                  </div>
                  <div style={{ color: '#7dd56f', fontSize: '1.15rem', fontWeight: 800 }}>
                    {isPopupTa ? currentSoil.name_ta : currentSoil.name_en}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#81c784', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    🌾 {isPopupTa ? 'பரிந்துரைக்கப்படும் பயிர்கள்' : 'Recommended Crops'}
                  </div>
                  <div style={{ color: '#e8f5e9', fontSize: '0.92rem', fontWeight: 600, lineHeight: 1.5 }}>
                    {isPopupTa ? currentSoil.crops_ta.join(', ') : currentSoil.crops_en.join(', ')}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#81c784', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    🎯 {isPopupTa ? 'முக்கிய நோக்கம்' : 'Main Purpose'}
                  </div>
                  <div style={{ color: '#c8e6c9', fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.5 }}>
                    {isPopupTa ? currentSoil.purpose_ta : currentSoil.purpose_en}
                  </div>
                </div>
              </div>

              {/* ── 12 PROCEDURES LIST ──────────────────────────────────── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {procedures.map((proc, idx) => {
                  const procNum = isPopupTa ? proc.numTa : proc.numEn;
                  const procTitle = isPopupTa ? proc.titleTa : proc.titleEn;

                  return (
                    <div
                      key={idx}
                      style={{
                        background: 'linear-gradient(135deg, #152715, #1c351c)',
                        border: '1px solid #2d5a27',
                        borderRadius: '14px',
                        padding: '1.25rem 1.5rem',
                        boxShadow: '0 3px 14px rgba(0,0,0,0.2)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                        <span style={{
                          background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
                          color: '#fff',
                          padding: '0.2rem 0.65rem',
                          borderRadius: '7px',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          letterSpacing: '0.4px',
                        }}>
                          {procNum}
                        </span>
                        <h3 style={{
                          margin: 0,
                          color: '#7dd56f',
                          fontFamily: 'Outfit, sans-serif',
                          fontSize: '1.05rem',
                          fontWeight: 700,
                        }}>
                          {procTitle}
                        </h3>
                      </div>

                      <div style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                        {isPopupTa ? proc.renderTa() : proc.renderEn()}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── CSS ANIMATIONS ───────────────────────────────────────────────────── */}
      <style>{`
        @keyframes importantPulse {
          0%, 100% {
            box-shadow: 0 6px 28px rgba(76,175,80,0.45);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 8px 36px rgba(76,175,80,0.75), 0 0 0 8px rgba(76,175,80,0.15);
            transform: scale(1.07);
          }
        }
        @keyframes popupSlideIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        #important-things-fab:hover {
          transform: scale(1.12) !important;
          box-shadow: 0 8px 35px rgba(76,175,80,0.7) !important;
        }
        #important-things-modal::-webkit-scrollbar {
          width: 6px;
        }
        #important-things-modal::-webkit-scrollbar-track {
          background: transparent;
        }
        #important-things-modal::-webkit-scrollbar-thumb {
          background: #2d5a27;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}
