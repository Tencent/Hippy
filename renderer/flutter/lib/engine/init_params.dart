import '../adapter.dart';
import '../util.dart';
import 'api_provider.dart';
import 'bundle.dart';
import 'engine_define.dart';

// 引擎初始化时的参数设置
class EngineInitParams {
  EngineType iEngineType = EngineType.rn;
  // 可选参数 核心的js bundle的assets路径（assets路径和文件路径二选一，优先使用assets路径），debugMode = false时有效
  String? coreJSAssetsPath;
  // 可选参数 核心的js bundle的文件路径（assets路径和文件路径二选一，优先使用assets路径）,debugMode = false时有效
  String? coreJSFilePath;
  // 可选参数 指定需要预加载的业务模块bundle assets路径
  VoltronBundleLoader? jsPreloadAssetsPath;
  // 可选参数 指定需要预加载的业务模块bundle 文件路径
  VoltronBundleLoader? jsPreloadFilePath;
  // 可选参数 指定需要预加载的业务模块bundle assets路径
  VoltronBundleLoader? coreAssetsLoader;
  // 可选参数 指定需要预加载的业务模块bundle 文件路径
  VoltronBundleLoader? coreFileLoader;
  // 可选参数 调试模式
  bool debugMode = false;
  // 可选参数 引擎模式 默认为NORMAL
  EngineMode engineMode = EngineMode.normal;
  // 可选参数 是否开启调试模式，默认为false，不开启
  // 可选参数 Server的jsbundle名字，默认为"index.bundle"。debugMode = true时有效
  String debugBundleName = "index.bundle";
  // 可选参数 Server的Host。默认为"localhost:38989"。debugMode = true时有效
  String debugServerHost = "localhost:38989";
  // 可选参数 自定义的，用来提供Native modules、JavaScript modules、View controllers的管理器。1个或多个
  List<APIProvider>? providers;
  // 可选参数 是否允许启用底层buffer。默认为true
  bool enableBuffer = true;
  // 可选参数 是否打印引擎的完整的log。默认为false
  bool enableLog = false;
  // 可选参数 code cache的名字，如果设置为空，则不启用code cache，默认为 ""
  String codeCacheTag = "";
  // 自定义日志
  LogListener? logListener;

  //可选参数 接收RuntimeId
  VoltronThirdPartyAdapter? thirdPartyAdapter;

  // 可选参数 接收异常
  ExceptionHandlerAdapter? exceptionHandler;
  // 可选参数 设置相关
  ShredPreferenceAdapter? sharedPreferencesAdapter;
  // 可选参数 Http request adapter
  HttpAdapter? httpAdapter;
  // 可选参数 Storage adapter 设置相关
  StorageAdapter? storageAdapter;
  // 可选参数 Engine Monitor adapter
  EngineMonitorAdapter? engineMonitor;
  // 可选参数 font scale adapter
  FontScaleAdapter? fontScaleAdapter;
  // 可选参数 device adapter
  DeviceAdapter? deviceAdapter;
  // 设置引擎的组，同一组的Engine，会共享C层的v8 引擎实例。 默认值为-1（无效组，即不属于任何group组）
  int groupId = -1;

  void check() {
    if (sharedPreferencesAdapter == null) {
      sharedPreferencesAdapter = ShredPreferenceAdapter();
    }
    if (exceptionHandler == null) {
      exceptionHandler = ExceptionHandlerAdapter();
    }
    if (httpAdapter == null) httpAdapter = HttpAdapter();
    if (storageAdapter == null) storageAdapter = StorageAdapter();
    if (engineMonitor == null) engineMonitor = EngineMonitorAdapter();
    if (fontScaleAdapter == null) {
      fontScaleAdapter = FontScaleAdapter();
    }
    if (deviceAdapter == null) deviceAdapter = DeviceAdapter();
    if (providers == null) {
      providers = [];
    }

    providers!.insert(0, CoreApi());
    if (!debugMode) {
      if ((isEmpty(coreJSAssetsPath)) && isEmpty(coreJSFilePath)) {
        throw StateError(
            "Voltron: debugMode=true, initParams.coreJSAssetsPath and coreJSFilePath both null!");
      }
    }
  }

  EngineInitParams();
}
