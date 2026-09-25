import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'api_config.dart';

class ApiService {
  static const Duration requestTimeout = Duration(seconds: 90);

  static String get baseUrl => ApiConfig.effectiveBaseUrl;

  static Future<void> configureBaseUrl({String? url}) =>
      ApiConfig.configure(url: url);

  static Future<http.Response> get(
    String path, {
    Map<String, String>? query,
  }) async {
    final uri = Uri.parse(
      '${ApiConfig.effectiveBaseUrl}$path',
    ).replace(queryParameters: query);
    final token = await getToken();
    final req = http.Request('GET', uri);
    req.headers['Authorization'] = token == null ? '' : 'Bearer $token';
    req.headers['Content-Type'] = 'application/json';
    final res = await req.send().timeout(requestTimeout);
    return http.Response.fromStream(res);
  }

  static Future<http.Response> post(
    String path,
    Map<String, dynamic> body,
  ) async {
    final uri = Uri.parse('${ApiConfig.effectiveBaseUrl}$path');
    final token = await getToken();
    final headers = <String, String>{
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
    return http
        .post(uri, headers: headers, body: jsonEncode(body))
        .timeout(requestTimeout);
  }

  static Future<http.Response> postMultipart(
    String path,
    Map<String, String> fields, {
    File? imageFile,
  }) async {
    final uri = Uri.parse('${ApiConfig.effectiveBaseUrl}$path');
    final token = await getToken();
    final request = http.MultipartRequest('POST', uri);
    for (final entry in fields.entries) {
      request.fields[entry.key] = entry.value;
    }
    if (imageFile != null) {
      request.files.add(
        await http.MultipartFile.fromPath('image', imageFile.path),
      );
    }
    if (token != null) {
      request.headers['Authorization'] = 'Bearer $token';
    }
    final response = await request.send().timeout(requestTimeout);
    return http.Response.fromStream(response);
  }

  static Future<http.Response> put(
    String path,
    Map<String, dynamic> body,
  ) async {
    final uri = Uri.parse('${ApiConfig.effectiveBaseUrl}$path');
    final token = await getToken();
    final headers = <String, String>{
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
    return http
        .put(uri, headers: headers, body: jsonEncode(body))
        .timeout(requestTimeout);
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('access_token', token);
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('access_token');
  }

  static Future<void> saveRefreshToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('refresh_token', token);
  }

  static Future<String?> getRefreshToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('refresh_token');
  }

  static Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('access_token');
    await prefs.remove('refresh_token');
  }
}
