import 'package:collection/collection.dart';
import 'package:flutter/widgets.dart';
// ignore: import_of_legacy_library_into_null_safe
import 'package:pull_to_refresh/pull_to_refresh.dart';

import '../common/voltron_array.dart';
import '../common/voltron_map.dart';
import '../controller/manager.dart';
import '../controller/props.dart';
import '../dom/prop.dart';
import '../engine/engine_context.dart';
import '../gesture/dispatcher.dart';
import '../gesture/scroll.dart';
import '../module/promise.dart';
import '../util/log_util.dart';
import '../widget/list.dart';
import 'group.dart';
import 'list_item.dart';
import 'tree.dart';
import 'view_model.dart';

class ListViewController extends GroupController<ListViewRenderNode> {
  static const String className = "ListView";

  static const showScrollIndicator = "showScrollIndicator";
  static const rowShouldSticky = "rowShouldSticky";
  static const preloadItemSize = "preloadItemSize";
  static const preloadItemNumber = "preloadItemNumber";
  static const initContentOffset = "initialContentOffset";

  static const scrollToIndex = "scrollToIndex";
  static const scrollToContentOffset = "scrollToContentOffset";

  @override
  ListViewRenderNode createRenderNode(int id, VoltronMap? props, String name,
      RenderTree tree, ControllerManager controllerManager, bool lazy) {
    return ListViewRenderNode(id, name, tree, controllerManager, props, lazy);
  }

  @override
  Widget createWidget(BuildContext context, ListViewRenderNode renderNode) {
    return ListViewWidget(renderNode.renderViewModel);
  }

  @override
  String get name => className;

  @override
  Map<String, ControllerMethodProp> get groupExtraMethodProp => {
        rowShouldSticky: ControllerMethodProp(setRowShouldSticky, false),
        NodeProps.onScrollBeginDrag:
            ControllerMethodProp(setScrollBeginDragEventEnable, false),
        NodeProps.onScrollEndDrag:
            ControllerMethodProp(setScrollEndDragEventEnable, false),
        NodeProps.onMomentumScrollBegin:
            ControllerMethodProp(setMomentumScrollBeginEventEnable, false),
        NodeProps.onMomentumScrollEnd:
            ControllerMethodProp(setMomentumScrollEndEventEnable, false),
        NodeProps.onScrollEnable:
            ControllerMethodProp(setOnScrollEventEnable, false),
        NodeProps.scrollEnable: ControllerMethodProp(setScrollEnable, true),
        NodeProps.scrollEventThrottle:
            ControllerMethodProp(setScrollEventThrottle, 30),
        showScrollIndicator:
            ControllerMethodProp(setShowScrollIndicator, false),
        preloadItemSize: ControllerMethodProp(setPreloadItemSize, 0.0),
        initContentOffset: ControllerMethodProp(setInitContentOffset, 0.0),
        preloadItemNumber: ControllerMethodProp(setPreloadItemNumber, 0),
        NodeProps.paddingTop: ControllerMethodProp(setPaddingTop, 0.0),
        NodeProps.paddingRight: ControllerMethodProp(setPaddingRight, 0.0),
        NodeProps.paddingBottom: ControllerMethodProp(setPaddingBottom, 0.0),
        NodeProps.paddingLeft: ControllerMethodProp(setPaddingLeft, 0.0),
      };

  @ControllerProps(rowShouldSticky)
  void setRowShouldSticky(ListViewRenderNode node, bool enable) {
    node.renderViewModel.hasStickyItem = enable;
  }

  @ControllerProps(rowShouldSticky)
  void setShowScrollIndicator(ListViewRenderNode node, bool enable) {
    node.renderViewModel.showScrollIndicator = enable;
  }

  @ControllerProps(NodeProps.onScrollBeginDrag)
  void setScrollBeginDragEventEnable(ListViewRenderNode node, bool flag) {
    node.renderViewModel.scrollGestureDispatcher.scrollBeginDragEventEnable =
        flag;
  }

  @ControllerProps(NodeProps.onScrollEndDrag)
  void setScrollEndDragEventEnable(ListViewRenderNode node, bool flag) {
    node.renderViewModel.scrollGestureDispatcher.scrollEndDragEventEnable =
        flag;
  }

  @ControllerProps(NodeProps.onMomentumScrollBegin)
  void setMomentumScrollBeginEventEnable(ListViewRenderNode node, bool flag) {
    node.renderViewModel.scrollGestureDispatcher
        .momentumScrollBeginEventEnable = flag;
  }

  @ControllerProps(NodeProps.onMomentumScrollEnd)
  void setMomentumScrollEndEventEnable(ListViewRenderNode node, bool flag) {
    node.renderViewModel.scrollGestureDispatcher.momentumScrollEndEventEnable =
        flag;
  }

  @ControllerProps(NodeProps.onScrollEnable)
  void setOnScrollEventEnable(ListViewRenderNode node, bool flag) {
    node.renderViewModel.scrollGestureDispatcher.scrollEventEnable = flag;
  }

  @ControllerProps(NodeProps.scrollEnable)
  void setScrollEnable(ListViewRenderNode node, bool flag) {
    node.renderViewModel.scrollGestureDispatcher.scrollEnable = flag;
  }

  @ControllerProps(NodeProps.scrollEventThrottle)
  void setScrollEventThrottle(
      ListViewRenderNode node, int scrollEventThrottle) {
    node.renderViewModel.scrollGestureDispatcher.scrollEventThrottle =
        scrollEventThrottle;
  }

  @ControllerProps(preloadItemSize)
  void setPreloadItemSize(ListViewRenderNode node, double preloadItemSize) {
    node.renderViewModel.preloadSize = preloadItemSize;
  }

  @ControllerProps(initContentOffset)
  void setInitContentOffset(ListViewRenderNode node, double offset) {
    node.renderViewModel.initOffset = offset;
  }

  @ControllerProps(preloadItemNumber)
  void setPreloadItemNumber(ListViewRenderNode node, int number) {
    var gestureDispatcher = node.renderViewModel.gestureDispatcher;
    if (gestureDispatcher is NativeScrollGestureDispatcher) {
      gestureDispatcher.preloadItemNumber = number;
    }
  }

  @ControllerProps(NodeProps.paddingTop)
  void setPaddingTop(ListViewRenderNode view, Object? paddingTop) {
    if (paddingTop is int) {
      view.renderViewModel.paddingTop = paddingTop.toDouble();
    } else if (paddingTop is double) {
      view.renderViewModel.paddingTop = paddingTop;
    } else {
      view.renderViewModel.paddingTop = 0.0;
    }
  }

  @ControllerProps(NodeProps.paddingRight)
  void setPaddingRight(ListViewRenderNode view, Object? paddingRight) {
    if (paddingRight is int) {
      view.renderViewModel.paddingRight = paddingRight.toDouble();
    } else if (paddingRight is double) {
      view.renderViewModel.paddingRight = paddingRight;
    } else {
      view.renderViewModel.paddingRight = 0.0;
    }
  }

  @ControllerProps(NodeProps.paddingBottom)
  void setPaddingBottom(ListViewRenderNode view, Object? paddingBottom) {
    if (paddingBottom is int) {
      view.renderViewModel.paddingBottom = paddingBottom.toDouble();
    } else if (paddingBottom is double) {
      view.renderViewModel.paddingBottom = paddingBottom;
    } else {
      view.renderViewModel.paddingBottom = 0.0;
    }
  }

  @ControllerProps(NodeProps.paddingLeft)
  void setPaddingLeft(ListViewRenderNode view, Object? paddingLeft) {
    if (paddingLeft is int) {
      view.renderViewModel.paddingLeft = paddingLeft.toDouble();
    } else if (paddingLeft is double) {
      view.renderViewModel.paddingLeft = paddingLeft;
    } else {
      view.renderViewModel.paddingLeft = 0.0;
    }
  }

  @override
  void dispatchFunction(
      ListViewRenderNode node, String functionName, VoltronArray array,
      {Promise? promise}) {
    super.dispatchFunction(node, functionName, array, promise: promise);
    if (functionName == scrollToIndex) {
      // list滑动到某个item
      var yIndex = array.get(1) ?? -1;
      var animated = array.get(2) ?? false;
      var duration = array.get(3) ?? 0; //1.2.7 增加滚动时间 ms,animated==true时生效

      if (duration <= 100) {
        // 保证duration最小为100ms
        duration = 100;
      }
      LogUtils.d("list_scroll", "scroll to index:$yIndex");
      node.renderViewModel.scrollToIndex(yIndex, duration, animated);
    } else if (functionName == scrollToContentOffset) {
      // list滑动到某个距离
      var yOffset = array.get(1) ?? -1.0;
      var animated = array.get(2) ?? false;
      var duration = array.get(3) ?? 0; //1.2.7 增加滚动时间 ms,animated==true时生效

      if (duration <= 100) {
        // 保证duration最小为100ms
        duration = 100;
      }

      LogUtils.d("list_scroll", "scroll to offset:$yOffset");

      node.renderViewModel.scrollToOffset(yOffset, duration, animated);
    }
  }
}

class ListViewRenderNode extends GroupRenderNode<ListViewModel> {
  ListViewRenderNode(int id, String className, RenderTree root,
      ControllerManager controllerManager, VoltronMap? props, bool isLazy)
      : super(id, className, root, controllerManager, props, isLazy);

  @override
  ListViewModel createRenderViewModel(EngineContext context) {
    return ListViewModel(id, rootId, name, context);
  }
}

typedef RefreshWrapperDelegate = SmartRefresher Function(
    BuildContext context, Widget child);

class ListViewModel extends ScrollableModel {
  static const String wrapperKey = "refresh_wrapper";

  bool showScrollIndicator = false;
  bool hasStickyItem = false;
  double preloadSize = 0;
  double initOffset = 0;
  // 间距相关
  double paddingTop = 0.0;
  double paddingRight = 0.0;
  double paddingBottom = 0.0;
  double paddingLeft = 0.0;

  late ListViewDetailModel listViewDetailModel;

  RefreshWrapperDelegate? get refreshWrapper =>
      getExtraInfo<RefreshWrapperDelegate>(wrapperKey);

  ListViewModel(int id, int instanceId, String className, EngineContext context)
      : super(id, instanceId, className, context);

  ListViewModel.copy(int id, int instanceId, String className,
      EngineContext context, ListViewModel viewModel)
      : super.copy(id, instanceId, className, context, viewModel) {
    showScrollIndicator = viewModel.showScrollIndicator;
    hasStickyItem = viewModel.hasStickyItem;
    preloadSize = viewModel.preloadSize;
    initOffset = viewModel.initOffset;
    scrollGestureDispatcher = viewModel.scrollGestureDispatcher;
    paddingTop = viewModel.paddingTop;
    paddingRight = viewModel.paddingRight;
    paddingBottom = viewModel.paddingBottom;
    paddingLeft = viewModel.paddingLeft;
    var stickyList = <List<RenderViewModel>>[];
    var isSticky = false;
    if (viewModel.hasStickyItem) {
      if (viewModel.children.isNotEmpty) {
        var curList = <RenderViewModel>[];
        for (var element in viewModel.children) {
          if (element is ListItemViewModel && element.shouldSticky) {
            // sticky item
            if (curList.isNotEmpty) {
              stickyList.add(curList);
              curList = <RenderViewModel>[];
            }
            stickyList.add([element]);
            isSticky = true;
          } else {
            curList.add(element);
          }
        }

        if (curList.isNotEmpty) {
          stickyList.add(curList);
        }
      }
    }
    hasStickyItem = isSticky;
    listViewDetailModel = ListViewDetailModel(
      childrenList: viewModel.children,
      preloadSize: viewModel.preloadSize,
      controller: viewModel.scrollController,
      scrollGestureDispatcher: viewModel.scrollGestureDispatcher,
      delegate: viewModel.refreshWrapper,
      showScrollIndicator: viewModel.showScrollIndicator,
      hasStickyItem: hasStickyItem,
      stickyList: stickyList,
      paddingTop: viewModel.paddingTop,
      paddingRight: viewModel.paddingRight,
      paddingBottom: viewModel.paddingBottom,
      paddingLeft: viewModel.paddingLeft,
    );
  }

  @override
  bool operator ==(Object other) {
    return other is ListViewModel &&
        showScrollIndicator == other.showScrollIndicator &&
        hasStickyItem == other.hasStickyItem &&
        preloadSize == other.preloadSize &&
        initOffset == other.initOffset &&
        paddingTop == other.paddingTop &&
        paddingRight == other.paddingRight &&
        paddingBottom == other.paddingBottom &&
        paddingLeft == other.paddingLeft &&
        super == (other);
  }

  @override
  int get hashCode =>
      showScrollIndicator.hashCode |
      hasStickyItem.hashCode |
      preloadSize.hashCode |
      initOffset.hashCode |
      paddingTop.hashCode |
      paddingRight.hashCode |
      paddingBottom.hashCode |
      paddingLeft.hashCode |
      super.hashCode;

  @override
  ScrollController createController() {
    return TrackingScrollController(initialScrollOffset: initOffset);
  }

  void scrollToIndex(int index, int duration, bool animate) {
    scrollToOffset(calculateOffsetOfIndex(index), duration, animate);
  }

  void scrollToOffset(double offset, int duration, bool animate) {
    if (offset >= 0) {
      // 预防滑动超出之后的异常回弹
      var finalOffset = offset < scrollController.position.maxScrollExtent
          ? offset
          : scrollController.position.maxScrollExtent;
      if (animate) {
        scrollController.animateTo(finalOffset,
            duration: Duration(milliseconds: duration),
            curve: Curves.linearToEaseOut);
      } else {
        scrollController.jumpTo(finalOffset);
      }
    }
  }

  double calculateOffsetOfIndex(int index) {
    var realOffset = 0.0;
    if (index > childCount) {
      index = childCount;
    }

    if (index > 0) {
      for (var i = 0; i < index - 1; i++) {
        realOffset += children[i].height ?? 0;
      }
    }

    return realOffset;
  }
}

class ListViewDetailModel {
  final List<RenderViewModel> children = [];
  final double preloadSize;
  final ScrollController controller;
  final NativeScrollGestureDispatcher scrollGestureDispatcher;
  final bool hasStickyItem;
  final bool showScrollIndicator;
  final List<List<RenderViewModel>> stickyChildList = [];
  final RefreshWrapperDelegate? delegate;
  final double paddingTop;
  final double paddingRight;
  final double paddingBottom;
  final double paddingLeft;

  ListViewDetailModel(
      {@required List<RenderViewModel>? childrenList,
      this.preloadSize = 0,
      required this.controller,
      required this.scrollGestureDispatcher,
      this.hasStickyItem = false,
      this.showScrollIndicator = false,
      this.delegate,
      this.paddingTop = 0.0,
      this.paddingRight = 0.0,
      this.paddingBottom = 0.0,
      this.paddingLeft = 0.0,
      List<List<RenderViewModel>>? stickyList}) {
    if (childrenList != null) {
      children.addAll(childrenList);
    }
    if (stickyList != null && stickyList.isNotEmpty) {
      for (var element in stickyList) {
        if (element.isNotEmpty) {
          var elementList = <RenderViewModel>[];
          elementList.addAll(element);
          stickyChildList.add(elementList);
        }
      }
    }
  }
  @override
  int get hashCode =>
      children.hashCode | preloadSize.hashCode | controller.hashCode;

  @override
  bool operator ==(Object other) =>
      other is ListViewDetailModel &&
      DeepCollectionEquality().equals(children, other.children) &&
      preloadSize == other.preloadSize &&
      controller == other.controller &&
      showScrollIndicator == other.showScrollIndicator &&
      hasStickyItem == other.hasStickyItem &&
      DeepCollectionEquality().equals(stickyChildList, other.stickyChildList) &&
      paddingTop == other.paddingTop &&
      paddingRight == other.paddingRight &&
      paddingBottom == other.paddingBottom &&
      paddingLeft == other.paddingLeft &&
      scrollGestureDispatcher == other.scrollGestureDispatcher &&
      delegate == other.delegate;
}

abstract class ScrollableModel extends GroupViewModel {
  late NativeScrollGestureDispatcher scrollGestureDispatcher;

  @override
  NativeGestureDispatcher createDispatcher() {
    scrollGestureDispatcher =
        NativeScrollGestureDispatcher(id: id, context: context);
    return scrollGestureDispatcher;
  }

  ScrollController? _scrollController;

  ScrollController get scrollController {
    var scrollController = _scrollController;
    if (scrollController == null) {
      var newScrollController = createController();
      _scrollController = newScrollController;
      return newScrollController;
    }
    return scrollController;
  }

  ScrollController createController() {
    return ScrollController();
  }

  ScrollableModel(
      int id, int instanceId, String className, EngineContext context)
      : super(id, instanceId, className, context);

  ScrollableModel.copy(int id, int instanceId, String className,
      EngineContext context, GroupViewModel viewModel)
      : super.copy(id, instanceId, className, context, viewModel);

  @override
  bool operator ==(Object other) {
    return super == other;
  }

  @override
  int get hashCode => super.hashCode;

  @override
  void onViewModelDestroy() {
    super.onViewModelDestroy();
  }

  @override
  void onDispose() {
    super.onDispose();
    _scrollController?.dispose();
    _scrollController = null;
  }
}
