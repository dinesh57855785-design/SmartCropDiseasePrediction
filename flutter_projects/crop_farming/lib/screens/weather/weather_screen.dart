import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:crop_farming/services/api_service.dart';
import 'package:crop_farming/widgets/smartcrop_drawer.dart';

class WeatherScreen extends StatefulWidget {
  const WeatherScreen({super.key});

  @override
  State<WeatherScreen> createState() => _WeatherScreenState();
}

class _WeatherScreenState extends State<WeatherScreen> {
  bool _loading = false;
  Map<String, dynamic>? _data;

  @override
  void initState() {
    super.initState();
    _loadWeather();
  }

  Future<void> _loadWeather() async {
    setState(() => _loading = true);
    try {
      final position = await _getCurrentPosition();
      final lat = position.latitude.toString();
      final lon = position.longitude.toString();
      final response = await ApiService.get('/weather/forecast/', query: {'lat': lat, 'lon': lon});
      if (response.statusCode == 200) {
        setState(() => _data = jsonDecode(response.body));
      }
    } catch (e) {
      setState(() => _data = {'error': e.toString()});
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<Position> _getCurrentPosition() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return Position(
        latitude: 13.0827,
        longitude: 80.2707,
        timestamp: DateTime.now(),
        accuracy: 0,
        altitude: 0,
        altitudeAccuracy: 0,
        heading: 0,
        headingAccuracy: 0,
        speed: 0,
        speedAccuracy: 0,
        floor: null,
        isMocked: false,
      );
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
      return Position(
        latitude: 13.0827,
        longitude: 80.2707,
        timestamp: DateTime.now(),
        accuracy: 0,
        altitude: 0,
        altitudeAccuracy: 0,
        heading: 0,
        headingAccuracy: 0,
        speed: 0,
        speedAccuracy: 0,
        floor: null,
        isMocked: false,
      );
    }

    return Geolocator.getCurrentPosition(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.low,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final summary = _data?['summary'] ?? 'No daily summary available';
    final stats = _data?['statistics'] as Map<String, dynamic>? ?? <String, dynamic>{};
    final risks = _data?['risks'] as Map<String, dynamic>? ?? <String, dynamic>{};
    final recs = _data?['recommendations'] as List<dynamic>? ?? <dynamic>[];
    final daily = _data?['daily_forecast'] as List<dynamic>? ?? <dynamic>[];

    return Scaffold(
      drawer: const SmartCropDrawer(),
      appBar: AppBar(title: const Text('Weather & Irrigation')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(_data?['location']?['lat'] != null ? 'Chennai, Tamil Nadu' : 'Chennai, Tamil Nadu', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Summary', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Text(summary),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                _statChip('Rain mm', '${stats['total_rain_mm'] ?? 0}'),
                _statChip('Rainy', '${stats['rainy_days'] ?? 0}'),
                _statChip('Dry', '${stats['dry_days'] ?? 0}'),
                _statChip('Max °C', '${stats['max_temp'] ?? 0}'),
                _statChip('Min °C', '${stats['min_temp'] ?? 0}'),
                _statChip('Humidity %', '${stats['avg_humidity_pct'] ?? 0}'),
              ],
            ),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Risk signals', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    if (risks.isEmpty)
                      const Text('No risk signals')
                    else
                      ...risks.entries.map((entry) => ListTile(
                        dense: true,
                        leading: const Icon(Icons.warning_amber, color: Colors.orange),
                        title: Text('${entry.key}: ${entry.value}'),
                      )),
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
                    const Text('Recommendations', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    if (recs.isEmpty)
                      const Text('No recommendations available')
                    else
                      ...recs.map((item) => _recommendationRow(item as Map<String, dynamic>)),
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
                    const Text('14-day forecast snapshot', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    if (daily.isEmpty)
                      const Text('Forecast unavailable')
                    else
                      ...daily.take(5).map((day) => _dayLine(day as Map<String, dynamic>)),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _statChip(String label, String value) {
    return Chip(
      avatar: const Icon(Icons.thermostat, size: 16),
      label: Text('$label: $value'),
    );
  }

  Widget _recommendationRow(Map<String, dynamic> item) {
    return ListTile(
      dense: true,
      leading: const Icon(Icons.lightbulb, color: Colors.green),
      title: Text(item['title'] ?? 'Recommendation'),
      subtitle: Text(item['message'] ?? ''),
    );
  }

  Widget _dayLine(Map<String, dynamic> day) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Text('${day['date'] ?? ''}: ${day['weather_desc'] ?? ''} / ${day['avg_temp'] ?? ''}°C / rain ${day['precip_mm'] ?? ''}mm'),
    );
  }
}
