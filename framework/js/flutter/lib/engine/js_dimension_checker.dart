import 'package:flutter/widgets.dart';
import 'package:voltron_renderer/voltron_renderer.dart';

import '../engine.dart';
import '../module.dart';

class JSDimensionChecker with DimensionChecker {
  final EngineContext _engineContext;

  JSDimensionChecker(this._engineContext);

  void checkUpdateDimension(
      BuildContext uiContext,
      VoltronMap dimensionMap,
      int windowWidth,
      int windowHeight,
      bool shouldUseScreenDisplay,
      bool systemUiVisibilityChanged) {
    // 如果windowHeight是无效值，则允许客户端定制
    if (windowHeight < 0) {
      var deviceAdapter = _engineContext.globalConfigs.deviceAdapter;
      if (deviceAdapter != null) {
        deviceAdapter.reviseDimensionIfNeed(uiContext, dimensionMap,
            shouldUseScreenDisplay, systemUiVisibilityChanged);
      }
    }
    _engineContext.moduleManager
        .getJavaScriptModule<Dimensions>(
            enumValueToString(JavaScriptModuleType.Dimensions))
        ?.set(dimensionMap);
  }
}
