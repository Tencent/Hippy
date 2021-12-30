import 'dart:io';

import '../engine.dart';
import '../widget.dart';

class DevSupportManager {
  DevServerInterface? _devImp;
  late bool _supportDev;

  DevSupportManager(GlobalConfigs configs, bool enableDev, String serverHost,
      String bundleName) {
    // this._devImp = DevFactory.create(configs, enableDev, serverHost, bundleName);
    _supportDev = enableDev;
  }

  bool supportDev() {
    return _supportDev;
  }

  void setDevCallback(DevServerCallBack devCallback) {
    _devImp?.setDevServerCallback(devCallback);
  }

  void attachToHost(RootWidgetViewModel view) {
    _devImp?.attachToHost(view);
  }

  void detachFromHost(RootWidgetViewModel view) {
    _devImp?.detachFromHost(view);
  }

  void init(DevRemoteDebugProxy remoteDebugManager) {
    _devImp?.reload(remoteDebugManager);
  }

  void handleException(Error throwable) {
    _devImp?.handleException(throwable);
  }
}

abstract class DevServerInterface {
  void reload(DevRemoteDebugProxy remoteDebugManager);

  void setDevServerCallback(DevServerCallBack devServerCallback);

  void attachToHost(RootWidgetViewModel view);

  void detachFromHost(RootWidgetViewModel view);

  void handleException(Error error);
}

mixin DevRemoteDebugProxy {
  void destroy();
}

mixin OnReceiveDataListener {
  void onReceiveData(String msg);
}

abstract class DevServerCallBack {
//The bundle is loaded successfully callback
  void onDevBundleLoadReady(File bundle);

  void onInitDevError(Error e);
}
