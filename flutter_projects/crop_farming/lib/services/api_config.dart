class ApiConfig {
  static const String defaultBaseUrl =
      'https://smartcrop-api-dzj2.onrender.com/api';

  static String _configuredUrl = defaultBaseUrl;

  static String get effectiveBaseUrl => _configuredUrl;

  static Future<void> configure({String? url}) async {
    _configuredUrl = (url ?? defaultBaseUrl).trim();
    if (_configuredUrl.isEmpty) {
      _configuredUrl = defaultBaseUrl;
    }
    if (!_configuredUrl.endsWith('/api')) {
      _configuredUrl = _configuredUrl.endsWith('/')
          ? '${_configuredUrl}api'
          : '$_configuredUrl/api';
    }
  }
}
