import 'package:plugin_platform_interface/plugin_platform_interface.dart';

import 'voltron_vfs_method_channel.dart';

abstract class VoltronVfsPlatform extends PlatformInterface {
  /// Constructs a VoltronVfsPlatform.
  VoltronVfsPlatform() : super(token: _token);

  static final Object _token = Object();

  static VoltronVfsPlatform _instance = MethodChannelVoltronVfs();

  /// The default instance of [VoltronVfsPlatform] to use.
  ///
  /// Defaults to [MethodChannelVoltronVfs].
  static VoltronVfsPlatform get instance => _instance;
  
  /// Platform-specific implementations should set this with their own
  /// platform-specific class that extends [VoltronVfsPlatform] when
  /// they register themselves.
  static set instance(VoltronVfsPlatform instance) {
    PlatformInterface.verifyToken(instance, _token);
    _instance = instance;
  }

  Future<String?> getPlatformVersion() {
    throw UnimplementedError('platformVersion() has not been implemented.');
  }
}
