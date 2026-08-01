class CustomerModel {
  final int id;
  final String customerName;
  final String branch;
  final String zone;
  final num september;
  final num october;
  final num november;

  const CustomerModel({
    required this.id,
    required this.customerName,
    required this.branch,
    required this.zone,
    required this.september,
    required this.october,
    required this.november,
  });

  factory CustomerModel.fromJson(Map<String, dynamic> json) {
    return CustomerModel(
      id: json['id'] as int,
      customerName: (json['Customer_Name'] ?? json['customer_name'] ?? '') as String,
      branch: (json['Branch'] ?? json['branch'] ?? '') as String,
      zone: (json['Zone'] ?? json['zone'] ?? '') as String,
      september: (json['september'] ?? 0) as num,
      october: (json['october'] ?? 0) as num,
      november: (json['november'] ?? 0) as num,
    );
  }
}

class BranchOverview {
  final String name;
  final num total;

  const BranchOverview({required this.name, required this.total});

  factory BranchOverview.fromJson(Map<String, dynamic> json) {
    return BranchOverview(
      name: (json['name'] ?? '') as String,
      total: (json['total'] ?? 0) as num,
    );
  }
}
