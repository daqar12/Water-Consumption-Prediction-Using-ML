import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:app/config/app_theme.dart';
import 'package:app/controllers/user_controller.dart';
import 'package:app/models/user_model.dart';
import 'package:app/views/widgets/section_card.dart';

class UsersView extends StatefulWidget {
  const UsersView({super.key});

  @override
  State<UsersView> createState() => _UsersViewState();
}

class _UsersViewState extends State<UsersView> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<UserController>().load();
    });
  }

  Future<void> _openForm({UserModel? user}) async {
    final username = TextEditingController(text: user?.username ?? '');
    final fullname = TextEditingController(text: user?.fullname ?? '');
    final email = TextEditingController(text: user?.email ?? '');
    final phone = TextEditingController(text: user?.phone ?? '');
    final password = TextEditingController();
    final isEdit = user != null;
    final formKey = GlobalKey<FormState>();

    final saved = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
          ),
          child: Form(
            key: formKey,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    isEdit ? 'Edit User' : 'Add User',
                    style: Theme.of(ctx).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 16),
                  if (!isEdit)
                    TextFormField(
                      controller: username,
                      decoration: const InputDecoration(labelText: 'Username'),
                      validator: (v) =>
                          (v == null || v.trim().isEmpty) ? 'Required' : null,
                    ),
                  if (!isEdit) const SizedBox(height: 12),
                  TextFormField(
                    controller: fullname,
                    decoration: const InputDecoration(labelText: 'Full name'),
                    validator: (v) =>
                        (v == null || v.trim().length < 3) ? 'Min 3 chars' : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: email,
                    decoration: const InputDecoration(labelText: 'Email'),
                    validator: (v) =>
                        (v == null || !v.contains('@')) ? 'Invalid email' : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: phone,
                    decoration: const InputDecoration(labelText: 'Phone'),
                    validator: (v) =>
                        (v == null || v.trim().isEmpty) ? 'Required' : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: password,
                    obscureText: true,
                    decoration: InputDecoration(
                      labelText: isEdit
                          ? 'Password (leave blank to keep)'
                          : 'Password',
                    ),
                    validator: (v) {
                      if (!isEdit && (v == null || v.length < 8)) {
                        return 'Min 8 characters';
                      }
                      if (isEdit && v != null && v.isNotEmpty && v.length < 8) {
                        return 'Min 8 characters';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: () {
                      if (formKey.currentState!.validate()) {
                        Navigator.pop(ctx, true);
                      }
                    },
                    child: Text(isEdit ? 'Save Changes' : 'Create User'),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );

    if (saved != true || !mounted) return;
    final controller = context.read<UserController>();
    final ok = isEdit
        ? await controller.update(
            id: user.id,
            fullname: fullname.text.trim(),
            email: email.text.trim(),
            phone: phone.text.trim(),
            password: password.text,
          )
        : await controller.create(
            username: username.text.trim(),
            fullname: fullname.text.trim(),
            email: email.text.trim(),
            phone: phone.text.trim(),
            password: password.text,
          );

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(ok
            ? (isEdit ? 'User updated' : 'User created')
            : (controller.error ?? 'Failed')),
        backgroundColor: ok ? AppColors.success : AppColors.danger,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final c = context.watch<UserController>();

    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _openForm(),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.person_add_alt_1),
        label: const Text('Add User'),
      ),
      body: c.loading
          ? const LoadingView()
          : RefreshIndicator(
              color: AppColors.primary,
              onRefresh: c.load,
              child: c.users.isEmpty
                  ? ListView(
                      children: const [
                        SizedBox(height: 80),
                        EmptyState(
                          icon: Icons.people_outline,
                          message: 'No users found',
                        ),
                      ],
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 88),
                      itemCount: c.users.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemBuilder: (context, i) {
                        final u = c.users[i];
                        return SectionCard(
                          padding: const EdgeInsets.all(14),
                          child: Row(
                            children: [
                              CircleAvatar(
                                backgroundColor:
                                    AppColors.primary.withValues(alpha: 0.12),
                                foregroundColor: AppColors.primary,
                                child: Text(
                                  u.fullname.isNotEmpty
                                      ? u.fullname[0].toUpperCase()
                                      : 'U',
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      u.fullname,
                                      style: Theme.of(context)
                                          .textTheme
                                          .titleMedium,
                                    ),
                                    Text(
                                      '${u.email} · ${u.role}',
                                      style:
                                          Theme.of(context).textTheme.bodySmall,
                                    ),
                                  ],
                                ),
                              ),
                              IconButton(
                                onPressed: () => _openForm(user: u),
                                icon: const Icon(Icons.edit_outlined),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}
