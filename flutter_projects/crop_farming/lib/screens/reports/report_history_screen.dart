import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:crop_farming/widgets/smartcrop_drawer.dart';
import 'package:crop_farming/services/api_service.dart';

class ReportHistoryScreen extends StatefulWidget {
  const ReportHistoryScreen({super.key});

  @override
  State<ReportHistoryScreen> createState() => _ReportHistoryScreenState();
}

class _ReportHistoryScreenState extends State<ReportHistoryScreen> {
  bool _loading = false;
  List<dynamic>? _history;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    setState(() => _loading = true);
    try {
      final response = await ApiService.get('/disease/history/');
      if (response.statusCode == 200) {
        setState(() => _history = jsonDecode(response.body));
      }
    } catch (e) {
      setState(() => _history = []);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: const SmartCropDrawer(),
      appBar: AppBar(title: const Text('Prediction History')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
        itemCount: _history?.length ?? 0,
        itemBuilder: (context, i) {
          final item = _history![i];
          return ListTile(
            leading: const Icon(Icons.history),
            title: Text(item['predicted_disease'] ?? 'Prediction'),
            subtitle: Text(item['crop_name'] ?? 'Crop'),
            trailing: Text('${(item['confidence'] ?? 0).toStringAsFixed(2)}'),
          );
        },
      ),
    );
  }
}
