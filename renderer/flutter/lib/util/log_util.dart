typedef LogListener = Function(String tag, LogLevel level, String msg);

enum LogLevel { debug, verbose, info, profile, warn, error }

class LogUtils {
  static const String defaultTag = "flutter_render";
  static bool _sDebugEnable = false;
  static bool _sProfileEnable = false;
  static LogListener? _sLogListener;

  static bool sDebugLogDomEnable = true;
  static bool sDebugLogWidgetEnable = false;
  static bool sDebugLogRenderEnable = true;
  static bool sDebugLogRenderNodeEnable = true;
  static bool sDebugLogBridgeEnable = false;
  static bool sDebugLogLayoutEnable = true;

  // ignore: use_setters_to_change_properties
  static void enableDebugLog(bool enable) {
    _sDebugEnable = enable;
  }

  // ignore: use_setters_to_change_properties
  static void enableProfileLog(bool enable) {
    _sProfileEnable = enable;
  }

  // ignore: use_setters_to_change_properties
  static void setLogMethod(LogListener? logListener) {
    _sLogListener = logListener;
  }

  static void dRenderNode(String msg) {
    if (sDebugLogRenderNodeEnable && _sDebugEnable) {
      printLog("UINode", LogLevel.debug, msg);
    }
  }

  static void dRender(String msg) {
    if (sDebugLogRenderEnable && _sDebugEnable) {
      printLog("Render", LogLevel.debug, msg);
    }
  }

  static void dLayout(String msg) {
    if (sDebugLogLayoutEnable && _sDebugEnable) {
      printLog("RenderLayout", LogLevel.debug, msg);
    }
  }

  static void dDom(String msg) {
    if (sDebugLogDomEnable && _sDebugEnable) {
      printLog("DOM", LogLevel.debug, msg);
    }
  }

  static void dWidget(String tag, String msg) {
    if (sDebugLogWidgetEnable && _sDebugEnable) {
      printLog(tag, LogLevel.debug, msg);
    }
  }

  static void dBridge(String msg) {
    if (sDebugLogBridgeEnable && _sDebugEnable) {
      printLog("Bridge", LogLevel.debug, msg);
    }
  }

  static void profile(String event, int cost) {
    if (_sProfileEnable) {
      printLog("voltron_profile", LogLevel.profile,
          "voltron profile event:$event, cost:$cost");
    }
  }

  static void log(String msg) {
    if (_sDebugEnable) {
      printLog(defaultTag, LogLevel.info, msg);
    }
  }

  static void l(String tag, String msg) {
    if (_sDebugEnable) {
      var index = 0; // 当前位置
      var max = 3800; // 需要截取的最大长度,别用4000
      String sub; // 进行截取操作的string
      while (index < msg.length) {
        if (msg.length < max) {
          // 如果长度比最大长度小
          max = msg.length; // 最大长度设为length,全部截取完成.
          sub = msg.substring(index, max);
        } else {
          sub = msg.substring(index, max);
        }
        printLog(tag, LogLevel.info, sub);
        index = max;
        max += 3800;
      }
    }
  }

  static void d(String tag, String msg) {
    if (_sDebugEnable) {
      printLog(tag, LogLevel.debug, msg);
    }
  }

  static void w(String tag, String msg) {
    if (_sDebugEnable) {
      printLog(tag, LogLevel.warn, msg);
    }
  }

  static void i(String tag, String msg) {
    if (_sDebugEnable) {
      printLog(tag, LogLevel.info, msg);
    }
  }

  static void v(String tag, String msg) {
    if (_sDebugEnable) {
      printLog(tag, LogLevel.verbose, msg);
    }
  }

  static void e(String tag, String msg) {
    printLog(tag, LogLevel.error, msg);
  }

  static void printLog(String tag, LogLevel level, String msg) {
    var sLogListener = _sLogListener;
    if (sLogListener != null) {
      sLogListener("FlutterRender_$tag", level, msg);
    } else {
      print('FlutterRender_$tag($level): $msg');
    }
  }
}
