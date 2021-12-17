import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../adapter/monitor.dart';
import '../common/voltron_map.dart';
import '../engine/context.dart';
import '../engine/engine_context.dart';
import '../engine/engine_define.dart';
import '../engine/module_params.dart';
import '../engine/voltron_engine.dart';
import '../module/dimensions.dart';
import '../module/module.dart';
import '../render/manager.dart';
import '../render/node.dart';
import '../render/tree.dart';
import '../style/prop.dart';
import '../util/dimension_util.dart';
import '../util/enum_util.dart';
import '../util/log_util.dart';
import '../util/screen_util.dart';
import '../voltron/manager.dart';
import 'base.dart';

class RootWidgetViewModel extends ChangeNotifier {
  static const int rootViewTagIncrement = 100000;

  final GlobalKey rootKey = GlobalKey(debugLabel: NodeProps.rootNode);

  static int sIdCounter = 0;

  OnSizeChangedListener? _sizeChangListener;

  final int _instanceId = rootViewTagIncrement + sIdCounter++;

  late ModuleLoadParams _loadParams;

  EngineContext? _engineContext;

  OnResumeAndPauseListener? _onResumeAndPauseListener;

  OnLoadCompleteListener? _onLoadCompleteListener;

  TimeMonitor? timeMonitor;

  bool _loadCompleted = false;

  bool _loadError = false;

  int get id => _instanceId;

  InstanceContext? _instanceContext;

  ContextWrapper? _wrapper;

  Orientation? _orientation;

  IRenderExecutor? executor;

  List<IRenderExecutor> viewExecutorList = [];

  late IRenderExecutor viewExecutor;

  RootWidgetViewModel(ModuleLoadParams loadParams) {
    _instanceContext = loadParams.instanceContext;
    if (_instanceContext == null) {
      _instanceContext = InstanceContext(loadParams);
    }
    _loadParams = loadParams;
    viewExecutor = () {
      if (viewExecutorList.isNotEmpty) {
        for (var element in viewExecutorList) {
          element();
        }
      }
    };
  }

  void attachToEngine(EngineContext context) {
    _engineContext = context;
    instanceContext?.setEngineContext(context);
    checkUpdateDimension(-1, -1, false, false);
  }

  void attachEngineManager(VoltronEngine engineManager) {
    instanceContext?.attachEngineManager(engineManager);
  }

  void onLoadError() {
    _loadError = true;
    _loadCompleted = true;
    notifyChange();
  }

  VoltronMap? get launchParams => _loadParams.jsParams;

  EngineContext? get engineContext => _engineContext;

  InstanceContext? get instanceContext => _instanceContext;

  BuildContext? get currentContext => _wrapper?.call();

  bool get loadError => _loadError;

  bool get loadFinish => _loadCompleted;

  RenderTree? get renderTree =>
      engineContext?.renderManager.controllerManager.findTree(id);

  set onSizeChangedListener(OnSizeChangedListener? listener) {
    _sizeChangListener = listener;
  }

  set onResumeAndPauseListener(OnResumeAndPauseListener? listener) {
    _onResumeAndPauseListener = listener;
  }

  set onLoadCompleteListener(OnLoadCompleteListener listener) {
    _onLoadCompleteListener = listener;
  }

  void onResume() {
    _onResumeAndPauseListener?.onInstanceResume(id);
  }

  void onPause() {
    _onResumeAndPauseListener?.onInstancePause(id);
  }

  String get name => _loadParams.componentName;

  void destroy() {
    _wrapper = null;
  }

  void notifyChange() {
    notifyListeners();
    WidgetsBinding.instance?.scheduleFrame();
  }

  // RootView上添加View了，说明jsBundle正常工作了
  void onViewAdd() {
    if (!_loadCompleted) {
      _loadCompleted = true;
      notifyChange();
      var _timeMonitor = timeMonitor;
      if (_timeMonitor != null) {
        _timeMonitor.end();
        var onLoadCompleteListener = _onLoadCompleteListener;
        if (onLoadCompleteListener != null) {
          onLoadCompleteListener(_timeMonitor.totalTime, _timeMonitor.events);
        }
        _engineContext?.globalConfigs.monitorAdapter?.reportModuleLoadComplete(
            this, _timeMonitor.totalTime, _timeMonitor.events);
      }
    }
  }

  void onSizeChanged(int rootId, double width, double height, double oldWidth,
      double oldHeight) {
    if (_loadCompleted) {
      _sizeChangListener?.onSizeChanged(
          rootId, width, height, oldWidth, oldHeight);
    }
  }

  void onGlobalLayout() {
    var uiContext = currentContext;
    if (_loadCompleted) {
      if (uiContext != null) {
        var curOrientation = ScreenUtil.getOrientation(uiContext);

        if (curOrientation != _orientation) {
          _orientation = curOrientation;
          checkUpdateDimension(-1, -1, false, false);
        }
      }
    }
  }

  void checkUpdateDimension(int windowWidth, int windowHeight,
      bool shouldUseScreenDisplay, bool systemUiVisibilityChanged) {
    var uiContext = currentContext;
    if (_engineContext == null && uiContext != null) {
      return;
    }

    var dimensionMap = getDimensions(
        windowWidth, windowHeight, shouldUseScreenDisplay, uiContext);
    // 如果windowHeight是无效值，则允许客户端定制
    if (windowHeight < 0 && _engineContext?.globalConfigs != null) {
      var deviceAdapter = _engineContext?.globalConfigs.deviceAdapter;
      if (deviceAdapter != null) {
        deviceAdapter.reviseDimensionIfNeed(uiContext, dimensionMap,
            shouldUseScreenDisplay, systemUiVisibilityChanged);
      }
    }
    _engineContext?.moduleManager
        .getJavaScriptModule<Dimensions>(
            enumValueToString(JavaScriptModuleType.Dimensions))
        ?.set(dimensionMap);
  }
}

typedef FlutterRenderGetter = VoltronRenderManager Function();

class VoltronWidget extends StatefulWidget {
  // load参数
  final ModuleLoadParams loadParams;

  // 获取flutter render
  final FlutterRenderGetter renderGetter;

  // load module回调
  final ModuleListener? moduleListener;

  // 加载完成回调
  final OnLoadCompleteListener? onLoadCompleteListener;

  // 页面加载过程中的loading widget
  final Widget? loadingWidget;

  // 页面加载错误widget
  final Widget? errorWidget;

  // 空页面展示widget
  final Widget? emptyWidget;

  // 是否支持可变高度，为false时，在仅高度变化，宽不变的场景下，父布局size保证第一次测量高度
  // 设置为true的情况下，会导致input组件无法自动滚动
  final bool resizedHeight;

  // 固定高度模式，height > 0的情况下，会使用固定高度，即高度不跟随外面布局变化
  final double height;

  VoltronWidget(
      {required this.loadParams,
      required this.renderGetter,
      this.moduleListener,
      this.onLoadCompleteListener,
      this.loadingWidget,
      this.errorWidget,
      this.emptyWidget,
      this.resizedHeight = false,
      this.height = -1});

  @override
  State<StatefulWidget> createState() {
    return _VoltronWidgetState();
  }
}

class _VoltronWidgetState extends State<VoltronWidget> {
  Size? oldSize;
  RootWidgetViewModel? viewModel;

  Orientation? _orientation;
  double? _curHeight;
  double? _curWidth;
  bool hasDispose = false;

  _VoltronWidgetState();

  @override
  void initState() {
    super.initState();
    viewModel = RootWidgetViewModel(widget.loadParams);
    WidgetsBinding.instance?.addPostFrameCallback(doFirstFrame);
    // viewModel!.executor = doFrame;
    viewModel!._wrapper = () {
      return context;
    };
    hasDispose = false;
  }

  @override
  Widget build(BuildContext context) {
    LogUtils.i("root_widget", "build root widget");
    return LayoutBuilder(builder: (context, constraints) {
      if (hasDispose) {
        return _empty();
      }
      if (widget.resizedHeight) {
        // 高度自适应外层布局模式
        // 此模式下，会出现键盘弹起后，输入框不跟随键盘顶起的问题
        // 即输入框会被键盘遮挡
        return _contentWithHeight(constraints.maxHeight);
      } else {
        if (widget.height > 0) {
          // 固定高度模式
          // 布局高度直接由外部的高度决定
          return _contentWithHeight(widget.height);
        } else {
          // 高度部分自适应模式
          // 仅当宽高都发生变化，或者屏幕旋转后，才修改高度
          var newHeight = constraints.maxHeight;
          var newWidth = constraints.maxWidth;
          var newOrientation = ScreenUtil.getOrientation(context);
          if (_orientation == null || _curWidth == null || _curHeight == null) {
            _curWidth = newWidth;
            _curHeight = newHeight;
            _orientation = newOrientation;
          } else {
            if (_curWidth != newWidth || _orientation != newOrientation) {
              // 当宽度不等或者屏幕方向发生改变时，直接重设高度值
              _curWidth = newWidth;
              _curHeight = newHeight;
              _orientation = newOrientation;
            }
          }
          return _contentWithHeight(_curHeight!);
        }
      }
    });
  }

  Widget _contentWithHeight(double height) {
    return WillPopScope(
        onWillPop: () async {
          return !(widget.renderGetter().onBackPress(() {
            Navigator.of(context).pop();
          }));
        },
        child: ChangeNotifierProvider.value(
            value: viewModel, child: _contentWithHeightByRepaint(height)));
  }

  Widget _contentWithHeightByRepaint(double height) {
    // TODO: 暂时无法在engine初始化前获取isDevModule的值，因此暂时固定为true，后续进行修改
    final isDevModule = true;
    // final isDevModule = viewModel?.engineContext?.bridgeManager.isDevModule == true;
    /// 开发环境，需要使用RepaintBoundary包裹，以便获取当前的页面快照
    if (isDevModule) {
      return RepaintBoundary(
          key: viewModel?.rootKey,
          child: Container(
              width: double.infinity,
              height: height,
              child: _contentWithStatus()));
    }

    return Container(
        key: viewModel?.rootKey,
        width: double.infinity,
        height: height,
        child: _contentWithStatus());
  }

  Widget _contentWithStatus() {
    return Consumer<RootWidgetViewModel?>(
        builder: (context, viewModel, widget) {
      var model = LoadingModel(
          !(viewModel?.loadFinish ?? false), viewModel?.loadError ?? false);
      LogUtils.dWidget("root_widget", "build content start");
      if (model.isLoading) {
        LogUtils.dWidget("root_widget", "build content loading");
        return _loading();
      } else if (model.isError) {
        LogUtils.dWidget("root_widget", "build content error");
        return _error();
      } else {
        LogUtils.dWidget("root_widget", "build content");
        return _content(viewModel);
      }
    });
  }

  Widget _loading() {
    var loadingWidget = widget.loadingWidget;
    if (loadingWidget != null) {
      return loadingWidget;
    }
    return Center(
        child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        CircularProgressIndicator(),
        Text("Loading"),
      ],
    ));
  }

  Widget _error() {
    var errorWidget = widget.errorWidget;
    if (errorWidget != null) {
      return errorWidget;
    }
    return Center(child: Text("Load error"));
  }

  Widget _empty() {
    var emptyWidget = widget.emptyWidget;
    if (emptyWidget != null) {
      return emptyWidget;
    }
    return Center(child: Text("Empty page"));
  }

  Widget _content(RootWidgetViewModel? viewModel) {
    LogUtils.dWidget("root_widget", "create root widget content, build");
    var nodeList = <RenderNode>[];
    var tree = viewModel?.renderTree;
    if (tree != null) {
      var rootNode = tree.rootNode;
      if (rootNode != null && rootNode.childCount > 0) {
        nodeList.addAll(rootNode.children);
      }
    }

    if (nodeList.isNotEmpty) {
      return _container(context, nodeList);
    } else {
      return _empty();
    }
  }

  Widget _container(BuildContext context, List<RenderNode> childList) {
    var childrenWidget = <Widget>[];
    for (var element in childList) {
      childrenWidget.add(_generateByRenderNode(context, element));
    }
    return Stack(children: childrenWidget);
  }

  Widget _generateByRenderNode(BuildContext context, RenderNode childNode) {
    return childNode
        .findController()
        .createWidget(context, childNode.renderViewModel);
  }

  void _loadModule() {
    LogUtils.i("root_widget", "start to load module");
    if (viewModel != null) {
      widget.renderGetter().loadModule(widget.loadParams, viewModel!,
          moduleListener: widget.moduleListener,
          onLoadCompleteListener: widget.onLoadCompleteListener);
    }
  }

  void doFirstFrame(Duration timeStamp) {
    _loadModule();
  }

  void doFrame() {
    var originViewModel = viewModel;
    if (originViewModel != null && !hasDispose) {
      originViewModel.onGlobalLayout();

      final RenderBox? renderBox = originViewModel.rootKey.currentContext
          ?.findRenderObject() as RenderBox;
      var newSize = renderBox?.size;

      if (newSize != null) {
        var originOldSize = oldSize;
        if (originOldSize == null ||
            originOldSize.width != newSize.width ||
            originOldSize.height != newSize.height) {
          originViewModel.onSizeChanged(
              originViewModel.id,
              newSize.width,
              newSize.height,
              originOldSize?.width ?? 0,
              originOldSize?.height ?? 0);
          oldSize = Size(newSize.width, newSize.height);
        }
      }
    }
  }

  @override
  void dispose() {
    super.dispose();

    var originViewModel = viewModel;
    if (originViewModel != null) {
      widget.renderGetter().destroyInstance(originViewModel);
      originViewModel.dispose();
    }
    widget.renderGetter().destroy();
    hasDispose = true;
  }
}

typedef OnLoadCompleteListener = Function(
    int loadTime, List<EngineMonitorEvent> loadEvents);

mixin OnSizeChangedListener {
  void onSizeChanged(int rootId, double width, double height, double oldWidth,
      double oldHeight);
}

// typedef OnSizeChangedListener = void Function(int rootId, double width, double height, double oldWidth, double oldHeight);

abstract class OnResumeAndPauseListener {
  void onInstanceResume(int id);

  void onInstancePause(int id);
}

abstract class GlobalLayoutListener {
  void onSystemUiVisibilityChange(int visibility);

  void onGlobalLayout();
}

class LoadingModel {
  final bool isLoading;
  final bool isError;

  const LoadingModel(this.isLoading, this.isError);

  @override
  bool operator ==(Object other) =>
      other is LoadingModel &&
      other.isLoading == isLoading &&
      other.isError == isError;

  @override
  int get hashCode => isLoading.hashCode | isError.hashCode;
}
