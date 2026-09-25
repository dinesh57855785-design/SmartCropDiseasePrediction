import { useLang } from '../contexts/LanguageContext';
import { tr } from '../i18n/translations';

// ============================================================
// 14 GREEN MANURE CROPS FOR SOIL IMPROVEMENT
// Data sourced from standard Indian agricultural practices.
// Durations are approximate recommendations, not AI predictions.
// ============================================================

const CROPS_DATA = [
  {
    id: 1,
    name_en: 'Dhaincha (Sesbania)',
    name_ta: 'தைஞ்சா (செஸ்பேனியா)',
    purpose_en: 'Nitrogen fixation & organic matter',
    purpose_ta: 'தழைச்சத்து நிலைநிறுத்தல் & கரிமப் பொருள்',
    benefit_en: 'Fixes atmospheric nitrogen into the soil through root nodules. Adds large quantities of green biomass. Excellent for waterlogged and alkaline soils.',
    benefit_ta: 'வேர் முடிச்சுகள் மூலம் வளிமண்டல தழைச்சத்தை மண்ணில் நிலைநிறுத்துகிறது. அதிக அளவு பசுந்தழை உயிர்ப்பொருளைச் சேர்க்கிறது. நீர் தேங்கிய மற்றும் கார மண்ணுக்கு மிகவும் உகந்தது.',
    category_en: 'Nitrogen Fixation',
    category_ta: 'தழைச்சத்து நிலைநிறுத்தல்',
    growing_period_en: 'Approximately 45–60 days',
    growing_period_ta: 'தோராயமாக 45–60 நாட்கள்',
    incorporation_en: 'Plow the crop into soil at 50% flowering stage',
    incorporation_ta: '50% பூக்கும் நிலையில் பயிரை மண்ணில் உழவு செய்யுங்கள்',
    decomposition_en: 'Allow approximately 10–15 days for decomposition before next planting',
    decomposition_ta: 'அடுத்த நடவுக்கு முன் தோராயமாக 10–15 நாட்கள் மக்க விடுங்கள்',
    repeat_en: 'Once before each main cropping season (approximately 2–3 times per year)',
    repeat_ta: 'ஒவ்வொரு முக்கிய பயிர் பருவத்திற்கு முன் ஒரு முறை (ஆண்டுக்கு தோராயமாக 2–3 முறை)',
    precautions_en: 'Do not let it grow beyond flowering — seeds may become weedy. Ensure adequate moisture during growth.',
    precautions_ta: 'பூக்கும் நிலைக்கு அப்பால் வளர விடாதீர்கள் — விதைகள் களையாக மாறலாம். வளர்ச்சியின் போது போதுமான ஈரப்பதத்தை உறுதிசெய்யுங்கள்.',
  },
  {
    id: 2,
    name_en: 'Sunn Hemp (Crotalaria juncea)',
    name_ta: 'சணப்பை (கிரோட்டலேரியா)',
    purpose_en: 'Nitrogen fixation & soil structure',
    purpose_ta: 'தழைச்சத்து நிலைநிறுத்தல் & மண் அமைப்பு',
    benefit_en: 'Strong nitrogen fixer. Deep root system improves soil structure. Suppresses nematodes and weeds. Suitable for most soil types.',
    benefit_ta: 'வலுவான தழைச்சத்து நிலைநிறுத்தி. ஆழமான வேர் அமைப்பு மண் அமைப்பை மேம்படுத்துகிறது. நூற்புழு மற்றும் களைகளை அடக்குகிறது.',
    category_en: 'Nitrogen Fixation',
    category_ta: 'தழைச்சத்து நிலைநிறுத்தல்',
    growing_period_en: 'Approximately 45–60 days',
    growing_period_ta: 'தோராயமாக 45–60 நாட்கள்',
    incorporation_en: 'Incorporate into soil before pod formation',
    incorporation_ta: 'காய் உருவாவதற்கு முன் மண்ணில் கலக்குங்கள்',
    decomposition_en: 'Allow approximately 10–14 days for decomposition',
    decomposition_ta: 'தோராயமாக 10–14 நாட்கள் மக்க விடுங்கள்',
    repeat_en: 'Once or twice per year depending on soil condition',
    repeat_ta: 'மண் நிலையைப் பொறுத்து ஆண்டுக்கு ஒன்று அல்லது இரண்டு முறை',
    precautions_en: 'Avoid in waterlogged fields. Seeds are toxic to livestock — do not use as fodder.',
    precautions_ta: 'நீர் தேங்கிய வயல்களில் தவிர்க்கவும். விதைகள் கால்நடைகளுக்கு நச்சுத்தன்மையானவை — தீவனமாகப் பயன்படுத்தாதீர்கள்.',
  },
  {
    id: 3,
    name_en: 'Cowpea (Vigna unguiculata)',
    name_ta: 'தட்டைப்பயறு (விக்னா)',
    purpose_en: 'Nitrogen fixation & dual-purpose (grain + green manure)',
    purpose_ta: 'தழைச்சத்து நிலைநிறுத்தல் & இரட்டை பயன் (தானியம் + பசுந்தாள் உரம்)',
    benefit_en: 'Fixes nitrogen. Provides edible grain or fodder. Improves soil organic matter. Tolerates moderate drought.',
    benefit_ta: 'தழைச்சத்தை நிலைநிறுத்துகிறது. உண்ணக்கூடிய தானியம் அல்லது தீவனம் தருகிறது. மண் கரிமப்பொருளை மேம்படுத்துகிறது.',
    category_en: 'Nitrogen Fixation',
    category_ta: 'தழைச்சத்து நிலைநிறுத்தல்',
    growing_period_en: 'Approximately 60–90 days',
    growing_period_ta: 'தோராயமாக 60–90 நாட்கள்',
    incorporation_en: 'Incorporate at flowering stage, or harvest grain first then plow residue',
    incorporation_ta: 'பூக்கும் நிலையில் கலக்குங்கள், அல்லது தானியத்தை அறுவடை செய்த பின் எஞ்சியதை உழவு செய்யுங்கள்',
    decomposition_en: 'Allow approximately 10–15 days',
    decomposition_ta: 'தோராயமாக 10–15 நாட்கள் விடுங்கள்',
    repeat_en: 'Can be grown once per season as intercrop or rotation crop',
    repeat_ta: 'ஒவ்வொரு பருவத்திற்கும் ஊடுபயிர் அல்லது சுழற்சிப் பயிராக ஒரு முறை வளர்க்கலாம்',
    precautions_en: 'Monitor for pod borers. Do not over-irrigate — cowpea prefers well-drained soil.',
    precautions_ta: 'காய் துளைப்பான்களை கண்காணிக்கவும். அதிகமாக நீர் பாய்ச்சாதீர்கள் — தட்டைப்பயறு வடிகால் நிலத்தை விரும்புகிறது.',
  },
  {
    id: 4,
    name_en: 'Green Gram (Moong Bean)',
    name_ta: 'பாசிப்பயறு',
    purpose_en: 'Nitrogen fixation & quick organic matter',
    purpose_ta: 'தழைச்சத்து நிலைநிறுத்தல் & விரைவான கரிமப்பொருள்',
    benefit_en: 'Short duration legume that fixes nitrogen quickly. Leaves behind rich residues. Edible grain is a bonus.',
    benefit_ta: 'குறுகிய கால பருப்பு வகை, விரைவாக தழைச்சத்தை நிலைநிறுத்துகிறது. மிகுந்த எஞ்சிய பொருட்களை விட்டுச் செல்கிறது.',
    category_en: 'Nitrogen Fixation',
    category_ta: 'தழைச்சத்து நிலைநிறுத்தல்',
    growing_period_en: 'Approximately 60–70 days',
    growing_period_ta: 'தோராயமாக 60–70 நாட்கள்',
    incorporation_en: 'Harvest pods, then incorporate plant residue into soil',
    incorporation_ta: 'காய்களை அறுவடை செய்து, பின்னர் தாவர எஞ்சியதை மண்ணில் கலக்குங்கள்',
    decomposition_en: 'Allow approximately 7–10 days',
    decomposition_ta: 'தோராயமாக 7–10 நாட்கள் விடுங்கள்',
    repeat_en: 'Can be grown between two main crop seasons',
    repeat_ta: 'இரண்டு முக்கிய பயிர் பருவங்களுக்கு இடையில் வளர்க்கலாம்',
    precautions_en: 'Susceptible to yellow mosaic virus. Use resistant varieties in disease-prone areas.',
    precautions_ta: 'மஞ்சள் தேமல் நச்சுயிரி நோய்க்கு ஆளாகலாம். நோய் பாதிக்கப்படும் பகுதிகளில் எதிர்ப்பு ரகங்களைப் பயன்படுத்தவும்.',
  },
  {
    id: 5,
    name_en: 'Black Gram (Urad Dal)',
    name_ta: 'உளுந்து',
    purpose_en: 'Nitrogen fixation & residue management',
    purpose_ta: 'தழைச்சத்து நிலைநிறுத்தல் & எஞ்சிய பொருள் மேலாண்மை',
    benefit_en: 'Effective nitrogen fixer. Root residues enrich subsoil. Tolerates shade — suitable as intercrop.',
    benefit_ta: 'திறமையான தழைச்சத்து நிலைநிறுத்தி. வேர் எஞ்சியவை அடிமண்ணை வளப்படுத்துகின்றன. நிழலைத் தாங்கும் — ஊடுபயிராகப் பொருத்தமானது.',
    category_en: 'Nitrogen Fixation',
    category_ta: 'தழைச்சத்து நிலைநிறுத்தல்',
    growing_period_en: 'Approximately 70–90 days',
    growing_period_ta: 'தோராயமாக 70–90 நாட்கள்',
    incorporation_en: 'Harvest grain, incorporate straw and root residue',
    incorporation_ta: 'தானியத்தை அறுவடை செய்யுங்கள், வைக்கோல் மற்றும் வேர் எஞ்சியதை மண்ணில் கலக்குங்கள்',
    decomposition_en: 'Allow approximately 10–14 days',
    decomposition_ta: 'தோராயமாக 10–14 நாட்கள் விடுங்கள்',
    repeat_en: 'Once per year, typically in Kharif or Rabi season',
    repeat_ta: 'ஆண்டுக்கு ஒரு முறை, பொதுவாக காரிஃப் அல்லது ரபி பருவத்தில்',
    precautions_en: 'Avoid waterlogging. Susceptible to powdery mildew in humid conditions.',
    precautions_ta: 'நீர் தேக்கத்தைத் தவிர்க்கவும். ஈரப்பதமான நிலையில் சாம்பல் நோய்க்கு ஆளாகலாம்.',
  },
  {
    id: 6,
    name_en: 'Horse Gram (Kollu)',
    name_ta: 'கொள்ளு',
    purpose_en: 'Drought-tolerant soil cover & nitrogen fixation',
    purpose_ta: 'வறட்சி தாங்கும் மண் மூடு பயிர் & தழைச்சத்து நிலைநிறுத்தல்',
    benefit_en: 'Thrives in poor, dry soils. Fixes nitrogen even under stress. Excellent ground cover to prevent erosion.',
    benefit_ta: 'மோசமான, வறண்ட மண்ணில் செழிக்கும். அழுத்தத்தின் கீழும் தழைச்சத்தை நிலைநிறுத்துகிறது. அரிப்பைத் தடுக்க சிறந்த நிலப்போர்வை.',
    category_en: 'Soil Cover & Nitrogen',
    category_ta: 'மண் மூடுதல் & தழைச்சத்து',
    growing_period_en: 'Approximately 90–120 days',
    growing_period_ta: 'தோராயமாக 90–120 நாட்கள்',
    incorporation_en: 'Harvest grain or incorporate entire plant at maturity',
    incorporation_ta: 'முதிர்ச்சியில் தானியத்தை அறுவடை செய்யுங்கள் அல்லது முழு தாவரத்தையும் கலக்குங்கள்',
    decomposition_en: 'Allow approximately 14–20 days',
    decomposition_ta: 'தோராயமாக 14–20 நாட்கள் விடுங்கள்',
    repeat_en: 'Once per year in drylands or fallowed fields',
    repeat_ta: 'வறண்ட நிலங்கள் அல்லது தரிசு வயல்களில் ஆண்டுக்கு ஒரு முறை',
    precautions_en: 'Not suitable for waterlogged or very fertile soils. Mainly for dryland farming.',
    precautions_ta: 'நீர் தேங்கிய அல்லது மிகவும் வளமான மண்ணிற்குப் பொருத்தமானது அல்ல. முக்கியமாக வறண்ட நில விவசாயத்திற்கு.',
  },
  {
    id: 7,
    name_en: 'Cluster Bean (Guar)',
    name_ta: 'கொத்தவரை',
    purpose_en: 'Nitrogen fixation & soil structure improvement',
    purpose_ta: 'தழைச்சத்து நிலைநிறுத்தல் & மண் அமைப்பு மேம்பாடு',
    benefit_en: 'Deep taproot breaks hardpan layers. Excellent nitrogen fixer. Guar gum in seeds has industrial value.',
    benefit_ta: 'ஆழமான முக்கிய வேர் கடினமான அடுக்குகளை உடைக்கிறது. சிறந்த தழைச்சத்து நிலைநிறுத்தி.',
    category_en: 'Soil Structure',
    category_ta: 'மண் அமைப்பு',
    growing_period_en: 'Approximately 90–120 days',
    growing_period_ta: 'தோராயமாக 90–120 நாட்கள்',
    incorporation_en: 'Incorporate plant residue after pod harvest',
    incorporation_ta: 'காய் அறுவடைக்குப் பிறகு தாவர எஞ்சியதை கலக்குங்கள்',
    decomposition_en: 'Allow approximately 10–15 days',
    decomposition_ta: 'தோராயமாக 10–15 நாட்கள் விடுங்கள்',
    repeat_en: 'Once per year as rotation crop',
    repeat_ta: 'சுழற்சிப் பயிராக ஆண்டுக்கு ஒரு முறை',
    precautions_en: 'Requires warm temperatures. Not suitable for cold or waterlogged areas.',
    precautions_ta: 'வெப்பமான வெப்பநிலை தேவை. குளிர் அல்லது நீர் தேங்கிய பகுதிகளுக்குப் பொருத்தமானது அல்ல.',
  },
  {
    id: 8,
    name_en: 'Mustard (Brassica)',
    name_ta: 'கடுகு',
    purpose_en: 'Biofumigation & pest suppression',
    purpose_ta: 'உயிர் புகையூட்டல் & பூச்சி ஒடுக்கல்',
    benefit_en: 'Releases natural biofumigant compounds when incorporated. Suppresses soil-borne pathogens and nematodes. Adds organic matter.',
    benefit_ta: 'மண்ணில் கலக்கும்போது இயற்கை உயிர் புகையூட்டல் கலவைகளை வெளியிடுகிறது. மண்ணில் வாழும் நோய்க்கிருமிகள் மற்றும் நூற்புழுக்களை அடக்குகிறது.',
    category_en: 'Pest Suppression',
    category_ta: 'பூச்சி ஒடுக்கல்',
    growing_period_en: 'Approximately 90–120 days (or 45–60 days if used only as green manure)',
    growing_period_ta: 'தோராயமாக 90–120 நாட்கள் (பசுந்தாள் உரமாக மட்டும் பயன்படுத்தினால் 45–60 நாட்கள்)',
    incorporation_en: 'Chop and incorporate at flowering for maximum biofumigation effect',
    incorporation_ta: 'அதிகபட்ச உயிர் புகையூட்டல் விளைவுக்கு பூக்கும் நிலையில் வெட்டி மண்ணில் கலக்குங்கள்',
    decomposition_en: 'Allow approximately 14–21 days',
    decomposition_ta: 'தோராயமாக 14–21 நாட்கள் விடுங்கள்',
    repeat_en: 'Once per year, ideally before planting vulnerable crops',
    repeat_ta: 'ஆண்டுக்கு ஒரு முறை, பாதிக்கப்படக்கூடிய பயிர்களை நடுவதற்கு முன்',
    precautions_en: 'Do not plant cruciferous crops (cabbage, cauliflower) immediately after mustard — same family diseases.',
    precautions_ta: 'கடுகுக்குப் பிறகு உடனடியாக முட்டைக்கோஸ், காலிஃபிளவர் போன்ற பயிர்களை நடாதீர்கள் — ஒரே குடும்ப நோய்கள்.',
  },
  {
    id: 9,
    name_en: 'Sorghum (Jowar)',
    name_ta: 'சோளம்',
    purpose_en: 'Organic matter & deep root soil breaking',
    purpose_ta: 'கரிமப்பொருள் & ஆழமான வேர் மண் உடைப்பு',
    benefit_en: 'Massive root system breaks compacted subsoil. Produces high biomass for organic matter. Drought tolerant.',
    benefit_ta: 'பெரிய வேர் அமைப்பு இறுக்கமான அடிமண்ணை உடைக்கிறது. கரிமப்பொருளுக்கு அதிக உயிர்ப்பொருளை உற்பத்தி செய்கிறது. வறட்சியைத் தாங்கும்.',
    category_en: 'Organic Matter & Structure',
    category_ta: 'கரிமப்பொருள் & அமைப்பு',
    growing_period_en: 'Approximately 90–120 days',
    growing_period_ta: 'தோராயமாக 90–120 நாட்கள்',
    incorporation_en: 'Cut at knee height and incorporate, or harvest grain and plow residue',
    incorporation_ta: 'முழங்கால் உயரத்தில் வெட்டி கலக்குங்கள், அல்லது தானியத்தை அறுவடை செய்து எஞ்சியதை உழவு செய்யுங்கள்',
    decomposition_en: 'Allow approximately 15–20 days (thick stems take longer)',
    decomposition_ta: 'தோராயமாக 15–20 நாட்கள் விடுங்கள் (தடிமனான தண்டுகள் அதிக நேரம் எடுக்கும்)',
    repeat_en: 'Once per year in rotation',
    repeat_ta: 'சுழற்சியில் ஆண்டுக்கு ஒரு முறை',
    precautions_en: 'Sorghum residue can temporarily lock nitrogen during decomposition — plan timing carefully.',
    precautions_ta: 'சோள எஞ்சியவை மக்கும் போது தற்காலிகமாக தழைச்சத்தை பூட்டிவிடலாம் — நேரத்தை கவனமாக திட்டமிடுங்கள்.',
  },
  {
    id: 10,
    name_en: 'Pearl Millet (Kambu / Bajra)',
    name_ta: 'கம்பு',
    purpose_en: 'Biomass & moisture management',
    purpose_ta: 'உயிர்ப்பொருள் & ஈரப்பத மேலாண்மை',
    benefit_en: 'Produces abundant biomass in poor soils. Root channels improve water infiltration. Very drought tolerant.',
    benefit_ta: 'மோசமான மண்ணில் ஏராளமான உயிர்ப்பொருளை உற்பத்தி செய்கிறது. வேர் சால்களும் நீர் ஊடுருவலை மேம்படுத்துகின்றன. மிகவும் வறட்சியைத் தாங்கும்.',
    category_en: 'Moisture Management',
    category_ta: 'ஈரப்பத மேலாண்மை',
    growing_period_en: 'Approximately 70–90 days',
    growing_period_ta: 'தோராயமாக 70–90 நாட்கள்',
    incorporation_en: 'Harvest grain then incorporate stubble and roots',
    incorporation_ta: 'தானியத்தை அறுவடை செய்து பின்னர் அடிப்பகுதி மற்றும் வேர்களை கலக்குங்கள்',
    decomposition_en: 'Allow approximately 12–18 days',
    decomposition_ta: 'தோராயமாக 12–18 நாட்கள் விடுங்கள்',
    repeat_en: 'Once or twice per year in dryland areas',
    repeat_ta: 'வறண்ட நிலப் பகுதிகளில் ஆண்டுக்கு ஒன்று அல்லது இரண்டு முறை',
    precautions_en: 'Not suitable for waterlogged conditions. Avoid monocropping — rotate with legumes.',
    precautions_ta: 'நீர் தேங்கிய நிலைமைகளுக்குப் பொருத்தமானது அல்ல. ஒற்றைப் பயிர் செய்வதைத் தவிர்க்கவும் — பயறு வகைகளுடன் சுழற்சி செய்யுங்கள்.',
  },
  {
    id: 11,
    name_en: 'Maize (Corn)',
    name_ta: 'மக்காச்சோளம்',
    purpose_en: 'High biomass & soil organic carbon',
    purpose_ta: 'அதிக உயிர்ப்பொருள் & மண் கரிமக் கரிமம்',
    benefit_en: 'Produces large amount of residue for mulching. Improves soil organic carbon. Extensive root system reduces erosion.',
    benefit_ta: 'தழைக்கூளத்திற்கு அதிக அளவு எஞ்சிய பொருளை உற்பத்தி செய்கிறது. மண் கரிமக் கரிமத்தை மேம்படுத்துகிறது. விரிவான வேர் அமைப்பு அரிப்பைக் குறைக்கிறது.',
    category_en: 'Organic Matter',
    category_ta: 'கரிமப்பொருள்',
    growing_period_en: 'Approximately 90–120 days',
    growing_period_ta: 'தோராயமாக 90–120 நாட்கள்',
    incorporation_en: 'After harvest, shred stalks and incorporate into topsoil',
    incorporation_ta: 'அறுவடைக்குப் பிறகு, தண்டுகளை நறுக்கி மேல்மண்ணில் கலக்குங்கள்',
    decomposition_en: 'Allow approximately 20–30 days (woody stalks are slow to decompose)',
    decomposition_ta: 'தோராயமாக 20–30 நாட்கள் விடுங்கள் (மரத்தன்மையான தண்டுகள் மெதுவாக மக்கும்)',
    repeat_en: 'Once per year — always follow with a legume crop for nitrogen balance',
    repeat_ta: 'ஆண்டுக்கு ஒரு முறை — தழைச்சத்து சமநிலைக்கு எப்போதும் பயறு வகைப் பயிரை தொடருங்கள்',
    precautions_en: 'Corn residue has high C:N ratio — add nitrogen source or compost to speed decomposition.',
    precautions_ta: 'மக்காச்சோள எஞ்சியவை அதிக C:N விகிதம் கொண்டவை — மக்குவதை விரைவுபடுத்த தழைச்சத்து ஆதாரம் அல்லது மக்கிய உரம் சேர்க்கவும்.',
  },
  {
    id: 12,
    name_en: 'Groundnut (Peanut)',
    name_ta: 'நிலக்கடலை',
    purpose_en: 'Nitrogen fixation & economic return',
    purpose_ta: 'தழைச்சத்து நிலைநிறுத்தல் & பொருளாதார வருமானம்',
    benefit_en: 'Fixes nitrogen through root nodules. Provides valuable edible oil crop. Root residues improve soil biology.',
    benefit_ta: 'வேர் முடிச்சுகள் மூலம் தழைச்சத்தை நிலைநிறுத்துகிறது. மதிப்புமிக்க உண்ணக்கூடிய எண்ணெய் பயிரைத் தருகிறது. வேர் எஞ்சியவை மண் உயிரியலை மேம்படுத்துகின்றன.',
    category_en: 'Nitrogen Fixation',
    category_ta: 'தழைச்சத்து நிலைநிறுத்தல்',
    growing_period_en: 'Approximately 100–130 days',
    growing_period_ta: 'தோராயமாக 100–130 நாட்கள்',
    incorporation_en: 'Harvest pods, incorporate haulms (plant residue) into soil',
    incorporation_ta: 'காய்களை அறுவடை செய்யுங்கள், தாவர எஞ்சியதை மண்ணில் கலக்குங்கள்',
    decomposition_en: 'Allow approximately 10–14 days',
    decomposition_ta: 'தோராயமாக 10–14 நாட்கள் விடுங்கள்',
    repeat_en: 'Once per year in suitable sandy loam soils',
    repeat_ta: 'பொருத்தமான மணல் களிமண்ணில் ஆண்டுக்கு ஒரு முறை',
    precautions_en: 'Requires well-drained sandy loam soil. Susceptible to aflatoxin in stored pods — dry properly.',
    precautions_ta: 'நல்ல வடிகால் கொண்ட மணல் களிமண் தேவை. சேமித்த காய்களில் அஃப்லாடாக்சின் ஏற்படலாம் — நன்றாக உலர்த்துங்கள்.',
  },
  {
    id: 13,
    name_en: 'Sesame (Til / Ellu)',
    name_ta: 'எள்',
    purpose_en: 'Soil conditioning & micronutrient cycling',
    purpose_ta: 'மண் பராமரிப்பு & நுண்ணூட்ட சுழற்சி',
    benefit_en: 'Deep roots access subsoil nutrients and bring them to the surface. Improves soil porosity. Drought tolerant oil crop.',
    benefit_ta: 'ஆழமான வேர்கள் அடிமண் ஊட்டச்சத்துக்களை அணுகி மேற்பரப்புக்குக் கொண்டு வருகின்றன. மண் போரோசிட்டியை மேம்படுத்துகிறது.',
    category_en: 'Nutrient Cycling',
    category_ta: 'ஊட்டச்சத்து சுழற்சி',
    growing_period_en: 'Approximately 80–100 days',
    growing_period_ta: 'தோராயமாக 80–100 நாட்கள்',
    incorporation_en: 'Harvest seeds, then plow plant residue into soil',
    incorporation_ta: 'விதைகளை அறுவடை செய்யுங்கள், பின்னர் தாவர எஞ்சியதை மண்ணில் உழவு செய்யுங்கள்',
    decomposition_en: 'Allow approximately 10–14 days',
    decomposition_ta: 'தோராயமாக 10–14 நாட்கள் விடுங்கள்',
    repeat_en: 'Once per year in rotation with cereals',
    repeat_ta: 'தானிய பயிர்களுடன் சுழற்சியில் ஆண்டுக்கு ஒரு முறை',
    precautions_en: 'Sensitive to waterlogging. Not suitable for heavy clay soils without good drainage.',
    precautions_ta: 'நீர் தேக்கத்திற்கு உணர்திறன் கொண்டது. நல்ல வடிகால் இல்லாத கனமான களிமண்ணுக்குப் பொருத்தமானது அல்ல.',
  },
  {
    id: 14,
    name_en: 'Lab Lab (Field Bean / Avarai)',
    name_ta: 'அவரை',
    purpose_en: 'Nitrogen fixation & weed suppression',
    purpose_ta: 'தழைச்சத்து நிலைநிறுத்தல் & களை ஒடுக்கல்',
    benefit_en: 'Vigorous vine that suppresses weeds through dense canopy. Excellent nitrogen fixer. Edible pods and seeds.',
    benefit_ta: 'அடர்த்தியான மேலாடை மூலம் களைகளை அடக்கும் வீரியமான கொடி. சிறந்த தழைச்சத்து நிலைநிறுத்தி. உண்ணக்கூடிய காய்கள் மற்றும் விதைகள்.',
    category_en: 'Weed Suppression & Nitrogen',
    category_ta: 'களை ஒடுக்கல் & தழைச்சத்து',
    growing_period_en: 'Approximately 90–150 days (varies by variety)',
    growing_period_ta: 'தோராயமாக 90–150 நாட்கள் (ரகத்தைப் பொறுத்து மாறுபடும்)',
    incorporation_en: 'Harvest pods for food, then incorporate vine and leaf residue',
    incorporation_ta: 'உணவுக்காக காய்களை அறுவடை செய்யுங்கள், பின்னர் கொடி மற்றும் இலை எஞ்சியதை கலக்குங்கள்',
    decomposition_en: 'Allow approximately 14–21 days',
    decomposition_ta: 'தோராயமாக 14–21 நாட்கள் விடுங்கள்',
    repeat_en: 'Once per year, often grown as border or intercrop',
    repeat_ta: 'ஆண்டுக்கு ஒரு முறை, பெரும்பாலும் எல்லை அல்லது ஊடுபயிராக வளர்க்கப்படுகிறது',
    precautions_en: 'Can become invasive if not managed. Some varieties contain anti-nutritional factors — cook seeds thoroughly.',
    precautions_ta: 'மேலாண்மை செய்யாவிட்டால் ஆக்கிரமிப்பாக மாறலாம். சில ரகங்களில் ஊட்டச்சத்து எதிர்ப்பு காரணிகள் உள்ளன — விதைகளை நன்கு சமையுங்கள்.',
  },
];

// ============================================================
// SOIL IMPROVEMENT ROUTINE STEPS
// ============================================================

const ROUTINE_STEPS = {
  en: [
    { step: 1, title: 'Assess Your Soil', desc: 'Use the Soil AI Analyzer to identify your soil type. Understand current soil condition, nutrient deficiencies, and moisture level before selecting a green manure crop.' },
    { step: 2, title: 'Select the Suitable Crop', desc: 'Choose a green manure crop based on your soil type, climate, and the specific improvement needed (nitrogen, organic matter, structure, pest suppression). Do not mix all 14 crops together — select based on your actual soil needs.' },
    { step: 3, title: 'Grow for the Recommended Period', desc: 'Sow the selected crop and grow it for the recommended duration. Ensure adequate watering and basic care during growth. Durations listed are approximate — observe actual plant development.' },
    { step: 4, title: 'Incorporate Crop Residue', desc: 'At the recommended stage (usually flowering), plow or incorporate the green manure crop into the soil. Cut or chop tough stalks for faster decomposition.' },
    { step: 5, title: 'Allow Decomposition Period', desc: 'Wait the recommended number of days for the incorporated material to decompose before planting the next main crop. This period is crucial — planting too early may harm seedlings.' },
    { step: 6, title: 'Continue & Reassess', desc: 'Repeat the routine before each main cropping season. Periodically reassess soil condition using the Soil AI Analyzer to track improvement over time. Rotate different green manure crops for balanced soil health.' },
  ],
  ta: [
    { step: 1, title: 'உங்கள் மண்ணை மதிப்பீடு செய்யுங்கள்', desc: 'உங்கள் மண் வகையைக் கண்டறிய மண் AI பகுப்பாய்வியைப் பயன்படுத்தவும். பசுந்தாள் உர பயிரைத் தேர்ந்தெடுப்பதற்கு முன் தற்போதைய மண் நிலை, ஊட்டச்சத்து குறைபாடுகள் மற்றும் ஈரப்பத நிலையைப் புரிந்து கொள்ளுங்கள்.' },
    { step: 2, title: 'பொருத்தமான பயிரைத் தேர்ந்தெடுங்கள்', desc: 'உங்கள் மண் வகை, காலநிலை மற்றும் குறிப்பிட்ட மேம்பாடு தேவையின் அடிப்படையில் பசுந்தாள் உர பயிரைத் தேர்ந்தெடுங்கள். அனைத்து 14 பயிர்களையும் ஒன்றாகக் கலக்காதீர்கள் — உங்கள் உண்மையான மண் தேவைகளின் அடிப்படையில் தேர்ந்தெடுங்கள்.' },
    { step: 3, title: 'பரிந்துரைக்கப்பட்ட காலத்திற்கு வளர்க்கவும்', desc: 'தேர்ந்தெடுக்கப்பட்ட பயிரை விதைத்து பரிந்துரைக்கப்பட்ட கால அளவிற்கு வளர்க்கவும். வளர்ச்சியின் போது போதுமான நீர்ப்பாசனம் மற்றும் அடிப்படை பராமரிப்பை உறுதி செய்யுங்கள். பட்டியலிடப்பட்ட கால அளவுகள் தோராயமானவை.' },
    { step: 4, title: 'பயிர் எஞ்சியதை மண்ணில் கலக்குங்கள்', desc: 'பரிந்துரைக்கப்பட்ட நிலையில் (பொதுவாக பூக்கும் நிலை) பசுந்தாள் உர பயிரை மண்ணில் உழவு செய்யுங்கள் அல்லது கலக்குங்கள். விரைவான மக்குவதற்கு கடினமான தண்டுகளை வெட்டுங்கள்.' },
    { step: 5, title: 'மக்கும் காலத்தை அனுமதிக்கவும்', desc: 'அடுத்த முக்கிய பயிரை நடுவதற்கு முன் கலக்கப்பட்ட பொருள் மக்குவதற்கு பரிந்துரைக்கப்பட்ட நாட்கள் காத்திருக்கவும். இந்த காலம் மிகவும் முக்கியமானது — மிக விரைவாக நடுவது நாற்றுகளுக்கு தீங்கு விளைவிக்கலாம்.' },
    { step: 6, title: 'தொடருங்கள் & மறுமதிப்பீடு செய்யுங்கள்', desc: 'ஒவ்வொரு முக்கிய பயிர் பருவத்திற்கும் முன் நடைமுறையை மீண்டும் செய்யுங்கள். காலப்போக்கில் மேம்பாட்டைக் கண்காணிக்க மண் AI பகுப்பாய்வியைப் பயன்படுத்தி மண் நிலையை அவ்வப்போது மறுமதிப்பீடு செய்யுங்கள்.' },
  ],
};


// ============================================================
// COMPONENT
// ============================================================

export default function ImportantThingsPage() {
  const { lang, setLang } = useLang();

  const crops = CROPS_DATA;
  const routine = ROUTINE_STEPS[lang] || ROUTINE_STEPS.en;

  return (
    <div style={{ minHeight: '100vh', background: '#0d1f0d', padding: '5.5rem 1.5rem 3rem', fontFamily: 'Inter, sans-serif', color: '#e8f5e9' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Top bar with language selector at TOP RIGHT */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '2rem',
              fontWeight: 800,
              color: '#7dd56f',
              margin: 0,
            }}>
              📋 {tr(lang, 'important_page_title')}
            </h1>
            <p style={{ color: '#81c784', marginTop: '.5rem', margin: '0.5rem 0 0 0' }}>
              {tr(lang, 'important_page_subtitle')}
            </p>
          </div>

          {/* Language selector — TOP RIGHT */}
          <div style={{
            display: 'inline-flex',
            gap: '0.3rem',
            background: 'rgba(0,0,0,0.35)',
            padding: '0.3rem',
            borderRadius: '10px',
            border: '1px solid #2d5a27',
            flexShrink: 0,
          }}>
            <button
              type="button"
              onClick={() => setLang('ta')}
              style={{
                background: lang === 'ta' ? '#4caf50' : 'transparent',
                color: lang === 'ta' ? '#fff' : '#a5d6a7',
                border: 'none',
                borderRadius: '8px',
                padding: '0.45rem 1rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              தமிழ்
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              style={{
                background: lang === 'en' ? '#4caf50' : 'transparent',
                color: lang === 'en' ? '#fff' : '#a5d6a7',
                border: 'none',
                borderRadius: '8px',
                padding: '0.45rem 1rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              English
            </button>
          </div>
        </div>

        {/* ──────────── SAFETY DISCLAIMER ──────────── */}
        <div style={{
          background: 'rgba(255,152,0,0.1)',
          border: '1px solid rgba(255,152,0,0.4)',
          borderRadius: 14,
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          fontSize: '0.9rem',
          lineHeight: 1.6,
          color: '#ffe0b2',
        }}>
          <strong>⚠️ {lang === 'ta' ? 'முக்கிய குறிப்பு' : 'Important Note'}:</strong>{' '}
          {lang === 'ta'
            ? 'பயிர் தேர்வு மற்றும் சுழற்சி மண் வகை, மண் நிலை, ஈரப்பதம், ஊட்டச்சத்து குறைபாடு, பயிர் பொருத்தம் மற்றும் உள்ளூர் விவசாய நிலைமைகளைப் பொறுத்தது. அனைத்து 14 தானியங்களையும் ஒன்றாகக் கலப்பது ஒவ்வொரு மண் பிரச்சனையையும் தானாகவே சரிசெய்யாது. உங்கள் மண் AI முடிவுகளின் அடிப்படையில் பொருத்தமான பயிரைத் தேர்ந்தெடுக்கவும்.'
            : 'Crop selection and rotation should depend on soil type, soil condition, moisture, nutrient deficiency, crop suitability, and local farming conditions. Simply mixing all 14 grains together will not automatically fix every soil problem. Select the appropriate crop based on your Soil AI results.'
          }
        </div>

        {/* ──────────── SOIL IMPROVEMENT ROUTINE ──────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #182e18, #1f421f)',
          border: '1.5px solid #2e7d32',
          borderRadius: 20,
          padding: '1.75rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        }}>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            color: '#7dd56f',
            fontSize: '1.4rem',
            fontWeight: 800,
            margin: '0 0 1.25rem',
          }}>
            🌱 {lang === 'ta' ? 'மண் மேம்பாட்டு நடைமுறை' : 'Soil Improvement Routine'}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {routine.map((s) => (
              <div key={s.step} style={{
                background: 'rgba(0,0,0,0.25)',
                borderRadius: 12,
                padding: '1rem 1.25rem',
                border: '1px solid rgba(76,175,80,0.2)',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
              }}>
                <div style={{
                  minWidth: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  flexShrink: 0,
                }}>
                  {s.step}
                </div>
                <div>
                  <div style={{ color: '#7dd56f', fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem' }}>
                    {s.title}
                  </div>
                  <div style={{ color: '#c8e6c9', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {s.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ──────────── 14-CROP SOIL IMPROVEMENT SYSTEM ──────────── */}
        <h2 style={{
          fontFamily: 'Outfit, sans-serif',
          color: '#7dd56f',
          fontSize: '1.4rem',
          fontWeight: 800,
          marginBottom: '1.25rem',
        }}>
          🌾 {lang === 'ta' ? '14 பசுந்தாள் உர பயிர்கள் — மண் மேம்பாட்டு அமைப்பு' : '14 Green Manure Crops — Soil Improvement System'}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
          {crops.map((crop) => (
            <div key={crop.id} style={{
              background: 'rgba(29,52,29,0.85)',
              border: '1px solid #2d5a27',
              borderRadius: 18,
              padding: '1.5rem',
              transition: 'box-shadow 0.2s',
            }}>
              {/* Crop header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ color: '#7dd56f', fontWeight: 800, fontSize: '1.15rem', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
                  {crop.id}. {lang === 'ta' ? crop.name_ta : crop.name_en}
                </h3>
                <span style={{
                  background: 'rgba(76,175,80,0.15)',
                  border: '1px solid #4caf50',
                  color: '#81c784',
                  padding: '0.2rem 0.65rem',
                  borderRadius: 12,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                }}>
                  {lang === 'ta' ? crop.category_ta : crop.category_en}
                </span>
              </div>

              {/* Purpose */}
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ color: '#a5d6a7', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.2rem', textTransform: 'uppercase' }}>
                  {lang === 'ta' ? 'நோக்கம்' : 'Purpose'}
                </div>
                <div style={{ color: '#e8f5e9', fontSize: '0.92rem', fontWeight: 600 }}>
                  {lang === 'ta' ? crop.purpose_ta : crop.purpose_en}
                </div>
              </div>

              {/* Benefit */}
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ color: '#a5d6a7', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.2rem', textTransform: 'uppercase' }}>
                  {lang === 'ta' ? 'மண்ணுக்கு எவ்வாறு உதவுகிறது' : 'How It Helps Soil'}
                </div>
                <div style={{ color: '#c8e6c9', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {lang === 'ta' ? crop.benefit_ta : crop.benefit_en}
                </div>
              </div>

              {/* Schedule grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <InfoBlock
                  label={lang === 'ta' ? '🌱 வளர்ச்சி காலம்' : '🌱 Growing Period'}
                  value={lang === 'ta' ? crop.growing_period_ta : crop.growing_period_en}
                />
                <InfoBlock
                  label={lang === 'ta' ? '🔄 மண்ணில் கலத்தல்' : '🔄 Soil Incorporation'}
                  value={lang === 'ta' ? crop.incorporation_ta : crop.incorporation_en}
                />
                <InfoBlock
                  label={lang === 'ta' ? '⏳ மக்கும் காலம்' : '⏳ Decomposition Period'}
                  value={lang === 'ta' ? crop.decomposition_ta : crop.decomposition_en}
                />
                <InfoBlock
                  label={lang === 'ta' ? '🔁 மீண்டும் எப்போது' : '🔁 When to Repeat'}
                  value={lang === 'ta' ? crop.repeat_ta : crop.repeat_en}
                />
              </div>

              {/* Precautions */}
              <div style={{
                background: 'rgba(244,67,54,0.08)',
                border: '1px solid rgba(244,67,54,0.2)',
                borderRadius: 10,
                padding: '0.75rem 1rem',
              }}>
                <div style={{ color: '#ef9a9a', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                  ⚠️ {lang === 'ta' ? 'முன்னெச்சரிக்கை' : 'Precautions'}
                </div>
                <div style={{ color: '#ffcdd2', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  {lang === 'ta' ? crop.precautions_ta : crop.precautions_en}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ──────────── SOIL AI INTEGRATION NOTE ──────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #1a2e1a, #2e5d2b)',
          border: '1px solid #4caf50',
          borderRadius: 16,
          padding: '1.5rem',
          marginBottom: '2rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔬</div>
          <h3 style={{ color: '#7dd56f', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>
            {lang === 'ta' ? 'மண் AI பகுப்பாய்வியுடன் பயன்படுத்தவும்' : 'Use with Soil AI Analyzer'}
          </h3>
          <p style={{ color: '#c8e6c9', fontSize: '0.92rem', lineHeight: 1.6, maxWidth: 600, margin: '0 auto' }}>
            {lang === 'ta'
              ? 'பகுப்பாய்வி பக்கத்தில் மண் AI ஐப் பயன்படுத்தி உங்கள் மண் வகையைக் கண்டறியுங்கள். அதன் அடிப்படையில் மேலே உள்ள பொருத்தமான பசுந்தாள் உர பயிரைத் தேர்ந்தெடுங்கள். இது AI கணிப்பின் அடிப்படையில் சிறந்த மண் மேம்பாட்டு வழக்கத்தை உறுதி செய்கிறது.'
              : 'Use the Soil AI in the Analyzer page to identify your soil type. Based on the result, select the appropriate green manure crop from the list above. This ensures the best soil improvement routine based on actual AI classification of your soil.'
            }
          </p>
        </div>

      </div>

      {/* Tamil font for proper rendering */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;600;700&display=swap" />
    </div>
  );
}


// ── Helper Component ──

function InfoBlock({ label, value }) {
  return (
    <div style={{
      background: 'rgba(0,0,0,0.2)',
      borderRadius: 10,
      padding: '0.65rem 0.85rem',
      border: '1px solid rgba(76,175,80,0.15)',
    }}>
      <div style={{ color: '#81c784', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.2rem' }}>
        {label}
      </div>
      <div style={{ color: '#e8f5e9', fontSize: '0.88rem', lineHeight: 1.5 }}>
        {value}
      </div>
    </div>
  );
}
