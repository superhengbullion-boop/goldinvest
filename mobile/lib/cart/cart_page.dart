import 'dart:async';

import 'package:flutter/material.dart';
import 'package:gold_invest/api/mobile_api.dart';
import 'package:gold_invest/format.dart';
import 'package:gold_invest/session.dart';
import 'package:gold_invest/theme/app_theme.dart';

class CartPage extends StatefulWidget {
  const CartPage({super.key, required this.visible, required this.onViewRates});

  final bool visible;
  final VoidCallback onViewRates;

  @override
  State<CartPage> createState() => _CartPageState();
}

class _CartPageState extends State<CartPage> {
  List<CartLine> _items = [];
  final Map<String, double> _qty = {};
  final Map<String, Timer> _timers = {};
  double _grandTotal = 0;
  bool _loading = false;
  bool _placing = false;
  bool _loaded = false;
  String? _error;
  String? _placedOrderNo;

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
  void didUpdateWidget(CartPage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.visible && !oldWidget.visible) {
      _loaded = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _load();
      });
    }
  }

  @override
  void dispose() {
    for (final timer in _timers.values) {
      timer.cancel();
    }
    super.dispose();
  }

  Future<void> _load() async {
    final session = SessionScope.of(context);
    final token = session.token;
    if (token == null) return;
    setState(() => _loading = _items.isEmpty);
    try {
      final cart = await session.api.fetchCart(token);
      if (!mounted) return;
      session.setCart(cart);
      setState(() => _apply(cart));
    } on ApiException catch (err) {
      if (!mounted) return;
      setState(() {
        _error = err.message;
        _loading = false;
      });
    }
  }

  void _apply(CartResult cart) {
    _items = cart.items;
    _grandTotal = cart.grandTotal;
    _qty
      ..clear()
      ..addEntries(cart.items.map((item) => MapEntry(item.id, item.qtyKg)));
    _loading = false;
    _error = null;
  }

  double _lineTotal(CartLine item) {
    return lineTotalMyr(item.lockedPrice, _qty[item.id] ?? item.qtyKg);
  }

  double get _shownTotal {
    if (_timers.values.any((timer) => timer.isActive)) {
      return _items.fold<double>(0, (sum, item) => sum + _lineTotal(item));
    }
    return _grandTotal;
  }

  void _changeQty(CartLine item, double next) {
    if ((next - (_qty[item.id] ?? item.qtyKg)).abs() < 0.0000001) return;
    setState(() => _qty[item.id] = next);
    _timers[item.id]?.cancel();
    _timers[item.id] = Timer(const Duration(milliseconds: 400), () => _patch(item.id, next));
  }

  Future<void> _patch(String id, double qty) async {
    final session = SessionScope.of(context);
    final token = session.token;
    if (token == null) return;
    try {
      final cart = await session.api.updateQty(token, id, qty);
      if (!mounted) return;
      session.setCart(cart);
      setState(() => _apply(cart));
    } on ApiException catch (err) {
      if (!mounted) return;
      setState(() => _error = err.message);
      await _load();
    }
  }

  Future<void> _remove(String id) async {
    final session = SessionScope.of(context);
    final token = session.token;
    if (token == null) return;
    try {
      final cart = await session.api.removeItem(token, id);
      if (!mounted) return;
      session.setCart(cart);
      setState(() => _apply(cart));
    } on ApiException catch (err) {
      if (!mounted) return;
      setState(() => _error = err.message);
    }
  }

  Future<void> _place() async {
    final session = SessionScope.of(context);
    final token = session.token;
    if (token == null || _items.isEmpty) return;
    setState(() {
      _placing = true;
      _error = null;
    });
    try {
      final orderNo = await session.api.placeOrder(token);
      if (!mounted) return;
      session.setCart(const CartResult(items: [], grandTotal: 0));
      setState(() {
        _items = [];
        _qty.clear();
        _grandTotal = 0;
        _placedOrderNo = orderNo;
      });
    } on ApiException catch (err) {
      if (!mounted) return;
      setState(() => _error = err.message);
    } finally {
      if (mounted) setState(() => _placing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return SafeArea(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
              children: [
                Text('Cart', style: text.headlineLarge),
                const SizedBox(height: 6),
                Text(
                  'Buy uses Super Heng SELL. Sell uses Super Heng BUY for Physical Gold only.',
                  style: text.bodySmall,
                ),
                if (_placedOrderNo != null) ...[
                  const SizedBox(height: 16),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0x33EDBE01),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.gold),
                    ),
                    child: Text(
                      'Order $_placedOrderNo placed',
                      style: const TextStyle(color: AppColors.gold, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Text(_error!, style: const TextStyle(color: AppColors.danger)),
                ],
                const SizedBox(height: 12),
                if (_loading)
                  const Padding(
                    padding: EdgeInsets.only(top: 32),
                    child: Center(child: CircularProgressIndicator(color: AppColors.gold)),
                  )
                else if (_items.isEmpty && _placedOrderNo == null)
                  Padding(
                    padding: const EdgeInsets.only(top: 36),
                    child: Column(
                      children: [
                        Text('Your cart is empty.', style: text.bodyMedium?.copyWith(color: AppColors.mist)),
                        TextButton(
                          onPressed: widget.onViewRates,
                          child: const Text('View rates', style: TextStyle(color: AppColors.gold, fontWeight: FontWeight.w700)),
                        ),
                      ],
                    ),
                  )
                else
                  for (final item in _items) ...[
                    _LineCard(
                      item: item,
                      qty: _qty[item.id] ?? item.qtyKg,
                      lineTotal: _lineTotal(item),
                      onMinus: () {
                        final current = _qty[item.id] ?? item.qtyKg;
                        final next = current - 1;
                        _changeQty(item, next <= 0.001 ? 0.001 : next);
                      },
                      onPlus: () => _changeQty(item, (_qty[item.id] ?? item.qtyKg) + 1),
                      onRemove: () => _remove(item.id),
                    ),
                    const SizedBox(height: 12),
                  ],
              ],
            ),
          ),
          if (_items.isNotEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 12),
              decoration: const BoxDecoration(
                color: AppColors.surface,
                border: Border(top: BorderSide(color: Color(0x14FFFFFF))),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Grand total', style: text.bodySmall),
                  const SizedBox(height: 2),
                  Text(
                    'RM ${formatPrice(_shownTotal, 2)}',
                    style: const TextStyle(color: AppColors.gold, fontSize: 22, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 10),
                  FilledButton(
                    onPressed: _placing ? null : _place,
                    child: Text(_placing ? 'Placing order…' : 'Place order'),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _LineCard extends StatelessWidget {
  const _LineCard({
    required this.item,
    required this.qty,
    required this.lineTotal,
    required this.onMinus,
    required this.onPlus,
    required this.onRemove,
  });

  final CartLine item;
  final double qty;
  final double lineTotal;
  final VoidCallback onMinus;
  final VoidCallback onPlus;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(20)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('${sideName(item.side)} · ${metalName(item.metal)}', style: text.titleMedium),
          const SizedBox(height: 6),
          Text('RM ${formatPrice(item.lockedPrice, 0)} / kg', style: text.bodySmall),
          const SizedBox(height: 8),
          Text(
            'RM ${formatPrice(lineTotal, 2)}',
            style: const TextStyle(color: AppColors.ivory, fontSize: 16, fontFeatures: [FontFeature.tabularFigures()]),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _Step(icon: Icons.remove, onPressed: onMinus, buttonKey: Key('qty-minus-${item.id}')),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                child: Text(formatQty(qty), style: const TextStyle(color: AppColors.ivory, fontSize: 16, fontWeight: FontWeight.w700)),
              ),
              _Step(icon: Icons.add, onPressed: onPlus, buttonKey: Key('qty-plus-${item.id}')),
              const Spacer(),
              TextButton(
                key: Key('remove-${item.id}'),
                onPressed: onRemove,
                child: const Text('Remove', style: TextStyle(color: AppColors.danger)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Step extends StatelessWidget {
  const _Step({required this.icon, required this.onPressed, required this.buttonKey});

  final IconData icon;
  final VoidCallback onPressed;
  final Key buttonKey;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 44,
      height: 44,
      child: IconButton(
        key: buttonKey,
        onPressed: onPressed,
        icon: Icon(icon, color: AppColors.ink, size: 18),
        style: IconButton.styleFrom(backgroundColor: AppColors.gold),
      ),
    );
  }
}
