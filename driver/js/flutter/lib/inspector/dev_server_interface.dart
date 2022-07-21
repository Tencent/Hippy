import 'package:voltron_renderer/voltron_renderer.dart';

import '../inspector.dart';

abstract class DevServerInterface {
  void reload();

  String createResourceUrl(String resName);

  void setDevServerCallback(DevServerCallback devServerCallback);

  void attachToHost(RootWidgetViewModel viewModel);

  void detachFromHost(RootWidgetViewModel viewModel);

  void handleException(JsError error);
}
