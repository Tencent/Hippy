import 'package:flutter/widgets.dart';
// ignore: import_of_legacy_library_into_null_safe
import 'package:pull_to_refresh/pull_to_refresh.dart';

import '../common.dart';
import '../controller.dart';
import '../engine.dart';
import '../gesture.dart';
import '../module.dart';
import '../render.dart';
import '../style.dart';
import '../util.dart';
import '../viewmodel.dart';
import '../widget.dart';
import 'group.dart';

typedef RefreshWrapperDelegate = SmartRefresher Function(
    BuildContext context, Widget child);

class ListViewController extends BaseGroupController<ListViewModel> {
  static const String kClassName = "ListView";

  static const kShowScrollIndicator = "showScrollIndicator";
  static const kRowShouldSticky = "rowShouldSticky";
  static const kPreloadItemSize = "preloadItemSize";
  static const kPreloadItemNumber = "preloadItemNumber";
  static const kInitContentOffset = "initialContentOffset";

  static const kScrollToIndex = "scrollToIndex";
  static const kScrollToContentOffset = "scrollToContentOffset";

  @override
  Widget createWidget(BuildContext context, ListViewModel viewModel) {
    return ListViewWidget(viewModel);
  }

  @override
  ListViewModel createRenderViewModel(RenderNode node, EngineContext context) {
    return ListViewModel(node.id, node.rootId, node.name, context);
  }

  @override
  String get name => kClassName;

  @override
  Map<String, ControllerMethodProp> get groupExtraMethodProp => {
        kRowShouldSticky: ControllerMethodProp(setRowShouldSticky, false),
        NodeProps.kOnScrollBeginDrag:
            ControllerMethodProp(setScrollBeginDragEventEnable, false),
        NodeProps.kOnScrollEndDrag:
            ControllerMethodProp(setScrollEndDragEventEnable, false),
        NodeProps.kOnMomentumScrollBegin:
            ControllerMethodProp(setMomentumScrollBeginEventEnable, false),
        NodeProps.kOnMomentumScrollEnd:
            ControllerMethodProp(setMomentumScrollEndEventEnable, false),
        NodeProps.kOnScrollEnable:
            ControllerMethodProp(setOnScrollEventEnable, false),
        NodeProps.kScrollEnable: ControllerMethodProp(setScrollEnable, true),
        NodeProps.kScrollEventThrottle:
            ControllerMethodProp(setScrollEventThrottle, 30),
        kShowScrollIndicator:
            ControllerMethodProp(setShowScrollIndicator, false),
        kPreloadItemSize: ControllerMethodProp(setPreloadItemSize, 0.0),
        kInitContentOffset: ControllerMethodProp(setInitContentOffset, 0.0),
        kPreloadItemNumber: ControllerMethodProp(setPreloadItemNumber, 0),
        NodeProps.kPaddingTop: ControllerMethodProp(setPaddingTop, 0.0),
        NodeProps.kPaddingRight: ControllerMethodProp(setPaddingRight, 0.0),
        NodeProps.kPaddingBottom: ControllerMethodProp(setPaddingBottom, 0.0),
        NodeProps.kPaddingLeft: ControllerMethodProp(setPaddingLeft, 0.0),
      };

  @ControllerProps(kRowShouldSticky)
  void setRowShouldSticky(ListViewModel renderViewModel, bool enable) {
    renderViewModel.hasStickyItem = enable;
  }

  @ControllerProps(kRowShouldSticky)
  void setShowScrollIndicator(ListViewModel renderViewModel, bool enable) {
    renderViewModel.showScrollIndicator = enable;
  }

  @ControllerProps(NodeProps.kOnScrollBeginDrag)
  void setScrollBeginDragEventEnable(ListViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.scrollBeginDragEventEnable = flag;
  }

  @ControllerProps(NodeProps.kOnScrollEndDrag)
  void setScrollEndDragEventEnable(ListViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.scrollEndDragEventEnable = flag;
  }

  @ControllerProps(NodeProps.kOnMomentumScrollBegin)
  void setMomentumScrollBeginEventEnable(
      ListViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.momentumScrollBeginEventEnable =
        flag;
  }

  @ControllerProps(NodeProps.kOnMomentumScrollEnd)
  void setMomentumScrollEndEventEnable(
      ListViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.momentumScrollEndEventEnable = flag;
  }

  @ControllerProps(NodeProps.kOnScrollEnable)
  void setOnScrollEventEnable(ListViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.scrollEventEnable = flag;
  }

  @ControllerProps(NodeProps.kScrollEnable)
  void setScrollEnable(ListViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.scrollEnable = flag;
  }

  @ControllerProps(NodeProps.kScrollEventThrottle)
  void setScrollEventThrottle(
      ListViewModel renderViewModel, int scrollEventThrottle) {
    renderViewModel.scrollGestureDispatcher.scrollEventThrottle =
        scrollEventThrottle;
  }

  @ControllerProps(kPreloadItemSize)
  void setPreloadItemSize(
      ListViewModel renderViewModel, double preloadItemSize) {
    renderViewModel.preloadSize = preloadItemSize;
  }

  @ControllerProps(kInitContentOffset)
  void setInitContentOffset(ListViewModel renderViewModel, double offset) {
    renderViewModel.initOffset = offset;
  }

  @ControllerProps(kPreloadItemNumber)
  void setPreloadItemNumber(ListViewModel renderViewModel, int number) {
    var gestureDispatcher = renderViewModel.gestureDispatcher;
    if (gestureDispatcher is NativeScrollGestureDispatcher) {
      gestureDispatcher.preloadItemNumber = number;
    }
  }

  @ControllerProps(NodeProps.kPaddingTop)
  void setPaddingTop(ListViewModel renderViewModel, Object? paddingTop) {
    if (paddingTop is int) {
      renderViewModel.paddingTop = paddingTop.toDouble();
    } else if (paddingTop is double) {
      renderViewModel.paddingTop = paddingTop;
    } else {
      renderViewModel.paddingTop = 0.0;
    }
  }

  @ControllerProps(NodeProps.kPaddingRight)
  void setPaddingRight(ListViewModel renderViewModel, Object? paddingRight) {
    if (paddingRight is int) {
      renderViewModel.paddingRight = paddingRight.toDouble();
    } else if (paddingRight is double) {
      renderViewModel.paddingRight = paddingRight;
    } else {
      renderViewModel.paddingRight = 0.0;
    }
  }

  @ControllerProps(NodeProps.kPaddingBottom)
  void setPaddingBottom(ListViewModel renderViewModel, Object? paddingBottom) {
    if (paddingBottom is int) {
      renderViewModel.paddingBottom = paddingBottom.toDouble();
    } else if (paddingBottom is double) {
      renderViewModel.paddingBottom = paddingBottom;
    } else {
      renderViewModel.paddingBottom = 0.0;
    }
  }

  @ControllerProps(NodeProps.kPaddingLeft)
  void setPaddingLeft(ListViewModel renderViewModel, Object? paddingLeft) {
    if (paddingLeft is int) {
      renderViewModel.paddingLeft = paddingLeft.toDouble();
    } else if (paddingLeft is double) {
      renderViewModel.paddingLeft = paddingLeft;
    } else {
      renderViewModel.paddingLeft = 0.0;
    }
  }

  @override
  void dispatchFunction(
      ListViewModel renderViewModel, String functionName, VoltronArray array,
      {Promise? promise}) {
    super.dispatchFunction(renderViewModel, functionName, array,
        promise: promise);
    if (functionName == kScrollToIndex) {
      // list滑动到某个item
      var yIndex = array.get(1) ?? -1;
      var animated = array.get(2) ?? false;
      var duration = array.get(3) ?? 0; //1.2.7 增加滚动时间 ms,animated==true时生效

      if (duration <= 100) {
        // 保证duration最小为100ms
        duration = 100;
      }
      LogUtils.d("list_scroll", "scroll to index:$yIndex");
      renderViewModel.scrollToIndex(yIndex, duration, animated);
    } else if (functionName == kScrollToContentOffset) {
      // list滑动到某个距离
      var yOffset = array.get(1) ?? -1.0;
      var animated = array.get(2) ?? false;
      var duration = array.get(3) ?? 0; //1.2.7 增加滚动时间 ms,animated==true时生效

      if (duration <= 100) {
        // 保证duration最小为100ms
        duration = 100;
      }

      LogUtils.d("list_scroll", "scroll to offset:$yOffset");

      renderViewModel.scrollToOffset(yOffset, duration, animated);
    }
  }
}
