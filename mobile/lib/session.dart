import 'package:flutter/widgets.dart';
import 'package:gold_invest/api/mobile_api.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SessionController extends ChangeNotifier {
  SessionController({
    this.signedIn = false,
    this.cartCount = 0,
    this.token,
    this.profile,
    MobileApi? api,
  }) : api = api ?? MobileApi();

  final MobileApi api;
  bool signedIn;
  int cartCount;
  String? token;
  Profile? profile;
  bool _openLogin = false;

  bool takeLoginRequest() {
    final open = _openLogin;
    _openLogin = false;
    return open;
  }

  Future<void> restore() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final saved = prefs.getString('member_token');
      if (saved == null || saved.isEmpty) return;
      token = saved;
      profile = await api.fetchProfile(saved);
      final cart = await api.fetchCart(saved);
      signedIn = true;
      cartCount = cart.items.length;
      notifyListeners();
    } catch (_) {
      await _clear(openLogin: false);
    }
  }

  Future<void> applyLogin(String nextToken, Profile nextProfile) async {
    token = nextToken;
    profile = nextProfile;
    signedIn = true;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('member_token', nextToken);
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

  void setProfile(Profile next) {
    profile = next;
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
