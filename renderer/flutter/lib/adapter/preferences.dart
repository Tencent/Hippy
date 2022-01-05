import 'package:shared_preferences/shared_preferences.dart';

class ShredPreferenceAdapter {
  Future<String> getStringValues(String key) async {
    var prefs = await SharedPreferences.getInstance();
    var stringValue = prefs.getString(key) ?? '';
    return stringValue;
  }

  Future<bool> getBoolValues(String key) async {
    var prefs = await SharedPreferences.getInstance();
    var boolValue = prefs.getBool(key) ?? false;
    return boolValue;
  }

  Future<int> getIntValues(String key) async {
    var prefs = await SharedPreferences.getInstance();
    var intValue = prefs.getInt(key) ?? 0;
    return intValue;
  }

  Future<double> getDoubleValues(String key) async {
    var prefs = await SharedPreferences.getInstance();
    var doubleValue = prefs.getDouble(key) ?? 0;
    return doubleValue;
  }

  Future<dynamic> setStringValues(String key, String value) async {
    var prefs = await SharedPreferences.getInstance();
    await prefs.setString(key, value);
  }

  Future<dynamic> setBoolValues(String key, bool value) async {
    var prefs = await SharedPreferences.getInstance();
    await prefs.setBool(key, value);
  }

  Future<dynamic> setIntValues(String key, int value) async {
    var prefs = await SharedPreferences.getInstance();
    await prefs.setInt(key, value);
  }

  Future<dynamic> setDoubleValues(String key, double value) async {
    var prefs = await SharedPreferences.getInstance();
    await prefs.setDouble(key, value);
  }
}
