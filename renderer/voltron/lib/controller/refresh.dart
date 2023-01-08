//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

import 'package:flutter/widgets.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import 'package:voltron_renderer/voltron_renderer.dart';

enum RefreshState {
  init,
  loading,
}

class RefreshWrapperController extends BaseGroupController<RefreshWrapperRenderViewModel> {
  static const String kClassName = "RefreshWrapper";

  static const String kWrapperKey = "refresh_wrapper";

  static const String kEventRefresh = 'refresh';

  /// func
  static const String kFuncRefreshComplected = "refreshComplected";
  static const String kFuncStartRefresh = "startRefresh";

  @override
  RefreshWrapperRenderViewModel createRenderViewModel(RenderNode node, RenderContext context) {
    return RefreshWrapperRenderViewModel(node.id, node.rootId, node.name, context);
  }

  @override
  Widget createWidget(BuildContext context, RefreshWrapperRenderViewModel viewModel) {
    return RefreshWrapperWidget(viewModel);
  }

  @override
  Map<String, ControllerMethodProp> get groupExtraMethodProp => {
        NodeProps.kBounceTime: ControllerMethodProp(bounceTime, 300),
        NodeProps.kOnScrollEnable: ControllerMethodProp(setOnScrollEventEnable, true),
        NodeProps.kScrollEventThrottle: ControllerMethodProp(setScrollEventThrottle, 400),
        NodeProps.kPreloadItemSize: ControllerMethodProp(setPreloadItemSize, 0.0),
      };

  @override
  String get name => kClassName;

  @ControllerProps(NodeProps.kBounceTime)
  void bounceTime(
    RefreshWrapperRenderViewModel renderViewModel,
    int bounceTime,
  ) {
    renderViewModel.bounceTime = bounceTime;
  }

  @ControllerProps(NodeProps.kOnScrollEnable)
  void setOnScrollEventEnable(
    RefreshWrapperRenderViewModel renderViewModel,
    bool flag,
  ) {
    renderViewModel.scrollGestureDispatcher.scrollEnable = flag;
  }

  @ControllerProps(NodeProps.kScrollEventThrottle)
  void setScrollEventThrottle(
    RefreshWrapperRenderViewModel renderViewModel,
    int scrollEventThrottle,
  ) {
    renderViewModel.scrollGestureDispatcher.scrollEventThrottle = scrollEventThrottle;
  }

  @ControllerProps(NodeProps.kPreloadItemSize)
  void setPreloadItemSize(
    RefreshWrapperRenderViewModel renderViewModel,
    double preloadItemSize,
  ) {
    renderViewModel.preloadSize = preloadItemSize;
  }

  @override
  void dispatchFunction(
    RefreshWrapperRenderViewModel viewModel,
    String functionName,
    VoltronArray array, {
    Promise? promise,
  }) {
    super.dispatchFunction(viewModel, functionName, array, promise: promise);
    if (kFuncRefreshComplected == functionName) {
      viewModel.refreshEventDispatcher.refreshComplected();
    } else if (kFuncStartRefresh == functionName) {
      viewModel.refreshEventDispatcher.startRefresh();
    }
  }
}

class RefreshEventDispatcher {
  final int _rootId;
  final int _id;
  final RenderContext _context;

  final RefreshController _refreshController = RefreshController(
    initialRefresh: false,
  );

  RefreshController get refreshController => _refreshController;

  RefreshEventDispatcher(this._rootId, this._id, this._context);

  void refreshComplected() {
    _refreshController.refreshCompleted();
  }

  void loadingCompleted() {
    _refreshController.loadComplete();
  }

  void startRefresh() {
    _refreshController.requestRefresh(needMove: true);
    _context.renderBridgeManager.sendComponentEvent(
      _rootId,
      _id,
      RefreshWrapperController.kEventRefresh,
      {},
    );
  }
}
