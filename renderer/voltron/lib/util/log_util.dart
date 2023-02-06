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

typedef LogListener = Function(String tag, LogLevel level, String msg);

enum LogLevel { debug, verbose, info, profile, warn, error }

class LogUtils {
  static const String kDefaultTag = "voltron";
  static bool _kDebugEnable = true;
  static bool _kProfileEnable = false;
  static LogListener? _kLogListener;

  static bool kDebugLogDomEnable = true;
  static bool kDebugLogWidgetEnable = true;
  static bool kDebugLogOperateEnable = true;
  static bool kDebugLogRenderEnable = true;
  static bool kDebugLogRenderNodeEnable = true;
  static bool kDebugLogBridgeEnable = true;
  static bool kDebugLogLayoutEnable = true;

  // ignore: use_setters_to_change_properties
  static void enableDebugLog(bool enable) {
    _kDebugEnable = enable;
  }

  // ignore: use_setters_to_change_properties
  static void enableProfileLog(bool enable) {
    _kProfileEnable = enable;
  }

  // ignore: use_setters_to_change_properties
  static void setLogMethod(LogListener? logListener) {
    _kLogListener = logListener;
  }

  static void dRenderNode(String msg) {
    if (kDebugLogRenderNodeEnable && _kDebugEnable) {
      printLog("UINode", LogLevel.debug, msg);
    }
  }

  static void dOperate(String msg) {
    if (kDebugLogOperateEnable && _kDebugEnable) {
      printLog("Operate", LogLevel.debug, msg);
    }
  }

  static void dRender(String msg) {
    if (kDebugLogRenderEnable && _kDebugEnable) {
      printLog("Render", LogLevel.debug, msg);
    }
  }

  static void dLayout(String msg) {
    if (kDebugLogLayoutEnable && _kDebugEnable) {
      printLog("RenderLayout", LogLevel.debug, msg);
    }
  }

  static void dDom(String msg) {
    if (kDebugLogDomEnable && _kDebugEnable) {
      printLog("DOM", LogLevel.debug, msg);
    }
  }

  static void dWidget(String msg) {
    if (kDebugLogWidgetEnable && _kDebugEnable) {
      printLog("Widget", LogLevel.debug, msg);
    }
  }

  static void dBridge(String msg) {
    if (kDebugLogBridgeEnable && _kDebugEnable) {
      printLog("Bridge", LogLevel.debug, msg);
    }
  }

  static void profile(String event, int cost) {
    if (_kProfileEnable) {
      printLog("voltron_profile", LogLevel.profile,
          "voltron profile event:$event, cost:$cost");
    }
  }

  static void log(String msg) {
    if (_kDebugEnable) {
      printLog(kDefaultTag, LogLevel.info, msg);
    }
  }

  static void l(String tag, String msg) {
    if (_kDebugEnable) {
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
    if (_kDebugEnable) {
      printLog(tag, LogLevel.debug, msg);
    }
  }

  static void w(String tag, String msg) {
    if (_kDebugEnable) {
      printLog(tag, LogLevel.warn, msg);
    }
  }

  static void i(String tag, String msg) {
    if (_kDebugEnable) {
      printLog(tag, LogLevel.info, msg);
    }
  }

  static void v(String tag, String msg) {
    if (_kDebugEnable) {
      printLog(tag, LogLevel.verbose, msg);
    }
  }

  static void e(String tag, String msg) {
    printLog(tag, LogLevel.error, msg);
  }

  static void printLog(String tag, LogLevel level, String msg) {
    var sLogListener = _kLogListener;
    if (sLogListener != null) {
      sLogListener("$kDefaultTag _ $tag", level, msg);
    } else {
      print('$kDefaultTag _ $tag($level): $msg');
    }
  }
}
