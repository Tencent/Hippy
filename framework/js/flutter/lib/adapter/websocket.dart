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
import 'dart:math';

import 'package:voltron_renderer/voltron_renderer.dart';
import 'package:web_socket_channel/io.dart';

class WebSocketManager {
  static final WebSocketManager _instance = WebSocketManager._internal();

  factory WebSocketManager.getInstance() => _instance;

  WebSocketManager._internal();

  final Map<String, IOWebSocketChannel> _cacheMap = {};

  void set(String key, IOWebSocketChannel value) {
    _cacheMap[key] = value;
  }

  IOWebSocketChannel? get(String key) {
    return _cacheMap[key];
  }

  void remove(String key) {
    _cacheMap.remove(key);
  }
}

class WebsocketAdapter with Destroyable {
  final String url;
  final List<String>? protocols;
  final Map<String, dynamic>? headers;
  late void Function(dynamic)? onDataCallback;
  late void Function(OSError)? onErrorCallback;
  late Function? onDoneCallback;
  late IOWebSocketChannel _channel;
  late int _id;

  WebsocketAdapter({
    required this.url,
    this.protocols,
    this.headers,
  });

  Future<IOWebSocketChannel?> connect({bool? cancelOnError = true}) async {
    return WebSocket.connect(url).then((ws) {
      _id = _randomId();
      _channel = IOWebSocketChannel(ws);
      _channel.stream.listen(_onDataCallback, onError: (error) {
        _onErrorCallback(_getOSError(error));
      }, onDone: _onDoneCallback, cancelOnError: cancelOnError);
      setChannel(id, _channel);
      return _channel;
    }).catchError((error) {
      throw _getOSError(error);
    });
  }

  void _onDataCallback(message) {
    if (onDataCallback != null) {
      onDataCallback!(message);
    }
  }

  void _onErrorCallback(OSError error) {
    if (onErrorCallback != null) {
      onErrorCallback!(error);
    }
  }

  void _onDoneCallback() {
    removeChnnel(id);
    if (onDoneCallback != null) {
      onDoneCallback!();
    }
  }

  OSError _getOSError([error]) {
    if (error != null) {
      if (error is OSError) {
        return error;
      }
      if (error is HttpException) {
        return OSError(error.message, 500);
      }
      if (error?.osError != null && error.osError is OSError) {
        return error.osError;
      }
      if (error?.inner != null) {
        return _getOSError(error.inner);
      }
      if (error.message != null) {
        return OSError(error.message, 505);
      }
    }
    return OSError('unknown error', 404);
  }

  int _randomId() {
    var now = DateTime.now().millisecondsSinceEpoch;
    var random = Random().nextInt(1024);
    return int.parse('$now$random');
  }

  IOWebSocketChannel? getChannel(int id) {
    return WebSocketManager.getInstance().get(id.toString());
  }

  void setChannel(int id, IOWebSocketChannel channel) {
    return WebSocketManager.getInstance().set(id.toString(), channel);
  }

  void removeChnnel(int id) {
    WebSocketManager.getInstance().remove(id.toString());
  }

  IOWebSocketChannel get currentChannel => _channel;

  int get id => _id;

  @override
  void destroy() {}
}
