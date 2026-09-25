import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:crop_farming/app.dart';
import 'package:crop_farming/services/api_service.dart';
import 'package:crop_farming/widgets/smartcrop_drawer.dart';

class RecommendationScreen extends StatefulWidget {
  const RecommendationScreen({super.key});

  @override
  State<RecommendationScreen> createState() => _RecommendationScreenState();
}

class _RecommendationScreenState extends State<RecommendationScreen> {
  bool _loading = false;
  Map<String, dynamic>? _data;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final response = await ApiService.post('/advisor/recommend/', {
        'crop': 'tomato',
        'stage': 'Flowering',
      });
      if (response.statusCode == 200) {
        setState(() => _data = jsonDecode(response.body));
      }
    } catch (e) {
      setState(() => _data = {'error': e.toString()});
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: const SmartCropDrawer(),
      appBar: AppBar(title: const Text('Recommendations')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: _data == null
            ? const Text('No recommendations')
            : _resultCard(_data!),
      ),
    );
  }

  Widget _resultCard(Map<String, dynamic> data) {
    final rows = data.entries.where((entry) => entry.value != null && entry.value is! Map && entry.value is! List).map((entry) => ListTile(
      dense: true,
      title: Text(entry.key.replaceAll('_', ' '), style: const TextStyle(color: SmartCropPalette.textSecondary)),
      subtitle: Text(entry.value.toString(), style: const TextStyle(color: SmartCropPalette.textPrimary)),
    )).toList();
    return Container(decoration: SmartCropPalette.cardDecoration(), child: Column(children: rows));
  }
}
