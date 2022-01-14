import 'package:flutter/widgets.dart';

import 'method_channel.dart';

/// 平台相关能力的管理
class PlatformManager {
  String _os = "unknown";
  int _apiLevel = 0;
  int _densityApi = 160;
  bool _hasInit = false;
  String _osVersion = "1.0";
  String _codeName = "";
  String _model = "";
  String _deviceId = "";
  String _language = "en";
  String _country = "";

  static final PlatformManager _singleton = PlatformManager();

  static PlatformManager getInstance() {
    return _singleton;
  }

  Future<dynamic> initPlatform() async {
    WidgetsFlutterBinding.ensureInitialized();
    if (!_hasInit) {
      final resultMap = await FlutterRenderMethodChannel.platformInfo;
      if (resultMap != null) {
        _os = resultMap["os"] ?? "unknown";
        _densityApi = resultMap["densityApi"] ?? 160;
        _apiLevel = resultMap["apiLevel"] ?? 0;
        _hasInit = true;
        _osVersion = resultMap["osVersion"] ?? "1.0";
        _codeName = resultMap["codeName"] ?? "";
        _model = resultMap["model"] ?? "";
        _deviceId = resultMap["deviceId"] ?? "";
        _language = resultMap["language"] ?? "en";
        _country = resultMap["country"] ?? "";
      } else {
        _os = "unknown";
        _apiLevel = 0;
        _densityApi = 160;
      }
    }
  }

  String get os => _os;
  int get apiLevel => _apiLevel;
  int get densityApi => _densityApi;
  String get osVersion => _osVersion;
  String get codeName => _codeName;
  String get model => _model;
  String get deviceId => _deviceId;
  String get language => _language;
  String get country => _country;
  bool get isAndroid => _os == 'android';
  bool get isIOS => _os == 'ios';
}
