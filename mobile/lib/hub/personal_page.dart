import 'package:flutter/material.dart';
import 'package:super_heng_bullion/api/mobile_api.dart';
import 'package:super_heng_bullion/l10n/app_text.dart';
import 'package:super_heng_bullion/session.dart';
import 'package:super_heng_bullion/theme/app_theme.dart';

class PersonalPage extends StatefulWidget {
  const PersonalPage({super.key});

  @override
  State<PersonalPage> createState() => _PersonalPageState();
}

class _PersonalPageState extends State<PersonalPage> {
  Profile? _profile;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _profile ??= SessionScope.of(context).profile;
  }

  Future<void> _edit({
    required String label,
    required String value,
    required bool required,
    required Profile Function(Profile current, String next) apply,
  }) async {
    final current = _profile;
    if (current == null) return;
    final saved = await Navigator.of(context).push<String>(
      MaterialPageRoute(builder: (_) => EditProfilePage(label: label, initial: value, requiredField: required)),
    );
    if (saved == null || !mounted) return;
    final session = SessionScope.of(context);
    final token = session.token;
    if (token == null) return;
    try {
      final next = await session.api.savePersonal(token, apply(current, saved));
      session.setProfile(next);
      if (!mounted) return;
      setState(() => _profile = next);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppText.of(context).profileUpdated)));
    } on ApiException catch (err) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(err.message)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppText.of(context);
    final profile = _profile;
    return Scaffold(
      backgroundColor: AppColors.ink,
      appBar: AppBar(
        backgroundColor: AppColors.ink,
        foregroundColor: AppColors.ivory,
        title: Text(t.personalInformation),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
        children: [
          _Section(t.personal),
          _Card(children: [
            _InfoRow(label: t.username, value: profile?.username ?? ''),
            _InfoRow(
              label: t.email,
              value: profile?.email ?? '',
              onTap: profile == null
                  ? null
                  : () => _edit(
                        label: t.email,
                        value: profile.email,
                        required: true,
                        apply: (current, next) => _copy(current, email: next),
                      ),
            ),
          ]),
          const SizedBox(height: 16),
          _Card(children: [
            _InfoRow(
              label: t.name,
              value: profile?.fullName ?? '',
              onTap: profile == null
                  ? null
                  : () => _edit(
                        label: t.name,
                        value: profile.fullName,
                        required: true,
                        apply: (current, next) => _copy(current, fullName: next),
                      ),
            ),
            _InfoRow(
              label: t.phone,
              value: profile?.phone ?? '',
              onTap: profile == null
                  ? null
                  : () => _edit(
                        label: t.phone,
                        value: profile.phone,
                        required: true,
                        apply: (current, next) => _copy(current, phone: next),
                      ),
            ),
            _InfoRow(
              label: t.address,
              value: profile?.address ?? '',
              onTap: profile == null
                  ? null
                  : () => _edit(
                        label: t.address,
                        value: profile.address,
                        required: false,
                        apply: (current, next) => _copy(current, address: next),
                      ),
            ),
          ]),
          const SizedBox(height: 20),
          _Section(t.company),
          _Card(children: [
            _InfoRow(
              label: t.name,
              value: profile?.companyName ?? '',
              onTap: profile == null
                  ? null
                  : () => _edit(
                        label: t.name,
                        value: profile.companyName,
                        required: false,
                        apply: (current, next) => _copy(current, companyName: next),
                      ),
            ),
            _InfoRow(
              label: t.registrationNumber,
              value: profile?.registrationNo ?? '',
              onTap: profile == null
                  ? null
                  : () => _edit(
                        label: t.registrationNumber,
                        value: profile.registrationNo,
                        required: false,
                        apply: (current, next) => _copy(current, registrationNo: next),
                      ),
            ),
          ]),
          const SizedBox(height: 28),
          OutlinedButton(
            onPressed: () {
              showDialog<void>(
                context: context,
                builder: (context) => AlertDialog(
                  backgroundColor: AppColors.surface,
                  title: Text(t.deleteAccount),
                  content: Text(t.deleteAccountBody),
                  actions: [
                    TextButton(onPressed: () => Navigator.pop(context), child: Text(t.close)),
                  ],
                ),
              );
            },
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.ivory,
              side: const BorderSide(color: Color(0x33FFFFFF)),
              minimumSize: const Size.fromHeight(52),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: Text(t.deleteAccount),
          ),
        ],
      ),
    );
  }
}

Profile _copy(
  Profile current, {
  String? email,
  String? fullName,
  String? phone,
  String? address,
  String? companyName,
  String? registrationNo,
}) {
  return Profile(
    memberId: current.memberId,
    username: current.username,
    fullName: fullName ?? current.fullName,
    phone: phone ?? current.phone,
    email: email ?? current.email,
    rateBookAssigned: current.rateBookAssigned,
    address: address ?? current.address,
    companyName: companyName ?? current.companyName,
    registrationNo: registrationNo ?? current.registrationNo,
    locale: current.locale,
  );
}

class EditProfilePage extends StatefulWidget {
  const EditProfilePage({super.key, required this.label, required this.initial, required this.requiredField});

  final String label;
  final String initial;
  final bool requiredField;

  @override
  State<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends State<EditProfilePage> {
  late final _controller = TextEditingController(text: widget.initial);

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final canSave = !widget.requiredField || _controller.text.trim().isNotEmpty;
    return Scaffold(
      backgroundColor: AppColors.ink,
      appBar: AppBar(backgroundColor: AppColors.ink, foregroundColor: AppColors.ivory, title: Text(AppText.of(context).editProfile)),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
            decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(16)),
            child: TextField(
              controller: _controller,
              onChanged: (_) => setState(() {}),
              style: const TextStyle(color: AppColors.ivory),
              decoration: InputDecoration(
                labelText: widget.label,
                filled: false,
                border: const UnderlineInputBorder(borderSide: BorderSide(color: Color(0x33FFFFFF))),
                enabledBorder: const UnderlineInputBorder(borderSide: BorderSide(color: Color(0x33FFFFFF))),
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
        child: FilledButton(
          onPressed: canSave ? () => Navigator.pop(context, _controller.text.trim()) : null,
          child: Text(AppText.of(context).save),
        ),
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section(this.label);
  final String label;
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, left: 4),
      child: Text(label, style: const TextStyle(color: AppColors.mist)),
    );
  }
}

class _Card extends StatelessWidget {
  const _Card({required this.children});
  final List<Widget> children;
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(16)),
      child: Column(
        children: [
          for (var i = 0; i < children.length; i++) ...[
            if (i > 0) const Divider(height: 1, color: Color(0x14FFFFFF)),
            children[i],
          ],
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value, this.onTap});

  final String label;
  final String value;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
        child: Row(
          children: [
            Text(label, style: const TextStyle(color: AppColors.mist)),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                value,
                textAlign: TextAlign.end,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: AppColors.ivory),
              ),
            ),
            if (onTap != null && value.isEmpty) const Icon(Icons.chevron_right, color: AppColors.mist, size: 20),
          ],
        ),
      ),
    );
  }
}
