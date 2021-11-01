import '../../engine/engine_context.dart';
import 'inspector.dart';
import 'model/model.dart';

export './domain/css.dart';
export './domain/dom.dart';
export './domain/network.dart';
export './domain/page.dart';

/// 远程调试协议把操作划分为不同的域(domain)
/// 主要为：DOM、Page和NetWork等
/// https://github.com/Pines-Cheng/blog/issues/82
abstract class InspectDomain {
  bool _enable = false;
  final Inspector inspector;
  InspectDomain(this.inspector);

  String get name => '';

  void invoke(EngineContext context, int id, String method,
      Map<String, dynamic> params) {
    if (method == 'enable') {
      _enable = true;
      inspector.sendToFrontend(context, id, null);
    } else if (method == 'disable') {
      _enable = false;
      inspector.sendToFrontend(context, id, null);
    }

    if (_enable) {
      receiveFromFrontend(context, id, method, params);
    }
  }

  void sendToFrontend<T>(EngineContext context, int id, T? data) {
    inspector.sendToFrontend(context, id, data);
  }

  void sendEventToFrontend(EngineContext context, InspectorEvent event) async {
    inspector.sendEventToFrontend(context, event);
  }

  void receiveFromFrontend(EngineContext context, int id, String method,
      Map<String, dynamic> params);
}

/// 调试事件
class InspectorEvent implements InspectorModel {
  final String method;
  final InspectorModel? params;
  InspectorEvent(this.method, this.params);

  Map toJson() {
    return {
      'method': method,
      'params': params,
    };
  }
}
