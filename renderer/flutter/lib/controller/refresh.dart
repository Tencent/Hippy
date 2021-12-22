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
  static const kPreloadItemSize = "preloadItemSize";
  static const String kClassName = "RefreshWrapper";
  static const String kRefreshComplected = "refreshComplected";
  static const String kStartRefresh = "startRefresh";

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
        NodeProps.kBounceTime: ControllerMethodProp(bounceTime, 300),
        NodeProps.kOnScrollEnable:
            ControllerMethodProp(setOnScrollEventEnable, true),
        NodeProps.kScrollEventThrottle:
            ControllerMethodProp(setScrollEventThrottle, 400),
        kPreloadItemSize: ControllerMethodProp(setPreloadItemSize, 0.0),
      };

  @override
  String get name => kClassName;

  @ControllerProps(NodeProps.kBounceTime)
  void bounceTime(
      RefreshWrapperRenderViewModel renderViewModel, int bounceTime) {
    renderViewModel.bounceTime = bounceTime;
  }

  @ControllerProps(NodeProps.kOnScrollEnable)
  void setOnScrollEventEnable(
      RefreshWrapperRenderViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.scrollEnable = flag;
  }

  @ControllerProps(NodeProps.kScrollEventThrottle)
  void setScrollEventThrottle(
      RefreshWrapperRenderViewModel renderViewModel, int scrollEventThrottle) {
    renderViewModel.scrollGestureDispatcher.scrollEventThrottle =
        scrollEventThrottle;
  }

  @ControllerProps(kPreloadItemSize)
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
    if (kRefreshComplected == functionName) {
      renderViewModel.refreshEventDispatcher.refreshComplected();
    } else if (kStartRefresh == functionName) {
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
    _handleEvent(NodeProps.kOnRefresh);
  }
}
