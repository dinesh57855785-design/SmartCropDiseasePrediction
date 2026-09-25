import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:crop_farming/app.dart';
import 'package:crop_farming/services/api_service.dart';
import 'package:crop_farming/widgets/smartcrop_drawer.dart';

class AnalyzerScreen extends StatefulWidget {
  const AnalyzerScreen({super.key});

  @override
  State<AnalyzerScreen> createState() => _AnalyzerScreenState();
}

class _AnalyzerScreenState extends State<AnalyzerScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  final _picker = ImagePicker();
  final _crop = TextEditingController(text: 'Tomato');
  File? _image;
  Map<String, dynamic>? _result;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabs.dispose();
    _crop.dispose();
    super.dispose();
  }

  Future<void> _pick(ImageSource source) async {
    final image = await _picker.pickImage(source: source);
    if (image != null) setState(() => _image = File(image.path));
  }

  Future<void> _analyze() async {
    if (_image == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Select an image first')));
      return;
    }
    setState(() => _loading = true);
    try {
      final tab = _tabs.index;
      final endpoint = tab == 0 ? '/disease/predict/' : tab == 1 ? '/advisor/soil-image-v2/' : '/advisor/water-image/';
      final fields = tab == 0 ? {'crop_name': _crop.text} : {'lang': 'en'};
      final response = await ApiService.postMultipart(endpoint, fields, imageFile: _image);
      final decoded = jsonDecode(response.body);
      if (response.statusCode >= 200 && response.statusCode < 300 && decoded is Map<String, dynamic>) {
        setState(() => _result = decoded);
      } else {
        throw Exception(decoded is Map ? decoded['error'] ?? 'Analysis failed' : 'Analysis failed');
      }
    } catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.toString())));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: const SmartCropDrawer(),
      appBar: AppBar(
        title: const Text('Crop Analyzer'),
        bottom: TabBar(
          controller: _tabs,
          tabs: const [Tab(text: '🌿 Leaf'), Tab(text: '🟫 Soil'), Tab(text: '💧 Water')],
        ),
      ),
      body: TabBarView(
        controller: _tabs,
        children: [
          _imageTab('Leaf Disease Analysis', 'Upload a leaf photo to predict crop disease.', true),
          _imageTab('Soil AI Analysis', 'Upload a soil photo to classify soil and recommendations.', false),
          _imageTab('Water AI Analysis', 'Upload a water source photo for visual assessment.', false),
        ],
      ),
    );
  }

  Widget _imageTab(String title, String subtitle, bool showCrop) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(title, style: SmartCropPalette.heading(size: 22)),
          const SizedBox(height: 6),
          Text(subtitle, style: const TextStyle(color: SmartCropPalette.textSecondary)),
          if (showCrop) ...[
            const SizedBox(height: 16),
            TextField(controller: _crop, decoration: const InputDecoration(labelText: 'Crop name')),
          ],
          const SizedBox(height: 16),
          Container(
            height: 220,
            decoration: SmartCropPalette.cardDecoration(),
            alignment: Alignment.center,
            child: _image == null ? const Text('No image selected') : Image.file(_image!, fit: BoxFit.contain),
          ),
          const SizedBox(height: 16),
          Row(children: [
            Expanded(child: OutlinedButton.icon(onPressed: () => _pick(ImageSource.gallery), icon: const Icon(Icons.photo), label: const Text('Gallery'))),
            const SizedBox(width: 12),
            Expanded(child: OutlinedButton.icon(onPressed: () => _pick(ImageSource.camera), icon: const Icon(Icons.camera_alt), label: const Text('Camera'))),
          ]),
          const SizedBox(height: 12),
          FilledButton.icon(onPressed: _loading ? null : _analyze, icon: const Icon(Icons.analytics), label: Text(_loading ? 'Analyzing...' : 'Analyze')),
          if (_result != null) ...[
            const SizedBox(height: 18),
            _resultCard(_result!),
          ],
        ],
      ),
    );
  }

  Widget _resultCard(Map<String, dynamic> data) {
    final entries = <Widget>[];
    for (final entry in data.entries) {
      if (entry.value == null || entry.value is Map || entry.value is List) continue;
      entries.add(Padding(
        padding: const EdgeInsets.symmetric(vertical: 5),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Expanded(child: Text(_label(entry.key), style: const TextStyle(color: SmartCropPalette.textSecondary, fontWeight: FontWeight.w700))),
          const SizedBox(width: 12),
          Expanded(child: Text(entry.value.toString(), textAlign: TextAlign.right, style: const TextStyle(color: SmartCropPalette.textPrimary))),
        ]),
      ));
    }
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: SmartCropPalette.cardDecoration(),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('Analysis Result', style: SmartCropPalette.heading(size: 18)),
        const SizedBox(height: 8),
        ...entries,
      ]),
    );
  }

  String _label(String key) => key.replaceAll('_', ' ').replaceFirst(key[0], key[0].toUpperCase());
}
