import 'package:app/models/customer_model.dart';
import 'package:app/services/api_service.dart';

class CustomersPageResult {
  const CustomersPageResult({
    required this.customers,
    required this.total,
    required this.page,
    required this.limit,
    required this.totalPages,
  });

  final List<CustomerModel> customers;
  final int total;
  final int page;
  final int limit;
  final int totalPages;
}

class CustomerService {
  CustomerService(this._api);

  final ApiService _api;

  Future<CustomersPageResult> getCustomers({
    int page = 1,
    int limit = 10,
  }) async {
    final query = <String, String>{
      'page': '$page',
      'limit': '$limit',
    };
    final data = await _api.get('/customers', query: query);

    if (data is Map) {
      final list = (data['data'] as List? ?? [])
          .map((e) => CustomerModel.fromJson(e as Map<String, dynamic>))
          .toList();
      final total = (data['total'] ?? list.length) as int;
      final currentPage = (data['page'] ?? page) as int;
      final pageLimit = (data['limit'] ?? limit) as int;
      final totalPages = (data['total_pages'] as int?) ??
          ((total + pageLimit - 1) ~/ pageLimit).clamp(1, 1 << 30);
      return CustomersPageResult(
        customers: list,
        total: total,
        page: currentPage,
        limit: pageLimit,
        totalPages: totalPages < 1 ? 1 : totalPages,
      );
    }

    if (data is List) {
      final list = data
          .map((e) => CustomerModel.fromJson(e as Map<String, dynamic>))
          .toList();
      return CustomersPageResult(
        customers: list,
        total: list.length,
        page: 1,
        limit: limit,
        totalPages: 1,
      );
    }

    return CustomersPageResult(
      customers: const [],
      total: 0,
      page: page,
      limit: limit,
      totalPages: 1,
    );
  }

  Future<int> getTotalCustomers() async {
    final data = await _api.get('/customers/all');
    if (data is Map) return (data['total'] ?? 0) as int;
    return 0;
  }

  Future<List<BranchOverview>> getOverview() async {
    final data = await _api.get('/customers/overview');
    if (data is! List) return [];
    return data
        .map((e) => BranchOverview.fromJson(e as Map<String, dynamic>))
        .where((b) {
          final n = b.name.toLowerCase();
          return n.isNotEmpty && n != 'nan' && n != 'null';
        })
        .toList();
  }

  Future<void> uploadFile({
    required String fileName,
    required List<int> bytes,
  }) async {
    await _api.postMultipart(
      '/customers/upload',
      fieldName: 'file',
      fileName: fileName,
      bytes: bytes,
    );
  }
}
