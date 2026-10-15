import 'package:flutter/material.dart';
import 'package:super_heng_bullion/api/mobile_api.dart';
import 'package:super_heng_bullion/assets/deposit_page.dart';
import 'package:super_heng_bullion/assets/history_account_page.dart';
import 'package:super_heng_bullion/assets/transfer_page.dart';
import 'package:super_heng_bullion/assets/withdraw_page.dart';
import 'package:super_heng_bullion/l10n/app_text.dart';
import 'package:super_heng_bullion/session.dart';
import 'package:super_heng_bullion/theme/app_theme.dart';
import 'package:super_heng_bullion/widgets/gold_bars_icon.dart';

class AssetsPage extends StatefulWidget {
  const AssetsPage({super.key, required this.visible});

  final bool visible;

  @override
  State<AssetsPage> createState() => _AssetsPageState();
}

class _AssetsPageState extends State<AssetsPage> {
  MemberAssets _assets = const MemberAssets(xauGrams: 0, fundMyr: 0, tradingLimitMyr: 0);
  bool _loaded = false;
  String? _error;

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
  void didUpdateWidget(AssetsPage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.visible && !oldWidget.visible) _load();
  }

  Future<void> _load() async {
    final session = SessionScope.of(context);
    final token = session.token;
    if (token == null) return;
    try {
      final assets = await session.api.fetchAssets(token);
      if (!mounted) return;
      setState(() {
        _assets = assets;
        _error = null;
      });
    } on ApiException catch (err) {
      if (!mounted) return;
      setState(() => _error = err.message);
    } catch (_) {
      if (!mounted) return;
      setState(() => _error = 'Cannot reach the server.');
    }
  }

  Future<void> _openDeposit() async {
    await Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => const DepositPage()));
    if (mounted) _load();
  }

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final t = AppText.of(context);
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
        children: [
          Text(t.assets, textAlign: TextAlign.center, style: text.titleMedium?.copyWith(fontSize: 20)),
          const SizedBox(height: 24),
          if (_error != null) ...[
            Text(t.message(_error!), style: text.bodySmall?.copyWith(color: AppColors.danger)),
            const SizedBox(height: 12),
          ],
          _BalanceCard(
            icon: const GoldBarsIcon(size: 26),
            title: 'XAU',
            value: '${_assets.xauGrams.toStringAsFixed(2)} g',
            showChevron: true,
            onTap: () => Navigator.of(context).push(MaterialPageRoute<void>(
              builder: (_) => HistoryAccountPage(asset: 'xau', balance: _assets.xauGrams),
            )),
          ),
          const SizedBox(height: 12),
          _BalanceCard(
            icon: const Icon(Icons.attach_money, color: AppColors.gold, size: 22),
            title: t.fund,
            value: 'RM ${_assets.fundMyr.toStringAsFixed(2)}',
            showChevron: true,
            onTap: () => Navigator.of(context).push(MaterialPageRoute<void>(
              builder: (_) => HistoryAccountPage(asset: 'fund', balance: _assets.fundMyr),
            )),
          ),
          const SizedBox(height: 12),
          _BalanceCard(
            icon: const Icon(Icons.speed, color: AppColors.gold, size: 22),
            title: t.tradingLimit,
            value: 'RM ${_assets.tradingLimitMyr.toStringAsFixed(2)}',
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _ActionButton(
                buttonKey: const Key('open-deposit'),
                icon: Icons.file_download_outlined,
                label: t.deposit,
                onTap: _openDeposit,
              ),
              const SizedBox(width: 12),
              _ActionButton(
                icon: Icons.file_upload_outlined,
                label: t.withdraw,
                onTap: () async {
                  await Navigator.of(context).push(MaterialPageRoute<void>(
                    builder: (_) => WithdrawPage(xauGrams: _assets.xauGrams, fundMyr: _assets.fundMyr),
                  ));
                  if (mounted) _load();
                },
              ),
              const SizedBox(width: 12),
              _ActionButton(
                icon: Icons.swap_horiz,
                label: t.transfer,
                onTap: () => Navigator.of(context).push(MaterialPageRoute<void>(
                  builder: (_) => TransferPage(xauGrams: _assets.xauGrams),
                )),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _BalanceCard extends StatelessWidget {
  const _BalanceCard({
    required this.icon,
    required this.title,
    required this.value,
    this.showChevron = false,
    this.onTap,
  });

  final Widget icon;
  final String title;
  final String value;
  final bool showChevron;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
      child: Row(
        children: [
          icon,
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: AppColors.ivory, fontSize: 16),
            ),
          ),
          Text(
            value,
            textAlign: TextAlign.right,
            style: const TextStyle(color: AppColors.ivory, fontSize: 15, fontWeight: FontWeight.w600),
          ),
          if (showChevron) ...[
            const SizedBox(width: 2),
            const Icon(Icons.chevron_right, color: AppColors.mist, size: 18),
          ],
        ],
      ),
        ),
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  const _ActionButton({
    required this.icon,
    required this.label,
    required this.onTap,
    this.buttonKey,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Key? buttonKey;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Material(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          key: buttonKey,
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: Column(
              children: [
                Icon(icon, color: AppColors.gold),
                const SizedBox(height: 8),
                Text(label, style: const TextStyle(color: AppColors.ivory, fontSize: 13)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
