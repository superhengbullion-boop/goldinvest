import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class AppColors {
  static const ink = Color(0xFF0A0A0A);
  static const surface = Color(0xFF141414);
  static const surface2 = Color(0xFF1C1C1C);
  static const gold = Color(0xFFEDBE01);
  static const goldDark = Color(0xFFB89400);
  static const ivory = Color(0xFFF7F4EC);
  static const mist = Color(0xFFB0B0B0);
  static const danger = Color(0xFFF87171);
}

const appOverlay = SystemUiOverlayStyle(
  statusBarColor: AppColors.ink,
  statusBarIconBrightness: Brightness.light,
  statusBarBrightness: Brightness.dark,
  systemNavigationBarColor: AppColors.ink,
  systemNavigationBarIconBrightness: Brightness.light,
);

ThemeData buildAppTheme() {
  const text = TextTheme(
    headlineLarge: TextStyle(
      color: AppColors.ivory,
      fontSize: 32,
      fontWeight: FontWeight.w600,
      height: 1.15,
    ),
    titleMedium: TextStyle(
      color: AppColors.ivory,
      fontSize: 16,
      fontWeight: FontWeight.w600,
    ),
    bodyMedium: TextStyle(color: AppColors.ivory, fontSize: 16, height: 1.4),
    bodySmall: TextStyle(color: AppColors.mist, fontSize: 13, height: 1.4),
    labelSmall: TextStyle(
      color: AppColors.gold,
      fontSize: 12,
      fontWeight: FontWeight.w600,
      letterSpacing: 2.4,
    ),
  );

  return ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: AppColors.ink,
    canvasColor: AppColors.ink,
    colorScheme: const ColorScheme.dark(
      surface: AppColors.ink,
      primary: AppColors.gold,
      onPrimary: Colors.black,
      secondary: AppColors.gold,
      onSurface: AppColors.ivory,
      error: AppColors.danger,
    ),
    textTheme: text,
    splashFactory: NoSplash.splashFactory,
    snackBarTheme: const SnackBarThemeData(
      backgroundColor: AppColors.gold,
      behavior: SnackBarBehavior.floating,
      contentTextStyle: TextStyle(color: Colors.black, fontWeight: FontWeight.w600),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: AppColors.gold,
        foregroundColor: Colors.black,
        disabledBackgroundColor: AppColors.goldDark,
        disabledForegroundColor: Colors.black,
        minimumSize: const Size.fromHeight(52),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.surface2,
      labelStyle: const TextStyle(color: AppColors.mist),
      hintStyle: const TextStyle(color: AppColors.mist),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0x4DEDBE01)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0x4DEDBE01)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.gold, width: 1.4),
      ),
    ),
  );
}
