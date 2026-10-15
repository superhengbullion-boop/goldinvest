import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:super_heng_bullion/company/company_page.dart';
import 'package:super_heng_bullion/hub/announcements_page.dart';
import 'package:super_heng_bullion/hub/bank_info_page.dart';
import 'package:super_heng_bullion/hub/language_page.dart';
import 'package:super_heng_bullion/hub/password_page.dart';
import 'package:super_heng_bullion/hub/personal_page.dart';
import 'package:super_heng_bullion/l10n/app_text.dart';
import 'package:super_heng_bullion/session.dart';
import 'package:super_heng_bullion/theme/app_theme.dart';

class HubPage extends StatefulWidget {
  const HubPage({super.key});

  @override
  State<HubPage> createState() => _HubPageState();
}

class _HubPageState extends State<HubPage> {
  int _unread = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadUnread());
  }

  Future<void> _loadUnread() async {
    final token = SessionScope.of(context).token;
    if (token == null) return;
    try {
      final feed = await SessionScope.of(context).api.fetchAnnouncements(token);
      if (mounted) setState(() => _unread = feed.unreadCount);
    } catch (_) {}
  }

  Future<void> _openAnnouncements() async {
    await Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => const AnnouncementsPage()));
    if (mounted) _loadUnread();
  }

  @override
  Widget build(BuildContext context) {
    final t = AppText.of(context);
    final profile = SessionScope.of(context).profile;
    final name = profile?.username ?? '';
    final initial = name.isEmpty ? '?' : name.substring(0, 1).toUpperCase();
    return Scaffold(
      backgroundColor: AppColors.ink,
      appBar: AppBar(
        backgroundColor: AppColors.ink,
        foregroundColor: AppColors.ivory,
        leading: IconButton(
          key: const Key('hub-info'),
          onPressed: () => Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => const CompanyPage())),
          icon: const Icon(Icons.info_outline),
        ),
        title: Text(t.hub),
        actions: [
          IconButton(
            key: const Key('hub-bell'),
            onPressed: _openAnnouncements,
            icon: Badge(
              isLabelVisible: _unread > 0,
              backgroundColor: AppColors.gold,
              textColor: Colors.black,
              label: Text(_unread > 99 ? '99+' : '$_unread', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
              child: const Icon(Icons.notifications_none),
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          CircleAvatar(radius: 36, backgroundColor: AppColors.gold, child: Text(initial, style: const TextStyle(color: Colors.black, fontSize: 28))),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(name, style: const TextStyle(fontWeight: FontWeight.w700)),
              IconButton(
                key: const Key('hub-copy-username'),
                onPressed: name.isEmpty
                    ? null
                    : () async {
                        await Clipboard.setData(ClipboardData(text: name));
                        if (!context.mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(t.copied)));
                      },
                icon: const Icon(Icons.copy_outlined, color: AppColors.mist, size: 18),
              ),
            ],
          ),
          const SizedBox(height: 24),
          _Row(label: t.personalInformation, page: const PersonalPage()),
          _Row(label: t.bankInformation, page: const BankInfoPage()),
          _Row(label: t.language, page: const LanguagePage()),
          _Row(label: t.changePassword, page: const PasswordPage()),
          const SizedBox(height: 12),
          OutlinedButton(
            key: const Key('hub-sign-out'),
            onPressed: () => SessionScope.of(context).signOut(),
            child: Text(t.logOut),
          ),
        ],
      ),
    );
  }
}

class _Row extends StatelessWidget {
  const _Row({required this.label, required this.page});

  final String label;
  final Widget page;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        child: ListTile(
          title: Text(label),
          trailing: const Icon(Icons.chevron_right, color: AppColors.mist),
          onTap: () => Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => page)),
        ),
      ),
    );
  }
}
