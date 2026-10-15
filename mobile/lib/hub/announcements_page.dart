import 'package:flutter/material.dart';
import 'package:super_heng_bullion/api/mobile_api.dart';
import 'package:super_heng_bullion/l10n/app_text.dart';
import 'package:super_heng_bullion/session.dart';
import 'package:super_heng_bullion/theme/app_theme.dart';
import 'package:super_heng_bullion/widgets/empty_state.dart';

class AnnouncementsPage extends StatefulWidget {
  const AnnouncementsPage({super.key});

  @override
  State<AnnouncementsPage> createState() => _AnnouncementsPageState();
}

class _AnnouncementsPageState extends State<AnnouncementsPage> {
  List<Announcement> _rows = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    final token = SessionScope.of(context).token;
    if (token == null) return;
    try {
      final feed = await SessionScope.of(context).api.fetchAnnouncements(token);
      if (mounted) {
        setState(() {
          _rows = feed.rows;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _open(Announcement row) async {
    final token = SessionScope.of(context).token;
    if (token != null && !row.read) {
      try {
        await SessionScope.of(context).api.markAnnouncementRead(token, row.id);
      } catch (_) {}
      if (!mounted) return;
      setState(() {
        _rows = [
          for (final item in _rows)
            if (item.id == row.id)
              Announcement(id: item.id, title: item.title, body: item.body, createdAt: item.createdAt, read: true)
            else
              item,
        ];
      });
    }
    if (!mounted) return;
    await Navigator.of(context).push(MaterialPageRoute<void>(
      builder: (_) => _AnnouncementDetail(title: row.title, body: row.body, createdAt: row.createdAt),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final t = AppText.of(context);
    final unread = _rows.where((row) => !row.read).toList();
    final read = _rows.where((row) => row.read).toList();
    return Scaffold(
      backgroundColor: AppColors.ink,
      appBar: AppBar(backgroundColor: AppColors.ink, foregroundColor: AppColors.ivory, title: Text(t.announcement)),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.gold))
          : _rows.isEmpty
              ? const EmptyState()
              : ListView(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                  children: [
                    if (unread.isNotEmpty) ...[
                      _GroupHeader(label: t.unread, count: unread.length, highlight: true),
                      for (final row in unread) _AnnouncementCard(row: row, onTap: () => _open(row)),
                    ],
                    if (read.isNotEmpty) ...[
                      if (unread.isNotEmpty) const SizedBox(height: 8),
                      _GroupHeader(label: t.read, count: read.length),
                      for (final row in read) _AnnouncementCard(row: row, onTap: () => _open(row)),
                    ],
                  ],
                ),
    );
  }
}

class _GroupHeader extends StatelessWidget {
  const _GroupHeader({required this.label, required this.count, this.highlight = false});

  final String label;
  final int count;
  final bool highlight;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(4, 12, 4, 10),
      child: Row(
        children: [
          Text(label, style: const TextStyle(color: AppColors.ivory, fontSize: 16, fontWeight: FontWeight.w700)),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: highlight ? AppColors.gold : AppColors.surface2,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              '$count',
              style: TextStyle(
                color: highlight ? Colors.black : AppColors.mist,
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _AnnouncementCard extends StatelessWidget {
  const _AnnouncementCard({required this.row, required this.onTap});

  final Announcement row;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final when = DateTime.tryParse(row.createdAt)?.toLocal();
    final stamp = when == null
        ? ''
        : '${when.day.toString().padLeft(2, '0')} ${_month(when.month)} ${when.year}';
    final preview = row.body.replaceAll(RegExp(r'\s+'), ' ').trim();
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border(
                left: BorderSide(color: row.read ? Colors.transparent : AppColors.gold, width: 3),
              ),
            ),
            padding: const EdgeInsets.fromLTRB(16, 14, 14, 14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Icon(
                    row.read ? Icons.drafts_outlined : Icons.mark_email_unread_outlined,
                    color: row.read ? AppColors.mist : AppColors.gold,
                    size: 22,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        row.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: row.read ? AppColors.mist : AppColors.ivory,
                          fontWeight: row.read ? FontWeight.w500 : FontWeight.w700,
                          fontSize: 16,
                        ),
                      ),
                      if (preview.isNotEmpty) ...[
                        const SizedBox(height: 6),
                        Text(
                          preview,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(color: AppColors.mist, fontSize: 13, height: 1.35),
                        ),
                      ],
                      const SizedBox(height: 8),
                      Text(stamp, style: const TextStyle(color: AppColors.mist, fontSize: 12)),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right, color: AppColors.mist),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _AnnouncementDetail extends StatelessWidget {
  const _AnnouncementDetail({required this.title, required this.body, required this.createdAt});

  final String title;
  final String body;
  final String createdAt;

  @override
  Widget build(BuildContext context) {
    final when = DateTime.tryParse(createdAt)?.toLocal();
    final stamp = when == null ? '' : '${when.day.toString().padLeft(2, '0')} ${_month(when.month)} ${when.year}';
    return Scaffold(
      backgroundColor: AppColors.ink,
      appBar: AppBar(backgroundColor: AppColors.ink, foregroundColor: AppColors.ivory, title: Text(AppText.of(context).announcement)),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
        children: [
          Text(title, style: const TextStyle(color: AppColors.ivory, fontSize: 22, fontWeight: FontWeight.w700, height: 1.3)),
          if (stamp.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(stamp, style: const TextStyle(color: AppColors.mist, fontSize: 13)),
          ],
          const SizedBox(height: 20),
          Text(body, style: const TextStyle(color: AppColors.ivory, fontSize: 16, height: 1.5)),
        ],
      ),
    );
  }
}

String _month(int month) {
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return names[month - 1];
}
