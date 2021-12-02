import '../util/string_util.dart';
import 'bundle.dart';
import 'engine_context.dart';
import 'module_params.dart';
import 'voltron_engine.dart';

class InstanceContext {
  EngineContext? _engineContext;
  ModuleLoadParams? _moduleParams;
  VoltronBundleLoader? _bundleLoader;
  VoltronEngine? _engineManager;

  InstanceContext(ModuleLoadParams params) {
    moduleParams = params;
  }

  VoltronBundleLoader? get bundleLoader {
    return _bundleLoader;
  }

  ModuleLoadParams? getModuleParams() {
    return _moduleParams;
  }

  // ignore: use_setters_to_change_properties
  void setEngineContext(EngineContext context) {
    _engineContext = context;
  }

  set moduleParams(ModuleLoadParams params) {
    _moduleParams = params;
    var bundleLoader = _moduleParams?.bundleLoader;
    if (bundleLoader != null) {
      _bundleLoader = bundleLoader;
    } else {
      var jsAsstsPath = params.jsAssetsPath;
      var jsFilePath = params.jsFilePath;
      var jsHttpPath = params.jsHttpPath;
      if (jsAsstsPath != null && !isEmpty(jsAsstsPath)) {
        _bundleLoader = AssetBundleLoader(jsAsstsPath,
            canUseCodeCache: !isEmpty(params.codeCacheTag),
            codeCacheTag: params.codeCacheTag);
      } else if (jsFilePath != null && !isEmpty(jsFilePath)) {
        _bundleLoader = FileBundleLoader(jsFilePath,
            canUseCodeCache: !isEmpty(params.codeCacheTag),
            codeCacheTag: params.codeCacheTag);
      } else if (jsHttpPath != null && !isEmpty(jsHttpPath)) {
        _bundleLoader = HttpBundleLoader(jsHttpPath,
            canUseCodeCache: !isEmpty(params.codeCacheTag),
            codeCacheTag: params.codeCacheTag);
      }
    }
  }

  EngineContext? get engineContext {
    return _engineContext;
  }

  // ignore: use_setters_to_change_properties
  void attachEngineManager(VoltronEngine engineManager) {
    _engineManager = engineManager;
  }

  VoltronEngine? get engineManager {
    return _engineManager;
  }
}
