import 'package:voltron_renderer/voltron_renderer.dart';

import '../adapter.dart';
import 'js_init_params.dart';

class GlobalConfigs implements Destroyable {
  // device adapter
  DeviceAdapter? _deviceAdapter;

  // Engine Monitor adapter
  EngineMonitor? _engineMonitor;

  // Crash Handler
  ExceptionHandlerAdapter? _exceptionHandlerAdapter;

  // Http request adapter
  HttpAdapter? _httpAdapter;

  // Storage adapter
  StorageAdapter? _storageAdapter;

  // font scale adapter
  FontScaleAdapter? _fontScaleAdapter;

  // SharedPreferences
  ShredPreferenceAdapter? _sharedPreferencesAdapter;

  ShredPreferenceAdapter? get sharedPreferencesAdapter =>
      _sharedPreferencesAdapter;

  DeviceAdapter? get deviceAdapter => _deviceAdapter;

  EngineMonitor? get engineMonitor => _engineMonitor;

  ExceptionHandlerAdapter? get exceptionHandlerAdapter =>
      _exceptionHandlerAdapter;

  HttpAdapter? get httpAdapter => _httpAdapter;

  StorageAdapter? get storageAdapter => _storageAdapter;

  FontScaleAdapter? get fontScaleAdapter => _fontScaleAdapter;

  EngineMonitor? get monitorAdapter => _engineMonitor;

  GlobalConfigs(EngineInitParams params) {
    _sharedPreferencesAdapter = params.sharedPreferencesAdapter;
    _exceptionHandlerAdapter = params.exceptionHandler;
    _httpAdapter = params.httpAdapter;
    _storageAdapter = params.storageAdapter;
    _engineMonitor = params.engineMonitor;
    _fontScaleAdapter = params.fontScaleAdapter;
    _deviceAdapter = params.deviceAdapter;
  }

  @override
  void destroy() {
    try {
      _httpAdapter?.destroy();
      _storageAdapter?.destroy();
    } catch (e) {
      LogUtils.e("GlobalConfigs", "destroy error: $e");
    }
  }
}
