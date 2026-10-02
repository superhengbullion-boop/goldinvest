import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gold_invest/app_content.dart';
import 'package:gold_invest/session.dart';
import 'package:gold_invest/shell/app_shell.dart';
import 'package:gold_invest/splash/launch_splash.dart';
import 'package:gold_invest/splash/splash_logo.dart';
import 'package:gold_invest/theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(appOverlay);
  final splashLogo = await cachedSplashLogo();
  runApp(GoldInvestApp(restoreSession: true, showSplash: true, splashLogoPath: splashLogo));
}

class GoldInvestApp extends StatefulWidget {
  const GoldInvestApp({
    super.key,
    this.session,
    this.restoreSession = false,
    this.showSplash = false,
    this.splashLogoPath,
  });

  final SessionController? session;
  final bool restoreSession;
  final bool showSplash;
  final String? splashLogoPath;

  @override
  State<GoldInvestApp> createState() => _GoldInvestAppState();
}

class _GoldInvestAppState extends State<GoldInvestApp> {
  late final SessionController _session = widget.session ?? SessionController();
  late final AppContentController _content = AppContentController(api: _session.api);

  @override
  void initState() {
    super.initState();
    if (widget.restoreSession && widget.session == null) {
      _session.restore();
    }
    if (widget.restoreSession || widget.session != null) {
      _content.load();
    }
  }

  @override
  Widget build(BuildContext context) {
    final shell = const AppShell();
    return AppContentScope(
      controller: _content,
      child: SessionScope(
        controller: _session,
        child: MaterialApp(
          title: 'Gold Invest',
          debugShowCheckedModeBanner: false,
          theme: buildAppTheme(),
          home: widget.showSplash
              ? LaunchSplash(logoPath: widget.splashLogoPath, child: shell)
              : shell,
        ),
      ),
    );
  }
}
