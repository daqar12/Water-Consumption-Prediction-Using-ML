import 'package:app/models/user_model.dart';
import 'package:app/services/api_service.dart';

class UserService {
  UserService(this._api);

  final ApiService _api;

  Future<List<UserModel>> getUsers() async {
    final data = await _api.get('/users');
    if (data is! List) return [];
    return data
        .map((e) => UserModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<int> getTotalUsers() async {
    final data = await _api.get('/users/all');
    if (data is Map) return (data['total'] ?? 0) as int;
    return 0;
  }

  Future<UserModel> createUser({
    required String username,
    required String fullname,
    required String email,
    required String phone,
    required String password,
  }) async {
    final data = await _api.post('/users', body: {
      'username': username,
      'fullname': fullname,
      'email': email,
      'phone': phone,
      'password': password,
    }) as Map<String, dynamic>;
    return UserModel.fromJson(data);
  }

  Future<UserModel> updateUser({
    required int id,
    required String fullname,
    required String email,
    required String phone,
    String? password,
  }) async {
    final body = <String, dynamic>{
      'fullname': fullname,
      'email': email,
      'phone': phone,
      if (password != null && password.isNotEmpty) 'password': password,
    };
    final data = await _api.put('/users/$id', body: body) as Map<String, dynamic>;
    return UserModel.fromJson(data);
  }
}
