import 'package:flutter/services.dart';

class FlutterRenderMethodChannel {
  static const MethodChannel _kChannel = MethodChannel('flutter_render');

  static Future<dynamic> get platformInfo async {
    return await _kChannel.invokeMethod('getPlatformInfo');
  }

  static Future<dynamic> get localeInfo async {
    return await _kChannel.invokeMethod('getLocaleInfo');
  }
}
