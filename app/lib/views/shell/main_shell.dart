import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:app/config/app_theme.dart';
import 'package:app/controllers/auth_controller.dart';
import 'package:app/views/customers/customers_view.dart';
import 'package:app/views/dashboard/dashboard_view.dart';
import 'package:app/views/meters/meters_view.dart';
import 'package:app/views/predictions/predictions_view.dart';
import 'package:app/views/reports/reports_view.dart';
import 'package:app/views/settings/settings_view.dart';
import 'package:app/views/users/users_view.dart';

enum _Tab { home, customers, predict, more }

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  _Tab _tab = _Tab.home;
  Widget? _pushed;

  String get _title {
    if (_pushed is UsersView) return 'Users';
    if (_pushed is ReportsView) return 'Reports';
    if (_pushed is SettingsView) return 'Settings';
    if (_pushed is MetersView) return 'Meter Readings';
    switch (_tab) {
      case _Tab.home:
        return 'Dashboard';
      case _Tab.customers:
        return 'Customers';
      case _Tab.predict:
        return 'ML Predictions';
      case _Tab.more:
        return 'More';
    }
  }

  Widget get _body {
    if (_pushed != null) return _pushed!;
    switch (_tab) {
      case _Tab.home:
        return const DashboardView();
      case _Tab.customers:
        return const CustomersView();
      case _Tab.predict:
        return const PredictionsView();
      case _Tab.more:
        return _MoreMenu(
          isAdmin: context.watch<AuthController>().isAdmin,
          onOpen: (page) => setState(() => _pushed = page),
        );
    }
  }

  Future<void> _logout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to sign out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.danger),
            child: const Text('Logout'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    await context.read<AuthController>().logout();
    if (!mounted) return;
    Navigator.of(context).pushReplacementNamed('/login');
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();

    return Scaffold(
      appBar: AppBar(
        leading: _pushed != null
            ? IconButton(
                icon: const Icon(Icons.arrow_back_rounded),
                onPressed: () => setState(() => _pushed = null),
              )
            : null,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Water Prediction',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.bold,
                  ),
            ),
            Text(
              _title,
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 4),
            child: Center(
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  auth.user?.fullname.split(' ').first ?? 'User',
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
                  ),
                ),
              ),
            ),
          ),
          IconButton(
            tooltip: 'Logout',
            onPressed: _logout,
            icon: const Icon(Icons.logout_rounded, color: AppColors.danger),
          ),
        ],
      ),
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 220),
        child: KeyedSubtree(
          key: ValueKey(_pushed?.runtimeType ?? _tab),
          child: _body,
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab.index,
        onDestinationSelected: (i) {
          setState(() {
            _pushed = null;
            _tab = _Tab.values[i];
          });
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon:
                Icon(Icons.dashboard_rounded, color: AppColors.primary),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.groups_outlined),
            selectedIcon: Icon(Icons.groups_rounded, color: AppColors.primary),
            label: 'Customers',
          ),
          NavigationDestination(
            icon: Icon(Icons.psychology_outlined),
            selectedIcon:
                Icon(Icons.psychology_rounded, color: AppColors.primary),
            label: 'Predict',
          ),
          NavigationDestination(
            icon: Icon(Icons.more_horiz_rounded),
            selectedIcon:
                Icon(Icons.more_horiz_rounded, color: AppColors.primary),
            label: 'More',
          ),
        ],
      ),
    );
  }
}

class _MoreMenu extends StatelessWidget {
  const _MoreMenu({required this.isAdmin, required this.onOpen});

  final bool isAdmin;
  final ValueChanged<Widget> onOpen;

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final tiles = <_MoreTile>[
      _MoreTile(
        icon: Icons.speed_rounded,
        title: 'Meter Readings',
        subtitle: 'View meter history & status',
        onTap: () => onOpen(const MetersView()),
      ),
      if (isAdmin)
        _MoreTile(
          icon: Icons.manage_accounts_rounded,
          title: 'Users',
          subtitle: 'Manage staff accounts',
          onTap: () => onOpen(const UsersView()),
        ),
      if (isAdmin)
        _MoreTile(
          icon: Icons.assessment_rounded,
          title: 'Reports',
          subtitle: 'Accuracy & anomaly insights',
          onTap: () => onOpen(const ReportsView()),
        ),
      if (isAdmin)
        _MoreTile(
          icon: Icons.settings_rounded,
          title: 'Settings',
          subtitle: 'App preferences',
          onTap: () => onOpen(const SettingsView()),
        ),
    ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF0B1FF6), Color(0xFF3B82F6)],
            ),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              CircleAvatar(
                radius: 26,
                backgroundColor: Colors.white.withValues(alpha: 0.2),
                child: Text(
                  (auth.user?.fullname.isNotEmpty == true
                          ? auth.user!.fullname[0]
                          : 'U')
                      .toUpperCase(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 20,
                  ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      auth.user?.fullname ?? 'User',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${auth.user?.email ?? ''} · ${auth.user?.role ?? ''}',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.85),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        ...tiles.map(
          (t) => Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Material(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(14),
              child: InkWell(
                borderRadius: BorderRadius.circular(14),
                onTap: t.onTap,
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 42,
                        height: 42,
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(t.icon, color: AppColors.primary),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              t.title,
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            Text(
                              t.subtitle,
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.chevron_right_rounded,
                          color: AppColors.textMuted),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _MoreTile {
  const _MoreTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
}
