class ReportSummary {
  final String modelAccuracy;
  final int predictionsMade;
  final int anomaliesDetected;
  final int validatedPredictions;
  final double highestPrediction;
  final double lowestPrediction;

  const ReportSummary({
    required this.modelAccuracy,
    required this.predictionsMade,
    required this.anomaliesDetected,
    required this.validatedPredictions,
    required this.highestPrediction,
    required this.lowestPrediction,
  });

  factory ReportSummary.fromJson(Map<String, dynamic> json) {
    double d(dynamic v) => (v is num) ? v.toDouble() : double.tryParse('$v') ?? 0;
    return ReportSummary(
      modelAccuracy: (json['model_accuracy'] ?? '0%') as String,
      predictionsMade: (json['predictions_made'] ?? 0) as int,
      anomaliesDetected: (json['anomalies_detected'] ?? 0) as int,
      validatedPredictions: (json['validated_predictions'] ?? 0) as int,
      highestPrediction: d(json['highest_prediction']),
      lowestPrediction: d(json['lowest_prediction']),
    );
  }
}

class ChartBranchSummary {
  final String name;
  final double september;
  final double october;
  final double november;

  const ChartBranchSummary({
    required this.name,
    required this.september,
    required this.october,
    required this.november,
  });

  factory ChartBranchSummary.fromJson(Map<String, dynamic> json) {
    double d(dynamic v) => (v is num) ? v.toDouble() : double.tryParse('$v') ?? 0;
    return ChartBranchSummary(
      name: (json['name'] ?? '') as String,
      september: d(json['september']),
      october: d(json['october']),
      november: d(json['november']),
    );
  }
}

class ChartZoneItem {
  final String name;
  final double value;

  const ChartZoneItem({required this.name, required this.value});

  factory ChartZoneItem.fromJson(Map<String, dynamic> json) {
    return ChartZoneItem(
      name: (json['name'] ?? '') as String,
      value: ((json['value'] is num) ? json['value'] as num : 0).toDouble(),
    );
  }
}

class ChartAccuracyItem {
  final String name;
  final double actual;
  final double predicted;

  const ChartAccuracyItem({
    required this.name,
    required this.actual,
    required this.predicted,
  });

  factory ChartAccuracyItem.fromJson(Map<String, dynamic> json) {
    double d(dynamic v) => (v is num) ? v.toDouble() : double.tryParse('$v') ?? 0;
    return ChartAccuracyItem(
      name: (json['name'] ?? '') as String,
      actual: d(json['actual']),
      predicted: d(json['predicted']),
    );
  }
}

class ReportCharts {
  final List<ChartBranchSummary> branchSummary;
  final List<ChartZoneItem> zoneDistribution;
  final List<ChartAccuracyItem> predictionAccuracy;

  const ReportCharts({
    required this.branchSummary,
    required this.zoneDistribution,
    required this.predictionAccuracy,
  });

  factory ReportCharts.fromJson(Map<String, dynamic> json) {
    return ReportCharts(
      branchSummary: ((json['branch_summary'] as List?) ?? [])
          .map((e) => ChartBranchSummary.fromJson(e as Map<String, dynamic>))
          .toList(),
      zoneDistribution: ((json['zone_distribution'] as List?) ?? [])
          .map((e) => ChartZoneItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      predictionAccuracy: ((json['prediction_accuracy'] as List?) ?? [])
          .map((e) => ChartAccuracyItem.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}
