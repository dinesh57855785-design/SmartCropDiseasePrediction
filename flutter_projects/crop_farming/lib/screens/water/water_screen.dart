import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:crop_farming/app.dart';
import 'package:crop_farming/services/api_service.dart';
import 'package:crop_farming/widgets/smartcrop_drawer.dart';

class WaterScreen extends StatefulWidget {
  const WaterScreen({super.key});

  @override
  State<WaterScreen> createState() => _WaterScreenState();
}

class _WaterScreenState extends State<WaterScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  final _picker = ImagePicker();
  final _ph = TextEditingController(text: '7.2');
  final _tds = TextEditingController(text: '450');
  final _ec = TextEditingController(text: '0.8');
  File? _image;
  Map<String, dynamic>? _result;
  bool _loading = false;

  @override
  void initState() { super.initState(); _tabs = TabController(length: 2, vsync: this); }
  @override
  void dispose() { _tabs.dispose(); _ph.dispose(); _tds.dispose(); _ec.dispose(); super.dispose(); }

  Future<void> _pick(ImageSource source) async {
    final image = await _picker.pickImage(source: source);
    if (image != null) setState(() => _image = File(image.path));
  }

  Future<void> _submit() async {
    setState(() => _loading = true);
    try {
      late final httpResponse;
      if (_tabs.index == 0) {
        httpResponse = await ApiService.post('/advisor/water/', {'ph': _ph.text, 'tds': _tds.text, 'ec': _ec.text, 'salinity': 'Low', 'hardness': 'Moderate'});
      } else {
        final imageFile = _image;
        if (imageFile == null) throw Exception('Select a water image first');
        httpResponse = await ApiService.postMultipart('/advisor/water-image/', {'lang': 'en'}, imageFile: imageFile);
      }
      final body = jsonDecode(httpResponse.body);
      if (httpResponse.statusCode >= 200 && httpResponse.statusCode < 300 && body is Map<String, dynamic>) setState(() => _result = body);
      else throw Exception(body is Map ? body['error'] ?? 'Water analysis failed' : 'Water analysis failed');
    } catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.toString())));
    } finally { if (mounted) setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: const SmartCropDrawer(),
      appBar: AppBar(title: const Text('Water Quality Analysis'), bottom: TabBar(controller: _tabs, tabs: const [Tab(text: 'Manual Analysis'), Tab(text: 'AI Image Analysis')])),
      body: TabBarView(controller: _tabs, children: [_manual(), _imageTab()]),
    );
  }

  Widget _manual() => _form([
    TextField(controller: _ph, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Water pH')),
    const SizedBox(height: 12),
    TextField(controller: _tds, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'TDS (ppm / mg/L)')),
    const SizedBox(height: 12),
    TextField(controller: _ec, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'EC (dS/m)')),
    const SizedBox(height: 16),
    _analyzeButton(),
  ]);

  Widget _imageTab() => _form([
    Container(height: 220, decoration: SmartCropPalette.cardDecoration(), alignment: Alignment.center, child: _image == null ? const Text('No image selected') : Image.file(_image!, fit: BoxFit.contain)),
    const SizedBox(height: 16),
    Row(children: [Expanded(child: OutlinedButton.icon(onPressed: () => _pick(ImageSource.gallery), icon: const Icon(Icons.photo), label: const Text('Gallery'))), const SizedBox(width: 12), Expanded(child: OutlinedButton.icon(onPressed: () => _pick(ImageSource.camera), icon: const Icon(Icons.camera_alt), label: const Text('Camera')))]),
    const SizedBox(height: 12),
    _analyzeButton(),
  ]);

  Widget _form(List<Widget> children) => SingleChildScrollView(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [...children, if (_result != null) ...[const SizedBox(height: 18), _resultCard()]]));
  Widget _analyzeButton() => FilledButton.icon(onPressed: _loading ? null : _submit, icon: const Icon(Icons.analytics), label: Text(_loading ? 'Analyzing...' : 'Analyze Water'));

  Widget _resultCard() {
    final rows = _result!.entries.where((entry) => entry.value != null && entry.value is! Map && entry.value is! List).map((entry) => Padding(padding: const EdgeInsets.symmetric(vertical: 5), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [Expanded(child: Text(entry.key.replaceAll('_', ' '), style: const TextStyle(color: SmartCropPalette.textSecondary, fontWeight: FontWeight.w700))), const SizedBox(width: 12), Expanded(child: Text(entry.value.toString(), textAlign: TextAlign.right, style: const TextStyle(color: SmartCropPalette.textPrimary)))]))).toList();
    return Container(padding: const EdgeInsets.all(16), decoration: SmartCropPalette.cardDecoration(), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Water Analysis Result', style: SmartCropPalette.heading(size: 18)), const SizedBox(height: 8), ...rows]));
  }
}
