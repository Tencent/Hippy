import 'package:flutter/widgets.dart';
// ignore: import_of_legacy_library_into_null_safe
import 'package:pull_to_refresh/pull_to_refresh.dart';

import '../common/voltron_array.dart';
import '../common/voltron_map.dart';
import '../controller/manager.dart';
import '../controller/props.dart';
import '../dom/prop.dart';
import '../engine/engine_context.dart';
import '../flutter_render.dart';
import '../module/event_dispatcher.dart';
import '../module/module.dart';
import '../module/promise.dart';
import '../util/enum_util.dart';
import '../widget/refresh.dart';
import 'group.dart';
import 'list.dart';
import 'refresh_item.dart';
import 'tree.dart';
import 'view_model.dart';

enum RefreshState {
  init,
  loading,
}

class RefreshWrapperController
    extends GroupController<RefreshWrapperRenderNode> {
  static const preloadItemSize = "preloadItemSize";
  static const String className = "RefreshWrapper";
  static const String refreshComplected = "refreshComplected";
  static const String startRefresh = "startRefresh";

  @override
  RefreshWrapperRenderNode createRenderNode(
      int id,
      VoltronMap? props,
      String name,
      RenderTree tree,
      ControllerManager controllerManager,
      bool lazy) {
    return RefreshWrapperRenderNode(
        id, name, tree, controllerManager, props, lazy);
  }

  @override
  Widget createWidget(
      BuildContext context, RefreshWrapperRenderNode renderNode) {
    return RefreshWrapperWidget(renderNode.renderViewModel);
  }

  @override
  Map<String, ControllerMethodProp> get groupExtraMethodProp => {
        NodeProps.bounceTime: ControllerMethodProp(bounceTime, 300),
        NodeProps.onScrollEnable:
            ControllerMethodProp(setOnScrollEventEnable, true),
        NodeProps.scrollEventThrottle:
            ControllerMethodProp(setScrollEventThrottle, 400),
        preloadItemSize: ControllerMethodProp(setPreloadItemSize, 0.0),
      };

  @override
  String get name => className;

  @ControllerProps(NodeProps.bounceTime)
  void bounceTime(RefreshWrapperRenderNode node, int bounceTime) {
    node.renderViewModel.bounceTime = bounceTime;
  }

  @ControllerProps(NodeProps.onScrollEnable)
  void setOnScrollEventEnable(RefreshWrapperRenderNode node, bool flag) {
    node.renderViewModel.scrollGestureDispatcher.scrollEnable = flag;
  }

  @ControllerProps(NodeProps.scrollEventThrottle)
  void setScrollEventThrottle(
      RefreshWrapperRenderNode node, int scrollEventThrottle) {
    node.renderViewModel.scrollGestureDispatcher.scrollEventThrottle =
        scrollEventThrottle;
  }

  @ControllerProps(preloadItemSize)
  void setPreloadItemSize(
      RefreshWrapperRenderNode node, double preloadItemSize) {
    node.renderViewModel.preloadSize = preloadItemSize;
  }

  @override
  void dispatchFunction(
      RefreshWrapperRenderNode node, String functionName, VoltronArray array,
      {Promise? promise}) {
    super.dispatchFunction(node, functionName, array, promise: promise);
    if (refreshComplected == functionName) {
      node.renderViewModel._refreshEventDispatcher.refreshComplected();
    } else if (startRefresh == functionName) {
      node.renderViewModel._refreshEventDispatcher.startRefresh();
    }
  }
}

class RefreshWrapperRenderNode
    extends GroupRenderNode<RefreshWrapperRenderViewModel> {
  RefreshWrapperRenderNode(int id, String className, RenderTree root,
      ControllerManager controllerManager, VoltronMap? props, bool isLazy)
      : super(id, className, root, controllerManager, props, isLazy);

  @override
  RefreshWrapperRenderViewModel createRenderViewModel(EngineContext context) {
    return RefreshWrapperRenderViewModel(id, rootId, name, context);
  }
}

class RefreshWrapperRenderViewModel extends ScrollableModel {
  RefreshWrapperItemRenderViewModel? _refreshWrapperItemRenderViewModel;
  late RefreshEventDispatcher _refreshEventDispatcher;
  RenderViewModel? _content;

  int bounceTime = 300;
  double? preloadSize;

  RenderViewModel? get content => _content;
  RefreshWrapperItemRenderViewModel? get header =>
      _refreshWrapperItemRenderViewModel;
  RefreshController get controller =>
      _refreshEventDispatcher._refreshController;
  RefreshEventDispatcher get dispatcher => _refreshEventDispatcher;

  late RefreshWrapperRenderContentViewModel
      refreshWrapperRenderContentViewModel;

  RefreshWrapperRenderViewModel(
      int id, int instanceId, String className, EngineContext context)
      : super(id, instanceId, className, context) {
    _refreshEventDispatcher = createRefreshDispatcher();
  }

  RefreshWrapperRenderViewModel.copy(int id, int instanceId, String className,
      EngineContext context, RefreshWrapperRenderViewModel viewModel)
      : super.copy(id, instanceId, className, context, viewModel) {
    _refreshWrapperItemRenderViewModel = viewModel.header;
    _refreshEventDispatcher = viewModel.dispatcher;
    _content = viewModel.content;
    bounceTime = viewModel.bounceTime;
    preloadSize = viewModel.preloadSize;
    scrollGestureDispatcher = viewModel.scrollGestureDispatcher;
    refreshWrapperRenderContentViewModel = RefreshWrapperRenderContentViewModel(
        header: viewModel.header,
        content: viewModel.content,
        controller: viewModel.controller,
        dispatcher: viewModel.dispatcher);
  }

  @override
  bool operator ==(Object other) {
    return other is RefreshWrapperRenderViewModel &&
        _content == other.content &&
        bounceTime == other.bounceTime &&
        preloadSize == other.preloadSize;
  }

  @override
  int get hashCode =>
      _content.hashCode | bounceTime.hashCode | preloadSize.hashCode;

  RefreshEventDispatcher createRefreshDispatcher() {
    return RefreshEventDispatcher(id, context);
  }

  @override
  ScrollController createController() {
    return TrackingScrollController(initialScrollOffset: 0);
  }

  @override
  void addViewModel(RenderViewModel child, int index) {
    if (child is RefreshWrapperItemRenderViewModel) {
      _refreshWrapperItemRenderViewModel = child;
    } else {
      _content = child;
    }
    super.addViewModel(child, index);
  }

  @override
  void doDispose() {
    super.doDispose();
    controller.dispose();
  }
}

class RefreshWrapperRenderContentViewModel {
  RefreshWrapperItemRenderViewModel? header;
  RenderViewModel? content;
  RefreshController controller;
  RefreshEventDispatcher dispatcher;

  RefreshWrapperRenderContentViewModel(
      {this.header,
      this.content,
      required this.controller,
      required this.dispatcher});

  @override
  int get hashCode => super.hashCode;

  @override
  bool operator ==(Object other) =>
      other is RefreshWrapperRenderContentViewModel &&
      header == other.header &&
      content == other.content &&
      controller == other.controller &&
      dispatcher == other.dispatcher;
}

class RefreshEventDispatcher {
  final int _id;
  final EngineContext _context;

  final RefreshController _refreshController =
      RefreshController(initialRefresh: false);

  RefreshEventDispatcher(this._id, this._context);

  void _handleEvent(String type) {
    _context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveUIComponentEvent(_id, type, null);
  }

  void refreshComplected() {
    _refreshController.refreshCompleted();
  }

  void startRefresh() {
    _refreshController.requestRefresh(needMove: true);
    _handleEvent(NodeProps.onRefresh);
  }
}
