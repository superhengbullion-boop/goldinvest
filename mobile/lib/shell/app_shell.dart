import 'package:flutter/material.dart';
import 'package:gold_invest/account/account_page.dart';
import 'package:gold_invest/auth/login_page.dart';
import 'package:gold_invest/cart/cart_page.dart';
import 'package:gold_invest/rates/rates_page.dart';
import 'package:gold_invest/session.dart';
import 'package:gold_invest/theme/app_theme.dart';

class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _index = 0;
  SessionController? _session;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final session = SessionScope.of(context);
    if (identical(_session, session)) return;
    _session?.removeListener(_onSession);
    _session = session;
    session.addListener(_onSession);
  }

  @override
  void dispose() {
    _session?.removeListener(_onSession);
    super.dispose();
  }

  void _onSession() {
    if (!mounted || _session == null) return;
    if (!_session!.signedIn && _index != 0) {
      setState(() => _index = 0);
    }
    if (_session!.takeLoginRequest()) {
      Navigator.of(context).push(
        MaterialPageRoute<void>(builder: (_) => const LoginPage()),
      );
    }
  }

  Future<void> _select(int index) async {
    final session = SessionScope.of(context);
    if (!session.signedIn && index != 0) {
      await Navigator.of(context).push(
        MaterialPageRoute<void>(builder: (_) => const LoginPage()),
      );
      return;
    }
    setState(() => _index = index);
  }

  @override
  Widget build(BuildContext context) {
    final session = SessionScope.of(context);

    return Scaffold(
      backgroundColor: AppColors.ink,
      body: IndexedStack(
        index: _index,
        children: [
          RatesPage(visible: _index == 0),
          CartPage(visible: _index == 1, onViewRates: () => setState(() => _index = 0)),
          AccountPage(visible: _index == 2),
        ],
      ),
      bottomNavigationBar: _TabBar(
        index: _index,
        cartCount: session.cartCount,
        onSelect: _select,
      ),
    );
  }
}

class _TabBar extends StatelessWidget {
  const _TabBar({
    required this.index,
    required this.cartCount,
    required this.onSelect,
  });

  final int index;
  final int cartCount;
  final ValueChanged<int> onSelect;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(top: BorderSide(color: Color(0x14FFFFFF))),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 64,
          child: Row(
            children: [
              _Tab(
                tabKey: const Key('tab-rates'),
                label: 'Rates',
                icon: Icons.trending_up,
                selected: index == 0,
                onTap: () => onSelect(0),
              ),
              _Tab(
                tabKey: const Key('tab-cart'),
                label: 'Cart',
                icon: Icons.shopping_bag_outlined,
                selected: index == 1,
                count: cartCount,
                onTap: () => onSelect(1),
              ),
              _Tab(
                tabKey: const Key('tab-account'),
                label: 'Account',
                icon: Icons.person_outline,
                selected: index == 2,
                onTap: () => onSelect(2),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Tab extends StatelessWidget {
  const _Tab({
    required this.tabKey,
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
    this.count = 0,
  });

  final Key tabKey;
  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;
  final int count;

  @override
  Widget build(BuildContext context) {
    final color = selected ? AppColors.gold : AppColors.mist;
    return Expanded(
      child: InkWell(
        key: tabKey,
        onTap: onTap,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Icon(icon, color: color, size: 24),
                if (count > 0)
                  Positioned(
                    right: -10,
                    top: -6,
                    child: Container(
                      key: const Key('cart-badge'),
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                      decoration: BoxDecoration(
                        color: AppColors.gold,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
                      child: Text(
                        '$count',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: Colors.black,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          height: 1.2,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: color,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
