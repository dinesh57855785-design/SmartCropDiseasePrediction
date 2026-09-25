import 'package:flutter/material.dart';
import 'package:crop_farming/screens/auth/login_screen.dart';
import 'package:crop_farming/screens/auth/register_screen.dart';
import 'package:crop_farming/screens/camera/image_capture_screen.dart';
import 'package:crop_farming/screens/chatbot/chatbot_screen.dart';
import 'package:crop_farming/screens/dashboard/dashboard_screen.dart';
import 'package:crop_farming/screens/farming_planner/planner_screen.dart';
import 'package:crop_farming/screens/prediction/prediction_result_screen.dart';
import 'package:crop_farming/screens/profile/profile_screen.dart';
import 'package:crop_farming/screens/recommendations/recommendation_screen.dart';
import 'package:crop_farming/screens/reports/report_history_screen.dart';
import 'package:crop_farming/screens/reports/report_screen.dart';
import 'package:crop_farming/screens/soil/soil_screen.dart';
import 'package:crop_farming/screens/splash_screen.dart';
import 'package:crop_farming/screens/weather/weather_screen.dart';
import 'package:crop_farming/screens/alerts/alerts_screen.dart';
import 'package:crop_farming/screens/analyzer/analyzer_screen.dart';
import 'package:crop_farming/screens/growth/crop_growth_screen.dart';
import 'package:crop_farming/screens/important_things/important_things_screen.dart';
import 'package:crop_farming/screens/water/water_screen.dart';

class SmartCropPalette {
  static const Color background = Color(0xFF0d1f0d);
  static const Color panel1 = Color(0xFF1a2e1a);
  static const Color panel2 = Color(0xFF1e3a1e);
  static const Color border = Color(0xFF2d5a27);
  static const Color accent = Color(0xFF7dd56f);
  static const Color accentStrong = Color(0xFF4caf50);
  static const Color accentDeep = Color(0xFF2e7d32);
  static const Color textPrimary = Color(0xFFE8F5E9);
  static const Color textSecondary = Color(0xFFA5D6A7);
  static const Color textMuted = Color(0xFFC8E6C9);
  static const Color danger = Color(0xFFFF7043);
  static const Color warning = Color(0xFFFFB74D);
  static const Color info = Color(0xFF81D4FA);
  static const Color panelSurface = Color(0x33000000);

  static BoxDecoration cardDecoration({double radius = 18, bool muted = false}) {
    return BoxDecoration(
      gradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: muted
            ? [const Color(0xFF1a2e1a), const Color(0xFF1e3a1e)]
            : [const Color(0xFF1a2e1a), const Color(0xFF1e3a1e)],
      ),
      border: Border.all(color: border),
      borderRadius: BorderRadius.circular(radius),
      boxShadow: const [
        BoxShadow(
          color: Color(0x66000000),
          blurRadius: 18,
          offset: Offset(0, 8),
        ),
      ],
    );
  }

  static TextStyle heading({double size = 18, FontWeight weight = FontWeight.w800, Color color = accent}) {
    return TextStyle(
      fontSize: size,
      fontWeight: weight,
      color: color,
      letterSpacing: 0.2,
    );
  }
}

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SmartCrop',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: SmartCropPalette.accentStrong, brightness: Brightness.dark),
        useMaterial3: true,
        scaffoldBackgroundColor: SmartCropPalette.background,
        fontFamily: 'Roboto',
        appBarTheme: const AppBarTheme(
          backgroundColor: SmartCropPalette.panel1,
          foregroundColor: SmartCropPalette.textPrimary,
          elevation: 0,
          centerTitle: true,
          titleTextStyle: TextStyle(
            color: SmartCropPalette.accent,
            fontSize: 22,
            fontWeight: FontWeight.w800,
          ),
        ),
        cardTheme: const CardThemeData(
          color: SmartCropPalette.panel1,
          elevation: 0,
          margin: EdgeInsets.zero,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(18)),
            side: BorderSide(color: SmartCropPalette.border),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: const Color(0x22000000),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: SmartCropPalette.border),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: SmartCropPalette.border),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: SmartCropPalette.accent),
          ),
          labelStyle: const TextStyle(color: SmartCropPalette.textSecondary),
          hintStyle: const TextStyle(color: SmartCropPalette.textSecondary),
        ),
      ),
      routes: {
        '/splash': (context) => const SplashScreen(),
        '/login': (context) => const LoginScreen(),
        '/register': (context) => const RegisterScreen(),
        '/dashboard': (context) => const DashboardScreen(),
        '/analyzer': (context) => const AnalyzerScreen(),
        '/capture': (context) => const ImageCaptureScreen(),
        '/prediction_result': (context) => const PredictionResultScreen(),
        '/weather': (context) => const WeatherScreen(),
        '/soil': (context) => const SoilScreen(),
        '/water': (context) => const WaterScreen(),
        '/recommendations': (context) => const RecommendationScreen(),
        '/reports': (context) => const ReportScreen(),
        '/report': (context) => const ReportScreen(),
        '/report_history': (context) => const ReportHistoryScreen(),
        '/report-history': (context) => const ReportHistoryScreen(),
        '/chatbot': (context) => const ChatbotScreen(),
        '/planner': (context) => const PlannerScreen(),
        '/alerts': (context) => const AlertsScreen(),
        '/profile': (context) => const ProfileScreen(),
        '/growth': (context) => const CropGrowthScreen(),
        '/important-things': (context) => const ImportantThingsScreen(),
      },
      home: const SplashScreen(),
    );
  }
}
