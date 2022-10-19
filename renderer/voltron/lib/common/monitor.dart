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

import 'dart:async';

import 'package:voltron_renderer/render.dart';

import '../common.dart';
import '../util.dart';
import '../widget.dart';

class EngineMonitor {
  static const int kEngineLoadResultSuccess = 0;
  static const int kEngineLoadResultError = 1;
  static const int kEngineLoadResultTimeout = 2;
  late VoltronMap jsParams;
  static const String kTag = 'EngineMonitorAdapter';

  bool enableBuildTime = false; // 是否统计build耗时
  bool enableCreateElementTime = false; // 是否统计element创建耗时
  bool enablePerformance = false; // 是否启用性能统计

  int _startBatchTime = 0;
  int _endBatchTime = 0;
  int _batchTime = 0;
  int _startRenderTime = 0; //开始渲染的时间
  int _reportCount = 0;
  Timer? _timer;

  PerformanceData _performanceData = PerformanceData();

  bool _hasAddPostFrameCall = false;

  bool get hasAddPostFrameCall => _hasAddPostFrameCall;

  set hasAddPostFrameCall(bool value) {
    _hasAddPostFrameCall = value;
    if (value) {
      _startRenderTime = currentMicroseconds(); // 监听事件时，记为开始渲染时间
    }
  }

  // ignore: use_setters_to_change_properties
  void initLoadParams(VoltronMap params) {
    jsParams = params;
  }

  void reportEngineLoadStart() {}

  void performanceCallback(PerformanceData data, int reportCount) {}

  void reportEngineLoadResult(
      int code, int loadTime, List<EngineMonitorEvent> loadEvents, Error? e) {}

  void reportModuleLoadComplete(RootWidgetViewModel rootView, int loadTime,
      List<EngineMonitorEvent> loadEvents) {}

  bool needReportBridgeANR() {
    return false;
  }

  void reportBridgeANR(String message) {}

  // root节点的addPostFrameCallback回调
  void postFrameCallback() {
    _hasAddPostFrameCall = false;
    if (_startRenderTime > 0) {
      _performanceData.renderTime +=
          currentMicroseconds() - _startRenderTime; // 本次绘制时间
      _performanceData.batchTime += _batchTime;
      _clearData(); //清理数据
      LogUtils.d(kTag, ' postFrameCallback ${_startRenderTime.toString()}');
      _startRenderTime = 0;
      _timer?.cancel();
      _timer = Timer(const Duration(milliseconds: 50), () {
        // 等50毫秒再上报，合并渲染数据，
        if (!_hasAddPostFrameCall) {
          LogUtils.d(kTag, '标签耗时 ${_performanceData.toString()}');
          LogUtils.d(kTag, '组件耗时 ${_performanceData.widgetToString()}');
          _reportCount++;
          performanceCallback(_performanceData, _reportCount);
          _performanceData = PerformanceData(); // 上报后清数据
        }
      });
    }
    _hasAddPostFrameCall = false;
  }

  void _clearData() {
    _hasAddPostFrameCall = false;
    _startBatchTime = 0;
    _endBatchTime = 0;
    _batchTime = 0;
  }

  void startBatch() {
    if (!enablePerformance) {
      return;
    }

    _startBatchTime = currentMicroseconds();
  }

  void setUpdateNodeInfo(int count, Map<String, int> info) {
    if (!enablePerformance) {
      return;
    }

    info.forEach((key, value) {
      if (!_performanceData.data.containsKey(key)) {
        _performanceData.data[key] = NodePerformanceData();
      }
      _performanceData.data[key]?.updateCount += value;
    });
  }

  void setCreateNodeInfo(int count, Map<String, int> info) {
    if (!enablePerformance) {
      return;
    }

    info.forEach((key, value) {
      if (!_performanceData.data.containsKey(key)) {
        _performanceData.data[key] = NodePerformanceData();
      }
      _performanceData.data[key]?.createCount += value;
    });
  }

  void setDeleteNodeInfo(int count, Map<String, int> info) {
    if (!enablePerformance) {
      return;
    }

    info.forEach((key, value) {
      if (!_performanceData.data.containsKey(key)) {
        _performanceData.data[key] = NodePerformanceData();
      }
      _performanceData.data[key]?.deleteCount += value;
    });
  }

  void endBatch() {
    if (!enablePerformance) {
      return;
    }
    _endBatchTime = currentMicroseconds();
    if (_startBatchTime != 0) {
      _performanceData.batchCount++;
      _batchTime += (_endBatchTime - _startBatchTime); // 多次patch, 一次render的情况
    }
    _startBatchTime = 0;
  }

  void setBuildTime(String key, String widgetName, int costTime) {
    if (!_performanceData.data.containsKey(key)) {
      _performanceData.data[key] = NodePerformanceData();
    }
    _performanceData.data[key]?.buildTime += costTime;
    _performanceData.buildTime += costTime;

    // 性能分析时使用
    if (!_performanceData.widget.containsKey(widgetName)) {
      _performanceData.widget[widgetName] = NodePerformanceData();
    }
    _performanceData.widget[widgetName]?.buildTime += costTime;
    _performanceData.widget[widgetName]?.createCount += 1;
  }

  void setElementTime(String key, int costTime) {
    if (!_performanceData.data.containsKey(key)) {
      _performanceData.data[key] = NodePerformanceData();
    }
    _performanceData.data[key]?.elementTime += costTime;
    _performanceData.elementTime += costTime;
  }
}

class PerformanceData {
  int batchTime = 0;
  int renderTime = 0;
  int buildTime = 0;
  int elementTime = 0;
  int batchCount = 0; // 包含几次batch
  Map<String, NodePerformanceData> data = {};
  Map<String, NodePerformanceData> widget = {};

  @override
  String toString() {
    var result = '';
    data.forEach((key, value) {
      result += ' key: $key result: ${value.toString()}';
    });
    return 'batchCount: ${batchCount.toString()} batchTime: ${batchTime.toString()} renderTime: ${renderTime.toString()} buildTime: ${buildTime.toString()} elementTime: ${elementTime.toString()} data: $result';
  }

  String widgetToString() {
    var result = '';
    widget.forEach((key, value) {
      result += ' key: $key result: ${value.toString()}';
    });
    return result;
  }
}

class BuildTimePoint extends PerformanceTimePoint {
  BuildTimePoint(String name, String widgetName, RenderContext context)
      : super(name, widgetName, context) {
    if (engineMonitor.enableBuildTime) {
      enable = true;
    }
  }

  @override
  void report(int timeCost) {
    engineMonitor.setBuildTime(name, widgetName, timeCost);
  }
}

class ElementTimePoint extends PerformanceTimePoint {
  ElementTimePoint(String name, String widgetName, RenderContext context)
      : super(name, widgetName, context) {
    if (engineMonitor.enableCreateElementTime) {
      enable = true;
    }
  }

  @override
  void report(int timeCost) {
    engineMonitor.setElementTime(name, timeCost);
  }
}

class PerformanceTimePoint {
  late EngineMonitor engineMonitor;
  final String name;
  final String widgetName;
  Stopwatch stopwatch = Stopwatch();
  bool enable = false;

  PerformanceTimePoint(this.name, this.widgetName, RenderContext context) {
    engineMonitor = context.engineMonitor;
  }

  void start() {
    if (enable) {
      stopwatch.start();
    }
  }

  void end() {
    if (enable) {
      stopwatch.stop();
      report(stopwatch.elapsedMicroseconds);
    }
  }

  void report(int timeCost) {}
}

class NodePerformanceData {
  int createCount = 0;
  int deleteCount = 0;
  int updateCount = 0;
  int buildTime = 0;
  int elementTime = 0;

  @override
  String toString() {
    return 'createCount: ${createCount.toString()} deleteCount: ${deleteCount.toString()} updateCount: ${updateCount.toString()} buildTime: ${buildTime.toString()} elementTime: ${elementTime.toString()}';
  }
}

class EngineMonitorEvent {
  String eventName = '';
  int startTime = 0;
  int endTime = 0;
}

class TimeMonitor {
  late int _startTime;
  late int _totalTime;
  final bool _enable;
  EngineMonitorEvent? _currentEvent;
  final List<EngineMonitorEvent> _events;

  TimeMonitor(bool enable)
      : _enable = enable,
        _events = <EngineMonitorEvent>[];

  void startEvent(String event) {
    if (!_enable) {
      return;
    }
    var currentEvent = _currentEvent;
    if (currentEvent != null) {
      currentEvent.endTime = currentTimeMillis();
      _events.add(currentEvent);
      var cost = currentEvent.endTime - currentEvent.startTime;
      LogUtils.profile(currentEvent.eventName, cost);
    }

    if (isEmpty(event)) {
      return;
    }

    _currentEvent = EngineMonitorEvent();
    currentEvent = _currentEvent;
    if (currentEvent != null) {
      currentEvent.eventName = event;
      currentEvent.startTime = currentTimeMillis();
    }
    LogUtils.d("voltron", "startEvent: $event");
  }

  void begin() {
    if (!_enable) {
      return;
    }
    _startTime = currentTimeMillis();
    _currentEvent = null;
    _events.clear();
    _totalTime = 0;
  }

  void end() {
    if (!_enable) {
      return;
    }
    var curCost = 0;
    var currentEvent = _currentEvent;
    if (currentEvent != null) {
      currentEvent.endTime = currentTimeMillis();
      _events.add(currentEvent);
      curCost = currentEvent.endTime - currentEvent.startTime;
      LogUtils.profile(currentEvent.eventName, curCost);
    }

    _totalTime = currentTimeMillis() - _startTime;
    LogUtils.profile("totalTimeMonitor", _totalTime);
  }

  int get totalTime => _totalTime;

  List<EngineMonitorEvent> get events => _events;
}
