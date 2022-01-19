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
import 'module.dart';

class EventDispatcher extends JavaScriptModule {
  static const String kModuleName = "EventDispatcher";

  EventDispatcher(EngineContext context) : super(context);

  void receiveNativeGesture(VoltronMap param) {
    context.bridgeManager
        .callJavaScriptModule(kModuleName, "receiveNativeGesture", param);
  }

  void receiveUIComponentEvent(int tagId, String eventName, Object? param) {
    var array = VoltronArray();
    array.push(tagId);
    array.push(eventName);
    array.push(param);
    context.bridgeManager
        .callJavaScriptModule(kModuleName, "receiveUIComponentEvent", array);
  }

  void receiveNativeEvent(String eventName, Object? param) {
    var array = VoltronArray();
    array.push(eventName);
    array.push(param);
    context.bridgeManager
        .callJavaScriptModule(kModuleName, "receiveNativeEvent", array);
  }
}
