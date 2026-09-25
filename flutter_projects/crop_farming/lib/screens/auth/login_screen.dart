import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:crop_farming/app.dart';
import 'package:crop_farming/services/api_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _form = GlobalKey<FormState>();
  final _usernameCtrl = TextEditingController(text: 'admin');
  final _passwordCtrl = TextEditingController();
  bool _loading = false;

  Future<void> _login() async {
    if (!_form.currentState!.validate()) return;

    setState(() => _loading = true);

    try {
      final response = await ApiService.post('/auth/login/', {
        'username': _usernameCtrl.text.trim(),
        'password': _passwordCtrl.text.trim(),
      });

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        await ApiService.saveToken(data['access']);
        await ApiService.saveRefreshToken(data['refresh']);
        if (!mounted) return;
        Navigator.pushReplacementNamed(context, '/dashboard');
      } else {
        final data = jsonDecode(response.body);
        _showError(data['detail'] ?? 'Login failed');
      }
    } catch (e) {
      _showError('Backend unavailable. Check API base URL: ${ApiService.baseUrl}');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showError(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [SmartCropPalette.background, Color(0xFF1a2e1a)],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 420),
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: SmartCropPalette.cardDecoration(radius: 22),
                  child: Form(
                    key: _form,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Icon(Icons.eco, size: 88, color: SmartCropPalette.accent),
                        const SizedBox(height: 18),
                        const Text(
                          'SmartCrop',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 32,
                            fontWeight: FontWeight.w800,
                            color: SmartCropPalette.accent,
                          ),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Crop Disease Prediction',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: SmartCropPalette.textSecondary, fontSize: 15),
                        ),
                        const SizedBox(height: 28),
                        TextFormField(
                          controller: _usernameCtrl,
                          decoration: const InputDecoration(labelText: 'Username'),
                          validator: (v) => v == null || v.trim().isEmpty ? 'Username required' : null,
                        ),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _passwordCtrl,
                          obscureText: true,
                          decoration: const InputDecoration(labelText: 'Password'),
                          validator: (v) => v == null || v.trim().isEmpty ? 'Password required' : null,
                        ),
                        const SizedBox(height: 24),
                        FilledButton.icon(
                          style: FilledButton.styleFrom(
                            backgroundColor: SmartCropPalette.accentDeep,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          onPressed: _loading ? null : _login,
                          icon: _loading
                              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                              : const Icon(Icons.login),
                          label: Text(_loading ? 'Signing in...' : 'Login'),
                        ),
                        const SizedBox(height: 12),
                        TextButton(
                          onPressed: () => Navigator.pushNamed(context, '/register'),
                          child: const Text(
                            'Create account',
                            style: TextStyle(color: SmartCropPalette.accent, fontWeight: FontWeight.w700),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
