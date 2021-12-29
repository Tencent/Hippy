import 'package:flutter/material.dart';
import 'package:tencent_voltron_render/voltron_render.dart';

VoltronRenderManager generateManager(BuildContext context, {bool? debugMode}) {
  var initParams = EngineInitParams();
  initParams.iEngineType = EngineType.vue;
  // 可选，是否开启voltron debug模式
  initParams.debugMode = debugMode ?? false;
  // 可选：是否打印引擎的完整的log。默认为false
  initParams.enableLog = true;
  // 可选：debugMode = false 时必须设置coreJSAssetsPath或coreJSFilePath（debugMode = true时，所有jsbundle都是从debug server上下载）
  initParams.coreJSAssetsPath = "jsbundle/vendor.android.js";

  // 可选：Engine Monitor adapter
  initParams.engineMonitor = Monitor();

  return VoltronRenderManager.initRender(initParams, (code, msg) {
    LogUtils.i('loadEngine', 'code($code), msg($msg)');
  });
}

class Monitor extends EngineMonitorAdapter {
  @override
  void performanceCallback(PerformanceData data, int reportCount) {
    // todo 上报

    super.performanceCallback(data, reportCount);
  }

  @override
  bool enableBuildTime = true;

  @override
  bool enablePerformance = true;

  @override
  bool enableCreateElementTime = true;
}

class PageTestWidget extends StatefulWidget {
  final String? bundle;
  final bool debugMode;

  PageTestWidget([this.bundle, this.debugMode = false]);

  @override
  State<StatefulWidget> createState() {
    return _PageTestWidgetState();
  }
}

class _PageTestWidgetState extends State<PageTestWidget> {
  VoltronRenderManager? _renderManager;
  late String _bundle;
  late bool _debugMode;
  Offset offsetA = Offset(20, 300);

  @override
  void initState() {
    _bundle = widget.bundle ?? 'jsbundle/index.android.js';
    _debugMode = widget.debugMode;
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final height = size.height;

    final voltronWidget = Scaffold(
      body: VoltronWidget(
          loadParams: generateParams(_bundle),
          renderGetter: () {
            _renderManager ??= generateManager(context, debugMode: _debugMode);
            return _renderManager!;
          },
          moduleListener: (status, msg, viewModel) {
            LogUtils.i(
                "flutterRender",
                "loadModule status($status), msg"
                    "($msg)");
          }),
    );

    return Material(
        child: _debugMode
            ? Stack(
                children: [
                  voltronWidget,
                  Positioned(
                      left: offsetA.dx,
                      top: offsetA.dy,
                      child: Draggable(
                          //创建可以被拖动的Widget
                          child: FloatingActionButton(
                            child: Icon(Icons.refresh),
                            backgroundColor: Color(0xFF40b883),
                            onPressed: () {
                              Future.delayed(Duration.zero, () {
                                Navigator.pushReplacement(
                                    context,
                                    MaterialPageRoute(
                                        builder: (context) => PageTestWidget(
                                            _bundle, _debugMode)));
                              });
                            },
                          ),
                          //拖动过程中的Widget
                          feedback: FloatingActionButton(
                            child: Icon(Icons.refresh),
                            backgroundColor: Color(0xFF40b883),
                            onPressed: () {
                              Future.delayed(Duration.zero, () {
                                Navigator.pushReplacement(
                                    context,
                                    MaterialPageRoute(
                                        builder: (context) => PageTestWidget(
                                            _bundle, _debugMode)));
                              });
                            },
                          ),
                          //拖动过程中，在原来位置停留的Widget，设定这个可以保留原本位置的残影，如果不需要可以直接设置为Container()
                          childWhenDragging: Container(),

                          // FloatingActionButton(
                          //   tooltip: 'Increment',
                          //   child: Icon(Icons.add), onPressed: () {},
                          // ),
                          //拖动结束后的Widget
                          onDraggableCanceled: (velocity, offset) {
                            // 计算组件可移动范围  更新位置信息
                            setState(() {
                              var x = offset.dx;
                              var y = offset.dy;
                              if (offset.dx < 0) {
                                x = 20;
                              }

                              if (offset.dx > 375) {
                                x = 335;
                              }

                              if (offset.dy < kBottomNavigationBarHeight) {
                                y = kBottomNavigationBarHeight;
                              }

                              if (offset.dy > height - 100) {
                                y = height - 100;
                              }

                              offsetA = Offset(x, y);
                            });
                          })),
                ],
              )
            : voltronWidget);
  }
}

ModuleLoadParams generateParams(String bundle) {
  var loadParams = ModuleLoadParams();

  if (bundle.startsWith('http://') || bundle.startsWith('https://')) {
    loadParams.jsHttpPath = bundle;
  } else {
    loadParams.jsAssetsPath = bundle;
  }

  // 必须：指定要加载的Hippy模块里的组件（component）。componentName对应的是js文件中的"appName"，比如：
  // var hippy = new Voltron({
  //     appName: "Demo",
  //     entryPage: App
  // });
  loadParams.componentName = "Demo";

  // 可选：二选一设置。自己开发的业务模块的jsbundle的文件路径（assets路径和文件路径二选一，优先使用assets路径）
  // debugMode = false 时必须设置jsAssetsPath或jsFilePath
  // （debugMode =true时，所有jsbundle都是从debug server上下载）
  // 可选：发送给Voltron前端模块的参数
  loadParams.jsParams = VoltronMap();
  loadParams.jsParams!.push(
      "msgFromNative",
      "Hi js developer, I come from "
          "native code!");
  return loadParams;
}
