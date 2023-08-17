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
    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
      systemNavigationBarColor: Color(0XFFE5E5E5),
    ));
  }
  runApp(MyApp());
}

class _MyWidgetInspector with WidgetInspectorService {
  static void init() {
    WidgetInspectorService.instance = _MyWidgetInspector();
  }

  @override
  void addPubRootDirectories(List<String> pubRootDirectories) {
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
    super.addPubRootDirectories(pubRootDirectories);
  }
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      title: 'Voltron Demo',
      home: MyHomePage(),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key});

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0XFFE5E5E5),
      appBar: AppBar(
        title: const Text(
          'Demo',
        ),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Image(
                  height: 50,
                  image: AssetImage('assets/images/logo_1x.png'),
                ),
                Container(
                  margin: const EdgeInsets.only(left: 12),
                  child: const Image(
                    height: 35,
                    image: AssetImage('assets/images/hippy_2x.png'),
                  ),
                ),
              ],
            ),
            Container(
              margin: const EdgeInsets.only(top: 10),
              child: const Text(
                'This is Hippy Demo',
                style: TextStyle(
                  color: Color(0xFF1E304A),
                  fontSize: 17,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            Container(
              margin: const EdgeInsets.only(top: 10),
              child: const Text(
                'Ver: 3.0.0',
                style: TextStyle(
                  color: Color(0xFFA1ACBD),
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ),
            Container(
              margin: const EdgeInsets.only(top: 74),
              width: 300,
              child: const Text(
                '提供极致流畅体验的可复用列表，通过binding模式实现高效的前端-终端通讯',
                style: TextStyle(
                  color: Color(0xFFA1ACBD),
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          showModalBottomSheet(
            context: context,
            builder: (context) {
              return Column(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  ListTile(
                    leading: const Icon(Icons.add),
                    title: const Text('Vue 2.0'),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => BaseVoltronPage(
                            title: 'Vue 2.0',
                            coreBundle: "assets/jsbundle/vue2/vendor.android.js",
                            indexBundle: "assets/jsbundle/vue2/index.android.js",
                          ),
                        ),
                      );
                    },
                  ),
                  ListTile(
                    leading: const Icon(Icons.add),
                    title: const Text('Vue 3.0'),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => BaseVoltronPage(
                            title: 'Vue 3.0',
                            coreBundle: "assets/jsbundle/vue3/vendor.android.js",
                            indexBundle: "assets/jsbundle/vue3/index.android.js",
                          ),
                        ),
                      );
                    },
                  ),
                  ListTile(
                    leading: const Icon(Icons.add),
                    title: const Text('React'),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => BaseVoltronPage(
                            title: 'React',
                            coreBundle: "assets/jsbundle/react/vendor.android.js",
                            indexBundle: "assets/jsbundle/react/index.android.js",
                          ),
                        ),
                      );
                    },
                  ),
                  ListTile(
                    leading: const Icon(Icons.add),
                    title: const Text('Debug模式'),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => BaseVoltronPage(
                            debugMode: true,
                            remoteServerUrl: 'http://localhost:38989/index.bundle',
                          ),
                        ),
                      );
                    },
                  ),
                ],
              );
            },
          );
        },
        tooltip: 'Open New Page',
        child: const Icon(Icons.add),
      ), // This trailing comma makes auto-formatting nicer for build methods.
    );
  }
}
