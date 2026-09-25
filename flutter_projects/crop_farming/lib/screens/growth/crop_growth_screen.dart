import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:crop_farming/app.dart';
import 'package:crop_farming/services/api_service.dart';
import 'package:crop_farming/widgets/smartcrop_drawer.dart';

class CropGrowthScreen extends StatefulWidget {
  const CropGrowthScreen({super.key});

  @override
  State<CropGrowthScreen> createState() => _CropGrowthScreenState();
}

class _CropGrowthScreenState extends State<CropGrowthScreen> {
  String _crop = 'tomato';
  String _stage = 'Vegetative';
  Map<String, dynamic>? _data;
  bool _loading = false;
  String? _error;

  final Map<String, List<String>> _stages = const {
    'tomato': ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Harvest'],
    'potato': ['Seed Preparation', 'Sprouting', 'Vegetative', 'Tuber Initiation', 'Tuber Bulking', 'Maturation'],
    'corn': ['Emergence', 'V6 (6 leaves)', 'V12', 'Tasseling (VT)', 'Silking (R1)', 'Grain Fill', 'Maturity'],
    'wheat': ['Germination', 'Tillering', 'Jointing', 'Heading', 'Grain Fill', 'Maturity'],
    'rice': ['Nursery', 'Transplanting', 'Tillering', 'Panicle Initiation', 'Heading', 'Ripening'],
  };

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final response = await ApiService.post('/advisor/crop-growth/', {'crop': _crop, 'stage': _stage});
      final body = jsonDecode(response.body);
      if (response.statusCode >= 200 && response.statusCode < 300 && body is Map<String, dynamic>) {
        setState(() => _data = body);
      } else {
        throw Exception(body is Map ? body['error'] ?? 'Growth data unavailable' : 'Growth data unavailable');
      }
    } catch (error) {
      setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _changeCrop(String? value) {
    if (value == null) return;
    setState(() { _crop = value; _stage = _stages[value]!.first; });
    _load();
  }

  @override
  Widget build(BuildContext context) {
    final stages = _stages[_crop]!;
    return Scaffold(
      drawer: const SmartCropDrawer(),
      appBar: AppBar(title: const Text('Crop Growth Optimization')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          _selectors(stages),
          if (_loading) const Padding(padding: EdgeInsets.all(32), child: Center(child: CircularProgressIndicator()))
          else if (_error != null) _message(_error!)
          else if (_data != null) _content(_data!),
        ]),
      ),
    );
  }

  Widget _selectors(List<String> stages) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: SmartCropPalette.cardDecoration(),
      child: Column(children: [
        DropdownButtonFormField<String>(value: _crop, decoration: const InputDecoration(labelText: 'Select crop'), items: _stages.keys.map((crop) => DropdownMenuItem(value: crop, child: Text(crop))).toList(), onChanged: _changeCrop),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(value: _stage, decoration: const InputDecoration(labelText: 'Growth stage'), items: stages.map((stage) => DropdownMenuItem(value: stage, child: Text(stage))).toList(), onChanged: (value) { if (value != null) { setState(() => _stage = value); _load(); } }),
      ]),
    );
  }

  Widget _content(Map<String, dynamic> data) {
    final organic = _asList(data['organic']);
    final chemical = _asList(data['chemical']);
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      const SizedBox(height: 16),
      Text('Stage Guidelines for ${data['name'] ?? _crop} ($_stage)', style: SmartCropPalette.heading(size: 19)),
      const SizedBox(height: 10),
      _simpleCard('Irrigation Advice', data['irrigation_tips']),
      _simpleCard('Pest Risks', data['pest_tips']),
      _simpleCard('Disease Risks', data['disease_tips']),
      _listCard('Organic Soil Improvement', organic, 'practice'),
      _listCard('Crop Growth Recommendations', chemical, 'product'),
      if (data['disclaimer'] != null) _simpleCard('Safety Notice', data['disclaimer']),
    ]);
  }

  List<Map<String, dynamic>> _asList(dynamic value) => value is List ? value.whereType<Map<String, dynamic>>().toList() : <Map<String, dynamic>>[];

  Widget _simpleCard(String title, dynamic text) => Container(margin: const EdgeInsets.only(bottom: 12), padding: const EdgeInsets.all(16), decoration: SmartCropPalette.cardDecoration(), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: SmartCropPalette.heading(size: 16)), const SizedBox(height: 6), Text(text?.toString() ?? 'No data available', style: const TextStyle(color: SmartCropPalette.textPrimary))]));

  Widget _listCard(String title, List<Map<String, dynamic>> items, String nameKey) => Container(margin: const EdgeInsets.only(top: 4, bottom: 12), padding: const EdgeInsets.all(16), decoration: SmartCropPalette.cardDecoration(), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: SmartCropPalette.heading(size: 16)), const SizedBox(height: 8), if (items.isEmpty) const Text('No data available') else ...items.map((item) => Padding(padding: const EdgeInsets.only(bottom: 10), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(item[nameKey]?.toString() ?? title, style: const TextStyle(color: SmartCropPalette.accent, fontWeight: FontWeight.w700)), Text(item['description']?.toString() ?? item['dosage']?.toString() ?? 'Details available from the advisor.', style: const TextStyle(color: SmartCropPalette.textPrimary)), if (item['timing'] != null) Text('Timing: ${item['timing']}', style: const TextStyle(color: SmartCropPalette.textSecondary))])))]));

  Widget _message(String message) => Padding(padding: const EdgeInsets.only(top: 16), child: Text(message, style: const TextStyle(color: SmartCropPalette.danger)));
}
