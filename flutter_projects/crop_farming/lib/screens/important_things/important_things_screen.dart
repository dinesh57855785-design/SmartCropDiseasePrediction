import 'package:flutter/material.dart';
import 'package:crop_farming/app.dart';
import 'package:crop_farming/widgets/smartcrop_drawer.dart';

class ImportantThingsScreen extends StatelessWidget {
  const ImportantThingsScreen({super.key});

  static const _items = [
    ('Assess Your Soil', 'Use the Soil AI Analyzer to identify soil type, condition, and moisture before selecting a crop.'),
    ('Select a Green Manure Crop', 'Choose a suitable green manure crop based on the soil condition and the recommendations shown by SmartCrop.'),
    ('Grow for the Recommended Period', 'Follow the recommended duration and maintain adequate moisture during growth.'),
    ('Incorporate at Flowering', 'Incorporate the green manure crop at the recommended flowering stage to add organic matter.'),
    ('Allow Decomposition', 'Allow the recommended decomposition period before planting the next crop.'),
    ('Monitor Crop Health', 'Use the Crop Analyzer regularly and follow the disease, irrigation, and prevention recommendations.'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: const SmartCropDrawer(),
      appBar: AppBar(title: const Text('Important Things')),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _items.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final item = _items[index];
          return Container(
            padding: const EdgeInsets.all(16),
            decoration: SmartCropPalette.cardDecoration(),
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              CircleAvatar(backgroundColor: SmartCropPalette.accentDeep, child: Text('${index + 1}', style: const TextStyle(color: SmartCropPalette.textPrimary))),
              const SizedBox(width: 12),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(item.$1, style: SmartCropPalette.heading(size: 16)),
                const SizedBox(height: 6),
                Text(item.$2, style: const TextStyle(color: SmartCropPalette.textPrimary, height: 1.4)),
              ])),
            ]),
          );
        },
      ),
    );
  }
}
