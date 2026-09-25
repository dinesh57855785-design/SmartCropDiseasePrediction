import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;

import 'package:crop_farming/app.dart';
import 'package:crop_farming/services/api_service.dart';
import 'package:crop_farming/widgets/smartcrop_drawer.dart';

enum VoiceAssistantState { idle, listening, processing, speaking, error }

class ChatbotScreen extends StatefulWidget {
  const ChatbotScreen({super.key});

  @override
  State<ChatbotScreen> createState() => _ChatbotScreenState();
}

class _ChatbotScreenState extends State<ChatbotScreen> {
  final TextEditingController _textController = TextEditingController();
  final stt.SpeechToText _speechToText = stt.SpeechToText();
  final FlutterTts _flutterTts = FlutterTts();

  final List<Map<String, String>> _messages = <Map<String, String>>[];
  final List<Map<String, dynamic>> _recentContext = <Map<String, dynamic>>[];

  VoiceAssistantState _state = VoiceAssistantState.idle;
  bool _isReady = false;
  bool _isListening = false;
  String _statusMessage = '🎤 Ready';
  String _lastTranscript = '';

  @override
  void initState() {
    super.initState();
    _initializeAssistant();
    _addWelcomeMessage();
  }

  @override
  void dispose() {
    _textController.dispose();
    _speechToText.stop();
    _flutterTts.stop();
    super.dispose();
  }

  Future<void> _initializeAssistant() async {
    try {
      _isReady = await _speechToText.initialize(
        onError: (error) => _handleSttError(error),
        onStatus: (status) {
          if (!mounted) return;
          if (status == 'listening') {
            setState(() {
              _state = VoiceAssistantState.listening;
              _statusMessage = '🎤 Listening...';
              _isListening = true;
            });
          } else if (status == 'done') {
            setState(() {
              _state = VoiceAssistantState.processing;
              _statusMessage = '⏳ Thinking...';
              _isListening = false;
            });
          }
        },
      );
      if (!_isReady) {
        setState(() {
          _state = VoiceAssistantState.error;
          _statusMessage = '⚠️ Voice unavailable';
        });
        return;
      }

      await _configureTts();
      if (mounted) {
        setState(() {
          _state = VoiceAssistantState.idle;
          _statusMessage = '🎤 Ready';
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _state = VoiceAssistantState.error;
          _statusMessage = '⚠️ Something went wrong';
        });
      }
    }
  }

  Future<void> _configureTts() async {
    await _flutterTts.setLanguage('en-US');
    await _flutterTts.setSpeechRate(0.95);
    await _flutterTts.setVolume(1.0);
    await _flutterTts.setPitch(1.0);
  }

  String _detectLanguage(String text) {
    final normalized = text.trim();
    if (normalized.isEmpty) return 'en-US';
    final tamilMatcher = RegExp(r'[\u0B80-\u0BFF]');
    if (tamilMatcher.hasMatch(normalized)) {
      return 'ta-IN';
    }
    return 'en-US';
  }

  String _displayFriendlyStatus(String message) {
    final lower = message.toLowerCase();
    if (lower.contains('permission')) {
      return 'Microphone permission is blocked. Please allow access to continue.';
    }
    if (lower.contains('network') || lower.contains('server')) {
      return 'The SmartCrop service is currently unavailable. Please try again in a moment.';
    }
    if (lower.contains('not available') || lower.contains('unsupported')) {
      return 'Voice features are not available on this device right now.';
    }
    if (lower.contains('no speech') || lower.contains('no input')) {
      return 'No speech was detected. Please try again.';
    }
    return message;
  }

  void _addWelcomeMessage() {
    _messages.add({'role': 'assistant', 'text': 'Hello! I can help with crop health, irrigation, weather, and farming questions. Tap the microphone and ask me anything.'});
  }

  Future<void> _startListening() async {
    if (!_isReady) {
      final isAvailable = await _speechToText.initialize(
        onError: (error) => _handleSttError(error),
        onStatus: (status) {
          if (!mounted) return;
          if (status == 'listening') {
            setState(() {
              _state = VoiceAssistantState.listening;
              _statusMessage = '🎤 Listening...';
              _isListening = true;
            });
          } else if (status == 'done') {
            setState(() {
              _state = VoiceAssistantState.processing;
              _statusMessage = '⏳ Thinking...';
              _isListening = false;
            });
          }
        },
      );
      if (!isAvailable) {
        setState(() {
          _state = VoiceAssistantState.error;
          _statusMessage = '⚠️ Voice recognition is unavailable';
        });
        return;
      }
      _isReady = true;
    }

    final hasPermission = await _speechToText.hasPermission;
    if (!hasPermission) {
      setState(() {
        _state = VoiceAssistantState.error;
        _statusMessage = '⚠️ Microphone permission denied';
      });
      _showInfoSnack('Microphone permission denied. Please allow access and try again.');
      return;
    }

    setState(() {
      _state = VoiceAssistantState.listening;
      _statusMessage = '🎤 Listening...';
      _isListening = true;
      _lastTranscript = '';
    });

    try {
      await _speechToText.listen(
        listenMode: stt.ListenMode.confirmation,
        pauseFor: const Duration(seconds: 4),
        listenFor: const Duration(seconds: 20),
        onResult: (result) {
          if (!mounted) return;
          final text = result.recognizedWords.trim();
          if (text.isEmpty) return;
          setState(() {
            _lastTranscript = text;
          });
          if (result.finalResult && text.isNotEmpty) {
            _submitVoicePrompt(text);
          }
        },
        localeId: _detectLanguage(_textController.text),
      );
    } catch (_) {
      setState(() {
        _state = VoiceAssistantState.error;
        _statusMessage = '⚠️ Something went wrong';
      });
      _showInfoSnack('Voice capture failed. Please try again.');
    }
  }

  void _handleSttError(dynamic error) {
    if (!mounted) return;
    final message = error.toString();
    setState(() {
      _state = VoiceAssistantState.error;
      _statusMessage = '⚠️ Something went wrong';
      _isListening = false;
    });
    _showInfoSnack(_displayFriendlyStatus(message));
  }

  void _showInfoSnack(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  Future<void> _submitVoicePrompt(String prompt) async {
    final trimmedText = prompt.trim();
    if (trimmedText.isEmpty) {
      return;
    }

    _speechToText.stop();
    setState(() {
      _isListening = false;
      _state = VoiceAssistantState.processing;
      _statusMessage = '⏳ Thinking...';
      _messages.add({'role': 'user', 'text': trimmedText});
      _recentContext.add({'role': 'user', 'content': trimmedText});
    });

    try {
      final response = await ApiService.post('/chatbot/message/', {
        'message': trimmedText,
        'context': {
          'weather_summary': 'weather context available',
          'recent_messages': _recentContext.take(8).toList(),
        },
      });

      if (response.statusCode != 200) {
        throw Exception('Backend unavailable');
      }

      final body = jsonDecode(response.body) as Map<String, dynamic>;
      final reply = (body['reply'] as String?)?.trim();
      final safeReply = (reply == null || reply.isEmpty)
          ? 'I could not generate a useful answer for that question right now. Please try a different question or use the crop diagnostic tools.'
          : reply;

      setState(() {
        _messages.add({'role': 'assistant', 'text': safeReply});
        _recentContext.add({'role': 'assistant', 'content': safeReply});
        _state = VoiceAssistantState.speaking;
        _statusMessage = '🔊 Speaking...';
      });

      await _speakAnswer(safeReply);

      if (mounted) {
        setState(() {
          _state = VoiceAssistantState.idle;
          _statusMessage = '🎤 Ready';
        });
      }
    } catch (_) {
      final message = 'Sorry, I could not reach the SmartCrop service right now. Please try again.';
      if (mounted) {
        setState(() {
          _messages.add({'role': 'assistant', 'text': message});
          _state = VoiceAssistantState.error;
          _statusMessage = '⚠️ Something went wrong';
        });
      }
      _showInfoSnack('The SmartCrop AI service is unavailable.');
    }
  }

  Future<void> _speakAnswer(String answer) async {
    final language = _detectLanguage(answer);
    try {
      await _flutterTts.stop();
      await _flutterTts.setLanguage(language);
      await _flutterTts.speak(answer);
    } catch (_) {
      try {
        await _flutterTts.stop();
        await _flutterTts.setLanguage('en-US');
        await _flutterTts.speak(answer);
      } catch (_) {
        if (mounted) {
          setState(() {
            _state = VoiceAssistantState.idle;
            _statusMessage = '🎤 Ready';
          });
        }
      }
    }
  }

  Future<void> _stopSpeaking() async {
    await _flutterTts.stop();
    if (mounted) {
      setState(() {
        _state = VoiceAssistantState.idle;
        _statusMessage = '🎤 Ready';
      });
    }
  }

  Future<void> _sendTextMessage() async {
    final text = _textController.text.trim();
    if (text.isEmpty) return;

    _textController.clear();
    setState(() {
      _messages.add({'role': 'user', 'text': text});
      _recentContext.add({'role': 'user', 'content': text});
      _state = VoiceAssistantState.processing;
      _statusMessage = '⏳ Thinking...';
    });

    try {
      final response = await ApiService.post('/chatbot/message/', {
        'message': text,
        'context': {'weather_summary': 'weather context available', 'recent_messages': _recentContext.take(8).toList()},
      });
      if (response.statusCode != 200) {
        throw Exception('Bad response');
      }
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      final reply = (body['reply'] as String?) ?? 'I could not generate a helpful answer right now.';
      setState(() {
        _messages.add({'role': 'assistant', 'text': reply});
        _recentContext.add({'role': 'assistant', 'content': reply});
      });
      await _speakAnswer(reply);
    } catch (_) {
      setState(() {
        _messages.add({'role': 'assistant', 'text': 'Sorry, I could not reach the SmartCrop service right now. Please try again.'});
        _state = VoiceAssistantState.error;
        _statusMessage = '⚠️ Something went wrong';
      });
      _showInfoSnack('The SmartCrop AI service is unavailable.');
    } finally {
      if (mounted) {
        setState(() {
          _state = VoiceAssistantState.idle;
          _statusMessage = '🎤 Ready';
        });
      }
    }
  }

  Widget _buildMessageBubble(Map<String, String> message) {
    final isUser = message['role'] == 'user';
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
        margin: const EdgeInsets.symmetric(vertical: 6),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: isUser ? SmartCropPalette.accentDeep : const Color(0xFFE8F5E9),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(18),
            topRight: const Radius.circular(18),
            bottomLeft: Radius.circular(isUser ? 18 : 4),
            bottomRight: Radius.circular(isUser ? 4 : 18),
          ),
          border: isUser ? null : Border.all(color: SmartCropPalette.border),
        ),
        child: Text(
          message['text'] ?? '',
          softWrap: true,
          style: TextStyle(
            color: isUser ? Colors.white : Colors.black87,
            fontSize: 15,
            height: 1.45,
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: const SmartCropDrawer(),
      appBar: AppBar(
        title: const Text('SmartCrop AI'),
        centerTitle: true,
        actions: [
          if (_state == VoiceAssistantState.speaking)
            IconButton(
              onPressed: _stopSpeaking,
              icon: const Icon(Icons.stop_circle_outlined),
              tooltip: 'Stop speaking',
            ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: SmartCropPalette.cardDecoration(radius: 16),
                child: Row(
                  children: [
                    Icon(
                      _state == VoiceAssistantState.listening
                          ? Icons.mic
                          : _state == VoiceAssistantState.processing
                              ? Icons.autorenew
                              : _state == VoiceAssistantState.speaking
                                  ? Icons.volume_up
                                  : Icons.check_circle_outline,
                      color: _state == VoiceAssistantState.error ? Colors.red : SmartCropPalette.accent,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        _statusMessage,
                        style: const TextStyle(fontWeight: FontWeight.w600, color: SmartCropPalette.textPrimary),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  itemCount: _messages.length,
                  itemBuilder: (context, index) => _buildMessageBubble(_messages[index]),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _textController,
                      decoration: const InputDecoration(
                        hintText: 'Ask about crops, disease, weather, or irrigation...',
                      ),
                      onSubmitted: (_) => _sendTextMessage(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    decoration: BoxDecoration(
                      color: SmartCropPalette.accentDeep,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: IconButton(
                      onPressed: _sendTextMessage,
                      icon: const Icon(Icons.send_rounded, color: Colors.white),
                      tooltip: 'Send message',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: 120,
                height: 120,
                child: FloatingActionButton.large(
                  onPressed: _state == VoiceAssistantState.processing || _state == VoiceAssistantState.speaking
                      ? null
                      : _startListening,
                  backgroundColor: _state == VoiceAssistantState.listening ? Colors.red : SmartCropPalette.accentDeep,
                  child: const Icon(Icons.mic, size: 44),
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                'Tap to speak',
                style: TextStyle(fontWeight: FontWeight.w600, color: SmartCropPalette.textPrimary),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
