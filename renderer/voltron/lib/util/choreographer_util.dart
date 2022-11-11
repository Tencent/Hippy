//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

import 'dart:collection';

import 'package:flutter/material.dart';

import '../bridge.dart';

class ChoreographerUtil {
  static final String kDoFrame = "frameupdate";
  static bool enablePostFrame = false;
  static final HashMap<int, List<int>?> _listeners = HashMap();

  static void handleDoFrameCallback() {
    _listeners.forEach((engineId, rootList) {
      if (rootList == null) {
        return;
      }
      for (var rootId in rootList) {
        var bridge = VoltronRenderBridgeManager.bridgeMap[engineId];
        if (bridge != null) {
          bridge.sendRootEvent(rootId, rootId, kDoFrame, {});
        }
      }
    });
  }

  static void doPostFrame() {
    WidgetsBinding.instance.addPostFrameCallback((timeStamp) {
      handleDoFrameCallback();
      if (enablePostFrame) {
        doPostFrame();
      }
    });
  }

  static void registerDoFrameListener(int engineId, int rootId) {
    var rootList = _listeners[engineId];
    if (rootList == null) {
      rootList = [];
      rootList.add(rootId);
      _listeners[engineId] = rootList;
    } else {
      rootList.add(rootId);
    }
    if (!enablePostFrame) {
      doPostFrame();
      WidgetsBinding.instance.scheduleFrame();
      enablePostFrame = true;
    }
  }

  static void unregisterDoFrameListener(int engineId, int rootId) {
    var rootList = _listeners[engineId];
    if (rootList != null) {
      rootList.remove(rootId);
      if (rootList.isEmpty) {
        _listeners.remove(engineId);
      }
    } else {
      _listeners.remove(engineId);
    }
    if (_listeners.isEmpty) {
      enablePostFrame = false;
    }
  }
}
