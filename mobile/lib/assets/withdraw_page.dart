import 'package:flutter/material.dart';
import 'package:super_heng_bullion/api/mobile_api.dart';
import 'package:super_heng_bullion/assets/bank_sheet.dart';
import 'package:super_heng_bullion/company/company_page.dart';
import 'package:super_heng_bullion/l10n/app_text.dart';
import 'package:super_heng_bullion/session.dart';
import 'package:super_heng_bullion/theme/app_theme.dart';
import 'package:url_launcher/url_launcher.dart';

class WithdrawPage extends StatefulWidget {
  const WithdrawPage({super.key, required this.xauGrams, required this.fundMyr});

  final double xauGrams;
  final double fundMyr;

  @override
  State<WithdrawPage> createState() => _WithdrawPageState();
}

class _WithdrawPageState extends State<WithdrawPage> {
  final _amount = TextEditingController(text: '0.00');
  bool _fund = false;
  BankAccount? _account;
  String? _phone;
  String? _error;
  bool _pending = false;
  late double _xauGrams;
  late double _fundMyr;

  @override
  void initState() {
    super.initState();
    _xauGrams = widget.xauGrams;
    _fundMyr = widget.fundMyr;
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final token = SessionScope.of(context).token;
      if (token == null) return;
      try {
        final info = await SessionScope.of(context).api.fetchDepositInfo(token);
        if (mounted) setState(() => _phone = info.supportPhone);
      } catch (_) {}
    });
  }

  @override
  void dispose() {
    _amount.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final token = SessionScope.of(context).token;
    if (token == null) return;
    final amount = double.tryParse(_amount.text.trim()) ?? 0;
    if (_fund && _account == null) {
      setState(() => _error = 'Select a verified bank account.');
      return;
    }
    setState(() {
      _pending = true;
      _error = null;
    });
    try {
      final balance = await SessionScope.of(context).api.submitWithdrawal(
        token,
        kind: _fund ? 'fund' : 'xau',
        amount: amount,
        bankAccountId: _account?.id,
      );
      if (!mounted) return;
      setState(() {
        if (_fund) {
          _fundMyr = balance ?? (_fundMyr - amount);
        } else {
          _xauGrams = balance ?? (_xauGrams - amount);
        }
      });
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppText.of(context).withdrawalSubmitted)));
    } on ApiException catch (err) {
      if (mounted) setState(() => _error = err.message);
    } finally {
      if (mounted) setState(() => _pending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppText.of(context);
    final balance = _fund ? t.fundBalance(_fundMyr.toStringAsFixed(2)) : t.goldBalance(_xauGrams.toStringAsFixed(2));
    return Scaffold(
      backgroundColor: AppColors.ink,
      appBar: AppBar(backgroundColor: AppColors.ink, foregroundColor: AppColors.ivory, title: Text(t.withdraw)),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Row(children: [
            Expanded(child: TextButton(onPressed: () => setState(() => _fund = false), child: Text('XAU', style: TextStyle(color: _fund ? AppColors.mist : AppColors.gold)))),
            Expanded(child: TextButton(onPressed: () => setState(() => _fund = true), child: Text(t.fund, style: TextStyle(color: _fund ? AppColors.gold : AppColors.mist)))),
          ]),
          TextField(
            controller: _amount,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: InputDecoration(labelText: _fund ? t.withdrawalAmount : t.withdrawalQuantity),
          ),
          const SizedBox(height: 8),
          Text(balance, style: const TextStyle(color: AppColors.mist)),
          const SizedBox(height: 20),
          if (_fund) ...[
            _SectionLabel(t.myInformation),
            _InfoCard(children: [
              _InfoRow(label: t.withdrawalMethod, value: t.bankTransfer),
              _InfoRow(
                label: t.bankAccount,
                value: _account?.accountNo ?? t.unselected,
                chevron: true,
                onTap: () async {
                  final picked = await showBankAccountSheet(context);
                  if (picked != null) setState(() => _account = picked);
                },
              ),
            ]),
            const SizedBox(height: 20),
            _SectionLabel(t.superHengInformation),
            if (_phone != null) _SupportCard(phone: _phone!),
          ] else ...[
            _SectionLabel(t.myInformation),
            _InfoCard(children: [
              _InfoRow(label: t.withdrawalMethod, value: t.physicalGold),
            ]),
            if (_phone != null) ...[
              const SizedBox(height: 20),
              _SectionLabel(t.superHengInformation),
              _SupportCard(phone: _phone!),
            ],
          ],
          const SizedBox(height: 20),
          Text(
            _fund ? t.fundWithdrawNotes : t.xauWithdrawNotes,
          ),
          if (_error != null) Padding(padding: const EdgeInsets.only(top: 12), child: Text(t.message(_error!), style: const TextStyle(color: AppColors.danger))),
        ],
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(20),
        child: FilledButton(onPressed: _pending ? null : _submit, child: Text(t.submit)),
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.label);

  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(label, style: const TextStyle(color: AppColors.mist, fontSize: 13)),
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({required this.children});

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
  const _InfoRow({required this.label, required this.value, this.chevron = false, this.onTap});

  final String label;
  final String value;
  final bool chevron;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        child: Row(
          children: [
            Expanded(child: Text(label, style: const TextStyle(color: AppColors.mist))),
            Text(value, style: const TextStyle(color: AppColors.ivory, fontWeight: FontWeight.w600)),
            if (chevron) const Icon(Icons.chevron_right, color: AppColors.mist),
          ],
        ),
      ),
    );
  }
}

class _SupportCard extends StatelessWidget {
  const _SupportCard({required this.phone});

  final String phone;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => launchUrl(companyTelUri(phone), mode: LaunchMode.externalApplication),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(phone, style: const TextStyle(color: AppColors.ivory, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    Text(AppText.of(context).customerSupport, style: const TextStyle(color: AppColors.mist, fontSize: 13)),
                  ],
                ),
              ),
              const Icon(Icons.phone_outlined, color: AppColors.mist),
            ],
          ),
        ),
      ),
    );
  }
}
