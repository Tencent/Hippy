//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2019 THL A29 Limited, a Tencent company.
// All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import 'package:voltron_renderer/voltron_renderer.dart';

import '../adapter.dart';
import '../engine.dart';
import 'event_dispatcher.dart';
import 'module.dart';
import 'promise.dart';

class WebsocketModule extends VoltronNativeModule {
  static const String kWebSocketModuleName = "websocket";
  static const String kFuncConnect = "connect";
  static const String kFuncClose = "close";
  static const String kFuncSend = "send";
  EventDispatcher? _event;

  WebsocketModule(EngineContext context) : super(context) {
    _event = EventDispatcher(context);
  }

  @VoltronMethod(kFuncConnect)
  bool connect(VoltronMap params, final JSPromise promise) {
    var headers = params.get<VoltronMap>('headers');
    var url = params.get<String>('url');
    var protocols = headers?.get<String>('Sec-WebSocket-Protocol')?.split(',');
    if (url == null) {
      promise.reject('The `url` parameter is empty.');
      return false;
    }
    // 实例化一个 web socket 实例
    var ws = WebsocketAdapter(
        url: url, protocols: protocols, headers: headers?.toMap());
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

  @VoltronMethod(kFuncClose)
  bool close(VoltronMap params, final JSPromise promise) {
    var id = params.get('id')?.toInt();
    var code = params.get('code')?.toInt();
    var reason = params.get<String>('reason');
    var channel = WebSocketManager.getInstance().get(id.toString());
    channel?.sink.close(code, reason);
    return true;
  }

  @VoltronMethod(kFuncSend)
  bool send(VoltronMap params, final JSPromise promise) {
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
        kFuncConnect: connect,
        kFuncClose: close,
        kFuncSend: send,
      };

  @override
  String get moduleName => kWebSocketModuleName;
}
