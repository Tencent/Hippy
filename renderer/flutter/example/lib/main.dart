// @dart=2.9
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

import 'page_test.dart';

void main() {
  _MyWidgetInspector.init();
  // debugProfileBuildsEnabled = true; //向 Timeline 事件中添加 build 信息
  // debugPrintRebuildDirtyWidgets = true; // 记录每帧重建的 widget
  // debugProfilePaintsEnabled = true;
  runApp(MyApp());
}

class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        home: Builder(
            builder: (context) => Scaffold(
                  appBar: AppBar(
                    title: Text('Voltron动态化方案'),
                    backgroundColor: Color(0xFF40b883),
                  ),
                  body: MainPageWidget(),
                )));
  }
}

class MainPageWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
        physics: BouncingScrollPhysics(),
        child: Container(
            alignment: Alignment.topCenter,
            child: Column(mainAxisSize: MainAxisSize.min, children: <Widget>[
              Container(
                width: 350,
                height: 150,
                child: Image.asset('assets/voltron-logo.png'),
              ),
              Card(
                  margin:
                      EdgeInsets.only(left: 10, right: 10, top: 20, bottom: 0),
                  color: Colors.white,
                  child: Container(
                    padding:
                        EdgeInsets.only(top: 12, bottom: 12, left: 8, right: 8),
                    child: Column(
                      children: [
                        Text('官方Demo',
                            style: TextStyle(
                                fontSize: 32, fontWeight: FontWeight.bold)),
                        ButtonBar(
                          buttonHeight: 50,
                          alignment: MainAxisAlignment.center,
                          children: [
                            TextButton(
                                onPressed: () {
                                  Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                          builder: (context) =>
                                              PageTestWidget()));
                                },
                                child: Text('进入体验'))
                          ],
                        )
                      ],
                    ),
                  )),
              Card(
                  margin:
                      EdgeInsets.only(left: 10, right: 10, top: 20, bottom: 40),
                  color: Colors.white,
                  child: Container(
                      padding: EdgeInsets.only(
                          top: 12, bottom: 12, left: 8, right: 8),
                      child: Column(
                        children: [
                          Text('本地调试',
                              style: TextStyle(
                                  fontSize: 32, fontWeight: FontWeight.bold)),
                          SizedBox(
                            height: 20,
                          ),
                          SizedBox(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.start,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('1. 使用usb线链接Android手机和电脑，并启动Voltron'),
                                Text('2. 前端项目执行npm install安装依赖'),
                                Text('3. 前端项目执行npm run voltron:dev编译调试包'),
                                Text(
                                    '4. 前端项目执行npm run voltron:debug链接手机并启动调试服务'),
                                Text('5. 点击下方开始调试进入调试页面'),
                                Text(
                                    '6. 打开chrome://inspect，需要确保localhost:38989在Discover network targets右侧的Configuration弹窗中，下方会出现设备列表，点击inspect开始调试'),
                              ],
                            ),
                          ),
                          ButtonBar(
                            alignment: MainAxisAlignment.center,
                            children: [
                              TextButton(
                                  onPressed: () {
                                    Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                            builder: (context) => PageTestWidget(
                                                'http://localhost:38989/index.bundle',
                                                true)));
                                  },
                                  child: Text('进入调试'))
                            ],
                          )
                        ],
                      ))),
            ])));
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
        pubRootDirectories.add(dir.replaceFirst('flutter/example', 'flutter'));
        break;
      }
    }
    super.setPubRootDirectories(pubRootDirectories);
  }
}
