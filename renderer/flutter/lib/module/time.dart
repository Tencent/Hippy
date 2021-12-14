import 'dart:async';
import 'dart:collection';

import '../engine/engine_context.dart';
import '../voltron/lifecycle.dart';
import 'module.dart';
import 'promise.dart';

class TimeModule extends VoltronNativeModule
    implements EngineLifecycleEventListener {
  static const timerModuleName = "TimerModule";
  static const String funcSetTimeout = "setTimeout";
  static const String funcClearTimeout = "clearTimeout";
  static const String funcSetInterval = "setInterval";
  static const String funcClearInterval = "clearInterval";

  final HashMap<String, TimerTask> _timeInfo = HashMap();

  TimeModule(EngineContext context) : super(context) {
    context.addEngineLifecycleEventListener(this);
  }

  @override
  Map<String, Function> get extraFuncMap => {
        funcSetTimeout: setTimeout,
        funcClearTimeout: clearTimeout,
        funcSetInterval: setInterval,
        funcClearInterval: clearInterval
      };

  @override
  String get moduleName => timerModuleName;

  @override
  void onEnginePause() {
    _timeInfo.forEach((callId, task) {
      task.pause();
    });
  }

  @override
  void onEngineResume() {
    _timeInfo.forEach((callId, task) {
      task.resume();
    });
  }

  @override
  void destroy() {
    _timeInfo.clear();
    context.removeEngineLifecycleEventListener(this);
    super.destroy();
  }

  @VoltronMethod(funcSetTimeout)
  bool setTimeout(int timeOut, String callId, JSPromise promise) {
    var timer = TimerTask(timeOut, false, callId, (task) {
      promise.resolve("");
      _timeInfo.remove(task);
    });
    _timeInfo[callId] = timer;
    timer.start();
    return true;
  }

  @VoltronMethod(funcClearTimeout)
  bool clearTimeout(String callId, JSPromise promise) {
    var task = _timeInfo[callId];
    task?.stop();
    _timeInfo.remove(callId);
    return false;
  }

  @VoltronMethod(funcSetInterval)
  bool setInterval(int interval, String callId, JSPromise promise) {
    var timer = TimerTask(interval, true, callId, (task) {
      promise.resolve("");
    });
    _timeInfo[callId] = timer;
    timer.start();
    return true;
  }

  @VoltronMethod(funcClearInterval)
  bool clearInterval(String callId, JSPromise promise) {
    var task = _timeInfo[callId];
    task?.stop();
    _timeInfo.remove(callId);
    return false;
  }
}

typedef Executor = void Function(TimerTask task);

class TimerTask {
  final Stopwatch stopwatch = Stopwatch();
  final int interval;
  final bool isRepeat;
  final String callId;
  final Executor executor;

  Timer? timer;
  int executeTime = 0;

  TimerTask(this.interval, this.isRepeat, this.callId, this.executor) {
    stopwatch.start();
  }

  void start() {
    if (timer == null) {
      _createTimer();
    }
  }

  void stop() {
    _stopTimer();
    stopwatch.stop();
  }

  void _createTimer() {
    if (isRepeat) {
      timer = Timer.periodic(Duration(milliseconds: interval), (timer) {
        stopwatch.reset();
        _run();
      });
    } else {
      timer = Timer(
          Duration(milliseconds: interval - stopwatch.elapsedMilliseconds), () {
        _run();
        stop();
      });
    }
  }

  void pause() {
    _stopTimer();
  }

  void _stopTimer() {
    timer?.cancel();
    timer = null;
  }

  void _run() {
    executor(this);
    executeTime++;
  }

  void resume() {
    if (!isRepeat && interval - stopwatch.elapsedMilliseconds <= 0) {
      _run();
    }
    start();
  }
}
