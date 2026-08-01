import 'package:app/models/user_model.dart';
import 'package:app/services/api_service.dart';
import 'package:app/services/session_service.dart';

class AuthService {
  AuthService(this._api, this._session);

  final ApiService _api;
  final SessionService _session;

  Future<UserModel> login(String email, String password) async {
    final data = await _api.post(
      '/login',
      body: {'email': email, 'password': password},
      auth: false,
    ) as Map<String, dynamic>;

    final token = data['session_token'] as String?;
    final userJson = data['user'] as Map<String, dynamic>?;
    if (token == null || userJson == null) {
      throw ApiException('Invalid login response');
    }

    final user = UserModel.fromJson(userJson);
    await _session.save(token, user);
    return user;
  }

  Future<void> logout() async {
    final token = _session.token;
    if (token != null) {
      try {
        await _api.post('/logout', body: {'token': token}, auth: false);
      } catch (_) {}
    }
    await _session.clear();
  }
}
