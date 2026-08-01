class UserModel {
  final int id;
  final String username;
  final String fullname;
  final String email;
  final String? phone;
  final String role;

  const UserModel({
    required this.id,
    required this.username,
    required this.fullname,
    required this.email,
    this.phone,
    required this.role,
  });

  bool get isAdmin {
    final r = role.trim().toLowerCase();
    return r == 'admin' || r == 'administrator';
  }

  bool get isStaff => !isAdmin;

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as int,
      username: (json['username'] ?? '') as String,
      fullname: (json['fullname'] ?? '') as String,
      email: (json['email'] ?? '') as String,
      phone: json['phone'] as String?,
      role: (json['role'] ?? 'staff') as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'username': username,
        'fullname': fullname,
        'email': email,
        'phone': phone,
        'role': role,
      };

  UserModel copyWith({
    String? username,
    String? fullname,
    String? email,
    String? phone,
    String? role,
  }) {
    return UserModel(
      id: id,
      username: username ?? this.username,
      fullname: fullname ?? this.fullname,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      role: role ?? this.role,
    );
  }
}
