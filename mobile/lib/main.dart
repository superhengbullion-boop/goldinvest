import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:super_heng_bullion/app_content.dart';
import 'package:super_heng_bullion/auth/login_page.dart';
import 'package:super_heng_bullion/session.dart';
import 'package:super_heng_bullion/shell/app_shell.dart';
import 'package:super_heng_bullion/splash/launch_splash.dart';
import 'package:super_heng_bullion/splash/splash_logo.dart';
import 'package:super_heng_bullion/theme/app_theme.dart';

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

class _AuthGate extends StatelessWidget {
  const _AuthGate();

  @override
  Widget build(BuildContext context) {
    final session = SessionScope.of(context);
    if (session.restoring) {
      return const ColoredBox(color: AppColors.ink);
    }
    if (!session.signedIn) return const LoginPage();
    return const AppShell();
  }
}

class _GoldInvestAppState extends State<GoldInvestApp> {
  late final SessionController _session =
      widget.session ?? SessionController(restoring: widget.restoreSession);
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
    const home = _AuthGate();
    return AppContentScope(
      controller: _content,
      child: SessionScope(
        controller: _session,
        child: MaterialApp(
          title: 'SuperHeng Bullion',
          debugShowCheckedModeBanner: false,
          theme: buildAppTheme(),
          home: widget.showSplash
              ? LaunchSplash(logoPath: widget.splashLogoPath, child: home)
              : home,
        ),
      ),
    );
  }
}
