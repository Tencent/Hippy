import 'dart:async';

import 'package:flutter/services.dart';

class TencentVoltronRender {
  static const MethodChannel _channel = MethodChannel('tencent_voltron_render');

  static Future<String?> get platformVersion async {
    final version = await _channel.invokeMethod('getPlatformVersion');
    return version;
  }
}
