//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2019 THL A29 Limited, a Tencent company.
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

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:voltron_renderer/engine/loader.dart';

import '../common.dart';
import '../render.dart';
import '../style.dart';
import '../util.dart';
import 'base.dart';

class RootWidgetViewModel extends ChangeNotifier {
  static const int kRootViewTagIncrement = 100000;

  final GlobalKey rootKey = GlobalKey(debugLabel: NodeProps.kRootNode);

  static int sIdCounter = 0;

  OnSizeChangedListener? _sizeChangListener;

  final int _instanceId = kRootViewTagIncrement + sIdCounter++;

  OnResumeAndPauseListener? _onResumeAndPauseListener;

  OnLoadCompleteListener? _onLoadCompleteListener;

  bool _loadCompleted = false;

  bool _loadError = false;

  int get id => _instanceId;

  ContextWrapper? _wrapper;

  Orientation? _orientation;

  IRenderExecutor? executor;

  List<IRenderExecutor> viewExecutorList = [];

  late IRenderExecutor viewExecutor;

  RenderContext? _context;

  TimeMonitor? timeMonitor;

  RootWidgetViewModel() {
    viewExecutor = () {
      if (viewExecutorList.isNotEmpty) {
        for (var element in viewExecutorList) {
          element();
        }
      }
    };
  }

  void attachToEngine(RenderContext context) {
    _context = context;
    checkUpdateDimension(-1, -1, false, false);
  }

  void onLoadError() {
    _loadError = true;
    _loadCompleted = true;
    notifyChange();
  }

  BuildContext? get currentContext => _wrapper?.call();

  bool get loadError => _loadError;

  bool get loadFinish => _loadCompleted;

  RenderTree? get renderTree => _context?.renderManager.controllerManager.findTree(id);

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
          onLoadCompleteListener(
            _timeMonitor.totalTime,
            _timeMonitor.events,
          );
        }
        _context?.engineMonitor.reportModuleLoadComplete(
          this,
          _timeMonitor.totalTime,
          _timeMonitor.events,
        );
      }
    }
  }

  void onSizeChanged(
    int rootId,
    double width,
    double height,
    double oldWidth,
    double oldHeight,
  ) {
    if (_loadCompleted) {
      _sizeChangListener?.onSizeChanged(
        rootId,
        width,
        height,
        oldWidth,
        oldHeight,
      );
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

  void checkUpdateDimension(
    int windowWidth,
    int windowHeight,
    bool shouldUseScreenDisplay,
    bool systemUiVisibilityChanged,
  ) {
    var uiContext = currentContext;
    if (_context == null && uiContext != null) {
      return;
    }

    var dimensionMap = getDimensions(
      windowWidth,
      windowHeight,
      shouldUseScreenDisplay,
      uiContext,
    );
    _context?.dimensionChecker.checkUpdateDimension(
      uiContext!,
      dimensionMap,
      windowWidth,
      windowHeight,
      shouldUseScreenDisplay,
      systemUiVisibilityChanged,
    );
  }
}

class VoltronWidget extends StatefulWidget {
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

  final RendererLoader loader;

  const VoltronWidget({
    Key? key,
    required this.loader,
    this.loadingWidget,
    this.errorWidget,
    this.emptyWidget,
    this.resizedHeight = false,
    this.height = -1,
  }) : super(key: key);

  @override
  State<StatefulWidget> createState() {
    return _VoltronWidgetState();
  }
}

class _VoltronWidgetState extends State<VoltronWidget> {
  Size? oldSize;
  final RootWidgetViewModel viewModel = RootWidgetViewModel();

  Orientation? _orientation;
  double? _curHeight;
  double? _curWidth;
  bool hasDispose = false;

  _VoltronWidgetState();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance?.addPostFrameCallback(doFirstFrame);
    // viewModel!.executor = doFrame;
    viewModel._wrapper = () => context;
    hasDispose = false;
  }

  @override
  void didUpdateWidget(VoltronWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.loader != oldWidget.loader) {
      WidgetsBinding.instance?.addPostFrameCallback(doFirstFrame);
    }
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
          return !(widget.loader.back(() {
            Navigator.of(context).pop();
          }));
        },
        child: ChangeNotifierProvider.value(
            value: viewModel, child: _contentWithHeightByRepaint(height)));
  }

  Widget _contentWithHeightByRepaint(double height) {
    // 需要使用RepaintBoundary包裹，以便获取当前的页面快照
    return RepaintBoundary(
        key: viewModel.rootKey,
        child: SizedBox(width: double.infinity, height: height, child: _contentWithStatus()));
  }

  Widget _contentWithStatus() {
    return Consumer<RootWidgetViewModel>(builder: (context, viewModel, widget) {
      var model = LoadingModel(!(viewModel.loadFinish), viewModel.loadError);
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
      children: const [
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
    return const Center(child: Text("Load error"));
  }

  Widget _empty() {
    var emptyWidget = widget.emptyWidget;
    if (emptyWidget != null) {
      return emptyWidget;
    }
    return const Center(child: Text("Empty page"));
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
    return childNode.findController().createWidget(context, childNode.renderViewModel);
  }

  void _loadModule() {
    LogUtils.i("root_widget", "start to load module");
    widget.loader.load(viewModel);
  }

  void doFirstFrame(Duration timeStamp) {
    _loadModule();
  }

  void doFrame() {
    if (!hasDispose) {
      viewModel.onGlobalLayout();

      final RenderBox? renderBox =
          viewModel.rootKey.currentContext?.findRenderObject() as RenderBox;
      var newSize = renderBox?.size;

      if (newSize != null) {
        var originOldSize = oldSize;
        if (originOldSize == null ||
            originOldSize.width != newSize.width ||
            originOldSize.height != newSize.height) {
          viewModel.onSizeChanged(
            viewModel.id,
            newSize.width,
            newSize.height,
            originOldSize?.width ?? 0,
            originOldSize?.height ?? 0,
          );
          oldSize = Size(
            newSize.width,
            newSize.height,
          );
        }
      }
    }
  }

  @override
  void dispose() {
    super.dispose();
    viewModel.dispose();
    hasDispose = true;
  }
}

typedef OnLoadCompleteListener = Function(int loadTime, List<EngineMonitorEvent> loadEvents);

mixin OnSizeChangedListener {
  void onSizeChanged(int rootId, double width, double height, double oldWidth, double oldHeight);
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
      other is LoadingModel && other.isLoading == isLoading && other.isError == isError;

  @override
  int get hashCode => isLoading.hashCode | isError.hashCode;
}
