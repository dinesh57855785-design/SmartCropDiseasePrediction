import 'package:flutter/material.dart';
import 'package:crop_farming/services/api_service.dart';
import 'package:crop_farming/widgets/smartcrop_drawer.dart';

class PlannerScreen extends StatefulWidget {
  const PlannerScreen({super.key});

  @override
  State<PlannerScreen> createState() => _PlannerScreenState();
}

class _PlannerScreenState extends State<PlannerScreen> {
  final List<String> _tasks = ['Check field irrigation', 'Apply nutrient plan', 'Schedule crop inspection'];

  Future<void> _loadPlanner() async {
    try {
      final response = await ApiService.get('/advisor/planner/');
      if (response.statusCode == 200) {
        // backend route can be parsed into a planner list when available.
      }
    } catch (_) {
      // Fall back to a usable local planner list.
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
      drawer: const SmartCropDrawer(),
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
