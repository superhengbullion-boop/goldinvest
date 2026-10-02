import 'dart:convert';

import 'package:http/http.dart' as http;

class ApiException implements Exception {
  ApiException(this.status, this.message);
  final int status;
  final String message;

  @override
  String toString() => message;
}

class Profile {
  const Profile({
    required this.memberId,
    required this.username,
    required this.fullName,
    required this.phone,
    required this.email,
    required this.rateBookAssigned,
  });

  final String memberId;
  final String username;
  final String fullName;
  final String phone;
  final String email;
  final bool rateBookAssigned;

  factory Profile.fromJson(Map<String, dynamic> json) {
    return Profile(
      memberId: '${json['memberId'] ?? ''}',
      username: '${json['username'] ?? ''}',
      fullName: '${json['fullName'] ?? ''}',
      phone: '${json['phone'] ?? ''}',
      email: '${json['email'] ?? ''}',
      rateBookAssigned: json['rateBookAssigned'] == true,
    );
  }
}

class LoginResult {
  const LoginResult({required this.token, required this.profile});
  final String token;
  final Profile profile;
}

class RateRow {
  const RateRow({
    required this.key,
    required this.label,
    required this.buy,
    required this.sell,
    required this.digits,
    required this.comingSoon,
  });

  final String key;
  final String label;
  final double buy;
  final double sell;
  final int digits;
  final bool comingSoon;

  factory RateRow.fromJson(Map<String, dynamic> json) {
    return RateRow(
      key: '${json['key'] ?? ''}',
      label: '${json['label'] ?? ''}',
      buy: _num(json['buy']),
      sell: _num(json['sell']),
      digits: (json['digits'] as num?)?.toInt() ?? 2,
      comingSoon: json['comingSoon'] == true,
    );
  }
}

class RatesResult {
  const RatesResult({
    required this.assigned,
    required this.rows,
    required this.updatedAt,
    this.error,
  });

  final bool assigned;
  final List<RateRow> rows;
  final DateTime? updatedAt;
  final String? error;
}

class CartLine {
  const CartLine({
    required this.id,
    required this.metal,
    required this.side,
    required this.lockedPrice,
    required this.qtyKg,
    required this.lineTotal,
  });

  final String id;
  final String metal;
  final String side;
  final double lockedPrice;
  final double qtyKg;
  final double lineTotal;

  factory CartLine.fromJson(Map<String, dynamic> json) {
    return CartLine(
      id: '${json['id'] ?? ''}',
      metal: '${json['metal'] ?? ''}',
      side: '${json['side'] ?? ''}',
      lockedPrice: _num(json['lockedPrice']),
      qtyKg: _num(json['qtyKg']),
      lineTotal: _num(json['lineTotal']),
    );
  }
}

class HistoryItem {
  const HistoryItem({
    required this.metal,
    required this.side,
    required this.qtyKg,
    required this.lockedPrice,
    required this.lineTotal,
  });

  final String metal;
  final String side;
  final double qtyKg;
  final double lockedPrice;
  final double lineTotal;

  factory HistoryItem.fromJson(Map<String, dynamic> json) {
    return HistoryItem(
      metal: '${json['metal'] ?? ''}',
      side: '${json['side'] ?? ''}',
      qtyKg: _num(json['qtyKg']),
      lockedPrice: _num(json['lockedPrice']),
      lineTotal: _num(json['lineTotal']),
    );
  }
}

class HistoryOrder {
  const HistoryOrder({
    required this.orderNo,
    required this.status,
    required this.totalAmount,
    required this.createdAt,
    required this.items,
  });

  final String orderNo;
  final String status;
  final double totalAmount;
  final DateTime? createdAt;
  final List<HistoryItem> items;

  factory HistoryOrder.fromJson(Map<String, dynamic> json) {
    final raw = json['items'];
    final stamp = json['createdAt'];
    return HistoryOrder(
      orderNo: '${json['orderNo'] ?? ''}',
      status: '${json['status'] ?? ''}',
      totalAmount: _num(json['totalAmount']),
      createdAt: stamp is String ? DateTime.tryParse(stamp) : null,
      items: raw is List
          ? raw.map((item) => HistoryItem.fromJson(Map<String, dynamic>.from(item as Map))).toList()
          : const [],
    );
  }
}

class OrdersPage {
  const OrdersPage({
    required this.orders,
    required this.total,
    required this.page,
    required this.pageCount,
    required this.pageSize,
  });

  final List<HistoryOrder> orders;
  final int total;
  final int page;
  final int pageCount;
  final int pageSize;

  factory OrdersPage.fromJson(Map<String, dynamic> json) {
    final raw = json['orders'];
    return OrdersPage(
      orders: raw is List
          ? raw.map((order) => HistoryOrder.fromJson(Map<String, dynamic>.from(order as Map))).toList()
          : const [],
      total: (json['total'] as num?)?.toInt() ?? 0,
      page: (json['page'] as num?)?.toInt() ?? 1,
      pageCount: (json['pageCount'] as num?)?.toInt() ?? 1,
      pageSize: (json['pageSize'] as num?)?.toInt() ?? 10,
    );
  }
}

class AppCopy {
  const AppCopy({
    required this.logoUrl,
    required this.ratesTitle,
    required this.infoLabel,
    required this.buyLabel,
    required this.sellLabel,
    required this.lockBuyLabel,
    required this.lockSellLabel,
    required this.comingSoonLabel,
  });

  final String logoUrl;
  final String ratesTitle;
  final String infoLabel;
  final String buyLabel;
  final String sellLabel;
  final String lockBuyLabel;
  final String lockSellLabel;
  final String comingSoonLabel;

  static const fallback = AppCopy(
    logoUrl: '',
    ratesTitle: 'Live rates',
    infoLabel: 'INFO',
    buyLabel: 'Super Heng BUY',
    sellLabel: 'Super Heng SELL',
    lockBuyLabel: 'LOCK BUY',
    lockSellLabel: 'LOCK SELL',
    comingSoonLabel: 'Coming Soon',
  );

  factory AppCopy.fromJson(Map<String, dynamic> json) {
    String pick(String key, String fallbackValue) {
      final value = json[key];
      final text = value is String ? value.trim() : '';
      return text.isEmpty ? fallbackValue : text;
    }

    final logo = json['logoUrl'];
    return AppCopy(
      logoUrl: logo is String ? logo.trim() : '',
      ratesTitle: pick('ratesTitle', fallback.ratesTitle),
      infoLabel: pick('infoLabel', fallback.infoLabel),
      buyLabel: pick('buyLabel', fallback.buyLabel),
      sellLabel: pick('sellLabel', fallback.sellLabel),
      lockBuyLabel: pick('lockBuyLabel', fallback.lockBuyLabel),
      lockSellLabel: pick('lockSellLabel', fallback.lockSellLabel),
      comingSoonLabel: pick('comingSoonLabel', fallback.comingSoonLabel),
    );
  }
}

class CompanyOffice {
  const CompanyOffice({required this.name, required this.address, required this.mapEmbedUrl});

  final String name;
  final String address;
  final String mapEmbedUrl;

  factory CompanyOffice.fromJson(Map<String, dynamic> json) {
    return CompanyOffice(
      name: json['name'] is String && (json['name'] as String).trim().isNotEmpty ? (json['name'] as String).trim() : 'Office',
      address: json['address'] is String ? (json['address'] as String).trim() : '',
      mapEmbedUrl: json['mapEmbedUrl'] is String ? (json['mapEmbedUrl'] as String).trim() : '',
    );
  }
}

class CompanyInfo {
  const CompanyInfo({
    required this.companyName,
    required this.tel,
    required this.email,
    required this.website,
    required this.aboutUrl,
    required this.termsUrl,
    required this.address,
    required this.hours,
    required this.mapEmbedUrl,
    required this.offices,
  });

  final String companyName;
  final String tel;
  final String email;
  final String website;
  final String aboutUrl;
  final String termsUrl;
  final String address;
  final String hours;
  final String mapEmbedUrl;
  final List<CompanyOffice> offices;

  static const fallback = CompanyInfo(
    companyName: 'Super Heng Bullion Sdn Bhd',
    tel: '+603-60642777',
    email: 'info@superhengbullion.com',
    website: 'https://superhengbullion.com.my',
    aboutUrl: 'https://superhengbullion.com.my/about',
    termsUrl: 'https://superhengbullion.com.my/terms',
    address: 'No 7, Jalan PPU 2A,\nTaman Perindustrian Puchong Utama,\n47100 Puchong, Selangor.',
    hours: 'Office Operating Hours: 9.00am - 6.00pm (Monday - Friday)',
    mapEmbedUrl:
        'https://maps.google.com/maps?q=No%207%2C%20Jalan%20PPU%202A%2C%20Taman%20Perindustrian%20Puchong%20Utama%2C%2047100%20Puchong%2C%20Selangor&hl=en&z=16&output=embed',
    offices: [
      CompanyOffice(
        name: 'Headquarters',
        address: 'No 7, Jalan PPU 2A,\nTaman Perindustrian Puchong Utama,\n47100 Puchong, Selangor.',
        mapEmbedUrl:
            'https://maps.google.com/maps?q=No%207%2C%20Jalan%20PPU%202A%2C%20Taman%20Perindustrian%20Puchong%20Utama%2C%2047100%20Puchong%2C%20Selangor&hl=en&z=16&output=embed',
      ),
    ],
  );

  factory CompanyInfo.fromJson(Map<String, dynamic> json) {
    String pick(String key, String fallbackValue) {
      final value = json[key];
      final text = value is String ? value.trim() : '';
      return text.isEmpty ? fallbackValue : text;
    }

    final address = pick('address', fallback.address);
    final mapEmbedUrl = pick('mapEmbedUrl', fallback.mapEmbedUrl);
    final rawOffices = json['offices'];
    final offices = rawOffices is List
        ? rawOffices
            .whereType<Map>()
            .map((office) => CompanyOffice.fromJson(Map<String, dynamic>.from(office)))
            .where((office) => office.address.isNotEmpty)
            .toList()
        : <CompanyOffice>[];

    return CompanyInfo(
      companyName: pick('companyName', fallback.companyName),
      tel: pick('tel', fallback.tel),
      email: pick('email', fallback.email),
      website: pick('website', fallback.website),
      aboutUrl: pick('aboutUrl', fallback.aboutUrl),
      termsUrl: pick('termsUrl', fallback.termsUrl),
      address: address,
      hours: pick('hours', fallback.hours),
      mapEmbedUrl: mapEmbedUrl,
      offices: offices.isEmpty
          ? [CompanyOffice(name: 'Office', address: address, mapEmbedUrl: mapEmbedUrl)]
          : offices,
    );
  }
}

class CartResult {
  const CartResult({required this.items, required this.grandTotal});
  final List<CartLine> items;
  final double grandTotal;

  factory CartResult.fromJson(Map<String, dynamic> json) {
    final raw = json['items'];
    final items = raw is List
        ? raw.map((item) => CartLine.fromJson(Map<String, dynamic>.from(item as Map))).toList()
        : <CartLine>[];
    return CartResult(items: items, grandTotal: _num(json['grandTotal']));
  }
}

double _num(Object? value) {
  if (value is num) return value.toDouble();
  return double.tryParse('$value') ?? 0;
}

/// Talks to the gold-invest mobile API.
/// The Android emulator reaches the host machine at 10.0.2.2.
class MobileApi {
  MobileApi({http.Client? client, this.baseUrl = 'http://10.0.2.2:3000'}) : _client = client ?? http.Client();

  final http.Client _client;
  final String baseUrl;

  Future<LoginResult> login(String username, String password) async {
    final json = await _send('POST', '/api/mobile/login', body: {
      'username': username,
      'password': password,
    });
    final member = json['member'];
    return LoginResult(
      token: '${json['token'] ?? ''}',
      profile: Profile.fromJson(Map<String, dynamic>.from(member as Map)),
    );
  }

  Future<Profile> fetchProfile(String token) async {
    final json = await _send('GET', '/api/mobile/me', token: token);
    return Profile.fromJson(json);
  }

  Future<Profile> updateProfile(
    String token, {
    required String username,
    required String fullName,
    String password = '',
    String confirmPassword = '',
  }) async {
    final json = await _send('PATCH', '/api/mobile/me', token: token, body: {
      'username': username,
      'fullName': fullName,
      'password': password,
      'confirmPassword': confirmPassword,
    });
    return Profile.fromJson(json);
  }

  Future<RatesResult> fetchRates(String token) async {
    final json = await _send('GET', '/api/mobile/rates', token: token);
    final board = json['board'];
    final boardMap = board is Map ? Map<String, dynamic>.from(board) : <String, dynamic>{};
    final rawRows = boardMap['rows'];
    final rows = rawRows is List
        ? rawRows.map((row) => RateRow.fromJson(Map<String, dynamic>.from(row as Map))).toList()
        : <RateRow>[];
    final stamp = boardMap['updatedAt'];
    return RatesResult(
      assigned: json['assigned'] == true,
      rows: rows,
      updatedAt: stamp is String ? DateTime.tryParse(stamp) : null,
      error: json['error'] is String ? json['error'] as String : null,
    );
  }

  Future<AppCopy> fetchApp() async {
    final json = await _send('GET', '/api/mobile/app');
    return AppCopy.fromJson(json);
  }

  Future<CompanyInfo> fetchCompany() async {
    final json = await _send('GET', '/api/mobile/company');
    return CompanyInfo.fromJson(json);
  }

  Future<OrdersPage> fetchOrders(String token, {int page = 1, int limit = 10}) async {
    final json = await _send('GET', '/api/mobile/orders?page=$page&limit=$limit', token: token);
    return OrdersPage.fromJson(json);
  }

  Future<CartResult> fetchCart(String token) async {
    final json = await _send('GET', '/api/mobile/cart', token: token);
    return CartResult.fromJson(json);
  }

  Future<CartResult> addToCart(
    String token, {
    required String metal,
    required String side,
    required double lockedPrice,
    double qtyKg = 1,
  }) async {
    final json = await _send('POST', '/api/mobile/cart', token: token, body: {
      'metal': metal,
      'side': side,
      'lockedPrice': lockedPrice,
      'qtyKg': qtyKg,
    });
    return CartResult.fromJson(json);
  }

  Future<CartResult> updateQty(String token, String id, double qtyKg) async {
    final json = await _send('PATCH', '/api/mobile/cart/$id', token: token, body: {'qtyKg': qtyKg});
    return CartResult.fromJson(json);
  }

  Future<CartResult> removeItem(String token, String id) async {
    final json = await _send('DELETE', '/api/mobile/cart/$id', token: token);
    return CartResult.fromJson(json);
  }

  Future<String> placeOrder(String token) async {
    final json = await _send('POST', '/api/mobile/cart/place', token: token);
    return '${json['orderNo'] ?? ''}';
  }

  Future<Map<String, dynamic>> _send(
    String method,
    String path, {
    String? token,
    Map<String, dynamic>? body,
  }) async {
    final headers = <String, String>{'Accept': 'application/json'};
    if (token != null) headers['Authorization'] = 'Bearer $token';
    if (body != null) headers['Content-Type'] = 'application/json';
    late http.Response response;
    try {
      final uri = Uri.parse('$baseUrl$path');
      response = await switch (method) {
        'POST' => _client.post(uri, headers: headers, body: body == null ? null : jsonEncode(body)),
        'PATCH' => _client.patch(uri, headers: headers, body: body == null ? null : jsonEncode(body)),
        'DELETE' => _client.delete(uri, headers: headers),
        _ => _client.get(uri, headers: headers),
      };
    } catch (_) {
      throw ApiException(0, 'Cannot reach the server.');
    }
    Map<String, dynamic> json = {};
    if (response.body.isNotEmpty) {
      final decoded = jsonDecode(response.body);
      if (decoded is Map) json = Map<String, dynamic>.from(decoded);
    }
    if (response.statusCode >= 400) {
      throw ApiException(response.statusCode, '${json['error'] ?? 'Request failed.'}');
    }
    return json;
  }
}
