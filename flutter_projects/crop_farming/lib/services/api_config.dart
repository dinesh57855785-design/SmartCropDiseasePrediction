class ApiConfig {
  static const String emulatorBaseUrl = 'http://10.0.2.2:8000/api';
  static const String defaultBaseUrl = 'http://10.233.255.220:8000/api';
  static const String localNetworkHint =
      'Use the laptop LAN IP on the same Wi‑Fi network, currently 10.233.255.220.';

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
