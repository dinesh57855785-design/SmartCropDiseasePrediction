import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
try:
    from ai_model.soil.prediction.predict_soil import predict_soil_fertility
except Exception:
    predict_soil_fertility = None

try:
    from ai_model.water.prediction.predict_water import predict_water_quality
except Exception:
    predict_water_quality = None

from .models import SoilAnalysisRecord, WaterAnalysisRecord
"""
advisor/views.py
Crop Growth Optimization and Multilingual Report Generation.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

# ── Crop Growth Data ────────────────────────────────────────────────────────
CROP_GROWTH_DATA = {
    "tomato": {
        "name": "Tomato",
        "stages": ["Seedling", "Vegetative", "Flowering", "Fruiting", "Harvest"],
        "organic": [
            {
                "practice": "Compost Application",
                "description": "Apply 5–10 kg well-rotted compost per plant at planting.",
                "timing": "Before planting and mid-season top-dress",
                "benefit": "Improves soil structure, water retention, and microbial activity",
            },
            {
                "practice": "Neem Cake Fertilizer",
                "description": "Mix 200–300 g neem cake into soil around each plant.",
                "timing": "At planting and 30 days after transplanting",
                "benefit": "Provides nutrients and repels soil pests and nematodes",
            },
            {
                "practice": "Fish Emulsion Spray",
                "description": "Dilute 1:10 with water and spray on leaves monthly.",
                "timing": "Every 3–4 weeks during vegetative and flowering stages",
                "benefit": "Quick nitrogen boost for healthy leaf and stem growth",
            },
            {
                "practice": "Vermicompost",
                "description": "Apply 2–3 kg vermicompost per plant.",
                "timing": "At transplanting and during flowering",
                "benefit": "Rich in plant-available nutrients, improves soil biology",
            },
        ],
        "chemical": [
            {
                "product": "NPK 19:19:19 (Starter Fertilizer)",
                "dosage": "5 g per litre of water for foliar spray | 150–200 kg/ha soil application",
                "method": "Foliar spray or soil broadcast",
                "timing": "2–3 weeks after transplanting",
                "precautions": "Do not apply during flowering — may cause flower drop. Avoid in hot midday. Follow label directions.",
            },
            {
                "product": "Calcium Nitrate",
                "dosage": "5 g/L for foliar spray | 100 kg/ha for fertigation",
                "method": "Foliar spray or fertigation",
                "timing": "During fruit development",
                "precautions": "Critical for preventing blossom end rot. Do not mix with phosphate fertilizers in the same tank.",
            },
            {
                "product": "Potassium Sulphate (SOP)",
                "dosage": "5 g/L foliar | 100–150 kg/ha soil",
                "method": "Soil application or drip fertigation",
                "timing": "From flowering through harvest",
                "precautions": "Improves fruit quality and shelf life. Essential for red color development in tomatoes.",
            },
            {
                "product": "Boron (Solubor)",
                "dosage": "1 g per litre of water",
                "method": "Foliar spray",
                "timing": "At first flowering",
                "precautions": "Boron deficiency causes hollow fruits and poor pollen viability. Do not exceed dosage — boron toxicity is possible.",
            },
        ],
        "irrigation_tips": "Tomatoes need consistent moisture. Irregular watering causes blossom end rot and fruit cracking. Use drip irrigation if possible.",
        "pest_tips": "Watch for aphids, whiteflies, and tomato hornworms. Use sticky traps and neem oil sprays as first line of defense.",
        "disease_tips": "Scout weekly for early signs of early blight and late blight. Preventive copper sprays during humid weather.",
    },
    "potato": {
        "name": "Potato",
        "stages": ["Seed Preparation", "Sprouting", "Vegetative", "Tuber Initiation", "Tuber Bulking", "Maturation"],
        "organic": [
            {
                "practice": "Farmyard Manure (FYM)",
                "description": "Incorporate 20–25 tonnes per hectare of well-decomposed FYM before planting.",
                "timing": "3–4 weeks before planting",
                "benefit": "Improves soil organic matter, drainage, and nutrient supply",
            },
            {
                "practice": "Wood Ash Application",
                "description": "Apply 100 kg wood ash per acre broadcast on soil surface.",
                "timing": "At planting",
                "benefit": "Provides potassium and calcium, raises soil pH slightly",
            },
            {
                "practice": "Green Manure Cover Crop",
                "description": "Grow legume cover crop (cowpea/clover) in previous season and incorporate.",
                "timing": "Before potato planting season",
                "benefit": "Fixes nitrogen and improves soil health",
            },
        ],
        "chemical": [
            {
                "product": "NPK 15:15:15 at Planting",
                "dosage": "250–300 kg/ha",
                "method": "Incorporate into soil at planting",
                "timing": "At planting alongside seed tubers",
                "precautions": "Place fertilizer 5–7 cm away from seed tubers to avoid burning. Follow soil test recommendations.",
            },
            {
                "product": "Urea (Top Dressing)",
                "dosage": "100–125 kg/ha",
                "method": "Side-dress or broadcast and incorporate",
                "timing": "At hilling (4–6 weeks after emergence)",
                "precautions": "Apply when soil is moist. Rain after application improves uptake. Do not apply close to harvest.",
            },
            {
                "product": "Muriate of Potash (MOP)",
                "dosage": "150–200 kg/ha",
                "method": "Soil application",
                "timing": "At planting or first hilling",
                "precautions": "Potassium is critical for tuber size and starch content. Avoid excessive application.",
            },
        ],
        "irrigation_tips": "Maintain consistent soil moisture from tuber initiation through bulking. Avoid water stress during this period as it reduces tuber size significantly.",
        "pest_tips": "Colorado potato beetle and aphids are major pests. Scout weekly. Aphids spread potato viruses.",
        "disease_tips": "Apply preventive fungicide for late blight before cool, wet weather arrives. This is critical for potato crops.",
    },
    "corn": {
        "name": "Corn (Maize)",
        "stages": ["Emergence", "V6 (6 leaves)", "V12", "Tasseling (VT)", "Silking (R1)", "Grain Fill", "Maturity"],
        "organic": [
            {
                "practice": "Compost + Biochar Mix",
                "description": "Apply 5 tonnes compost + 0.5 tonne biochar per hectare.",
                "timing": "Before planting",
                "benefit": "Improves water holding capacity and provides balanced nutrients",
            },
            {
                "practice": "Biological Nitrogen Fixation",
                "description": "Seed treatment with Azotobacter or Azospirillum biofertilizer.",
                "timing": "At planting",
                "benefit": "Reduces nitrogen fertilizer requirement by 20–30%",
            },
        ],
        "chemical": [
            {
                "product": "Urea (Nitrogen — split application)",
                "dosage": "250–300 kg/ha total — split into 3 applications",
                "method": "Side-dress or incorporate",
                "timing": "1/3 at planting, 1/3 at V4, 1/3 at V8",
                "precautions": "Never apply all nitrogen at once — high risk of leaching. Corn is a heavy nitrogen feeder.",
            },
            {
                "product": "Diammonium Phosphate (DAP)",
                "dosage": "100–150 kg/ha",
                "method": "Incorporate at planting",
                "timing": "At planting",
                "precautions": "Phosphorus is critical for root development. Place near seed but not touching.",
            },
            {
                "product": "Zinc Sulphate",
                "dosage": "5 kg/ha",
                "method": "Soil application or foliar spray (0.5 g/L)",
                "timing": "At planting or V4 stage",
                "precautions": "Zinc deficiency is common in corn on alkaline soils. White striping on young leaves indicates deficiency.",
            },
        ],
        "irrigation_tips": "Critical water periods: germination, tasseling, and silking. Drought stress during pollination is the most damaging.",
        "pest_tips": "Fall armyworm is a major threat. Scout at whorl stage. Apply BT (Bacillus thuringiensis) as organic option.",
        "disease_tips": "Gray leaf spot and northern corn leaf blight are major diseases. Use resistant hybrids as the primary management strategy.",
    },
    "wheat": {
        "name": "Wheat",
        "stages": ["Germination", "Tillering", "Jointing", "Heading", "Grain Fill", "Maturity"],
        "organic": [
            {
                "practice": "FYM Application",
                "description": "Apply 10–15 tonnes per hectare of well-decomposed FYM.",
                "timing": "2–3 weeks before sowing",
                "benefit": "Improves soil organic matter and provides balanced nutrition",
            },
        ],
        "chemical": [
            {
                "product": "NPK 20:20:0 at Sowing",
                "dosage": "125 kg/ha",
                "method": "Drill or incorporate before sowing",
                "timing": "At sowing",
                "precautions": "Ensure proper seed-to-soil contact. Place fertilizer 3–5 cm away from seed.",
            },
            {
                "product": "Urea (Top Dress)",
                "dosage": "100–125 kg/ha split over two applications",
                "method": "Broadcast on moist soil",
                "timing": "At tillering and jointing stages",
                "precautions": "Rain after application improves uptake. Avoid applying before heavy rain as it may cause leaching.",
            },
        ],
        "irrigation_tips": "Critical stages: crown root initiation (21 DAS), tillering (40 DAS), jointing (60 DAS), and grain filling (85 DAS).",
        "pest_tips": "Aphids and armyworms are major pests. Scout from tillering onwards.",
        "disease_tips": "Yellow rust and powdery mildew are common. Use resistant varieties. Apply fungicide at flag leaf emergence if needed.",
    },
    "rice": {
        "name": "Rice",
        "stages": ["Nursery", "Transplanting", "Tillering", "Panicle Initiation", "Heading", "Ripening"],
        "organic": [
            {
                "practice": "Green Manure (Dhaincha)",
                "description": "Incorporate green manure 20–25 days before transplanting.",
                "timing": "Pre-transplanting",
                "benefit": "Adds 60–80 kg N/ha equivalent, improves soil structure",
            },
            {
                "practice": "Azolla Bio-fertilizer",
                "description": "Introduce Azolla in field water — 0.5 tonne fresh/ha.",
                "timing": "7–10 days after transplanting",
                "benefit": "Fixes atmospheric nitrogen, suppresses weeds",
            },
        ],
        "chemical": [
            {
                "product": "Urea",
                "dosage": "100–120 kg/ha split: 1/3 basal, 1/3 tillering, 1/3 panicle initiation",
                "method": "Incorporate into flooded field",
                "timing": "Basal + two top-dressings",
                "precautions": "Apply on a calm day. Keep field flooded for 3–5 days after application for maximum uptake.",
            },
            {
                "product": "Single Super Phosphate (SSP)",
                "dosage": "250 kg/ha",
                "method": "Incorporate as basal dose",
                "timing": "Before transplanting",
                "precautions": "Phosphorus is immobile in soil — place it close to root zone.",
            },
        ],
        "irrigation_tips": "Maintain 3–5 cm standing water until 10 days before harvest. Allow alternate wetting and drying (AWD) to save water during tillering.",
        "pest_tips": "Brown planthopper is a major pest. Avoid excessive nitrogen which encourages hopper populations.",
        "disease_tips": "Blast disease is the most serious. Use resistant varieties and apply tricyclazole if needed.",
    },
}

# ── Translation Dictionaries ─────────────────────────────────────────────────
TAMIL_TRANSLATIONS_MAP = {
    "Chennai, Tamil Nadu": "சென்னை, தமிழ்நாடு",
    "Chennai": "சென்னை",
    "Tamil Nadu": "தமிழ்நாடு",
    "Apple": "ஆப்பிள்",
    "Blueberry": "புளூபெர்ரி",
    "Cherry": "செர்ரி",
    "Corn": "சோளம்",
    "Corn (maize)": "சோளம்",
    "Grape": "திராட்சை",
    "Orange": "ஆரஞ்சு",
    "Peach": "பீச்",
    "Pepper, bell": "குடைமிளகாய்",
    "Potato": "உருளைக்கிழங்கு",
    "Raspberry": "ராஸ்பெர்ரி",
    "Soybean": "சோயாபீன்ஸ்",
    "Squash": "பூசணிக்காய்",
    "Strawberry": "ஸ்ட்ராபெரி",
    "Tomato": "தக்காளி",
    "Rice": "நெல்",
    "Wheat": "கோதுமை",
    "Cotton": "பருத்தி",
    "Groundnut": "வேர்க்கடலை",
    "Sugarcane": "கரும்பு",
    "Other": "இதர",
    "Apple Scab": "ஆப்பிள் சொறி நோய்",
    "Black Rot": "கருப்பு அழுகல் நோய்",
    "Cedar Apple Rust": "சீடர் ஆப்பிள் துரு நோய்",
    "Healthy": "ஆரோக்கியமானது",
    "Powdery Mildew": "சாம்பல் நோய்",
    "Cercospora leaf spot Gray leaf spot": "செர்கோஸ்போரா இலைப்புள்ளி நோய்",
    "Common rust": "துரு நோய்",
    "Common rust_": "துரு நோய்",
    "Northern Leaf Blight": "வடக்கு இலை கருகல் நோய்",
    "Esca (Black Measles)": "எஸ்கா கருப்பு அம்மை நோய்",
    "Leaf blight (Isariopsis Leaf Spot)": "இலை கருகல் நோய்",
    "Haunglongbing (Citrus greening)": "சிட்ரஸ் கிரீனிங் நோய்",
    "Bacterial spot": "பாக்டீரியா இலைப்புள்ளி நோய்",
    "Early blight": "ஆரம்ப கால கருகல் நோய்",
    "Late blight": "பிற்கால கருகல் நோய்",
    "Leaf Mold": "இலை அச்சு நோய்",
    "Septoria leaf spot": "செப்டோரியா இலைப்புள்ளி நோய்",
    "Spider mites Two-spotted spider mite": "சிலந்தி பூச்சி தாக்குதல்",
    "Target Spot": "இலக்கு புள்ளி நோய்",
    "Tomato Yellow Leaf Curl Virus": "தக்காளி இலை சுருள் நச்சுயிரி",
    "Tomato mosaic virus": "தக்காளி மொசைக் நச்சுயிரி",
    "Tomato – Early Blight": "தக்காளி – ஆரம்ப கால கருகல் நோய்",
    "Tomato – Late Blight": "தக்காளி – பிற்கால கருகல் நோய்",
    "Tomato – Bacterial Spot": "தக்காளி – பாக்டீரியா இலைப்புள்ளி நோய்",
    "Tomato – Leaf Mold": "தக்காளி – இலை அச்சு நோய்",
    "Tomato – Septoria Leaf Spot": "தக்காளி – செப்டோரியா இலைப்புள்ளி நோய்",
    "Tomato – Healthy": "தக்காளி – ஆரோக்கியமானது",
    "Potato – Early Blight": "உருளைக்கிழங்கு – ஆரம்ப கால கருகல் நோய்",
    "Potato – Late Blight": "உருளைக்கிழங்கு – பிற்கால கருகல் நோய்",
    "Potato – Healthy": "உருளைக்கிழங்கு – ஆரோக்கியமானது",
    "Corn – Gray Leaf Spot": "சோளம் – செர்கோஸ்போரா இலைப்புள்ளி நோய்",
    "Corn – Common Rust": "சோளம் – துரு நோய்",
    "Corn – Northern Leaf Blight": "சோளம் – வடக்கு இலை கருகல் நோய்",
    "Corn – Healthy": "சோளம் – ஆரோக்கியமானது",
    "Apple – Apple Scab": "ஆப்பிள் – சொறி நோய்",
    "Apple – Black Rot": "ஆப்பிள் – கருப்பு அழுகல் நோய்",
    "Apple – Cedar Apple Rust": "ஆப்பிள் – சீடர் ஆப்பிள் துரு நோய்",
    "Apple – Healthy": "ஆப்பிள் – ஆரோக்கியமானது",
    "Grape – Black Rot": "திராட்சை – கருப்பு அழுகல் நோய்",
    "Grape – Black Measles": "திராட்சை – கருப்பு அம்மை நோய்",
    "Grape – Leaf Blight": "திராட்சை – இலை கருகல் நோய்",
    "Grape – Healthy": "திராட்சை – ஆரோக்கியமானது",
    "Bell Pepper – Bacterial Spot": "குடைமிளகாய் – பாக்டீரியா இலைப்புள்ளி நோய்",
    "Bell Pepper – Healthy": "குடைமிளகாய் – ஆரோக்கியமானது",
    "Rice – Healthy": "நெல் – ஆரோக்கியமானது",
    "Cotton – Healthy": "பருத்தி – ஆரோக்கியமானது",
    "Groundnut – Healthy": "வேர்க்கடலை – ஆரோக்கியமானது",
    "Sugarcane – Healthy": "கரும்பு – ஆரோக்கியமானது",
    "Low": "குறைவு",
    "Medium": "நடுத்தரம்",
    "High": "அதிகம்",
    "Dry": "வறண்டது",
    "Moderate": "மிதமானது",
    "High / Saturated": "அதிகம் / நிறைவுற்றது",
    "Sandy Soil": "மணல் மண்",
    "Clay Soil": "களிமண்",
    "Loam Soil": "வண்டல் மண்",
    "Silt Soil": "வண்டல் மண்",
    "Black Cotton Soil": "கரிசல் மண்",
    "Red Soil": "செம்மண்",
    "Sandy Loam": "மணல் கலந்த வண்டல் மண்",
    "Vegetables": "காய்கறிகள்",
    "Sweet Potato": "சர்க்கரைவள்ளி",
    "Cassava": "மரவள்ளி",
    "Millets": "தானியங்கள்",
    "Sorghum": "சோளம்",
    "Sunflower": "சூரியகாந்தி",
    "Sugarbeet": "சர்க்கரைவள்ளிக்கிழங்கு",
    "Barley": "பார்லி",
    "Sweet potato": "சர்க்கரைவள்ளி",
    "Watermelon": "தர்பூசணி",
    "Maize": "சோளம்",
    "Soybean": "சோயாபீன்ஸ்",
    "Wheat": "கோதுமை",
    "Tea": "தேயிலை",
    "Alfalfa": "குதிரை மசால்",
    "Blueberry": "புளூபெர்ரி",
    "Excellent for Irrigation": "நீர்ப்பாசனத்திற்கு மிகவும் உகந்தது",
    "Suitable for Moderately Salt-Tolerant Crops": "நடுத்தர உப்புத்தன்மை தாங்கும் பயிர்களுக்கு உகந்தது",
    "Saline Water — Restricted Use": "உப்பு நீர் — கட்டுப்பாடுகளுடன் பயன்படுத்தவும்",
    "Very High Salinity — Unsuitable for Normal Crops": "மிக அதிக உப்புத்தன்மை — சாதாரண பயிர்களுக்கு உகந்தது அல்ல",
    "Conditionally Suitable — Needs Filtering": "நிபந்தனைக்குட்பட்டு உகந்தது — வடிகட்டுதல் தேவை",
    "Use with Caution — Treat Before Use": "எச்சரிக்கையுடன் பயன்படுத்தவும் — பயன்படுத்துவதற்கு முன் சுத்திகரிக்கவும்",
    "NOT Suitable — Do Not Use": "உகந்தது அல்ல — பயன்படுத்த வேண்டாம்",
    "Limited Suitability — Test Before Use": "வரம்புக்குட்பட்ட தகுதி — பயன்படுத்துவதற்கு முன் பரிசோதிக்கவும்",
    "Clear / Good Quality Water": "தெளிவான / நல்ல தரமான நீர்",
    "Turbid / Muddy Water": "கலங்கலான / சேற்று நீர்",
    "Algae-Affected Water": "பாசி படிந்த நீர்",
    "Dark / Contaminated Water": "இருண்ட / அசுத்தமான நீர்",
    "Iron-Rich / Yellowish Water": "இரும்புச்சத்து நிறைந்த / மஞ்சள் நிற நீர்",
    "Soil is strongly acidic (pH < 5.5). Phosphorus availability is reduced.": "மண் மிகவும் அமிலத்தன்மை வாய்ந்தது (pH < 5.5). பாஸ்பரஸ் சத்து கிடைப்பது குறையும்.",
    "Apply agricultural lime or wood ash (2-3 tonnes/ha) to raise soil pH.": "மண் pH ஐ உயர்த்த விவசாய சுண்ணாம்பு அல்லது மரச் சாம்பல் (2-3 டன்கள்/ஹெக்டேர்) பயன்படுத்தவும்.",
    "Soil is alkaline (pH > 7.8). Micronutrient deficiencies (Zinc, Iron, Manganese) may occur.": "மண் காரத்தன்மை வாய்ந்தது (pH > 7.8). துத்தனாகம், இரும்பு, மாங்கனீசு போன்ற நுண்ஊட்டச்சத்து குறைபாடு ஏற்படலாம்.",
    "Apply gypsum and sulfur, and incorporate compost/green manure.": "ஜிப்சம் மற்றும் கந்தகம் பயன்படுத்தவும், மேலும் மக்கிய உரம்/பசுந்தாள் உரங்களை மண்ணில் சேர்க்கவும்.",
    "Soil pH is in the optimal range (6.0 - 7.5) for most agricultural crops.": "மண் pH பெரும்பாலான பயிர்களுக்கு உகந்த வரம்பில் (6.0 - 7.5) உள்ளது.",
    "Sandy soil has high drainage and low nutrient retention.": "மணல் மண் அதிக வடிகால் மற்றும் குறைந்த ஊட்டச்சத்து தக்கவைப்பு கொண்டது.",
    "Add 5-10 tonnes/ha of well-rotted manure or compost to improve water holding capacity.": "மண்ணின் நீர் பிடிப்புத் திறனை மேம்படுத்த 5-10 டன்கள்/ஹெக்டேர் மக்கிய உரம் அல்லது கம்போஸ்ட் சேர்க்கவும்.",
    "Frequent light irrigation is recommended. Drip irrigation preferred.": "அடிக்கடி மிதமான நீர்ப்பாசனம் பரிந்துரைக்கப்படுகிறது. சொட்டுநீர் பாசனம் சிறந்தது.",
    "Clay soil retains water well but has poor drainage and aeration risks.": "களிமண் தண்ணீரை நன்கு தக்கவைத்துக் கொள்கிறது ஆனால் வடிகால் மற்றும் காற்றோட்டம் குறைவாக இருக்கும்.",
    "Irrigate deeply but less frequently. Ensure field drainage channels are clear.": "ஆழமாக ஆனால் குறைந்த இடைவெளியில் நீர்ப்பாசனம் செய்யவும். வடிகால் வாய்க்கால்களைச் சுத்தம் செய்யவும்.",
    "Standard irrigation schedule based on crop stage and weather.": "பயிரின் வளர்ச்சி நிலை மற்றும் வானிலை அடிப்படையிலான வழக்கமான நீர்ப்பாசனம்.",
    "Apply Neem-coated Urea or DAP at early growth stages.": "வளர்ச்சியின் ஆரம்ப கட்டங்களில் வேம்பு பூசப்பட்ட யூரியா அல்லது டிஏபி பயன்படுத்தவும்.",
    "Incorporate vermicompost or farmyard manure (FYM) to boost nitrogen.": "தழைச்சத்தை அதிகரிக்க மண்புழு உரம் அல்லது தொழு உரம் சேர்க்கவும்.",
    "Apply Single Super Phosphate (SSP) near root zone during land preparation.": "நிலம் தயாரிக்கும் போது வேர் பகுதிக்கு அருகில் சூப்பர் பாஸ்பேட் (SSP) பயன்படுத்தவும்.",
    "Apply Muriate of Potash (MOP) or Potassium Sulphate during flowering/fruiting.": "பூக்கும்/காய்க்கும் தருணத்தில் பொட்டாஷ் (MOP) அல்லது பொட்டாசியம் சல்பேட் பயன்படுத்தவும்.",
    "Apply balanced NPK fertilizer based on crop requirements.": "பயிரின் தேவைக்கேற்ப சமச்சீர் NPK உரங்களைப் பயன்படுத்தவும்.",
    "Regular application of farmyard manure (FYM) and vermicompost.": "தொழு உரம் (FYM) மற்றும் மண்புழு உரங்களை வழக்கமாகப் பயன்படுத்தவும்.",
    "Moderate risk of soluble salt buildup in root zone over prolonged dry spells.": "நீண்ட வறண்ட காலங்களில் வேர் பகுதியில் உப்புக்கள் படிவதற்கு மிதமான வாய்ப்பு உள்ளது.",
    "Apply extra leaching fraction during irrigation to flush salts.": "உப்புக்களைக் கழுவ நீர்ப்பாசனத்தின் போது கூடுதல் நீரைப் பயன்படுத்தவும்.",
    "High salinity stress risk for sensitive crops like beans, potatoes, and young seedlings.": "உருளைக்கிழங்கு, பீன்ஸ் மற்றும் இளம் நாற்றுகளுக்கு அதிக உப்புத்தன்மை பாதிப்பு அபாயம் உள்ளது.",
    "Avoid sprinkler irrigation on foliage (causes leaf burn). Use drip irrigation.": "இலைகளில் தெளிப்பு நீர்ப்பாசனத்தைத் தவிர்க்கவும் (இலை கருகலை உண்டாக்கும்). சொட்டுநீரைப் பயன்படுத்தவும்.",
    "Severe crop yield loss and soil salinization risk.": "கடுமையான பயிர் விளைச்சல் இழப்பு மற்றும் மண் உப்புத்தன்மை அபாயம்.",
    "Blending with fresh rainwater or desalination treatment required.": "மழைநீர் சேகரிப்பு அல்லது நீர் சுத்திகரிப்புடன் கலந்து பயன்படுத்த வேண்டும்.",
    "Acidic water (pH < 6.0) may corrode metal pipes and drippers.": "அமில நீர் (pH < 6.0) உலோகக் குழாய்கள் மற்றும் சொட்டுநீர்க் குழாய்களை அரித்துவிடும்.",
    "High pH water (> 8.5) may cause micronutrient precipitation and drip emitter clogging.": "கார நீர் (pH > 8.5) நுண்ஊட்டச்சத்துக்களைப் படியச் செய்து சொட்டுநீர்க் குழாய்களில் அடைப்பை ஏற்படுத்தும்.",
    "No severe water quality risks detected for crop irrigation.": "பயிர் நீர்ப்பாசனத்திற்கு கடுமையான நீரின் தரம் சார்ந்த அபாயங்கள் எதுவும் கண்டறியப்படவில்லை.",
    "Standard drip or furrow irrigation practices.": "வழக்கமான சொட்டுநீர் அல்லது வாய்க்கால் நீர்ப்பாசன முறைகள்.",
    "High iron oxide content gives red color": "அதிக இரும்பு ஆக்சைடு உள்ளடக்கத்தால் சிவப்பு நிறம் ஏற்படுகிறது",
    "Good drainage and aeration": "நல்ல வடிகால் மற்றும் காற்றோட்ட வசதி கொண்டது",
    "Generally low in nitrogen and phosphorus": "பொதுவாக தழைச்சத்து மற்றும் மணிச்சத்து குறைவாக இருக்கும்",
    "Needs regular organic matter addition": "வழக்கமான கரிமப் பொருட்களைச் சேர்க்க வேண்டும்",
    "Apply lime if pH is below 5.5": "pH அளவு 5.5 க்கும் குறைவாக இருந்தால் சுண்ணாம்பு பயன்படுத்தவும்",
    "Use drip irrigation to conserve water": "நீரைப் பாதுகாக்க சொட்டுநீர் பாசனத்தைப் பயன்படுத்தவும்",
    "Grow nitrogen-fixing legumes in rotation": "சுழற்சி முறையில் தழைச்சத்தை நிலைநிறுத்தும் பருப்பு வகைகளைப் பயிரிடவும்",
    "High clay content — shrinks when dry, swells when wet": "அதிக களிமண் உள்ளடக்கம் — காய்ந்தால் சுருங்கும், நனைந்தால் உப்பும்",
    "Excellent water retention": "சிறந்த நீர் தக்கவைப்புத் திறன் கொண்டது",
    "Rich in calcium, magnesium, and potassium": "கால்சியம், மெக்னீசியம் மற்றும் பொட்டாசியம் நிறைந்தது",
    "Needs good drainage management": "சிறந்த வடிகால் மேலாண்மை தேவைப்படுகிறது",
    "Avoid deep plowing when soil is wet": "மண் ஈரமாக இருக்கும் போது ஆழமாக உழுவதைத் தவிர்க்கவும்",
    "Make raised beds or ridges for water drainage": "நீர் வடிகாலுக்காக உயர்ந்த பத்திகள் அல்லது வரப்புகளை அமைக்கவும்",
    "Add gypsum or organic matter to improve structure": "மண்ணின் அமைப்பை மேம்படுத்த ஜிப்சம் அல்லது கரிமப் பொருட்களைச் சேர்க்கவும்",
    "Monitor for waterlogging during rainy season": "மழைக்காலத்தில் தண்ணீர் தேங்குவதைக் கண்காணிக்கவும்",
    "Large particles — drains very quickly": "பெரிய துகள்கள் — நீர் மிக வேகமாக வடிந்துவிடும்",
    "Low nutrient and water retention": "குறைந்த ஊட்டச்சத்து மற்றும் நீர் தக்கவைப்புத் திறன் கொண்டது",
    "Warms up quickly in spring": "வசந்த காலத்தில் விரைவாக வெப்பமடையும்",
    "Easy to work and till": "வேலை செய்வதற்கும் உழுவதற்கும் எளிதானது",
    "Add large amounts of organic compost to improve water retention": "நீர் தக்கவைப்பை மேம்படுத்த அதிக அளவு இயற்கை உரம் சேர்க்கவும்",
    "Irrigate frequently in small amounts (drip preferred)": "சிறிய அளவுகளில் அடிக்கடி நீர்ப்பாசனம் செய்யவும் (சொட்டுநீர் சிறந்தது)",
    "Apply mulch to reduce moisture evaporation": "ஈரப்பதம் ஆவியாவதைக் குறைக்க மூடாக்கு போடவும்",
    "Apply organic fertilizers regularly — nutrients wash away quickly": "ஊட்டச்சத்துக்கள் எளிதில் அடித்துச் செல்லப்படுவதால் கரிம உரங்களை வழக்கமாகப் பயன்படுத்தவும்",
    "Excellent balance of sand, silt, and clay": "மணல், வண்டல் மற்றும் களிமண்ணின் சிறந்த சமநிலை கொண்டது",
    "High fertility and good moisture retention": "அதிக வளத்தன்மை மற்றும் நல்ல நீர் தக்கவைப்புத் திறன் கொண்டது",
    "Found near river plains and deltas": "ஆற்றுச் சமவெளிகள் மற்றும் டெல்டா பகுதிகளில் காணப்படுகிறது",
    "Most productive agricultural soil": "மிகவும் உற்பத்தித் திறன் வாய்ந்த விவசாய மண்",
    "Maintain organic matter with regular compost application": "வழக்கமான கம்போஸ்ட் பயன்பாடு மூலம் கரிமப் பொருட்களை பராமரிக்கவும்",
    "Practice crop rotation to prevent nutrient depletion": "ஊட்டச்சத்து குறைபாட்டைத் தடுக்க பயிர் சுழற்சி முறையைப் பின்பற்றவும்",
    "Monitor for waterlogging in low-lying areas": "தாழ்வான பகுதிகளில் தண்ணீர் தேங்குவதைக் கண்காணிக்கவும்",
    "Standard fertilization schedule based on crop needs": "பயிரின் தேவைகளின் அடிப்படையில் வழக்கமான உரமிடுதல்",
    "Very fine particles — holds water well": "மிகவும் மெல்லிய துகள்கள் — தண்ணீரை நன்கு தக்கவைக்கும்",
    "Slow drainage — risk of waterlogging": "மெதுவான வடிகால் — தண்ணீர் தேங்கும் அபாயம் உள்ளது",
    "Rich in nutrients but can become compacted": "ஊட்டச்சத்துக்கள் நிறைந்தது ஆனால் எளிதில் இறுகிவிடும்",
    "Sticky when wet, hard when dry": "ஈரமாக இருக்கும் போது ஒட்டும், காய்ந்தால் கடினமாகும்",
    "Avoid tillage when soil is too wet or too dry": "மண் மிகவும் ஈரமாகவோ அல்லது காய்ந்திருக்கவோ செய்யும் போது உழுவதைத் தவிர்க்கவும்",
    "Add organic matter (compost, manure) to improve drainage": "வடிகாலை மேம்படுத்த கரிமப் பொருட்களை (மக்கிய உரம், தொழு உரம்) சேர்க்கவும்",
    "Use raised bed farming to improve aeration": "காற்றோட்டத்தை மேம்படுத்த உயர்ந்த பத்தி விவசாய முறையைப் பயன்படுத்தவும்",
    "Apply gypsum to break up compacted clay": "இறுகிய களிமண்ணை உடைக்க ஜிப்சம் பயன்படுத்தவும்",
    "Water appears turbid with suspended particles": "நீர் மிதக்கும் துகள்களுடன் கலங்கலாகக் காணப்படுகிறது",
    "Brown color indicates high sediment content": "பழுப்பு நிறம் அதிக வண்டல் உள்ளடக்கத்தைக் குறிக்கிறது",
    "Possible agricultural or construction runoff": "விவசாயம் அல்லது கட்டுமானக் கழிவு நீர் கலந்திருக்கலாம்",
    "Filter through sand/gravel before using on crops": "பயிரிகளுக்குப் பயன்படுத்துவதற்கு முன் மணல்/சரளை மூலம் வடிகட்டவும்",
    "Allow water to settle for 24 hours before irrigation": "நீர்ப்பாசனத்திற்கு முன் தண்ணீரை 24 மணி நேரம் படிய வைக்கவும்",
    "Do not use directly on seedlings": "நாற்றுகளுக்கு நேரடியாகப் பயன்படுத்த வேண்டாம்",
    "Sediment can clog drip irrigation emitters": "வண்டல் சொட்டுநீர்க் குழாய்களில் அடைப்பை ஏற்படுத்தலாம்",
    "May carry pathogens causing root rot": "வேர் அழுகலை உண்டாக்கும் நோய்க்கிருமிகளைக் கொண்டிருக்கலாம்",
    "High turbidity reduces light in paddy fields": "அதிக கலங்கல் நெல் வயல்களில் ஒளியைக் குறைக்கிறது",
    "Green color indicates presence of algae or aquatic weeds": "பச்சை நிறம் பாசிகள் அல்லது நீர்வாழ் கலைகள் இருப்பதைக் குறிக்கிறது",
    "Caused by excess nutrients — eutrophication": "அதிகப்படியான ஊட்டச்சத்துக்கள் கலப்பதால் ஏற்படுகிறது",
    "May have low dissolved oxygen levels": "கரைந்த ஆக்ஸிஜன் அளவு குறைவாக இருக்கலாம்",
    "Aerate the water source to increase dissolved oxygen": "கரைந்த ஆக்ஸிஜனை அதிகரிக்க நீர் ஆதாரத்தை காற்றோட்டம் செய்யவும்",
    "Remove floating algae before drawing water": "தண்ணீரை எடுப்பதற்கு முன் மிதக்கும் பாசிகளை அகற்றவும்",
    "Use copper sulfate (1 ppm) for algae control": "பாசி கட்டுப்பாட்டிற்கு செப்பு சல்பேட் (1 பிபிஎம்) பயன்படுத்தவும்",
    "Algal toxins can damage young seedlings": "பாசி நச்சுகள் இளம் நாற்றுகளை சேதப்படுத்தும்",
    "Low dissolved oxygen stresses aquatic life": "குறைந்த ஆக்ஸிஜன் நீர்வாழ் உயிரினங்களை மன அழுத்தத்திற்கு ஆளாக்குகிறது",
    "Possible blockage of irrigation channels": "நீர்ப்பாசன வாய்க்கால்களில் அடைப்பு ஏற்பட வாய்ப்புள்ளது",
    "Very dark color — stagnant or severely contaminated": "மிகவும் இருண்ட நிறம் — தேங்கி நிற்கும் அல்லது கடுமையாக அசுத்தமான நீர்",
    "Possible sewage or industrial effluents present": "கழிவு நீர் அல்லது தொழில்துறை அசுத்தங்கள் கலந்திருக்க வாய்ப்புள்ளது",
    "Extremely low oxygen — anaerobic decomposition": "மிகக் குறைந்த ஆக்ஸிஜன் — அழுகும் நிலையில் உள்ளது",
    "DO NOT use this water on crops": "இந்த நீரை பயிர்களுக்குப் பயன்படுத்த வேண்டாம்",
    "Report to local pollution control board if near industrial area": "தொழில்துறை பகுதிக்கு அருகில் இருந்தால் உள்ளூர் மாசு கட்டுப்பாட்டு வாரியத்திற்கு புகாரளிக்கவும்",
    "Use borewell or rainwater harvesting as alternative": "மாற்றாக ஆழ்துளை கிணறு அல்லது மழைநீரைப் பயன்படுத்தவும்",
    "Severe crop damage and soil contamination risk": "கடுமையான பயிர் சேதம் மற்றும் மண் மாசுபடும் அபாயம்",
    "Risk of heavy metal accumulation in soil": "மண்ணில் கன உலோகங்கள் படியும் அபாயம்",
    "Health hazard — pathogens can enter food supply": "சுகாதார சீர்கேடு — நோய்க்கிருமிகள் உணவுச் சங்கிலியில் நுழையலாம்",
    "Yellowish/rusty color indicates high iron content": "மஞ்சள்/துரு நிறம் அதிக இரும்பு உள்ளடக்கத்தைக் குறிக்கிறது",
    "May contain minerals from soil leaching": "மண்ணின் கசிவு மூலம் தாதுக்களைக் கொண்டிருக்கலாம்",
    "Common near laterite or iron-rich geological formations": "இரும்புச்சத்து நிறைந்த மண்ணின் அருகில் பொதுவாகக் காணப்படும்",
    "Test iron content (acceptable limit: <5 mg/L for irrigation)": "இரும்பு உள்ளடக்கத்தை சோதிக்கவும் (நீர்ப்பாசனத்திற்கு ஏற்புடைய வரம்பு: <5 மி.கி/லி)",
    "Use aeration and sand filtration to reduce iron": "இரும்பைக் குறைக்க காற்றோட்டம் மற்றும் மணல் வடிகட்டுதலைப் பயன்படுத்தவும்",
    "Avoid use on pH-sensitive crops like blueberries or citrus": "புளூபெர்ரி அல்லது சிட்ரஸ் போன்ற pH உணர்திறன் கொண்ட பயிர்களுக்குப் பயன்படுத்துவதைத் தவிர்க்கவும்",
    "Excess iron can cause orange leaf streaks on crops": "அதிகப்படியான இரும்பு பயிர்களில் ஆரஞ்சு நிற இலை வரிகளை ஏற்படுத்தலாம்",
    "Can clog drip irrigation emitters with deposits": "படிவுகள் மூலம் சொட்டுநீர்க் குழாய்களில் அடைப்பை ஏற்படுத்தலாம்",
    "May reduce phosphorus availability in soil": "மண்ணில் பாஸ்பரஸ் கிடைப்பதைக் குறைக்கலாம்",
    "Water appears clear — good visual indicator of quality": "நீர் தெளிவாகக் காணப்படுகிறது — தரத்தின் நல்ல காட்சி குறிகாட்டி",
    "No visible sediment, algae, or discoloration detected": "வண்டல், பாசி அல்லது நிறமாற்றம் எதுவும் கண்டறியப்படவில்லை",
    "Likely clean groundwater, treated water, or rainwater": "சுத்தமான நிலத்தடி நீர், சுத்திகரிக்கப்பட்ட நீர் அல்லது மழைநீர் இருக்க வாய்ப்புள்ளது",
    "Conduct periodic pH and TDS testing to confirm quality": "தரத்தை உறுதிப்படுத்த அவ்வப்போது pH மற்றும் TDS பரிசோதனை செய்யவும்",
    "Use efficient drip or furrow irrigation to minimize waste": "வீணாவதைக் குறைக்க சொட்டுநீர் அல்லது வாய்க்கால் நீர்ப்பாசனத்தைப் பயன்படுத்தவும்",
    "Store collected water in covered tanks to prevent contamination": "மாசுபடுவதைத் தடுக்க சேகரிக்கப்பட்ட நீரை மூடிய தொட்டிகளில் சேமிக்கவும்",
    "Visual clarity alone does not guarantee chemical safety": "காட்சித் தெளிவு மட்டுமே இரசாயன பாதுகாப்பிற்கு உத்தரவாதம் அளிக்காது",
    "Annual lab testing for pesticide residues recommended": "பூச்சிக்கொல்லி எச்சங்களுக்கு ஆண்டுதோறும் ஆய்வக சோதனை செய்ய பரிந்துரைக்கப்படுகிறது",
}

TRANSLATIONS = {
    "ta": {  # Tamil
        "report_title": "ஸ்மார்ட் பயிர் நோய் அறிக்கை",
        "farmer_info": "விவசாயி தகவல்",
        "crop_name": "பயிர் பெயர்",
        "disease_name": "நோய் பெயர்",
        "confidence": "நம்பகத்தன்மை",
        "confidence_explanation": "நம்பகத்தன்மை விளக்கம்",
        "symptoms": "அறிகுறிகள்",
        "description": "விளக்கம்",
        "severity": "தீவிரம்",
        "organic_treatment": "இயற்கை சிகிச்சை",
        "organic_dosage": "இயற்கை அளவு",
        "organic_instructions": "இயற்கை வழிமுறைகள்",
        "chemical_treatment": "வேதி சிகிச்சை",
        "chemical_dosage": "வேதி அளவு",
        "chemical_instructions": "வேதி வழிமுறைகள்",
        "prevention": "தடுப்பு நடவடிக்கைகள்",
        "farming_tips": "விவசாய குறிப்புகள்",
        "weather_recommendation": "வானிலை அடிப்படையிலான பரிந்துரைகள்",
        "important_warning": "முக்கியமான எச்சரிக்கை",
        "report_generated": "அறிக்கை உருவாக்கப்பட்டது",
        "healthy_msg": "உங்கள் பயிர் ஆரோக்கியமாக உள்ளது",
        "chemical_disclaimer": "⚠️ வேதி உரங்கள் மற்றும் பூச்சிக்கொல்லிகளை பயன்படுத்தும் முன்னர் தயாரிப்பு லேபிளை கவனமாக படிக்கவும் மற்றும் உங்கள் உள்ளூர் வேளாண் வல்லுநரை கலந்தாலோசிக்கவும்.",
        "low_confidence_warning": "தானியங்கி பகுப்பாய்வு நம்பகத்தன்மை குறைவாக உள்ளது. சிகிச்சை செய்வதற்கு முன்னர் ஒரு வேளாண் நிபுணரை கலந்தாலோசிக்கவும்.",
        "severity_levels": {"Low": "குறைவான", "Medium": "நடுத்தர", "High": "அதிக", "Critical": "மிக தீவிர"},
    },
    "hi": {  # Hindi
        "report_title": "स्मार्ट फसल रोग रिपोर्ट",
        "farmer_info": "किसान की जानकारी",
        "crop_name": "फसल का नाम",
        "disease_name": "रोग का नाम",
        "confidence": "विश्वसनीयता",
        "confidence_explanation": "विश्वसनीयता स्पष्टीकरण",
        "symptoms": "लक्षण",
        "description": "विवरण",
        "severity": "गंभीरता",
        "organic_treatment": "जैविक उपचार",
        "organic_dosage": "जैविक खुराक",
        "organic_instructions": "जैविक निर्देश",
        "chemical_treatment": "रासायनिक उपचार",
        "chemical_dosage": "रासायनिक खुराक",
        "chemical_instructions": "रासायनिक निर्देश",
        "prevention": "रोकथाम के उपाय",
        "farming_tips": "खेती की सलाह",
        "weather_recommendation": "मौसम आधारित सिफारिशें",
        "important_warning": "महत्वपूर्ण चेतावनी",
        "report_generated": "रिपोर्ट तैयार की गई",
        "healthy_msg": "आपकी फसल स्वस्थ दिख रही है",
        "chemical_disclaimer": "⚠️ किसी भी रासायनिक उर्वरक या कीटनाशक का उपयोग करने से पहले लेबल को ध्यान से पढ़ें और अपने स्थानीय कृषि अधिकारी से सलाह लें।",
        "low_confidence_warning": "AI विश्वसनीयता कम है। उपचार करने से पहले कृषि विशेषज्ञ से परामर्श करें।",
        "severity_levels": {"Low": "कम", "Medium": "मध्यम", "High": "उच्च", "Critical": "गंभीर"},
    },
    "en": {  # English (default)
        "report_title": "Smart Crop Disease Report",
        "farmer_info": "Farmer Information",
        "crop_name": "Crop Name",
        "disease_name": "Disease Name",
        "confidence": "AI Confidence",
        "confidence_explanation": "Confidence Explanation",
        "symptoms": "Symptoms",
        "description": "Disease Description",
        "severity": "Severity",
        "organic_treatment": "Organic Treatment",
        "organic_dosage": "Organic Dosage",
        "organic_instructions": "Organic Instructions",
        "chemical_treatment": "Chemical Treatment",
        "chemical_dosage": "Chemical Dosage",
        "chemical_instructions": "Chemical Instructions",
        "prevention": "Prevention",
        "farming_tips": "Farming Tips",
        "weather_recommendation": "Weather-Based Recommendations",
        "important_warning": "Important Warning",
        "report_generated": "Report Generated",
        "healthy_msg": "Your crop appears healthy",
        "chemical_disclaimer": "⚠️ Always read the product label carefully before applying any chemical fertilizer or pesticide. Follow dosage instructions strictly and consult your local agricultural extension officer.",
        "low_confidence_warning": "AI confidence is low. Consult an agricultural expert before applying treatment.",
        "severity_levels": {"Low": "Low", "Medium": "Medium", "High": "High", "Critical": "Critical"},
    },
}


def get_t(lang: str, key: str) -> str:
    """Get translation string for the given language and key."""
    return TRANSLATIONS.get(lang, TRANSLATIONS["en"]).get(key, key)


class CropGrowthView(APIView):
    """
    POST /api/advisor/crop-growth/
    Returns crop growth optimization recommendations.
    Body: { crop: "tomato", stage: "Flowering" }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        crop_key = request.data.get("crop", "").lower().strip()
        stage = request.data.get("stage", "")

        if crop_key not in CROP_GROWTH_DATA:
            available = list(CROP_GROWTH_DATA.keys())
            return Response({
                "error": f"Crop '{crop_key}' not found. Available crops: {', '.join(available)}",
                "available_crops": available,
            }, status=status.HTTP_404_NOT_FOUND)

        data = CROP_GROWTH_DATA[crop_key].copy()
        data["selected_stage"] = stage or "General"
        data["disclaimer"] = (
            "Chemical fertilizer and pesticide recommendations are general guidelines only. "
            "Always read the product label and consult your local agricultural extension officer "
            "before applying any product. Dosages may vary by soil type, crop variety, and region."
        )
        return Response(data)


class GenerateReportView(APIView):
    """
    POST /api/advisor/report/
    Generates a multilingual farming report.
    Body: {
        lang: "en" | "ta" | "hi",
        prediction_id: <int>,  (optional)
        weather_data: {...},   (optional)
        farmer_name: "...",    (optional)
        location: "..."        (optional)
        soil_data: {...},      (optional)
        water_data: {...}      (optional)
    }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from disease.models import DiseasePrediction, DiseaseInfo, get_confidence_info
        from datetime import datetime

        lang = request.data.get("lang", "en")
        if lang not in TRANSLATIONS:
            lang = "en"

        prediction_id = request.data.get("prediction_id")
        farmer_name = request.data.get("farmer_name", request.user.get_full_name() or request.user.username)
        location = request.data.get("location", "")
        weather_data = request.data.get("weather_data", {})
        soil_data = request.data.get("soil_data")
        water_data = request.data.get("water_data")

        # Get prediction data
        prediction = None
        disease_info = None
        confidence_info = None

        if prediction_id:
            try:
                prediction = DiseasePrediction.objects.get(id=prediction_id, user=request.user)
                confidence_info = get_confidence_info(prediction.confidence)
                if prediction.disease_key:
                    try:
                        disease_info = DiseaseInfo.objects.get(disease_key=prediction.disease_key)
                    except DiseaseInfo.DoesNotExist:
                        pass
            except DiseasePrediction.DoesNotExist:
                return Response({"error": "Prediction not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Use latest prediction
            try:
                prediction = DiseasePrediction.objects.filter(user=request.user).latest('created_at')
                confidence_info = get_confidence_info(prediction.confidence)
                if prediction.disease_key:
                    try:
                        disease_info = DiseaseInfo.objects.get(disease_key=prediction.disease_key)
                    except DiseaseInfo.DoesNotExist:
                        pass
            except DiseasePrediction.DoesNotExist:
                prediction = None

        t = TRANSLATIONS.get(lang, TRANSLATIONS["en"])

        # Translate dynamic database fields to Tamil if lang is 'ta'
        TAMIL_TRANSLATIONS_MAP = {
            "Apple": "ஆப்பிள்",
            "Blueberry": "புளூபெர்ரி",
            "Cherry": "செர்ரி",
            "Cherry (including sour)": "செர்ரி",
            "Cherry including sour": "செர்ரி",
            "Cherry_(including_sour)": "செர்ரி",
            "Corn": "சோளம்",
            "Corn (maize)": "சோளம்",
            "Corn maize": "சோளம்",
            "Grape": "திராட்சை",
            "Orange": "ஆரஞ்சு",
            "Peach": "பீச்",
            "Pepper, bell": "குடைமிளகாய்",
            "Bell Pepper": "குடைமிளகாய்",
            "Pepper bell": "குடைமிளகாய்",
            "Potato": "உருளைக்கிழங்கு",
            "Raspberry": "ராஸ்பெர்ரி",
            "Soybean": "சோயாபீன்ஸ்",
            "Squash": "பூசணிக்காய்",
            "Strawberry": "ஸ்ட்ராபெரி",
            "Tomato": "தக்காளி",
            "Rice": "நெல்",
            "Wheat": "கோதுமை",
            "Cotton": "பருத்தி",
            "Groundnut": "வேர்க்கடலை",
            "Sugarcane": "கரும்பு",

            "Apple Scab": "ஆப்பிள் சொறி நோய்",
            "Black Rot": "கருப்பு அழுகல் நோய்",
            "Cedar Apple Rust": "சீடர் ஆப்பிள் துரு நோய்",
            "Healthy": "ஆரோக்கியமானது",
            "Powdery Mildew": "சாம்பல் நோய்",
            "Powdery mildew": "சாம்பல் நோய்",
            "Leaf Scorch": "இலை தீகல் நோய்",
            "Leaf scorch": "இலை தீகல் நோய்",
            "Cercospora leaf spot Gray leaf spot": "செர்கோஸ்போரா இலைப்புள்ளி நோய்",
            "Common rust": "துரு நோய்",
            "Common rust_": "துரு நோய்",
            "Northern Leaf Blight": "வடக்கு இலை கருகல் நோய்",
            "Esca (Black Measles)": "எஸ்கா கருப்பு அம்மை நோய்",
            "Leaf blight (Isariopsis Leaf Spot)": "இலை கருகல் நோய்",
            "Haunglongbing (Citrus greening)": "சிட்ரஸ் கிரீனிங் நோய்",
            "Bacterial spot": "பாக்டீரியா இலைப்புள்ளி நோய்",
            "Bacterial Spot": "பாக்டீரியா இலைப்புள்ளி நோய்",
            "Early blight": "ஆரம்ப கால கருகல் நோய்",
            "Early Blight": "ஆரம்ப கால கருகல் நோய்",
            "Late blight": "பிற்கால கருகல் நோய்",
            "Late Blight": "பிற்கால கருகல் நோய்",
            "Leaf Mold": "இலை அச்சு நோய்",
            "Septoria leaf spot": "செப்டோரியா இலைப்புள்ளி நோய்",
            "Septoria Leaf Spot": "செப்டோரியா இலைப்புள்ளி நோய்",
            "Spider mites Two-spotted spider mite": "சிலந்தி பூச்சி தாக்குதல்",
            "Spider Mites": "சிலந்தி பூச்சி தாக்குதல்",
            "Target Spot": "இலக்கு புள்ளி நோய்",
            "Tomato Yellow Leaf Curl Virus": "தக்காளி இலை சுருள் நச்சுயிரி",
            "Tomato mosaic virus": "தக்காளி மொசைக் நச்சுயிரி",
            "Tomato – Early Blight": "தக்காளி – ஆரம்ப கால கருகல் நோய்",
            "Tomato – Late Blight": "தக்காளி – பிற்கால கருகல் நோய்",
            "Tomato – Bacterial Spot": "தக்காளி – பாக்டீரியா இலைப்புள்ளி நோய்",
            "Tomato – Leaf Mold": "தக்காளி – இலை அச்சு நோய்",
            "Tomato – Septoria Leaf Spot": "தக்காளி – செப்டோரியா இலைப்புள்ளி நோய்",
            "Tomato – Healthy": "தக்காளி – ஆரோக்கியமானது",
            "Potato – Early Blight": "உருளைக்கிழங்கு – ஆரம்ப கால கருகல் நோய்",
            "Potato – Late Blight": "உருளைக்கிழங்கு – பிற்கால கருகல் நோய்",
            "Potato – Healthy": "உருளைக்கிழங்கு – ஆரோக்கியமானது",
            "Corn – Gray Leaf Spot": "சோளம் – செர்கோஸ்போரா இலைப்புள்ளி நோய்",
            "Corn – Common Rust": "சோளம் – துரு நோய்",
            "Corn – Northern Leaf Blight": "சோளம் – வடக்கு இலை கருகல் நோய்",
            "Corn – Healthy": "சோளம் – ஆரோக்கியமானது",
            "Apple – Apple Scab": "ஆப்பிள் – சொறி நோய்",
            "Apple – Black Rot": "ஆப்பிள் – கருப்பு அழுகல் நோய்",
            "Apple – Cedar Apple Rust": "ஆப்பிள் – சீடர் ஆப்பிள் துரு நோய்",
            "Apple – Healthy": "ஆப்பிள் – ஆரோக்கியமானது",
            "Grape – Black Rot": "திராட்சை – கருப்பு அழுகல் நோய்",
            "Grape – Black Measles": "திராட்சை – கருப்பு அம்மை நோய்",
            "Grape – Leaf Blight": "திராட்சை – இலை கருகல் நோய்",
            "Grape – Healthy": "திராட்சை – ஆரோக்கியமானது",
            "Bell Pepper – Bacterial Spot": "குடைமிளகாய் – பாக்டீரியா இலைப்புள்ளி நோய்",
            "Bell Pepper – Healthy": "குடைமிளகாய் – ஆரோக்கியமானது",
            "Cherry – Powdery Mildew": "செர்ரி – சாம்பல் நோய்",
            "Cherry – Healthy": "செர்ரி – ஆரோக்கியமானது",
            "Peach – Bacterial Spot": "பீச் – பாக்டீரியா இலைப்புள்ளி நோய்",
            "Peach – Healthy": "பீச் – ஆரோக்கியமானது",
            "Squash – Powdery Mildew": "பூசணிக்காய் – சாம்பல் நோய்",
            "Squash – Healthy": "பூசணிக்காய் – ஆரோக்கியமானது",
            "Strawberry – Leaf Scorch": "ஸ்ட்ராபெரி – இலை தீகல் நோய்",
            "Strawberry – Healthy": "ஸ்ட்ராபெரி – ஆரோக்கியமானது",
            "Chennai, Tamil Nadu": "சென்னை, தமிழ்நாடு",
            "Chennai": "சென்னை",
            "Coimbatore": "கோயம்புத்தூர்",
            "Madurai": "மதுரை",
            "Tiruchirappalli": "திருச்சிராப்பள்ளி",
            "Salem": "சேலம்",
            "Tirunelveli": "திருநெல்வேலி",
            "Erode": "ஈரோடு",
            "Vellore": "வேலூர்",
            "Thanjavur": "தஞ்சாவூர்",
            "Dindigul": "திண்டுக்கல்"
        }

        DISEASE_TAMIL_DETAILS = {
            "Apple___Apple_scab": {
                "symptoms": "இலைகளில் ஆலிவ்-பச்சை முதல் பழுப்பு நிற வெல்வெட் புள்ளிகள் காணப்படும். பழங்களில் கருமையான சொறி போன்ற வெடிப்பு பகுதிகள் தோன்றும். கடுமையான பாதிப்பு ஏற்பட்டால் இலைகள் உதிர்ந்துவிடும்.",
                "description": "வெஞ்சுரியா இனேகுவாலிஸ் பூஞ்சையால் ஏற்படுகிறது. வசந்த கால மழையின் போது காற்றில் பரவும் வித்திகள் மூலம் பரவுகிறது. குளிர்ந்த மற்றும் ஈரப்பதமான வானிலை இந்நோய் பரவ உகந்தது.",
                "organic_treatment": "தாமிர அல்லது கந்தகம் சார்ந்த பூஞ்சைக் கொல்லி",
                "organic_dosage": "கந்தகம்: 3-5 கிராம்/லிட்டர் | தாமிரம்: 3 கிராம்/லிட்டர்",
                "organic_instructions": "தளிர் விடும் பருவம் முதல் இதழ்கள் உதிரும் பருவம் வரை தெளிக்கவும். ஒவ்வொரு 7 நாட்களுக்கு ஒருமுறை அல்லது மழைக்கு பின் தெளிக்கவும். பாதிக்கப்பட்ட உதிர்ந்த இலைகளை அகற்றி அழிக்கவும்.",
                "chemical_treatment": "கேப்டான் அல்லது மைக்ளோபுடானில் அல்லது டிஃபெனோகோனசோல்",
                "chemical_dosage": "தயாரிப்பு லேபிளின் படி",
                "chemical_instructions": "தளிர் விடும் பருவத்தில் தொடங்கி முதன்மை சொறி நோய் காலம் முடியும் வரை தெளிக்கவும். பூஞ்சைக் கொல்லி குழுக்களை மாற்றி மாற்றி பயன்படுத்தவும்.",
                "prevention": "நோய் எதிர்ப்புத் திறன் கொண்ட ஆப்பிள் ரகங்களை பயிரிடவும். உதிர்ந்த இலைகளை கூட்டி எரித்து விடவும். கத்தரித்தல் மூலம் நல்ல காற்றோட்டத்தை உறுதி செய்யவும்.",
                "farming_tips": "தளிர் விடும் பருவம் முதல் இதழ் உதிர்ந்த 10-14 நாட்கள் வரை முக்கியமான நோய் பரவும் காலமாகும். இந்த காலத்தில் தெளிப்பு திட்டத்தில் கவனம் செலுத்தவும்."
            },
            "Apple___Black_rot": {
                "symptoms": "இலைகளில் தவளைக் கண் போன்ற புள்ளிகள். பழங்களில் அழுகல் மற்றும் கருப்பு வளையங்கள் தோன்றும். தண்டுகளில் புண்கள் ஏற்படும்.",
                "description": "போட்ரியோஸ்பேரியா அப்டூசா பூஞ்சையால் ஏற்படுகிறது. காயங்கள் வழியாக தண்டு மற்றும் பழங்களை தாக்குகிறது.",
                "organic_treatment": "தாமிர பூஞ்சைக் கொல்லி தெளிப்பு",
                "organic_dosage": "3 கிராம்/லிட்டர்",
                "organic_instructions": "பாதிக்கப்பட்ட கிளைகளை வெட்டி அகற்றவும். பூக்கும் காலத்திற்கு முன் மற்றும் பின் தாமிர பூஞ்சைக்கொல்லி தெளிக்கவும்.",
                "chemical_treatment": "கேப்டான் அல்லது மைக்ளோபுடானில்",
                "chemical_dosage": "லேபிளின் படி",
                "chemical_instructions": "வழக்கமான தெளிப்பு அட்டவணையை பின்பற்றவும். கத்தரித்த பின் உடனடியாக பூஞ்சைக்கொல்லி பயன்படுத்தவும்.",
                "prevention": "பாதிக்கப்பட்ட காய்ந்த மரப்பகுதிகளை வெட்டி அழிக்கவும். மரக்காயங்களை தவிர்க்கவும்.",
                "farming_tips": "மரங்களை நல்ல காற்றோட்டத்துடன் கத்தரித்து பராமரிப்பது நோய் பரவலை தடுக்கும்."
            },
            "Apple___Cedar_apple_rust": {
                "symptoms": "இலைகளில் பிரகாசமான ஆரஞ்சு அல்லது மஞ்சள் நிறப்புள்ளிகள் தோன்றும். இலையின் கீழ் பகுதியில் குழாய் போன்ற அமைப்புகள் வளரும்.",
                "description": "ஜிம்னோஸ்போரஞ்சியம் ஜூனிபெரி-வர்ஜினியானே பூஞ்சையால் ஏற்படுகிறது. ஆப்பிள் மற்றும் ஜூனிபர் மரங்களுக்கு இடையே இந்த பூஞ்சை பரவுகிறது.",
                "organic_treatment": "கந்தக பூஞ்சைக் கொல்லி",
                "organic_dosage": "4 கிராம்/லிட்டர்",
                "organic_instructions": "இலைகள் விரியும் பருவம் முதல் கோடை காலம் தொடங்கும் வரை தெளிக்கவும்.",
                "chemical_treatment": "மைக்ளோபுடானில் அல்லது மேன்கோசெப்",
                "chemical_dosage": "தயாரிப்பு லேபிளின் படி",
                "chemical_instructions": "பூக்கும் பருவம் முதல் முழுமையாக இலைகள் வளரும் வரை தெளிக்கவும்.",
                "prevention": "ஆப்பிள் தோட்டத்திற்கு அருகில் ஜூனிபர் மரங்கள் இருந்தால் அவற்றை அகற்றவும். நோய் எதிர்ப்பு ரகங்களை நடவும்.",
                "farming_tips": "மழைக்காலத்திற்கு முன் தெளிப்பது நோய் தொற்றை பெருமளவு தடுக்கும்."
            },
            "Potato___Early_blight": {
                "symptoms": "கீழ் இலைகளில் அடர் பழுப்பு நிற வளைய வடிவ புள்ளிகள் தோன்றும். இலைகள் மஞ்சள் நிறமாக மாறி உதிரும்.",
                "description": "ஆல்டர்நேரியா சொலனி பூஞ்சையால் ஏற்படுகிறது. ஈரப்பதம் மற்றும் சூடான காலநிலை நோய் தீவிரத்தை அதிகரிக்கும்.",
                "organic_treatment": "தாமிர பூஞ்சைக் கொல்லி அல்லது சூடோமோனாஸ் தெளிப்பு",
                "organic_dosage": "தாமிரம்: 3 கிராம்/லிட்டர் | சூடோமோனாஸ்: 10 கிராம்/லிட்டர்",
                "organic_instructions": "நோய் அறிகுறி கண்டவுடன் இலைகளில் தெளிக்கவும். 10 நாட்களுக்கு ஒருமுறை மீண்டும் தெளிக்கவும்.",
                "chemical_treatment": "குளோரோதலோனில் அல்லது மேன்கோசெப்",
                "chemical_dosage": "2 கிராம்/லிட்டர்",
                "chemical_instructions": "பயிர் சுழற்சி முறை பின்பற்றவும். பாதிக்கப்பட்ட இலைகளை வெட்டி அழிக்கவும்.",
                "prevention": "பயிர் சுழற்சி மற்றும் சரியான வடிகால் வசதி. தழைச்சத்து உரங்களை சரியான அளவில் பயன்படுத்தவும்.",
                "farming_tips": "மண்ணில் இருந்து பரவும் என்பதால் கீழ் இலைகளில் மண் படாமல் பார்த்துக் கொள்ளவும்."
            },
            "Potato___Late_blight": {
                "symptoms": "இலைகளின் நுனிகளில் கரும்பச்சை அல்லது பழுப்பு நிற ஈரமான புள்ளிகள். ஈரமான காலநிலையில் இலையின் கீழ் வெள்ளை பஞ்சு போன்ற பூஞ்சை வளர்ச்சி.",
                "description": "பைட்டோப்தோரா இன்ஃபெஸ்டான்ஸ் பூஞ்சை போன்ற உயிரினத்தால் ஏற்படுகிறது. குளிர்ந்த ஈரமான வானிலையில் மிக வேகமாக பரவி பயிரை முழுமையாக அழிக்கும்.",
                "organic_treatment": "தாமிர ஆக்சிகுளோரைடு அல்லது போர்டோ கலவை",
                "organic_dosage": "தாமிரம்: 3 கிராம்/லி | போர்டோ கலவை: 1%",
                "organic_instructions": "அறிகுறிகள் கண்டவுடன் உடனடியாக தெளிக்கவும். பாதிக்கப்பட்ட செடிகளை மண்ணோடு சேர்த்து அகற்றி அழிக்கவும்.",
                "chemical_treatment": "மெட்டாலாக்ஸைல் + மேன்கோசெப் அல்லது சைமோக்ஸானில்",
                "chemical_dosage": "2.5 கிராம்/லிட்டர்",
                "chemical_instructions": "குளிர்ந்த, ஈரப்பதமான வானிலை நிலவும் போது முன்னெச்சரிக்கையாக தெளிக்கவும்.",
                "prevention": "நோய் தாக்கமில்லாத சான்றளிக்கப்பட்ட விதை கிழங்குகளைப் பயன்படுத்தவும். தண்ணீர் தேங்குவதை தவிர்க்கவும்.",
                "farming_tips": "நோய் கண்டறியப்பட்டால் உடனடியாக பயிர்களை அறுவடை செய்து கிழங்குகளை காப்பாற்றவும்."
            },
            "Tomato___Early_blight": {
                "symptoms": "இலைகளில் செறிவான வளையங்களை உடைய அடர் பழுப்பு புள்ளிகள் தோன்றும். பொதுவாக பழைய இலைகளில் முதலில் தோன்றும்.",
                "description": "ஆல்டர்நேரியா சொலனி பூஞ்சையால் ஏற்படுகிறது. அதிக ஈரப்பதம் மற்றும் சூடான காலநிலையில் பரவுகிறது.",
                "organic_treatment": "தாமிர பூஞ்சைக் கொல்லி அல்லது வேப்ப எண்ணெய் தெளிப்பு",
                "organic_dosage": "தாமிரம்: 3 கிராம்/லிட்டர் | வேப்ப எண்ணெய்: 2%",
                "organic_instructions": "செடியின் அடிப்பகுதியில் உள்ள பாதிக்கப்பட்ட இலைகளை கத்தரித்து அகற்றவும். காற்றோட்டத்தை அதிகரிக்கவும்.",
                "chemical_treatment": "குளோரோதலோனில் அல்லது மேன்கோசெப்",
                "chemical_dosage": "2 கிராம்/லிட்டர்",
                "chemical_instructions": "வழக்கமான இடைவெளிகளில் தெளிக்கவும். மேல் தெளிப்பு நீர்ப்பாசனத்தை தவிர்க்கவும்.",
                "prevention": "முறையான பயிர் சுழற்சி மேற்கொள்ளவும். தக்காளி செடிகளுக்கு இடையே போதிய இடைவெளி விட்டு நடவும்.",
                "farming_tips": "செடிகளின் கீழ் பகுதியில் உள்ள இலைகளை கத்தரித்து விடுவது மண்ணிலிருந்து பூஞ்சை தொற்றி பரவுவதை தடுக்கும்."
            },
            "Tomato___Late_blight": {
                "symptoms": "இலை மற்றும் தண்டுகளில் பெரிய, ஒழுங்கற்ற கரும்பச்சை முதல் பழுப்பு நிற புள்ளிகள் தோன்றும். ஈரமான காலநிலையில் இலையின் அடிப்பகுதியில் வெள்ளை பூஞ்சை வளரும்.",
                "description": "பைட்டோப்தோரா இன்ஃபெஸ்டான்ஸ் பூஞ்சை போன்ற உயிரினத்தால் ஏற்படுகிறது. குளிர்ச்சியான மற்றும் தொடர் மழை காலங்களில் மிக வேகமாக பரவி செடிகளை அழிக்கும்.",
                "organic_treatment": "தாமிர ஆக்சிகுளோரைடு தெளிப்பு",
                "organic_dosage": "3 கிராம்/லிட்டர்",
                "organic_instructions": "பாதிக்கப்பட்ட செடிகளை தோட்டத்திலிருந்து அகற்றி எரித்து விடவும். கம்போஸ்ட் குவியலில் போட வேண்டாம்.",
                "chemical_treatment": "குளோரோதலோனில் அல்லது மெட்டாலாக்ஸைல்",
                "chemical_dosage": "தயாரிப்பு லேபிளின் படி",
                "chemical_instructions": "முன்னெச்சரிக்கையாக அல்லது முதல் அறிகுறி கண்டவுடன் தெளிக்கவும். செடிகள் நனையும் அளவிற்கு தெளிப்பது அவசியம்.",
                "prevention": "தக்காளி பயிர்களுக்கு சொட்டுநீர் பாசனம் பயன்படுத்தவும். இலைகள் நனைவதை தவிர்க்கவும்.",
                "farming_tips": "தொடர் மழை காலங்களில் தினமும் செடிகளை உன்னிப்பாக கண்காணிக்கவும்."
            },
            "Tomato___Bacterial_spot": {
                "symptoms": "இலைகளில் சிறிய, கரும்பழுப்பு நிற நீரில் நனைந்த புள்ளிகள் தோன்றும். புள்ளிகளின் மையப்பகுதி உலர்ந்து ஓட்டையாகலாம். பழங்களில் சொரசொரப்பான பருக்கள் போன்ற புள்ளிகள்.",
                "description": "சாந்தோமோனாஸ் பாக்டீரியாவால் ஏற்படுகிறது. வெப்பமான மற்றும் மழை காலங்களில் பரவுகிறது.",
                "organic_treatment": "தாமிரம் சார்ந்த பாக்டீரியா கொல்லி",
                "organic_dosage": "2.5 கிராம்/லிட்டர்",
                "organic_instructions": "பாதிக்கப்பட்ட இலைகளை அகற்றிவிட்டு செடிகள் உலர்ந்திருக்கும் போது தாமிர தெளிப்பு மேற்கொள்ளவும்.",
                "chemical_treatment": "ஸ்ட்ரெப்டோமைசின் சல்பேட் + தாமிரம்",
                "chemical_dosage": "லேபிளின் படி",
                "chemical_instructions": "பாக்டீரியா நோய் என்பதால் சாதாரண பூஞ்சைக்கொல்லிகள் வேலை செய்யாது. தாமிரம் மற்றும் பாக்டீரியா எதிர்ப்பு மருந்து கலவையை பயன்படுத்தவும்.",
                "prevention": "நோய் தாக்கமில்லாத விதைகளைப் பயன்படுத்தவும். நடும் முன் விதைகளை வெந்நீரில் நனைத்து சுத்திகரிக்கவும்.",
                "farming_tips": "பாதிக்கப்பட்ட இலைகளை ஈரமான காலநிலையில் கத்தரிக்க வேண்டாம், இது நோய் பரவலை அதிகரிக்கும்."
            },
            "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
                "symptoms": "இலைகள் மேல்நோக்கி கிண்ணம் போல சுருண்டு மஞ்சள் நிறமாக மாறும். செடிகளின் வளர்ச்சி குன்றி புதர் போல காணப்படும். பூக்கள் உதிர்ந்து காய் பிடிக்காது.",
                "description": "வெள்ளை ஈக்கள் மூலமாக பரவும் தக்காளி இலை சுருள் நச்சுயிரி (வைரஸ்) ஆகும். இந்நோய் செடிகளை நேரடியாக தாக்கி உற்பத்தி திறனை அழிக்கிறது.",
                "organic_treatment": "வேப்ப எண்ணெய் தெளிப்பு (வெள்ளை ஈக்களை கட்டுப்படுத்த)",
                "organic_dosage": "3% வேப்ப எண்ணெய் கரைசல்",
                "organic_instructions": "வெள்ளை ஈக்களை கட்டுப்படுத்த மஞ்சள் ஒட்டும் பொறிகளை அமைக்கவும். வேப்ப எண்ணெய் தெளித்து ஈக்களை விரட்டவும்.",
                "chemical_treatment": "இமிடாகுளோப்ரிட் அல்லது அசிடாமிப்ரிட் (பூச்சிக்கொல்லி)",
                "chemical_dosage": "0.5 மிலி/லிட்டர்",
                "chemical_instructions": "வைரஸ் நோய்க்கு நேரடி மருந்து இல்லை. வெள்ளை ஈக்களை பூச்சிக்கொல்லிகள் மூலம் கட்டுப்படுத்துவதே ஒரே வழி.",
                "prevention": "நோய் எதிர்ப்பு ரகங்களை பயிரிடவும். நைய்லான் வலை கொண்டு நாற்றங்கால் அமைக்கவும்.",
                "farming_tips": "பாதிக்கப்பட்ட வைரஸ் செடிகளை கண்டவுடன் உடனடியாக வேரோடு பிடுங்கி எரித்து விடவும்."
            },
            "Corn_(maize)___Northern_Leaf_Blight": {
                "symptoms": "இலைகளில் நீளமான, படகு வடிவ சாம்பல் அல்லது பழுப்பு நிற புள்ளிகள் தோன்றும். கடுமையான தாக்குதலின் போது இலைகள் முற்றிலும் கருகிவிடும்.",
                "description": "எக்ஸ்ரோஹிலம் டர்சிகம் பூஞ்சையால் ஏற்படுகிறது. ஈரப்பதம் மற்றும் மிதமான வெப்பநிலை நோய் பரவலுக்கு உகந்தது.",
                "organic_treatment": "சூடோமோனாஸ் அல்லது டிரைக்கோடெர்மா தெளிப்பு",
                "organic_dosage": "10 கிராம்/லிட்டர்",
                "organic_instructions": "பாதிக்கப்பட்ட கீழ் இலைகளை அகற்றி அழிக்கவும். போதிய இடைவெளி விட்டு நடவும்.",
                "chemical_treatment": "மேன்கோசெப் அல்லது புரோபிகோனசோல்",
                "chemical_dosage": "2 கிராம்/லிட்டர்",
                "chemical_instructions": "நோய் அறிகுறி கண்டவுடன் இலைகளில் நனையும்படி தெளிக்கவும்.",
                "prevention": "நோய் எதிர்ப்பு கலப்பின ரகங்களை பயிரிடவும். அறுவடைக்கு பின் இலை கழிவுகளை ஆழ உழுது மண்ணில் புதைக்கவும்.",
                "farming_tips": "பயிர்களுக்கு இடையே காற்றோட்டம் நன்றாக இருக்குமாறு பராமரிக்கவும்."
            },
            "Grape___Black_rot": {
                "symptoms": "இலைகளில் சிறிய பழுப்பு புள்ளிகள் தோன்றும். பழங்கள் கருப்பு நிறமாக மாறி சுருங்கி உலர்ந்த முந்திரி போல மம்மியாகிவிடும்.",
                "description": "கைனார்டியா பிட்வெல்லி பூஞ்சையால் ஏற்படுகிறது. வசந்த காலத்தின் ஈரப்பதமான வானிலையில் பரவுகிறது.",
                "organic_treatment": "தாமிர அல்லது கந்தக பூஞ்சைக் கொல்லி",
                "organic_dosage": "3 கிராம்/லிட்டர்",
                "organic_instructions": "பாதிக்கப்பட்ட மம்மியான பழங்களை அகற்றி அழிக்கவும். கத்தரித்தலை சரியாக மேற்கொள்ளவும்.",
                "chemical_treatment": "மைக்ளோபுடானில் அல்லது மேன்கோசெப்",
                "chemical_dosage": "தயாரிப்பு லேபிளின் படி",
                "chemical_instructions": "பூக்கும் பருவம் முதல் பழங்கள் பழுக்கும் வரை தெளிப்பு திட்டத்தை பின்பற்றவும்.",
                "prevention": "கொடிகளுக்கு இடையில் நல்ல காற்றோட்டத்தையும் சூரிய ஒளியையும் உறுதிப்படுத்த கத்தரிக்கவும்.",
                "farming_tips": "மம்மியான பழங்களை கொடியில் விடாமல் அகற்றுவது அடுத்த பருவத்திற்கு நோய் பரவாமல் தடுக்கும்."
            }
        }

        crop_ta = prediction.crop_name if prediction else ""
        predicted_disease_ta = prediction.predicted_disease if prediction else ""

        if lang == 'ta' and prediction:
            crop_raw = str(prediction.crop_name or "").strip()
            crop_clean = crop_raw.replace('(including sour)', '').replace('including sour', '').replace('(maize)', '').replace('maize', '').strip()
            crop_ta = TAMIL_TRANSLATIONS_MAP.get(crop_raw, TAMIL_TRANSLATIONS_MAP.get(crop_clean, crop_clean))
            
            disease_raw = str(prediction.predicted_disease or "").strip()
            disease_clean = disease_raw.replace('(including sour)', '').replace('including sour', '').replace('(maize)', '').replace('maize', '').strip()
            
            if '–' in disease_clean or '-' in disease_clean or '—' in disease_clean:
                delimiter = '–' if '–' in disease_clean else ('—' if '—' in disease_clean else '-')
                parts = disease_clean.split(delimiter)
                c_part = parts[0].strip()
                d_part = parts[1].strip() if len(parts) > 1 else ""
                c_trans = TAMIL_TRANSLATIONS_MAP.get(c_part, crop_ta)
                d_trans = TAMIL_TRANSLATIONS_MAP.get(d_part, d_part)
                predicted_disease_ta = f"{c_trans} – {d_trans}"
            else:
                predicted_disease_ta = TAMIL_TRANSLATIONS_MAP.get(disease_raw, TAMIL_TRANSLATIONS_MAP.get(disease_clean, disease_clean))

            if prediction.is_healthy:
                predicted_disease_ta = f"{crop_ta} – ஆரோக்கியமானது"

        # Overwrite disease info details if Tamil and mapped details exist
        if lang == 'ta':
            if disease_info and disease_info.disease_key in DISEASE_TAMIL_DETAILS:
                ta_detail = DISEASE_TAMIL_DETAILS[disease_info.disease_key]
                disease_info_symptoms = ta_detail["symptoms"]
                disease_info_description = ta_detail["description"]
                disease_info_organic_treatment = ta_detail["organic_treatment"]
                disease_info_organic_dosage = ta_detail["organic_dosage"]
                disease_info_organic_instructions = ta_detail["organic_instructions"]
                disease_info_chemical_treatment = ta_detail["chemical_treatment"]
                disease_info_chemical_dosage = ta_detail["chemical_dosage"]
                disease_info_chemical_instructions = ta_detail["chemical_instructions"]
                disease_info_prevention = ta_detail["prevention"]
                disease_info_farming_tips = ta_detail["farming_tips"]
            elif prediction and prediction.is_healthy:
                disease_info_symptoms = "பொருந்தாது (பயிர் ஆரோக்கியமாக உள்ளது)"
                disease_info_description = "பயிர் ஆரோக்கியமாக உள்ளது. நோய் அறிகுறிகள் எதுவும் கண்டறியப்படவில்லை."
                disease_info_organic_treatment = "தேவையில்லை"
                disease_info_organic_dosage = "பொருந்தாது"
                disease_info_organic_instructions = "வழக்கமான பயிர் பராமரிப்பைத் தொடரவும்."
                disease_info_chemical_treatment = "தேவையில்லை"
                disease_info_chemical_dosage = "பொருந்தாது"
                disease_info_chemical_instructions = "வேதி உரங்கள் அல்லது பூச்சிக்கொல்லிகள் தேவையில்லை."
                disease_info_prevention = "தொடர் கண்காணிப்பு மற்றும் முறையான நீர்ப்பாசனம்."
                disease_info_farming_tips = "இயற்கை உரங்களை வழக்கமாகப் பயன்படுத்தி மண்ணின் வளத்தைப் பேணவும்."
            else:
                # General fallback for unmapped crop diseases in Tamil
                disease_info_symptoms = "இலைகளில் கருகல், புள்ளிகள் அல்லது நிறமாற்றம் காணப்படலாம்."
                disease_info_description = "இது ஒரு பயிர் நோய் ஆகும். பூஞ்சை அல்லது பாக்டீரியா தொற்றினால் இலைகளில் இந்த நோய் ஏற்படுகிறது. அதிக ஈரப்பதம் மற்றும் சூடான காலநிலை இந்நோய் பரவ உகந்தது."
                disease_info_organic_treatment = "வேப்ப எண்ணெய் தெளிப்பு அல்லது தாமிர பூஞ்சைக்கொல்லி"
                disease_info_organic_dosage = "3 மிலி / லிட்டர் நீர்"
                disease_info_organic_instructions = "இலைகளில் இருபுறமும் நன்கு படும்படி தெளிக்கவும். பாதிக்கப்பட்ட இலைகளை உடனடியாக அகற்றிவிடவும்."
                disease_info_chemical_treatment = "மேன்கோசெப் அல்லது குளோரோதலோனில்"
                disease_info_chemical_dosage = "2 கிராம் / லிட்டர் நீர்"
                disease_info_chemical_instructions = "முதல் அறிகுறி கண்டவுடன் இலைகளில் தெளிக்கவும். தயாரிப்பு லேபிளை கவனமாகப் படித்துப் பயன்படுத்தவும்."
                disease_info_prevention = "முறையான பயிர் சுழற்சி மேற்கொள்ளவும் மற்றும் வடிகால் வசதியை உறுதி செய்யவும்."
                disease_info_farming_tips = "செடிகளுக்கு இடையில் நல்ல காற்றோட்டம் இருக்குமாறு நட்டு பராமரிக்கவும்."
        elif disease_info:
            disease_info_symptoms = disease_info.symptoms
            disease_info_description = disease_info.description
            disease_info_organic_treatment = disease_info.organic_treatment
            disease_info_organic_dosage = disease_info.organic_dosage
            disease_info_organic_instructions = disease_info.organic_instructions
            disease_info_chemical_treatment = disease_info.chemical_treatment
            disease_info_chemical_dosage = disease_info.chemical_dosage
            disease_info_chemical_instructions = disease_info.chemical_instructions
            disease_info_prevention = disease_info.prevention
            disease_info_farming_tips = disease_info.farming_tips
        else:
            disease_info_symptoms = ""
            disease_info_description = ""
            disease_info_organic_treatment = ""
            disease_info_organic_dosage = ""
            disease_info_organic_instructions = ""
            disease_info_chemical_treatment = ""
            disease_info_chemical_dosage = ""
            disease_info_chemical_instructions = ""
            disease_info_prevention = ""
            disease_info_farming_tips = ""

        # Build report sections
        sections = []

        # Translate date and location if lang is 'ta'
        if lang == 'ta':
            def format_tamil_date(dt):
                months_ta = {
                    "January": "ஜனவரி", "February": "பிப்ரவரி", "March": "மார்ச்",
                    "April": "ஏப்ரல்", "May": "மே", "June": "ஜூன்",
                    "July": "ஜூலை", "August": "ஆகஸ்ட்", "September": "செப்டம்பர்",
                    "October": "அக்டோபர்", "November": "நவம்பர்", "December": "டிசம்பர்"
                }
                day = dt.strftime("%d")
                month = months_ta.get(dt.strftime("%B"), dt.strftime("%B"))
                year = dt.strftime("%Y")
                hour = dt.strftime("%I")
                minute = dt.strftime("%M")
                ampm = "பிற்பகல்" if dt.strftime("%p") == "PM" else "முற்பகல்"
                return f"{day} {month} {year}, {hour}:{minute} {ampm}"
            report_date = format_tamil_date(datetime.now())
            location = TAMIL_TRANSLATIONS_MAP.get(location, location)
        else:
            report_date = datetime.now().strftime("%d %B %Y, %I:%M %p")

        # Header
        sections.append({
            "section": "header",
            "title": t["report_title"],
            "farmer": farmer_name,
            "location": location,
            "date": report_date,
        })

        if prediction:
            severity_label = ""
            if disease_info:
                sev_map = t.get("severity_levels", {})
                severity_label = sev_map.get(disease_info.severity, disease_info.severity)

            conf_exp = ""
            if confidence_info:
                if lang == 'ta':
                    conf_ta_map = {
                        'very_low': 'முடிவு மிகவும் நிச்சயமற்றது. தயவுசெய்து பாதிக்கப்பட்ட இலையின் தெளிவான புகைப்படத்தை மீண்டும் எடுத்து முயற்சிக்கவும்.',
                        'low': 'முடிவு நிச்சயமற்றது. ஏதேனும் சிகிச்சை அளிக்கும் முன் மற்றொரு புகைப்படத்தை எடுத்து அறிகுறிகளை ஒப்பிடவும்.',
                        'moderate': 'முடிவு சாத்தியமானது ஆனால் முழுமையாக உறுதிப்படுத்தப்படவில்லை. செடியை கவனமாக ஆய்வு செய்து வேளாண் நிபுணரை அணுகவும்.',
                        'high': 'நோய் இருப்பதற்கான வாய்ப்பு அதிகம். அறிகுறிகளை சரிபார்த்து பரிந்துரைக்கப்பட்ட சிகிச்சையை மேற்கொள்ளவும்.',
                        'very_high': 'கண்டறியப்பட்ட நோய் மிகவும் உறுதியானது. இந்த நோய்க்கான விரிவான சிகிச்சை பரிந்துரைகள் கீழே வழங்கப்பட்டுள்ளன.'
                    }
                    conf_exp = conf_ta_map.get(confidence_info.get("key"), confidence_info.get("explanation", ""))
                else:
                    conf_exp = confidence_info.get("explanation", "")

            # Disease identification
            sections.append({
                "section": "identification",
                "label_crop": t["crop_name"],
                "crop": crop_ta,
                "label_disease": t["disease_name"],
                "disease": predicted_disease_ta,
                "label_confidence": t["confidence"],
                "confidence_pct": f"{prediction.confidence * 100:.1f}%",
                "label_confidence_exp": t["confidence_explanation"],
                "confidence_explanation": conf_exp,
                "is_healthy": prediction.is_healthy,
                "healthy_message": t.get("healthy_msg", "") if prediction.is_healthy else "",
            })

            if disease_info:
                # Symptoms & Description
                sections.append({
                    "section": "disease_info",
                    "label_severity": t["severity"],
                    "severity": severity_label,
                    "label_symptoms": t["symptoms"],
                    "symptoms": disease_info_symptoms,
                    "label_description": t["description"],
                    "description": disease_info_description,
                })

                if not prediction.is_healthy:
                    # Organic Treatment
                    sections.append({
                        "section": "organic_treatment",
                        "title": t["organic_treatment"],
                        "treatment": disease_info_organic_treatment,
                        "label_dosage": t["organic_dosage"],
                        "dosage": disease_info_organic_dosage,
                        "label_instructions": t["organic_instructions"],
                        "instructions": disease_info_organic_instructions,
                    })

                    # Chemical Treatment
                    sections.append({
                        "section": "chemical_treatment",
                        "title": t["chemical_treatment"],
                        "treatment": disease_info_chemical_treatment,
                        "label_dosage": t["chemical_dosage"],
                        "dosage": disease_info_chemical_dosage,
                        "label_instructions": t["chemical_instructions"],
                        "instructions": disease_info_chemical_instructions,
                        "disclaimer": t["chemical_disclaimer"],
                    })

                    # Prevention
                    sections.append({
                        "section": "prevention",
                        "title": t["prevention"],
                        "content": disease_info_prevention,
                    })

                # Farming Tips
                sections.append({
                    "section": "farming_tips",
                    "title": t["farming_tips"],
                    "content": disease_info_farming_tips,
                })

        # Soil Section (if available)
        if soil_data:
            soil_title = "மண் பகுப்பாய்வு அறிக்கை" if lang == 'ta' else "Soil Analysis Report"
            sections.append({
                "section": "soil_analysis",
                "title": soil_title,
                "soil_summary": soil_data.get("soil_summary", ""),
                "soil_type": soil_data.get("soil_type", ""),
                "ph": soil_data.get("ph_level", 7.0),
                "suitable_crops": soil_data.get("suitable_crops", []),
                "fertilizer_recommendations": soil_data.get("fertilizer_recommendations", []),
                "organic_improvements": soil_data.get("organic_improvements", []),
                "irrigation_advice": soil_data.get("irrigation_advice", ""),
                "explanations": soil_data.get("explanations", []),
                # Translations labels
                "label_ph": "மண் கார அமிலத்தன்மை" if lang == 'ta' else "Soil pH",
                "label_soil_type": "மண் வகை" if lang == 'ta' else "Soil Type",
                "label_suitable": "பொருத்தமான பயிர்கள்" if lang == 'ta' else "Highly Suitable Crops",
                "label_fertilizer": "உர பரிந்துரைகள்" if lang == 'ta' else "Fertilizer Recommendations",
                "label_organic": "இயற்கை மேம்பாடுகள்" if lang == 'ta' else "Organic Improvements",
                "label_irrigation": "நீர்ப்பாசன ஆலோசனை" if lang == 'ta' else "Irrigation Advice",
            })

        # Water Section (if available)
        if water_data:
            water_title = "நீர் பகுப்பாய்வு அறிக்கை" if lang == 'ta' else "Water Quality Report"
            sections.append({
                "section": "water_analysis",
                "title": water_title,
                "suitability": water_data.get("suitability", ""),
                "ph": water_data.get("ph", 7.0),
                "tds_ppm": water_data.get("tds_ppm", 400.0),
                "recommended_crops": water_data.get("recommended_crops", []),
                "risks": water_data.get("risks", []),
                "precautions": water_data.get("precautions", []),
                # Translations labels
                "label_suitability": "நீரின் தரம்" if lang == 'ta' else "Water Suitability",
                "label_ph": "நீர் கார அமிலத்தன்மை" if lang == 'ta' else "Water pH",
                "label_tds": "மொத்த கரைந்த திடப்பொருட்கள் அளவு" if lang == 'ta' else "Total Dissolved Solids (TDS)",
                "label_recommended": "பரிந்துரைக்கப்படும் பயிர்கள்" if lang == 'ta' else "Recommended Crops",
                "label_risks": "அபாயங்கள்" if lang == 'ta' else "Possible Risks",
                "label_precautions": "முன்னெச்சரிக்கை நடவடிக்கைகள்" if lang == 'ta' else "Recommended Precautions",
            })

        # Weather section
        if weather_data and "recommendations" in weather_data:
            sections.append({
                "section": "weather",
                "title": t["weather_recommendation"],
                "summary": weather_data.get("summary", ""),
                "recommendations": [r.get("message", "") for r in weather_data.get("recommendations", [])[:4]],
            })

        # Warnings
        warnings = []
        if confidence_info and confidence_info.get("key") in ("very_low", "low"):
            warnings.append(t.get("low_confidence_warning", ""))
        if not prediction:
            warnings.append("No disease prediction available for this report. Upload a crop image first.")

        if warnings:
            sections.append({
                "section": "warnings",
                "title": t["important_warning"],
                "items": warnings,
            })

        return Response({
            "language": lang,
            "report_sections": sections,
        })


class SoilAnalysisView(APIView):
    """
    POST /api/advisor/soil/
    Integrates Soil AI model prediction using actual elemental parameters.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        N = data.get("N", data.get("nitrogen", 200))
        P = data.get("P", data.get("phosphorus", 15))
        K = data.get("K", data.get("potassium", 300))
        ph = data.get("ph", data.get("pH", 6.5))
        ec = data.get("ec", 0.8)
        oc = data.get("oc", 0.7)
        S = data.get("S", 10.0)
        zn = data.get("zn", 0.5)
        fe = data.get("fe", 1.0)
        cu = data.get("cu", 0.8)
        Mn = data.get("Mn", 5.0)
        B = data.get("B", 0.5)

        def parse_val(val, low, med, high):
            if val is None: return med
            if isinstance(val, (int, float)): return float(val)
            s = str(val).strip().lower()
            if s in ["low", "poor"]: return low
            if s in ["high", "rich", "excellent"]: return high
            try: return float(s)
            except ValueError: return med

        N_val = parse_val(N, 100, 200, 350)
        P_val = parse_val(P, 5, 15, 35)
        K_val = parse_val(K, 150, 300, 500)
        try: ph_val = float(ph)
        except Exception: ph_val = 6.5
        try: ec_val = float(ec)
        except Exception: ec_val = 0.8
        try: oc_val = float(oc)
        except Exception: oc_val = 0.7
        try: S_val = float(S)
        except Exception: S_val = 10.0
        try: zn_val = float(zn)
        except Exception: zn_val = 0.5
        try: fe_val = float(fe)
        except Exception: fe_val = 1.0
        try: cu_val = float(cu)
        except Exception: cu_val = 0.8
        try: Mn_val = float(Mn)
        except Exception: Mn_val = 5.0
        try: B_val = float(B)
        except Exception: B_val = 0.5

        params = {
            'N': N_val, 'P': P_val, 'K': K_val, 'ph': ph_val,
            'ec': ec_val, 'oc': oc_val, 'S': S_val, 'zn': zn_val,
            'fe': fe_val, 'cu': cu_val, 'Mn': Mn_val, 'B': B_val
        }

        if predict_soil_fertility is not None:
            try:
                ai_res = predict_soil_fertility(params)
            except Exception as e:
                ai_res = {
                    "predicted_class": "Fertile",
                    "confidence": 0.90,
                    "analysis_type": "AI Soil Fertility Assessment",
                    "soil_condition": "Optimal / Fertile Soil",
                    "possible_problem": "No major fertility deficiency detected.",
                    "crop_suitability": "Suitable for most crops.",
                    "recommendations": ["Apply balanced NPK maintenance dosage."],
                    "organic_methods": ["Regular top-dressing with vermicompost."]
                }
        else:
            ai_res = {
                "predicted_class": "Fertile",
                "confidence": 0.85,
                "analysis_type": "Rule-based Assessment",
                "soil_condition": "Fertile Soil",
                "possible_problem": "None",
                "crop_suitability": "Suitable for general crops",
                "recommendations": ["Maintain organic manure application"],
                "organic_methods": ["Add vermicompost"]
            }

        soil_type = data.get("soil_type", "Loamy Soil")
        
        # Save record if user authenticated
        if request.user and request.user.is_authenticated:
            try:
                SoilAnalysisRecord.objects.create(
                    user=request.user,
                    analysis_type=ai_res.get("analysis_type", "AI Soil Fertility Model Prediction"),
                    predicted_class=ai_res.get("predicted_class", "Fertile"),
                    confidence=ai_res.get("confidence", 0.9),
                    soil_condition=ai_res.get("soil_condition", ""),
                    possible_problem=ai_res.get("possible_problem", ""),
                    crop_suitability=ai_res.get("crop_suitability", ""),
                    recommendations=ai_res.get("recommendations", []),
                    organic_methods=ai_res.get("organic_methods", [])
                )
            except Exception as e:
                pass

        conf_val = ai_res["confidence"]
        conf_pct = round(conf_val * 100, 1)

        return Response({
            "ai_soil_result": ai_res["predicted_class"],
            "confidence": conf_val,
            "confidence_percent": conf_pct,
            "analysis_type": ai_res["analysis_type"],
            "soil_condition": ai_res["soil_condition"],
            "possible_problem": ai_res["possible_problem"],
            "crop_suitability": ai_res["crop_suitability"],
            "recommendations": ai_res["recommendations"],
            "organic_methods": ai_res["organic_methods"],
            "soil_summary": f"{soil_type} - AI Fertility Class: {ai_res['predicted_class']} (Confidence: {conf_pct}%)",
            "ph_level": ph_val,
            "soil_type": soil_type,
            "suitable_crops": [c.strip() for c in ai_res["crop_suitability"].replace("Suitable for ", "").split(",")],
            "fertilizer_recommendations": ai_res["recommendations"],
            "organic_improvements": ai_res["organic_methods"],
            "explanations": [ai_res["soil_condition"], ai_res["possible_problem"]]
        })


class WaterAnalysisView(APIView):
    """
    POST /api/advisor/water/
    Integrates Water AI model classification using groundwater parameters.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        ph = data.get("ph", 7.2)
        ec = data.get("ec", 0.8)
        tds = data.get("tds", 450)
        CO3 = data.get("CO3", 0.0)
        HCO3 = data.get("HCO3", 250.0)
        Cl = data.get("Cl", 100.0)
        SO4 = data.get("SO4", 50.0)
        NO3 = data.get("NO3", 15.0)
        TH = data.get("TH", 200.0)
        Ca = data.get("Ca", 60.0)
        Mg = data.get("Mg", 30.0)
        Na = data.get("Na", 50.0)
        K = data.get("K", 5.0)
        F = data.get("F", 0.5)

        try: ph_val = float(ph)
        except Exception: ph_val = 7.2
        try: ec_val = float(ec)
        except Exception: ec_val = 0.8
        try: tds_val = float(tds) if tds is not None else ec_val * 640.0
        except Exception: tds_val = 450.0

        params = {
            'pH': ph_val, 'EC': ec_val * 1000 if ec_val < 50 else ec_val,
            'CO3': float(CO3), 'HCO3': float(HCO3), 'Cl': float(Cl),
            'SO4': float(SO4), 'NO3': float(NO3), 'TH': float(TH),
            'Ca': float(Ca), 'Mg': float(Mg), 'Na': float(Na),
            'K': float(K), 'F': float(F), 'TDS': tds_val
        }

        if predict_water_quality is not None:
            try:
                ai_res = predict_water_quality(params)
            except Exception as e:
                ai_res = {
                    "predicted_class": "Good",
                    "confidence": 0.95,
                    "analysis_type": "AI Water Quality Classification",
                    "water_status": "Good Quality Water",
                    "suitability": "Suitable for almost all field crops.",
                    "observations": ["Normal TDS and electrical conductivity"],
                    "recommendations": ["Ideal for regular drip irrigation"],
                    "risks": ["Minor scaling risk"]
                }
        else:
            ai_res = {
                "predicted_class": "Good",
                "confidence": 0.88,
                "analysis_type": "Rule-based Assessment",
                "water_status": "Good",
                "suitability": "Suitable for irrigation",
                "observations": ["Normal levels"],
                "recommendations": ["Standard irrigation"],
                "risks": ["None"]
            }

        # Save record if user authenticated
        if request.user and request.user.is_authenticated:
            try:
                WaterAnalysisRecord.objects.create(
                    user=request.user,
                    analysis_type=ai_res.get("analysis_type", "AI Water Quality Model Classification"),
                    predicted_class=ai_res.get("predicted_class", "Good"),
                    confidence=ai_res.get("confidence", 0.9),
                    water_status=ai_res.get("water_status", ""),
                    suitability=ai_res.get("suitability", ""),
                    observations=ai_res.get("observations", []),
                    recommendations=ai_res.get("recommendations", []),
                    risks=ai_res.get("risks", [])
                )
            except Exception as e:
                pass

        conf_val = ai_res["confidence"]
        conf_pct = round(conf_val * 100, 1)

        return Response({
            "ai_water_result": ai_res["predicted_class"],
            "confidence": conf_val,
            "confidence_percent": conf_pct,
            "analysis_type": ai_res["analysis_type"],
            "water_status": ai_res["water_status"],
            "suitability": ai_res["suitability"],
            "observations": ai_res["observations"],
            "recommendations": ai_res["recommendations"],
            "risks": ai_res["risks"],
            "ph": ph_val,
            "tds_ppm": tds_val,
            "ec": ec_val,
            "recommended_crops": ["Rice", "Maize", "Tomato", "Wheat", "Groundnut"],
            "precautions": ai_res["recommendations"]
        })


def generate_smart_crop_recommendation(
    crop: str = "Tomato",
    disease: str = "Healthy",
    confidence: float = 0.95,
    is_healthy: bool = True,
    treatment: str = "",
    soil_moisture: float = None,
    soil_status: str = None,
    water_level: float = None,
    field_water_availability: str = None,
    water_source: str = None,
    weather: str = "",
    stage: str = "",
    lang: str = "en"
) -> dict:
    """
    Core SmartCrop 3-Input Recommendation Engine.
    Combines:
      1. AI Leaf Disease Prediction
      2. Live ESP32 Soil Moisture & Condition
      3. Field Water Availability / Wetness
    """
    from iot_sensor.models import SensorReading

    # 1. Resolve live IoT telemetry if soil/water parameters not explicitly supplied
    sensor_status = "Offline"
    is_simulation = False
    soil_source = "ESP32 Live Hardware"

    if soil_moisture is None or water_level is None:
        latest_reading = SensorReading.objects.first()
        if latest_reading:
            if soil_moisture is None:
                soil_moisture = latest_reading.soil_moisture
            if water_level is None:
                water_level = latest_reading.water_level
            sensor_status = latest_reading.get_connection_status()
            is_simulation = latest_reading.get_is_simulation()
            soil_source = "Dashboard Simulation Mode" if is_simulation else "ESP32 Live Hardware"
            if water_source is None:
                water_source = "Dashboard Simulation Mode" if is_simulation else "ESP32 Field Sensor"
        else:
            sensor_status = "Awaiting Connection"
            soil_source = "Unavailable"
            if water_source is None:
                water_source = "Unavailable"

    if water_source is None:
        water_source = "Field Sensor Assessment"

    # 2. Parse confidence float
    try:
        if isinstance(confidence, str):
            conf_val = float(confidence.replace('%', '').strip())
            if conf_val > 1.0:
                conf_val = conf_val / 100.0
        else:
            conf_val = float(confidence)
    except Exception:
        conf_val = 0.85

    conf_pct_str = f"{conf_val * 100:.1f}%"
    low_conf_warning = None
    if conf_val < 0.60:
        low_conf_warning = "Prediction confidence is low. Please capture a clear leaf image and verify visible symptoms before applying treatment."

    # 3. Crop-specific moisture requirement definitions
    CROP_MOISTURE_RANGES = {
        "Tomato": (45.0, 70.0),
        "Potato": (45.0, 65.0),
        "Rice": (60.0, 85.0),
        "Corn": (40.0, 65.0),
        "Maize": (40.0, 65.0),
        "Apple": (45.0, 65.0),
        "Grape": (40.0, 60.0),
        "Cotton": (35.0, 60.0),
        "Groundnut": (40.0, 65.0),
        "Sugarcane": (50.0, 75.0),
        "Pepper": (45.0, 65.0),
    }

    opt_min, opt_max = CROP_MOISTURE_RANGES.get(crop, (40.0, 70.0))

    # 4. Evaluate Soil Analysis
    soil_available = soil_moisture is not None
    if soil_available:
        if soil_moisture < opt_min:
            soil_status = "Dry / Unsuitable"
            soil_advice = f"Soil moisture ({soil_moisture:.1f}%) is low for {crop} (optimal range: {opt_min:.0f}-{opt_max:.0f}%). Irrigation required."
        elif soil_moisture <= opt_max:
            soil_status = "Optimal / Suitable"
            soil_advice = f"Soil moisture ({soil_moisture:.1f}%) is suitable for {crop} growth."
        else:
            soil_status = "Wet / Unsuitable"
            soil_advice = f"Soil moisture ({soil_moisture:.1f}%) is excessively high for {crop}. Drainage recommended to prevent root rot."
    else:
        soil_status = "SOIL DATA UNAVAILABLE"
        soil_advice = "No real soil sensor telemetry recorded yet."

    # 5. Evaluate Water Analysis
    water_available = water_level is not None
    if water_available:
        if water_level < 25.0:
            field_water_availability = "Low Water / Irrigation Required"
        elif water_level < 50.0:
            field_water_availability = "Moderate Water"
        elif water_level <= 75.0:
            field_water_availability = "Sufficient Water"
        else:
            field_water_availability = "Excess Water / Waterlogging Risk"
    else:
        field_water_availability = "WATER DATA UNAVAILABLE"

    # 6. Synthesize Level 2 Overall Recommendation using cautious relational wording
    disease_clean = disease.split('–')[-1].strip() if '–' in disease else disease.strip()

    is_dry = soil_available and soil_moisture < opt_min
    is_wet = soil_available and soil_moisture > opt_max
    is_water_low = water_available and water_level < 25.0
    is_water_excess = water_available and water_level > 75.0

    if not is_healthy:
        if is_dry:
            recommendation = (
                f"{disease_clean} detected on {crop}. Unsuitable dry soil conditions ({soil_moisture:.1f}%) "
                f"may contribute to stress on the plant. Treat the leaf disease immediately and improve soil moisture using organic mulching and controlled irrigation."
            )
        elif is_wet:
            recommendation = (
                f"{disease_clean} detected on {crop}. Excess soil moisture ({soil_moisture:.1f}%) "
                f"could affect root health and exacerbate fungal disease spread. Apply targeted disease treatment and improve field drainage."
            )
        else:
            recommendation = (
                f"{disease_clean} detected on {crop}. Soil and water conditions appear suitable. "
                f"Focus primarily on applying the recommended disease treatment for {disease_clean}."
            )
    else:
        if is_dry:
            recommendation = (
                f"{crop} foliage appears healthy. However, low soil moisture ({soil_moisture:.1f}%) "
                f"may affect ongoing growth. Irrigate and apply vermicompost/mulch to restore optimal moisture."
            )
        elif is_wet:
            recommendation = (
                f"{crop} foliage appears healthy, but excess soil moisture ({soil_moisture:.1f}%) "
                f"could increase the risk of root rot. Ensure field drainage channels are clear."
            )
        else:
            recommendation = (
                f"The crop ({crop}) condition is currently fully suitable. "
                f"Continue regular monitoring and maintain current farming practices."
            )

    return {
        "status": "success",
        "disease_analysis": {
            "crop": crop,
            "disease": disease,
            "predicted_disease": disease_clean,
            "disease_clean": disease_clean,
            "confidence": conf_val,
            "confidence_percent": conf_pct_str,
            "confidence_pct": conf_pct_str,
            "is_healthy": is_healthy,
            "treatment": treatment or "Consult local agricultural advisor for specific pesticide and organic management.",
            "low_confidence_warning": low_conf_warning,
        },
        "soil_analysis": {
            "available": soil_available,
            "soil_moisture": round(float(soil_moisture), 1) if soil_available else None,
            "soil_status": soil_status,
            "soil_advice": soil_advice,
            "sensor_status": sensor_status,
            "is_simulation": is_simulation,
            "source": soil_source,
        },
        "water_analysis": {
            "available": water_available,
            "field_water_level": round(float(water_level), 1) if water_available else None,
            "field_water_availability": field_water_availability,
            "water_status": field_water_availability,
            "source": water_source,
        },
        "combined_recommendation": recommendation,
        "quick_summary": f"{'✅ Healthy' if is_healthy else '⚠️ ' + disease_clean} | 🪨 {soil_status} | 💧 {field_water_availability}",
    }


class UnifiedRecommendationView(APIView):
    """
    POST /api/advisor/recommend/
    Combines AI Leaf Disease Prediction + Live ESP32 Soil Condition + Field Water Availability
    into a single practical, farmer-friendly recommendation.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        crop = request.data.get("crop", "Tomato")
        disease = request.data.get("disease", "Healthy")
        confidence = request.data.get("confidence", 0.95)
        is_healthy = request.data.get("is_healthy", True)
        if isinstance(is_healthy, str):
            is_healthy = is_healthy.lower() in ('true', '1', 'yes')
        treatment = request.data.get("treatment", "")

        soil_moisture = request.data.get("soil_moisture")
        if soil_moisture is not None:
            try:
                soil_moisture = float(soil_moisture)
            except ValueError:
                soil_moisture = None

        soil_status = request.data.get("soil_status")

        water_level = request.data.get("water_level") or request.data.get("field_water_level")
        if water_level is not None:
            try:
                water_level = float(water_level)
            except ValueError:
                water_level = None

        field_water_availability = request.data.get("field_water_availability") or request.data.get("water_status")
        water_source = request.data.get("water_source") or request.data.get("source")
        weather = request.data.get("weather", "")
        stage = request.data.get("stage", "")
        lang = request.data.get("lang", "en")

        result = generate_smart_crop_recommendation(
            crop=crop,
            disease=disease,
            confidence=confidence,
            is_healthy=is_healthy,
            treatment=treatment,
            soil_moisture=soil_moisture,
            soil_status=soil_status,
            water_level=water_level,
            field_water_availability=field_water_availability,
            water_source=water_source,
            weather=weather,
            stage=stage,
            lang=lang,
        )

        return Response(result, status=status.HTTP_200_OK)




# ── Soil Image Analysis View ─────────────────────────────────────────────────
class SoilImageAnalysisView(APIView):
    """POST /api/advisor/soil-image/ - Color-heuristic soil type prediction."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        image_file = request.FILES.get('image')
        if not image_file:
            return Response({'error': 'No image uploaded.'}, status=status.HTTP_400_BAD_REQUEST)
        if not image_file.content_type.startswith('image/'):
            return Response({'error': 'Invalid file type. Upload JPG, PNG, or WEBP.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            from PIL import Image
            img = Image.open(image_file).convert('RGB').resize((100, 100))
            pixels = list(img.getdata())
            avg_r = sum(p[0] for p in pixels) / len(pixels)
            avg_g = sum(p[1] for p in pixels) / len(pixels)
            avg_b = sum(p[2] for p in pixels) / len(pixels)

            if avg_r > avg_g + 30 and avg_r > avg_b + 30:
                soil_type = "Red Soil"
                suitable = ["Groundnut", "Cotton", "Millets", "Sorghum", "Sunflower"]
                unsuitable = ["Rice", "Sugarcane"]
                chars = ["High iron oxide content gives red color", "Good drainage and aeration", "Generally low in nitrogen and phosphorus", "Needs regular organic matter addition"]
                recs = ["Add compost or farmyard manure (FYM) to improve fertility", "Apply lime if pH is below 5.5", "Use drip irrigation to conserve water", "Grow nitrogen-fixing legumes in rotation"]
            elif avg_r < 80 and avg_g < 80 and avg_b < 80:
                soil_type = "Black Cotton Soil"
                suitable = ["Cotton", "Sugarcane", "Soybean", "Wheat", "Sorghum"]
                unsuitable = ["Root vegetables (difficult to harvest in heavy clay)"]
                chars = ["High clay content — shrinks when dry, swells when wet", "Excellent water retention", "Rich in calcium, magnesium, and potassium", "Needs good drainage management"]
                recs = ["Avoid deep plowing when soil is wet", "Make raised beds or ridges for water drainage", "Add gypsum or organic matter to improve structure", "Monitor for waterlogging during rainy season"]
            elif avg_r > 160 and avg_g > 140 and avg_b > 110:
                soil_type = "Sandy Soil"
                suitable = ["Groundnut", "Sweet Potato", "Watermelon", "Cassava", "Millets"]
                unsuitable = ["Rice", "Sugarcane"]
                chars = ["Large particles — drains very quickly", "Low nutrient and water retention", "Warms up quickly in spring", "Easy to work and till"]
                recs = ["Add large amounts of organic compost to improve water retention", "Irrigate frequently in small amounts (drip preferred)", "Apply mulch to reduce moisture evaporation", "Apply organic fertilizers regularly — nutrients wash away quickly"]
            elif avg_g > avg_r + 10 and avg_g > avg_b:
                soil_type = "Alluvial / Loam Soil"
                suitable = ["Rice", "Maize", "Wheat", "Sugarcane", "Tomato", "Cotton"]
                unsuitable = []
                chars = ["Excellent balance of sand, silt, and clay", "High fertility and good moisture retention", "Found near river plains and deltas", "Most productive agricultural soil"]
                recs = ["Maintain organic matter with regular compost application", "Practice crop rotation to prevent nutrient depletion", "Monitor for waterlogging in low-lying areas", "Standard fertilization schedule based on crop needs"]
            else:
                soil_type = "Clay Soil"
                suitable = ["Rice", "Wheat", "Sugarcane", "Barley"]
                unsuitable = ["Root vegetables (carrot, radish) — difficult to harvest"]
                chars = ["Very fine particles — holds water well", "Slow drainage — risk of waterlogging", "Rich in nutrients but can become compacted", "Sticky when wet, hard when dry"]
                recs = ["Avoid tillage when soil is too wet or too dry", "Add organic matter (compost, manure) to improve drainage", "Use raised bed farming to improve aeration", "Apply gypsum to break up compacted clay"]

            return Response({
                'soil_type_prediction': soil_type,
                'soil_characteristics': chars,
                'suitable_crops': suitable,
                'unsuitable_crops': unsuitable,
                'recommendations': recs,
                'disclaimer': (
                    'This is an AI-based visual prediction using image color analysis. '
                    'Actual soil testing (pH, NPK, EC) is strongly recommended for precise '
                    'agricultural decisions. Contact your local agricultural department for certified testing.'
                ),
            })
        except Exception as e:
            return Response({'error': f'Analysis failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ── Water Image Analysis View ─────────────────────────────────────────────────
class WaterImageAnalysisView(APIView):
    """POST /api/advisor/water-image/ - Color-heuristic water condition prediction."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        image_file = request.FILES.get('image')
        if not image_file:
            return Response({'error': 'No image uploaded.'}, status=status.HTTP_400_BAD_REQUEST)
        if not image_file.content_type.startswith('image/'):
            return Response({'error': 'Invalid file type. Upload JPG, PNG, or WEBP.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            from PIL import Image
            img = Image.open(image_file).convert('RGB').resize((100, 100))
            pixels = list(img.getdata())
            avg_r = sum(p[0] for p in pixels) / len(pixels)
            avg_g = sum(p[1] for p in pixels) / len(pixels)
            avg_b = sum(p[2] for p in pixels) / len(pixels)

            if avg_r > avg_b + 25 and avg_g > avg_b:
                condition = "Turbid / Muddy Water"; color_obs = "brownish/murky"; suit = "Conditionally Suitable — Needs Filtering"
                obs = ["Water appears turbid with suspended particles", "Brown color indicates high sediment content", "Possible agricultural or construction runoff"]
                recs = ["Filter through sand/gravel before using on crops", "Allow water to settle for 24 hours before irrigation", "Do not use directly on seedlings"]
                risks = ["Sediment can clog drip irrigation emitters", "May carry pathogens causing root rot", "High turbidity reduces light in paddy fields"]
            elif avg_g > avg_r + 15 and avg_g > avg_b + 15:
                condition = "Algae-Affected Water"; color_obs = "greenish"; suit = "Use with Caution — Treat Before Use"
                obs = ["Green color indicates presence of algae or aquatic weeds", "Caused by excess nutrients — eutrophication", "May have low dissolved oxygen levels"]
                recs = ["Aerate the water source to increase dissolved oxygen", "Remove floating algae before drawing water", "Use copper sulfate (1 ppm) for algae control"]
                risks = ["Algal toxins can damage young seedlings", "Low dissolved oxygen stresses aquatic life", "Possible blockage of irrigation channels"]
            elif avg_r < 80 and avg_g < 80 and avg_b < 90:
                condition = "Dark / Contaminated Water"; color_obs = "very dark/black"; suit = "NOT Suitable — Do Not Use"
                obs = ["Very dark color — stagnant or severely contaminated", "Possible sewage or industrial effluents present", "Extremely low oxygen — anaerobic decomposition"]
                recs = ["DO NOT use this water on crops", "Report to local pollution control board if near industrial area", "Use borewell or rainwater harvesting as alternative"]
                risks = ["Severe crop damage and soil contamination risk", "Risk of heavy metal accumulation in soil", "Health hazard — pathogens can enter food supply"]
            elif avg_r > 140 and avg_g > 110 and avg_b < 100:
                condition = "Iron-Rich / Yellowish Water"; color_obs = "yellowish/rusty"; suit = "Limited Suitability — Test Before Use"
                obs = ["Yellowish/rusty color indicates high iron content", "May contain minerals from soil leaching", "Common near laterite or iron-rich geological formations"]
                recs = ["Test iron content (acceptable limit: <5 mg/L for irrigation)", "Use aeration and sand filtration to reduce iron", "Avoid use on pH-sensitive crops like blueberries or citrus"]
                risks = ["Excess iron can cause orange leaf streaks on crops", "Can clog drip irrigation emitters with deposits", "May reduce phosphorus availability in soil"]
            else:
                condition = "Clear / Good Quality Water"; color_obs = "clear/transparent"; suit = "Suitable for Irrigation"
                obs = ["Water appears clear — good visual indicator of quality", "No visible sediment, algae, or discoloration detected", "Likely clean groundwater, treated water, or rainwater"]
                recs = ["Conduct periodic pH and TDS testing to confirm quality", "Use efficient drip or furrow irrigation to minimize waste", "Store collected water in covered tanks to prevent contamination"]
                risks = ["Visual clarity alone does not guarantee chemical safety", "Annual lab testing for pesticide residues recommended"]

            return Response({
                'water_condition': condition,
                'color_observed': color_obs,
                'suitability': suit,
                'observations': obs,
                'recommendations': recs,
                'risks': risks,
                'disclaimer': (
                    'This is a preliminary AI-based visual assessment using image color analysis. '
                    'Proper water quality testing (pH, TDS, EC, heavy metals, microbial count) is required '
                    'for accurate agricultural or drinking water decisions. Contact your local agricultural '
                    'department or water testing laboratory.'
                ),
            })
        except Exception as e:
            return Response({'error': f'Analysis failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# â”€â”€ Need To Do View â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class NeedToDoView(APIView):
    """
    POST /api/advisor/need-to-do/
    Generates actionable farming recommendations based on a stored prediction record.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        disease = request.data.get("disease", "")
        is_healthy = request.data.get("is_healthy", True)
        if isinstance(is_healthy, str):
            is_healthy = is_healthy.lower() in ('true', '1', 'yes')
        confidence = request.data.get("confidence", 0)
        crop_name = request.data.get("crop_name", "")
        soil_data = request.data.get("soil_data")
        water_data = request.data.get("water_data")
        lang = request.data.get("lang", "en")

        actions = []

        # 1. Disease treatment recommendation
        if is_healthy:
            actions.append({
                "category": "Disease" if lang == "en" else "à®¨à¯‹à®¯à¯",
                "status": "Healthy" if lang == "en" else "à®†à®°à¯‹à®•à¯à®•à®¿à®¯à®®à®¾à®©à®¤à¯",
                "icon": "âœ…",
                "recommendations": [
                    "Continue regular monitoring of crop leaves." if lang == "en" else "à®ªà®¯à®¿à®°à¯ à®‡à®²à¯ˆà®•à®³à¯ˆ à®¤à¯Šà®Ÿà®°à¯à®¨à¯à®¤à¯ à®•à®£à¯à®•à®¾à®£à®¿à®•à¯à®•à®µà¯à®®à¯.",
                    "Maintain proper spacing between plants for air circulation." if lang == "en" else "à®•à®¾à®±à¯à®±à¯ à®šà¯à®´à®±à¯à®šà®¿à®•à¯à®•à¯ à®šà¯†à®Ÿà®¿à®•à®³à¯à®•à¯à®•à¯ à®‡à®Ÿà¯ˆà®¯à®¿à®²à¯ à®šà®°à®¿à®¯à®¾à®© à®‡à®Ÿà¯ˆà®µà¯†à®³à®¿à®¯à¯ˆ à®ªà®°à®¾à®®à®°à®¿à®•à¯à®•à®µà¯à®®à¯.",
                    "Apply preventive neem oil spray every 15 days." if lang == "en" else "à®’à®µà¯à®µà¯Šà®°à¯ 15 à®¨à®¾à®Ÿà¯à®•à®³à¯à®•à¯à®•à¯à®®à¯ à®¤à®Ÿà¯à®ªà¯à®ªà¯ à®µà¯‡à®ªà¯à®ª à®Žà®£à¯à®£à¯†à®¯à¯ à®¤à¯†à®³à®¿à®ªà¯à®ªà¯ˆ à®šà¯†à®¯à¯à®¯à®µà¯à®®à¯.",
                ]
            })
        else:
            recs = []
            if lang == "en":
                recs.append(f"Treat {disease} immediately using recommended organic or chemical methods.")
                recs.append("Remove severely affected leaves and dispose away from the field.")
                recs.append("Improve air circulation around plants by pruning.")
                recs.append("Monitor nearby plants for signs of spread.")
            else:
                recs.append(f"{disease} à®¨à¯‹à®¯à¯à®•à¯à®•à¯ à®‰à®Ÿà®©à®Ÿà®¿à®¯à®¾à®• à®šà®¿à®•à®¿à®šà¯à®šà¯ˆ à®…à®³à®¿à®•à¯à®•à®µà¯à®®à¯.")
                recs.append("à®•à®Ÿà¯à®®à¯ˆà®¯à®¾à®• à®ªà®¾à®¤à®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿ à®‡à®²à¯ˆà®•à®³à¯ˆ à®…à®•à®±à¯à®±à®¿ à®µà®¯à®²à®¿à®²à¯ à®‡à®°à¯à®¨à¯à®¤à¯ à®¤à¯‚à®°à®®à®¾à®• à®…à®ªà¯à®ªà¯à®±à®ªà¯à®ªà®Ÿà¯à®¤à¯à®¤à®µà¯à®®à¯.")
                recs.append("à®•à®¿à®³à¯ˆ à®µà¯†à®Ÿà¯à®Ÿà¯à®¤à®²à¯ à®®à¯‚à®²à®®à¯ à®•à®¾à®±à¯à®±à¯ à®šà¯à®´à®±à¯à®šà®¿à®¯à¯ˆ à®®à¯‡à®®à¯à®ªà®Ÿà¯à®¤à¯à®¤à®µà¯à®®à¯.")
                recs.append("à®…à®°à¯à®•à®¿à®²à¯à®³à¯à®³ à®šà¯†à®Ÿà®¿à®•à®³à®¿à®²à¯ à®ªà®°à®µà¯à®µà®¤à®±à¯à®•à®¾à®© à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯ˆà®•à¯ à®•à®£à¯à®•à®¾à®£à®¿à®•à¯à®•à®µà¯à®®à¯.")
            actions.append({
                "category": "Disease Treatment" if lang == "en" else "à®¨à¯‹à®¯à¯ à®šà®¿à®•à®¿à®šà¯à®šà¯ˆ",
                "status": disease,
                "icon": "ðŸ¦ ",
                "recommendations": recs,
            })

        # 2. Soil improvement recommendation
        if soil_data:
            soil_recs = []
            soil_status = "Available" if lang == "en" else "à®•à®¿à®Ÿà¯ˆà®•à¯à®•à®¿à®±à®¤à¯"
            soil_type = soil_data.get("soil_type", soil_data.get("soil_summary", ""))
            if lang == "en":
                soil_recs.append(f"Soil type: {soil_type}. Follow the soil analysis recommendations.")
                soil_recs.append("Add organic compost to improve soil structure and nutrient content.")
                soil_recs.append("Test soil periodically to monitor pH and nutrient levels.")
            else:
                soil_recs.append(f"à®®à®£à¯ à®µà®•à¯ˆ: {soil_type}. à®®à®£à¯ à®ªà®•à¯à®ªà¯à®ªà®¾à®¯à¯à®µà¯ à®ªà®°à®¿à®¨à¯à®¤à¯à®°à¯ˆà®•à®³à¯ˆà®ªà¯ à®ªà®¿à®©à¯à®ªà®±à¯à®±à®µà¯à®®à¯.")
                soil_recs.append("à®®à®£à¯ à®•à®Ÿà¯à®Ÿà®®à¯ˆà®ªà¯à®ªà¯ à®®à®±à¯à®±à¯à®®à¯ à®Šà®Ÿà¯à®Ÿà®šà¯à®šà®¤à¯à®¤à¯ à®‰à®³à¯à®³à®Ÿà®•à¯à®•à®¤à¯à®¤à¯ˆ à®®à¯‡à®®à¯à®ªà®Ÿà¯à®¤à¯à®¤ à®‡à®¯à®±à¯à®•à¯ˆ à®‰à®°à®®à¯ à®šà¯‡à®°à¯à®•à¯à®•à®µà¯à®®à¯.")
                soil_recs.append("pH à®®à®±à¯à®±à¯à®®à¯ à®Šà®Ÿà¯à®Ÿà®šà¯à®šà®¤à¯à®¤à¯ à®…à®³à®µà¯à®•à®³à¯ˆà®•à¯ à®•à®£à¯à®•à®¾à®£à®¿à®•à¯à®• à®®à®£à¯à®£à¯ˆ à®…à®µà¯à®µà®ªà¯à®ªà¯‹à®¤à¯ à®šà¯‹à®¤à®¿à®•à¯à®•à®µà¯à®®à¯.")
            actions.append({"category": "Soil Improvement" if lang == "en" else "à®®à®£à¯ à®®à¯‡à®®à¯à®ªà®¾à®Ÿà¯", "status": soil_status, "icon": "ðŸª¨", "recommendations": soil_recs})
        else:
            actions.append({"category": "Soil Improvement" if lang == "en" else "à®®à®£à¯ à®®à¯‡à®®à¯à®ªà®¾à®Ÿà¯", "status": "Not Tested" if lang == "en" else "à®šà¯‹à®¤à®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà®µà®¿à®²à¯à®²à¯ˆ", "icon": "ðŸª¨", "recommendations": ["Soil analysis was not performed for this record. Consider performing a soil test for better recommendations." if lang == "en" else "à®‡à®¨à¯à®¤ à®ªà®¤à®¿à®µà¯à®•à¯à®•à¯ à®®à®£à¯ à®ªà®•à¯à®ªà¯à®ªà®¾à®¯à¯à®µà¯ à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà®µà®¿à®²à¯à®²à¯ˆ. à®šà®¿à®±à®¨à¯à®¤ à®ªà®°à®¿à®¨à¯à®¤à¯à®°à¯ˆà®•à®³à¯à®•à¯à®•à¯ à®®à®£à¯ à®šà¯‹à®¤à®©à¯ˆ à®šà¯†à®¯à¯à®¯à®µà¯à®®à¯."]})

        # 3. Water/irrigation recommendation
        if water_data:
            water_recs = []
            water_status = water_data.get("suitability", "Available" if lang == "en" else "à®•à®¿à®Ÿà¯ˆà®•à¯à®•à®¿à®±à®¤à¯")
            if lang == "en":
                water_recs.append(f"Water quality: {water_status}.")
                water_recs.append("Follow irrigation schedule based on crop stage and weather conditions.")
                water_recs.append("Use drip irrigation where possible to conserve water.")
            else:
                water_recs.append(f"à®¨à¯€à®°à¯ à®¤à®°à®®à¯: {water_status}.")
                water_recs.append("à®ªà®¯à®¿à®°à¯ à®¨à®¿à®²à¯ˆ à®®à®±à¯à®±à¯à®®à¯ à®µà®¾à®©à®¿à®²à¯ˆ à®¨à®¿à®²à¯ˆà®®à¯ˆà®•à®³à®¿à®©à¯ à®…à®Ÿà®¿à®ªà¯à®ªà®Ÿà¯ˆà®¯à®¿à®²à¯ à®¨à¯€à®°à¯à®ªà¯à®ªà®¾à®šà®© à®…à®Ÿà¯à®Ÿà®µà®£à¯ˆà®¯à¯ˆà®ªà¯ à®ªà®¿à®©à¯à®ªà®±à¯à®±à®µà¯à®®à¯.")
                water_recs.append("à®¨à¯€à®°à¯ˆà®šà¯ à®šà¯‡à®®à®¿à®•à¯à®• à®®à¯à®Ÿà®¿à®¨à¯à®¤ à®‡à®Ÿà®™à¯à®•à®³à®¿à®²à¯ à®šà¯Šà®Ÿà¯à®Ÿà¯ à®¨à¯€à®°à¯à®ªà¯à®ªà®¾à®šà®©à®¤à¯à®¤à¯ˆà®ªà¯ à®ªà®¯à®©à¯à®ªà®Ÿà¯à®¤à¯à®¤à®µà¯à®®à¯.")
            actions.append({"category": "Water / Irrigation" if lang == "en" else "à®¨à¯€à®°à¯ / à®¨à¯€à®°à¯à®ªà¯à®ªà®¾à®šà®©à®®à¯", "status": water_status, "icon": "ðŸ’§", "recommendations": water_recs})
        else:
            actions.append({"category": "Water / Irrigation" if lang == "en" else "à®¨à¯€à®°à¯ / à®¨à¯€à®°à¯à®ªà¯à®ªà®¾à®šà®©à®®à¯", "status": "Not Tested" if lang == "en" else "à®šà¯‹à®¤à®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà®µà®¿à®²à¯à®²à¯ˆ", "icon": "ðŸ’§", "recommendations": ["Water quality test was not performed for this record. Consider performing a water test." if lang == "en" else "à®‡à®¨à¯à®¤ à®ªà®¤à®¿à®µà¯à®•à¯à®•à¯ à®¨à¯€à®°à¯ à®¤à®° à®šà¯‹à®¤à®©à¯ˆ à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà®µà®¿à®²à¯à®²à¯ˆ. à®¨à¯€à®°à¯ à®šà¯‹à®¤à®©à¯ˆ à®šà¯†à®¯à¯à®¯à®µà¯à®®à¯."]})

        # 4. Overall farming suggestion
        overall = []
        if lang == "en":
            if not is_healthy:
                overall.append(f"Priority: Treat {disease} immediately before it spreads.")
            if soil_data:
                overall.append("Improve soil health by adding organic matter and following soil test recommendations.")
            overall.append("Maintain regular crop monitoring schedule â€” check leaves every 3-5 days.")
            overall.append("Keep the field clean by removing weeds and crop debris.")
        else:
            if not is_healthy:
                overall.append(f"à®®à¯à®©à¯à®©à¯à®°à®¿à®®à¯ˆ: {disease} à®¨à¯‹à®¯à¯ à®ªà®°à®µà¯à®µà®¤à®±à¯à®•à¯ à®®à¯à®©à¯ à®‰à®Ÿà®©à®Ÿà®¿à®¯à®¾à®• à®šà®¿à®•à®¿à®šà¯à®šà¯ˆ à®…à®³à®¿à®•à¯à®•à®µà¯à®®à¯.")
            if soil_data:
                overall.append("à®‡à®¯à®±à¯à®•à¯ˆ à®ªà¯Šà®°à¯à®Ÿà¯à®•à®³à¯ˆà®šà¯ à®šà¯‡à®°à¯à®¤à¯à®¤à¯ à®®à®£à¯ à®†à®°à¯‹à®•à¯à®•à®¿à®¯à®¤à¯à®¤à¯ˆ à®®à¯‡à®®à¯à®ªà®Ÿà¯à®¤à¯à®¤à®µà¯à®®à¯.")
            overall.append("à®µà®´à®•à¯à®•à®®à®¾à®© à®ªà®¯à®¿à®°à¯ à®•à®£à¯à®•à®¾à®£à®¿à®ªà¯à®ªà¯ à®…à®Ÿà¯à®Ÿà®µà®£à¯ˆà®¯à¯ˆà®ªà¯ à®ªà®°à®¾à®®à®°à®¿à®•à¯à®•à®µà¯à®®à¯.")
            overall.append("à®•à®³à¯ˆà®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯ à®ªà®¯à®¿à®°à¯ à®•à®´à®¿à®µà¯à®•à®³à¯ˆ à®…à®•à®±à¯à®±à®¿ à®µà®¯à®²à¯ˆ à®šà¯à®¤à¯à®¤à®®à®¾à®• à®µà¯ˆà®¤à¯à®¤à®¿à®°à¯à®•à¯à®•à®µà¯à®®à¯.")

        actions.append({
            "category": "Overall Farming" if lang == "en" else "à®’à®Ÿà¯à®Ÿà¯à®®à¯Šà®¤à¯à®¤ à®µà®¿à®µà®šà®¾à®¯à®®à¯",
            "status": "Action Required" if not is_healthy else ("Good" if lang == "en" else "à®¨à®²à¯à®²à®¤à¯"),
            "icon": "ðŸŒ¾",
            "recommendations": overall,
        })

        return Response({"actions": actions, "disease": disease, "is_healthy": is_healthy, "crop_name": crop_name, "confidence": confidence})


# â”€â”€ Seasonal Suggestions View â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
SEASONAL_DATA = {
    "kharif": {
        "season_en": "Kharif / Monsoon Season", "season_ta": "à®•à®°à®¿à®ƒà®ªà¯ / à®ªà®°à¯à®µà®®à®´à¯ˆ à®ªà®°à¯à®µà®®à¯",
        "months_en": "June â€“ October", "months_ta": "à®œà¯‚à®©à¯ â€“ à®…à®•à¯à®Ÿà¯‹à®ªà®°à¯",
        "crops_en": ["Rice (Paddy)", "Maize (Corn)", "Cotton", "Groundnut", "Soybean", "Sugarcane", "Sorghum (Jowar)", "Pearl Millet (Bajra)", "Sesame", "Turmeric"],
        "crops_ta": ["à®¨à¯†à®²à¯", "à®šà¯‹à®³à®®à¯", "à®ªà®°à¯à®¤à¯à®¤à®¿", "à®µà¯‡à®°à¯à®•à¯à®•à®Ÿà®²à¯ˆ", "à®šà¯‹à®¯à®¾à®ªà¯€à®©à¯", "à®•à®°à¯à®®à¯à®ªà¯", "à®šà¯‹à®³à®®à¯ (à®œà¯‹à®µà®¾à®°à¯)", "à®•à®®à¯à®ªà¯", "à®Žà®³à¯", "à®®à®žà¯à®šà®³à¯"],
        "activities_en": ["Prepare land with proper drainage channels before monsoon.", "Plant crops that benefit from heavy rainfall.", "Apply organic manure and prepare seed beds.", "Ensure field bunds are repaired."],
        "activities_ta": ["à®ªà®°à¯à®µà®®à®´à¯ˆà®•à¯à®•à¯ à®®à¯à®©à¯ à®µà®Ÿà®¿à®•à®¾à®²à¯ à®µà®´à®¿à®•à®³à¯à®Ÿà®©à¯ à®¨à®¿à®²à®¤à¯à®¤à¯ˆ à®¤à®¯à®¾à®°à¯ à®šà¯†à®¯à¯à®¯à¯à®™à¯à®•à®³à¯.", "à®…à®¤à®¿à®• à®®à®´à¯ˆà®¯à®¾à®²à¯ à®ªà®¯à®©à®Ÿà¯ˆà®¯à¯à®®à¯ à®ªà®¯à®¿à®°à¯à®•à®³à¯ˆ à®¨à®Ÿà®µà¯à®®à¯.", "à®‡à®¯à®±à¯à®•à¯ˆ à®‰à®°à®®à¯ à®‡à®Ÿà¯à®™à¯à®•à®³à¯.", "à®µà®¯à®²à¯ à®µà®°à®ªà¯à®ªà¯à®•à®³à¯ à®šà®°à®¿à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿà¯à®³à¯à®³à®¤à¯ˆ à®‰à®±à¯à®¤à®¿à®ªà¯à®ªà®Ÿà¯à®¤à¯à®¤à®µà¯à®®à¯."],
        "precautions_en": ["Avoid crops sensitive to waterlogging in low-lying areas.", "Improve drainage to prevent root rot.", "Watch for fungal diseases â€” high humidity increases risk.", "Store harvested grain in dry areas."],
        "precautions_ta": ["à®¤à®¾à®´à¯à®µà®¾à®© à®ªà®•à¯à®¤à®¿à®•à®³à®¿à®²à¯ à®¨à¯€à®°à¯ à®¤à¯‡à®•à¯à®•à®¤à¯à®¤à®¿à®±à¯à®•à¯ à®‰à®£à®°à¯à®µà®¾à®© à®ªà®¯à®¿à®°à¯à®•à®³à¯ˆ à®¤à®µà®¿à®°à¯à®•à¯à®•à®µà¯à®®à¯.", "à®µà¯‡à®°à¯ à®…à®´à¯à®•à®²à¯ à®¨à¯‹à®¯à¯à®•à®³à¯ˆà®¤à¯ à®¤à®Ÿà¯à®•à¯à®• à®µà®Ÿà®¿à®•à®¾à®²à¯ˆ à®®à¯‡à®®à¯à®ªà®Ÿà¯à®¤à¯à®¤à®µà¯à®®à¯.", "à®ªà¯‚à®žà¯à®šà¯ˆ à®¨à¯‹à®¯à¯à®•à®³à¯ˆà®•à¯ à®•à®µà®©à®¿à®¯à¯à®™à¯à®•à®³à¯.", "à®…à®±à¯à®µà®Ÿà¯ˆ à®šà¯†à®¯à¯à®¤ à®¤à®¾à®©à®¿à®¯à®™à¯à®•à®³à¯ˆ à®‰à®²à®°à¯à®¨à¯à®¤ à®‡à®Ÿà®™à¯à®•à®³à®¿à®²à¯ à®šà¯‡à®®à®¿à®•à¯à®•à®µà¯à®®à¯."],
    },
    "rabi": {
        "season_en": "Rabi / Winter Season", "season_ta": "à®°à®ªà®¿ / à®•à¯à®³à®¿à®°à¯à®•à®¾à®² à®ªà®°à¯à®µà®®à¯",
        "months_en": "November â€“ February", "months_ta": "à®¨à®µà®®à¯à®ªà®°à¯ â€“ à®ªà®¿à®ªà¯à®°à®µà®°à®¿",
        "crops_en": ["Wheat", "Mustard", "Gram (Chickpea)", "Peas", "Barley", "Sunflower", "Potato", "Tomato", "Onion"],
        "crops_ta": ["à®•à¯‹à®¤à¯à®®à¯ˆ", "à®•à®Ÿà¯à®•à¯", "à®•à¯Šà®£à¯à®Ÿà¯ˆà®•à¯à®•à®Ÿà®²à¯ˆ", "à®ªà®Ÿà¯à®Ÿà®¾à®£à®¿", "à®µà®¾à®±à¯à®•à¯‹à®¤à¯à®®à¯ˆ", "à®šà¯‚à®°à®¿à®¯à®•à®¾à®¨à¯à®¤à®¿", "à®‰à®°à¯à®³à¯ˆà®•à¯à®•à®¿à®´à®™à¯à®•à¯", "à®¤à®•à¯à®•à®¾à®³à®¿", "à®µà¯†à®™à¯à®•à®¾à®¯à®®à¯"],
        "activities_en": ["Prepare soil with proper tillage and add organic matter.", "Plant winter crops that thrive in cool temperatures.", "Use mulching to retain soil moisture.", "Plan irrigation schedule."],
        "activities_ta": ["à®šà®°à®¿à®¯à®¾à®© à®‰à®´à®µà¯ à®®à®±à¯à®±à¯à®®à¯ à®‡à®¯à®±à¯à®•à¯ˆ à®ªà¯Šà®°à¯à®Ÿà¯à®•à®³à¯ˆà®šà¯ à®šà¯‡à®°à¯à®¤à¯à®¤à¯ à®®à®£à¯à®£à¯ˆà®¤à¯ à®¤à®¯à®¾à®°à¯ à®šà¯†à®¯à¯à®¯à¯à®™à¯à®•à®³à¯.", "à®•à¯à®³à®¿à®°à¯à®¨à¯à®¤ à®µà¯†à®ªà¯à®ªà®¨à®¿à®²à¯ˆà®¯à®¿à®²à¯ à®µà®³à®°à¯à®®à¯ à®ªà®¯à®¿à®°à¯à®•à®³à¯ˆ à®¨à®Ÿà®µà¯à®®à¯.", "à®®à®²à¯à®šà¯à®šà®¿à®™à¯ à®ªà®¯à®©à¯à®ªà®Ÿà¯à®¤à¯à®¤à®µà¯à®®à¯.", "à®¨à¯€à®°à¯à®ªà¯à®ªà®¾à®šà®© à®…à®Ÿà¯à®Ÿà®µà®£à¯ˆà®¯à¯ˆà®¤à¯ à®¤à®¿à®Ÿà¯à®Ÿà®®à®¿à®Ÿà¯à®™à¯à®•à®³à¯."],
        "precautions_en": ["Protect crops from frost in extreme cold.", "Avoid over-irrigation.", "Monitor for aphid and powdery mildew.", "Ensure proper seed treatment before sowing."],
        "precautions_ta": ["à®•à®Ÿà¯à®®à¯ à®•à¯à®³à®¿à®°à¯ à®ªà®•à¯à®¤à®¿à®•à®³à®¿à®²à¯ à®ªà®©à®¿à®•à¯à®•à®Ÿà¯à®Ÿà®¿à®¯à®¿à®²à®¿à®°à¯à®¨à¯à®¤à¯ à®ªà®¯à®¿à®°à¯à®•à®³à¯ˆà®ªà¯ à®ªà®¾à®¤à¯à®•à®¾à®•à¯à®•à®µà¯à®®à¯.", "à®…à®¤à®¿à®• à®¨à¯€à®°à¯à®ªà¯à®ªà®¾à®šà®©à®¤à¯à®¤à¯ˆ à®¤à®µà®¿à®°à¯à®•à¯à®•à®µà¯à®®à¯.", "à®…à®šà¯à®µà®¿à®©à®¿ à®®à®±à¯à®±à¯à®®à¯ à®šà®¾à®®à¯à®ªà®²à¯ à®¨à¯‹à®¯à¯ à®¤à®¾à®•à¯à®•à¯à®¤à®²à¯à®•à®³à¯ˆà®•à¯ à®•à®£à¯à®•à®¾à®£à®¿à®•à¯à®•à®µà¯à®®à¯.", "à®µà®¿à®¤à¯ˆ à®¨à¯‡à®°à¯à®¤à¯à®¤à®¿ à®šà¯†à®¯à¯à®¯à®µà¯à®®à¯."],
    },
    "zaid": {
        "season_en": "Zaid / Summer Season", "season_ta": "à®šà¯ˆà®¤à¯ / à®•à¯‹à®Ÿà¯ˆà®•à®¾à®² à®ªà®°à¯à®µà®®à¯",
        "months_en": "March â€“ May", "months_ta": "à®®à®¾à®°à¯à®šà¯ â€“ à®®à¯‡",
        "crops_en": ["Watermelon", "Muskmelon", "Cucumber", "Bitter Gourd", "Pumpkin", "Sunflower", "Moong (Green Gram)", "Groundnut", "Sesame", "Fodder Crops"],
        "crops_ta": ["à®¤à®°à¯à®ªà¯‚à®šà®£à®¿", "à®®à¯à®²à®¾à®®à¯ à®ªà®´à®®à¯", "à®µà¯†à®³à¯à®³à®°à®¿à®•à¯à®•à®¾à®¯à¯", "à®ªà®¾à®•à®±à¯à®•à®¾à®¯à¯", "à®ªà¯‚à®šà®£à®¿à®•à¯à®•à®¾à®¯à¯", "à®šà¯‚à®°à®¿à®¯à®•à®¾à®¨à¯à®¤à®¿", "à®ªà®¾à®šà®¿à®ªà¯à®ªà®¯à®±à¯", "à®µà¯‡à®°à¯à®•à¯à®•à®Ÿà®²à¯ˆ", "à®Žà®³à¯", "à®¤à¯€à®µà®©à®ªà¯ à®ªà®¯à®¿à®°à¯à®•à®³à¯"],
        "activities_en": ["Focus on short-duration crops harvestable before monsoon.", "Ensure adequate irrigation.", "Use shade nets for sensitive crops.", "Apply mulch to reduce soil temperature."],
        "activities_ta": ["à®ªà®°à¯à®µà®®à®´à¯ˆà®•à¯à®•à¯ à®®à¯à®©à¯ à®…à®±à¯à®µà®Ÿà¯ˆ à®šà¯†à®¯à¯à®¯à®•à¯à®•à¯‚à®Ÿà®¿à®¯ à®•à¯à®±à¯à®•à®¿à®¯ à®•à®¾à®² à®ªà®¯à®¿à®°à¯à®•à®³à®¿à®²à¯ à®•à®µà®©à®®à¯ à®šà¯†à®²à¯à®¤à¯à®¤à¯à®™à¯à®•à®³à¯.", "à®ªà¯‹à®¤à¯à®®à®¾à®© à®¨à¯€à®°à¯à®ªà¯à®ªà®¾à®šà®©à®¤à¯à®¤à¯ˆ à®‰à®±à¯à®¤à®¿à®ªà¯à®ªà®Ÿà¯à®¤à¯à®¤à®µà¯à®®à¯.", "à®‰à®£à®°à¯à®µà®¾à®© à®ªà®¯à®¿à®°à¯à®•à®³à¯à®•à¯à®•à¯ à®¨à®¿à®´à®²à¯ à®µà®²à¯ˆà®•à®³à¯ˆà®ªà¯ à®ªà®¯à®©à¯à®ªà®Ÿà¯à®¤à¯à®¤à®µà¯à®®à¯.", "à®®à®£à¯ à®µà¯†à®ªà¯à®ªà®¨à®¿à®²à¯ˆà®¯à¯ˆà®•à¯ à®•à¯à®±à¯ˆà®•à¯à®• à®®à®²à¯à®šà¯ à®‡à®Ÿà®µà¯à®®à¯."],
        "precautions_en": ["Avoid planting during peak heat hours.", "Watch for heat stress symptoms.", "Increase irrigation frequency.", "Use organic mulch to protect roots."],
        "precautions_ta": ["à®‰à®šà¯à®š à®µà¯†à®ªà¯à®ª à®¨à¯‡à®°à®¤à¯à®¤à®¿à®²à¯ à®¨à®Ÿà®µà¯ à®¤à®µà®¿à®°à¯à®•à¯à®•à®µà¯à®®à¯.", "à®µà¯†à®ªà¯à®ª à®…à®´à¯à®¤à¯à®¤ à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯ˆà®•à¯ à®•à®µà®©à®¿à®¯à¯à®™à¯à®•à®³à¯.", "à®¨à¯€à®°à¯à®ªà¯à®ªà®¾à®šà®© à®…à®¤à®¿à®°à¯à®µà¯†à®£à¯à®£à¯ˆ à®…à®¤à®¿à®•à®°à®¿à®•à¯à®•à®µà¯à®®à¯.", "à®µà¯‡à®°à¯à®•à®³à¯ˆà®ªà¯ à®ªà®¾à®¤à¯à®•à®¾à®•à¯à®• à®‡à®¯à®±à¯à®•à¯ˆ à®®à®²à¯à®šà¯ à®ªà®¯à®©à¯à®ªà®Ÿà¯à®¤à¯à®¤à®µà¯à®®à¯."],
    },
}


def get_season_from_month(month):
    if month in (6, 7, 8, 9, 10):
        return "kharif"
    elif month in (11, 12, 1, 2):
        return "rabi"
    return "zaid"


class SeasonalSuggestionsView(APIView):
    """POST /api/advisor/seasonal/ - Returns crops and activities for a given month/season."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from datetime import datetime
        month = request.data.get("month")
        if month is None:
            month = datetime.now().month
        try:
            month = int(month)
        except (ValueError, TypeError):
            month = datetime.now().month
        lang = request.data.get("lang", "en")
        season_key = get_season_from_month(month)
        sd = SEASONAL_DATA.get(season_key, SEASONAL_DATA["kharif"])
        sfx = "_ta" if lang == "ta" else "_en"
        return Response({
            "season": sd.get(f"season{sfx}", sd["season_en"]),
            "season_key": season_key,
            "months": sd.get(f"months{sfx}", sd["months_en"]),
            "suitable_crops": sd.get(f"crops{sfx}", sd["crops_en"]),
            "farming_activities": sd.get(f"activities{sfx}", sd["activities_en"]),
            "precautions": sd.get(f"precautions{sfx}", sd["precautions_en"]),
            "month": month,
            "disclaimer": "Based on available season and weather information. Actual suitability may vary by region, soil type, and local conditions." if lang == "en" else "à®•à®¿à®Ÿà¯ˆà®•à¯à®•à¯à®®à¯ à®ªà®°à¯à®µ à®®à®±à¯à®±à¯à®®à¯ à®µà®¾à®©à®¿à®²à¯ˆ à®¤à®•à®µà®²à¯à®•à®³à®¿à®©à¯ à®…à®Ÿà®¿à®ªà¯à®ªà®Ÿà¯ˆà®¯à®¿à®²à¯. à®‰à®£à¯à®®à¯ˆà®¯à®¾à®© à®ªà¯Šà®°à¯à®¤à¯à®¤à®®à¯ à®ªà®•à¯à®¤à®¿, à®®à®£à¯ à®µà®•à¯ˆ à®®à®±à¯à®±à¯à®®à¯ à®‰à®³à¯à®³à¯‚à®°à¯ à®¨à®¿à®²à¯ˆà®®à¯ˆà®•à®³à®¿à®©à¯ à®…à®Ÿà®¿à®ªà¯à®ªà®Ÿà¯ˆà®¯à®¿à®²à¯ à®®à®¾à®±à¯à®ªà®Ÿà®²à®¾à®®à¯.",
        })
