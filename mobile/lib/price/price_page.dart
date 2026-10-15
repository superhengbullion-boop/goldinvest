import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:super_heng_bullion/api/mobile_api.dart';
import 'package:super_heng_bullion/l10n/app_text.dart';
import 'package:super_heng_bullion/session.dart';
import 'package:super_heng_bullion/theme/app_theme.dart';

const _buyGreen = Color(0xFF3DDC97);

class PricePage extends StatefulWidget {
  const PricePage({super.key, required this.visible});

  final bool visible;

  @override
  State<PricePage> createState() => _PricePageState();
}

class _PricePageState extends State<PricePage> {
  static const troyOzGrams = 31.1034768;

  String _pair = 'xau_myr';
  String _range = '1D';
  String _side = 'buy';
  String _unit = 'g';
  String _frame = '1M';
  bool _candles = false;
  PriceChart? _chart;
  List<PricePoint> _ticks = [];
  String? _error;
  bool _loading = false;
  bool _arming = false;
  Timer? _poll;

  @override
  void didUpdateWidget(PricePage oldWidget) {
    super.didUpdateWidget(oldWidget);
    _syncPoll();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _syncPoll();
  }

  @override
  void dispose() {
    _poll?.cancel();
    super.dispose();
  }

  void _syncPoll() {
    final session = SessionScope.of(context);
    final should = widget.visible && session.token != null;
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
      if (!mounted || !widget.visible || _poll != null) return;
      if (SessionScope.of(context).token == null) return;
      _load();
      _poll = Timer.periodic(const Duration(seconds: 3), (_) => _load(silent: true));
    });
  }

  void _takeTicks(PriceChart chart) {
    _ticks = [...chart.points];
  }

  Future<void> _load({bool silent = false}) async {
    final token = SessionScope.of(context).token;
    if (token == null) return;
    final pair = _pair;
    final range = _range;
    final side = _side;
    final frame = _frame;
    if (!silent) {
      setState(() {
        _loading = true;
        _error = null;
      });
    }
    try {
      final chart = await SessionScope.of(context).api.fetchPrices(
            token,
            pair: pair,
            range: range,
            side: side,
            frame: frame,
          );
      if (!mounted || pair != _pair || range != _range || side != _side || frame != _frame) return;
      setState(() {
        _chart = chart;
        _range = chart.ranges.contains(_range) ? _range : '1D';
        _takeTicks(chart);
        _error = null;
      });
    } on ApiException catch (err) {
      if (mounted && (!silent || _chart == null)) setState(() => _error = err.message);
    } catch (_) {
      if (mounted && (!silent || _chart == null)) setState(() => _error = 'Cannot reach the server.');
    } finally {
      if (mounted && !silent) setState(() => _loading = false);
    }
  }

  Future<void> _chooseSide() async {
    final t = AppText.of(context);
    final next = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: AppColors.surface,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: Text(t.buyPrice),
              trailing: _side == 'buy' ? const Icon(Icons.check, color: AppColors.gold) : null,
              onTap: () => Navigator.pop(context, 'buy'),
            ),
            ListTile(
              title: Text(t.sellPrice),
              trailing: _side == 'sell' ? const Icon(Icons.check, color: AppColors.gold) : null,
              onTap: () => Navigator.pop(context, 'sell'),
            ),
          ],
        ),
      ),
    );
    if (next == null || next == _side || !mounted) return;
    setState(() {
      _side = next;
      _ticks = [];
    });
    await _load();
  }

  Future<void> _chooseUnit() async {
    final options = _pair == 'xau_myr' ? const ['g', 'oz'] : const ['oz', 'g'];
    final next = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: AppColors.surface,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            for (final unit in options)
              ListTile(
                title: Text('$_currency/$unit'),
                trailing: _unit == unit ? const Icon(Icons.check, color: AppColors.gold) : null,
                onTap: () => Navigator.pop(context, unit),
              ),
          ],
        ),
      ),
    );
    if (next == null || !mounted) return;
    setState(() => _unit = next);
  }

  Future<void> _chooseFrame() async {
    const frames = ['1M', '15M', '1H', '1D'];
    final next = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: AppColors.surface,
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Row(
            children: [
              for (final frame in frames)
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: ChoiceChip(
                      label: Text(frame),
                      selected: _frame == frame,
                      onSelected: (_) => Navigator.pop(context, frame),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
    if (next == null || next == _frame || !mounted) return;
    setState(() {
      _frame = next;
      _ticks = [];
    });
    await _load();
  }

  String get _currency => _pair == 'xau_myr' ? 'MYR' : 'USD';

  String get _unitLabel => '$_currency/$_unit';

  double _toDisplay(double base) {
    if (_pair == 'xau_myr' && _unit == 'oz') return base * troyOzGrams;
    if (_pair == 'xau_usd' && _unit == 'g') return base / troyOzGrams;
    return base;
  }

  String _money(String? raw) {
    final value = double.tryParse(raw ?? '');
    if (value == null) return '—';
    final digits = _pair == 'xau_usd' && _unit == 'oz' ? 2 : 3;
    final text = _toDisplay(value).toStringAsFixed(digits);
    return text.replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (match) => ',');
  }

  Color _moveColor() {
    final raw = _ticks.isEmpty ? (_chart?.points ?? const <PricePoint>[]) : _ticks;
    if (raw.length < 2) return _buyGreen;
    final last = _toDisplay(raw.last.price);
    for (var i = raw.length - 2; i >= 0; i--) {
      final earlier = _toDisplay(raw[i].price);
      if (last > earlier) return _buyGreen;
      if (last < earlier) return AppColors.danger;
    }
    return _buyGreen;
  }

  List<PricePoint> get _displayPoints {
    final raw = _ticks.isEmpty ? (_chart?.points ?? const <PricePoint>[]) : _ticks;
    return [
      for (final point in raw)
        PricePoint(
          at: point.at,
          price: _toDisplay(point.price),
          open: _toDisplay(point.open),
          high: _toDisplay(point.high),
          low: _toDisplay(point.low),
        ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    final t = AppText.of(context);
    final chart = _chart;
    final ranges = chart?.ranges ?? const ['1D'];
    return ColoredBox(
      color: AppColors.ink,
      child: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          children: [
            Row(
              children: [
                _PairTab(
                  tabKey: const Key('price-pair-myr'),
                  label: 'XAU/MYR',
                  selected: _pair == 'xau_myr',
                  onTap: () {
                    if (_pair == 'xau_myr') return;
                    setState(() {
                      _pair = 'xau_myr';
                      _unit = 'g';
                      _ticks = [];
                    });
                    _load();
                  },
                ),
                _PairTab(
                  tabKey: const Key('price-pair-usd'),
                  label: 'XAU/USD',
                  selected: _pair == 'xau_usd',
                  onTap: () {
                    if (_pair == 'xau_usd') return;
                    setState(() {
                      _pair = 'xau_usd';
                      _unit = 'oz';
                      _ticks = [];
                    });
                    _load();
                  },
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                if (chart?.marketOpen == true)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0x223DDC97),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(t.marketOpen, style: const TextStyle(color: _buyGreen, fontSize: 12, fontWeight: FontWeight.w700)),
                  ),
                const Spacer(),
                InkWell(
                  key: const Key('price-unit'),
                  onTap: _chooseUnit,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(_unitLabel, style: const TextStyle(color: AppColors.ivory, fontWeight: FontWeight.w600)),
                      const Icon(Icons.keyboard_arrow_down, color: AppColors.mist, size: 18),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _Quote(label: t.sell, value: _money(chart?.sell), currency: _currency, color: AppColors.danger)),
                Container(width: 1, height: 56, color: const Color(0x22FFFFFF)),
                Expanded(child: _Quote(label: t.buy, value: _money(chart?.buy), currency: _currency, color: _buyGreen, alignEnd: true)),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        for (final range in ranges)
                          Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: ChoiceChip(
                              key: Key('price-range-$range'),
                              label: Text(range),
                              selected: _range == range,
                              onSelected: (_) {
                                if (_range == range) return;
                                setState(() {
                                  _range = range;
                                  _ticks = [];
                                });
                                _load();
                              },
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
                _ChartMode(label: t.lineChart, selected: !_candles, onTap: () => setState(() => _candles = false)),
                _ChartMode(label: t.candleChart, selected: _candles, onTap: () => setState(() => _candles = true)),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _MenuBox(
                    boxKey: const Key('price-side'),
                    label: _side == 'buy' ? t.buyPrice : t.sellPrice,
                    onTap: _chooseSide,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _MenuBox(
                    boxKey: const Key('price-frame'),
                    label: _frame,
                    onTap: _chooseFrame,
                  ),
                ),
              ],
            ),
            if (_error != null)
              Text(t.message(_error!), style: const TextStyle(color: AppColors.danger)),
            SizedBox(
              height: 280,
              child: _loading && chart == null
                  ? const Center(child: CircularProgressIndicator(color: AppColors.gold))
                  : _PriceChart(
                      points: _displayPoints,
                      pair: _pair,
                      candles: _candles,
                      tag: _money(_side == 'buy' ? chart?.buy : chart?.sell),
                      tagColor: _moveColor(),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

String _quote(String pair, String? raw) {
  if (raw == null || raw.isEmpty) return '—';
  final value = double.tryParse(raw);
  if (value == null) return raw;
  final digits = pair == 'xau_usd' ? value.toStringAsFixed(2) : value.toStringAsFixed(3);
  return digits.replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (match) => ',');
}

class _PairTab extends StatelessWidget {
  const _PairTab({required this.tabKey, required this.label, required this.selected, required this.onTap});

  final Key tabKey;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        key: tabKey,
        onTap: onTap,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Text(
                label,
                style: TextStyle(
                  color: selected ? AppColors.gold : AppColors.mist,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            Container(height: 2, color: selected ? AppColors.gold : Colors.transparent),
          ],
        ),
      ),
    );
  }
}

class _Quote extends StatelessWidget {
  const _Quote({
    required this.label,
    required this.value,
    required this.currency,
    required this.color,
    this.alignEnd = false,
  });

  final String label;
  final String value;
  final String currency;
  final Color color;
  final bool alignEnd;

  @override
  Widget build(BuildContext context) {
    final cross = alignEnd ? CrossAxisAlignment.end : CrossAxisAlignment.start;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Column(
        crossAxisAlignment: cross,
        children: [
          Row(
            mainAxisAlignment: alignEnd ? MainAxisAlignment.end : MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Flexible(
                child: Text(value, style: const TextStyle(color: AppColors.ivory, fontSize: 26, fontWeight: FontWeight.w700)),
              ),
              const SizedBox(width: 4),
              Text(currency, style: const TextStyle(color: AppColors.mist, fontSize: 12)),
            ],
          ),
          const SizedBox(height: 4),
          Text(label, style: TextStyle(color: color, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}

class _MenuBox extends StatelessWidget {
  const _MenuBox({required this.boxKey, required this.label, required this.onTap});

  final Key boxKey;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        key: boxKey,
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
          child: Row(
            children: [
              Expanded(child: Text(label, style: const TextStyle(fontWeight: FontWeight.w700))),
              const Icon(Icons.keyboard_arrow_down, color: AppColors.mist),
            ],
          ),
        ),
      ),
    );
  }
}

class _ChartMode extends StatelessWidget {
  const _ChartMode({required this.label, required this.selected, required this.onTap});

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(label: Text(label), selected: selected, onSelected: (_) => onTap()),
    );
  }
}

class _PriceChart extends StatefulWidget {
  const _PriceChart({
    required this.points,
    required this.pair,
    required this.candles,
    required this.tag,
    required this.tagColor,
  });

  final List<PricePoint> points;
  final String pair;
  final bool candles;
  final String tag;
  final Color tagColor;

  @override
  State<_PriceChart> createState() => _PriceChartState();
}

class _PriceChartState extends State<_PriceChart> {
  double _span = 0;
  int? _end;
  double _startSpan = 0;
  double _startFocal = 0;
  int _startEnd = 0;

  @override
  void didUpdateWidget(_PriceChart oldWidget) {
    super.didUpdateWidget(oldWidget);
    final previous = oldWidget.points;
    final next = widget.points;
    if (previous.isEmpty || next.isEmpty) return;
    if (previous.first.at != next.first.at) {
      _span = 0;
      _end = null;
    }
  }

  int _window(int total) {
    if (total == 0) return 0;
    if (_span <= 0) return total;
    return _span.round().clamp(4, total);
  }

  List<PricePoint> _slice() {
    final points = widget.points;
    final total = points.length;
    final window = _window(total);
    if (window == 0) return const [];
    final end = (_end ?? total - 1).clamp(window - 1, total - 1);
    return points.sublist(end - window + 1, end + 1);
  }

  @override
  Widget build(BuildContext context) {
    final shown = _slice();
    return LayoutBuilder(
      builder: (context, constraints) {
        final plotWidth = math.max(1.0, constraints.maxWidth - 72);
        return GestureDetector(
          onScaleStart: (details) {
            final total = widget.points.length;
            _startSpan = _window(total).toDouble();
            _startFocal = details.focalPoint.dx;
            _startEnd = _end ?? math.max(0, total - 1);
          },
          onScaleUpdate: (details) {
            final total = widget.points.length;
            if (total < 2) return;
            final span = (_startSpan / details.scale).clamp(4.0, total.toDouble());
            final slot = plotWidth / span;
            final shift = (details.focalPoint.dx - _startFocal) / slot;
            final end = (_startEnd - shift).round().clamp(span.round() - 1, total - 1);
            setState(() {
              _span = span >= total ? 0 : span;
              _end = end >= total - 1 ? null : end;
            });
          },
          child: CustomPaint(
            painter: widget.candles
                ? _CandleChartPainter(candles: _candlesOf(shown), pair: widget.pair, tag: widget.tag, tagColor: widget.tagColor)
                : _PriceChartPainter(points: shown, pair: widget.pair, tag: widget.tag, tagColor: widget.tagColor),
            child: const SizedBox.expand(),
          ),
        );
      },
    );
  }
}

class _PriceChartPainter extends CustomPainter {
  _PriceChartPainter({required this.points, required this.pair, required this.tag, required this.tagColor});

  final List<PricePoint> points;
  final String pair;
  final String tag;
  final Color tagColor;

  @override
  void paint(Canvas canvas, Size size) {
    if (points.isEmpty) return;
    const left = 8.0;
    const right = 64.0;
    const top = 12.0;
    const bottom = 48.0;
    final plot = Rect.fromLTRB(left, top, size.width - right, size.height - bottom);
    var minPrice = points.first.price;
    var maxPrice = points.first.price;
    for (final point in points) {
      minPrice = math.min(minPrice, point.price);
      maxPrice = math.max(maxPrice, point.price);
    }
    if (minPrice == maxPrice) {
      minPrice -= 1;
      maxPrice += 1;
    }
    final span = maxPrice - minPrice;
    final pad = span * 0.08;
    minPrice -= pad;
    maxPrice += pad;

    double yFor(double price) {
      final t = (price - minPrice) / (maxPrice - minPrice);
      return plot.bottom - t * plot.height;
    }

    double xFor(int index) => _seriesX(plot, points.length, index);

    final grid = Paint()
      ..color = const Color(0x22FFFFFF)
      ..strokeWidth = 1;
    final label = TextPainter(textDirection: TextDirection.ltr);
    for (var i = 0; i < 4; i++) {
      final price = minPrice + (maxPrice - minPrice) * i / 3;
      final y = yFor(price);
      canvas.drawLine(Offset(plot.left, y), Offset(plot.right, y), grid);
      label.text = TextSpan(
        text: _quote(pair, price.toString()),
        style: const TextStyle(color: AppColors.mist, fontSize: 10),
      );
      label.layout(maxWidth: right - 4);
      label.paint(canvas, Offset(plot.right + 6, y - 6));
    }

    final path = Path();
    for (var i = 0; i < points.length; i++) {
      final offset = Offset(xFor(i), yFor(points[i].price));
      if (i == 0) {
        path.moveTo(offset.dx, offset.dy);
      } else {
        path.lineTo(offset.dx, offset.dy);
      }
    }
    final fill = Path.from(path)
      ..lineTo(xFor(points.length - 1), plot.bottom)
      ..lineTo(xFor(0), plot.bottom)
      ..close();
    canvas.drawPath(
      fill,
      Paint()
        ..shader = LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            AppColors.gold.withValues(alpha: 0.28),
            AppColors.gold.withValues(alpha: 0),
          ],
        ).createShader(plot),
    );
    canvas.drawPath(
      path,
      Paint()
        ..color = AppColors.gold
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2
        ..strokeJoin = StrokeJoin.round,
    );
    if (points.length == 1) {
      canvas.drawCircle(Offset(xFor(0), yFor(points.first.price)), 3, Paint()..color = AppColors.gold);
    }
    _paintTag(canvas, plot, size.width, yFor(points.last.price), tag, tagColor);

    _paintTimes(canvas, plot, size.width, [for (final point in points) point.at], xFor);
  }

  @override
  bool shouldRepaint(covariant _PriceChartPainter oldDelegate) {
    if (oldDelegate.pair != pair || oldDelegate.tag != tag || oldDelegate.points.length != points.length) return true;
    if (points.isEmpty) return false;
    return oldDelegate.points.last.price != points.last.price || oldDelegate.points.last.at != points.last.at;
  }
}

class _Candle {
  _Candle({required this.at, required this.open, required this.high, required this.low, required this.close});

  final DateTime at;
  final double open;
  double high;
  double low;
  double close;
}

List<_Candle> _candlesOf(List<PricePoint> points) {
  return [
    for (final point in points)
      _Candle(at: point.at, open: point.open, high: point.high, low: point.low, close: point.price),
  ];
}

class _CandleChartPainter extends CustomPainter {
  _CandleChartPainter({required this.candles, required this.pair, required this.tag, required this.tagColor});

  final List<_Candle> candles;
  final String pair;
  final String tag;
  final Color tagColor;

  @override
  void paint(Canvas canvas, Size size) {
    if (candles.isEmpty) return;
    const left = 8.0;
    const right = 64.0;
    const top = 12.0;
    const bottom = 48.0;
    final plot = Rect.fromLTRB(left, top, size.width - right, size.height - bottom);
    canvas.drawRect(
      plot,
      Paint()
        ..shader = const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0x00000000), Color(0x33212121)],
        ).createShader(plot),
    );
    var minPrice = candles.first.low;
    var maxPrice = candles.first.high;
    for (final candle in candles) {
      minPrice = math.min(minPrice, candle.low);
      maxPrice = math.max(maxPrice, candle.high);
    }
    if (minPrice == maxPrice) {
      minPrice -= 1;
      maxPrice += 1;
    }
    final pad = (maxPrice - minPrice) * 0.08;
    minPrice -= pad;
    maxPrice += pad;

    double yFor(double price) => plot.bottom - (price - minPrice) / (maxPrice - minPrice) * plot.height;
    final slot = _seriesSlot(plot, candles.length);
    final bodyWidth = math.max(2.0, slot * 0.72);

    final grid = Paint()
      ..color = const Color(0x22FFFFFF)
      ..strokeWidth = 1;
    final label = TextPainter(textDirection: TextDirection.ltr);
    for (var i = 0; i < 4; i++) {
      final price = minPrice + (maxPrice - minPrice) * i / 3;
      final y = yFor(price);
      canvas.drawLine(Offset(plot.left, y), Offset(plot.right, y), grid);
      label.text = TextSpan(text: _quote(pair, price.toString()), style: const TextStyle(color: AppColors.mist, fontSize: 10));
      label.layout(maxWidth: right - 4);
      label.paint(canvas, Offset(plot.right + 6, y - 6));
    }

    for (var i = 0; i < candles.length; i++) {
      final candle = candles[i];
      final x = _seriesX(plot, candles.length, i);
      final rising = candle.close >= candle.open;
      final paint = Paint()
        ..color = rising ? _buyGreen : AppColors.danger
        ..strokeWidth = 1.5
        ..style = PaintingStyle.stroke;
      canvas.drawLine(Offset(x, yFor(candle.high)), Offset(x, yFor(candle.low)), paint);
      final topY = yFor(math.max(candle.open, candle.close));
      final bottomY = yFor(math.min(candle.open, candle.close));
      canvas.drawRect(
        Rect.fromLTRB(x - bodyWidth / 2, topY, x + bodyWidth / 2, math.max(bottomY, topY + 1)),
        Paint()
          ..color = paint.color
          ..style = PaintingStyle.fill,
      );
    }
    _paintTag(canvas, plot, size.width, yFor(candles.last.close), tag, tagColor);
    _paintTimes(canvas, plot, size.width, [for (final candle in candles) candle.at], (index) => _seriesX(plot, candles.length, index));
  }

  @override
  bool shouldRepaint(covariant _CandleChartPainter oldDelegate) {
    if (oldDelegate.pair != pair || oldDelegate.candles.length != candles.length) return true;
    if (candles.isEmpty) return false;
    final next = candles.last;
    final prev = oldDelegate.candles.last;
    return next.close != prev.close || next.high != prev.high || next.low != prev.low;
  }
}

double _seriesSlot(Rect plot, int count) {
  if (count <= 0) return plot.width;
  return plot.width / count;
}

double _seriesX(Rect plot, int count, int index) {
  if (count <= 1) return plot.center.dx;
  return plot.left + plot.width * index / (count - 1);
}

void _paintTag(Canvas canvas, Rect plot, double width, double y, String tag, Color color) {
  final dash = Paint()
    ..color = color.withValues(alpha: 0.7)
    ..strokeWidth = 1;
  var x = plot.left;
  while (x < plot.right) {
    canvas.drawLine(Offset(x, y), Offset(math.min(x + 6, plot.right), y), dash);
    x += 10;
  }
  if (tag == '—') return;
  final label = TextPainter(
    text: TextSpan(text: tag, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
    textDirection: TextDirection.ltr,
  )..layout();
  final rect = Rect.fromLTWH(width - label.width - 16, y - 10, label.width + 12, 20);
  canvas.drawRRect(RRect.fromRectAndRadius(rect, const Radius.circular(4)), Paint()..color = color);
  label.paint(canvas, Offset(rect.left + 6, rect.top + 3));
}

void _paintTimes(Canvas canvas, Rect plot, double width, List<DateTime> times, double Function(int index) xFor) {
  if (times.isEmpty) return;
  final indexes = <int>[0];
  if (times.length > 8) {
    indexes.add(times.length ~/ 3);
    indexes.add((2 * times.length) ~/ 3);
  }
  if (times.length > 1) indexes.add(times.length - 1);
  final label = TextPainter(textDirection: TextDirection.ltr, textAlign: TextAlign.center);
  for (final index in indexes) {
    label.text = TextSpan(
      text: _stamp(times[index]),
      style: const TextStyle(color: AppColors.mist, fontSize: 10, height: 1.25),
    );
    label.layout();
    final dx = (xFor(index) - label.width / 2).clamp(0.0, width - label.width);
    label.paint(canvas, Offset(dx, plot.bottom + 6));
  }
}

String _stamp(DateTime time) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  final local = time.toLocal();
  final hour = local.hour.toString().padLeft(2, '0');
  final minute = local.minute.toString().padLeft(2, '0');
  return '${local.day} ${months[local.month - 1]} ${local.year}\n$hour:$minute';
}
