import 'package:collection/collection.dart';
import 'package:flutter/widgets.dart';

import '../common/voltron_array.dart';
import '../common/voltron_map.dart';
import '../controller/manager.dart';
import '../controller/props.dart';
import '../dom/prop.dart';
import '../engine/engine_context.dart';
import '../gesture/scroll.dart';
import '../module/promise.dart';
import '../widget/scroller.dart';
import 'group.dart';
import 'list.dart';
import 'tree.dart';
import 'view_model.dart';

class ScrollViewController extends GroupController<ScrollViewRenderNode> {
  static const String scrollTo = "scrollTo";
  static const String scrollToWithOptions = "scrollToWithOptions";

  static const String showScrollIndicator = "showScrollIndicator";
  static const String onScrollAnimationEnd = "onScrollAnimationEnd";
  static const String flingEnabled = "flingEnabled";
  static const String contentOffsetForReuse = "contentOffset4Reuse";
  static const String pagingEnabled = "pagingEnabled";

  static const String className = "ScrollView";

  @override
  ScrollViewRenderNode createRenderNode(int id, VoltronMap? props, String name,
      RenderTree tree, ControllerManager controllerManager, bool lazy) {
    return ScrollViewRenderNode(id, name, tree, controllerManager, props, lazy);
  }

  @override
  Widget createWidget(BuildContext context, ScrollViewRenderNode renderNode) {
    return ScrollViewWidget(renderNode.renderViewModel);
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
  void setScrollEnabled(ScrollViewRenderNode node, bool flag) {
    node.renderViewModel.scrollGestureDispatcher.scrollEnable = flag;
  }

  @ControllerProps(showScrollIndicator)
  void setShowScrollIndicator(ScrollViewRenderNode node, bool flag) {
    node.renderViewModel.showScrollIndicator = flag;
  }

  @ControllerProps(NodeProps.onScrollEnable)
  void setScrollEventEnable(ScrollViewRenderNode node, bool flag) {
    node.renderViewModel.scrollGestureDispatcher.scrollEventEnable = flag;
  }

  @ControllerProps(NodeProps.onScrollBeginDrag)
  void setScrollBeginDragEventEnable(ScrollViewRenderNode node, bool flag) {
    node.renderViewModel.scrollGestureDispatcher.scrollBeginDragEventEnable =
        flag;
  }

  @ControllerProps(NodeProps.onScrollEndDrag)
  void setScrollEndDragEventEnable(ScrollViewRenderNode node, bool flag) {
    node.renderViewModel.scrollGestureDispatcher.scrollEndDragEventEnable =
        flag;
  }

  @ControllerProps(NodeProps.onMomentumScrollBegin)
  void setMomentumScrollBeginEventEnable(ScrollViewRenderNode node, bool flag) {
    node.renderViewModel.scrollGestureDispatcher
        .momentumScrollBeginEventEnable = flag;
  }

  @ControllerProps(NodeProps.onMomentumScrollEnd)
  void setMomentumScrollEndEventEnable(ScrollViewRenderNode node, bool flag) {
    node.renderViewModel.scrollGestureDispatcher.momentumScrollEndEventEnable =
        flag;
  }

  @ControllerProps(onScrollAnimationEnd)
  void setScrollAnimationEndEventEnable(ScrollViewRenderNode node, bool flag) {
    node.renderViewModel.scrollAnimationEndEventEnable = flag;
  }

  @ControllerProps(flingEnabled)
  void setFlingEnabled(ScrollViewRenderNode node, bool flag) {
    node.renderViewModel.flingEnable = flag;
  }

  @ControllerProps(contentOffsetForReuse)
  void setContentOffset4Reuse(ScrollViewRenderNode node, VoltronMap offsetMap) {
    node.renderViewModel.setInitOffset(offsetMap);
  }

  @ControllerProps(pagingEnabled)
  void setPagingEnabled(ScrollViewRenderNode node, bool pagingEnabled) {
    node.renderViewModel.pagingEnable = pagingEnabled;
  }

  @ControllerProps(NodeProps.scrollEventThrottle)
  void setScrollEventThrottle(
      ScrollViewRenderNode node, int scrollEventThrottle) {
    node.renderViewModel.scrollGestureDispatcher.scrollEventThrottle =
        scrollEventThrottle;
  }

  @override
  void dispatchFunction(
      ScrollViewRenderNode node, String functionName, VoltronArray array,
      {Promise? promise}) {
    super.dispatchFunction(node, functionName, array, promise: promise);
    // 滚动事件
    if (functionName == scrollToWithOptions) {
      // 先确定滚动方向
      var orientation = 'vertical';
      final originProps = node.props;
      if (originProps != null &&
          originProps.containsKey("horizontal") &&
          originProps.get<bool>("horizontal") == true) {
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
        node.renderViewModel.scrollTo(offset.toDouble(), d);
      }
    }
  }
}

class ScrollViewRenderNode extends GroupRenderNode<ScrollViewRenderViewModel> {
  ScrollViewRenderNode(int id, String className, RenderTree root,
      ControllerManager controllerManager, VoltronMap? props, bool isLazy)
      : super(id, className, root, controllerManager, props, isLazy);

  @override
  ScrollViewRenderViewModel createRenderViewModel(EngineContext context) {
    var originProps = props;
    if (originProps != null &&
        originProps.containsKey("horizontal") &&
        originProps.get<bool>("horizontal") == true) {
      return ScrollViewRenderViewModel(id, rootId, name, context, true);
    }
    return ScrollViewRenderViewModel(id, rootId, name, context);
  }
}

class ScrollViewRenderViewModel extends ScrollableModel {
  bool pagingEnable = false;
  double _initOffset = 0;
  bool flingEnable = false;
  bool scrollAnimationEndEventEnable = false;
  bool showScrollIndicator = false;
  bool isHorizontal = false;
  late ScrollViewDetailRenderViewModel scrollViewDetailRenderViewModel;

  double get initOffset => _initOffset;

  void setInitOffset(VoltronMap map) {
    if (isHorizontal) {
      var offset = map.get("x") ?? 0;
      _initOffset = offset;
    } else {
      var offset = map.get("y") ?? 0;
      _initOffset = offset;
    }
  }

  @override
  ScrollController createController() {
    return ScrollController(initialScrollOffset: _initOffset);
  }

  void scrollTo(double offset, int duration) {
    if (offset >= 0) {
      // 预防滑动超出之后的异常回弹
      var finalOffset = offset < scrollController.position.maxScrollExtent
          ? offset
          : scrollController.position.maxScrollExtent;
      if (duration > 0) {
        scrollController.animateTo(finalOffset,
            duration: Duration(milliseconds: duration),
            curve: Curves.linearToEaseOut);
      } else {
        scrollController.jumpTo(finalOffset);
      }
    }
  }

  @override
  bool interceptChildPosition() {
    return true;
  }

  ScrollViewRenderViewModel(
      int id, int instanceId, String className, EngineContext context,
      [this.isHorizontal = false])
      : super(id, instanceId, className, context);

  ScrollViewRenderViewModel.copy(int id, int instanceId, String className,
      EngineContext context, ScrollViewRenderViewModel viewModel,
      [this.isHorizontal = false])
      : super.copy(id, instanceId, className, context, viewModel) {
    pagingEnable = viewModel.pagingEnable;
    flingEnable = viewModel.flingEnable;
    scrollAnimationEndEventEnable = viewModel.scrollAnimationEndEventEnable;
    showScrollIndicator = viewModel.showScrollIndicator;
    isHorizontal = viewModel.isHorizontal;
    scrollGestureDispatcher = viewModel.scrollGestureDispatcher;

    scrollViewDetailRenderViewModel = ScrollViewDetailRenderViewModel(
        viewModel.children,
        viewModel.context.renderManager.controllerManager,
        viewModel.scrollController,
        viewModel.scrollGestureDispatcher,
        viewModel.pagingEnable,
        viewModel.isHorizontal,
        viewModel.showScrollIndicator);
  }

  @override
  bool operator ==(Object other) {
    return other is ScrollViewRenderViewModel &&
        pagingEnable == other.pagingEnable &&
        flingEnable == other.flingEnable &&
        scrollAnimationEndEventEnable == other.scrollAnimationEndEventEnable &&
        showScrollIndicator == other.showScrollIndicator &&
        isHorizontal == other.isHorizontal &&
        super == other;
  }

  @override
  int get hashCode =>
      pagingEnable.hashCode |
      flingEnable.hashCode |
      scrollAnimationEndEventEnable.hashCode |
      showScrollIndicator.hashCode |
      isHorizontal.hashCode |
      super.hashCode;
}

class ScrollViewDetailRenderViewModel {
  final List<RenderViewModel> children = [];
  final ControllerManager controllerManager;
  final ScrollController controller;
  final NativeScrollGestureDispatcher scrollGestureDispatcher;
  bool showScrollIndicator = false;
  bool isHorizontal = false;
  bool pagingEnable = false;

  ScrollViewDetailRenderViewModel(
      List<RenderViewModel> childrenList,
      this.controllerManager,
      this.controller,
      this.scrollGestureDispatcher,
      this.pagingEnable,
      this.isHorizontal,
      this.showScrollIndicator) {
    children.addAll(childrenList);
  }

  @override
  int get hashCode => super.hashCode;

  @override
  bool operator ==(Object other) =>
      other is ScrollViewDetailRenderViewModel &&
      DeepCollectionEquality().equals(children, other.children) &&
      controller == other.controller &&
      scrollGestureDispatcher == other.scrollGestureDispatcher &&
      pagingEnable == other.pagingEnable &&
      isHorizontal == other.isHorizontal &&
      showScrollIndicator == other.showScrollIndicator;
}
