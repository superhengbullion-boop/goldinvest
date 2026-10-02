import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

const splashLogoKey = 'splash_logo';

Future<String?> cachedSplashLogo() async {
  try {
    final prefs = await SharedPreferences.getInstance();
    final path = prefs.getString(splashLogoKey);
    if (path == null || path.isEmpty) return null;
    if (!File(path).existsSync()) return null;
    return path;
  } catch (_) {
    return null;
  }
}

Future<void> cacheSplashLogo(String url) async {
  try {
    final prefs = await SharedPreferences.getInstance();
    final previous = prefs.getString(splashLogoKey);
    if (url.isEmpty) {
      if (previous != null && File(previous).existsSync()) {
        await File(previous).delete();
      }
      await prefs.remove(splashLogoKey);
      return;
    }
    final response = await http.get(Uri.parse(url));
    if (response.statusCode >= 400 || response.bodyBytes.isEmpty) return;
    final dir = await getApplicationDocumentsDirectory();
    final file = File('${dir.path}/splash_logo');
    await file.writeAsBytes(response.bodyBytes, flush: true);
    await prefs.setString(splashLogoKey, file.path);
  } catch (_) {}
}
