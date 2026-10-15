import 'package:flutter/widgets.dart';
import 'package:super_heng_bullion/api/mobile_api.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SessionController extends ChangeNotifier {
  SessionController({
    this.signedIn = false,
    this.cartCount = 0,
    this.token,
    this.profile,
    this.restoring = false,
    MobileApi? api,
  }) : api = api ?? MobileApi();

  final MobileApi api;
  bool signedIn;
  int cartCount;
  bool restoring;
  String? token;
  Profile? profile;
  String locale = 'en';
  bool _openLogin = false;

  bool takeLoginRequest() {
    final open = _openLogin;
    _openLogin = false;
    return open;
  }

  Future<void> restore() async {
    restoring = true;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      locale = prefs.getString('member_locale') ?? 'en';
      final saved = prefs.getString('member_token');
      if (saved == null || saved.isEmpty) return;
      token = saved;
      profile = await api.fetchProfile(saved);
      if (profile!.locale.isNotEmpty) locale = profile!.locale;
      await prefs.setString('member_locale', locale);
      final cart = await api.fetchCart(saved);
      signedIn = true;
      cartCount = cart.items.length;
    } catch (_) {
      await _clear(openLogin: false);
    } finally {
      restoring = false;
      notifyListeners();
    }
  }

  Future<void> applyLogin(String nextToken, Profile nextProfile) async {
    token = nextToken;
    profile = nextProfile;
    if (nextProfile.locale.isNotEmpty) locale = nextProfile.locale;
    signedIn = true;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('member_token', nextToken);
      await prefs.setString('member_locale', locale);
      final cart = await api.fetchCart(nextToken);
      cartCount = cart.items.length;
    } catch (_) {}
    notifyListeners();
  }

  Future<void> signOut() => _clear(openLogin: true);

  void setCart(CartResult cart) {
    cartCount = cart.items.length;
    notifyListeners();
  }

  void setLocale(String next) {
    locale = next.isEmpty ? 'en' : next;
    notifyListeners();
  }

  void setProfile(Profile next) {
    profile = next;
    if (next.locale.isNotEmpty) locale = next.locale;
    notifyListeners();
  }

  Future<void> _clear({required bool openLogin}) async {
    token = null;
    profile = null;
    signedIn = false;
    cartCount = 0;
    _openLogin = openLogin;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('member_token');
    } catch (_) {}
    notifyListeners();
  }
}

class SessionScope extends InheritedNotifier<SessionController> {
  SessionScope({
    required SessionController controller,
    required super.child,
    super.key,
  }) : super(notifier: controller);

  static SessionController of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<SessionScope>();
    assert(scope?.notifier != null, 'SessionScope is missing');
    return scope!.notifier!;
  }
}
