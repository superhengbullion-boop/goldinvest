import 'dart:async';

import 'package:flutter/material.dart';
import 'package:gold_invest/api/mobile_api.dart';
import 'package:gold_invest/app_content.dart';
import 'package:gold_invest/auth/login_page.dart';
import 'package:gold_invest/company/company_page.dart';
import 'package:gold_invest/format.dart';
import 'package:gold_invest/session.dart';
import 'package:gold_invest/theme/app_theme.dart';

class RatesPage extends StatefulWidget {
  const RatesPage({super.key, required this.visible});

  final bool visible;

  @override
  State<RatesPage> createState() => _RatesPageState();
}

class _RatesPageState extends State<RatesPage> {
  List<RateRow> _rows = [];
  DateTime? _updatedAt;
  String? _error;
  bool _assigned = true;
  bool _loading = false;
  bool _loaded = false;
  bool _arming = false;
  Timer? _poll;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _sync();
  }

  @override
  void didUpdateWidget(RatesPage oldWidget) {
    super.didUpdateWidget(oldWidget);
    _sync();
  }

  @override
  void dispose() {
    _poll?.cancel();
    super.dispose();
  }

  void _sync() {
    final session = SessionScope.of(context);
    final should = widget.visible && session.signedIn && session.token != null;
    if (!should) {
      _poll?.cancel();
      _poll = null;
      _arming = false;
      return;
    }
    if (_poll != null || _arming) return;
    _arming = true;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _arming = false;
      if (!mounted || !widget.visible) return;
      final live = SessionScope.of(context);
      if (!live.signedIn || live.token == null) return;
      _load();
      _poll?.cancel();
      _poll = Timer.periodic(const Duration(seconds: 3), (_) => _load(silent: true));
    });
  }

  Future<void> _load({bool silent = false}) async {
    final session = SessionScope.of(context);
    final token = session.token;
    if (!session.signedIn || token == null) return;
    if (!silent && !_loaded) setState(() => _loading = true);
    try {
      final result = await session.api.fetchRates(token);
      if (!mounted) return;
      setState(() {
        _assigned = result.assigned;
        _rows = result.rows;
        _updatedAt = result.updatedAt ?? _updatedAt;
        _error = result.error;
        _loading = false;
        _loaded = true;
      });
    } on ApiException catch (err) {
      if (!mounted) return;
      if (err.status == 401) {
        await session.signOut();
        return;
      }
      setState(() {
        _error = err.message;
        _loading = false;
        _loaded = true;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'Cannot reach the server.';
        _loading = false;
        _loaded = true;
      });
    }
  }

  Future<void> _openLogin() {
    return Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => const LoginPage()));
  }

  Widget _titleRow(TextTheme text) {
    final copy = AppContentScope.of(context).copy;
    return Row(
      children: [
        Expanded(child: Text(copy.ratesTitle, style: text.headlineLarge)),
        TextButton.icon(
          key: const Key('open-company'),
          onPressed: () {
            Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => const CompanyPage()));
          },
          style: TextButton.styleFrom(
            foregroundColor: AppColors.gold,
            padding: const EdgeInsets.symmetric(horizontal: 8),
            minimumSize: Size.zero,
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
          icon: const Icon(Icons.info_outline, size: 20),
          label: Text(
            copy.infoLabel,
            style: const TextStyle(fontWeight: FontWeight.w700, letterSpacing: 1.2, fontSize: 13),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final session = SessionScope.of(context);
    final text = Theme.of(context).textTheme;

    if (!session.signedIn) {
      return SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _titleRow(text),
              const SizedBox(height: 28),
              Text('Sign in to view your rate book.', style: text.bodySmall),
              const SizedBox(height: 20),
              FilledButton(onPressed: _openLogin, child: const Text('Sign in')),
            ],
          ),
        ),
      );
    }

    if (!_assigned && _loaded) {
      return SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _titleRow(text),
              Expanded(
                child: Center(
                  child: Text(
                    'Your rate book is not assigned yet. Please contact us.',
                    textAlign: TextAlign.center,
                    style: text.bodyMedium?.copyWith(color: AppColors.mist),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return SafeArea(
      child: RefreshIndicator(
        color: AppColors.gold,
        backgroundColor: AppColors.surface,
        onRefresh: () => _load(),
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
          children: [
            _titleRow(text),
            if (_updatedAt != null) ...[
              const SizedBox(height: 6),
              Align(
                alignment: Alignment.centerRight,
                child: Text('Updated on ${formatRateStamp(_updatedAt!)}', style: text.bodySmall),
              ),
            ],
            if (_error != null && _rows.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(_error!, textAlign: TextAlign.center, style: text.bodySmall),
            ],
            const SizedBox(height: 16),
            if (_loading && _rows.isEmpty)
              for (var i = 0; i < 3; i++) const _SkeletonCard()
            else if (_error != null && _rows.isEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 48),
                child: Text(_error!, textAlign: TextAlign.center, style: text.bodySmall),
              )
            else
              for (final row in _rows) ...[
                _RateCard(row: row, onNeedLogin: _openLogin),
                const SizedBox(height: 12),
              ],
          ],
        ),
      ),
    );
  }
}

class _SkeletonCard extends StatelessWidget {
  const _SkeletonCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 112,
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
      ),
    );
  }
}

class _RateCard extends StatelessWidget {
  const _RateCard({required this.row, required this.onNeedLogin});

  final RateRow row;
  final Future<void> Function() onNeedLogin;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final copy = AppContentScope.of(context).copy;
    final metal = _tradeMetal(row.key);
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border(left: BorderSide(color: metal == null ? Colors.transparent : AppColors.gold, width: 3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(row.label, style: text.titleMedium),
          const SizedBox(height: 14),
          if (row.comingSoon)
            Text(copy.comingSoonLabel, style: text.bodyMedium?.copyWith(color: AppColors.mist, fontStyle: FontStyle.italic))
          else
            Row(
              children: [
                Expanded(child: _PriceColumn(label: copy.buyLabel, value: row.buy, digits: row.digits)),
                const SizedBox(width: 12),
                Expanded(child: _PriceColumn(label: copy.sellLabel, value: row.sell, digits: row.digits)),
              ],
            ),
          if (metal != null && !row.comingSoon) ...[
            const SizedBox(height: 14),
            Row(
              children: [
                if (row.sell > 0)
                  Expanded(
                    child: _LockButton(
                      label: copy.lockBuyLabel,
                      onPressed: () => _lock(context, metal: metal, side: 'buy', price: row.sell),
                    ),
                  ),
                if (metal == 'XAU' && row.buy > 0) ...[
                  if (row.sell > 0) const SizedBox(width: 8),
                  Expanded(
                    child: _LockButton(
                      label: copy.lockSellLabel,
                      onPressed: () => _lock(context, metal: metal, side: 'sell', price: row.buy),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ],
      ),
    );
  }

  Future<void> _lock(
    BuildContext context, {
    required String metal,
    required String side,
    required double price,
  }) async {
    final session = SessionScope.of(context);
    final token = session.token;
    if (!session.signedIn || token == null) {
      await onNeedLogin();
      return;
    }
    try {
      final cart = await session.api.addToCart(token, metal: metal, side: side, lockedPrice: price);
      session.setCart(cart);
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Added to cart')));
    } on ApiException catch (err) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(err.message)));
    }
  }
}

class _PriceColumn extends StatelessWidget {
  const _PriceColumn({required this.label, required this.value, required this.digits});

  final String label;
  final double value;
  final int digits;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: Theme.of(context).textTheme.bodySmall),
        const SizedBox(height: 4),
        _FlashPrice(value: value, digits: digits),
      ],
    );
  }
}

class _FlashPrice extends StatefulWidget {
  const _FlashPrice({required this.value, required this.digits});

  final double value;
  final int digits;

  @override
  State<_FlashPrice> createState() => _FlashPriceState();
}

class _FlashPriceState extends State<_FlashPrice> {
  bool _flash = false;
  Timer? _timer;

  @override
  void didUpdateWidget(_FlashPrice oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.value == widget.value) return;
    _timer?.cancel();
    setState(() => _flash = true);
    _timer = Timer(const Duration(milliseconds: 700), () {
      if (mounted) setState(() => _flash = false);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      key: _flash ? const Key('price-flash') : null,
      duration: const Duration(milliseconds: 200),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: _flash ? const Color(0x55EDBE01) : Colors.transparent,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        formatPrice(widget.value, widget.digits),
        style: const TextStyle(
          color: AppColors.gold,
          fontSize: 22,
          fontWeight: FontWeight.w700,
          fontFeatures: [FontFeature.tabularFigures()],
        ),
      ),
    );
  }
}

class _LockButton extends StatelessWidget {
  const _LockButton({required this.label, required this.onPressed});

  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 40,
      child: FilledButton(
        onPressed: onPressed,
        style: FilledButton.styleFrom(
          minimumSize: const Size.fromHeight(40),
          padding: const EdgeInsets.symmetric(horizontal: 8),
          shape: const StadiumBorder(),
          textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, letterSpacing: 0.4),
        ),
        child: Text(label),
      ),
    );
  }
}

String? _tradeMetal(String key) {
  if (key == 'physical-gold-myr-kg') return 'XAU';
  if (key == 'physical-silver-myr-kg') return 'XAG';
  return null;
}
