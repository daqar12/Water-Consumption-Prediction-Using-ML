import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

class AppConfig {
  AppConfig._();

  /// Android emulator reaches the host machine via 10.0.2.2.
  /// Physical devices should use your PC's LAN IP (e.g. http://192.168.x.x:8000).
  static String get apiBaseUrl {
    if (kIsWeb) return 'http://127.0.0.1:8000';
    try {
      if (Platform.isAndroid) return 'http://10.0.2.2:8000';
    } catch (_) {}
    return 'http://127.0.0.1:8000';
  }

  static const int sessionMinutes = 60;

  static const List<String> branches = [
    'Bakaaro',
    'Dayniile',
    'Garasbaaleey',
    'Hodan',
    'Waaberi',
    'Xamar Jajab',
    'Xamar Wayne',
  ];

  static const Map<String, List<String>> branchZones = {
    'Bakaaro': [
      'Yaaqshiid',
      'W.Nabada 2',
      'W.Nabada 1',
      'H.Wadaag 2',
      'H.Wadaag 1',
    ],
    'Dayniile': ['Gubta 1', 'Gubta 2', 'Raadeel', 'Oodweyne', 'Wardheere'],
    'Garasbaaleey': ['Tabeelaha', 'Tareedisho', 'Galmudug', 'Warlalis'],
    'Hodan': ['Zope', 'Seebiyaano'],
    'Waaberi': ['Maajo', 'Buulo Weekiyo', 'Tareebiyaano'],
    'Xamar Jajab': ['Buundada'],
    'Xamar Wayne': ['Beerta'],
  };

  static const Map<String, String> modelDisplayNames = {
    'linear_regression': 'Linear Regression',
    'decision_tree': 'Decision Tree',
    'random_forest': 'Random Forest',
    'gradient_boosting': 'Gradient Boosting',
    'xgboost': 'XGBoost',
    'tuned_random_forest': 'Tuned Random Forest',
    'tuned_xgboost': 'Tuned XGBoost',
    'final_model': 'Final Model',
  };
}
