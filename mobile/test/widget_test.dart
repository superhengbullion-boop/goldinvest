import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:gold_invest/main.dart';
import 'package:gold_invest/session.dart';
import 'package:gold_invest/theme/app_theme.dart';

void main() {
  testWidgets('signed-out Cart and Account open login', (tester) async {
    await tester.pumpWidget(const GoldInvestApp());

    expect(find.text('Live rates'), findsOneWidget);
    expect(tester.widget<Icon>(find.byIcon(Icons.trending_up)).color, AppColors.gold);

    await tester.tap(find.byKey(const Key('tab-cart')));
    await tester.pumpAndSettle();

    expect(find.byKey(const Key('login-title')), findsOneWidget);
    final login = find.ancestor(of: find.byKey(const Key('login-title')), matching: find.byType(Scaffold));
    expect(
      find.descendant(of: login, matching: find.byKey(const Key('tab-rates'))),
      findsNothing,
    );
  });

  testWidgets('signed-out Account opens login', (tester) async {
    await tester.pumpWidget(const GoldInvestApp());
    await tester.tap(find.byKey(const Key('tab-account')));
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('login-title')), findsOneWidget);
  });

  testWidgets('cart count shows on the Cart tab', (tester) async {
    await tester.pumpWidget(
      GoldInvestApp(session: SessionController(signedIn: true, cartCount: 2)),
    );

    expect(find.byKey(const Key('cart-badge')), findsOneWidget);
    expect(find.text('2'), findsOneWidget);

    await tester.tap(find.byKey(const Key('tab-cart')));
    await tester.pumpAndSettle();
    expect(find.text('Cart'), findsWidgets);
    expect(find.text('Sign in'), findsNothing);
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
