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

import 'dart:io';

import 'package:voltron_renderer/voltron_renderer.dart';
import 'package:web_socket_channel/io.dart';
import 'package:web_socket_channel/status.dart' as status;

import './event_dispatcher.dart';
import '../engine.dart';
import 'module.dart';
import 'promise.dart';

class WebsocketModule extends VoltronNativeModule {
  static const String kWebSocketModuleName = "websocket";
  static const String funcConnect = "connect";
  static const String funcClose = "close";
  static const String funcSend = "send";
  static int _autoInt = 0;
  final Map<int, WebSocketClient> mWebSocketConnections = {};

  WebsocketModule(EngineContext context) : super(context);

  @VoltronMethod(funcConnect)
  bool connect(VoltronMap params, final JSPromise promise) {
    var url = params.get<String>('url');
    var headers = params.get<VoltronMap>('headers');
    var protocals = headers?.get<String>('Sec-WebSocket-Protocol')?.split(',');

    if (url == null) {
      var returnValue = VoltronMap();
      returnValue.push<int>('code', -1);
      returnValue.push<String>('reason', 'no valid url for websocket');
      promise.reject(returnValue);
      return false;
    }

    _autoInt += 1;
    var webSocketId = _autoInt;
    // 实例化一个 websocket 实例
    var webSocketClient = WebSocketClient(
      url: url,
      listener: WebSocketListener(webSocketId, context, this),
      protocols: protocals,
      headers: headers?.toMap(),
    );
    mWebSocketConnections[webSocketId] = webSocketClient;

    var returnValue = VoltronMap();
    returnValue.push<int>('code', 0);
    returnValue.push<String>('reason', "");
    returnValue.push<int>('id', webSocketId);
    promise.resolve(returnValue);

    webSocketClient.connect();
    return true;
  }

  @VoltronMethod(funcClose)
  void close(VoltronMap params, final Promise promise) {
    var socketId = params.get<int>('id');
    if (socketId == null) {
      LogUtils.d(kWebSocketModuleName, "close: ERROR: no socket id specified");
      return;
    }
    var socketClient = mWebSocketConnections[socketId];
    if (socketClient == null || !socketClient.isConnected) {
      LogUtils.d(
          kWebSocketModuleName, "send: ERROR: specified socket not found, or not connected yet");
      return;
    }
    var code = params.get<int>('code') ?? 0;
    var reason = params.get<String>('reason') ?? '';
    socketClient.requestClose(code, reason);
  }

  @VoltronMethod(funcSend)
  void send(VoltronMap params, final Promise promise) {
    var socketId = params.get<int>('id');
    if (socketId == null) {
      LogUtils.d(kWebSocketModuleName, "close: ERROR: no socket id specified");
      return;
    }
    var socketClient = mWebSocketConnections[socketId];
    if (socketClient == null || !socketClient.isConnected) {
      LogUtils.d(
          kWebSocketModuleName, "send: ERROR: specified socket not found, or not connected yet");
      return;
    }
    var textData = params.get<String>('data');
    if (textData == null) {
      LogUtils.d(kWebSocketModuleName, "send: ERROR: no data specified to be sent");
      return;
    }
    socketClient.send(textData);
  }

  void removeSocketConnection(int socketId) {
    mWebSocketConnections.remove(socketId);
  }

  @override
  Map<String, Function> get extraFuncMap => {
        funcConnect: connect,
        funcClose: close,
        funcSend: send,
      };

  @override
  String get moduleName => kWebSocketModuleName;

  @override
  void destroy() {
    mWebSocketConnections.forEach((key, connection) {
      connection._channel?.sink.close(status.goingAway);
    });
    mWebSocketConnections.clear();
  }
}

class WebSocketClient {
  final String url;
  final List<String>? protocols;
  final Map<String, dynamic>? headers;
  final WebSocketListener listener;
  IOWebSocketChannel? _channel;
  bool _connected = false;

  WebSocketClient({
    required this.url,
    required this.listener,
    this.protocols,
    this.headers,
  });

  bool get isConnected {
    return _connected;
  }

  void connect() {
    WebSocket.connect(
      url,
      protocols: protocols,
      headers: headers,
    ).then((ws) {
      _connected = true;
      listener.onConnect();
      _channel = IOWebSocketChannel(ws);
      _channel?.stream.listen((message) {
        // 监听服务端返回的消息
        var msg = message is String ? message : message.toString();
        listener.onMessage(msg);
      });
    }).catchError((err) {
      _connected = false;
      listener.onError(err);
    });
  }

  void disconnect() {
    _connected = false;
    listener.onDisconnect(0, "closed");
  }

  void requestClose(int code, String reason) {
    if (_connected) {
      try {
        _channel?.sink.close(code == 0 ? null : code, reason);
      } catch (e) {
        LogUtils.d('WebSocketClient', 'close fail, ${e.toString()}');
      }
      disconnect();
    }
  }

  void send(String textData) {
    if (_connected) {
      _channel?.sink.add(textData);
    }
  }
}

class WebSocketListener {
  final int mWebSocketId;
  final EngineContext context;
  bool mDisconnected = false;
  final WebsocketModule mWebSocketModule;

  WebSocketListener(this.mWebSocketId, this.context, this.mWebSocketModule);

  void _sendWebSocketEvent(String eventType, VoltronMap data) {
    if (mDisconnected) {
      return;
    }

    var eventParams = VoltronMap();
    eventParams.push<int>('id', mWebSocketId);
    eventParams.push<String>('type', eventType);
    eventParams.push<VoltronMap>('data', data);
    context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveNativeEvent('hippyWebsocketEvents', eventParams);
  }

  void onConnect() {
    _sendWebSocketEvent('onOpen', VoltronMap());
  }

  void onMessage(String message) {
    var params = VoltronMap();
    params.push<String>('data', message);
    params.push<String>('type', "text");
    _sendWebSocketEvent('onMessage', params);
  }

  void onDisconnect(int code, String reason) {
    var map = VoltronMap();
    map.push<int>('code', code);
    map.push<String>('reason', reason);
    _sendWebSocketEvent('onClose', map);
    mWebSocketModule.removeSocketConnection(mWebSocketId);
    mDisconnected = true;
  }

  void onError(Exception error) {
    var map = VoltronMap();
    map.push<String>('reason', error.toString());
    _sendWebSocketEvent('onError', map);
    mDisconnected = true;
  }
}
