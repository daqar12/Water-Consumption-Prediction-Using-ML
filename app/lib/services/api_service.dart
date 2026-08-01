import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:app/config/app_config.dart';
import 'package:app/services/session_service.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

class ApiService {
  ApiService(this._session);

  final SessionService _session;
  final http.Client _client = http.Client();

  Uri _uri(String path, [Map<String, String>? query]) {
    final base = AppConfig.apiBaseUrl.replaceAll(RegExp(r'/$'), '');
    final normalized = path.startsWith('/') ? path : '/$path';
    return Uri.parse('$base$normalized').replace(queryParameters: query);
  }

  Map<String, String> _headers({bool auth = true, bool json = true}) {
    final headers = <String, String>{};
    if (json) headers['Content-Type'] = 'application/json';
    if (auth) {
      final token = _session.token;
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
    }
    return headers;
  }

  Future<dynamic> get(
    String path, {
    Map<String, String>? query,
    bool auth = true,
  }) async {
    final res = await _client.get(
      _uri(path, query),
      headers: _headers(auth: auth),
    );
    return _decode(res);
  }

  Future<dynamic> post(
    String path, {
    Object? body,
    bool auth = true,
  }) async {
    final res = await _client.post(
      _uri(path),
      headers: _headers(auth: auth),
      body: body == null ? null : jsonEncode(body),
    );
    return _decode(res);
  }

  Future<dynamic> put(
    String path, {
    Object? body,
    bool auth = true,
  }) async {
    final res = await _client.put(
      _uri(path),
      headers: _headers(auth: auth),
      body: body == null ? null : jsonEncode(body),
    );
    return _decode(res);
  }

  Future<dynamic> delete(String path, {bool auth = true}) async {
    final res = await _client.delete(
      _uri(path),
      headers: _headers(auth: auth),
    );
    return _decode(res);
  }

  Future<http.Response> getBytes(
    String path, {
    Map<String, String>? query,
  }) async {
    final res = await _client.get(
      _uri(path, query),
      headers: _headers(json: false),
    );
    if (res.statusCode >= 400) {
      throw ApiException('Export failed (${res.statusCode})', statusCode: res.statusCode);
    }
    return res;
  }

  Future<dynamic> postMultipart(
    String path, {
    required String fieldName,
    required String fileName,
    required List<int> bytes,
  }) async {
    final request = http.MultipartRequest('POST', _uri(path));
    final token = _session.token;
    if (token != null) {
      request.headers['Authorization'] = 'Bearer $token';
    }
    request.files.add(
      http.MultipartFile.fromBytes(fieldName, bytes, filename: fileName),
    );
    final streamed = await request.send();
    final res = await http.Response.fromStream(streamed);
    return _decode(res);
  }

  dynamic _decode(http.Response res) {
    dynamic data;
    if (res.body.isNotEmpty) {
      try {
        data = jsonDecode(res.body);
      } catch (_) {
        data = res.body;
      }
    }

    if (res.statusCode >= 400) {
      String message = 'Request failed (${res.statusCode})';
      if (data is Map) {
        final detail = data['detail'];
        if (detail is String) {
          message = detail;
        } else if (detail is List && detail.isNotEmpty) {
          message = detail.map((e) => e is Map ? e['msg'] : '$e').join(', ');
        } else if (data['message'] != null) {
          message = '${data['message']}';
        }
      }
      throw ApiException(message, statusCode: res.statusCode);
    }
    return data;
  }
}
