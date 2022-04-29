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

import 'package:collection/collection.dart';
import 'package:flutter/widgets.dart';

import '../common.dart';
import '../controller.dart';
import '../gesture.dart';
import '../render.dart';
import '../viewmodel.dart';

class ListViewModel extends ScrollableModel {
  bool bounces = true;
  bool horizontal = false;
  bool showScrollIndicator = false;
  bool hasStickyItem = false;
  double preloadSize = 0;
  double initOffset = 0;

  // 间距相关
  double paddingTop = 0.0;
  double paddingRight = 0.0;
  double paddingBottom = 0.0;
  double paddingLeft = 0.0;

  // fire initialListReady when first screen render complete
  bool hasRemovePreDraw = false;

  ListPullHeaderViewModel? pullHeaderViewModel;
  ListPullFooterViewModel? pullFooterViewModel;

  late ListViewDetailModel listViewDetailModel;
  late RefreshEventDispatcher refreshEventDispatcher;

  RefreshWrapperDelegate? get refreshWrapper =>
      getExtraInfo<RefreshWrapperDelegate>(RefreshWrapperController.kWrapperKey);

  ListViewModel(
    int id,
    int instanceId,
    String className,
    RenderContext context,
  ) : super(id, instanceId, className, context) {
    refreshEventDispatcher = RefreshEventDispatcher(id, context);
  }

  ListViewModel.copy(
    int id,
    int instanceId,
    String className,
    RenderContext context,
    ListViewModel viewModel,
  ) : super.copy(id, instanceId, className, context, viewModel) {
    horizontal = viewModel.horizontal;
    bounces = viewModel.bounces;
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
    var realItemList = <ListItemViewModel>[];
    var isSticky = false;
    if (viewModel.hasStickyItem) {
      if (viewModel.children.isNotEmpty) {
        var curList = <RenderViewModel>[];
        for (var element in viewModel.children) {
          if (element is ListItemViewModel) {
            if (element.shouldSticky) {
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
        }
        if (curList.isNotEmpty) {
          stickyList.add(curList);
        }
      }
    }
    hasStickyItem = isSticky;
    if (!hasStickyItem) {
      realItemList = viewModel.children.whereType<ListItemViewModel>().toList();
    }
    listViewDetailModel = ListViewDetailModel(
      childrenList: viewModel.children,
      preloadSize: viewModel.preloadSize,
      controller: viewModel.scrollController,
      horizontal: viewModel.horizontal,
      bounces: viewModel.bounces,
      scrollGestureDispatcher: viewModel.scrollGestureDispatcher,
      refreshEventDispatcher: viewModel.refreshEventDispatcher,
      delegate: viewModel.refreshWrapper,
      showScrollIndicator: viewModel.showScrollIndicator,
      hasStickyItem: hasStickyItem,
      pullHeaderViewModel: viewModel.pullHeaderViewModel,
      pullFooterViewModel: viewModel.pullFooterViewModel,
      stickyList: stickyList,
      realItemList: realItemList,
      paddingTop: viewModel.paddingTop,
      paddingRight: viewModel.paddingRight,
      paddingBottom: viewModel.paddingBottom,
      paddingLeft: viewModel.paddingLeft,
      hasRemovePreDraw: viewModel.hasRemovePreDraw,
    );
  }

  @override
  bool operator ==(Object other) {
    return other is ListViewModel &&
        horizontal == other.horizontal &&
        bounces == other.bounces &&
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
      horizontal.hashCode |
      bounces.hashCode |
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

  @override
  void addViewModel(RenderViewModel child, int index) {
    if (child is ListPullHeaderViewModel) {
      pullHeaderViewModel = child;
    } else if (child is ListPullFooterViewModel) {
      pullFooterViewModel = child;
    }
    super.addViewModel(child, index);
  }

  @override
  void removeViewModel(RenderViewModel child) {
    if (child is ListPullHeaderViewModel) {
      pullHeaderViewModel = null;
    } else if (child is ListPullFooterViewModel) {
      pullFooterViewModel = null;
    }
    super.removeViewModel(child);
  }

  @override
  void dispose() {
    refreshEventDispatcher.refreshController.dispose();
    super.dispose();
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
        scrollController.animateTo(
          finalOffset,
          duration: Duration(milliseconds: duration),
          curve: Curves.linearToEaseOut,
        );
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

  void sendEvent(String eventName, VoltronMap params) {
    context.eventHandler.receiveUIComponentEvent(id, eventName, params);
  }
}

class ListViewDetailModel {
  final List<RenderViewModel> children = [];
  final double preloadSize;
  final ScrollController controller;
  final NativeScrollGestureDispatcher scrollGestureDispatcher;
  final bool hasStickyItem;
  final ListPullHeaderViewModel? pullHeaderViewModel;
  final ListPullFooterViewModel? pullFooterViewModel;
  final List<ListItemViewModel> realItemList;
  final bool bounces;
  final bool horizontal;
  final bool showScrollIndicator;
  final List<List<RenderViewModel>> stickyChildList = [];
  final RefreshWrapperDelegate? delegate;
  final double paddingTop;
  final double paddingRight;
  final double paddingBottom;
  final double paddingLeft;
  final RefreshEventDispatcher refreshEventDispatcher;
  final bool hasRemovePreDraw;

  ListViewDetailModel({
    @required List<RenderViewModel>? childrenList,
    this.preloadSize = 0,
    required this.controller,
    required this.scrollGestureDispatcher,
    required this.refreshEventDispatcher,
    this.horizontal = false,
    this.bounces = true,
    this.hasStickyItem = false,
    this.pullHeaderViewModel,
    this.pullFooterViewModel,
    this.realItemList = const [],
    this.showScrollIndicator = false,
    this.hasRemovePreDraw = false,
    this.delegate,
    this.paddingTop = 0.0,
    this.paddingRight = 0.0,
    this.paddingBottom = 0.0,
    this.paddingLeft = 0.0,
    List<List<RenderViewModel>>? stickyList,
  }) {
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
      children.hashCode |
      preloadSize.hashCode |
      controller.hashCode |
      horizontal.hashCode |
      bounces.hashCode |
      showScrollIndicator.hashCode |
      hasStickyItem.hashCode |
      hasStickyItem.hashCode |
      stickyChildList.hashCode |
      paddingTop.hashCode |
      paddingRight.hashCode |
      paddingBottom.hashCode |
      paddingLeft.hashCode |
      hasRemovePreDraw.hashCode |
      scrollGestureDispatcher.hashCode |
      delegate.hashCode;

  @override
  bool operator ==(Object other) =>
      other is ListViewDetailModel &&
      const DeepCollectionEquality().equals(children, other.children) &&
      preloadSize == other.preloadSize &&
      controller == other.controller &&
      horizontal == other.horizontal &&
      bounces == other.bounces &&
      showScrollIndicator == other.showScrollIndicator &&
      hasStickyItem == other.hasStickyItem &&
      const DeepCollectionEquality().equals(stickyChildList, other.stickyChildList) &&
      const DeepCollectionEquality().equals(realItemList, other.realItemList) &&
      paddingTop == other.paddingTop &&
      paddingRight == other.paddingRight &&
      paddingBottom == other.paddingBottom &&
      paddingLeft == other.paddingLeft &&
      scrollGestureDispatcher == other.scrollGestureDispatcher &&
      hasRemovePreDraw == other.hasRemovePreDraw &&
      delegate == other.delegate;
}

abstract class ScrollableModel extends GroupViewModel {
  late NativeScrollGestureDispatcher scrollGestureDispatcher;

  @override
  NativeGestureDispatcher createDispatcher() {
    scrollGestureDispatcher = NativeScrollGestureDispatcher(
      rootId: rootId,
      id: id,
      context: context,
    );
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
    int id,
    int instanceId,
    String className,
    RenderContext context,
  ) : super(id, instanceId, className, context);

  ScrollableModel.copy(
    int id,
    int instanceId,
    String className,
    RenderContext context,
    GroupViewModel viewModel,
  ) : super.copy(id, instanceId, className, context, viewModel);

  @override
  void onDispose() {
    super.onDispose();
    _scrollController?.dispose();
    _scrollController = null;
  }
}
