import 'package:flutter/material.dart';
import 'package:super_heng_bullion/api/mobile_api.dart';
import 'package:super_heng_bullion/l10n/app_text.dart';
import 'package:super_heng_bullion/session.dart';
import 'package:super_heng_bullion/theme/app_theme.dart';
import 'package:super_heng_bullion/widgets/empty_state.dart';
import 'package:super_heng_bullion/widgets/gold_bars_icon.dart';

class HistoryAccountPage extends StatefulWidget {
  const HistoryAccountPage({super.key, required this.asset, required this.balance});

  final String asset;
  final double balance;

  @override
  State<HistoryAccountPage> createState() => _HistoryAccountPageState();
}

class _HistoryAccountPageState extends State<HistoryAccountPage> {
  List<WalletEntry> _rows = [];
  String _method = '';
  String _status = '';
  String _from = '';
  String _to = '';
  String? _error;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    final token = SessionScope.of(context).token;
    if (token == null) return;
    setState(() => _loading = true);
    try {
      final rows = await SessionScope.of(context).api.fetchWallet(
        token,
        asset: widget.asset,
        method: _method,
        status: _status,
        from: _from,
        to: _to,
      );
      if (!mounted) return;
      setState(() {
        _rows = rows;
        _error = null;
        _loading = false;
      });
    } on ApiException catch (err) {
      if (!mounted) return;
      setState(() {
        _error = err.message;
        _loading = false;
      });
    }
  }

  Future<void> _filter() async {
    final result = await showModalBottomSheet<_FilterChoice>(
      context: context,
      backgroundColor: AppColors.surface,
      builder: (context) => _FilterSheet(method: _method, status: _status, from: _from, to: _to),
    );
    if (result == null || !mounted) return;
    setState(() {
      _method = result.method;
      _status = result.status;
      _from = result.from;
      _to = result.to;
    });
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    final t = AppText.of(context);
    final gold = widget.asset == 'xau';
    final balance = gold ? '${widget.balance.toStringAsFixed(2)} g' : 'RM ${widget.balance.toStringAsFixed(2)}';
    return Scaffold(
      backgroundColor: AppColors.ink,
      appBar: AppBar(
        backgroundColor: AppColors.ink,
        foregroundColor: AppColors.ivory,
        title: Text(gold ? t.goldAccount : t.fundAccount),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(16)),
            child: Row(
              children: [
                gold
                    ? const GoldBarsIcon(size: 26)
                    : const Icon(Icons.attach_money, color: AppColors.gold),
                const SizedBox(width: 12),
                Text(gold ? 'XAU' : t.fund),
                const Spacer(),
                Text(balance, style: const TextStyle(fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Text(t.history, textAlign: TextAlign.center, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          const SizedBox(height: 12),
          Row(
            children: [
              _Chip(label: _method.isEmpty ? t.allMethod : t.methodLabel(_method)),
              const SizedBox(width: 8),
              _Chip(label: _status.isEmpty ? t.allStatus : t.statusLabel(_status)),
              const Spacer(),
              IconButton(onPressed: _filter, icon: const Icon(Icons.filter_alt, color: AppColors.gold)),
            ],
          ),
          if (_error != null) Text(t.message(_error!), style: const TextStyle(color: AppColors.danger)),
          if (_loading)
            const Padding(padding: EdgeInsets.all(32), child: Center(child: CircularProgressIndicator(color: AppColors.gold)))
          else if (_rows.isEmpty)
            const SizedBox(height: 280, child: EmptyState())
          else
            for (final row in _rows)
              ListTile(
                title: Text('${t.methodLabel(row.method)} · ${t.statusLabel(row.status)}'),
                subtitle: Text(row.createdAt?.toLocal().toString().split('.').first ?? ''),
                trailing: Text(row.amount == null ? '-' : row.amount!.toStringAsFixed(2)),
              ),
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({required this.label});
  final String label;
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(color: AppColors.surface2, borderRadius: BorderRadius.circular(20)),
      child: Text(label, style: const TextStyle(fontSize: 12)),
    );
  }
}

class _FilterChoice {
  const _FilterChoice({required this.method, required this.status, required this.from, required this.to});
  final String method;
  final String status;
  final String from;
  final String to;
}

class _FilterSheet extends StatefulWidget {
  const _FilterSheet({required this.method, required this.status, required this.from, required this.to});
  final String method;
  final String status;
  final String from;
  final String to;
  @override
  State<_FilterSheet> createState() => _FilterSheetState();
}

class _FilterSheetState extends State<_FilterSheet> {
  late String method = widget.method;
  late String status = widget.status;
  late final _from = TextEditingController(text: widget.from);
  late final _to = TextEditingController(text: widget.to);

  @override
  void dispose() {
    _from.dispose();
    _to.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(AppText.of(context).filter, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          const SizedBox(height: 12),
          Text(AppText.of(context).method, style: const TextStyle(color: AppColors.mist)),
          Wrap(spacing: 8, children: [
            for (final item in ['', 'deposit', 'withdrawal', 'transfer'])
              ChoiceChip(
                label: Text(AppText.of(context).methodLabel(item)),
                selected: method == item,
                onSelected: (_) => setState(() => method = item),
              ),
          ]),
          const SizedBox(height: 12),
          Text(AppText.of(context).status, style: const TextStyle(color: AppColors.mist)),
          Wrap(spacing: 8, children: [
            for (final item in ['', 'pending', 'declined', 'approved'])
              ChoiceChip(
                label: Text(AppText.of(context).statusLabel(item)),
                selected: status == item,
                onSelected: (_) => setState(() => status = item),
              ),
          ]),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(child: TextField(controller: _from, decoration: InputDecoration(labelText: AppText.of(context).startDate))),
            const SizedBox(width: 12),
            Expanded(child: TextField(controller: _to, decoration: InputDecoration(labelText: AppText.of(context).endDate))),
          ]),
          const SizedBox(height: 16),
          Row(children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () => Navigator.pop(context, const _FilterChoice(method: '', status: '', from: '', to: '')),
                child: Text(AppText.of(context).reset),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: FilledButton(
                onPressed: () => Navigator.pop(context, _FilterChoice(method: method, status: status, from: _from.text.trim(), to: _to.text.trim())),
                child: Text(AppText.of(context).apply),
              ),
            ),
          ]),
        ],
      ),
    );
  }
}
