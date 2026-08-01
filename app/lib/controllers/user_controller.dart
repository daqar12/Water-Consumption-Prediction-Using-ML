import 'package:flutter/foundation.dart';
import 'package:app/models/user_model.dart';
import 'package:app/services/user_service.dart';

class UserController extends ChangeNotifier {
  UserController(this._service);

  final UserService _service;

  bool loading = false;
  bool saving = false;
  String? error;
  String? success;
  List<UserModel> users = [];

  Future<void> load() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      users = await _service.getUsers();
    } catch (e) {
      error = e.toString();
      users = [];
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  Future<bool> create({
    required String username,
    required String fullname,
    required String email,
    required String phone,
    required String password,
  }) async {
    saving = true;
    error = null;
    success = null;
    notifyListeners();
    try {
      await _service.createUser(
        username: username,
        fullname: fullname,
        email: email,
        phone: phone,
        password: password,
      );
      success = 'User created';
      await load();
      return true;
    } catch (e) {
      error = e.toString();
      return false;
    } finally {
      saving = false;
      notifyListeners();
    }
  }

  Future<bool> update({
    required int id,
    required String fullname,
    required String email,
    required String phone,
    String? password,
  }) async {
    saving = true;
    error = null;
    success = null;
    notifyListeners();
    try {
      await _service.updateUser(
        id: id,
        fullname: fullname,
        email: email,
        phone: phone,
        password: password,
      );
      success = 'User updated';
      await load();
      return true;
    } catch (e) {
      error = e.toString();
      return false;
    } finally {
      saving = false;
      notifyListeners();
    }
  }
}
