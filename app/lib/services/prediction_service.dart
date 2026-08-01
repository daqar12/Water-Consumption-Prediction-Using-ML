import 'package:app/models/prediction_model.dart';
import 'package:app/services/api_service.dart';

class PredictionService {
  PredictionService(this._api);

  final ApiService _api;

  Future<PredictionModel> create(PredictionPayload payload) async {
    final data = await _api.post('/predictions', body: payload.toJson())
        as Map<String, dynamic>;
    return PredictionModel.fromJson(data);
  }

  Future<List<PredictionModel>> list({
    int page = 1,
    int limit = 50,
    String sortOrder = 'desc',
    String? search,
    String? branch,
    String? status,
  }) async {
    final query = <String, String>{
      'page': '$page',
      'limit': '$limit',
      'sort_order': sortOrder,
      if (search != null && search.isNotEmpty) 'search': search,
      if (branch != null && branch.isNotEmpty) 'branch': branch,
      if (status != null && status.isNotEmpty) 'status': status,
    };
    final data = await _api.get('/predictions', query: query);
    if (data is Map && data['data'] is List) {
      return (data['data'] as List)
          .map((e) => PredictionModel.fromJson(e as Map<String, dynamic>))
          .toList();
    }
    if (data is List) {
      return data
          .map((e) => PredictionModel.fromJson(e as Map<String, dynamic>))
          .toList();
    }
    return [];
  }
}
