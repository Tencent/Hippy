import 'dart:developer';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../common.dart';
import '../controller.dart';
import '../style.dart';
import '../util.dart';
import '../viewmodel.dart';
import 'animation.dart';
import 'base.dart';

class DivWidget extends FRStatefulWidget {
  final DivRenderViewModel viewModel;

  DivWidget(this.viewModel) : super(viewModel);

  @override
  State<StatefulWidget> createState() {
    return _DivWidgetState();
  }
}

class _DivWidgetState extends FRState<DivWidget> {
  @override
  Widget build(BuildContext context) {
    LogUtils.dWidget('div',
        "type: DivWidget id: ${widget.viewModel.id} name: ${widget.viewModel.name}");
    return ChangeNotifierProvider.value(
      value: widget.viewModel,
      child: divChild(),
    );
  }

  Widget divChild() {
    return Selector<DivRenderViewModel, DivRenderViewModel>(
        selector: (context, viewModel) {
      return DivRenderViewModel.copy(viewModel.id, viewModel.rootId,
          viewModel.name, viewModel.context, viewModel);
    }, builder: (context, viewModel, child) {
      return PositionWidget(
        viewModel,
        child: Selector0<DivContainerViewModel>(
          selector: (context) => viewModel.divContainerViewModel,
          builder: (context, viewModel, _) => DivContainerWidget(viewModel),
        ),
      );
    });
  }
}

class DivContainerWidget extends FRBaseStatelessWidget {
  final DivContainerViewModel _viewModel;
  DivContainerWidget(this._viewModel)
      : super(_viewModel.name, _viewModel.context);

  @override
  Widget build(BuildContext context) {
    var result;
    if (_viewModel.sortedIdList.isEmpty) {
      result = Container();
    } else {
      if (_viewModel.needStack()) {
        var childrenWidget = <Widget>[];
        for (var id in _viewModel.sortedIdList) {
          var childrenViewModel = _viewModel.childrenMap[id];
          if (childrenViewModel != null) {
            childrenWidget.add(generateByViewModel(context, childrenViewModel));
          }
        }

        result = Stack(
            children: childrenWidget,
            clipBehavior: toOverflow(_viewModel.overflow));
      } else {
        var id = _viewModel.sortedIdList[0];
        var childrenViewModel = _viewModel.childrenMap[id];
        if (childrenViewModel != null) {
          result = generateByViewModel(context, childrenViewModel);
        } else {
          result = Container();
        }
      }
    }
    return result;
  }
}

Widget generateByViewModel(
    BuildContext context, RenderViewModel renderViewModel) {
  ControllerManager? controllerManager =
      renderViewModel.context.renderManager.controllerManager;
  var node =
      controllerManager.findNode(renderViewModel.rootId, renderViewModel.id);
  var controller = controllerManager.findController(renderViewModel.name);
  if (node != null && controller != null) {
    var widget = controller.createWidget(context, renderViewModel);
    return widget;
  }

  return Container();
}

class BoxWidget extends FRStatefulWidget {
  final RenderViewModel _viewModel;
  final Widget child;
  final bool isInfinitySize;

  /// 动画属性
  final VoltronMap? animationProperty;

  BoxWidget(this._viewModel,
      {required this.child,
      this.isInfinitySize = false,
      this.animationProperty})
      : super(_viewModel);

  @override
  State<StatefulWidget> createState() {
    return _BoxWidgetState();
  }
}

class _BoxWidgetState extends FRState<BoxWidget> {
  bool _widgetShow = false;

  @override
  Widget build(BuildContext context) {
    final animationProperty = widget.animationProperty;
    var engineMonitor = widget._viewModel.context.engineMonitor;
    if (!engineMonitor.hasAddPostFrameCall) {
      engineMonitor.hasAddPostFrameCall = true;
      WidgetsBinding.instance?.addPostFrameCallback((duration) {
        LogUtils.dWidget(
            "div", 'addPostFrameCallback ${widget._viewModel.id.toString()}');
        var engineMonitor = widget._viewModel.context.engineMonitor;
        engineMonitor.postFrameCallback();
      });
    }
    if (!kReleaseMode && debugProfileBuildsEnabled) {
      Timeline.startSync('[b]_BoxWidgetState',
          arguments: timelineArgumentsIndicatingLandmarkEvent);
    }

    var height = animationProperty?.get<num>(NodeProps.kHeight)?.toDouble() ??
        widget._viewModel.height;
    var width = animationProperty?.get<num>(NodeProps.kWidth)?.toDouble() ??
        widget._viewModel.width;
    if (widget.isInfinitySize) {
      if (height == null) {
        height = double.infinity;
      }
      if (width == null) {
        width = double.infinity;
      }
    }

    if ((width != null && width.isNaN) || (height != null && height.isNaN)) {
      LogUtils.d("BoxWidget",
          "build box widget error, wrong size:(${widget._viewModel.width}, ${widget._viewModel.height})");
      if (!kReleaseMode && debugProfileBuildsEnabled) Timeline.finishSync();
      return Container();
    }

    if (!_widgetShow) {
      if (widget._viewModel.gestureDispatcher.listenAttachedToWindow) {
        widget._viewModel.gestureDispatcher.handleOnAttached();
      }
      _widgetShow = true;
    }

    var current = widget.child;
    final color = animationProperty?.get<Color>(NodeProps.kBackgroundColor) ??
        widget._viewModel.backgroundColor;
    final decoration = widget._viewModel.getDecoration(backgroundColor: color);
    if (decoration != null) {
      current = DecoratedBox(decoration: decoration, child: current);
    } else if (color != null) {
      current = ColoredBox(color: color, child: current);
    }

    current = ConstrainedBox(
        constraints: BoxConstraints.tightFor(width: width, height: height),
        child: current);

    var opacity = animationProperty?.get<num>(NodeProps.kOpacity)?.toDouble() ??
        widget._viewModel.opacity;
    if (opacity != null) {
      current = Opacity(child: current, opacity: opacity);
    }

    if (widget._viewModel.gestureDispatcher.canLongClick == true ||
        widget._viewModel.gestureDispatcher.canClick == true) {
      current = GestureDetector(
        behavior: HitTestBehavior.opaque,
        onLongPress: () =>
            widget._viewModel.gestureDispatcher.handleLongClick(),
        onTap: () => widget._viewModel.gestureDispatcher.handleClick(),
        child: current,
      );
    }

    // if (widget._viewModel.interceptTouchEvent == true) {
    //   current = AbsorbPointer(child: current);
    // }
    if (!kReleaseMode && debugProfileBuildsEnabled) Timeline.finishSync();

    if (widget._viewModel.gestureDispatcher.needListener()) {
      current = Listener(
        behavior: HitTestBehavior.opaque,
        onPointerDown: (event) =>
            widget._viewModel.gestureDispatcher.handleOnTouchEvent(event),
        onPointerCancel: (event) =>
            widget._viewModel.gestureDispatcher.handleOnTouchEvent(event),
        onPointerMove: (event) =>
            widget._viewModel.gestureDispatcher.handleOnTouchEvent(event),
        onPointerUp: (event) =>
            widget._viewModel.gestureDispatcher.handleOnTouchEvent(event),
        child: current,
      );
    }

    // fix: GestureDetector fails, https://github.com/flutter/flutter/issues/6606
    final animationTransform =
        animationProperty?.get<Matrix4>(NodeProps.kTransform);
    final transform = animationTransform ?? widget._viewModel.transform;
    if (transform != null) {
      final animationTransformOrigin =
          animationProperty?.get<TransformOrigin>(NodeProps.kTransformOrigin);
      final transformOrigin =
          animationTransformOrigin ?? widget._viewModel.transformOrigin;
      final origin = transformOrigin.offset;
      final alignment = transformOrigin.alignment;
      current = Transform(
          origin: origin,
          child: current,
          transform: transform,
          alignment: alignment);
    }

    // 如果父级出现 overflow 裁剪，那么就执行裁剪
    var parent = widget._viewModel.parent;
    if (parent != null &&
        !parent.interceptChildPosition() &&
        parent.isOverflowClip) {
      current = ClipRRect(
        borderRadius: parent.toBorderRadius,
        clipBehavior: Clip.hardEdge,
        child: current,
      );
    }

    return current;
  }

  @override
  void deactivate() {
    super.deactivate();
    if (widget._viewModel.gestureDispatcher.listenDetachedFromWindow) {
      widget._viewModel.gestureDispatcher.handleOnDetached();
    }
    _widgetShow = false;
  }
}

class PositionWidget extends FRBaseStatelessWidget {
  final dynamic _viewModel;
  final Widget child;

  PositionWidget(this._viewModel, {required this.child})
      : super(_viewModel.name, _viewModel.context);

  @override
  Widget build(BuildContext context) {
    if (!kReleaseMode && debugProfileBuildsEnabled) {
      Timeline.startSync('[b]PositionWidget',
          arguments: timelineArgumentsIndicatingLandmarkEvent);
    }
    LogUtils.dWidget("PositionWidget",
        "build position widget(${_viewModel.layoutX}, ${_viewModel.layoutY})  id: ${_viewModel.id} name: ${_viewModel.name}");
    Widget result;
    var node = child;
    var parent = _viewModel.parent;
    var isOverflowVisible = false;
    if (parent is GroupViewModel) {
      isOverflowVisible = parent.isOverflowVisible();
    }

    if (parent != null && !parent.interceptChildPosition()) {
      if (_viewModel.layoutX == null ||
          _viewModel.layoutX.isNaN ||
          _viewModel.layoutY == null ||
          _viewModel.layoutY.isNaN) {
        LogUtils.d("PositionWidget",
            "build box widget error, wrong size:(${_viewModel.layoutX}, ${_viewModel.layoutY})");
        result = Container();
      } else if (_viewModel.parent.childCount <= 1 &&
          _viewModel.layoutX >= 0 &&
          _viewModel.layoutY >= 0 &&
          !isOverflowVisible) {
        result = AnimationWidget(node, _viewModel);
      } else {
        result = AnimationWidget(node, _viewModel, true);
      }
    } else {
      result = AnimationWidget(node, _viewModel);
    }

    if (!kReleaseMode && debugProfileBuildsEnabled) Timeline.finishSync();

    return result;
  }
}
