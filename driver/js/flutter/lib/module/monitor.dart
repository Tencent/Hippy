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

import 'package:voltron_renderer/voltron_renderer.dart';

import '../engine.dart';

class ModuleAnrMonitor {
  static const int kAnrTime = 100;
  static const int kMonitorIdNan = 0;
  static int kMonitorIdCounter = 0;

  final bool _needReportBridgeANR;
  final EngineMonitor? _engineMonitorAdapter;
  final HashMap<int, MonitorMessage> _monitorMessages = HashMap();

  ModuleAnrMonitor(EngineContext context)
      : _engineMonitorAdapter = context.globalConfigs.monitorAdapter,
        _needReportBridgeANR =
            context.globalConfigs.monitorAdapter?.needReportBridgeANR() ??
                false;

  int startMonitor(String params1, String params2) {
    if (!_needReportBridgeANR) {
      return kMonitorIdNan;
    }
    var message = MonitorMessage.obtain(params1, params2, currentTimeMillis());
    var id = ++kMonitorIdCounter;
    if (id == kMonitorIdNan) {
      id = ++kMonitorIdCounter;
    }
    _monitorMessages[id] = message;
    return id;
  }

  void endMonitor(int id) {
    if (!_needReportBridgeANR) {
      return;
    }
    var message = _monitorMessages[id];
    if (message == null) {
      return;
    }
    var currentTime = currentTimeMillis();
    if (currentTime - message.startTime > kAnrTime) {
      var engineMonitorAdapter = _engineMonitorAdapter;
      if (engineMonitorAdapter != null) {
        engineMonitorAdapter
            .reportBridgeANR("${message.param1} | ${message.param2}");
      }
    }
    _monitorMessages.remove(id);
    message.dispose();
  }

  void checkMonitor() {
    for (final entry in _monitorMessages.entries) {
      var monitorMessage = entry.value;
      var currentTime = currentTimeMillis();
      if (currentTime - monitorMessage.startTime > kAnrTime) {
        var engineMonitorAdapter = _engineMonitorAdapter;
        if (engineMonitorAdapter != null) {
          engineMonitorAdapter.reportBridgeANR(
              "${monitorMessage.param1} | ${monitorMessage.param2}");
        }
        _monitorMessages.remove(entry.key);
        monitorMessage.dispose();
      }
    }
  }
}

class MonitorMessage {
  static const int poolSize = 20;
  static final ListQueue<MonitorMessage> sInstancePool = ListQueue(poolSize);

  String param1 = '';
  String param2 = '';
  int startTime = 0;

  static MonitorMessage obtain(String param1, String param2, int startTime) {
    var instance = sInstancePool.isEmpty ? null : sInstancePool.removeFirst();
    instance ??= MonitorMessage._internal();

    instance.init(param1, param2, startTime);
    return instance;
  }

  MonitorMessage._internal();

  void init(String param1, String param2, int startTime) {
    this.param1 = param1;
    this.param2 = param2;
    this.startTime = startTime;
  }

  void dispose() {
    try {
      if (sInstancePool.length < poolSize) {
        sInstancePool.add(this);
      }
    } catch (e) {
      LogUtils.e("MonitorMessage", "dispose error:$e");
    }
  }
}
