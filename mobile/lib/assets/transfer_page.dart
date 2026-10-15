import 'package:flutter/material.dart';
import 'package:super_heng_bullion/api/mobile_api.dart';
import 'package:super_heng_bullion/l10n/app_text.dart';
import 'package:super_heng_bullion/session.dart';
import 'package:super_heng_bullion/theme/app_theme.dart';

class TransferPage extends StatefulWidget {
  const TransferPage({super.key, required this.xauGrams});

  final double xauGrams;

  @override
  State<TransferPage> createState() => _TransferPageState();
}

class _TransferPageState extends State<TransferPage> {
  final _username = TextEditingController();
  final _grams = TextEditingController(text: '0.00');
  String? _error;
  bool _pending = false;

  @override
  void dispose() {
    _username.dispose();
    _grams.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final token = SessionScope.of(context).token;
    if (token == null) return;
    setState(() {
      _pending = true;
      _error = null;
    });
    try {
      await SessionScope.of(context).api.submitTransfer(
        token,
        username: _username.text.trim(),
        grams: double.tryParse(_grams.text.trim()) ?? 0,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppText.of(context).transferWaiting)));
    } on ApiException catch (err) {
      if (mounted) setState(() => _error = err.message);
    } finally {
      if (mounted) setState(() => _pending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppText.of(context);
    return Scaffold(
      backgroundColor: AppColors.ink,
      appBar: AppBar(backgroundColor: AppColors.ink, foregroundColor: AppColors.ivory, title: Text(t.goldTransfer)),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text(t.recipientUser),
          TextField(controller: _username, decoration: InputDecoration(labelText: t.username)),
          const SizedBox(height: 16),
          TextField(
            controller: _grams,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: InputDecoration(labelText: t.transferQuantity),
          ),
          const SizedBox(height: 8),
          Text(t.goldBalance(widget.xauGrams.toStringAsFixed(2)), style: const TextStyle(color: AppColors.mist)),
          const SizedBox(height: 16),
          Text(t.transferNotes),
          if (_error != null) Padding(padding: const EdgeInsets.only(top: 12), child: Text(t.message(_error!), style: const TextStyle(color: AppColors.danger))),
        ],
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(20),
        child: FilledButton(onPressed: _pending ? null : _submit, child: Text(t.submit)),
      ),
    );
  }
}
