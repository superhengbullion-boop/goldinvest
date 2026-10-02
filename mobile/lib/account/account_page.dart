import 'package:flutter/material.dart';
import 'package:gold_invest/api/mobile_api.dart';
import 'package:gold_invest/company/company_page.dart';
import 'package:gold_invest/history/history_page.dart';
import 'package:gold_invest/session.dart';
import 'package:gold_invest/theme/app_theme.dart';

class AccountPage extends StatefulWidget {
  const AccountPage({super.key, required this.visible});

  final bool visible;

  @override
  State<AccountPage> createState() => _AccountPageState();
}

class _AccountPageState extends State<AccountPage> {
  final _username = TextEditingController();
  final _fullName = TextEditingController();
  final _password = TextEditingController();
  final _confirm = TextEditingController();
  bool _pending = false;
  bool _loaded = false;
  String? _error;
  Profile? _profile;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_loaded || !widget.visible) return;
    _loaded = true;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _load();
    });
  }

  @override
  void didUpdateWidget(AccountPage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.visible && !oldWidget.visible) {
      _loaded = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _load();
      });
    }
  }

  @override
  void dispose() {
    _username.dispose();
    _fullName.dispose();
    _password.dispose();
    _confirm.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final session = SessionScope.of(context);
    final token = session.token;
    final cached = session.profile;
    if (cached != null) _apply(cached);
    if (token == null) return;
    try {
      final profile = await session.api.fetchProfile(token);
      if (!mounted) return;
      session.setProfile(profile);
      setState(() => _apply(profile));
    } on ApiException catch (err) {
      if (!mounted) return;
      setState(() => _error = err.message);
    }
  }

  void _apply(Profile profile) {
    _profile = profile;
    _username.text = profile.username;
    _fullName.text = profile.fullName;
  }

  Future<void> _save() async {
    final username = _username.text.trim();
    final fullName = _fullName.text.trim();
    final password = _password.text;
    final confirm = _confirm.text;
    if (username.isEmpty || fullName.isEmpty) {
      setState(() => _error = 'Username and full name are required.');
      return;
    }
    if (username.length < 3) {
      setState(() => _error = 'Username must be at least 3 characters.');
      return;
    }
    if (password.isNotEmpty && password.length < 6) {
      setState(() => _error = 'Password must be at least 6 characters.');
      return;
    }
    if (password.isNotEmpty && password != confirm) {
      setState(() => _error = 'New passwords do not match.');
      return;
    }

    final session = SessionScope.of(context);
    final token = session.token;
    if (token == null) return;
    setState(() {
      _pending = true;
      _error = null;
    });
    try {
      final profile = await session.api.updateProfile(
        token,
        username: username,
        fullName: fullName,
        password: password,
        confirmPassword: confirm,
      );
      if (!mounted) return;
      session.setProfile(profile);
      _password.clear();
      _confirm.clear();
      setState(() => _apply(profile));
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profile updated')));
    } on ApiException catch (err) {
      if (!mounted) return;
      setState(() => _error = err.message);
    } finally {
      if (mounted) setState(() => _pending = false);
    }
  }

  Future<void> _signOut() async {
    await SessionScope.of(context).signOut();
  }

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final profile = _profile;
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(profile?.fullName.isNotEmpty == true ? profile!.fullName : 'Account', style: text.headlineLarge?.copyWith(fontSize: 28)),
                const SizedBox(height: 6),
                Text(profile?.memberId ?? '', style: text.labelSmall),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Material(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(16),
            child: InkWell(
              key: const Key('open-history'),
              borderRadius: BorderRadius.circular(16),
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute<void>(builder: (_) => const HistoryPage()),
                );
              },
              child: const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                child: Row(
                  children: [
                    Expanded(
                      child: Text('Purchase History', style: TextStyle(color: AppColors.ivory, fontWeight: FontWeight.w600)),
                    ),
                    Icon(Icons.chevron_right, color: AppColors.gold),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Material(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(16),
            child: InkWell(
              key: const Key('account-company'),
              borderRadius: BorderRadius.circular(16),
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute<void>(builder: (_) => const CompanyPage()),
                );
              },
              child: const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                child: Row(
                  children: [
                    Expanded(
                      child: Text('Info', style: TextStyle(color: AppColors.ivory, fontWeight: FontWeight.w600)),
                    ),
                    Icon(Icons.chevron_right, color: AppColors.gold),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
          _ReadOnly(label: 'Member ID', value: profile?.memberId ?? ''),
          const SizedBox(height: 14),
          _Field(label: 'Username', controller: _username),
          const SizedBox(height: 14),
          _Field(label: 'Full name', controller: _fullName, fieldKey: const Key('account-full-name')),
          const SizedBox(height: 14),
          _ReadOnly(label: 'Phone', value: profile?.phone ?? ''),
          const SizedBox(height: 14),
          _ReadOnly(label: 'Email', value: profile?.email ?? ''),
          const SizedBox(height: 28),
          Text('Security', style: text.titleMedium),
          const SizedBox(height: 14),
          _Field(label: 'New password', controller: _password, obscure: true, fieldKey: const Key('account-password')),
          const Padding(
            padding: EdgeInsets.only(top: 6),
            child: Text(
              'Leave blank to keep your current password',
              style: TextStyle(color: AppColors.mist, fontSize: 12),
            ),
          ),
          const SizedBox(height: 14),
          _Field(label: 'Confirm new password', controller: _confirm, obscure: true),
          if (_error != null) ...[
            const SizedBox(height: 14),
            Text(_error!, style: const TextStyle(color: AppColors.danger, fontSize: 14)),
          ],
          const SizedBox(height: 22),
          FilledButton(
            key: const Key('account-save'),
            onPressed: _pending ? null : _save,
            child: Text(_pending ? 'Saving…' : 'Save'),
          ),
          const SizedBox(height: 12),
          OutlinedButton(
            key: const Key('account-sign-out'),
            onPressed: _signOut,
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.ivory,
              side: const BorderSide(color: AppColors.mist),
              minimumSize: const Size.fromHeight(52),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            child: const Text('Sign out'),
          ),
        ],
      ),
    );
  }
}

class _Field extends StatelessWidget {
  const _Field({required this.label, required this.controller, this.obscure = false, this.fieldKey});

  final String label;
  final TextEditingController controller;
  final bool obscure;
  final Key? fieldKey;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: Theme.of(context).textTheme.bodySmall),
        const SizedBox(height: 8),
        TextField(key: fieldKey, controller: controller, obscureText: obscure),
      ],
    );
  }
}

class _ReadOnly extends StatelessWidget {
  const _ReadOnly({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: Theme.of(context).textTheme.bodySmall),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(14),
          ),
          child: Text(value, style: const TextStyle(color: AppColors.mist, fontSize: 16)),
        ),
      ],
    );
  }
}
