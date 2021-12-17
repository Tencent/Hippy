import 'dart:collection';

import '../adapter.dart';
import '../engine.dart';
import '../util.dart';

class ModuleAnrMonitor {
  static const int anrTime = 100;
  static const int monitorIdNan = 0;
  static int sMonitorIdCounter = 0;

  final bool _needReportBridgeANR;
  final EngineMonitorAdapter? _engineMonitorAdapter;
  final HashMap<int, MonitorMessage> _monitorMessages = HashMap();

  ModuleAnrMonitor(EngineContext context)
      : _engineMonitorAdapter = context.globalConfigs.monitorAdapter,
        _needReportBridgeANR =
            context.globalConfigs.monitorAdapter?.needReportBridgeANR() ??
                false;

  int startMonitor(String params1, String params2) {
    if (!_needReportBridgeANR) {
      return monitorIdNan;
    }
    var message = MonitorMessage.obtain(params1, params2, currentTimeMillis());
    var id = ++sMonitorIdCounter;
    if (id == monitorIdNan) {
      id = ++sMonitorIdCounter;
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
    if (currentTime - message.startTime > anrTime) {
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
      if (currentTime - monitorMessage.startTime > anrTime) {
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
    if (instance == null) {
      instance = MonitorMessage._internal();
    }

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
