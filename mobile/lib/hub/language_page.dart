import 'package:flutter/material.dart';
import 'package:super_heng_bullion/api/mobile_api.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:super_heng_bullion/l10n/app_text.dart';
import 'package:super_heng_bullion/session.dart';
import 'package:super_heng_bullion/theme/app_theme.dart';

class LanguagePage extends StatelessWidget {
  const LanguagePage({super.key});

  Future<void> _choose(BuildContext context, String locale) async {
    final session = SessionScope.of(context);
    final token = session.token;
    if (token == null) return;
    final previous = session.locale;
    session.setLocale(locale);
    try {
      final profile = await session.api.saveLocale(token, locale);
      session.setProfile(profile);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('member_locale', locale);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppText.of(context).languageSaved)));
      }
    } on ApiException catch (err) {
      session.setLocale(previous);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(err.message)));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppText.of(context);
    final locale = SessionScope.of(context).locale;
    return Scaffold(
      backgroundColor: AppColors.ink,
      appBar: AppBar(backgroundColor: AppColors.ink, foregroundColor: AppColors.ivory, title: Text(t.language)),
      body: ListView(
        children: [
          ListTile(
            title: const Text('English'),
            trailing: locale == 'en' ? const Icon(Icons.check, color: AppColors.gold) : null,
            onTap: () => _choose(context, 'en'),
          ),
          ListTile(
            title: const Text('繁體中文'),
            trailing: locale == 'zh-Hant' ? const Icon(Icons.check, color: AppColors.gold) : null,
            onTap: () => _choose(context, 'zh-Hant'),
          ),
        ],
      ),
    );
  }
}
