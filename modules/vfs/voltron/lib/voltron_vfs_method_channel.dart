import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

import 'voltron_vfs_platform_interface.dart';

/// An implementation of [VoltronVfsPlatform] that uses method channels.
class MethodChannelVoltronVfs extends VoltronVfsPlatform {
  /// The method channel used to interact with the native platform.
  @visibleForTesting
  final methodChannel = const MethodChannel('voltron_vfs');

  @override
  Future<String?> getPlatformVersion() async {
    final version = await methodChannel.invokeMethod<String>('getPlatformVersion');
    return version;
  }
}
