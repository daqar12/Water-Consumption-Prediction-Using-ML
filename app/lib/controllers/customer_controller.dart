import 'package:flutter/foundation.dart';
import 'package:app/models/customer_model.dart';
import 'package:app/services/customer_service.dart';

class CustomerController extends ChangeNotifier {
  CustomerController(this._service);

  final CustomerService _service;

  static const int pageSize = 10;

  bool loading = false;
  bool uploading = false;
  String? error;
  String? success;
  String search = '';
  List<CustomerModel> customers = [];
  int page = 1;
  int total = 0;
  int totalPages = 1;

  bool get hasPrev => page > 1;
  bool get hasNext => page < totalPages;

  int get fromRow {
    if (total == 0) return 0;
    return ((page - 1) * pageSize) + 1;
  }

  int get toRow {
    if (total == 0) return 0;
    final end = page * pageSize;
    return end > total ? total : end;
  }

  Future<void> load({int? pageNumber, String? query}) async {
    loading = true;
    error = null;
    if (pageNumber != null) page = pageNumber;
    if (query != null) search = query;
    notifyListeners();
    try {
      final result = await _service.getCustomers(
        page: page,
        limit: pageSize,
      );
      var rows = result.customers;
      final q = search.trim().toLowerCase();
      if (q.isNotEmpty) {
        rows = rows
            .where((c) =>
                c.customerName.toLowerCase().contains(q) ||
                c.branch.toLowerCase().contains(q) ||
                c.zone.toLowerCase().contains(q))
            .toList();
      }
      customers = rows;
      total = result.total;
      page = result.page;
      totalPages = result.totalPages < 1 ? 1 : result.totalPages;
    } catch (e) {
      error = e.toString();
      customers = [];
      total = 0;
      totalPages = 1;
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  Future<void> nextPage() async {
    if (!hasNext || loading) return;
    await load(pageNumber: page + 1);
  }

  Future<void> prevPage() async {
    if (!hasPrev || loading) return;
    await load(pageNumber: page - 1);
  }

  Future<void> goToPage(int pageNumber) async {
    if (pageNumber < 1 || pageNumber > totalPages || loading) return;
    await load(pageNumber: pageNumber);
  }

  Future<bool> upload({
    required String fileName,
    required List<int> bytes,
  }) async {
    uploading = true;
    error = null;
    success = null;
    notifyListeners();
    try {
      await _service.uploadFile(fileName: fileName, bytes: bytes);
      success = 'File uploaded successfully';
      await load(pageNumber: 1);
      return true;
    } catch (e) {
      error = e.toString();
      return false;
    } finally {
      uploading = false;
      notifyListeners();
    }
  }
}
