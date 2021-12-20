import 'package:flutter/widgets.dart';
// ignore: import_of_legacy_library_into_null_safe
import 'package:pull_to_refresh/pull_to_refresh.dart';

import '../common.dart';
import '../controller.dart';
import '../engine.dart';
import '../module.dart';
import '../render.dart';
import '../style.dart';
import '../util.dart';
import '../viewmodel.dart';
import '../widget.dart';
import 'group.dart';

enum RefreshState {
  init,
  loading,
}

class RefreshWrapperController
    extends BaseGroupController<RefreshWrapperRenderViewModel> {
  static const preloadItemSize = "preloadItemSize";
  static const String className = "RefreshWrapper";
  static const String refreshComplected = "refreshComplected";
  static const String startRefresh = "startRefresh";

  @override
  RefreshWrapperRenderViewModel createRenderViewModel(
      RenderNode node, EngineContext context) {
    return RefreshWrapperRenderViewModel(
        node.id, node.rootId, node.name, context);
  }

  @override
  Widget createWidget(
      BuildContext context, RefreshWrapperRenderViewModel renderViewModel) {
    return RefreshWrapperWidget(renderViewModel);
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
  void bounceTime(
      RefreshWrapperRenderViewModel renderViewModel, int bounceTime) {
    renderViewModel.bounceTime = bounceTime;
  }

  @ControllerProps(NodeProps.onScrollEnable)
  void setOnScrollEventEnable(
      RefreshWrapperRenderViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.scrollEnable = flag;
  }

  @ControllerProps(NodeProps.scrollEventThrottle)
  void setScrollEventThrottle(
      RefreshWrapperRenderViewModel renderViewModel, int scrollEventThrottle) {
    renderViewModel.scrollGestureDispatcher.scrollEventThrottle =
        scrollEventThrottle;
  }

  @ControllerProps(preloadItemSize)
  void setPreloadItemSize(
      RefreshWrapperRenderViewModel renderViewModel, double preloadItemSize) {
    renderViewModel.preloadSize = preloadItemSize;
  }

  @override
  void dispatchFunction(RefreshWrapperRenderViewModel renderViewModel,
      String functionName, VoltronArray array,
      {Promise? promise}) {
    super.dispatchFunction(renderViewModel, functionName, array,
        promise: promise);
    if (refreshComplected == functionName) {
      renderViewModel.refreshEventDispatcher.refreshComplected();
    } else if (startRefresh == functionName) {
      renderViewModel.refreshEventDispatcher.startRefresh();
    }
  }
}

class RefreshEventDispatcher {
  final int _id;
  final EngineContext _context;

  final RefreshController _refreshController =
      RefreshController(initialRefresh: false);

  RefreshController get refreshController => _refreshController;

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
