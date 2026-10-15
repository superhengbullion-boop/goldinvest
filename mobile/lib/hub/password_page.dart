import 'package:flutter/material.dart';
import 'package:super_heng_bullion/api/mobile_api.dart';
import 'package:super_heng_bullion/l10n/app_text.dart';
import 'package:super_heng_bullion/session.dart';
import 'package:super_heng_bullion/theme/app_theme.dart';

class PasswordPage extends StatefulWidget {
  const PasswordPage({super.key});

  @override
  State<PasswordPage> createState() => _PasswordPageState();
}

class _PasswordPageState extends State<PasswordPage> {
  final _current = TextEditingController();
  final _next = TextEditingController();
  final _confirm = TextEditingController();

  @override
  void dispose() {
    _current.dispose();
    _next.dispose();
    _confirm.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final token = SessionScope.of(context).token;
    if (token == null) return;
    try {
      await SessionScope.of(context).api.changePassword(
        token,
        currentPassword: _current.text,
        newPassword: _next.text,
        confirmPassword: _confirm.text,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppText.of(context).passwordUpdated)));
    } on ApiException catch (err) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(err.message)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppText.of(context);
    return Scaffold(
      backgroundColor: AppColors.ink,
      appBar: AppBar(backgroundColor: AppColors.ink, foregroundColor: AppColors.ivory, title: Text(t.changePassword)),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          TextField(controller: _current, obscureText: true, decoration: InputDecoration(labelText: t.currentPassword)),
          const SizedBox(height: 16),
          TextField(controller: _next, obscureText: true, decoration: InputDecoration(labelText: t.newPassword)),
          const SizedBox(height: 16),
          TextField(controller: _confirm, obscureText: true, decoration: InputDecoration(labelText: t.confirmNewPassword)),
          const SizedBox(height: 24),
          FilledButton(onPressed: _save, child: Text(t.save)),
        ],
      ),
    );
  }
}
