import 'package:flutter/material.dart';
import 'package:super_heng_bullion/assets/assets_page.dart';
import 'package:super_heng_bullion/hub/hub_page.dart';
import 'package:super_heng_bullion/price/price_page.dart';
import 'package:super_heng_bullion/l10n/app_text.dart';
import 'package:super_heng_bullion/theme/app_theme.dart';
import 'package:super_heng_bullion/widgets/gold_bars_icon.dart';

class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _index = 3;

  @override
  Widget build(BuildContext context) {
    final t = AppText.of(context);
    return Scaffold(
      backgroundColor: AppColors.ink,
      body: IndexedStack(
        index: _index,
        children: [
          _SoonPage(title: t.tradeBook),
          PricePage(visible: _index == 1),
          _SoonPage(title: t.trade),
          AssetsPage(visible: _index == 3),
          const HubPage(),
        ],
      ),
      bottomNavigationBar: _TabBar(
        index: _index,
        onSelect: (index) => setState(() => _index = index),
      ),
    );
  }
}

class _SoonPage extends StatelessWidget {
  const _SoonPage({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final soon = AppText.of(context).comingSoon;
    return SafeArea(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
            child: Text(
              title,
              textAlign: TextAlign.center,
              style: text.titleMedium?.copyWith(fontSize: 20),
            ),
          ),
          Expanded(
            child: Center(child: Text(soon, style: text.bodySmall)),
          ),
        ],
      ),
    );
  }
}

class _TabBar extends StatelessWidget {
  const _TabBar({required this.index, required this.onSelect});

  final int index;
  final ValueChanged<int> onSelect;

  @override
  Widget build(BuildContext context) {
    final t = AppText.of(context);
    return DecoratedBox(
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(top: BorderSide(color: Color(0x14FFFFFF))),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 76,
          child: Row(
            children: [
              _Tab(
                tabKey: const Key('tab-trade-book'),
                label: t.tradeBook,
                icon: Icons.receipt_long_outlined,
                selected: index == 0,
                onTap: () => onSelect(0),
              ),
              _Tab(
                tabKey: const Key('tab-price'),
                label: t.price,
                icon: Icons.show_chart,
                selected: index == 1,
                onTap: () => onSelect(1),
              ),
              _TradeTab(label: t.trade, selected: index == 2, onTap: () => onSelect(2)),
              _Tab(
                tabKey: const Key('tab-assets'),
                label: t.assets,
                iconBuilder: (color) => GoldBarsIcon(color: color, size: 24),
                selected: index == 3,
                onTap: () => onSelect(3),
              ),
              _Tab(
                tabKey: const Key('tab-hub'),
                label: t.hub,
                icon: Icons.person_outline,
                selected: index == 4,
                onTap: () => onSelect(4),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TradeTab extends StatelessWidget {
  const _TradeTab({required this.label, required this.selected, required this.onTap});

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = selected ? Colors.black : AppColors.gold;
    return Expanded(
      child: InkWell(
        key: const Key('tab-trade'),
        onTap: onTap,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            Transform.translate(
              offset: const Offset(0, -10),
              child: Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: selected ? AppColors.gold : AppColors.surface2,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.gold, width: 1.4),
                ),
                child: Icon(Icons.swap_horiz, color: color, size: 26),
              ),
            ),
            FittedBox(
              fit: BoxFit.scaleDown,
              child: Text(
                label,
                style: TextStyle(
                  color: selected ? AppColors.gold : AppColors.mist,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            const SizedBox(height: 6),
          ],
        ),
      ),
    );
  }
}

class _Tab extends StatelessWidget {
  const _Tab({
    required this.tabKey,
    required this.label,
    required this.selected,
    required this.onTap,
    this.icon,
    this.iconBuilder,
  });

  final Key tabKey;
  final String label;
  final IconData? icon;
  final Widget Function(Color color)? iconBuilder;
  final bool selected;
  final VoidCallback onTap;

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
            iconBuilder?.call(color) ?? Icon(icon!, color: color, size: 24),
            const SizedBox(height: 4),
            FittedBox(
              fit: BoxFit.scaleDown,
              child: Text(
                label,
                style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
