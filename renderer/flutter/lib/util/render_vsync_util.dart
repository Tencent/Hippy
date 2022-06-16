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

import 'dart:collection';

import 'package:flutter/scheduler.dart';

import '../bridge/render_bridge.dart';gu

class RenderVsyncUtil {
  static const String kDoFrame = "frameupdate";
  static bool _enablePostFrame = false;
  static final HashMap<int, List<int>> _listeners = HashMap();

  static void _handleDoFrameCallBack(Duration duration) {
    if (!_enablePostFrame) {
      return;
    }

    for (final listener in _listeners.entries) {
      final engineId = listener.key;
      final rootIdList = listener.value;
      final bridge = VoltronRenderBridgeManager.bridgeMap[engineId];
      if (rootIdList.isEmpty || bridge == null) {
        continue;
      }

      for (final rootId in rootIdList) {
        bridge.execNativeEvent(rootId, rootId, kDoFrame, {});
      }
    }
    SchedulerBinding.instance?.addPostFrameCallback(_handleDoFrameCallBack);
  }

  static void _doPostFrame() {
    SchedulerBinding.instance?.addPostFrameCallback(_handleDoFrameCallBack);
  }

  static void registerDoFrameListener(int engineId, int rootId) {
    _listeners.putIfAbsent(engineId, () => <int>[]);
    final rootIdList = _listeners[engineId];
    if (rootIdList == null) {
      return;
    }

    rootIdList.add(rootId);
    if (!_enablePostFrame) {
      _doPostFrame();
      _enablePostFrame = true;
    }
  }

  static void unregisterDoFrameListener(int engineId, int rootId) {
    final rootIdList = _listeners[engineId];
    if (rootIdList != null) {
      rootIdList.remove(rootId);
      if (rootIdList.isEmpty) {
        _listeners.remove(engineId);
      }
    }
    if (_listeners.isEmpty) {
      _enablePostFrame = false;
    }
  }
}
