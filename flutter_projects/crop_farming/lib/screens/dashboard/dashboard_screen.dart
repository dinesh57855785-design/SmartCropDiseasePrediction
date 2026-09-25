import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:crop_farming/app.dart';
import 'package:crop_farming/services/api_service.dart';
import 'package:crop_farming/widgets/smartcrop_drawer.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _loading = false;
  Map<String, dynamic>? _stats;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final response = await ApiService.get('/dashboard/stats/');
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() => _stats = data is Map<String, dynamic> ? data : Map<String, dynamic>.from(data));
      }
    } catch (_) {
      setState(() => _stats = {'error': 'Dashboard unavailable'});
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: const SmartCropDrawer(),
      appBar: AppBar(
        title: const Text('SmartCrop Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await ApiService.clearSession();
              if (!mounted) return;
              Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
            },
          ),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final compact = constraints.maxWidth < 640;

          return _loading
              ? const Center(child: CircularProgressIndicator(color: SmartCropPalette.accent))
              : SingleChildScrollView(
                  padding: EdgeInsets.all(compact ? 14 : 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      if (_stats != null && _stats!['error'] == null)
                        _buildDashboardCards(compact)
                      else
                        _statCard('Dashboard', _stats?['error'] ?? 'No data'),
                      const SizedBox(height: 18),
                      _sectionTitle('SmartCrop tools'),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: compact ? 12 : 16,
                        runSpacing: compact ? 12 : 16,
                        children: [
                          _navTile('Analyzer', Icons.document_scanner, '/analyzer', compact),
                          _navTile('Weather', Icons.cloud, '/weather', compact),
                          _navTile('Soil', Icons.eco, '/soil', compact),
                          _navTile('Reports', Icons.description, '/reports', compact),
                          _navTile('Planner', Icons.calendar_today, '/planner', compact),
                          _navTile('Chatbot', Icons.chat, '/chatbot', compact),
                          _navTile('History', Icons.history, '/report_history', compact),
                          _navTile('Recommendations', Icons.lightbulb, '/recommendations', compact),
                          _navTile('Alerts', Icons.notifications, '/alerts', compact),
                          _navTile('Profile', Icons.person, '/profile', compact),
                          _navTile('Growth', Icons.eco, '/growth', compact),
                          _navTile('Important Things', Icons.menu_book, '/important-things', compact),
                        ],
                      ),
                    ],
                  ),
                );
        },
      ),
    );
  }

  Widget _sectionTitle(String text) {
    return Text(
      text,
      style: const TextStyle(
        color: SmartCropPalette.accent,
        fontSize: 16,
        fontWeight: FontWeight.w800,
        letterSpacing: 0.2,
      ),
    );
  }

  Widget _buildDashboardCards(bool compact) {
    final total = (_stats?['total_predictions'] ?? 0).toString();
    final healthy = (_stats?['healthy_count'] ?? 0).toString();
    final diseased = (_stats?['diseased_count'] ?? 0).toString();
    final breakdown = _stats?['disease_breakdown'] as List<dynamic>? ?? <dynamic>[];
    final recent = _stats?['recent_predictions'] as List<dynamic>? ?? <dynamic>[];

    final statsChildren = [
      _statTile('Total predictions', total, Icons.bar_chart),
      _statTile('Healthy', healthy, Icons.check_circle),
      _statTile('Diseased', diseased, Icons.warning_amber),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        compact
            ? Wrap(
                spacing: 12,
                runSpacing: 12,
                children: statsChildren.map((tile) => SizedBox(width: 170, child: tile)).toList(),
              )
            : Row(
                children: statsChildren.map((tile) => Expanded(child: tile)).toList(),
              ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: SmartCropPalette.cardDecoration(radius: 18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Disease breakdown',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: SmartCropPalette.accent),
              ),
              const SizedBox(height: 10),
              if (breakdown.isEmpty)
                const Text('No breakdown available', style: TextStyle(color: SmartCropPalette.textSecondary))
              else
                ...breakdown.map((e) => _breakdownChip(e as Map<String, dynamic>)),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: SmartCropPalette.cardDecoration(radius: 18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Recent predictions',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: SmartCropPalette.accent),
              ),
              const SizedBox(height: 10),
              if (recent.isEmpty)
                const Text('No recent predictions', style: TextStyle(color: SmartCropPalette.textSecondary))
              else
                ...recent.map((e) => _recentRow(e as Map<String, dynamic>)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _statTile(String label, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: SmartCropPalette.cardDecoration(radius: 16),
      child: Row(
        children: [
          Icon(icon, color: SmartCropPalette.accentStrong, size: 28),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: SmartCropPalette.textSecondary),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: SmartCropPalette.textPrimary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _breakdownChip(Map<String, dynamic> item) {
    final disease = item['predicted_disease'] ?? 'Unknown disease';
    final count = item['count'] ?? 0;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          const Icon(Icons.circle, size: 10, color: SmartCropPalette.accentStrong),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              disease.toString(),
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: SmartCropPalette.textPrimary),
            ),
          ),
          const SizedBox(width: 12),
          Text(
            count.toString(),
            style: const TextStyle(color: SmartCropPalette.textSecondary, fontWeight: FontWeight.w700),
          ),
        ],
      ),
    );
  }

  Widget _recentRow(Map<String, dynamic> item) {
    final crop = item['crop_name'] ?? 'Unknown crop';
    final disease = item['predicted_disease'] ?? 'Unknown disease';
    final confidence = item['confidence'] is num ? (item['confidence'] as num).toString() : '0.0';
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          const Icon(Icons.history, color: SmartCropPalette.accentStrong),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '$crop — $disease',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: SmartCropPalette.textPrimary, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 2),
                Text(
                  'confidence: $confidence',
                  style: const TextStyle(color: SmartCropPalette.textSecondary, fontSize: 12),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _statCard(String title, String value) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: SmartCropPalette.cardDecoration(radius: 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18, color: SmartCropPalette.accent)),
          const SizedBox(height: 10),
          Text(value, style: const TextStyle(color: SmartCropPalette.textPrimary)),
        ],
      ),
    );
  }

  Widget _navTile(String name, IconData icon, String route, bool compact) {
    final width = compact ? (MediaQuery.of(context).size.width - 82) / 2 : 170.0;

    return SizedBox(
      width: width.clamp(140.0, 210.0),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(18),
          onTap: () => Navigator.pushNamed(context, route),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: SmartCropPalette.cardDecoration(radius: 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, size: 34, color: SmartCropPalette.accentStrong),
                const SizedBox(height: 10),
                Flexible(
                  child: Text(
                    name,
                    textAlign: TextAlign.center,
                    softWrap: true,
                    style: const TextStyle(
                      color: SmartCropPalette.textPrimary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
