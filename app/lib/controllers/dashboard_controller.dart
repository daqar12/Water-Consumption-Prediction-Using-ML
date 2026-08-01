import 'package:flutter/foundation.dart';
import 'package:app/models/customer_model.dart';
import 'package:app/models/report_model.dart';
import 'package:app/services/customer_service.dart';
import 'package:app/services/report_service.dart';
import 'package:app/services/user_service.dart';

class DashboardController extends ChangeNotifier {
  DashboardController(this._customers, this._users, this._reports);

  final CustomerService _customers;
  final UserService _users;
  final ReportService _reports;

  bool loading = false;
  String? error;
  int totalCustomers = 0;
  int totalUsers = 0;
  double highestPrediction = 0;
  double lowestPrediction = 0;
  List<BranchOverview> branchOverview = [];

  Future<void> load() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      final results = await Future.wait([
        _customers.getTotalCustomers(),
        _users.getTotalUsers(),
        _customers.getOverview(),
        _reports.getSummary(),
      ]);
      totalCustomers = results[0] as int;
      totalUsers = results[1] as int;
      branchOverview = results[2] as List<BranchOverview>;
      final summary = results[3] as ReportSummary;
      highestPrediction = summary.highestPrediction;
      lowestPrediction = summary.lowestPrediction;
    } catch (e) {
      error = e.toString();
    } finally {
      loading = false;
      notifyListeners();
    }
  }
}
