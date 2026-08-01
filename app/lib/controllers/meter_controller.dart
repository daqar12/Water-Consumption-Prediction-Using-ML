import 'package:flutter/foundation.dart';
import 'package:app/models/prediction_model.dart';
import 'package:app/services/prediction_service.dart';

class MeterController extends ChangeNotifier {
  MeterController(this._service);

  final PredictionService _service;

  bool loading = false;
  String? error;
  String search = '';
  String? statusFilter;
  List<PredictionModel> readings = [];

  Future<void> load() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      readings = await _service.list(
        limit: 100,
        search: search,
        status: statusFilter,
      );
    } catch (e) {
      error = e.toString();
      readings = [];
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  void setSearch(String value) {
    search = value;
    notifyListeners();
  }

  void setStatus(String? status) {
    statusFilter = status;
    load();
  }
}
