import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SettingsController extends ChangeNotifier {
  static const _prefix = 'water_prediction_settings_';

  bool notifications = true;
  bool darkMode = false;
  String displayName = '';
  String email = '';
  bool loading = true;
  bool saving = false;
  String? message;

  Future<void> load() async {
    loading = true;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    notifications = prefs.getBool('${_prefix}notifications') ?? true;
    darkMode = prefs.getBool('${_prefix}darkMode') ?? false;
    displayName = prefs.getString('${_prefix}displayName') ?? '';
    email = prefs.getString('${_prefix}email') ?? '';
    loading = false;
    notifyListeners();
  }

  Future<void> save() async {
    saving = true;
    message = null;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('${_prefix}notifications', notifications);
    await prefs.setBool('${_prefix}darkMode', darkMode);
    await prefs.setString('${_prefix}displayName', displayName);
    await prefs.setString('${_prefix}email', email);
    saving = false;
    message = 'Settings saved';
    notifyListeners();
  }

  void setNotifications(bool value) {
    notifications = value;
    notifyListeners();
  }

  void setDarkMode(bool value) {
    darkMode = value;
    notifyListeners();
  }
}
