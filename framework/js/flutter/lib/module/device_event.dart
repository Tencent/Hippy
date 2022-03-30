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

import '../engine.dart';
import 'event_dispatcher.dart';
import 'module.dart';
import 'promise.dart';

class DeviceEventModule extends VoltronNativeModule {
  static const String kDeviceModuleName = "DeviceEventModule";
  static const String kDeviceSetListenBackPress = "setListenBackPress";
  static const String kDeviceInvokeDefaultBackPressHandler =
      "invokeDefaultBackPressHandler";

  bool _isListening = false;
  BackPressHandler? _backPressHandler;

  DeviceEventModule(EngineContext context) : super(context);

  @override
  Map<String, Function> get extraFuncMap => {
        kDeviceSetListenBackPress: setListenBackPress,
        kDeviceInvokeDefaultBackPressHandler: invokeDefaultBackPressHandler
      };

  @override
  String get moduleName => kDeviceModuleName;

  bool onBackPressed(BackPressHandler handler) {
    if (_isListening) {
      _backPressHandler = handler;
      var dispatcher = context.moduleManager
          .getJavaScriptModule<EventDispatcher>(
              enumValueToString(JavaScriptModuleType.EventDispatcher));
      if (dispatcher != null) {
        dispatcher.receiveNativeEvent("hardwareBackPress", null);
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  // 前端JS告知SDK：我要监听back事件（如果没有告知，则SDK不用把back事件抛给前端，这样可以加快back的处理速度，毕竟大部分Voltron业务是无需监听back事件的）
  // @param listen 是否监听？
  @VoltronMethod(kDeviceSetListenBackPress)
  bool setListenBackPress(bool listen, JSPromise promise) {
    _isListening = listen;
    return false;
  }

  @VoltronMethod(kDeviceInvokeDefaultBackPressHandler)
  bool invokeDefaultBackPressHandler(JSPromise promise) {
    _doInvokeHandler();
    return false;
  }

  Future<dynamic> _doInvokeHandler() async {
    var backPressHandler = _backPressHandler;
    if (backPressHandler != null) {
      backPressHandler();
    }
  }

  @override
  void destroy() {
    super.destroy();
    _backPressHandler = null;
  }
}
