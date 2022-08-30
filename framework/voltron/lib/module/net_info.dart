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

import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:voltron_renderer/voltron_renderer.dart';

import '../engine.dart';
import 'event_dispatcher.dart';
import 'module.dart';
import 'promise.dart';

class NetInfoModule extends VoltronNativeModule {
  static const String kNetInfoModuleName = "NetInfo";

  static const String funcGetCurrentConnectivity = "getCurrentConnectivity";

  StreamSubscription? subscription;

  NetInfoModule(EngineContext context) : super(context);

  @VoltronMethod(funcGetCurrentConnectivity)
  bool getCurrentConnectivity(final JSPromise promise) {
    Connectivity().checkConnectivity().then((res) {
      var params = VoltronMap();
      params.push<String>("network_info", res.name.toUpperCase());
      promise.resolve(params);
    }).catchError((err) {
      promise.reject(err.toString());
    });
    return true;
  }

  @override
  void handleAddListener(String name) {
    registerReceiver();
  }

  @override
  void handleRemoveListener(String name) {
    unregisterReceiver();
  }

  void registerReceiver() {
    subscription = Connectivity().onConnectivityChanged.listen((res) {
      var params = VoltronMap();
      params.push<String>("network_info", res.name.toUpperCase());
      context.moduleManager
          .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher),
          )
          ?.receiveNativeEvent("networkStatusDidChange", params);
    });
  }

  void unregisterReceiver() {
    subscription?.cancel();
  }

  @override
  void destroy() {
    unregisterReceiver();
    super.destroy();
  }

  @override
  Map<String, Function> get extraFuncMap => {
        funcGetCurrentConnectivity: getCurrentConnectivity,
      };

  @override
  String get moduleName => kNetInfoModuleName;
}
