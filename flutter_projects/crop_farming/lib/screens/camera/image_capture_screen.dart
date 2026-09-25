import 'dart:io';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:crop_farming/services/api_service.dart';

class ImageCaptureScreen extends StatefulWidget {
  const ImageCaptureScreen({super.key});

  @override
  State<ImageCaptureScreen> createState() => _ImageCaptureScreenState();
}

class _ImageCaptureScreenState extends State<ImageCaptureScreen> {
  File? _image;
  final _picker = ImagePicker();
  final _cropController = TextEditingController(text: 'Tomato');
  bool _loading = false;

  Future<void> _pickCamera() async {
    final img = await _picker.pickImage(source: ImageSource.camera);
    if (img != null) setState(() => _image = File(img.path));
  }

  Future<void> _pickGallery() async {
    final img = await _picker.pickImage(source: ImageSource.gallery);
    if (img != null) setState(() => _image = File(img.path));
  }

  Future<void> _predict() async {
    if (_image == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Select a crop image first')));
      return;
    }

    setState(() => _loading = true);
    try {
      final response = await ApiService.postMultipart('/disease/predict/', {
        'crop_name': _cropController.text,
      }, imageFile: _image);

      if (response.statusCode == 201) {
        final decoded = jsonDecode(response.body);
        if (decoded is! Map<String, dynamic> || decoded['disease_info'] is! Map<String, dynamic>) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Data unavailable')),
            );
          }
          return;
        }
        final body = response.body;
        Navigator.pushNamed(context, '/prediction_result', arguments: body);
      } else {
        final msg = response.body;
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Prediction failed: $msg')));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Network error: $e')));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Predict Crop Disease')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(controller: _cropController, decoration: const InputDecoration(labelText: 'Crop name')),
            const SizedBox(height: 12),
            if (_image != null)
              Expanded(child: Image.file(_image!, fit: BoxFit.cover))
            else
              const Expanded(child: Center(child: Text('No image selected'))),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: ElevatedButton.icon(icon: const Icon(Icons.camera_alt), label: const Text('Camera'), onPressed: _pickCamera)),
                const SizedBox(width: 12),
                Expanded(child: ElevatedButton.icon(icon: const Icon(Icons.photo), label: const Text('Gallery'), onPressed: _pickGallery)),
              ],
            ),
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: _loading ? null : _predict,
              icon: _loading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.search),
              label: Text(_loading ? 'Analyzing...' : 'Predict Disease'),
            ),
          ],
        ),
      ),
    );
  }
}
