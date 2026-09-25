import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LanguageContext';

export default function VoiceNavigation() {
  const { lang, setLang } = useLang();
  const navigate = useNavigate();

  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);

  // Check speech recognition API support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  // Voice feedback helper (TTS)
  const speakFeedback = (text, language) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'ta' ? 'ta-IN' : 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // SpeechSynthesis error ignored safely
    }
  };

  const showFeedback = (msg, duration = 3500) => {
    setFeedback(msg);
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback('');
    }, duration);
  };

  const showTempError = (msg, duration = 4000) => {
    setErrorMsg(msg);
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => {
      setErrorMsg('');
    }, duration);
  };

  // Process recognized voice command
  const handleCommand = (transcript) => {
    const text = transcript.toLowerCase().trim();

    // ── Global Language Switching Commands (works in any mode) ──
    if (
      text.includes('change language to tamil') ||
      text.includes('change to tamil') ||
      text.includes('switch to tamil') ||
      text.includes('set tamil') ||
      text.includes('tamil language') ||
      text.includes('தமிழ் மொழி') ||
      text.includes('தமிழுக்கு மாற்று') ||
      text.includes('தமிழ் மாற்று') ||
      text === 'tamil' ||
      text === 'தமிழ்'
    ) {
      setLang('ta');
      showFeedback('🌐 மொழி தமிழுக்கு மாற்றப்பட்டது');
      speakFeedback('மொழி தமிழுக்கு மாற்றப்பட்டது', 'ta');
      return;
    }

    if (
      text.includes('change language to english') ||
      text.includes('change to english') ||
      text.includes('switch to english') ||
      text.includes('set english') ||
      text.includes('english language') ||
      text.includes('ஆங்கிலத்திற்கு மாற்று') ||
      text.includes('ஆங்கில மொழி') ||
      text.includes('ஆங்கிலம் மாற்று') ||
      text === 'english' ||
      text === 'ஆங்கிலம்'
    ) {
      setLang('en');
      showFeedback('🌐 Language changed to English');
      speakFeedback('Language changed to English', 'en');
      return;
    }

    if (lang === 'ta') {
      // ── Tamil Navigation Commands ──
      if (text.includes('முகப்பு') || text.includes('ஹோம்') || text.includes('வீடு') || text.includes('முதல் பக்கம்')) {
        showFeedback('முகப்பு பக்கம் திறக்கப்படுகிறது...');
        speakFeedback('முகப்பு பக்கம் திறக்கப்படுகிறது', 'ta');
        navigate('/');
      } else if (text.includes('டாஷ்போர்டு') || text.includes('டாஷ்போர்ட்') || text.includes('கட்டுப்பாட்டகம்')) {
        showFeedback('டாஷ்போர்டு திறக்கப்படுகிறது...');
        speakFeedback('டாஷ்போர்டு திறக்கப்படுகிறது', 'ta');
        navigate('/dashboard');
      } else if (text.includes('மண்') || text.includes('மண் பரிசோதனை') || text.includes('மண் பகுப்பாய்வு')) {
        showFeedback('மண் பகுப்பாய்வு திறக்கப்படுகிறது...');
        speakFeedback('மண் பகுப்பாய்வு திறக்கப்படுகிறது', 'ta');
        navigate('/analyzer?tab=soil');
      } else if (text.includes('நீர்') || text.includes('தண்ணீர்') || text.includes('நீர் தரம்') || text.includes('பாசனம்')) {
        showFeedback('நீர் பகுப்பாய்வு திறக்கப்படுகிறது...');
        speakFeedback('நீர் பகுப்பாய்வு திறக்கப்படுகிறது', 'ta');
        navigate('/analyzer?tab=water');
      } else if (text.includes('பகுப்பாய்வி') || text.includes('பயிர் நோய்') || text.includes('நோய்') || text.includes('அனலைசர்') || text.includes('இலை')) {
        showFeedback('பயிர் நோய் பகுப்பாய்வி திறக்கப்படுகிறது...');
        speakFeedback('பயிர் நோய் பகுப்பாய்வி திறக்கப்படுகிறது', 'ta');
        navigate('/analyzer');
      } else if (text.includes('வானிலை') || text.includes('மழை') || text.includes('வெதர்') || text.includes('முன்னறிவிப்பு')) {
        showFeedback('வானிலை ஆலோசனை திறக்கப்படுகிறது...');
        speakFeedback('வானிலை ஆலோசனை திறக்கப்படுகிறது', 'ta');
        navigate('/weather');
      } else if (text.includes('திட்டமிடல்') || text.includes('வளர்ச்சி') || text.includes('பிளானர்') || text.includes('திட்டம்')) {
        showFeedback('விவசாய திட்டமிடல் திறக்கப்படுகிறது...');
        speakFeedback('விவசாய திட்டமிடல் திறக்கப்படுகிறது', 'ta');
        navigate('/planner');
      } else if (text.includes('அறிக்கை') || text.includes('ரிப்போர்ட்') || text.includes('பிடிஎப்')) {
        showFeedback('பயிர் அறிக்கை திறக்கப்படுகிறது...');
        speakFeedback('பயிர் அறிக்கை திறக்கப்படுகிறது', 'ta');
        navigate('/report');
      } else if (text.includes('வரலாறு') || text.includes('பழைய பதிவுகள்') || text.includes('ஹிஸ்டரி') || text.includes('பதிவு')) {
        showFeedback('அறிக்கை வரலாறு திறக்கப்படுகிறது...');
        speakFeedback('அறிக்கை வரலாறு திறக்கப்படுகிறது', 'ta');
        navigate('/report-history');
      } else if (text.includes('உதவியாளர்') || text.includes('சாட்பாட்') || text.includes('சாட்') || text.includes('உதவி')) {
        showFeedback('விவசாய உதவியாளர் திறக்கப்படுகிறது...');
        speakFeedback('விவசாய உதவியாளர் திறக்கப்படுகிறது', 'ta');
        navigate('/chatbot');
      } else {
        const notFoundMsg = `கட்டளை புரியவில்லை: "${transcript}"`;
        showFeedback(notFoundMsg);
        speakFeedback('மன்னிக்கவும், கட்டளை புரியவில்லை. மீண்டும் கூறவும்.', 'ta');
      }
    } else {
      // ── English Navigation Commands ──
      if (text.includes('home') || text.includes('main page') || text.includes('start')) {
        showFeedback('Opening Home...');
        speakFeedback('Opening Home', 'en');
        navigate('/');
      } else if (text.includes('dashboard') || text.includes('analytics') || text.includes('stats')) {
        showFeedback('Opening Dashboard...');
        speakFeedback('Opening Dashboard', 'en');
        navigate('/dashboard');
      } else if (text.includes('soil') || text.includes('soil analysis') || text.includes('soil quality')) {
        showFeedback('Opening Soil Analysis...');
        speakFeedback('Opening Soil Analysis', 'en');
        navigate('/analyzer?tab=soil');
      } else if (text.includes('water') || text.includes('water analysis') || text.includes('water quality') || text.includes('irrigation')) {
        showFeedback('Opening Water Quality...');
        speakFeedback('Opening Water Quality', 'en');
        navigate('/analyzer?tab=water');
      } else if (text.includes('analyzer') || text.includes('predict') || text.includes('disease') || text.includes('leaf') || text.includes('diagnosis')) {
        showFeedback('Opening Analyzer...');
        speakFeedback('Opening Analyzer', 'en');
        navigate('/analyzer');
      } else if (text.includes('weather') || text.includes('forecast') || text.includes('climate') || text.includes('rain')) {
        showFeedback('Opening Weather Advisor...');
        speakFeedback('Opening Weather Advisor', 'en');
        navigate('/weather');
      } else if (text.includes('planner') || text.includes('growth') || text.includes('crop plan') || text.includes('farming plan')) {
        showFeedback('Opening Farming Planner...');
        speakFeedback('Opening Farming Planner', 'en');
        navigate('/planner');
      } else if (text.includes('report history') || text.includes('past reports') || text.includes('history')) {
        showFeedback('Opening Report History...');
        speakFeedback('Opening Report History', 'en');
        navigate('/report-history');
      } else if (text.includes('report') || text.includes('generate report') || text.includes('pdf')) {
        showFeedback('Opening Report Generator...');
        speakFeedback('Opening Report Generator', 'en');
        navigate('/report');
      } else if (text.includes('chatbot') || text.includes('assistant') || text.includes('help') || text.includes('chat') || text.includes('ai')) {
        showFeedback('Opening AI Assistant...');
        speakFeedback('Opening AI Assistant', 'en');
        navigate('/chatbot');
      } else {
        const notFoundMsg = `Command not recognized: "${transcript}"`;
        showFeedback(notFoundMsg);
        speakFeedback('Command not recognized. Please try again.', 'en');
      }
    }
  };

  const startListening = () => {
    setErrorMsg('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showTempError(
        lang === 'ta'
          ? 'இந்த உலாவியில் குரல் வழிசெலுத்தல் ஆதரிக்கப்படவில்லை. Chrome/Edge உலாவியைப் பயன்படுத்தவும்.'
          : 'Voice navigation is not supported in this browser. Please use Chrome or Edge.'
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }

      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'ta' ? 'ta-IN' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        showFeedback(lang === 'ta' ? '🎤 கேட்கிறது... (பேசவும்)' : '🎤 Listening... (Speak command)');
      };

      recognition.onresult = (event) => {
        if (event.results && event.results.length > 0) {
          const transcript = event.results[0][0].transcript;
          handleCommand(transcript);
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          showTempError(
            lang === 'ta'
              ? 'மைக் அணுகல் மறுக்கப்பட்டது. உலாவியில் மைக் அனுமதியை வழங்கவும்.'
              : 'Microphone access denied. Please allow microphone permission in your browser.'
          );
        } else if (event.error === 'no-speech') {
          showFeedback(lang === 'ta' ? 'குரல் கேட்கவில்லை.' : 'No speech detected.');
        } else {
          showTempError(
            lang === 'ta'
              ? `குரல் பிழை: ${event.error}`
              : `Voice error: ${event.error}`
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsListening(false);
      showTempError(
        lang === 'ta'
          ? 'குரல் அங்கீகாரத்தைத் தொடங்குவதில் சிக்கல் ஏற்பட்டது.'
          : 'Failed to start voice recognition.'
      );
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* ignore */
      }
    }
    setIsListening(false);
    showFeedback('');
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '8px',
        pointerEvents: 'none',
      }}
    >
      {/* Visual Feedback / Status Toast */}
      {(feedback || errorMsg) && (
        <div
          style={{
            pointerEvents: 'auto',
            background: errorMsg
              ? 'rgba(183, 28, 28, 0.95)'
              : isListening
              ? 'rgba(27, 94, 32, 0.95)'
              : 'rgba(33, 33, 33, 0.95)',
            color: '#ffffff',
            padding: '8px 14px',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: 600,
            boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
            border: errorMsg ? '1px solid #ef5350' : '1px solid #81c784',
            maxWidth: '260px',
            textAlign: 'right',
            backdropFilter: 'blur(6px)',
            animation: 'fadeIn 0.2s ease-out',
            fontFamily: lang === 'ta' ? "'Noto Sans Tamil', sans-serif" : 'Inter, sans-serif',
          }}
        >
          {errorMsg || feedback}
        </div>
      )}

      {/* Floating Microphone Button */}
      <button
        type="button"
        onClick={toggleVoice}
        aria-label={
          isListening
            ? lang === 'ta' ? 'குரல் வழிசெலுத்தலை நிறுத்து' : 'Stop voice navigation'
            : lang === 'ta' ? 'குரல் வழிசெலுத்தலைத் தொடங்கு' : 'Start voice navigation'
        }
        title={
          isListening
            ? lang === 'ta' ? 'நிறுத்த கிளிக் செய்யவும்' : 'Click to stop listening'
            : lang === 'ta' ? 'குரல் வழிசெலுத்தல் (தமிழ்)' : 'Voice Navigation (English)'
        }
        style={{
          pointerEvents: 'auto',
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          border: isListening ? '2.5px solid #ffffff' : '2px solid #81c784',
          background: isListening
            ? 'radial-gradient(circle, #e53935 0%, #b71c1c 100%)'
            : 'radial-gradient(circle, #43a047 0%, #1b5e20 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: isListening
            ? '0 0 20px rgba(229, 57, 53, 0.85), 0 6px 16px rgba(0,0,0,0.4)'
            : '0 4px 16px rgba(46, 125, 50, 0.5), 0 2px 6px rgba(0,0,0,0.3)',
          transition: 'all 0.25s ease',
          outline: 'none',
          transform: isListening ? 'scale(1.08)' : 'scale(1)',
          animation: isListening ? 'pulseVoice 1.4s infinite' : 'none',
        }}
      >
        <span style={{ fontSize: '1.45rem', lineHeight: 1 }}>
          {isListening ? '🛑' : '🎙️'}
        </span>
      </button>

      <style>{`
        @keyframes pulseVoice {
          0% {
            box-shadow: 0 0 0 0 rgba(229, 57, 53, 0.7), 0 4px 14px rgba(0,0,0,0.3);
          }
          70% {
            box-shadow: 0 0 0 14px rgba(229, 57, 53, 0), 0 4px 14px rgba(0,0,0,0.3);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(229, 57, 53, 0), 0 4px 14px rgba(0,0,0,0.3);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
