import '../adapter.dart';
import '../common.dart';
import '../util.dart';
import 'init_params.dart';

class GlobalConfigs implements Destroyable {
  // device adapter
  DeviceAdapter? _deviceAdapter;

  // Engine Monitor adapter
  EngineMonitorAdapter? _engineMonitorAdapter;

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

  EngineMonitorAdapter? get engineMonitorAdapter => _engineMonitorAdapter;

  ExceptionHandlerAdapter? get exceptionHandlerAdapter =>
      _exceptionHandlerAdapter;

  HttpAdapter? get httpAdapter => _httpAdapter;

  StorageAdapter? get storageAdapter => _storageAdapter;

  FontScaleAdapter? get fontScaleAdapter => _fontScaleAdapter;

  EngineMonitorAdapter? get monitorAdapter => _engineMonitorAdapter;

  GlobalConfigs(EngineInitParams params) {
    _sharedPreferencesAdapter = params.sharedPreferencesAdapter;
    _exceptionHandlerAdapter = params.exceptionHandler;
    _httpAdapter = params.httpAdapter;
    _storageAdapter = params.storageAdapter;
    _engineMonitorAdapter = params.engineMonitor;
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
