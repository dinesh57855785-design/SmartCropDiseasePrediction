import 'package:flutter/material.dart';
import 'package:crop_farming/app.dart';
import 'package:crop_farming/services/api_service.dart';

class SmartCropDrawer extends StatelessWidget {
  const SmartCropDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: SmartCropPalette.background,
      child: SafeArea(
        child: Column(
          children: [
            DrawerHeader(
              margin: EdgeInsets.zero,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [SmartCropPalette.panel1, SmartCropPalette.panel2],
                ),
              ),
              child: Align(
                alignment: Alignment.bottomLeft,
                child: Text('🌿 SmartCrop', style: SmartCropPalette.heading(size: 24)),
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 8),
                children: [
                  _item(context, 'Home / Dashboard', Icons.dashboard, '/dashboard'),
                  _item(context, 'Crop Analyzer', Icons.document_scanner, '/analyzer'),
                  _item(context, 'Weather', Icons.cloud, '/weather'),
                  _item(context, 'Planner', Icons.calendar_month, '/planner'),
                  _item(context, 'Crop Growth', Icons.eco, '/growth'),
                  _item(context, 'Report', Icons.description, '/report'),
                  _item(context, 'Report History', Icons.history, '/report-history'),
                  _item(context, 'Chatbot', Icons.chat, '/chatbot'),
                  _item(context, 'Alerts', Icons.notifications, '/alerts'),
                  _item(context, 'Important Things', Icons.menu_book, '/important-things'),
                  _item(context, 'Profile', Icons.person, '/profile'),
                ],
              ),
            ),
            const Divider(color: SmartCropPalette.border, height: 1),
            ListTile(
              leading: const Icon(Icons.logout, color: SmartCropPalette.danger),
              title: const Text('Logout', style: TextStyle(color: SmartCropPalette.textPrimary)),
              onTap: () async {
                await ApiService.clearSession();
                if (!context.mounted) return;
                Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _item(BuildContext context, String label, IconData icon, String route) {
    return ListTile(
      leading: Icon(icon, color: SmartCropPalette.accentStrong),
      title: Text(label, style: const TextStyle(color: SmartCropPalette.textPrimary)),
      onTap: () {
        Navigator.pop(context);
        if (ModalRoute.of(context)?.settings.name != route) {
          Navigator.pushReplacementNamed(context, route);
        }
      },
    );
  }
}
