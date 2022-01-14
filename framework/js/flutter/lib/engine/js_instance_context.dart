import 'package:voltron_renderer/voltron_renderer.dart';

import 'bundle.dart';
import 'js_engine_context.dart';
import 'js_module_params.dart';
import 'voltron_js_engine.dart';

class JSLoadInstanceContext with LoadInstanceContext {
  final ModuleLoadParams _moduleParams;
  VoltronBundleLoader? _bundleLoader;

  JSLoadInstanceContext(ModuleLoadParams params) : _moduleParams = params {
    moduleParams = params;
  }

  VoltronBundleLoader? get bundleLoader => _bundleLoader;

  ModuleLoadParams get moduleParams => _moduleParams;

  VoltronMap? get launchParams => _moduleParams.jsParams;

  String get name => _moduleParams.componentName;

  set moduleParams(ModuleLoadParams params) {
    var bundleLoader = _moduleParams.bundleLoader;
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
}
