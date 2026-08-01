import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:app/config/app_config.dart';
import 'package:app/models/user_model.dart';

class SessionService {
  static const _tokenKey = 'session_token';
  static const _userKey = 'user';
  static const _expiresKey = 'session_expires_at';

  SharedPreferences? _prefs;
  String? _token;
  UserModel? _user;
  int? _expiresAt;

  String? get token => _token;
  UserModel? get user => _user;
  bool get isLoggedIn =>
      _token != null &&
      _token!.isNotEmpty &&
      _user != null &&
      !isExpired;

  bool get isExpired {
    if (_expiresAt == null) return false;
    return DateTime.now().millisecondsSinceEpoch > _expiresAt!;
  }

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    _token = _prefs!.getString(_tokenKey);
    _expiresAt = _prefs!.getInt(_expiresKey);
    final raw = _prefs!.getString(_userKey);
    if (raw != null) {
      try {
        _user = UserModel.fromJson(jsonDecode(raw) as Map<String, dynamic>);
      } catch (_) {
        _user = null;
      }
    }
    if (isExpired) {
      await clear();
    }
  }

  Future<void> save(String token, UserModel user) async {
    _token = token;
    _user = user;
    _expiresAt = DateTime.now()
        .add(const Duration(minutes: AppConfig.sessionMinutes))
        .millisecondsSinceEpoch;

    final prefs = _prefs ?? await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_userKey, jsonEncode(user.toJson()));
    await prefs.setInt(_expiresKey, _expiresAt!);
    _prefs = prefs;
  }

  Future<void> clear() async {
    _token = null;
    _user = null;
    _expiresAt = null;
    final prefs = _prefs ?? await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
    await prefs.remove(_expiresKey);
    _prefs = prefs;
  }
}
