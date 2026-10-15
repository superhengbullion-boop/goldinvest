import 'package:flutter/material.dart';
import 'package:super_heng_bullion/api/mobile_api.dart';
import 'package:super_heng_bullion/hub/bank_info_page.dart';
import 'package:super_heng_bullion/l10n/app_text.dart';
import 'package:super_heng_bullion/session.dart';
import 'package:super_heng_bullion/theme/app_theme.dart';
import 'package:super_heng_bullion/widgets/empty_state.dart';

Future<BankAccount?> showBankAccountSheet(BuildContext context) {
  return showModalBottomSheet<BankAccount>(
    context: context,
    backgroundColor: AppColors.surface,
    builder: (context) => const _BankSheet(),
  );
}

class _BankSheet extends StatefulWidget {
  const _BankSheet();

  @override
  State<_BankSheet> createState() => _BankSheetState();
}

class _BankSheetState extends State<_BankSheet> {
  List<BankAccount> _accounts = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final token = SessionScope.of(context).token;
      if (token == null) return;
      try {
        final accounts = await SessionScope.of(context).api.fetchBankAccounts(token, approvedOnly: true);
        if (mounted) {
          setState(() {
            _accounts = accounts;
            _loading = false;
          });
        }
      } catch (_) {
        if (mounted) setState(() => _loading = false);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final t = AppText.of(context);
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(t.selectBankAccount, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          const SizedBox(height: 12),
          if (_loading)
            const Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator(color: AppColors.gold))
          else if (_accounts.isEmpty)
            const SizedBox(height: 180, child: EmptyState())
          else
            for (final account in _accounts)
              ListTile(
                title: Text(account.holderName),
                subtitle: Text('${account.bankName} · ${account.accountNo}'),
                onTap: () => Navigator.pop(context, account),
              ),
          const SizedBox(height: 12),
          FilledButton(
            onPressed: () {
              final navigator = Navigator.of(context);
              navigator.pop();
              navigator.push(MaterialPageRoute<void>(builder: (_) => const BankInfoPage(startOnAdd: true)));
            },
            child: Text(t.addBankAccount),
          ),
        ],
      ),
    );
  }
}
