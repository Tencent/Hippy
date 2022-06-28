import 'package:voltron_renderer/common/error.dart';
import 'package:voltron_renderer/widget/root.dart';

import '../engine.dart';
import '../inspector.dart';

class DevServerImplDisable implements DevServerInterface {
  late DevServerHelper _devServerHelper;
  late DevServerConfig _devServerConfig;

  DevServerImplDisable(
    GlobalConfigs configs,
    String serverHost,
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
  void handleException(JsError error) {}

  @override
  void attachToHost(RootWidgetViewModel viewModel) {}

  @override
  void detachFromHost(RootWidgetViewModel viewModel) {}

  @override
  void setDevServerCallback(DevServerCallback devServerCallback) {}

  @override
  void reload() {}
}
