import { useState, useRef, useEffect } from 'react';
import { chatbotAPI, diseaseAPI } from '../services/api';

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! 👋 I'm your SmartCrop AI Farming Assistant. Ask me anything about crop diseases, watering, weather, fertilizer, or growth tips!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([
    "Why are my tomato leaves turning yellow?",
    "When should I water my potato crop?",
    "What organic treatment can I use?",
    "How can I improve crop growth?"
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input.trim();
    if (!text) return;

    if (!textToSend) setInput('');

    // Append User Message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const context = {
        weather_summary: "Showers expected. Fungal disease risk is Moderate."
      };
      const res = await chatbotAPI.sendMessage(text, context);
      
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: res.data.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
      if (res.data.suggestions && res.data.suggestions.length > 0) {
        setSuggestions(res.data.suggestions);
      }
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 2,
        sender: 'bot',
        text: "⚠️ Sorry, I'm having trouble connecting right now. Please try again.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0d1f0d', padding: '6rem 1.5rem 2rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', height: 'calc(100vh - 9rem)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ background: 'rgba(29,52,29,0.95)', border: '1px solid #2d5a27', borderRadius: '20px 20px 0 0', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '.75rem', borderBottom: '2px solid #2d5a27' }}>
          <div style={{ fontSize: '2rem' }}>🤖</div>
          <div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#7dd56f', fontWeight: 800, fontSize: '1.2rem', margin: 0 }}>SmartCrop Farming Assistant</h2>
            <span style={{ color: '#81c784', fontSize: '.75rem', display: 'flex', alignItems: 'center', gap: '.25rem' }}>
              <span style={{ width: 8, height: 8, background: '#4caf50', borderRadius: '50%', display: 'inline-block' }} /> Online Advisor
            </span>
          </div>
        </div>

        {/* Chat Window */}
        <div style={{ flex: 1, background: 'rgba(0,0,0,0.25)', borderLeft: '1px solid #2d5a27', borderRight: '1px solid #2d5a27', padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '75%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  background: msg.sender === 'user' ? 'linear-gradient(135deg, #4caf50, #2e7d32)' : 'rgba(29,52,29,0.9)',
                  color: '#e8f5e9',
                  borderRadius: msg.sender === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                  padding: '.85rem 1.1rem',
                  fontSize: '.92rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                  border: msg.sender === 'bot' ? '1px solid #2d5a27' : 'none'
                }}
              >
                {msg.text}
              </div>
              <span style={{ color: '#81c784', fontSize: '.7rem', marginTop: '.25rem' }}>{msg.time}</span>
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start', background: 'rgba(29,52,29,0.9)', border: '1px solid #2d5a27', borderRadius: '16px 16px 16px 0', padding: '.85rem 1.1rem', color: '#81c784', fontSize: '.9rem' }}>
              ⏳ Typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions & Input Area */}
        <div style={{ background: 'rgba(29,52,29,0.95)', border: '1px solid #2d5a27', borderRadius: '0 0 20px 20px', padding: '1.25rem', borderTop: 'none' }}>
          
          {/* Quick suggestions */}
          <div style={{ display: 'flex', gap: '.4rem', overflowX: 'auto', paddingBottom: '.75rem', marginBottom: '.5rem', flexWrap: 'wrap' }}>
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                style={{
                  background: 'rgba(0,0,0,0.3)', color: '#81c784',
                  border: '1px solid #2d5a27', borderRadius: 20,
                  padding: '.4rem 1rem', fontSize: '.8rem', cursor: 'pointer',
                  whiteSpace: 'nowrap', transition: 'all .2s'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(76,175,80,0.1)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(0,0,0,0.3)'}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            style={{ display: 'flex', gap: '.75rem' }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your crops..."
              style={{
                flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid #2d5a27',
                borderRadius: 12, padding: '.85rem 1.25rem', color: '#e8f5e9',
                fontSize: '.95rem', outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                background: loading || !input.trim() ? '#3a5a3a' : 'linear-gradient(135deg, #4caf50, #2e7d32)',
                color: '#fff', border: 'none', borderRadius: 12, padding: '0 1.5rem',
                fontWeight: 700, fontSize: '.95rem', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(76,175,80,0.2)'
              }}
            >
              Send 🚀
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
