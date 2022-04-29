//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2019 THL A29 Limited, a Tencent company.
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
import '../render.dart';
import 'group.dart';

class ViewPagerRenderViewModel extends GroupViewModel {
  bool scrollEnabled = true;
  int initialPage = 0;
  double pageMargin = 0;
  @override
  // ignore: overridden_fields
  String overflow = '';
  bool bounces = true;
  bool isVertical = false;

  bool _scrollFlingStartHandle = false;

  PageController? pageController;

  ViewPagerRenderViewModel({
    required int id,
    required int instanceId,
    required String className,
    required RenderContext context,
  }) : super(id, instanceId, className, context);

  ViewPagerRenderViewModel.copy({
    required int id,
    required int instanceId,
    required String className,
    required RenderContext context,
    required ViewPagerRenderViewModel viewModel,
  }) : super.copy(id, instanceId, className, context, viewModel) {
    scrollEnabled = viewModel.scrollEnabled;
    initialPage = viewModel.initialPage;
    pageMargin = viewModel.pageMargin;
    overflow = viewModel.overflow;
    pageController = viewModel.pageController;
    bounces = viewModel.bounces;
    isVertical = viewModel.isVertical;
  }

  @override
  bool operator ==(Object other) {
    return other is ViewPagerRenderViewModel &&
        scrollEnabled == other.scrollEnabled &&
        initialPage == other.initialPage &&
        bounces == other.bounces &&
        isVertical == other.isVertical &&
        pageMargin == other.pageMargin &&
        overflow == other.overflow &&
        super == other;
  }

  @override
  int get hashCode =>
      bounces.hashCode |
      scrollEnabled.hashCode |
      initialPage.hashCode |
      isVertical.hashCode |
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
    context.eventHandler.receiveUIComponentEvent(id, "onPageScrollStateChanged", map);
  }

  void onPageSelect(int page) {
    var map = VoltronMap();
    map.push("position", page);
    context.eventHandler.receiveUIComponentEvent(id, "onPageSelected", map);
  }

  void onPageScroll(int position, double offset) {
    var map = VoltronMap();
    map.push("position", position);
    map.push("offset", offset);
    context.eventHandler.receiveUIComponentEvent(id, "onPageScroll", map);
  }
}

class ViewPagerItemRenderViewModel extends GroupViewModel {
  ViewPagerItemRenderViewModel({
    required int id,
    required int instanceId,
    required String className,
    required RenderContext context,
  }) : super(id, instanceId, className, context);

  ViewPagerItemRenderViewModel.copy(
    int id,
    int instanceId,
    String className,
    RenderContext context,
    ViewPagerItemRenderViewModel viewModel,
  ) : super.copy(id, instanceId, className, context, viewModel);
}
