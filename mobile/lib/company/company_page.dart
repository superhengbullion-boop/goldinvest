import 'package:flutter/material.dart';
import 'package:gold_invest/api/mobile_api.dart';
import 'package:gold_invest/app_content.dart';
import 'package:gold_invest/session.dart';
import 'package:gold_invest/theme/app_theme.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';

class CompanyPage extends StatefulWidget {
  const CompanyPage({super.key});

  @override
  State<CompanyPage> createState() => _CompanyPageState();
}

class _CompanyPageState extends State<CompanyPage> {
  CompanyInfo _info = CompanyInfo.fallback;
  String _version = '1.0.0';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadCompany();
      _loadVersion();
    });
  }

  Future<void> _loadCompany() async {
    try {
      final info = await SessionScope.of(context).api.fetchCompany();
      if (!mounted) return;
      setState(() => _info = info);
    } catch (_) {
      if (!mounted) return;
      setState(() => _info = CompanyInfo.fallback);
    }
  }

  Future<void> _loadVersion() async {
    try {
      final info = await PackageInfo.fromPlatform();
      if (!mounted) return;
      setState(() => _version = info.version);
    } catch (_) {
      if (!mounted) return;
      setState(() => _version = '1.0.0');
    }
  }

  Future<void> _open(Uri uri, {Uri? fallback}) async {
    try {
      final opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!opened && fallback != null) {
        await launchUrl(fallback, mode: LaunchMode.externalApplication);
      }
    } catch (_) {
      if (fallback == null) return;
      try {
        await launchUrl(fallback, mode: LaunchMode.externalApplication);
      } catch (_) {}
    }
  }

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final info = _info;
    final logoUrl = AppContentScope.of(context).copy.logoUrl;
    final site = Uri.tryParse(info.website)?.host ?? info.website;

    return Scaffold(
      backgroundColor: AppColors.ink,
      appBar: AppBar(
        backgroundColor: AppColors.ink,
        foregroundColor: AppColors.ivory,
        elevation: 0,
        title: const Text('Info'),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
        children: [
          Center(child: _CompanyLogo(url: logoUrl)),
          const SizedBox(height: 18),
          Text(
            info.companyName,
            key: const Key('company-name'),
            textAlign: TextAlign.center,
            style: text.headlineLarge?.copyWith(fontSize: 26),
          ),
          const SizedBox(height: 6),
          Text('Version $_version', key: const Key('company-version'), textAlign: TextAlign.center, style: text.bodySmall),
          const SizedBox(height: 28),
          Text('CONTACT', style: text.labelSmall),
          const SizedBox(height: 10),
          _Card(
            children: [
              _LinkRow(
                rowKey: const Key('company-phone'),
                icon: Icons.phone_outlined,
                label: info.tel,
                onTap: () => _open(companyTelUri(info.tel)),
              ),
              _LinkRow(
                rowKey: const Key('company-email'),
                icon: Icons.mail_outline,
                label: info.email,
                onTap: () => _open(companyMailUri(info.email)),
              ),
              _LinkRow(
                rowKey: const Key('company-website'),
                icon: Icons.language,
                label: site,
                onTap: () => _open(companyWebUri(info.website)),
              ),
              if (info.hours.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.fromLTRB(4, 8, 4, 4),
                  child: Text(info.hours, key: const Key('company-hours'), style: text.bodySmall),
                ),
            ],
          ),
          const SizedBox(height: 22),
          Text(info.offices.length == 1 ? 'OFFICE' : 'OFFICES', style: text.labelSmall),
          for (var i = 0; i < info.offices.length; i++) ...[
            const SizedBox(height: 10),
            _OfficeCard(
              office: info.offices[i],
              first: i == 0,
              onOpenMaps: () => _open(
                companyMapsUri(info.offices[i].address),
                fallback: companyMapsWebUri(info.offices[i].address),
              ),
            ),
          ],
          const SizedBox(height: 22),
          Text('COMPANY', style: text.labelSmall),
          const SizedBox(height: 10),
          _Card(
            children: [
              _LinkRow(
                rowKey: const Key('company-about'),
                icon: Icons.menu_book_outlined,
                label: 'About',
                onTap: () => _open(companyWebUri(info.aboutUrl)),
              ),
              _LinkRow(
                rowKey: const Key('company-terms'),
                icon: Icons.description_outlined,
                label: 'Terms',
                onTap: () => _open(companyWebUri(info.termsUrl)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _CompanyLogo extends StatelessWidget {
  const _CompanyLogo({required this.url});

  final String url;

  @override
  Widget build(BuildContext context) {
    if (url.isEmpty) {
      return Image.asset('assets/logo.png', key: const Key('company-logo'), width: 132, height: 132);
    }
    return Image.network(
      url,
      key: const Key('company-logo'),
      width: 132,
      height: 132,
      errorBuilder: (_, __, ___) => Image.asset('assets/logo.png', width: 132, height: 132),
    );
  }
}

class _OfficeCard extends StatelessWidget {
  const _OfficeCard({required this.office, required this.first, required this.onOpenMaps});

  final CompanyOffice office;
  final bool first;
  final VoidCallback onOpenMaps;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return _Card(
      children: [
        Text(office.name, style: text.titleMedium),
        const SizedBox(height: 8),
        Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Text(
            office.address,
            key: first ? const Key('company-address') : null,
            style: text.bodyMedium,
          ),
        ),
        _OfficeMap(url: office.mapEmbedUrl, primary: first),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          key: first ? const Key('company-open-maps') : null,
          onPressed: onOpenMaps,
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.gold,
            side: const BorderSide(color: AppColors.gold),
            minimumSize: const Size.fromHeight(48),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
          icon: const Icon(Icons.map_outlined),
          label: const Text('Open in Maps', style: TextStyle(fontWeight: FontWeight.w700)),
        ),
      ],
    );
  }
}

class _OfficeMap extends StatefulWidget {
  const _OfficeMap({required this.url, required this.primary});

  final String url;
  final bool primary;

  @override
  State<_OfficeMap> createState() => _OfficeMapState();
}

class _OfficeMapState extends State<_OfficeMap> {
  WebViewController? _controller;

  @override
  void initState() {
    super.initState();
    if (WebViewPlatform.instance == null || widget.url.isEmpty) return;
    final src = widget.url.replaceAll('"', '&quot;');
    final html = '''
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  html, body { margin: 0; height: 100%; background: #141414; }
  iframe { border: 0; width: 100%; height: 100%; }
</style>
</head>
<body><iframe src="$src" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></body>
</html>
''';
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(AppColors.surface)
      ..loadHtmlString(html, baseUrl: 'https://superhengbullion.com.my/');
  }

  @override
  Widget build(BuildContext context) {
    final controller = _controller;
    return ClipRRect(
      key: widget.primary ? const Key('company-map') : null,
      borderRadius: BorderRadius.circular(16),
      child: SizedBox(
        height: 200,
        width: double.infinity,
        child: controller == null
            ? const ColoredBox(
                color: AppColors.surface2,
                child: Icon(Icons.place, color: AppColors.gold, size: 36),
              )
            : WebViewWidget(controller: controller),
      ),
    );
  }
}

class _Card extends StatelessWidget {
  const _Card({required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: children),
    );
  }
}

class _LinkRow extends StatelessWidget {
  const _LinkRow({
    required this.rowKey,
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final Key rowKey;
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      key: rowKey,
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
        child: Row(
          children: [
            Icon(icon, color: AppColors.gold, size: 20),
            const SizedBox(width: 12),
            Expanded(child: Text(label, style: const TextStyle(color: AppColors.ivory))),
            const Icon(Icons.chevron_right, color: AppColors.mist, size: 20),
          ],
        ),
      ),
    );
  }
}

Uri companyTelUri(String tel) => Uri.parse('tel:${tel.replaceAll(RegExp(r'[^\d+]'), '')}');

Uri companyMailUri(String email) => Uri.parse('mailto:$email');

Uri companyWebUri(String url) => Uri.parse(url);

Uri companyMapsUri(String address) {
  final query = address.replaceAll('\n', ', ');
  return Uri.parse('geo:0,0?q=${Uri.encodeComponent(query)}');
}

Uri companyMapsWebUri(String address) {
  final query = address.replaceAll('\n', ', ');
  return Uri.parse('https://www.google.com/maps/search/?api=1&query=${Uri.encodeComponent(query)}');
}
