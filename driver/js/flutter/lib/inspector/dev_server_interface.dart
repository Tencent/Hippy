import 'package:voltron_renderer/voltron_renderer.dart';

abstract class DevServerInterface {
  // void reload();

  String createResourceUrl(String resName);

// void loadRemoteResource(String url, DevServerCallBack serverCallBack);

// void setDevServerCallback(DevServerCallBack devServerCallback);

  void attachToHost(RootWidgetViewModel viewModel);

  void detachFromHost(RootWidgetViewModel viewModel);

  void handleException(JsError error);
}
