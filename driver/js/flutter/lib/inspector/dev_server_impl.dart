import 'package:voltron_renderer/common/error.dart';
import 'package:voltron_renderer/widget/root.dart';

import '../engine.dart';
import '../inspector.dart';

class DevServerImpl implements DevServerInterface {
  late DevServerHelper _devServerHelper;
  late DevServerConfig _devServerConfig;

  DevServerImpl(
    GlobalConfigs configs,
    String serverHost,
    String bundleName,
  ) {
    _devServerHelper = DevServerHelper(configs, serverHost);
    _devServerConfig = DevServerConfig(serverHost);
  }

  @override
  String createResourceUrl(String resName) {
    return _devServerHelper.createBundleURL(
      _devServerConfig.getServerHost(),
      resName,
      false,
      false,
      false,
    );
  }

  @override
  void handleException(JsError error) {
    // TODO: implement handleException
  }

  @override
  void attachToHost(RootWidgetViewModel viewModel) {
    // TODO: implement attachToHost
  }

  @override
  void detachFromHost(RootWidgetViewModel viewModel) {
    // TODO: implement detachFromHost
  }
}
