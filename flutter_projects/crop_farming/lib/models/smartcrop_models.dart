class SmartCropUser {
  final int? id;
  final String username;
  final String? email;
  final String? firstName;
  final String? lastName;
  final String? phone;
  final String? role;

  SmartCropUser({
    this.id,
    required this.username,
    this.email,
    this.firstName,
    this.lastName,
    this.phone,
    this.role,
  });

  factory SmartCropUser.fromJson(Map<String, dynamic> json) {
    return SmartCropUser(
      id: json['id'] as int?,
      username: json['username'] ?? json['email'] ?? 'farmer',
      email: json['email'] as String?,
      firstName: json['first_name'] as String?,
      lastName: json['last_name'] as String?,
      phone: json['phone'] as String?,
      role: json['role'] as String?,
    );
  }
}

class DiseasePrediction {
  final int? id;
  final String cropName;
  final String predictedDisease;
  final String? diseaseKey;
  final double confidence;
  final String? treatmentAdvice;
  final bool isHealthy;
  final String? imageUrl;

  DiseasePrediction({
    this.id,
    required this.cropName,
    required this.predictedDisease,
    this.diseaseKey,
    required this.confidence,
    this.treatmentAdvice,
    required this.isHealthy,
    this.imageUrl,
  });

  factory DiseasePrediction.fromJson(Map<String, dynamic> json) {
    return DiseasePrediction(
      id: json['id'] as int?,
      cropName: json['crop_name'] ?? json['crop'] ?? 'Unknown',
      predictedDisease: json['predicted_disease'] ?? json['disease'] ?? 'Unknown',
      diseaseKey: json['disease_key'] ?? json['disease_key'],
      confidence: (json['confidence'] as num?)?.toDouble() ?? 0.0,
      treatmentAdvice: json['treatment_advice'] ?? json['treatment'] as String?,
      isHealthy: json['is_healthy'] == true,
      imageUrl: json['image'] ?? json['image_url'] as String?,
    );
  }
}

class Crop {
  final int id;
  final String name;

  Crop({required this.id, required this.name});

  factory Crop.fromJson(Map<String, dynamic> json) {
    return Crop(
      id: json['id'] as int? ?? 0,
      name: json['name'] ?? json['crop_name'] ?? 'Crop',
    );
  }
}

class WeatherInfo {
  final String summary;
  final double tempMax;
  final double tempMin;
  final double? humidity;
  final Map<String, dynamic>? raw;

  WeatherInfo({
    required this.summary,
    required this.tempMax,
    required this.tempMin,
    this.humidity,
    this.raw,
  });

  factory WeatherInfo.fromJson(Map<String, dynamic> json) {
    return WeatherInfo(
      summary: json['summary'] ?? 'Weather details',
      tempMax: (json['temperature_2m_max'] ?? json['max_temp'] ?? 0).toDouble(),
      tempMin: (json['temperature_2m_min'] ?? json['min_temp'] ?? 0).toDouble(),
      humidity: (json['avg_humidity_pct'] ?? json['humidity'])?.toDouble(),
      raw: json,
    );
  }
}

class ReportPayload {
  final String title;
  final String content;
  final String language;

  ReportPayload({required this.title, required this.content, required this.language});
}
