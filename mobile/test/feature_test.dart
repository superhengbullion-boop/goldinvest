import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:super_heng_bullion/account/account_page.dart';
import 'package:super_heng_bullion/api/mobile_api.dart';
import 'package:super_heng_bullion/app_content.dart';
import 'package:super_heng_bullion/assets/assets_page.dart';
import 'package:super_heng_bullion/assets/deposit_page.dart';
import 'package:super_heng_bullion/auth/login_page.dart';
import 'package:super_heng_bullion/cart/cart_page.dart';
import 'package:super_heng_bullion/company/company_page.dart';
import 'package:super_heng_bullion/main.dart';
import 'package:super_heng_bullion/rates/rates_page.dart';
import 'package:super_heng_bullion/splash/launch_splash.dart';
import 'package:super_heng_bullion/splash/splash_logo.dart';
import 'package:super_heng_bullion/session.dart';
import 'package:super_heng_bullion/theme/app_theme.dart';
import 'package:shared_preferences/shared_preferences.dart';

Profile _profile({String fullName = 'Ada Lovelace'}) {
  return Profile(
    memberId: 'SHB0001',
    username: 'ada',
    fullName: fullName,
    phone: '60123456789',
    email: 'ada@example.com',
    rateBookAssigned: true,
  );
}

RateRow _row({
  required String key,
  required String label,
  double buy = 100,
  double sell = 110,
  bool comingSoon = false,
}) {
  return RateRow(key: key, label: label, buy: buy, sell: sell, digits: 0, comingSoon: comingSoon);
}

class FakeApi extends MobileApi {
  FakeApi({this.rates});

  RatesResult? rates;
  int rateCalls = 0;
  CartResult cart = const CartResult(items: [], grandTotal: 0);
  String? loginError;
  Profile profile = _profile();
  int addCalls = 0;
  String? lastSide;
  double? lastPrice;

  @override
  Future<LoginResult> login(String username, String password) async {
    if (loginError != null) throw ApiException(401, loginError!);
    return LoginResult(token: 'token-1', profile: profile);
  }

  @override
  Future<Profile> fetchProfile(String token) async => profile;

  @override
  Future<Profile> updateProfile(
    String token, {
    required String username,
    required String fullName,
    String password = '',
    String confirmPassword = '',
  }) async {
    profile = Profile(
      memberId: profile.memberId,
      username: username,
      fullName: fullName,
      phone: profile.phone,
      email: profile.email,
      rateBookAssigned: profile.rateBookAssigned,
    );
    return profile;
  }

  @override
  Future<RatesResult> fetchRates(String token) async {
    rateCalls += 1;
    final current = rates;
    if (current == null) {
      return const RatesResult(assigned: true, rows: [], updatedAt: null);
    }
    if (rateCalls == 1) return current;
    return RatesResult(
      assigned: current.assigned,
      updatedAt: current.updatedAt,
      rows: current.rows
          .map(
            (row) => row.key == 'physical-gold-myr-kg'
                ? RateRow(
                    key: row.key,
                    label: row.label,
                    buy: row.buy + 1,
                    sell: row.sell,
                    digits: row.digits,
                    comingSoon: row.comingSoon,
                  )
                : row,
          )
          .toList(),
    );
  }

  @override
  Future<CartResult> fetchCart(String token) async => cart;

  @override
  Future<CartResult> addToCart(
    String token, {
    required String metal,
    required String side,
    required double lockedPrice,
    double qtyKg = 1,
  }) async {
    addCalls += 1;
    lastSide = side;
    lastPrice = lockedPrice;
    cart = CartResult(
      items: [
        CartLine(id: 'c1', metal: metal, side: side, lockedPrice: lockedPrice, qtyKg: qtyKg, lineTotal: lockedPrice),
      ],
      grandTotal: lockedPrice,
    );
    return cart;
  }

  @override
  Future<CartResult> updateQty(String token, String id, double qtyKg) async {
    final line = cart.items.first;
    final total = line.lockedPrice * qtyKg;
    cart = CartResult(
      items: [
        CartLine(
          id: line.id,
          metal: line.metal,
          side: line.side,
          lockedPrice: line.lockedPrice,
          qtyKg: qtyKg,
          lineTotal: total,
        ),
      ],
      grandTotal: total,
    );
    return cart;
  }

  @override
  Future<CartResult> removeItem(String token, String id) async {
    cart = const CartResult(items: [], grandTotal: 0);
    return cart;
  }

  OrdersPage history = const OrdersPage(orders: [], total: 0, page: 1, pageCount: 1, pageSize: 10);
  int? lastHistoryPage;
  int? lastHistoryLimit;

  CompanyInfo company = CompanyInfo.fallback;
  bool companyFails = false;
  AppCopy appCopy = AppCopy.fallback;
  bool appFails = false;

  @override
  Future<AppCopy> fetchApp() async {
    if (appFails) throw ApiException(0, 'Cannot reach the server.');
    return appCopy;
  }

  @override
  Future<CompanyInfo> fetchCompany() async {
    if (companyFails) throw ApiException(0, 'Cannot reach the server.');
    return company;
  }

  @override
  Future<OrdersPage> fetchOrders(String token, {int page = 1, int limit = 10}) async {
    lastHistoryPage = page;
    lastHistoryLimit = limit;
    return history;
  }

  @override
  Future<String> placeOrder(String token) async {
    cart = const CartResult(items: [], grandTotal: 0);
    return 'SHB-20261002-0001';
  }

  String? submittedKind;
  String? submittedComment;

  @override
  Future<MemberAssets> fetchAssets(String token) async {
    return const MemberAssets(xauGrams: 0, fundMyr: 0, tradingLimitMyr: 0);
  }

  @override
  Future<DepositInfo> fetchDepositInfo(String token) async => DepositInfo.fallback;

  @override
  Future<void> submitXauDeposit(String token) async {
    submittedKind = 'xau';
  }

  @override
  Future<void> submitFundDeposit(
    String token, {
    required List<int> bytes,
    required String filename,
    String comment = '',
    String? bankAccountId,
  }) async {
    submittedKind = 'fund';
    submittedComment = comment;
  }
}

Future<void> pumpScreen(WidgetTester tester, SessionController session, Widget page) async {
  final content = AppContentController(api: session.api);
  await content.load();
  await tester.pumpWidget(
    AppContentScope(
      controller: content,
      child: SessionScope(
        controller: session,
        child: MaterialApp(theme: buildAppTheme(), home: Scaffold(body: page)),
      ),
    ),
  );
}

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  testWidgets('rates board shows lock buttons and flashes a changed price', (tester) async {
    final api = FakeApi(
      rates: RatesResult(
        assigned: true,
        updatedAt: DateTime.utc(2026, 10, 2, 8),
        rows: [
          _row(key: 'physical-gold-myr-kg', label: 'Physical Gold 999 - MYR/KG', buy: 400, sell: 410),
          _row(key: 'physical-silver-myr-kg', label: 'Physical Silver 999 - MYR/KG', buy: 5, sell: 6),
          _row(key: 'myr-usdt', label: 'MYR/USDT', comingSoon: true, buy: 0, sell: 0),
        ],
      ),
    );
    await pumpScreen(
      tester,
      SessionController(api: api, signedIn: true, token: 'token-1', profile: _profile()),
      const RatesPage(visible: true),
    );
    await tester.pump();
    await tester.pump();

    expect(find.text('Physical Gold 999 - MYR/KG'), findsOneWidget);
    expect(find.text('LOCK BUY'), findsNWidgets(2));
    expect(find.text('LOCK SELL'), findsOneWidget);
    expect(find.text('Coming Soon'), findsOneWidget);
    expect(find.text('Super Heng BUY'), findsNWidgets(2));

    // Lock Sell sits under Super Heng BUY; Lock Buy under Super Heng SELL.
    final sellLeft = tester.getTopLeft(find.text('LOCK SELL'));
    final buyLeft = tester.getTopLeft(find.text('LOCK BUY').first);
    expect(sellLeft.dx < buyLeft.dx, isTrue);

    await tester.tap(find.text('LOCK SELL'));
    await tester.pump();
    await tester.pump();
    expect(api.addCalls, 1);
    expect(api.lastSide, 'sell');
    expect(api.lastPrice, 400);

    await tester.tap(find.text('LOCK BUY').first);
    await tester.pump();
    await tester.pump();
    expect(api.addCalls, 2);
    expect(api.lastSide, 'buy');
    expect(api.lastPrice, 410);
    expect(find.text('Added to cart'), findsOneWidget);

    await tester.pump(const Duration(seconds: 3));
    await tester.pump();
    expect(find.byKey(const Key('price-flash')), findsWidgets);
  });

  testWidgets('no rate book shows the contact message', (tester) async {
    final api = FakeApi(rates: const RatesResult(assigned: false, rows: [], updatedAt: null));
    await pumpScreen(
      tester,
      SessionController(api: api, signedIn: true, token: 'token-1'),
      const RatesPage(visible: true),
    );
    await tester.pump();
    await tester.pump();
    expect(find.text('Your rate book is not assigned yet. Please contact us.'), findsOneWidget);
    expect(find.text('LOCK BUY'), findsNothing);
  });

  testWidgets('login validates, hides the password, and stores a token', (tester) async {
    final api = FakeApi()..loginError = 'Invalid username or password.';
    final session = SessionController(api: api);
    await tester.pumpWidget(GoldInvestApp(session: session));
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('login-submit')));
    await tester.pump();
    expect(find.text('Required'), findsNWidgets(2));

    await tester.enterText(find.byKey(const Key('username')), 'ada');
    await tester.enterText(find.byKey(const Key('password')), 'secret');
    await tester.tap(find.byKey(const Key('toggle-password')));
    await tester.pump();
    final password = tester.widget<EditableText>(
      find.descendant(of: find.byKey(const Key('password')), matching: find.byType(EditableText)),
    );
    expect(password.obscureText, isFalse);

    await tester.tap(find.byKey(const Key('login-submit')));
    await tester.pump();
    await tester.pump();
    expect(find.text('Invalid username or password.'), findsOneWidget);

    api.loginError = null;
    await tester.tap(find.byKey(const Key('login-submit')));
    await tester.pumpAndSettle();
    expect(session.signedIn, isTrue);
    expect(session.token, 'token-1');
    expect(find.byKey(const Key('login-title')), findsNothing);
  });

  testWidgets('account saves a name, rejects a short password, and signs out', (tester) async {
    final api = FakeApi();
    final session = SessionController(api: api, signedIn: true, token: 'token-1', profile: _profile());
    await tester.binding.setSurfaceSize(const Size(800, 2000));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await pumpScreen(tester, session, const _SignedOutGate(child: AccountPage(visible: true)));
    await tester.pump();
    await tester.pump();

    expect(find.text('SHB0001'), findsWidgets);
    expect(find.text('60123456789'), findsOneWidget);
    expect(find.text('ada@example.com'), findsOneWidget);
    expect(find.byKey(const Key('account-full-name')), findsOneWidget);

    await tester.enterText(find.byKey(const Key('account-full-name')), 'Ada Renamed');
    await tester.tap(find.byKey(const Key('account-save')));
    await tester.pump();
    await tester.pump();
    expect(find.text('Ada Renamed'), findsWidgets);
    expect(find.text('Profile updated'), findsOneWidget);
    expect(api.profile.phone, '60123456789');

    await tester.enterText(find.byKey(const Key('account-password')), '12345');
    await tester.tap(find.byKey(const Key('account-save')));
    await tester.pump();
    expect(find.text('Password must be at least 6 characters.'), findsOneWidget);

    await tester.tap(find.byKey(const Key('account-sign-out')));
    await tester.pump();
    await tester.pump();
    expect(find.byKey(const Key('login-title')), findsOneWidget);
    expect(session.signedIn, isFalse);
  });

  testWidgets('cart updates quantity, removes a line, and places an order', (tester) async {
    final api = FakeApi()
      ..cart = const CartResult(
        items: [
          CartLine(id: 'c1', metal: 'XAU', side: 'buy', lockedPrice: 100, qtyKg: 1, lineTotal: 100),
        ],
        grandTotal: 100,
      );
    await pumpScreen(
      tester,
      SessionController(api: api, signedIn: true, token: 'token-1'),
      const _CartHost(),
    );
    await tester.pump();
    await tester.pump();

    expect(find.text('Buy · Physical Gold'), findsOneWidget);
    expect(find.text('RM 100 / kg'), findsOneWidget);
    expect(find.text('RM 100.00'), findsWidgets);

    await tester.tap(find.byKey(const Key('qty-plus-c1')));
    await tester.pump();
    expect(find.text('2'), findsWidgets);
    expect(find.text('RM 200.00'), findsWidgets);

    await tester.pump(const Duration(milliseconds: 400));
    await tester.pump();

    await tester.tap(find.byKey(const Key('remove-c1')));
    await tester.pump();
    await tester.pump();
    expect(find.text('Your cart is empty.'), findsOneWidget);
    expect(find.text('Place order'), findsNothing);

    api.cart = const CartResult(
      items: [
        CartLine(id: 'c1', metal: 'XAU', side: 'buy', lockedPrice: 100, qtyKg: 1, lineTotal: 100),
      ],
      grandTotal: 100,
    );
    await tester.tap(find.byKey(const Key('show-rates')));
    await tester.pump();
    await tester.tap(find.byKey(const Key('show-cart')));
    await tester.pump();
    await tester.pump();
    await tester.tap(find.widgetWithText(FilledButton, 'Place order'));
    await tester.pump();
    await tester.pump();
    expect(find.text('Order SHB-20261002-0001 placed'), findsOneWidget);
    expect(find.text('Place order'), findsNothing);
  });

  testWidgets('empty cart offers View rates', (tester) async {
    final api = FakeApi();
    await pumpScreen(
      tester,
      SessionController(api: api, signedIn: true, token: 'token-1'),
      const _CartHost(),
    );
    await tester.pump();
    await tester.pump();
    expect(find.text('Your cart is empty.'), findsOneWidget);
    expect(find.text('Place order'), findsNothing);
    await tester.tap(find.text('View rates'));
    await tester.pump();
    expect(find.text('Live rates'), findsOneWidget);
  });

  testWidgets('account opens purchase history with an order card', (tester) async {
    final api = FakeApi()
      ..history = OrdersPage(
        orders: [
          HistoryOrder(
            orderNo: 'SHB-20261002-0001',
            status: 'pending',
            totalAmount: 100,
            createdAt: DateTime.utc(2026, 10, 2, 8),
            items: const [
              HistoryItem(metal: 'XAU', side: 'buy', qtyKg: 1, lockedPrice: 100, lineTotal: 100),
            ],
          ),
        ],
        total: 1,
        page: 1,
        pageCount: 1,
        pageSize: 10,
      );
    await tester.binding.setSurfaceSize(const Size(800, 2000));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await pumpScreen(
      tester,
      SessionController(api: api, signedIn: true, token: 'token-1', profile: _profile()),
      const AccountPage(visible: true),
    );
    await tester.pump();
    await tester.pump();
    await tester.tap(find.byKey(const Key('open-history')));
    await tester.pump();
    await tester.pump();

    expect(find.text('Your MYR/KG orders and current status.'), findsOneWidget);
    expect(find.text('1 order'), findsOneWidget);
    expect(find.text('SHB-20261002-0001'), findsOneWidget);
    expect(find.text('Pending'), findsOneWidget);
    expect(find.text('Buy · Gold · 1 kg @ RM 100 / kg'), findsOneWidget);
    expect(find.text('RM 100.00'), findsWidgets);
  });

  testWidgets('history shows an empty list and pages through orders', (tester) async {
    final api = FakeApi();
    await tester.binding.setSurfaceSize(const Size(800, 2000));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await pumpScreen(
      tester,
      SessionController(api: api, signedIn: true, token: 'token-1', profile: _profile()),
      const AccountPage(visible: true),
    );
    await tester.pump();
    await tester.pump();
    await tester.tap(find.byKey(const Key('open-history')));
    await tester.pump();
    await tester.pump();
    expect(find.text('No orders yet.'), findsOneWidget);

    api.history = const OrdersPage(
      orders: [
        HistoryOrder(
          orderNo: 'SHB-20261002-0002',
          status: 'confirmed',
          totalAmount: 200,
          createdAt: null,
          items: [
            HistoryItem(metal: 'XAU', side: 'sell', qtyKg: 2, lockedPrice: 100, lineTotal: 200),
          ],
        ),
      ],
      total: 2,
      page: 1,
      pageCount: 2,
      pageSize: 10,
    );
    await tester.tap(find.byKey(const Key('history-limit-25')));
    await tester.pump();
    await tester.pump();
    expect(api.lastHistoryLimit, 25);
    expect(api.lastHistoryPage, 1);
    expect(find.text('SHB-20261002-0002'), findsOneWidget);
    expect(find.text('Confirmed'), findsOneWidget);

    api.history = const OrdersPage(
      orders: [
        HistoryOrder(
          orderNo: 'SHB-20261002-0001',
          status: 'completed',
          totalAmount: 50,
          createdAt: null,
          items: [
            HistoryItem(metal: 'XAG', side: 'buy', qtyKg: 1, lockedPrice: 50, lineTotal: 50),
          ],
        ),
      ],
      total: 2,
      page: 2,
      pageCount: 2,
      pageSize: 10,
    );
    await tester.tap(find.byKey(const Key('history-next')));
    await tester.pump();
    await tester.pump();
    expect(find.text('SHB-20261002-0001'), findsOneWidget);
    expect(find.text('Buy · Silver · 1 kg @ RM 50 / kg'), findsOneWidget);
    expect(find.text('Completed'), findsOneWidget);

    api.history = const OrdersPage(
      orders: [
        HistoryOrder(
          orderNo: 'SHB-20261002-0002',
          status: 'confirmed',
          totalAmount: 200,
          createdAt: null,
          items: [
            HistoryItem(metal: 'XAU', side: 'sell', qtyKg: 2, lockedPrice: 100, lineTotal: 200),
          ],
        ),
      ],
      total: 2,
      page: 1,
      pageCount: 2,
      pageSize: 10,
    );
    await tester.tap(find.byKey(const Key('history-previous')));
    await tester.pump();
    await tester.pump();
    expect(find.text('SHB-20261002-0002'), findsOneWidget);
  });

  test('company links open the dialer, mail, site, and maps', () {
    expect(companyTelUri('+603-60642777').toString(), 'tel:+60360642777');
    expect(companyMailUri('info@superhengbullion.com').toString(), 'mailto:info@superhengbullion.com');
    expect(companyWebUri(CompanyInfo.fallback.website).toString(), 'https://superhengbullion.com.my');
    expect(companyWebUri(CompanyInfo.fallback.aboutUrl).toString(), 'https://superhengbullion.com.my/about');
    expect(companyWebUri(CompanyInfo.fallback.termsUrl).toString(), 'https://superhengbullion.com.my/terms');
    final maps = companyMapsUri(CompanyInfo.fallback.address).toString();
    expect(maps.startsWith('geo:0,0?q='), isTrue);
    expect(maps, contains('Puchong'));
  });

  testWidgets('signed-out rates info opens company details', (tester) async {
    final api = FakeApi();
    await tester.binding.setSurfaceSize(const Size(800, 2000));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await pumpScreen(tester, SessionController(api: api), const RatesPage(visible: true));
    await tester.pump();
    await tester.tap(find.byKey(const Key('open-company')));
    await tester.pump();
    await tester.pump();
    await tester.pump();

    expect(find.byKey(const Key('company-logo')), findsOneWidget);
    expect(find.text('Super Heng Bullion Sdn Bhd'), findsOneWidget);
    expect(find.text('Version 1.0.0'), findsOneWidget);
    expect(find.text('+603-60642777'), findsOneWidget);
    expect(find.text('info@superhengbullion.com'), findsOneWidget);
    expect(find.text('superhengbullion.com.my'), findsOneWidget);
    expect(find.textContaining('Puchong'), findsOneWidget);
    expect(find.textContaining('9.00am'), findsOneWidget);
    expect(find.byKey(const Key('company-map')), findsOneWidget);
    expect(find.text('Open in Maps'), findsOneWidget);
    expect(find.text('About'), findsOneWidget);
    expect(find.text('Terms'), findsOneWidget);
  });

  testWidgets('account info row opens the company screen', (tester) async {
    final api = FakeApi();
    await tester.binding.setSurfaceSize(const Size(800, 2000));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await pumpScreen(
      tester,
      SessionController(api: api, signedIn: true, token: 'token-1', profile: _profile()),
      const AccountPage(visible: true),
    );
    await tester.pump();
    await tester.pump();
    await tester.tap(find.byKey(const Key('account-company')));
    await tester.pump();
    await tester.pump();
    expect(find.byKey(const Key('company-logo')), findsOneWidget);
    expect(find.text('Super Heng Bullion Sdn Bhd'), findsOneWidget);
  });

  testWidgets('company screen keeps office details when the request fails', (tester) async {
    final api = FakeApi()..companyFails = true;
    await tester.binding.setSurfaceSize(const Size(800, 2000));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await pumpScreen(tester, SessionController(api: api), const RatesPage(visible: true));
    await tester.pump();
    await tester.tap(find.byKey(const Key('open-company')));
    await tester.pump();
    await tester.pump();
    await tester.pump();
    expect(find.text('+603-60642777'), findsOneWidget);
    expect(find.textContaining('47100 Puchong'), findsOneWidget);
  });

  testWidgets('rates use saved labels and keep the defaults when the request fails', (tester) async {
    final api = FakeApi()
      ..appCopy = const AppCopy(
        logoUrl: '',
        ratesTitle: 'Board',
        infoLabel: 'ABOUT',
        buyLabel: 'We buy',
        sellLabel: 'We sell',
        lockBuyLabel: 'BUY NOW',
        lockSellLabel: 'SELL NOW',
        comingSoonLabel: 'Later',
      )
      ..rates = RatesResult(
        assigned: true,
        updatedAt: null,
        rows: [
          _row(key: 'physical-gold-myr-kg', label: 'Physical Gold 999 - MYR/KG', buy: 400, sell: 410),
          _row(key: 'myr-usdt', label: 'MYR/USDT', comingSoon: true, buy: 0, sell: 0),
        ],
      );
    await pumpScreen(
      tester,
      SessionController(api: api, signedIn: true, token: 'token-1', profile: _profile()),
      const RatesPage(visible: true),
    );
    await tester.pump();
    await tester.pump();
    expect(find.text('Board'), findsOneWidget);
    expect(find.text('ABOUT'), findsOneWidget);
    expect(find.text('We buy'), findsOneWidget);
    expect(find.text('We sell'), findsOneWidget);
    expect(find.text('BUY NOW'), findsOneWidget);
    expect(find.text('SELL NOW'), findsOneWidget);
    expect(find.text('Later'), findsOneWidget);
  });

  testWidgets('a failed app request keeps the default rates wording', (tester) async {
    final api = FakeApi()
      ..appFails = true
      ..rates = RatesResult(
        assigned: true,
        updatedAt: null,
        rows: [
          _row(key: 'physical-gold-myr-kg', label: 'Physical Gold 999 - MYR/KG', buy: 400, sell: 410),
        ],
      );
    await pumpScreen(
      tester,
      SessionController(api: api, signedIn: true, token: 'token-1', profile: _profile()),
      const RatesPage(visible: true),
    );
    await tester.pump();
    await tester.pump();
    expect(find.text('Live rates'), findsOneWidget);
    expect(find.text('LOCK BUY'), findsOneWidget);
  });

  test('a transfer screenshot must be a jpg or png under 5MB', () {
    expect(proofRejection(name: 'note.pdf', bytes: 10), 'Use a JPG or PNG file.');
    expect(proofRejection(name: 'shot.JPG', bytes: 10), isNull);
    expect(proofRejection(name: 'shot.png', bytes: 5 * 1024 * 1024 + 1), 'File must be under 5MB.');
  });

  testWidgets('assets opens deposit and submits physical gold', (tester) async {
    final api = FakeApi();
    await tester.binding.setSurfaceSize(const Size(800, 1600));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await pumpScreen(
      tester,
      SessionController(api: api, signedIn: true, token: 'token-1', profile: _profile()),
      const AssetsPage(visible: true),
    );
    await tester.pump();
    await tester.pump();
    expect(find.text('0.00 g'), findsOneWidget);
    expect(find.text('RM 0.00'), findsWidgets);

    await tester.tap(find.byKey(const Key('open-deposit')));
    await tester.pump();
    await tester.pump();
    expect(find.text('+6072870221'), findsOneWidget);
    expect(find.text('Physical Gold'), findsOneWidget);
    expect(find.textContaining('contact SuperHeng Gold'), findsOneWidget);

    await tester.tap(find.byKey(const Key('deposit-submit')));
    await tester.pump();
    await tester.pump();
    expect(api.submittedKind, 'xau');
    expect(find.text('Your deposit is waiting for review.'), findsWidgets);

    await tester.tap(find.byKey(const Key('deposit-tab-fund')));
    await tester.pump();
    expect(find.text('OCBC Bank Berhad'), findsWidgets);
    expect(find.text('Unselected'), findsWidgets);
    expect(find.text('* JPG, JPEG, and PNG files under 5MB.'), findsOneWidget);

    await tester.tap(find.byKey(const Key('deposit-submit')));
    await tester.pump();
    expect(find.text('Upload a screenshot of the transfer.'), findsOneWidget);
    expect(api.submittedKind, 'xau');
  });

  testWidgets('fund submit sends the screenshot and comment', (tester) async {
    final api = FakeApi();
    await tester.binding.setSurfaceSize(const Size(800, 1600));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await pumpScreen(
      tester,
      SessionController(api: api, signedIn: true, token: 'token-1', profile: _profile()),
      DepositPage(
        pickPhoto: () async => const DepositPhoto(name: 'shot.jpg', bytes: [1, 2, 3]),
      ),
    );
    await tester.pump();
    await tester.pump();
    await tester.tap(find.byKey(const Key('deposit-tab-fund')));
    await tester.pump();
    await tester.ensureVisible(find.byKey(const Key('upload-photo')).first);
    await tester.tap(find.byKey(const Key('upload-photo')).first);
    await tester.pump();
    await tester.ensureVisible(find.byKey(const Key('deposit-comment')));
    await tester.enterText(find.byKey(const Key('deposit-comment')), 'Paid today');
    await tester.tap(find.byKey(const Key('deposit-submit')));
    await tester.pump();
    await tester.pump();
    expect(api.submittedKind, 'fund');
    expect(api.submittedComment, 'Paid today');
    expect(find.text('Your deposit is waiting for review.'), findsWidgets);
  });

  testWidgets('launch splash shows the bundled coin, then the app', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(home: LaunchSplash(logoPath: null, child: Text('Ready'))),
    );
    expect(find.byKey(const Key('launch-logo')), findsOneWidget);
    await tester.pump(const Duration(milliseconds: 700));
    expect(find.text('Ready'), findsOneWidget);
  });

  test('a saved splash file is used on the next launch', () async {
    final file = File('${Directory.systemTemp.path}/gi-splash-logo.png');
    await file.writeAsBytes([1, 2, 3]);
    SharedPreferences.setMockInitialValues({splashLogoKey: file.path});
    expect(await cachedSplashLogo(), file.path);
    await file.delete();
  });
}

class _SignedOutGate extends StatelessWidget {
  const _SignedOutGate({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    if (!SessionScope.of(context).signedIn) return const LoginPage();
    return child;
  }
}

class _CartHost extends StatefulWidget {
  const _CartHost();

  @override
  State<_CartHost> createState() => _CartHostState();
}

class _CartHostState extends State<_CartHost> {
  bool cart = true;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            TextButton(
              key: const Key('show-rates'),
              onPressed: () => setState(() => cart = false),
              child: const Text('Rates'),
            ),
            TextButton(
              key: const Key('show-cart'),
              onPressed: () => setState(() => cart = true),
              child: const Text('Cart'),
            ),
          ],
        ),
        Expanded(
          child: cart
              ? CartPage(visible: true, onViewRates: () => setState(() => cart = false))
              : const RatesPage(visible: true),
        ),
      ],
    );
  }
}
