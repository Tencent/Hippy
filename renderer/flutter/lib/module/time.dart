import 'dart:async';
import 'dart:collection';

import '../engine.dart';
import 'module.dart';
import 'promise.dart';

class TimeModule extends VoltronNativeModule
    implements EngineLifecycleEventListener {
  static const kTimerModuleName = "TimerModule";
  static const String kFuncSetTimeout = "setTimeout";
  static const String kFuncClearTimeout = "clearTimeout";
  static const String kFuncSetInterval = "setInterval";
  static const String kFuncClearInterval = "clearInterval";

  final HashMap<String, TimerTask> _timeInfo = HashMap();

  TimeModule(EngineContext context) : super(context) {
    context.addEngineLifecycleEventListener(this);
  }

  @override
  Map<String, Function> get extraFuncMap => {
        kFuncSetTimeout: setTimeout,
        kFuncClearTimeout: clearTimeout,
        kFuncSetInterval: setInterval,
        kFuncClearInterval: clearInterval
      };

  @override
  String get moduleName => kTimerModuleName;

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

  @VoltronMethod(kFuncSetTimeout)
  bool setTimeout(int timeOut, String callId, JSPromise promise) {
    var timer = TimerTask(timeOut, false, callId, (task) {
      promise.resolve("");
      _timeInfo.remove(task);
    });
    _timeInfo[callId] = timer;
    timer.start();
    return true;
  }

  @VoltronMethod(kFuncClearTimeout)
  bool clearTimeout(String callId, JSPromise promise) {
    var task = _timeInfo[callId];
    task?.stop();
    _timeInfo.remove(callId);
    return false;
  }

  @VoltronMethod(kFuncSetInterval)
  bool setInterval(int interval, String callId, JSPromise promise) {
    var timer = TimerTask(interval, true, callId, (task) {
      promise.resolve("");
    });
    _timeInfo[callId] = timer;
    timer.start();
    return true;
  }

  @VoltronMethod(kFuncClearInterval)
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
