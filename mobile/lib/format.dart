const _months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

String formatPrice(num value, int digits) {
  if (!value.isFinite || value == 0) return 'N/A';
  final negative = value < 0;
  final fixed = value.abs().toStringAsFixed(digits);
  final parts = fixed.split('.');
  final whole = parts[0].replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (match) => '${match[1]},');
  final text = digits == 0 ? whole : '$whole.${parts[1]}';
  return negative ? '-$text' : text;
}

/// Stamp in Asia/Kuala_Lumpur, which stays at UTC+8.
String formatRateStamp(DateTime value) {
  final local = value.toUtc().add(const Duration(hours: 8));
  final hour24 = local.hour;
  final hour = hour24 % 12 == 0 ? 12 : hour24 % 12;
  final ampm = hour24 >= 12 ? 'pm' : 'am';
  final hh = hour.toString().padLeft(2, '0');
  final mm = local.minute.toString().padLeft(2, '0');
  final ss = local.second.toString().padLeft(2, '0');
  return '${local.day} ${_months[local.month - 1]} ${local.year} $hh:$mm:$ss $ampm GMT+08:00';
}

String formatQty(double qty) {
  if (qty == qty.roundToDouble()) return qty.toStringAsFixed(0);
  var text = qty.toStringAsFixed(3);
  text = text.replaceFirst(RegExp(r'0+$'), '').replaceFirst(RegExp(r'\.$'), '');
  return text;
}

String metalName(String metal) {
  if (metal == 'XAU') return 'Physical Gold';
  if (metal == 'XAG') return 'Physical Silver';
  return metal;
}

String sideName(String side) => side == 'sell' ? 'Sell' : 'Buy';

double lineTotalMyr(double lockedPrice, double qtyKg) {
  return (lockedPrice * qtyKg * 100).round() / 100;
}
