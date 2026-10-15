import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:super_heng_bullion/api/mobile_api.dart';
import 'package:super_heng_bullion/assets/bank_sheet.dart';
import 'package:super_heng_bullion/company/company_page.dart';
import 'package:super_heng_bullion/l10n/app_text.dart';
import 'package:super_heng_bullion/session.dart';
import 'package:super_heng_bullion/theme/app_theme.dart';
import 'package:url_launcher/url_launcher.dart';

class DepositPhoto {
  const DepositPhoto({required this.name, required this.bytes});

  final String name;
  final List<int> bytes;
}

/// Returns an error when the transfer screenshot is the wrong type or too large.
String? proofRejection({required String name, required int bytes}) {
  final lower = name.toLowerCase();
  final ok = lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png');
  if (!ok) return 'Use a JPG or PNG file.';
  if (bytes <= 0) return 'Please choose a file.';
  if (bytes > 5 * 1024 * 1024) return 'File must be under 5MB.';
  return null;
}

class DepositPage extends StatefulWidget {
  const DepositPage({super.key, this.pickPhoto});

  final Future<DepositPhoto?> Function()? pickPhoto;

  @override
  State<DepositPage> createState() => _DepositPageState();
}

class _DepositPageState extends State<DepositPage> {
  final _comment = TextEditingController();
  DepositInfo? _info;
  String? _error;
  String? _photoError;
  DepositPhoto? _photo;
  BankAccount? _bankAccount;
  bool _fund = false;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _load();
    });
  }

  @override
  void dispose() {
    _comment.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final token = SessionScope.of(context).token;
    if (token == null) return;
    try {
      final info = await SessionScope.of(context).api.fetchDepositInfo(token);
      if (!mounted) return;
      setState(() {
        _info = info;
        _error = null;
      });
    } on ApiException catch (err) {
      if (!mounted) return;
      setState(() => _error = err.message);
    } catch (_) {
      if (!mounted) return;
      setState(() => _error = 'Cannot reach the server.');
    }
  }

  Future<void> _copy(String value) async {
    await Clipboard.setData(ClipboardData(text: value));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppText.of(context).copied)));
  }

  Future<void> _call(String phone) async {
    final uri = companyTelUri(phone);
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  Future<void> _pickPhoto() async {
    final picked = widget.pickPhoto == null ? await _pickFromGallery() : await widget.pickPhoto!();
    if (!mounted || picked == null) return;
    final rejection = proofRejection(name: picked.name, bytes: picked.bytes.length);
    setState(() {
      if (rejection != null) {
        _photo = null;
        _photoError = rejection;
      } else {
        _photo = picked;
        _photoError = null;
      }
    });
  }

  Future<DepositPhoto?> _pickFromGallery() async {
    final file = await ImagePicker().pickImage(source: ImageSource.gallery);
    if (file == null) return null;
    final bytes = await file.readAsBytes();
    return DepositPhoto(name: file.name, bytes: bytes);
  }

  Future<void> _bankAccounts() async {
    final picked = await showBankAccountSheet(context);
    if (picked != null && mounted) setState(() => _bankAccount = picked);
  }

  Future<void> _submit() async {
    final session = SessionScope.of(context);
    final token = session.token;
    final info = _info;
    if (token == null || info == null || _submitting) return;
    if (_fund) {
      final photo = _photo;
      if (photo == null) {
        setState(() => _photoError = 'Upload a screenshot of the transfer.');
        return;
      }
      final rejection = proofRejection(name: photo.name, bytes: photo.bytes.length);
      if (rejection != null) {
        setState(() => _photoError = rejection);
        return;
      }
    }

    setState(() => _submitting = true);
    try {
      if (_fund) {
        await session.api.submitFundDeposit(
          token,
          bytes: _photo!.bytes,
          filename: _photo!.name,
          comment: _comment.text.trim(),
          bankAccountId: _bankAccount?.id,
        );
      } else {
        await session.api.submitXauDeposit(token);
      }
      if (!mounted) return;
      setState(() {
        _photo = null;
        _photoError = null;
        _bankAccount = null;
        _comment.clear();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(AppText.of(context).depositWaiting)),
      );
    } on ApiException catch (err) {
      if (!mounted) return;
      setState(() => _error = err.message);
    } catch (_) {
      if (!mounted) return;
      setState(() => _error = 'Cannot reach the server.');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final info = _info;
    final t = AppText.of(context);
    return Scaffold(
      backgroundColor: AppColors.ink,
      body: SafeArea(
        child: Column(
          children: [
            SizedBox(
              height: 52,
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => Navigator.of(context).maybePop(),
                    icon: const Icon(Icons.chevron_left, color: AppColors.ivory, size: 28),
                  ),
                  Expanded(
                    child: Text(
                      t.deposit,
                      textAlign: TextAlign.center,
                      style: TextStyle(color: AppColors.ivory, fontSize: 20, fontWeight: FontWeight.w700),
                    ),
                  ),
                  const SizedBox(width: 48),
                ],
              ),
            ),
            _Tabs(
              fund: _fund,
              onXau: () => setState(() => _fund = false),
              fundLabel: t.fund,
              onFund: () => setState(() => _fund = true),
            ),
            Expanded(
              child: info == null
                  ? Center(
                      child: _error == null
                          ? const CircularProgressIndicator(color: AppColors.gold)
                          : Text(t.message(_error!), style: const TextStyle(color: AppColors.danger)),
                    )
                  : ListView(
                      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                      children: [
                        if (_error != null) ...[
                          Text(t.message(_error!), style: const TextStyle(color: AppColors.danger)),
                          const SizedBox(height: 12),
                        ],
                        Text(t.message(info.infoHeading), style: const TextStyle(color: AppColors.mist, fontSize: 13)),
                        const SizedBox(height: 8),
                        if (!_fund) ...[
                          _PhoneCard(phone: info.supportPhone, onCall: () => _call(info.supportPhone)),
                          const SizedBox(height: 20),
                          _SectionLabel(t.myInformation),
                          _MethodCard(label: t.depositMethod, method: t.physicalGold),
                          const SizedBox(height: 20),
                          _SectionLabel(t.depositInstructions),
                          _Instructions(steps: info.xauInstructions.map(t.message).toList()),
                        ] else ...[
                          _CopyCard(
                            value: info.accountHolderName,
                            label: t.accountHolderName,
                            onCopy: () => _copy(info.accountHolderName),
                          ),
                          _CopyCard(
                            value: info.bankName,
                            label: t.bankName,
                            onCopy: () => _copy(info.bankName),
                            divider: true,
                          ),
                          _CopyCard(
                            value: info.bankAccount,
                            label: t.bankAccount,
                            onCopy: () => _copy(info.bankAccount),
                            divider: true,
                            bottom: true,
                          ),
                          const SizedBox(height: 12),
                          _PhoneCard(phone: info.supportPhone, onCall: () => _call(info.supportPhone)),
                          const SizedBox(height: 20),
                          _SectionLabel(t.depositInstructions),
                          _Instructions(steps: info.fundInstructions.map(t.message).toList()),
                          const SizedBox(height: 20),
                          _SectionLabel(t.myInformation),
                          _FundForm(
                            photoName: _photo?.name,
                            photoError: _photoError,
                            methodLabel: t.depositMethod,
                            methodValue: t.bankTransfer,
                            bankLabelText: t.bankAccount,
                            unselected: t.unselected,
                            uploadLabel: t.uploadScreenshot,
                            uploadPhoto: t.uploadPhoto,
                            commentLabel: t.comment,
                            fileHint: t.jpgHint,
                            bankLabel: _bankAccount?.accountNo ?? '',
                            comment: _comment,
                            onBankAccount: _bankAccounts,
                            onUpload: _pickPhoto,
                          ),
                        ],
                      ],
                    ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
              child: FilledButton(
                key: const Key('deposit-submit'),
                onPressed: info == null || _submitting ? null : _submit,
                child: Text(_submitting ? t.submitting : t.submit),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Tabs extends StatelessWidget {
  const _Tabs({required this.fund, required this.fundLabel, required this.onXau, required this.onFund});

  final bool fund;
  final String fundLabel;
  final VoidCallback onXau;
  final VoidCallback onFund;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _TabButton(tabKey: const Key('deposit-tab-xau'), label: 'XAU', selected: !fund, onTap: onXau),
        _TabButton(tabKey: const Key('deposit-tab-fund'), label: fundLabel, selected: fund, onTap: onFund),
      ],
    );
  }
}

class _TabButton extends StatelessWidget {
  const _TabButton({
    required this.tabKey,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final Key tabKey;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        key: tabKey,
        onTap: onTap,
        child: Column(
          children: [
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                color: selected ? AppColors.gold : AppColors.mist,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 10),
            Container(height: 2, color: selected ? AppColors.gold : Colors.transparent),
          ],
        ),
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.label);

  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(label, style: const TextStyle(color: AppColors.mist, fontSize: 13)),
    );
  }
}

class _CopyCard extends StatelessWidget {
  const _CopyCard({
    required this.value,
    required this.label,
    required this.onCopy,
    this.divider = false,
    this.bottom = false,
  });

  final String value;
  final String label;
  final VoidCallback onCopy;
  final bool divider;
  final bool bottom;

  @override
  Widget build(BuildContext context) {
    final radius = BorderRadius.vertical(
      top: divider ? Radius.zero : const Radius.circular(16),
      bottom: bottom ? const Radius.circular(16) : Radius.zero,
    );
    return Container(
      decoration: BoxDecoration(color: AppColors.surface, borderRadius: radius),
      child: Column(
        children: [
          if (divider) const Divider(height: 1, color: Color(0x14FFFFFF)),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(value, style: const TextStyle(color: AppColors.ivory, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 4),
                      Text(label, style: const TextStyle(color: AppColors.mist, fontSize: 13)),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: onCopy,
                  icon: const Icon(Icons.copy_outlined, color: AppColors.mist, size: 20),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PhoneCard extends StatelessWidget {
  const _PhoneCard({required this.phone, required this.onCall});

  final String phone;
  final VoidCallback onCall;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(16)),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(phone, style: const TextStyle(color: AppColors.ivory, fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Text(AppText.of(context).customerSupport, style: const TextStyle(color: AppColors.mist, fontSize: 13)),
              ],
            ),
          ),
          IconButton(
            key: const Key('deposit-call'),
            onPressed: onCall,
            icon: const Icon(Icons.phone_outlined, color: AppColors.mist),
          ),
        ],
      ),
    );
  }
}

class _MethodCard extends StatelessWidget {
  const _MethodCard({required this.label, required this.method});

  final String label;
  final String method;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
      decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(16)),
      child: Row(
        children: [
          Expanded(child: Text(label, style: const TextStyle(color: AppColors.mist))),
          Text(method, style: const TextStyle(color: AppColors.ivory, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

class _Instructions extends StatelessWidget {
  const _Instructions({required this.steps});

  final List<String> steps;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (var i = 0; i < steps.length; i++)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Text(
              '${i + 1}. ${steps[i]}',
              style: const TextStyle(color: AppColors.ivory, height: 1.4),
            ),
          ),
      ],
    );
  }
}

class _FundForm extends StatelessWidget {
  const _FundForm({
    required this.photoName,
    required this.photoError,
    required this.bankLabel,
    required this.comment,
    required this.onBankAccount,
    required this.onUpload,
    required this.methodLabel,
    required this.methodValue,
    required this.bankLabelText,
    required this.unselected,
    required this.uploadLabel,
    required this.uploadPhoto,
    required this.commentLabel,
    required this.fileHint,
  });

  final String? photoName;
  final String? photoError;
  final String bankLabel;
  final TextEditingController comment;
  final VoidCallback onBankAccount;
  final VoidCallback onUpload;
  final String methodLabel;
  final String methodValue;
  final String bankLabelText;
  final String unselected;
  final String uploadLabel;
  final String uploadPhoto;
  final String commentLabel;
  final String fileHint;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
      decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(16)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _FormRow(label: methodLabel, value: methodValue),
          const Divider(height: 1, color: Color(0x14FFFFFF)),
          InkWell(
            key: const Key('member-bank-account'),
            onTap: onBankAccount,
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 16),
              child: Row(
                children: [
                  Expanded(child: Text(bankLabelText, style: const TextStyle(color: AppColors.mist))),
                  Text(bankLabel.isEmpty ? unselected : bankLabel, style: const TextStyle(color: AppColors.ivory)),
                  const Icon(Icons.chevron_right, color: AppColors.mist),
                ],
              ),
            ),
          ),
          const Divider(height: 1, color: Color(0x14FFFFFF)),
          const SizedBox(height: 16),
          Text(uploadLabel, style: const TextStyle(color: AppColors.mist)),
          const SizedBox(height: 10),
          FilledButton.icon(
            key: const Key('upload-photo'),
            onPressed: onUpload,
            icon: const Icon(Icons.photo_camera_outlined),
            label: Text(photoName ?? uploadPhoto),
          ),
          const SizedBox(height: 8),
          Text(
            photoError == null ? fileHint : AppText.of(context).message(photoError!),
            style: TextStyle(color: photoError == null ? AppColors.mist : AppColors.danger, fontSize: 12),
          ),
          const SizedBox(height: 16),
          const Divider(height: 1, color: Color(0x14FFFFFF)),
          const SizedBox(height: 16),
          Text(commentLabel, style: const TextStyle(color: AppColors.mist)),
          TextField(
            key: const Key('deposit-comment'),
            controller: comment,
            style: const TextStyle(color: AppColors.ivory),
            decoration: const InputDecoration(
              filled: false,
              border: UnderlineInputBorder(borderSide: BorderSide(color: Color(0x33FFFFFF))),
              enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0x33FFFFFF))),
            ),
          ),
        ],
      ),
    );
  }
}

class _FormRow extends StatelessWidget {
  const _FormRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Row(
        children: [
          Expanded(child: Text(label, style: const TextStyle(color: AppColors.mist))),
          Text(value, style: const TextStyle(color: AppColors.ivory, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
