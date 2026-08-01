import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:app/config/app_theme.dart';
import 'package:app/controllers/auth_controller.dart';
import 'package:app/controllers/settings_controller.dart';
import 'package:app/views/widgets/section_card.dart';

class SettingsView extends StatefulWidget {
  const SettingsView({super.key});

  @override
  State<SettingsView> createState() => _SettingsViewState();
}

class _SettingsViewState extends State<SettingsView> {
  late final TextEditingController _name;
  late final TextEditingController _email;

  @override
  void initState() {
    super.initState();
    final auth = context.read<AuthController>();
    _name = TextEditingController(text: auth.user?.fullname ?? '');
    _email = TextEditingController(text: auth.user?.email ?? '');
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final s = context.read<SettingsController>();
      await s.load();
      if (!mounted) return;
      if (s.displayName.isNotEmpty) _name.text = s.displayName;
      if (s.email.isNotEmpty) _email.text = s.email;
    });
  }

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final s = context.watch<SettingsController>();

    if (s.loading) return const LoadingView();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          'Settings',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        const SizedBox(height: 4),
        Text(
          'Preferences are stored on this device',
          style: Theme.of(context).textTheme.bodySmall,
        ),
        const SizedBox(height: 16),
        SectionCard(
          title: 'Profile',
          child: Column(
            children: [
              TextField(
                controller: _name,
                decoration: const InputDecoration(labelText: 'Display name'),
                onChanged: (v) => s.displayName = v,
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _email,
                decoration: const InputDecoration(labelText: 'Email'),
                onChanged: (v) => s.email = v,
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        SectionCard(
          title: 'Preferences',
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          child: Column(
            children: [
              SwitchListTile(
                title: const Text('Notifications'),
                subtitle: const Text('Prediction & anomaly alerts'),
                value: s.notifications,
                activeColor: AppColors.primary,
                onChanged: s.setNotifications,
              ),
              SwitchListTile(
                title: const Text('Dark mode preference'),
                subtitle: const Text('Saved locally (theme preview)'),
                value: s.darkMode,
                activeColor: AppColors.primary,
                onChanged: s.setDarkMode,
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        ElevatedButton(
          onPressed: s.saving
              ? null
              : () async {
                  s.displayName = _name.text.trim();
                  s.email = _email.text.trim();
                  await s.save();
                  if (!context.mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(s.message ?? 'Saved'),
                      backgroundColor: AppColors.success,
                    ),
                  );
                },
          child: s.saving
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              : const Text('Save Settings'),
        ),
      ],
    );
  }
}
