import 'package:voltron_renderer/voltron_renderer.dart';

import '../engine.dart';
import '../module.dart';

class JSUIComponentEventHandler with UIComponentEventHandler {
  final EngineContext _engineContext;

  JSUIComponentEventHandler(this._engineContext);

  @override
  void receiveUIComponentEvent(int tagId, String eventName, Object? param) {
    _engineContext.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveUIComponentEvent(tagId, eventName, param);
  }
}
