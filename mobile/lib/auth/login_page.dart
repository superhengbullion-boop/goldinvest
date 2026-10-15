import 'package:flutter/material.dart';
import 'package:super_heng_bullion/api/mobile_api.dart';
import 'package:super_heng_bullion/l10n/app_text.dart';
import 'package:super_heng_bullion/session.dart';
import 'package:super_heng_bullion/theme/app_theme.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _username = TextEditingController();
  final _password = TextEditingController();
  bool _obscure = true;
  bool _pending = false;
  bool _submitted = false;
  String? _error;

  @override
  void dispose() {
    _username.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() {
      _submitted = true;
      _error = null;
    });
    if (_username.text.trim().isEmpty || _password.text.isEmpty) return;

    setState(() => _pending = true);
    try {
      final session = SessionScope.of(context);
      final result =
          await session.api.login(_username.text.trim(), _password.text);
      await session.applyLogin(result.token, result.profile);
      if (!mounted) return;
      final navigator = Navigator.of(context);
      if (navigator.canPop()) {
        navigator.popUntil((route) => route.isFirst);
      }
    } on ApiException catch (err) {
      if (!mounted) return;
      setState(() => _error = err.message);
    } catch (_) {
      if (!mounted) return;
      setState(() => _error = AppText.of(context).cannotReach);
    } finally {
      if (mounted) setState(() => _pending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final t = AppText.of(context);
    return Scaffold(
      backgroundColor: AppColors.ink,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 48, 20, 24),
          children: [
            Text('SUPER HENG BULLION', style: text.labelSmall),
            const SizedBox(height: 28),
            Text(t.member, style: text.labelSmall),
            const SizedBox(height: 12),
            Text(t.signIn,
                key: const Key('login-title'), style: text.headlineLarge),
            const SizedBox(height: 8),
            Text(
              t.signInHint,
              style: text.bodySmall,
            ),
            const SizedBox(height: 28),
            Text(t.username, style: text.bodySmall),
            const SizedBox(height: 8),
            TextField(
              key: const Key('username'),
              controller: _username,
              textInputAction: TextInputAction.next,
              autocorrect: false,
              decoration: InputDecoration(hintText: t.username),
            ),
            if (_submitted && _username.text.trim().isEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 6),
                child: Text(t.required,
                    style: const TextStyle(color: AppColors.danger, fontSize: 13)),
              ),
            const SizedBox(height: 18),
            Text(t.password, style: text.bodySmall),
            const SizedBox(height: 8),
            TextField(
              key: const Key('password'),
              controller: _password,
              obscureText: _obscure,
              onSubmitted: (_) => _submit(),
              decoration: InputDecoration(
                hintText: t.password,
                suffixIcon: IconButton(
                  key: const Key('toggle-password'),
                  onPressed: () => setState(() => _obscure = !_obscure),
                  icon: Icon(_obscure
                      ? Icons.visibility_outlined
                      : Icons.visibility_off_outlined),
                  color: AppColors.mist,
                ),
              ),
            ),
            if (_submitted && _password.text.isEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 6),
                child: Text(t.required,
                    style: const TextStyle(color: AppColors.danger, fontSize: 13)),
              ),
            if (_error != null) ...[
              const SizedBox(height: 16),
              Text(_error!,
                  style:
                      const TextStyle(color: AppColors.danger, fontSize: 14)),
            ],
            const SizedBox(height: 28),
            FilledButton(
              key: const Key('login-submit'),
              onPressed: _pending ? null : _submit,
              child: Text(_pending ? t.signingIn : t.signIn),
            ),
          ],
        ),
      ),
    );
  }
}
