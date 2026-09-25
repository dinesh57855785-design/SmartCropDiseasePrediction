import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:crop_farming/app.dart';
import 'package:crop_farming/services/api_service.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _form = GlobalKey<FormState>();
  final _username = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _password2 = TextEditingController();
  final _firstName = TextEditingController();
  final _lastName = TextEditingController();
  final _phone = TextEditingController();
  bool _loading = false;

  Future<void> _register() async {
    if (!_form.currentState!.validate()) return;
    if (_password.text.trim() != _password2.text.trim()) {
      _showError('Passwords do not match.');
      return;
    }

    setState(() => _loading = true);
    try {
      final response = await ApiService.post('/users/register/', {
        'username': _username.text.trim(),
        'email': _email.text.trim(),
        'password': _password.text.trim(),
        'password2': _password2.text.trim(),
        'first_name': _firstName.text.trim(),
        'last_name': _lastName.text.trim(),
        'phone': _phone.text.trim(),
        'role': 'Farmer',
      });

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(data['message'] ?? 'Registration successful')));
        Navigator.pop(context);
      } else {
        final data = response.body.isNotEmpty ? jsonDecode(response.body) : {};
        _showError(_extractError(data));
      }
    } catch (e) {
      _showError('Registration failed. Check the backend and API base URL.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _extractError(dynamic data) {
    if (data is Map<String, dynamic>) {
      if (data.containsKey('error')) return data['error'].toString();
      if (data.containsKey('password')) return data['password'].join(' ');
      final messages = <String>[];
      data.forEach((key, value) {
        if (value is List) {
          messages.add('$key: ${value.join(' ')}');
        } else if (value is String) {
          messages.add('$key: $value');
        }
      });
      if (messages.isNotEmpty) return messages.join('\n');
    }
    return 'Registration failed';
  }

  void _showError(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Register')),
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
            child: Form(
              key: _form,
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 460),
                child: ListView(
                  padding: const EdgeInsets.all(24),
                  children: [
                    Container(
                      padding: const EdgeInsets.all(22),
                      decoration: SmartCropPalette.cardDecoration(radius: 22),
                      child: Column(
                        children: [
                          const Icon(Icons.person_add_alt_1_rounded, size: 72, color: SmartCropPalette.accent),
                          const SizedBox(height: 8),
                          const Text(
                            'Create your SmartCrop account',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: SmartCropPalette.accent),
                          ),
                          const SizedBox(height: 18),
                          TextFormField(controller: _username, decoration: const InputDecoration(labelText: 'Username'), validator: _required),
                          const SizedBox(height: 12),
                          TextFormField(controller: _email, decoration: const InputDecoration(labelText: 'Email'), validator: _required),
                          const SizedBox(height: 12),
                          TextFormField(controller: _firstName, decoration: const InputDecoration(labelText: 'First name'), validator: _required),
                          const SizedBox(height: 12),
                          TextFormField(controller: _lastName, decoration: const InputDecoration(labelText: 'Last name'), validator: _required),
                          const SizedBox(height: 12),
                          TextFormField(controller: _phone, decoration: const InputDecoration(labelText: 'Phone'), keyboardType: TextInputType.phone),
                          const SizedBox(height: 12),
                          TextFormField(controller: _password, obscureText: true, decoration: const InputDecoration(labelText: 'Password'), validator: _required),
                          const SizedBox(height: 12),
                          TextFormField(controller: _password2, obscureText: true, decoration: const InputDecoration(labelText: 'Confirm Password'), validator: _required),
                          const SizedBox(height: 22),
                          FilledButton(
                            style: FilledButton.styleFrom(
                              backgroundColor: SmartCropPalette.accentDeep,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            onPressed: _loading ? null : _register,
                            child: Text(_loading ? 'Creating...' : 'Create account'),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  String? _required(String? v) => (v == null || v.trim().isEmpty) ? 'Required' : null;
}
