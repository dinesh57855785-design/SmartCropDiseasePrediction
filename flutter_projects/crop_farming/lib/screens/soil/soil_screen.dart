import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:crop_farming/app.dart';
import 'package:crop_farming/services/api_service.dart';
import 'package:crop_farming/widgets/smartcrop_drawer.dart';

class SoilScreen extends StatefulWidget {
  const SoilScreen({super.key});

  @override
  State<SoilScreen> createState() => _SoilScreenState();
}

class _SoilScreenState extends State<SoilScreen> {
  File? _image;
  final _picker = ImagePicker();
  bool _loading = false;
  Map<String, dynamic>? _result;

  Future<void> _pickImage() async {
    final img = await _picker.pickImage(source: ImageSource.gallery);
    if (img != null) setState(() => _image = File(img.path));
  }

  Future<void> _analyze() async {
    if (_image == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Pick a soil image')));
      return;
    }
    setState(() => _loading = true);
    try {
      final response = await ApiService.postMultipart('/advisor/soil-image-v2/', {'lang': 'en'}, imageFile: _image);
      if (response.statusCode == 200) {
        setState(() => _result = jsonDecode(response.body));
      } else {
        final body = jsonDecode(response.body);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(body['error'] ?? response.body)));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Soil analysis failed: $e')));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: const SmartCropDrawer(),
      appBar: AppBar(title: const Text('Soil Analysis')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            if (_image != null)
              Expanded(child: Image.file(_image!, fit: BoxFit.contain))
            else
              const Expanded(child: Center(child: Text('No image'))),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: ElevatedButton.icon(icon: const Icon(Icons.photo), label: const Text('Select image'), onPressed: _pickImage)),
                const SizedBox(width: 12),
                Expanded(child: FilledButton.icon(icon: const Icon(Icons.analytics), label: Text(_loading ? 'Analyzing...' : 'Analyze'), onPressed: _loading ? null : _analyze)),
              ],
            ),
            if (_result != null)
              Expanded(
                child: SingleChildScrollView(
                  child: _resultCard(),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _resultCard() {
    final rows = _result!.entries.where((entry) => entry.value != null && entry.value is! Map && entry.value is! List).map((entry) => ListTile(
      dense: true,
      title: Text(entry.key.replaceAll('_', ' '), style: const TextStyle(color: SmartCropPalette.textSecondary)),
      subtitle: Text(entry.value.toString(), style: const TextStyle(color: SmartCropPalette.textPrimary)),
    )).toList();
    return Container(decoration: SmartCropPalette.cardDecoration(), child: Column(children: rows));
  }
}
