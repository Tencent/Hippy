import 'package:flutter/widgets.dart';

import '../common/voltron_array.dart';
import '../common/voltron_map.dart';
import '../controller/props.dart';
import '../engine/engine_context.dart';
import '../module/promise.dart';
import '../render/node.dart';
import '../style/prop.dart';
import '../viewmodel/scroller.dart';
import '../widget/scroller.dart';
import 'group.dart';

class ScrollViewController
    extends BaseGroupController<ScrollViewRenderViewModel> {
  static const String scrollTo = "scrollTo";
  static const String scrollToWithOptions = "scrollToWithOptions";

  static const String showScrollIndicator = "showScrollIndicator";
  static const String onScrollAnimationEnd = "onScrollAnimationEnd";
  static const String flingEnabled = "flingEnabled";
  static const String contentOffsetForReuse = "contentOffset4Reuse";
  static const String pagingEnabled = "pagingEnabled";

  static const String className = "ScrollView";

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
        NodeProps.onScrollBeginDrag:
            ControllerMethodProp(setScrollBeginDragEventEnable, false),
        NodeProps.onScrollEndDrag:
            ControllerMethodProp(setScrollEndDragEventEnable, false),
        NodeProps.onMomentumScrollBegin:
            ControllerMethodProp(setMomentumScrollBeginEventEnable, false),
        NodeProps.onMomentumScrollEnd:
            ControllerMethodProp(setMomentumScrollEndEventEnable, false),
        NodeProps.onScrollEnable:
            ControllerMethodProp(setScrollEventThrottle, false),
        NodeProps.scrollEnable: ControllerMethodProp(setScrollEnabled, true),
        NodeProps.scrollEventThrottle:
            ControllerMethodProp(setScrollEventThrottle, 30),
        showScrollIndicator:
            ControllerMethodProp(setShowScrollIndicator, false),
        onScrollAnimationEnd:
            ControllerMethodProp(setScrollAnimationEndEventEnable, false),
        flingEnabled: ControllerMethodProp(setFlingEnabled, true),
        contentOffsetForReuse:
            ControllerMethodProp(setContentOffset4Reuse, null),
        pagingEnabled: ControllerMethodProp(setFlingEnabled, false),
      };

  @override
  String get name => className;

  @ControllerProps(NodeProps.scrollEnable)
  void setScrollEnabled(ScrollViewRenderViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.scrollEnable = flag;
  }

  @ControllerProps(showScrollIndicator)
  void setShowScrollIndicator(
      ScrollViewRenderViewModel renderViewModel, bool flag) {
    renderViewModel.showScrollIndicator = flag;
  }

  @ControllerProps(NodeProps.onScrollEnable)
  void setScrollEventEnable(
      ScrollViewRenderViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.scrollEventEnable = flag;
  }

  @ControllerProps(NodeProps.onScrollBeginDrag)
  void setScrollBeginDragEventEnable(
      ScrollViewRenderViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.scrollBeginDragEventEnable = flag;
  }

  @ControllerProps(NodeProps.onScrollEndDrag)
  void setScrollEndDragEventEnable(
      ScrollViewRenderViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.scrollEndDragEventEnable = flag;
  }

  @ControllerProps(NodeProps.onMomentumScrollBegin)
  void setMomentumScrollBeginEventEnable(
      ScrollViewRenderViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.momentumScrollBeginEventEnable =
        flag;
  }

  @ControllerProps(NodeProps.onMomentumScrollEnd)
  void setMomentumScrollEndEventEnable(
      ScrollViewRenderViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.momentumScrollEndEventEnable = flag;
  }

  @ControllerProps(onScrollAnimationEnd)
  void setScrollAnimationEndEventEnable(
      ScrollViewRenderViewModel renderViewModel, bool flag) {
    renderViewModel.scrollAnimationEndEventEnable = flag;
  }

  @ControllerProps(flingEnabled)
  void setFlingEnabled(ScrollViewRenderViewModel renderViewModel, bool flag) {
    renderViewModel.flingEnable = flag;
  }

  @ControllerProps(contentOffsetForReuse)
  void setContentOffset4Reuse(
      ScrollViewRenderViewModel renderViewModel, VoltronMap offsetMap) {
    renderViewModel.setInitOffset(offsetMap);
  }

  @ControllerProps(pagingEnabled)
  void setPagingEnabled(
      ScrollViewRenderViewModel renderViewModel, bool pagingEnabled) {
    renderViewModel.pagingEnable = pagingEnabled;
  }

  @ControllerProps(NodeProps.scrollEventThrottle)
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
    if (functionName == scrollToWithOptions) {
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
