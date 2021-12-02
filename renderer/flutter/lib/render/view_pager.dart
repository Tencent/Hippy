import 'package:flutter/widgets.dart';

import '../common/voltron_array.dart';
import '../common/voltron_map.dart';
import '../controller/manager.dart';
import '../controller/props.dart';
import '../dom/prop.dart';
import '../engine/engine_context.dart';
import '../module/event_dispatcher.dart';
import '../module/module.dart';
import '../module/promise.dart';
import '../util/enum_util.dart';
import '../widget/view_pager.dart';
import 'controller.dart';
import 'group.dart';
import 'tree.dart';

class ViewPagerController extends GroupController<ViewPagerRenderNode> {
  static const String className = "ViewPager";
  static const initialPage = "initialPage";
  static const pageMargin = "pageMarginFact";

  static const String funcSetPage = "setPage";
  static const String funcSetPageWidthoutAnim = "setPageWithoutAnimation";

  @override
  ViewPagerRenderNode createRenderNode(int id, VoltronMap? props, String name,
      RenderTree tree, ControllerManager controllerManager, bool lazy) {
    return ViewPagerRenderNode(
        id: id,
        className: name,
        root: tree,
        controllerManager: controllerManager,
        isLazy: lazy,
        props: props);
  }

  @override
  Widget createWidget(BuildContext context, ViewPagerRenderNode renderNode) {
    return ViewPagerWidget(renderNode.renderViewModel);
  }

  @override
  Map<String, ControllerMethodProp> get groupExtraMethodProp => {
        initialPage: ControllerMethodProp(setInitialPage, 0),
        NodeProps.scrollEnable: ControllerMethodProp(setScrollEnabled, true),
        pageMargin: ControllerMethodProp(setPageMargin, 0.0),
        NodeProps.overflow: ControllerMethodProp(setOverflow, "visible")
      };

  @override
  String get name => className;

  @ControllerProps(initialPage)
  void setInitialPage(ViewPagerRenderNode parent, int initialPage) {
    parent.renderViewModel.initialPage = initialPage;
  }

  @ControllerProps(NodeProps.scrollEnable)
  void setScrollEnabled(ViewPagerRenderNode viewPager, bool value) {
    viewPager.renderViewModel.scrollEnabled = value;
  }

  /// 在Android和iOS中这个属性为pageMargin，传入的是绝对值
  /// flutter中该属性传入的是比例，属性为pageMarginFact
  @ControllerProps(pageMargin)
  void setPageMargin(ViewPagerRenderNode pager, double margin) {
    pager.renderViewModel.pageMargin = margin;
  }

  @ControllerProps(NodeProps.overflow)
  void setOverflow(ViewPagerRenderNode pager, String overflow) {
    pager.renderViewModel.overflow = overflow;
  }

  @override
  void dispatchFunction(
      ViewPagerRenderNode? node, String functionName, VoltronArray array,
      {Promise? promise}) {
    if (node == null) {
      return;
    }

    if (functionName == funcSetPage) {
      Object selected = array.get(0);
      if (selected is int &&
          selected >= 0 &&
          selected < node.renderViewModel.children.length) {
        node.renderViewModel.pageController?.animateToPage(selected,
            duration: Duration(milliseconds: 300),
            curve: Curves.linearToEaseOut);
      }
    } else if (functionName == funcSetPageWidthoutAnim) {
      Object selected = array.get(0);
      if (selected is int &&
          selected >= 0 &&
          selected < node.renderViewModel.children.length) {
        node.renderViewModel.pageController?.animateToPage(selected,
            duration: Duration(milliseconds: 40),
            curve: Curves.linearToEaseOut);
      }
    }
  }
}

class ViewPagerRenderNode extends GroupRenderNode<ViewPagerRenderViewModel> {
  ViewPagerRenderNode(
      {required int id,
      required String className,
      required RenderTree root,
      required ControllerManager controllerManager,
      VoltronMap? props,
      bool isLazy = false})
      : super(id, className, root, controllerManager, props, isLazy);

  @override
  ViewPagerRenderViewModel createRenderViewModel(EngineContext context) {
    return ViewPagerRenderViewModel(
        id: id, instanceId: rootId, className: name, context: context);
  }
}

class ViewPagerRenderViewModel extends GroupViewModel {
  bool scrollEnabled = true;
  int initialPage = 0;
  double pageMargin = 0;
  String overflow = '';

  bool _scrollFlingStartHandle = false;

  PageController? pageController;

  ViewPagerRenderViewModel(
      {required int id,
      required int instanceId,
      required String className,
      required EngineContext context})
      : super(id, instanceId, className, context);

  ViewPagerRenderViewModel.copy(
      {required int id,
      required int instanceId,
      required String className,
      required EngineContext context,
      required ViewPagerRenderViewModel viewModel})
      : super.copy(id, instanceId, className, context, viewModel) {
    scrollEnabled = viewModel.scrollEnabled;
    initialPage = viewModel.initialPage;
    pageMargin = viewModel.pageMargin;
    overflow = viewModel.overflow;
    pageController = viewModel.pageController;
  }

  @override
  bool operator ==(Object other) {
    return other is ViewPagerRenderViewModel &&
        scrollEnabled == other.scrollEnabled &&
        initialPage == other.initialPage &&
        pageMargin == other.pageMargin &&
        overflow == other.overflow &&
        super == other;
  }

  @override
  int get hashCode =>
      scrollEnabled.hashCode |
      initialPage.hashCode |
      pageMargin.hashCode |
      overflow.hashCode |
      super.hashCode;

  void onPageChanged(int page) {
    onPageSelect(page);
  }

  void setController(PageController controller) {
    pageController?.dispose();
    pageController = controller;
  }

  void onScrollNotification(ScrollNotification scrollNotification) {
    var curPageController = pageController;
    if (curPageController == null) {
      return;
    }
    if (scrollNotification is ScrollStartNotification) {
      if (scrollNotification.dragDetails != null) {
        // dragDetails 非空表示手指开始拖动
        _scrollFlingStartHandle = false;
        // 开始拖动通知dragging state
        onPageScrollStateStart();
      } else {
        // dragDetails 表示fling手势开始
        _scrollFlingStartHandle = true;
        onPageScrollStateSettling();
      }
    } else if (scrollNotification is ScrollUpdateNotification) {
      var scrollOffset = scrollNotification.metrics.pixels;
      if (scrollNotification.dragDetails == null) {
        // dragDetails 表示fling中
        if (!_scrollFlingStartHandle) {
          _scrollFlingStartHandle = true;
          onPageScrollStateSettling();
        }
      }
      onPageScroll(curPageController.page?.toInt() ?? 0, scrollOffset);
    } else if (scrollNotification is ScrollEndNotification) {
      onPageScrollStateIdle();
    }
  }

  void onPageScrollStateStart() {
    setScrollState("dragging");
  }

  void onPageScrollStateSettling() {
    setScrollState("settling");
  }

  void onPageScrollStateIdle() {
    setScrollState("idle");
  }

  @override
  void onDispose() {
    super.onDispose();
    pageController?.dispose();
    pageController = null;
  }

  void setScrollState(String pageScrollState) {
    var map = VoltronMap();
    map.push("pageScrollState", pageScrollState);
    context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveUIComponentEvent(id, "onPageScrollStateChanged", map);
  }

  void onPageSelect(int page) {
    var map = VoltronMap();
    map.push("position", page);
    context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveUIComponentEvent(id, "onPageSelected", map);
  }

  void onPageScroll(int position, double offset) {
    var map = VoltronMap();
    map.push("position", position);
    map.push("offset", offset);
    context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveUIComponentEvent(id, "onPageScroll", map);
  }
}

class ViewPagerItemController
    extends VoltronViewController<ViewPagerItemRenderNode> {
  static const String className = "ViewPagerItem";

  @override
  ViewPagerItemRenderNode createRenderNode(
      int id,
      VoltronMap? props,
      String name,
      RenderTree tree,
      ControllerManager controllerManager,
      bool lazy) {
    return ViewPagerItemRenderNode(
        id: id,
        root: tree,
        className: name,
        controllerManager: controllerManager,
        isLazy: lazy,
        props: props);
  }

  @override
  Widget createWidget(
      BuildContext context, ViewPagerItemRenderNode renderNode) {
    return ViewPagerItemWidget(renderNode.renderViewModel);
  }

  @override
  Map<String, ControllerMethodProp> get extendRegisteredMethodProp => {};

  @override
  String get name => className;

  @override
  bool shouldInterceptLayout(ViewPagerItemRenderNode node) {
    return true;
  }
}

class ViewPagerItemRenderViewModel extends GroupViewModel {
  ViewPagerItemRenderViewModel(
      {required int id,
      required int instanceId,
      required String className,
      required EngineContext context})
      : super(id, instanceId, className, context);

  ViewPagerItemRenderViewModel.copy(int id, int instanceId, String className,
      EngineContext context, ViewPagerItemRenderViewModel viewModel)
      : super.copy(id, instanceId, className, context, viewModel);

  @override
  bool operator ==(Object other) {
    return other is ViewPagerItemRenderViewModel && super == (other);
  }

  @override
  int get hashCode => super.hashCode;
}

class ViewPagerItemRenderNode
    extends GroupRenderNode<ViewPagerItemRenderViewModel> {
  ViewPagerItemRenderNode({
    required int id,
    required String className,
    required RenderTree root,
    required ControllerManager controllerManager,
    VoltronMap? props,
    bool isLazy = false,
  }) : super(id, className, root, controllerManager, props, isLazy);

  @override
  ViewPagerItemRenderViewModel createRenderViewModel(EngineContext context) {
    return ViewPagerItemRenderViewModel(
        id: id, instanceId: rootId, className: name, context: context);
  }
}
