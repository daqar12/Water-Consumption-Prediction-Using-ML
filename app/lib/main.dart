import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:app/config/app_theme.dart';
import 'package:app/controllers/auth_controller.dart';
import 'package:app/controllers/customer_controller.dart';
import 'package:app/controllers/dashboard_controller.dart';
import 'package:app/controllers/meter_controller.dart';
import 'package:app/controllers/prediction_controller.dart';
import 'package:app/controllers/report_controller.dart';
import 'package:app/controllers/settings_controller.dart';
import 'package:app/controllers/user_controller.dart';
import 'package:app/services/api_service.dart';
import 'package:app/services/auth_service.dart';
import 'package:app/services/customer_service.dart';
import 'package:app/services/prediction_service.dart';
import 'package:app/services/report_service.dart';
import 'package:app/services/session_service.dart';
import 'package:app/services/user_service.dart';
import 'package:app/views/auth/login_view.dart';
import 'package:app/views/shell/main_shell.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  final session = SessionService();
  await session.init();

  final api = ApiService(session);
  final authService = AuthService(api, session);
  final customerService = CustomerService(api);
  final predictionService = PredictionService(api);
  final userService = UserService(api);
  final reportService = ReportService(api);

  runApp(
    MultiProvider(
      providers: [
        Provider.value(value: session),
        Provider.value(value: api),
        ChangeNotifierProvider(
          create: (_) => AuthController(authService, session),
        ),
        ChangeNotifierProvider(
          create: (_) => DashboardController(
            customerService,
            userService,
            reportService,
          ),
        ),
        ChangeNotifierProvider(
          create: (_) => CustomerController(customerService),
        ),
        ChangeNotifierProvider(
          create: (_) => MeterController(predictionService),
        ),
        ChangeNotifierProvider(
          create: (_) => PredictionController(predictionService),
        ),
        ChangeNotifierProvider(
          create: (_) => UserController(userService),
        ),
        ChangeNotifierProvider(
          create: (_) => ReportController(reportService),
        ),
        ChangeNotifierProvider(
          create: (_) => SettingsController(),
        ),
      ],
      child: const WaterPredictionApp(),
    ),
  );
}

class WaterPredictionApp extends StatelessWidget {
  const WaterPredictionApp({super.key});

  @override
  Widget build(BuildContext context) {
    final loggedIn = context.watch<AuthController>().isLoggedIn;

    return MaterialApp(
      title: 'Water Prediction',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      initialRoute: loggedIn ? '/home' : '/login',
      routes: {
        '/login': (_) => const LoginView(),
        '/home': (_) => const MainShell(),
      },
    );
  }
}
