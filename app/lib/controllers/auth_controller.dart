import 'package:flutter/foundation.dart';
import 'package:app/models/user_model.dart';
import 'package:app/services/auth_service.dart';
import 'package:app/services/session_service.dart';

class AuthController extends ChangeNotifier {
  AuthController(this._auth, this._session);

  final AuthService _auth;
  final SessionService _session;

  bool loading = false;
  String? error;

  UserModel? get user => _session.user;
  bool get isLoggedIn => _session.isLoggedIn;
  bool get isAdmin => user?.isAdmin ?? false;

  Future<bool> login(String email, String password) async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      await _auth.login(email.trim(), password);
      loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      error = e.toString().replaceFirst('ApiException: ', '');
      loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _auth.logout();
    notifyListeners();
  }

  void clearError() {
    error = null;
    notifyListeners();
  }
}
