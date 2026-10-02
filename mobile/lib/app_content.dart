import 'package:flutter/widgets.dart';
import 'package:gold_invest/api/mobile_api.dart';
import 'package:gold_invest/splash/splash_logo.dart';

class AppContentController extends ChangeNotifier {
  AppContentController({required this.api});

  final MobileApi api;
  AppCopy copy = AppCopy.fallback;

  Future<void> load() async {
    try {
      final next = await api.fetchApp();
      copy = next;
      notifyListeners();
      await cacheSplashLogo(next.logoUrl);
    } catch (_) {}
  }
}

class AppContentScope extends InheritedNotifier<AppContentController> {
  AppContentScope({
    required AppContentController controller,
    required super.child,
    super.key,
  }) : super(notifier: controller);

  static AppContentController of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<AppContentScope>();
    assert(scope?.notifier != null, 'AppContentScope is missing');
    return scope!.notifier!;
  }
}
