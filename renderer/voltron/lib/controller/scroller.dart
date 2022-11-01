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

import '../common.dart';
import '../controller.dart';
import '../render.dart';
import '../style.dart';
import '../viewmodel.dart';
import '../widget.dart';

class ScrollViewController extends BaseGroupController<ScrollViewRenderViewModel> {
  static const String kScrollTo = "scrollTo";
  static const String kScrollToWithOptions = "scrollToWithOptions";

  static const String kShowScrollIndicator = "showScrollIndicator";
  static const String kShowsHorizontalScrollIndicator = "showsHorizontalScrollIndicator";
  static const String kShowsVerticalScrollIndicator = "showsVerticalScrollIndicator";
  static const String kOnScrollAnimationEnd = "onScrollAnimationEnd";
  static const String kFlingEnabled = "flingEnabled";
  static const String kContentOffsetForReuse = "contentOffset4Reuse";
  static const String kPagingEnabled = "pagingEnabled";
  static const String kBounces = "bounces";

  static const String kClassName = "ScrollView";

  @override
  ScrollViewRenderViewModel createRenderViewModel(RenderNode node, RenderContext context) {
    var originProps = node.props;
    if (originProps != null &&
        originProps.containsKey("horizontal") &&
        originProps.get<bool>("horizontal") == true) {
      return ScrollViewRenderViewModel(node.id, node.rootId, node.name, context, true);
    }
    return ScrollViewRenderViewModel(node.id, node.rootId, node.name, context);
  }

  @override
  Widget createWidget(BuildContext context, ScrollViewRenderViewModel viewModel) {
    return ScrollViewWidget(viewModel);
  }

  @override
  Map<String, ControllerMethodProp> get groupExtraMethodProp => {
        NodeProps.kOnScrollBeginDrag: ControllerMethodProp(
            setScrollBeginDragEventEnable, true),
        NodeProps.kOnScrollEndDrag: ControllerMethodProp(
            setScrollEndDragEventEnable, true),
        NodeProps.kOnMomentumScrollBegin: ControllerMethodProp(
            setMomentumScrollBeginEventEnable, true),
        NodeProps.kOnMomentumScrollEnd: ControllerMethodProp(
            setMomentumScrollEndEventEnable, true),
        NodeProps.kOnScrollEnable:
            ControllerMethodProp(setScrollEventEnable, true),
        NodeProps.kScrollEnable:
            ControllerMethodProp(setScrollEnabled, true),
        NodeProps.kScrollEventThrottle:
            ControllerMethodProp(setScrollEventThrottle, 30),
        kShowScrollIndicator:
            ControllerMethodProp(setShowScrollIndicator, false),
        kShowsHorizontalScrollIndicator:
            ControllerMethodProp(setShowScrollIndicator, false),
        kShowsVerticalScrollIndicator:
            ControllerMethodProp(setShowScrollIndicator, false),
        kOnScrollAnimationEnd: ControllerMethodProp(
            setScrollAnimationEndEventEnable, false),
        kFlingEnabled: ControllerMethodProp(setFlingEnabled, true),
        kContentOffsetForReuse: ControllerMethodProp(
            setContentOffset4Reuse, null),
        kPagingEnabled:
            ControllerMethodProp(setPagingEnabled, false),
        kBounces: ControllerMethodProp(setBounces, true),
      };

  @override
  String get name => kClassName;

  @ControllerProps(NodeProps.kScrollEnable)
  void setScrollEnabled(ScrollViewRenderViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.scrollEnable = flag;
  }

  @ControllerProps(kShowScrollIndicator)
  void setShowScrollIndicator(ScrollViewRenderViewModel renderViewModel, bool flag) {
    renderViewModel.showScrollIndicator = flag;
  }

  @ControllerProps(NodeProps.kOnScrollEnable)
  void setScrollEventEnable(
    ScrollViewRenderViewModel renderViewModel,
    bool flag,
  ) {
    renderViewModel.scrollGestureDispatcher.scrollEventEnable = flag;
  }

  @ControllerProps(NodeProps.kOnScrollBeginDrag)
  void setScrollBeginDragEventEnable(ScrollViewRenderViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.scrollBeginDragEventEnable = flag;
  }

  @ControllerProps(NodeProps.kOnScrollEndDrag)
  void setScrollEndDragEventEnable(ScrollViewRenderViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.scrollEndDragEventEnable = flag;
  }

  @ControllerProps(NodeProps.kOnMomentumScrollBegin)
  void setMomentumScrollBeginEventEnable(ScrollViewRenderViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.momentumScrollBeginEventEnable = flag;
  }

  @ControllerProps(NodeProps.kOnMomentumScrollEnd)
  void setMomentumScrollEndEventEnable(ScrollViewRenderViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.momentumScrollEndEventEnable = flag;
  }

  @ControllerProps(kOnScrollAnimationEnd)
  void setScrollAnimationEndEventEnable(ScrollViewRenderViewModel renderViewModel, bool flag) {
    renderViewModel.scrollAnimationEndEventEnable = flag;
  }

  @ControllerProps(kFlingEnabled)
  void setFlingEnabled(ScrollViewRenderViewModel renderViewModel, bool flag) {
    renderViewModel.flingEnable = flag;
  }

  @ControllerProps(kBounces)
  void setBounces(ScrollViewRenderViewModel renderViewModel, bool flag) {
    renderViewModel.bounces = flag;
  }

  @ControllerProps(kContentOffsetForReuse)
  void setContentOffset4Reuse(
    ScrollViewRenderViewModel renderViewModel,
    VoltronMap? offsetMap,
  ) {
    if (offsetMap != null) {
      renderViewModel.setInitOffset(offsetMap);
    }
  }

  @ControllerProps(kPagingEnabled)
  void setPagingEnabled(
    ScrollViewRenderViewModel renderViewModel,
    bool pagingEnabled,
  ) {
    renderViewModel.pagingEnable = pagingEnabled;
  }

  @ControllerProps(NodeProps.kScrollEventThrottle)
  void setScrollEventThrottle(
    ScrollViewRenderViewModel renderViewModel,
    int scrollEventThrottle,
  ) {
    renderViewModel.scrollGestureDispatcher.scrollEventThrottle = scrollEventThrottle;
  }

  @override
  void dispatchFunction(
    ScrollViewRenderViewModel viewModel,
    String functionName,
    VoltronArray array, {
    Promise? promise,
  }) {
    super.dispatchFunction(
      viewModel,
      functionName,
      array,
      promise: promise,
    );
    // 滚动事件
    if (functionName == kScrollTo) {
      // 先确定滚动方向
      var orientation = 'vertical';
      if (viewModel.isHorizontal) {
        orientation = 'horizontal';
      }
      // 再确定滚动值
      final destX = array.get<double>(0) ?? array.get<int>(0)?.toDouble() ?? 0.0;
      final destY = array.get<double>(1) ?? array.get<int>(1)?.toDouble() ?? 0.0;
      final animated = array.get<bool>(2) ?? true;
      var offset = destY;
      if (orientation == 'horizontal') {
        offset = destX;
      }
      viewModel.scrollTo(offset, animated ? 1000 : 0);
    } else if (functionName == kScrollToWithOptions) {
      // 先确定滚动方向
      var orientation = 'vertical';
      if (viewModel.isHorizontal) {
        orientation = 'horizontal';
      }
      // 再确定滚动值
      final m = array.get(0);
      if (m is VoltronMap) {
        final destX = m.get<double>("x") ?? m.get<int>("x")?.toDouble() ?? 0.0;
        final destY = m.get<double>("y") ?? m.get<int>("y")?.toDouble() ?? 0.0;
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
        viewModel.scrollTo(offset, d);
      }
    }
  }
}
