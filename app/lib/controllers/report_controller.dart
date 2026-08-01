import 'package:flutter/foundation.dart';
import 'package:app/models/report_model.dart';
import 'package:app/services/report_service.dart';

class ReportController extends ChangeNotifier {
  ReportController(this._service);

  final ReportService _service;

  bool loading = false;
  String? exportingFormat;
  String? error;
  String? exportMessage;
  ReportSummary? summary;
  ReportCharts? charts;
  ExportResult? lastExport;

  bool get isExporting => exportingFormat != null;

  Future<void> load() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      final results = await Future.wait([
        _service.getSummary(),
        _service.getCharts(),
      ]);
      summary = results[0] as ReportSummary;
      charts = results[1] as ReportCharts;
    } catch (e) {
      error = e.toString();
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  Future<ExportResult?> export(String format) async {
    exportingFormat = format;
    error = null;
    exportMessage = null;
    lastExport = null;
    notifyListeners();
    try {
      final result = await _service.downloadReport(format);
      lastExport = result;
      exportMessage = '${format.toUpperCase()} downloaded';
      return result;
    } catch (e) {
      error = e.toString().replaceFirst('Exception: ', '');
      return null;
    } finally {
      exportingFormat = null;
      notifyListeners();
    }
  }
}
