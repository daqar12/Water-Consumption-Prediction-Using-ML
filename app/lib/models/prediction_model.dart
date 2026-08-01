class PredictionModel {
  final int id;
  final int? customerId;
  final String? customerName;
  final String? meterNumber;
  final String branch;
  final String zone;
  final double septemberConsumption;
  final double octoberConsumption;
  final double decisionTreePrediction;
  final double gradientBoostingPrediction;
  final double linearRegressionPrediction;
  final double randomForestPrediction;
  final double tunedRandomForestPrediction;
  final double tunedXgboostPrediction;
  final double xgboostPrediction;
  final double finalPrediction;
  final String predictionStatus;
  final String? notes;
  final String? createdAt;
  final double previous;
  final double current;
  final double consumption;
  final double mlPredicted;
  final double variance;
  final String status;
  final String readDate;
  final String reader;
  final int? userId;
  final String? userFullname;

  const PredictionModel({
    required this.id,
    this.customerId,
    this.customerName,
    this.meterNumber,
    required this.branch,
    required this.zone,
    required this.septemberConsumption,
    required this.octoberConsumption,
    required this.decisionTreePrediction,
    required this.gradientBoostingPrediction,
    required this.linearRegressionPrediction,
    required this.randomForestPrediction,
    required this.tunedRandomForestPrediction,
    required this.tunedXgboostPrediction,
    required this.xgboostPrediction,
    required this.finalPrediction,
    required this.predictionStatus,
    this.notes,
    this.createdAt,
    required this.previous,
    required this.current,
    required this.consumption,
    required this.mlPredicted,
    required this.variance,
    required this.status,
    required this.readDate,
    required this.reader,
    this.userId,
    this.userFullname,
  });

  Map<String, double> get allModelPredictions => {
        'linear_regression': linearRegressionPrediction,
        'decision_tree': decisionTreePrediction,
        'random_forest': randomForestPrediction,
        'gradient_boosting': gradientBoostingPrediction,
        'xgboost': xgboostPrediction,
        'tuned_random_forest': tunedRandomForestPrediction,
        'tuned_xgboost': tunedXgboostPrediction,
        'final_model': finalPrediction,
      };

  factory PredictionModel.fromJson(Map<String, dynamic> json) {
    double d(dynamic v) => (v is num) ? v.toDouble() : double.tryParse('$v') ?? 0;

    return PredictionModel(
      id: json['id'] as int,
      customerId: json['customer_id'] as int?,
      customerName: json['customer_name'] as String?,
      meterNumber: json['meter_number'] as String?,
      branch: (json['branch'] ?? '') as String,
      zone: (json['zone'] ?? '') as String,
      septemberConsumption: d(json['september_consumption']),
      octoberConsumption: d(json['october_consumption']),
      decisionTreePrediction: d(json['decision_tree_prediction']),
      gradientBoostingPrediction: d(json['gradient_boosting_prediction']),
      linearRegressionPrediction: d(json['linear_regression_prediction']),
      randomForestPrediction: d(json['random_forest_prediction']),
      tunedRandomForestPrediction: d(json['tuned_random_forest_prediction']),
      tunedXgboostPrediction: d(json['tuned_xgboost_prediction']),
      xgboostPrediction: d(json['xgboost_prediction']),
      finalPrediction: d(json['final_prediction']),
      predictionStatus: (json['prediction_status'] ?? json['status'] ?? 'normal') as String,
      notes: json['notes'] as String?,
      createdAt: json['created_at']?.toString(),
      previous: d(json['previous'] ?? json['september_consumption']),
      current: d(json['current'] ?? json['october_consumption']),
      consumption: d(json['consumption'] ?? json['final_prediction']),
      mlPredicted: d(json['ml_predicted'] ?? json['final_prediction']),
      variance: d(json['variance']),
      status: (json['status'] ?? json['prediction_status'] ?? 'normal') as String,
      readDate: (json['read_date'] ?? '') as String,
      reader: (json['reader'] ?? json['user_fullname'] ?? '') as String,
      userId: json['user_id'] as int?,
      userFullname: json['user_fullname'] as String?,
    );
  }
}

class PredictionPayload {
  final double september;
  final double october;
  final String branch;
  final String zone;
  final String? notes;

  const PredictionPayload({
    required this.september,
    required this.october,
    required this.branch,
    required this.zone,
    this.notes,
  });

  Map<String, dynamic> toJson() => {
        'September': september,
        'October': october,
        'Branch': branch,
        'Zone': zone,
        if (notes != null && notes!.isNotEmpty) 'notes': notes,
      };
}
