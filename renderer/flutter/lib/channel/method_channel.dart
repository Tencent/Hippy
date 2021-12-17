import 'package:flutter/services.dart';

class FlutterRenderMethodChannel {
  static const MethodChannel _channel = MethodChannel('flutter_render');

  static Future<dynamic> get platformInfo async {
    return await _channel.invokeMethod('getPlatformInfo');
  }

  static Future<dynamic> get localeInfo async {
    return await _channel.invokeMethod('getLocaleInfo');
  }
}
