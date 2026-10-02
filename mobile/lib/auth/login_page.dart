import 'package:flutter/material.dart';
import 'package:gold_invest/api/mobile_api.dart';
import 'package:gold_invest/session.dart';
import 'package:gold_invest/theme/app_theme.dart';

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
      final result = await session.api.login(_username.text.trim(), _password.text);
      await session.applyLogin(result.token, result.profile);
      if (!mounted) return;
      Navigator.of(context).popUntil((route) => route.isFirst);
    } on ApiException catch (err) {
      if (!mounted) return;
      setState(() => _error = err.message);
    } catch (_) {
      if (!mounted) return;
      setState(() => _error = 'Cannot reach the server.');
    } finally {
      if (mounted) setState(() => _pending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Scaffold(
      backgroundColor: AppColors.ink,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 48, 20, 24),
          children: [
            Text('GOLD INVEST', style: text.labelSmall),
            const SizedBox(height: 28),
            Text('MEMBER', style: text.labelSmall),
            const SizedBox(height: 12),
            Text('Sign in', key: const Key('login-title'), style: text.headlineLarge),
            const SizedBox(height: 8),
            Text(
              'Use your username and password to view rates and manage your profile.',
              style: text.bodySmall,
            ),
            const SizedBox(height: 28),
            Text('Username', style: text.bodySmall),
            const SizedBox(height: 8),
            TextField(
              key: const Key('username'),
              controller: _username,
              textInputAction: TextInputAction.next,
              autocorrect: false,
              decoration: const InputDecoration(hintText: 'Username'),
            ),
            if (_submitted && _username.text.trim().isEmpty)
              const Padding(
                padding: EdgeInsets.only(top: 6),
                child: Text('Required', style: TextStyle(color: AppColors.danger, fontSize: 13)),
              ),
            const SizedBox(height: 18),
            Text('Password', style: text.bodySmall),
            const SizedBox(height: 8),
            TextField(
              key: const Key('password'),
              controller: _password,
              obscureText: _obscure,
              onSubmitted: (_) => _submit(),
              decoration: InputDecoration(
                hintText: 'Password',
                suffixIcon: IconButton(
                  key: const Key('toggle-password'),
                  onPressed: () => setState(() => _obscure = !_obscure),
                  icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                  color: AppColors.mist,
                ),
              ),
            ),
            if (_submitted && _password.text.isEmpty)
              const Padding(
                padding: EdgeInsets.only(top: 6),
                child: Text('Required', style: TextStyle(color: AppColors.danger, fontSize: 13)),
              ),
            if (_error != null) ...[
              const SizedBox(height: 16),
              Text(_error!, style: const TextStyle(color: AppColors.danger, fontSize: 14)),
            ],
            const SizedBox(height: 28),
            FilledButton(
              key: const Key('login-submit'),
              onPressed: _pending ? null : _submit,
              child: Text(_pending ? 'Signing in…' : 'Sign in'),
            ),
          ],
        ),
      ),
    );
  }
}
