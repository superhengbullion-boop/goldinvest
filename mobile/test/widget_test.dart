import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:super_heng_bullion/api/mobile_api.dart';
import 'package:super_heng_bullion/hub/hub_page.dart';
import 'package:super_heng_bullion/main.dart';
import 'package:super_heng_bullion/session.dart';
import 'package:super_heng_bullion/theme/app_theme.dart';

class _QuietApi extends MobileApi {
  @override
  Future<AppCopy> fetchApp() async => AppCopy.fallback;

  @override
  Future<MemberAssets> fetchAssets(String token) async {
    return const MemberAssets(xauGrams: 0, fundMyr: 0, tradingLimitMyr: 0);
  }

  @override
  Future<PriceChart> fetchPrices(
    String token, {
    String pair = 'xau_myr',
    String range = '1D',
    String side = 'buy',
    String frame = '1M',
  }) async {
    final usd = pair == 'xau_usd';
    return PriceChart(
      pair: pair,
      unit: usd ? 'USD/oz' : 'MYR/g',
      marketOpen: true,
      sell: usd ? '4132.60' : '538.476',
      buy: usd ? '4135.48' : '543.875',
      side: side,
      range: '1D',
      ranges: const ['1D'],
      points: [
        PricePoint(at: DateTime.utc(2026, 10, 15, 6), price: usd ? 4132.6 : 538.476),
        PricePoint(at: DateTime.utc(2026, 10, 15, 8), price: usd ? 4135.48 : 543.875),
      ],
    );
  }
}

void main() {
  testWidgets('signed-out launch shows only the login page', (tester) async {
    await tester.pumpWidget(const GoldInvestApp());

    expect(find.byKey(const Key('login-title')), findsOneWidget);
    expect(find.byKey(const Key('tab-assets')), findsNothing);
    expect(find.byKey(const Key('tab-trade')), findsNothing);
  });

  testWidgets('signed-in launch shows the five tabs', (tester) async {
    await tester.pumpWidget(
      GoldInvestApp(session: SessionController(api: _QuietApi(), signedIn: true, token: 'token-1')),
    );
    await tester.pump();

    expect(find.byKey(const Key('login-title')), findsNothing);
    expect(find.text('Trade Book', skipOffstage: true), findsOneWidget);
    expect(find.text('Price', skipOffstage: true), findsOneWidget);
    expect(find.text('Trade', skipOffstage: true), findsOneWidget);
    expect(find.text('Assets', skipOffstage: true), findsWidgets);
    expect(find.text('Hub', skipOffstage: true), findsOneWidget);
    expect(find.text('Coming Soon', skipOffstage: true), findsNothing);
    expect(find.text('0.00 g'), findsOneWidget);
  });

  testWidgets('price tab shows XAU pairs and only 1D', (tester) async {
    await tester.pumpWidget(
      GoldInvestApp(session: SessionController(api: _QuietApi(), signedIn: true, token: 'token-1')),
    );
    await tester.pump();
    await tester.tap(find.byKey(const Key('tab-price')));
    await tester.pump();
    await tester.pump();

    expect(find.text('XAU/MYR'), findsOneWidget);
    expect(find.text('XAU/USD'), findsOneWidget);
    expect(find.text('1D'), findsOneWidget);
    expect(find.text('5D'), findsNothing);
    expect(find.text('538.476'), findsOneWidget);
    expect(find.text('543.875'), findsOneWidget);

    await tester.tap(find.byKey(const Key('price-pair-usd')));
    await tester.pump();
    await tester.pump();
    expect(find.text('USD/oz'), findsOneWidget);
    expect(find.text('5D'), findsNothing);
  });

  testWidgets('hub copies the username', (tester) async {
    await tester.pumpWidget(
      SessionScope(
        controller: SessionController(
          signedIn: true,
          token: 'token-1',
          profile: const Profile(
            memberId: 'SHB0001',
            username: 'test123',
            fullName: 'Test User',
            phone: '1',
            email: 'test@gmail.com',
            rateBookAssigned: false,
          ),
        ),
        child: MaterialApp(theme: buildAppTheme(), home: const HubPage()),
      ),
    );

    String? copied;
    tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(SystemChannels.platform, (call) async {
      if (call.method == 'Clipboard.setData') {
        copied = (call.arguments as Map)['text'] as String?;
      }
      return null;
    });
    addTearDown(() {
      tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(SystemChannels.platform, null);
    });

    await tester.tap(find.byKey(const Key('hub-copy-username')));
    await tester.pump();
    await tester.pump();

    expect(copied, 'test123');
    expect(find.text('Copied'), findsOneWidget);
  });

  testWidgets('theme is ink and the primary button is gold', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: buildAppTheme(),
        home: Scaffold(
          body: FilledButton(onPressed: () {}, child: const Text('Sign in')),
        ),
      ),
    );

    final context = tester.element(find.byType(FilledButton));
    expect(Theme.of(context).scaffoldBackgroundColor, AppColors.ink);

    final material = tester.widget<Material>(
      find.descendant(of: find.byType(FilledButton), matching: find.byType(Material)).first,
    );
    expect(material.color, AppColors.gold);
    expect(tester.getSize(find.byType(FilledButton)).height, 52);
  });
}
