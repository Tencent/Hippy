import './event_dispatcher.dart';
// ignore: directives_ordering
import '../adapter/websocket.dart';
import '../common/voltron_map.dart';
import '../engine/engine_context.dart';
import 'module.dart';
import 'promise.dart';

class WebsocketModule extends VoltronNativeModule {
  static const String websocketModuleName = "websocket";
  static const String funcConnect = "connect";
  static const String funcClose = "close";
  static const String funcSend = "send";
  EventDispatcher? _event;

  WebsocketModule(EngineContext context) : super(context) {
    _event = EventDispatcher(context);
  }

  @VoltronMethod(funcConnect)
  bool connect(VoltronMap params, final Promise promise) {
    var headers = params.get<VoltronMap>('headers');
    var url = params.get<String>('url');
    var protocals = headers?.get<String>('Sec-WebSocket-Protocol')?.split(',');
    if (url == null) {
      promise.reject('The `url` parameter is empty.');
      return false;
    }
    // 实例化一个 websocket 实例
    var ws = WebsocketAdapter(
        url: url, protocols: protocals, headers: headers?.toMap());
    // 进行事件监听
    _attachEvent(ws);
    // 开始连接
    ws.connect().then((_) {
      // 如果连接成功，先返回 promise
      promise.resolve(_generateResult(ws.id, 0, ''));
      // 然后再发送 onOpen 事件
      _sendEvent(ws.id, 'onOpen', null);
    }).catchError((error) {
      // 如果连接失败，返回 promise
      promise.resolve(_generateResult(null, error.errorCode, error.message));
    });
    return true;
  }

  @VoltronMethod(funcClose)
  bool close(VoltronMap params, final Promise promise) {
    var id = params.get('id')?.toInt();
    var code = params.get('code')?.toInt();
    var reason = params.get<String>('reason');
    var channel = WebSocketManager.getInstance().get(id.toString());
    channel?.sink.close(code, reason);
    return true;
  }

  @VoltronMethod(funcSend)
  bool send(VoltronMap params, final Promise promise) {
    var id = params.get('id')?.toInt();
    var data = params.get<String>('data') ?? '';
    var channel = WebSocketManager.getInstance().get(id.toString());
    channel?.sink.add(data);
    return true;
  }

  void _sendEvent(int id, String type, Object? data) {
    var event = VoltronMap();
    event.push('id', id);
    event.push('type', type);
    if (data != null) {
      event.push('data', data);
    }
    _event?.receiveNativeEvent('hippyWebsocketEvents', event);
  }

  VoltronMap _generateResult(int? id, int code, String reason) {
    var ret = VoltronMap();
    ret.push('code', code);
    ret.push('reason', reason);
    if (id != null) {
      ret.push('id', id);
    }
    return ret;
  }

  void _attachEvent(WebsocketAdapter ws) {
    ws.onDataCallback = (message) {
      _sendEvent(ws.id, 'onMessage', message);
    };
    ws.onErrorCallback = (error) {
      _sendEvent(ws.id, 'onError',
          _generateResult(null, error.errorCode, error.message));
    };
    ws.onDoneCallback = () {
      _sendEvent(ws.id, 'onClose', null);
    };
  }

  @override
  Map<String, Function> get extraFuncMap => {
        funcConnect: connect,
        funcClose: close,
        funcSend: send,
      };

  @override
  String get moduleName => websocketModuleName;
}
