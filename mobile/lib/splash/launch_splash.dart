import 'dart:io';

import 'package:flutter/material.dart';
import 'package:gold_invest/theme/app_theme.dart';

class LaunchSplash extends StatefulWidget {
  const LaunchSplash({super.key, required this.logoPath, required this.child});

  final String? logoPath;
  final Widget child;

  @override
  State<LaunchSplash> createState() => _LaunchSplashState();
}

class _LaunchSplashState extends State<LaunchSplash> {
  bool _done = false;

  @override
  void initState() {
    super.initState();
    Future<void>.delayed(const Duration(milliseconds: 700), () {
      if (mounted) setState(() => _done = true);
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_done) return widget.child;
    final path = widget.logoPath;
    return ColoredBox(
      color: AppColors.ink,
      child: Center(
        child: path == null
            ? Image.asset('assets/logo.png', key: const Key('launch-logo'), width: 180, height: 180)
            : Image.file(File(path), key: const Key('launch-logo'), width: 180, height: 180),
      ),
    );
  }
}
