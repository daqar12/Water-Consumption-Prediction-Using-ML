import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:app/models/report_model.dart';
import 'package:app/services/api_service.dart';

class ExportResult {
  const ExportResult({
    required this.path,
    required this.fileName,
    required this.format,
  });

  final String path;
  final String fileName;
  final String format;
}

class ReportService {
  ReportService(this._api);

  final ApiService _api;

  static const Map<String, String> formatExtensions = {
    'pdf': '.pdf',
    'excel': '.xlsx',
    'csv': '.csv',
  };

  Future<ReportSummary> getSummary() async {
    final data = await _api.get('/reports/summary') as Map<String, dynamic>;
    return ReportSummary.fromJson(data);
  }

  Future<ReportCharts> getCharts() async {
    final data = await _api.get('/reports/charts') as Map<String, dynamic>;
    return ReportCharts.fromJson(data);
  }

  Future<http.Response> exportBytes(String format) {
    return _api.getBytes('/reports/export/$format');
  }

  Future<ExportResult> downloadReport(String format) async {
    final key = format.toLowerCase();
    final ext = formatExtensions[key] ?? '.$key';
    final fileName =
        'prediction_history_report_${DateTime.now().millisecondsSinceEpoch}$ext';

    final response = await exportBytes(key);
    final dir = await getApplicationDocumentsDirectory();
    final reportsDir = Directory('${dir.path}/reports');
    if (!await reportsDir.exists()) {
      await reportsDir.create(recursive: true);
    }

    final file = File('${reportsDir.path}/$fileName');
    await file.writeAsBytes(response.bodyBytes, flush: true);

    return ExportResult(
      path: file.path,
      fileName: fileName,
      format: key,
    );
  }
}
