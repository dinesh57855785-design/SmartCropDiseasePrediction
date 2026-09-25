import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:crop_farming/services/api_service.dart';
import 'package:crop_farming/app.dart';
import 'package:crop_farming/widgets/smartcrop_drawer.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? _profile;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final response = await ApiService.get('/users/profile/');
      if (response.statusCode == 200 && mounted) setState(() => _profile = jsonDecode(response.body));
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: const SmartCropDrawer(),
      appBar: AppBar(title: const Text('User Profile')),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 560),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const CircleAvatar(radius: 40, child: Icon(Icons.person, size: 44)),
                  const SizedBox(height: 16),
                  Text(_profile?['username']?.toString() ?? 'SmartCrop Farmer', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: SmartCropPalette.textPrimary)),
                  const SizedBox(height: 8),
                  Text('Email: ${_profile?['email'] ?? 'Not available'}', style: const TextStyle(color: SmartCropPalette.textSecondary)),
                  Text('Phone: ${_profile?['phone'] ?? 'Not available'}', style: const TextStyle(color: SmartCropPalette.textSecondary)),
                  const Divider(height: 30),
                  const Text('Farm Activities', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const ListTile(leading: Icon(Icons.eco), title: Text('Crop monitoring enabled')),
                  const ListTile(leading: Icon(Icons.cloud), title: Text('Weather alerts enabled')),
                  const Spacer(),
                  FilledButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.edit),
                    label: const Text('Edit Profile'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
