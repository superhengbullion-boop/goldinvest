import 'package:flutter/material.dart';
import 'package:gold_invest/api/mobile_api.dart';
import 'package:gold_invest/format.dart';
import 'package:gold_invest/session.dart';
import 'package:gold_invest/theme/app_theme.dart';

class HistoryPage extends StatefulWidget {
  const HistoryPage({super.key});

  @override
  State<HistoryPage> createState() => _HistoryPageState();
}

class _HistoryPageState extends State<HistoryPage> {
  static const _sizes = [10, 25, 50];

  OrdersPage? _result;
  int _page = 1;
  int _limit = 10;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    final session = SessionScope.of(context);
    final token = session.token;
    if (token == null) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final result = await session.api.fetchOrders(token, page: _page, limit: _limit);
      if (!mounted) return;
      setState(() {
        _result = result;
        _page = result.page;
        _limit = result.pageSize;
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

  void _setLimit(int limit) {
    if (limit == _limit) return;
    setState(() {
      _limit = limit;
      _page = 1;
    });
    _load();
  }

  void _setPage(int page) {
    setState(() => _page = page);
    _load();
  }

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final result = _result;
    final total = result?.total ?? 0;
    final page = result?.page ?? _page;
    final pageCount = result?.pageCount ?? 1;

    return Scaffold(
      backgroundColor: AppColors.ink,
      appBar: AppBar(
        backgroundColor: AppColors.ink,
        foregroundColor: AppColors.ivory,
        elevation: 0,
        title: const Text('Purchase History'),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 4, 20, 28),
        children: [
          Text('Your MYR/KG orders and current status.', style: text.bodySmall),
          const SizedBox(height: 16),
          Row(
            children: [
              Text(total == 1 ? '1 order' : '$total orders', style: text.bodySmall),
              const Spacer(),
              for (final size in _sizes) ...[
                const SizedBox(width: 6),
                _SizeChip(
                  label: '$size',
                  selected: _limit == size,
                  onTap: () => _setLimit(size),
                ),
              ],
            ],
          ),
          const SizedBox(height: 16),
          if (_loading)
            const Padding(
              padding: EdgeInsets.only(top: 48),
              child: Center(child: CircularProgressIndicator(color: AppColors.gold)),
            )
          else if (_error != null)
            Text(_error!, style: const TextStyle(color: AppColors.danger))
          else if (result == null || result.orders.isEmpty)
            Text('No orders yet.', style: text.bodyMedium?.copyWith(color: AppColors.mist))
          else ...[
            for (final order in result.orders) ...[
              _OrderCard(order: order),
              const SizedBox(height: 12),
            ],
            const SizedBox(height: 8),
            Row(
              children: [
                Text('Page $page of $pageCount', style: text.bodySmall),
                const Spacer(),
                _Pager(
                  label: 'Previous',
                  enabled: page > 1,
                  onTap: () => _setPage(page - 1),
                ),
                const SizedBox(width: 8),
                _Pager(
                  label: 'Next',
                  enabled: page < pageCount,
                  onTap: () => _setPage(page + 1),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  const _OrderCard({required this.order});

  final HistoryOrder order;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final when = order.createdAt?.toLocal();
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(order.orderNo, style: const TextStyle(color: AppColors.gold, fontWeight: FontWeight.w700)),
                    if (when != null) ...[
                      const SizedBox(height: 4),
                      Text(_stamp(when), style: text.bodySmall),
                    ],
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(_statusLabel(order.status), style: TextStyle(color: _statusColor(order.status), fontWeight: FontWeight.w700)),
                  const SizedBox(height: 4),
                  Text('RM ${formatPrice(order.totalAmount, 2)}', style: text.bodyMedium),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          for (final item in order.items) ...[
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    '${sideName(item.side)} · ${_metal(item.metal)} · ${formatQty(item.qtyKg)} kg @ RM ${formatPrice(item.lockedPrice, 0)} / kg',
                    style: text.bodySmall?.copyWith(color: AppColors.ivory),
                  ),
                ),
                const SizedBox(width: 8),
                Text('RM ${formatPrice(item.lineTotal, 2)}', style: text.bodySmall),
              ],
            ),
            const SizedBox(height: 6),
          ],
        ],
      ),
    );
  }
}

class _SizeChip extends StatelessWidget {
  const _SizeChip({required this.label, required this.selected, required this.onTap});

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        key: Key('history-limit-$label'),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: selected ? AppColors.gold : AppColors.surface,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? Colors.black : AppColors.mist,
            fontWeight: FontWeight.w700,
            fontSize: 13,
          ),
        ),
      ),
    );
  }
}

class _Pager extends StatelessWidget {
  const _Pager({required this.label, required this.enabled, required this.onTap});

  final String label;
  final bool enabled;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return TextButton(
      key: Key('history-${label.toLowerCase()}'),
      onPressed: enabled ? onTap : null,
      child: Text(label, style: TextStyle(color: enabled ? AppColors.gold : AppColors.mist)),
    );
  }
}

String _metal(String metal) {
  if (metal == 'XAU') return 'Gold';
  if (metal == 'XAG') return 'Silver';
  return metal;
}

String _statusLabel(String status) {
  if (status.isEmpty) return status;
  return status[0].toUpperCase() + status.substring(1);
}

Color _statusColor(String status) {
  switch (status) {
    case 'confirmed':
      return AppColors.gold;
    case 'completed':
      return const Color(0xFF34D399);
    case 'cancelled':
      return AppColors.danger;
    default:
      return const Color(0xFFFCD34D);
  }
}

String _stamp(DateTime value) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  final hour24 = value.hour;
  final hour = hour24 % 12 == 0 ? 12 : hour24 % 12;
  final ampm = hour24 >= 12 ? 'pm' : 'am';
  final mm = value.minute.toString().padLeft(2, '0');
  return '${value.day} ${months[value.month - 1]} ${value.year} $hour:$mm $ampm';
}
