import 'package:flutter/foundation.dart';
import 'package:app/config/app_config.dart';
import 'package:app/models/prediction_model.dart';
import 'package:app/services/prediction_service.dart';

class PredictionController extends ChangeNotifier {
  PredictionController(this._service);

  final PredictionService _service;

  bool loading = false;
  bool historyLoading = false;
  String? error;
  PredictionModel? result;
  List<PredictionModel> history = [];

  String september = '';
  String october = '';
  String branch = '';
  String zone = '';
  String notes = '';

  List<String> get zones =>
      AppConfig.branchZones[branch] ?? const <String>[];

  void setBranch(String value) {
    branch = value;
    zone = '';
    notifyListeners();
  }

  void setZone(String value) {
    zone = value;
    notifyListeners();
  }

  Future<void> loadHistory() async {
    historyLoading = true;
    notifyListeners();
    try {
      history = await _service.list(limit: 50);
    } catch (_) {
      history = [];
    } finally {
      historyLoading = false;
      notifyListeners();
    }
  }

  Future<bool> predict() async {
    error = null;
    final sep = double.tryParse(september);
    final oct = double.tryParse(october);

    if (sep == null || oct == null) {
      error = 'Enter valid September and October consumption';
      notifyListeners();
      return false;
    }
    if (branch.isEmpty || zone.isEmpty) {
      error = 'Select branch and zone';
      notifyListeners();
      return false;
    }

    loading = true;
    notifyListeners();
    try {
      result = await _service.create(
        PredictionPayload(
          september: sep,
          october: oct,
          branch: branch,
          zone: zone,
          notes: notes,
        ),
      );
      await loadHistory();
      return true;
    } catch (e) {
      error = e.toString().replaceFirst('Exception: ', '');
      result = null;
      return false;
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  void clearResult() {
    result = null;
    error = null;
    notifyListeners();
  }
}
