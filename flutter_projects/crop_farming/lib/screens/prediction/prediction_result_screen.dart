import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:crop_farming/widgets/smartcrop_drawer.dart';

class PredictionResultScreen extends StatelessWidget {
  const PredictionResultScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)?.settings.arguments;
    final responseText = args is String ? args : '{}';
    final payload = jsonDecode(responseText.isNotEmpty ? responseText : '{}') as Map<String, dynamic>;

    final disease = payload['predicted_disease'] ?? payload['disease'] ?? 'Disease';
    final crop = payload['crop_name'] ?? 'Crop';
    final confidence = payload['confidence'] ?? 0.0;
    final treatment = payload['treatment_advice'] ?? payload['treatment'] ?? 'Consult local advisor.';
    final smart = payload['smart_crop_analysis'] is Map<String, dynamic>
        ? payload['smart_crop_analysis'] as Map<String, dynamic>
        : <String, dynamic>{};
    final diseaseAnalysis = smart['disease_analysis'] is Map<String, dynamic>
        ? smart['disease_analysis'] as Map<String, dynamic>
        : <String, dynamic>{};
    final soilAnalysis = smart['soil_analysis'] is Map<String, dynamic>
        ? smart['soil_analysis'] as Map<String, dynamic>
        : <String, dynamic>{};
    final waterAnalysis = smart['water_analysis'] is Map<String, dynamic>
        ? smart['water_analysis'] as Map<String, dynamic>
        : <String, dynamic>{};
    final recommendation = smart['combined_recommendation'] ?? smart['quick_summary'] ?? 'Field recommendation available.';
    final confidencePct = (confidence is num)
        ? confidence.toDouble().toStringAsFixed(2)
        : confidence.toString();

    return Scaffold(
      drawer: const SmartCropDrawer(),
      appBar: AppBar(title: const Text('Prediction Result')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(crop, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 12),
                    Text(disease.toString(), style: const TextStyle(fontSize: 30, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Text('Confidence: $confidencePct'),
                    const SizedBox(height: 8),
                    Text('Treatment: $treatment'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Smart Crop Analysis', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Text(recommendation.toString()),
                    const SizedBox(height: 8),
                    Text('Disease: ${diseaseAnalysis['predicted_disease'] ?? disease}', style: const TextStyle(fontWeight: FontWeight.w600)),
                    Text('Soil: ${soilAnalysis['soil_status'] ?? soilAnalysis['soil_advice'] ?? 'Not available'}'),
                    Text('Water: ${waterAnalysis['field_water_availability'] ?? waterAnalysis['water_status'] ?? 'Not available'}'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),
            ElevatedButton.icon(
              onPressed: () => Navigator.pushNamed(context, '/recommendations'),
              icon: const Icon(Icons.medical_information),
              label: const Text('Organic & Chemical Plans'),
            ),
          ],
        ),
      ),
    );
  }
}
