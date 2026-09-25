import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:crop_farming/services/api_service.dart';
import 'package:crop_farming/widgets/smartcrop_drawer.dart';

class AlertsScreen extends StatefulWidget {
  const AlertsScreen({super.key});

  @override
  State<AlertsScreen> createState() => _AlertsScreenState();
}

class _AlertsScreenState extends State<AlertsScreen> {
  List<String> _alerts = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final response = await ApiService.get('/weather/forecast/', query: {'lat': '13.0827', 'lon': '80.2707'});
      if (response.statusCode != 200 || !mounted) return;
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      final risks = data['risks'] is Map ? (data['risks'] as Map).entries.map((entry) => '${entry.key}: ${entry.value}').toList() : <String>[];
      final recommendations = data['recommendations'] is List ? (data['recommendations'] as List).map((item) => item is Map ? '${item['title'] ?? 'Recommendation'}: ${item['message'] ?? ''}' : item.toString()).toList() : <String>[];
      setState(() => _alerts = [...risks, ...recommendations]);
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: const SmartCropDrawer(),
      appBar: AppBar(title: const Text('Alerts & Notifications')),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _alerts.length,
        separatorBuilder: (_, __) => const Divider(),
        itemBuilder: (context, index) {
          return ListTile(
            leading: const Icon(Icons.notifications_active, color: Colors.orange),
            title: Text(_alerts[index]),
          );
        },
      ),
    );
  }
}
