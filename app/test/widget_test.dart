import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:app/config/app_theme.dart';

void main() {
  test('AppColors primary matches web brand', () {
    expect(AppColors.primary, const Color(0xFF0B1FF6));
  });
}
