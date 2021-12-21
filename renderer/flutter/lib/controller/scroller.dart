import 'package:flutter/widgets.dart';

import '../common.dart';
import '../controller.dart';
import '../engine.dart';
import '../module.dart';
import '../render.dart';
import '../style.dart';
import '../viewmodel.dart';
import '../widget.dart';
import 'group.dart';

class ScrollViewController
    extends BaseGroupController<ScrollViewRenderViewModel> {
  static const String kScrollTo = "scrollTo";
  static const String kScrollToWithOptions = "scrollToWithOptions";

  static const String kShowScrollIndicator = "showScrollIndicator";
  static const String kOnScrollAnimationEnd = "onScrollAnimationEnd";
  static const String kFlingEnabled = "flingEnabled";
  static const String kContentOffsetForReuse = "contentOffset4Reuse";
  static const String kPagingEnabled = "pagingEnabled";

  static const String kClassName = "ScrollView";

  @override
  ScrollViewRenderViewModel createRenderViewModel(
      RenderNode node, EngineContext context) {
    var originProps = node.props;
    if (originProps != null &&
        originProps.containsKey("horizontal") &&
        originProps.get<bool>("horizontal") == true) {
      return ScrollViewRenderViewModel(
          node.id, node.rootId, node.name, context, true);
    }
    return ScrollViewRenderViewModel(node.id, node.rootId, node.name, context);
  }

  @override
  Widget createWidget(
      BuildContext context, ScrollViewRenderViewModel renderViewModel) {
    return ScrollViewWidget(renderViewModel);
  }

  @override
  Map<String, ControllerMethodProp> get groupExtraMethodProp => {
        NodeProps.kOnScrollBeginDrag:
            ControllerMethodProp(setScrollBeginDragEventEnable, false),
        NodeProps.kOnScrollEndDrag:
            ControllerMethodProp(setScrollEndDragEventEnable, false),
        NodeProps.kOnMomentumScrollBegin:
            ControllerMethodProp(setMomentumScrollBeginEventEnable, false),
        NodeProps.kOnMomentumScrollEnd:
            ControllerMethodProp(setMomentumScrollEndEventEnable, false),
        NodeProps.kOnScrollEnable:
            ControllerMethodProp(setScrollEventThrottle, false),
        NodeProps.kScrollEnable: ControllerMethodProp(setScrollEnabled, true),
        NodeProps.kScrollEventThrottle:
            ControllerMethodProp(setScrollEventThrottle, 30),
        kShowScrollIndicator:
            ControllerMethodProp(setShowScrollIndicator, false),
        kOnScrollAnimationEnd:
            ControllerMethodProp(setScrollAnimationEndEventEnable, false),
        kFlingEnabled: ControllerMethodProp(setFlingEnabled, true),
        kContentOffsetForReuse:
            ControllerMethodProp(setContentOffset4Reuse, null),
        kPagingEnabled: ControllerMethodProp(setFlingEnabled, false),
      };

  @override
  String get name => kClassName;

  @ControllerProps(NodeProps.kScrollEnable)
  void setScrollEnabled(ScrollViewRenderViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.scrollEnable = flag;
  }

  @ControllerProps(kShowScrollIndicator)
  void setShowScrollIndicator(
      ScrollViewRenderViewModel renderViewModel, bool flag) {
    renderViewModel.showScrollIndicator = flag;
  }

  @ControllerProps(NodeProps.kOnScrollEnable)
  void setScrollEventEnable(
      ScrollViewRenderViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.scrollEventEnable = flag;
  }

  @ControllerProps(NodeProps.kOnScrollBeginDrag)
  void setScrollBeginDragEventEnable(
      ScrollViewRenderViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.scrollBeginDragEventEnable = flag;
  }

  @ControllerProps(NodeProps.kOnScrollEndDrag)
  void setScrollEndDragEventEnable(
      ScrollViewRenderViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.scrollEndDragEventEnable = flag;
  }

  @ControllerProps(NodeProps.kOnMomentumScrollBegin)
  void setMomentumScrollBeginEventEnable(
      ScrollViewRenderViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.momentumScrollBeginEventEnable =
        flag;
  }

  @ControllerProps(NodeProps.kOnMomentumScrollEnd)
  void setMomentumScrollEndEventEnable(
      ScrollViewRenderViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.momentumScrollEndEventEnable = flag;
  }

  @ControllerProps(kOnScrollAnimationEnd)
  void setScrollAnimationEndEventEnable(
      ScrollViewRenderViewModel renderViewModel, bool flag) {
    renderViewModel.scrollAnimationEndEventEnable = flag;
  }

  @ControllerProps(kFlingEnabled)
  void setFlingEnabled(ScrollViewRenderViewModel renderViewModel, bool flag) {
    renderViewModel.flingEnable = flag;
  }

  @ControllerProps(kContentOffsetForReuse)
  void setContentOffset4Reuse(
      ScrollViewRenderViewModel renderViewModel, VoltronMap offsetMap) {
    renderViewModel.setInitOffset(offsetMap);
  }

  @ControllerProps(kPagingEnabled)
  void setPagingEnabled(
      ScrollViewRenderViewModel renderViewModel, bool pagingEnabled) {
    renderViewModel.pagingEnable = pagingEnabled;
  }

  @ControllerProps(NodeProps.kScrollEventThrottle)
  void setScrollEventThrottle(
      ScrollViewRenderViewModel renderViewModel, int scrollEventThrottle) {
    renderViewModel.scrollGestureDispatcher.scrollEventThrottle =
        scrollEventThrottle;
  }

  @override
  void dispatchFunction(ScrollViewRenderViewModel renderViewModel,
      String functionName, VoltronArray array,
      {Promise? promise}) {
    super.dispatchFunction(renderViewModel, functionName, array,
        promise: promise);
    // 滚动事件
    if (functionName == kScrollToWithOptions) {
      // 先确定滚动方向
      var orientation = 'vertical';
      if (renderViewModel.isHorizontal) {
        orientation = 'horizontal';
      }
      // 再确定滚动值
      final m = array.get(0);
      if (m is VoltronMap) {
        final destX = m.get("x") ?? 0.0;
        final destY = m.get("y") ?? 0.0;
        var offset = destY;
        if (orientation == 'horizontal') {
          offset = destX;
        }
        // 最后确定是否有动画
        final duration = m.get("duration") ?? 0;
        var d = 0;
        if (duration is int && duration > 0) {
          d = duration;
        }
        renderViewModel.scrollTo(offset.toDouble(), d);
      }
    }
  }
}
