import 'package:voltron_renderer/common/error.dart';
import 'package:voltron_renderer/widget/root.dart';

import '../engine.dart';
import '../inspector.dart';

class DevServerImplDisable implements DevServerInterface {
  late DevServerHelper _devServerHelper;

  DevServerImplDisable(
    GlobalConfigs configs,
    String serverHost,
  ) {
    _devServerHelper = DevServerHelper(configs, serverHost);
  }

  @override
  String createResourceUrl(String resName) {
    return '';
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
