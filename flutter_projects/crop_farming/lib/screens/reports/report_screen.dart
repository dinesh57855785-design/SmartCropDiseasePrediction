import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:crop_farming/app.dart';
import 'package:crop_farming/services/api_service.dart';
import 'package:crop_farming/widgets/smartcrop_drawer.dart';

class ReportScreen extends StatefulWidget {
  const ReportScreen({super.key});

  @override
  State<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends State<ReportScreen> {
  final _languageCtrl = TextEditingController(text: 'en');
  final _farmerCtrl = TextEditingController(text: 'Farmer');
  final _locationCtrl = TextEditingController(text: 'Chennai');
  bool _loading = false;
  Map<String, dynamic>? _report;

  Future<void> _generateReport() async {
    setState(() => _loading = true);
    try {
      final response = await ApiService.post('/advisor/report/', {
        'lang': _languageCtrl.text.trim(),
        'farmer_name': _farmerCtrl.text.trim(),
        'location': _locationCtrl.text.trim(),
      });

      if (response.statusCode == 200 || response.statusCode == 201) {
        setState(() => _report = jsonDecode(response.body));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(response.body)));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to generate report: $e')));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: const SmartCropDrawer(),
      appBar: AppBar(title: const Text('Reports')), 
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 540),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  TextField(controller: _farmerCtrl, decoration: const InputDecoration(labelText: 'Farmer name')),
                  const SizedBox(height: 12),
                  TextField(controller: _locationCtrl, decoration: const InputDecoration(labelText: 'Location')),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    value: _languageCtrl.text,
                    decoration: const InputDecoration(labelText: 'Report language'),
                    items: const [
                      DropdownMenuItem(value: 'en', child: Text('English')),
                      DropdownMenuItem(value: 'ta', child: Text('Tamil')),
                      DropdownMenuItem(value: 'hi', child: Text('Hindi')),
                    ],
                    onChanged: (v) => _languageCtrl.text = v ?? 'en',
                  ),
                  const SizedBox(height: 16),
                  FilledButton.icon(
                    onPressed: _loading ? null : _generateReport,
                    icon: const Icon(Icons.description),
                    label: Text(_loading ? 'Generating...' : 'Generate report'),
                  ),
                  const SizedBox(height: 16),
                  if (_report != null)
                    Expanded(child: SingleChildScrollView(child: _reportCard())),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _reportCard() {
    final rows = _report!.entries.where((entry) => entry.value != null && entry.value is! Map && entry.value is! List).map((entry) => ListTile(
      dense: true,
      title: Text(entry.key.replaceAll('_', ' '), style: const TextStyle(color: SmartCropPalette.textSecondary)),
      subtitle: Text(entry.value.toString(), style: const TextStyle(color: SmartCropPalette.textPrimary)),
    )).toList();
    return Container(decoration: SmartCropPalette.cardDecoration(), child: Column(children: rows));
  }
}
