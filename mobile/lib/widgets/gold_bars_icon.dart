import 'package:flutter/material.dart';
import 'package:super_heng_bullion/theme/app_theme.dart';

/// Three gold bars: one centered on top of two side by side.
class GoldBarsIcon extends StatelessWidget {
  const GoldBarsIcon({super.key, this.size = 22, this.color = AppColors.gold});

  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(painter: _GoldBarsPainter(color)),
    );
  }
}

class _GoldBarsPainter extends CustomPainter {
  _GoldBarsPainter(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = color;
    final s = size.shortestSide;
    final barW = s * 0.40;
    final barH = s * 0.32;
    final gapX = s * 0.08;
    final gapY = s * 0.10;
    final totalW = barW * 2 + gapX;
    final totalH = barH * 2 + gapY;
    final originX = (size.width - totalW) / 2;
    final originY = (size.height - totalH) / 2;
    final radius = Radius.circular(s * 0.04);

    void bar(double x, double y) {
      canvas.drawRRect(
        RRect.fromRectAndRadius(Rect.fromLTWH(x, y, barW, barH), radius),
        paint,
      );
    }

    bar(originX + (totalW - barW) / 2, originY);
    bar(originX, originY + barH + gapY);
    bar(originX + barW + gapX, originY + barH + gapY);
  }

  @override
  bool shouldRepaint(covariant _GoldBarsPainter oldDelegate) => oldDelegate.color != color;
}
