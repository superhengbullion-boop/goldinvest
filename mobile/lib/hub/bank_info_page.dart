import 'package:flutter/material.dart';
import 'package:super_heng_bullion/api/mobile_api.dart';
import 'package:super_heng_bullion/company/company_page.dart';
import 'package:super_heng_bullion/l10n/app_text.dart';
import 'package:super_heng_bullion/session.dart';
import 'package:super_heng_bullion/theme/app_theme.dart';
import 'package:super_heng_bullion/widgets/empty_state.dart';
import 'package:url_launcher/url_launcher.dart';

class BankInfoPage extends StatefulWidget {
  const BankInfoPage({super.key, this.startOnAdd = false});

  final bool startOnAdd;

  @override
  State<BankInfoPage> createState() => _BankInfoPageState();
}

class _BankInfoPageState extends State<BankInfoPage> {
  List<BankAccount> _accounts = [];
  bool _adding = false;
  String? _phone;

  final _holder = TextEditingController();
  final _bank = TextEditingController();
  final _account = TextEditingController();

  @override
  void initState() {
    super.initState();
    _adding = widget.startOnAdd;
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  @override
  void dispose() {
    _holder.dispose();
    _bank.dispose();
    _account.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final token = SessionScope.of(context).token;
    if (token == null) return;
    try {
      final api = SessionScope.of(context).api;
      final accounts = await api.fetchBankAccounts(token);
      final info = await api.fetchDepositInfo(token);
      if (!mounted) return;
      setState(() {
        _accounts = accounts;
        _phone = info.supportPhone;
      });
    } catch (_) {}
  }

  Future<void> _submit() async {
    final token = SessionScope.of(context).token;
    if (token == null) return;
    try {
      await SessionScope.of(context).api.addBankAccount(
        token,
        holderName: _holder.text,
        bankName: _bank.text,
        accountNo: _account.text,
      );
      _holder.clear();
      _bank.clear();
      _account.clear();
      if (!mounted) return;
      setState(() => _adding = false);
      await _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppText.of(context).bankWaiting)));
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
      appBar: AppBar(
        backgroundColor: AppColors.ink,
        foregroundColor: AppColors.ivory,
        title: Text(_adding ? t.addBankAccount : t.bankInformation),
      ),
      body: _adding ? _form(t) : _list(t),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(20),
        child: FilledButton(
          onPressed: _adding ? _submit : () => setState(() => _adding = true),
          child: Text(_adding ? t.submit : t.addBankAccount),
        ),
      ),
    );
  }

  Widget _list(AppText t) {
    if (_accounts.isEmpty) {
      return const EmptyState();
    }
    return ListView(
      children: [
        for (final account in _accounts)
          ListTile(
            title: Text(account.holderName),
            subtitle: Text('${account.bankName} · ${account.accountNo} · ${t.statusLabel(account.status)}'),
          ),
      ],
    );
  }

  Widget _form(AppText t) {
    const underline = UnderlineInputBorder(borderSide: BorderSide(color: Color(0x33FFFFFF)));
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Container(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
          decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(16)),
          child: Column(
            children: [
              TextField(controller: _holder, decoration: InputDecoration(labelText: t.accountHolderName, filled: false, border: underline, enabledBorder: underline)),
              TextField(controller: _bank, decoration: InputDecoration(labelText: t.bankName, filled: false, border: underline, enabledBorder: underline)),
              TextField(controller: _account, decoration: InputDecoration(labelText: t.bankAccount, filled: false, border: underline, enabledBorder: underline)),
            ],
          ),
        ),
        const SizedBox(height: 16),
        if (_phone != null)
          ListTile(
            contentPadding: EdgeInsets.zero,
            title: Text(_phone!),
            subtitle: Text(t.customerSupport),
            trailing: const Icon(Icons.phone_outlined),
            onTap: () => launchUrl(companyTelUri(_phone!), mode: LaunchMode.externalApplication),
          ),
        Text(t.bankReviewNote),
      ],
    );
  }
}
