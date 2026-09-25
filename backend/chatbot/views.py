"""
chatbot/views.py
SmartCrop chatbot with rule-based farming guidance and server-side OpenAI fallback.
"""
import os
import re

from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover
    OpenAI = None


# ── Intent Patterns ─────────────────────────────────────────────────────────────
INTENTS = [
    {
        "name": "what_today",
        "patterns": [r"what.*do.*today", r"today.*action", r"today.*plan", r"what.*should.*do"],
        "response": lambda ctx: ("**Today's Action Plan:**\n\n"
                                  "1. 🔍 **Field Inspection:** Check crop foliage for early disease spots or pest signs.\n"
                                  "2. 💧 **Irrigation Check:** Water early morning if top 3cm of soil is dry; hold off if rain is expected.\n"
                                  "3. 🌿 **Nutrient Management:** Top-dress organic compost if crop is in vegetative/flowering stage.\n"
                                  "4. 🌤️ Check the **Farming Planner** page for your full 14-day weather-based schedule."),
    },
    {
        "name": "irrigate_today",
        "patterns": [r"can.*irrigate.*today", r"should.*irrigate.*today", r"water.*today"],
        "response": lambda ctx: ("**Irrigation Guidance for Today:**\n\n"
                                  "• If rain is forecast in the next 24 hours: **Hold off on irrigation** to avoid waterlogging.\n"
                                  "• If weather is hot & dry: **Irrigate early in the morning (6–8 AM)**.\n"
                                  "• Check soil: Stick your finger 5 cm into soil. If moist, wait another day."),
    },
    {
        "name": "crop_for_soil",
        "patterns": [r"suitable.*soil", r"crop.*soil", r"which.*crop.*soil", r"soil.*crop"],
        "response": lambda ctx: ("**Soil & Crop Match:**\n\n"
                                  "• **Sandy Soil:** Groundnut, Potato, Watermelon, Cassava (needs organic compost)\n"
                                  "• **Clay Soil:** Rice, Wheat, Sugarcane (needs good drainage)\n"
                                  "• **Loam Soil:** Tomato, Maize, Vegetables, Cotton (ideal for almost all crops)\n\n"
                                  "📌 Visit the **Soil Monitoring** page to enter your exact pH, NPK, and soil type for a customized analysis!"),
    },
    {
        "name": "crop_for_water",
        "patterns": [r"suitable.*water", r"crop.*water", r"which.*crop.*water", r"water.*grow"],
        "response": lambda ctx: ("**Water Quality & Crop Selection:**\n\n"
                                  "• **Fresh Water (TDS < 500 ppm):** Excellent for all crops (Tomato, Maize, Rice, Vegetables)\n"
                                  "• **Moderate Salinity (TDS 500–1500 ppm):** Rice, Wheat, Maize, Groundnut\n"
                                  "• **High Salinity (TDS 1500–3000 ppm):** Cotton, Barley, Sugarcane, Sugarbeet\n\n"
                                  "📌 Visit the **Water Quality Analysis** page to test your TDS, pH, and EC values!"),
    },
    {
        "name": "yellow_leaves",
        "patterns": [r"yellow.*lea", r"lea.*yellow", r"yellowing", r"leaves.*turn.*yellow"],
        "response": lambda ctx: yellow_leaves_response(ctx),
    },
    {
        "name": "spots_on_leaves",
        "patterns": [r"spot.*lea", r"lea.*spot", r"brown.*spot", r"spot.*brown", r"marks.*lea"],
        "response": lambda ctx: spots_response(ctx),
    },
    {
        "name": "when_to_water",
        "patterns": [r"when.*water", r"water.*when", r"irrigat", r"when.*irrigat", r"should.*water"],
        "response": lambda ctx: irrigation_response(ctx),
    },
    {
        "name": "early_blight",
        "patterns": [r"early.?blight", r"alternaria"],
        "response": lambda ctx: ("**Early Blight** is a fungal disease caused by Alternaria solani. "
                                  "You'll see dark brown spots with concentric rings (like a target board) on lower leaves.\n\n"
                                  "**Treatment:**\n"
                                  "• Organic: Spray Copper Oxychloride (3 g/L) every 7–10 days\n"
                                  "• Chemical: Apply Chlorothalonil or Mancozeb (2–2.5 g/L)\n\n"
                                  "**Prevention:** Remove infected leaves, improve air circulation, avoid overhead watering."),
    },
    {
        "name": "late_blight",
        "patterns": [r"late.?blight", r"phytophthora"],
        "response": lambda ctx: ("**Late Blight** is a very serious disease caused by Phytophthora infestans. "
                                  "It can destroy an entire crop within days in cool, wet weather.\n\n"
                                  "**Treatment:**\n"
                                  "• Organic: Copper Hydroxide (Kocide) 3 g/L, spray every 5–7 days\n"
                                  "• Chemical: Metalaxyl + Mancozeb (Ridomil Gold) 2.5 g/L\n\n"
                                  "**Action:** Remove and BURN infected plants immediately. Do not compost them."),
    },
    {
        "name": "rain_advice",
        "patterns": [r"rain.*day", r"day.*rain", r"going.*rain", r"forecast.*rain", r"rain.*forecast",
                     r"rain.*tomorrow", r"tomorrow.*rain", r"rain.*week"],
        "response": lambda ctx: rain_advice_response(ctx),
    },
    {
        "name": "spray_fertilizer",
        "patterns": [r"spray.*fertiliz", r"fertiliz.*spray", r"spray.*tomorrow", r"can.*spray",
                     r"foliar.*spray", r"when.*spray", r"spray.*when"],
        "response": lambda ctx: spray_response(ctx),
    },
    {
        "name": "organic_treatment",
        "patterns": [r"organic.*treatment", r"treatment.*organic", r"natural.*treatment",
                     r"natural.*remedy", r"organic.*spray", r"neem"],
        "response": lambda ctx: organic_response(ctx),
    },
    {
        "name": "fertilizer",
        "patterns": [r"fertiliz", r"npk", r"urea", r"compost", r"manure", r"what.*fertiliz"],
        "response": lambda ctx: fertilizer_response(ctx),
    },
    {
        "name": "crop_growth",
        "patterns": [r"improve.*growth", r"growth.*improve", r"faster.*grow", r"grow.*faster",
                     r"better.*yield", r"yield.*better", r"increase.*yield"],
        "response": lambda ctx: ("To improve crop growth, focus on these key areas:\n\n"
                                  "🌱 **Soil Health:** Apply compost or farmyard manure before planting.\n"
                                  "💧 **Irrigation:** Keep soil consistently moist — not waterlogged.\n"
                                  "🧪 **Nutrition:** Use balanced NPK fertilizer based on a soil test.\n"
                                  "☀️ **Light:** Ensure proper plant spacing for maximum sunlight.\n"
                                  "🐛 **Pest & Disease Control:** Scout weekly and act early.\n\n"
                                  "Visit the **Crop Growth** section for detailed crop-specific recommendations including organic and chemical options."),
    },
    {
        "name": "identify_disease",
        "patterns": [r"what.*disease", r"identify.*disease", r"what.*wrong.*crop",
                     r"what.*wrong.*plant", r"diagnos", r"leaf.*problem"],
        "response": lambda ctx: ("To identify a crop disease accurately:\n\n"
                                  "📸 **Upload an image** of the affected leaf using the **Predict Disease** feature.\n\n"
                                  "The AI will analyze the image and identify the disease with confidence percentage. "
                                  "Common visual signs to look for:\n"
                                  "• Brown/black spots → Blight or Alternaria\n"
                                  "• Yellow leaves → Nutrient deficiency, virus, or root issues\n"
                                  "• White powder → Powdery mildew\n"
                                  "• Water-soaked patches → Late blight\n\n"
                                  "📌 **Upload a clear, close-up photo of the affected leaf in good natural light for best results.**"),
    },
    {
        "name": "weather_advice",
        "patterns": [r"weather", r"temperature", r"humidity", r"forecast", r"climate"],
        "response": lambda ctx: weather_chat_response(ctx),
    },
    {
        "name": "pest_help",
        "patterns": [r"pest", r"insect", r"aphid", r"whitefl", r"caterpillar", r"worm", r"mite"],
        "response": lambda ctx: ("**Pest Management Tips:**\n\n"
                                  "🔍 **Identify the pest first** — different pests need different treatments.\n\n"
                                  "**Common pests and organic solutions:**\n"
                                  "• **Aphids:** Neem oil spray (5 mL/L) or strong water jet\n"
                                  "• **Whiteflies:** Yellow sticky traps + Neem oil spray\n"
                                  "• **Caterpillars/Worms:** BT (Bacillus thuringiensis) spray\n"
                                  "• **Spider Mites:** Neem oil + insecticidal soap, increase humidity\n\n"
                                  "⚠️ If organic methods fail, consult your local agricultural officer for approved chemical options in your region."),
    },
    {
        "name": "greeting",
        "patterns": [r"^hi$", r"^hello$", r"^hey$", r"good morning", r"good evening", r"help"],
        "response": lambda ctx: (f"Hello! 👋 I'm your SmartCrop AI Farming Assistant.\n\n"
                                  "I can help you with:\n"
                                  "🌿 **Disease identification and treatment**\n"
                                  "💧 **Irrigation advice**\n"
                                  "🌤️ **Weather-based farming recommendations**\n"
                                  "🌱 **Crop growth improvement tips**\n"
                                  "🐛 **Pest management**\n"
                                  "🧪 **Fertilizer recommendations**\n\n"
                                  "What would you like help with today? You can ask me anything about your crops!"),
    },
]


def yellow_leaves_response(ctx: dict) -> str:
    latest = ctx.get("latest_prediction")
    base = ("**Yellow leaves** can have several causes:\n\n"
            "1. **Nutrient Deficiency** (most common)\n"
            "   • Nitrogen: Older lower leaves turn yellow first\n"
            "   • Iron/Manganese: New leaves turn yellow (interveinal chlorosis)\n"
            "   → Apply balanced fertilizer or chelated iron spray\n\n"
            "2. **Overwatering** — Roots rot and cannot absorb nutrients\n"
            "   → Reduce watering, improve drainage\n\n"
            "3. **Viral Disease** (e.g., Tomato Yellow Leaf Curl Virus)\n"
            "   → Control whitefly insects which spread the virus\n\n"
            "4. **Root Disease** — Check roots for brown/black rot\n\n"
            "📸 **For accurate diagnosis, upload a photo** in the Predict Disease section.")
    if latest and "mosaic" in latest.lower():
        base += f"\n\n💡 Your latest prediction was **{latest}** — virus-related yellowing is possible."
    return base


def spots_response(ctx: dict) -> str:
    latest = ctx.get("latest_prediction")
    base = ("**Spots on leaves** are usually caused by fungal or bacterial diseases.\n\n"
            "Common causes by spot appearance:\n"
            "• **Dark brown with rings** (target pattern) → Early Blight (Alternaria)\n"
            "• **Water-soaked, then black** → Late Blight (Phytophthora)\n"
            "• **Small yellow/brown spots with halos** → Bacterial Spot\n"
            "• **Purple spots** → Leaf Scorch or Septoria\n\n"
            "**First step:** Remove and do NOT compost affected leaves.\n\n"
            "📸 Upload a clear photo of the spotted leaf to the **Predict Disease** section for accurate AI diagnosis.")
    if latest:
        base += f"\n\n💡 Your most recent diagnosis was **{latest}** — check if the symptoms match."
    return base


def irrigation_response(ctx: dict) -> str:
    weather = ctx.get("weather_summary")
    base = ("**Irrigation Guidelines:**\n\n"
            "General rules:\n"
            "• Water in the **early morning** — reduces evaporation and fungal disease risk\n"
            "• Avoid waterlogging — ensure good drainage\n"
            "• Use **drip irrigation** when possible for water efficiency\n"
            "• Check soil moisture before watering — stick finger 5 cm into soil\n\n"
            "**Crop-specific needs:**\n"
            "• Tomato: Consistent moisture — irregular watering causes blossom end rot\n"
            "• Potato: Critical during tuber initiation and bulking stages\n"
            "• Corn: Critical at tasseling and silking stages")
    if weather:
        base += f"\n\n🌤️ **Current weather note:** {weather}"
    return base


def rain_advice_response(ctx: dict) -> str:
    weather = ctx.get("weather_summary")
    base = ("**When rain is expected:**\n\n"
            "✅ **DO:**\n"
            "• Delay irrigation — rain will provide moisture\n"
            "• Apply preventive fungicide BEFORE rain (dry days preceding rain are best)\n"
            "• Ensure drainage channels are clear\n"
            "• Harvest mature crops before heavy rain if possible\n\n"
            "❌ **DON'T:**\n"
            "• Spray pesticides or fertilizers just before or during rain (gets washed off)\n"
            "• Apply fertilizer during heavy rain (leaching risk)\n"
            "• Leave freshly transplanted seedlings without shade netting in heavy rain")
    if weather:
        base += f"\n\n🌤️ **Weather summary:** {weather}"
    return base


def spray_response(ctx: dict) -> str:
    weather = ctx.get("weather_summary")
    base = ("**Best Conditions for Spraying:**\n\n"
            "✅ **Spray when:**\n"
            "• Wind speed is below 15–20 km/h\n"
            "• No rain forecast for the next 4–6 hours\n"
            "• Early morning (6–9 AM) or late evening (4–7 PM)\n"
            "• Temperature below 30°C\n"
            "• Humidity between 40–70%\n\n"
            "❌ **Do NOT spray when:**\n"
            "• Strong wind (drift risk)\n"
            "• Rain expected (washes off product)\n"
            "• Midday heat (rapid evaporation, plant stress)\n"
            "• Temperature above 35°C (phytotoxicity risk with some products)")
    if weather:
        base += f"\n\n🌤️ **Weather:** {weather}"
    base += "\n\n💡 Check the **Weather Advisor** page for specific spray-suitable days in your location."
    return base


def organic_response(ctx: dict) -> str:
    latest = ctx.get("latest_prediction")
    base = ("**Organic Treatment Options:**\n\n"
            "🌿 **General organic sprays for fungal diseases:**\n"
            "• **Copper Oxychloride** (3 g/L) — for blight, spot diseases\n"
            "• **Bordeaux Mixture** (copper sulphate + lime) — broad spectrum\n"
            "• **Neem Oil** (5 mL/L + soap) — fungal + insect control\n"
            "• **Potassium Bicarbonate** (5 g/L) — powdery mildew\n\n"
            "🐛 **For insects:**\n"
            "• Neem oil spray\n"
            "• BT (Bacillus thuringiensis) for caterpillars\n"
            "• Insecticidal soap for soft-bodied pests\n\n"
            "🌱 **For soil health:**\n"
            "• Compost and vermicompost\n"
            "• Trichoderma biofungicide for soil-borne diseases")
    if latest:
        base += f"\n\n💡 Based on your latest prediction (**{latest}**), check the **Predict Results** page for specific organic treatment recommendations for this disease."
    return base


def fertilizer_response(ctx: dict) -> str:
    return ("**Fertilizer Recommendations:**\n\n"
            "🌱 **Starter (Planting):** NPK 19:19:19 or DAP for root development\n"
            "🍃 **Vegetative Growth:** High nitrogen — Urea or ammonium nitrate\n"
            "🌸 **Flowering:** Reduce N, increase P and K — NPK 12:32:16\n"
            "🍎 **Fruiting:** High K fertilizer (Potassium Sulphate)\n\n"
            "⚠️ **Important:**\n"
            "• Always conduct a soil test before fertilizing\n"
            "• Follow product label dosage strictly\n"
            "• Excess fertilizer can burn roots and pollute groundwater\n"
            "• Apply in split doses for better uptake\n\n"
            "📌 Visit the **Crop Growth** section for crop-specific fertilizer schedules.")


def weather_chat_response(ctx: dict) -> str:
    weather = ctx.get("weather_summary")
    base = "🌤️ **Weather-Based Farming Advice:**\n\nVisit the **Weather Advisor** page to see 14-day forecast with specific farming recommendations for your location."
    if weather:
        base += f"\n\n**Current summary:** {weather}"
    return base


def find_intent(message: str) -> dict | None:
    msg_lower = message.lower()
    for intent in INTENTS:
        for pattern in intent["patterns"]:
            if re.search(pattern, msg_lower):
                return intent
    return None


def generate_ai_reply(message: str, ctx: dict) -> str | None:
    api_key = getattr(settings, 'OPENAI_API_KEY', '') or os.environ.get('OPENAI_API_KEY', '')
    if not api_key or OpenAI is None:
        return None

    latest_prediction = ctx.get('latest_prediction')
    latest_crop = ctx.get('latest_crop')
    weather_summary = ctx.get('weather_summary', 'No weather summary available.')

    system_prompt = (
        "You are SmartCrop AI, a helpful agricultural assistant for farmers. "
        "Respond in a practical, supportive way. Support English, Tamil, Tanglish, and mixed Tamil-English. "
        "When the user asks general questions, answer normally. When the question is about crops, disease, irrigation, weather, or farming, "
        "give specific and actionable guidance based on the user's farming context. "
        "Keep answers concise but useful, and avoid making up unsupported medical or regulatory claims."
    )

    user_prompt = (
        f"User question: {message}\n\n"
        f"Latest crop prediction: {latest_prediction or 'No recent crop diagnosis'}\n"
        f"Latest crop type: {latest_crop or 'Unknown'}\n"
        f"Weather context: {weather_summary}\n\n"
        "Answer like a knowledgeable farm advisor, in a friendly tone."
    )

    try:
        client = OpenAI(api_key=api_key)
        completion = client.chat.completions.create(
            model=getattr(settings, 'OPENAI_MODEL', 'gpt-4o-mini'),
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt},
            ],
            temperature=0.5,
            max_tokens=300,
        )
        content = completion.choices[0].message.content.strip()
        return content if content else None
    except Exception:
        return None


class ChatbotView(APIView):
    """
    POST /api/chatbot/message/
    Body: { "message": "...", "context": {...} }
    Returns: { "reply": "...", "suggestions": [...] }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        message = request.data.get("message", "").strip()
        if not message:
            return Response({"error": "Please enter a message."}, status=status.HTTP_400_BAD_REQUEST)

        if len(message) > 500:
            return Response({"error": "Message too long. Please keep it under 500 characters."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Build context from user's data
        from disease.models import DiseasePrediction
        ctx = {}

        try:
            latest = DiseasePrediction.objects.filter(user=request.user).latest('created_at')
            ctx["latest_prediction"] = latest.predicted_disease
            ctx["latest_confidence"] = f"{latest.confidence * 100:.1f}%"
            ctx["latest_crop"] = latest.crop_name
        except DiseasePrediction.DoesNotExist:
            pass

        weather_context = request.data.get("context", {}).get("weather_summary")
        if weather_context:
            ctx["weather_summary"] = weather_context

        ai_reply = generate_ai_reply(message, ctx)
        if ai_reply:
            reply = ai_reply
        else:
            # Find matching intent
            intent = find_intent(message)

            if intent:
                response_fn = intent["response"]
                reply = response_fn(ctx) if callable(response_fn) else response_fn
            else:
                # Fallback response
                reply = (
                    "I'm not sure I understood that question. Here are some things I can help with:\n\n"
                    "• **Disease help:** 'What is early blight?' or 'My tomato has spots'\n"
                    "• **Watering advice:** 'When should I water my crops?'\n"
                    "• **Weather guidance:** 'It will rain for 3 days, what should I do?'\n"
                    "• **Treatment options:** 'What organic treatment can I use?'\n"
                    "• **Growth tips:** 'How can I improve my crop yield?'\n\n"
                    "📸 For disease identification, please **upload a leaf photo** in the Predict Disease section."
                )
                if ctx.get("latest_prediction"):
                    reply += f"\n\n💡 Your latest diagnosis: **{ctx['latest_prediction']}** ({ctx.get('latest_confidence', '')})"

        # Generate smart quick-reply suggestions
        suggestions = generate_suggestions(message, ctx)

        return Response({
            "reply": reply,
            "suggestions": suggestions,
            "user_context": {
                "latest_prediction": ctx.get("latest_prediction"),
                "latest_crop": ctx.get("latest_crop"),
            }
        })


def generate_suggestions(message: str, ctx: dict) -> list:
    """Generate contextual quick-reply suggestions."""
    suggestions = []
    msg_lower = message.lower()

    if ctx.get("latest_prediction") and not ctx["latest_prediction"].endswith("Healthy"):
        disease = ctx["latest_prediction"]
        crop = ctx.get("latest_crop", "")
        suggestions.append(f"What is the organic treatment for {disease}?")
        suggestions.append(f"How to prevent {disease} next season?")

    if "water" in msg_lower or "irrigat" in msg_lower:
        suggestions.append("Can I spray fertilizer tomorrow?")
        suggestions.append("What are the best irrigation practices?")
    elif "spray" in msg_lower or "fertiliz" in msg_lower:
        suggestions.append("What fertilizer should I use for tomatoes?")
        suggestions.append("How to improve crop growth organically?")
    elif "rain" in msg_lower:
        suggestions.append("When is the best time to spray?")
        suggestions.append("How to prevent fungal disease in humid weather?")

    # Always add general suggestions if list is short
    fallback = [
        "How can I improve crop growth?",
        "What is early blight?",
        "How do I know when to irrigate?",
    ]
    for s in fallback:
        if s not in suggestions and len(suggestions) < 4:
            suggestions.append(s)

    return suggestions[:4]
