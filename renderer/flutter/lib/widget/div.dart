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

import 'dart:developer';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../controller.dart';
import '../style.dart';
import '../util.dart';
import '../viewmodel.dart';
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
    LogUtils.dWidget('div', "type: DivWidget(${widget.viewModel.idDesc})");
    return ChangeNotifierProvider.value(
      value: widget.viewModel,
      child: divChild(),
    );
  }

  Widget divChild() {
    return Consumer<DivRenderViewModel>(builder: (context, viewModel, child) {
      return PositionWidget(
        viewModel,
        child: Selector<DivRenderViewModel, DivContainerViewModel>(
          selector: (context, viewModel) => DivContainerViewModel(viewModel),
          builder: (context, viewModel, _) => DivContainerWidget(viewModel),
        ),
      );
    });
  }
}

class DivContainerWidget extends FRBaseStatelessWidget {
  final DivContainerViewModel _viewModel;

  DivContainerWidget(
    this._viewModel, {
    Key? key,
  }) : super(_viewModel.name, _viewModel.context, key: key);

  @override
  Widget build(BuildContext context) {
    Widget result;
    if (_viewModel.sortedIdList.isEmpty) {
      result = Container();
    } else {
      var childrenWidget = <Widget>[];
      for (var id in _viewModel.sortedIdList) {
        var childrenViewModel = _viewModel.childrenMap[id];
        if (childrenViewModel != null) {
          childrenWidget.add(
            generateByViewModel(
              context,
              childrenViewModel,
            ),
          );
        }
      }
      result = Stack(
        children: childrenWidget,
        clipBehavior: toOverflow(_viewModel.overflow),
      );
    }
    return result;
  }
}

Widget generateByViewModel(
    BuildContext context, RenderViewModel renderViewModel) {
  ControllerManager? controllerManager =
      renderViewModel.context.renderManager.controllerManager;
  var controller = controllerManager.findController(renderViewModel.name);
  if (controller != null) {
    var widget = controller.createWidget(context, renderViewModel);
    return widget;
  }

  return Container();
}

class BoxWidget extends FRStatefulWidget {
  final RenderViewModel _viewModel;
  final Widget child;

  BoxWidget(
    this._viewModel, {
    required this.child,
  }) : super(_viewModel);

  @override
  State<StatefulWidget> createState() {
    return _BoxWidgetState();
  }
}

class _BoxWidgetState extends FRState<BoxWidget> {
  bool _widgetShow = false;

  @override
  Widget build(BuildContext context) {
    var engineMonitor = widget._viewModel.context.engineMonitor;
    if (!(engineMonitor.hasAddPostFrameCall)) {
      engineMonitor.hasAddPostFrameCall = true;
      WidgetsBinding.instance.addPostFrameCallback((duration) {
        LogUtils.dWidget(
          "div",
          'addPostFrameCallback ${widget._viewModel.id.toString()}',
        );
        var engineMonitor = widget._viewModel.context.engineMonitor;
        engineMonitor.postFrameCallback();
      });
    }
    if (!kReleaseMode && debugProfileBuildsEnabled) {
      Timeline.startSync('[b]_BoxWidgetState',
          arguments: timelineArgumentsIndicatingLandmarkEvent);
    }

    final width = widget._viewModel.width;
    final height = widget._viewModel.height;
    if (widget._viewModel.noSize) {
      LogUtils.d(
        "BoxWidget",
        "build box widget error, wrong size:($width, $height), node:${widget._viewModel.idDesc}",
      );
      if (!kReleaseMode && debugProfileBuildsEnabled) Timeline.finishSync();
      return const SizedBox(
        width: 0,
        height: 0,
      );
    }

    if (!_widgetShow) {
      if (widget._viewModel.gestureDispatcher.listenAttachedToWindow) {
        widget._viewModel.gestureDispatcher.handleOnAttached();
      }
      _widgetShow = true;
    }

    var current = widget.child;

    /// 1. if not a container with child(exp View, ScrollView), add padding for border in box model
    var innerBoxMargin = widget._viewModel.getInnerBoxMargin();
    if (widget._viewModel.withBoxPadding && innerBoxMargin != null) {
      current = Padding(
        padding: innerBoxMargin,
        child: current,
      );
    }

    /// 2. add foreground - border
    final foregroundDeco = widget._viewModel.getForegroundDecoration();
    if (foregroundDeco != null) {
      current = DecoratedBox(
        decoration: foregroundDeco,
        position: DecorationPosition.foreground,
        child: current,
      );
    }

    /// 3. add background - color, image, gradient, box-shadow ...
    final color = widget._viewModel.backgroundColor;
    final decoration = widget._viewModel.getDecoration(backgroundColor: color);
    if (decoration != null) {
      // use DecoratedBox, [Container] insets its child by the widths of the borders; this widget does not
      current = DecoratedBox(
        position: DecorationPosition.background,
        decoration: decoration,
        child: current,
      );
    } else if (color != null) {
      current = ColoredBox(
        color: color,
        child: current,
      );
    }

    /// 4. use UnconstrainedBox make child is able to bugger than parent
    current = UnconstrainedBox(
      alignment: Alignment.topLeft,
      child: SizedBox(
        width: width,
        height: height,
        child: current,
      ),
    );

    /// 5. add opacity
    final opacity = widget._viewModel.opacity;
    if (opacity != null) {
      current = Opacity(
        child: current,
        opacity: opacity,
      );
    }

    if (!kReleaseMode && debugProfileBuildsEnabled) Timeline.finishSync();

    /// 6. add touch listener and gesture, necessary both or none because of event bubble
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
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onLongPress: () =>
              widget._viewModel.gestureDispatcher.handleLongClick(),
          onTap: () => widget._viewModel.gestureDispatcher.handleClick(),
          child: current,
        ),
      );
    }

    // fix: GestureDetector fails, https://github.com/flutter/flutter/issues/6606
    final transform = widget._viewModel.transform;
    if (transform != null) {
      final transformOrigin = widget._viewModel.transformOrigin;
      final origin = transformOrigin.offset;
      final alignment = transformOrigin.alignment;
      current = Transform(
        origin: origin,
        child: current,
        transform: transform,
        alignment: alignment,
      );
    }

    if (widget._viewModel.isOverflowClip) {
      current = ClipRRect(
        borderRadius: widget._viewModel.toBorderRadius,
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
  final RenderViewModel _viewModel;
  final Widget child;

  PositionWidget(
    this._viewModel, {
    Key? key,
    required this.child,
  }) : super(_viewModel.name, _viewModel.context, key: key);

  Widget positionChild(Widget child, [bool isStackLayout = false]) {
    if (isStackLayout) {
      return stackChild(child);
    } else {
      return commonChild(child);
    }
  }

  Widget commonChild(Widget child) {
    final margin = EdgeInsets.only(
      top: _viewModel.layoutY ?? 0.0,
      left: _viewModel.layoutX ?? 0.0,
    );
    if (margin.isNonNegative) {
      return BoxWidget(
        _viewModel,
        child: child,
      );
    }

    return Container(
      alignment: Alignment.topLeft,
      margin: margin,
      child: BoxWidget(
        _viewModel,
        child: child,
      ),
    );
  }

  Widget stackChild(Widget child) {
    return Positioned(
      top: _viewModel.layoutY,
      left: _viewModel.layoutX,
      child: BoxWidget(
        _viewModel,
        child: child,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (!kReleaseMode && debugProfileBuildsEnabled) {
      Timeline.startSync(
        '[b]PositionWidget',
        arguments: timelineArgumentsIndicatingLandmarkEvent,
      );
    }
    LogUtils.dWidget(
      "PositionWidget",
      "build position widget(${_viewModel.layoutX}, ${_viewModel.layoutY}, ${_viewModel.width}, ${_viewModel.height}) , node:${_viewModel.idDesc}",
    );
    Widget result;
    var node = child;
    var parent = _viewModel.parent;

    if (parent != null && !parent.interceptChildPosition()) {
      if (_viewModel.noSize || _viewModel.noPosition) {
        if (_viewModel.isShow) {
          LogUtils.d(
            "PositionWidget",
            "build box widget error, wrong size:(${_viewModel.layoutX}, ${_viewModel.layoutY}), node:${_viewModel.idDesc}",
          );
        }
        result = const Positioned(
          child: SizedBox(
            width: 0,
            height: 0,
          ),
        );
      } else {
        result = positionChild(node, true);
      }
    } else {
      result = positionChild(node);
    }

    if (!kReleaseMode && debugProfileBuildsEnabled) Timeline.finishSync();

    return result;
  }
}
