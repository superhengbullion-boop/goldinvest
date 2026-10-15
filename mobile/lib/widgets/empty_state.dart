import 'package:flutter/material.dart';
import 'package:super_heng_bullion/l10n/app_text.dart';
import 'package:super_heng_bullion/theme/app_theme.dart';

class EmptyState extends StatelessWidget {
  const EmptyState({super.key, this.message});

  final String? message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const _FolderIcon(),
          const SizedBox(height: 16),
          Text(message ?? AppText.of(context).noData, style: const TextStyle(color: AppColors.mist, fontSize: 15)),
        ],
      ),
    );
  }
}

class _FolderIcon extends StatelessWidget {
  const _FolderIcon();

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: const Size(88, 72),
      painter: _FolderPainter(),
    );
  }
}

class _FolderPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paper = Paint()..color = const Color(0xFF3A3A42);
    final folder = Paint()..color = const Color(0xFF2E2E36);
    final line = Paint()
      ..color = const Color(0xFF6A6A74)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    final back = RRect.fromRectAndRadius(
      Rect.fromLTWH(size.width * 0.18, size.height * 0.28, size.width * 0.58, size.height * 0.58),
      const Radius.circular(6),
    );
    canvas.drawRRect(back, paper);

    final front = RRect.fromRectAndRadius(
      Rect.fromLTWH(8, size.height * 0.38, size.width * 0.72, size.height * 0.5),
      const Radius.circular(8),
    );
    canvas.drawRRect(front, folder);
    canvas.drawRRect(front, line);

    final tab = Path()
      ..moveTo(10, size.height * 0.4)
      ..lineTo(10, size.height * 0.22)
      ..lineTo(size.width * 0.38, size.height * 0.22)
      ..lineTo(size.width * 0.48, size.height * 0.4)
      ..close();
    canvas.drawPath(tab, folder);
    canvas.drawPath(tab, line);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
