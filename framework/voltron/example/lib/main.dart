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

import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'base_voltron_page.dart';

void main() {
  _MyWidgetInspector.init();
  // debugProfileBuildsEnabled = true; //向 Timeline 事件中添加 build 信息
  // debugPrintRebuildDirtyWidgets = true; // 记录每帧重建的 widget
  // debugProfilePaintsEnabled = true;
  if (Platform.isAndroid) {
    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle.light.copyWith(
      statusBarColor: Colors.black,
    ));
  }
  runApp(MyApp());
}

class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

enum PageStatus {
  init,
  loading,
  success,
  error,
}

class _MyAppState extends State<MyApp> {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: BaseVoltronPage(
        isHome: true,
        coreBundle: "assets/jsbundle/vendor.android.js",
        indexBundle: "assets/jsbundle/index.android.js",
      ),
    );
  }
}

class _MyWidgetInspector with WidgetInspectorService {
  static void init() {
    WidgetInspectorService.instance = _MyWidgetInspector();
  }

  @override
  void setPubRootDirectories(List<String> pubRootDirectories) {
    for (final dir in pubRootDirectories) {
      if (dir.contains('flutter/example')) {
        pubRootDirectories.add(dir.replaceFirst(
          'flutter/example',
          'flutter',
        ));
        pubRootDirectories.add(dir.replaceFirst(
          'driver/js/flutter/example',
          'renderer/flutter',
        ));
        break;
      }
      if (dir.contains('driver/js/flutter')) {
        pubRootDirectories.add(dir.replaceFirst(
          'driver/js/flutter',
          'renderer/flutter',
        ));
        break;
      }
    }
    super.setPubRootDirectories(pubRootDirectories);
  }
}
