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

  bool _scrollFlingStartHandle = false;

  PageController? pageController;

  ViewPagerRenderViewModel(
      {required int id,
      required int instanceId,
      required String className,
      required RenderContext context})
      : super(id, instanceId, className, context);

  ViewPagerRenderViewModel.copy(
      {required int id,
      required int instanceId,
      required String className,
      required RenderContext context,
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
  ViewPagerItemRenderViewModel(
      {required int id,
      required int instanceId,
      required String className,
      required RenderContext context})
      : super(id, instanceId, className, context);

  ViewPagerItemRenderViewModel.copy(int id, int instanceId, String className,
      RenderContext context, ViewPagerItemRenderViewModel viewModel)
      : super.copy(id, instanceId, className, context, viewModel);
}
