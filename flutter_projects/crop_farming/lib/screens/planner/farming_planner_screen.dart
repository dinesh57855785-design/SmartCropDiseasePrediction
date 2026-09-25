import 'package:flutter/material.dart';
import 'package:crop_farming/services/api_service.dart';

class FarmingPlannerScreen extends StatefulWidget {
  const FarmingPlannerScreen({super.key});

  @override
  State<FarmingPlannerScreen> createState() => _FarmingPlannerScreenState();
}

class _FarmingPlannerScreenState extends State<FarmingPlannerScreen> {
  final List<String> _tasks = ['Check field irrigation', 'Apply nutrient plan', 'Schedule crop inspection'];

  Future<void> _loadPlanner() async {
    try {
      final response = await ApiService.get('/advisor/planner/');
      if (response.statusCode == 200) {
        // response may be formatted as JSON list; update UI when real endpoint available.
      }
    } catch (_) {
      // Continue with local sample tasks until backend planner route is accessible.
    }
  }

  @override
  void initState() {
    super.initState();
    _loadPlanner();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Farming Planner')),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _tasks.length,
        itemBuilder: (context, index) {
          return Card(
            child: ListTile(
              leading: const Icon(Icons.check_circle_outline),
              title: Text(_tasks[index]),
              trailing: const Icon(Icons.calendar_today),
            ),
          );
        },
      ),
    );
  }
}
