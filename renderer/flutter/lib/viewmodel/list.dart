import 'package:collection/collection.dart';
import 'package:flutter/widgets.dart';

import '../controller.dart';
import '../engine.dart';
import '../gesture.dart';
import 'group.dart';
import 'list_item.dart';
import 'view_model.dart';

class ListViewModel extends ScrollableModel {
  static const String wrapperKey = "refresh_wrapper";

  bool showScrollIndicator = false;
  bool hasStickyItem = false;
  double preloadSize = 0;
  double initOffset = 0;
  // 间距相关
  double paddingTop = 0.0;
  double paddingRight = 0.0;
  double paddingBottom = 0.0;
  double paddingLeft = 0.0;

  late ListViewDetailModel listViewDetailModel;

  RefreshWrapperDelegate? get refreshWrapper =>
      getExtraInfo<RefreshWrapperDelegate>(wrapperKey);

  ListViewModel(int id, int instanceId, String className, EngineContext context)
      : super(id, instanceId, className, context);

  ListViewModel.copy(int id, int instanceId, String className,
      EngineContext context, ListViewModel viewModel)
      : super.copy(id, instanceId, className, context, viewModel) {
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
    var isSticky = false;
    if (viewModel.hasStickyItem) {
      if (viewModel.children.isNotEmpty) {
        var curList = <RenderViewModel>[];
        for (var element in viewModel.children) {
          if (element is ListItemViewModel && element.shouldSticky) {
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

        if (curList.isNotEmpty) {
          stickyList.add(curList);
        }
      }
    }
    hasStickyItem = isSticky;
    listViewDetailModel = ListViewDetailModel(
      childrenList: viewModel.children,
      preloadSize: viewModel.preloadSize,
      controller: viewModel.scrollController,
      scrollGestureDispatcher: viewModel.scrollGestureDispatcher,
      delegate: viewModel.refreshWrapper,
      showScrollIndicator: viewModel.showScrollIndicator,
      hasStickyItem: hasStickyItem,
      stickyList: stickyList,
      paddingTop: viewModel.paddingTop,
      paddingRight: viewModel.paddingRight,
      paddingBottom: viewModel.paddingBottom,
      paddingLeft: viewModel.paddingLeft,
    );
  }

  @override
  bool operator ==(Object other) {
    return other is ListViewModel &&
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
        scrollController.animateTo(finalOffset,
            duration: Duration(milliseconds: duration),
            curve: Curves.linearToEaseOut);
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
}

class ListViewDetailModel {
  final List<RenderViewModel> children = [];
  final double preloadSize;
  final ScrollController controller;
  final NativeScrollGestureDispatcher scrollGestureDispatcher;
  final bool hasStickyItem;
  final bool showScrollIndicator;
  final List<List<RenderViewModel>> stickyChildList = [];
  final RefreshWrapperDelegate? delegate;
  final double paddingTop;
  final double paddingRight;
  final double paddingBottom;
  final double paddingLeft;

  ListViewDetailModel(
      {@required List<RenderViewModel>? childrenList,
      this.preloadSize = 0,
      required this.controller,
      required this.scrollGestureDispatcher,
      this.hasStickyItem = false,
      this.showScrollIndicator = false,
      this.delegate,
      this.paddingTop = 0.0,
      this.paddingRight = 0.0,
      this.paddingBottom = 0.0,
      this.paddingLeft = 0.0,
      List<List<RenderViewModel>>? stickyList}) {
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
      children.hashCode | preloadSize.hashCode | controller.hashCode;

  @override
  bool operator ==(Object other) =>
      other is ListViewDetailModel &&
      DeepCollectionEquality().equals(children, other.children) &&
      preloadSize == other.preloadSize &&
      controller == other.controller &&
      showScrollIndicator == other.showScrollIndicator &&
      hasStickyItem == other.hasStickyItem &&
      DeepCollectionEquality().equals(stickyChildList, other.stickyChildList) &&
      paddingTop == other.paddingTop &&
      paddingRight == other.paddingRight &&
      paddingBottom == other.paddingBottom &&
      paddingLeft == other.paddingLeft &&
      scrollGestureDispatcher == other.scrollGestureDispatcher &&
      delegate == other.delegate;
}

abstract class ScrollableModel extends GroupViewModel {
  late NativeScrollGestureDispatcher scrollGestureDispatcher;

  @override
  NativeGestureDispatcher createDispatcher() {
    scrollGestureDispatcher =
        NativeScrollGestureDispatcher(id: id, context: context);
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
      int id, int instanceId, String className, EngineContext context)
      : super(id, instanceId, className, context);

  ScrollableModel.copy(int id, int instanceId, String className,
      EngineContext context, GroupViewModel viewModel)
      : super.copy(id, instanceId, className, context, viewModel);

  @override
  bool operator ==(Object other) {
    return super == other;
  }

  @override
  int get hashCode => super.hashCode;

  @override
  void onViewModelDestroy() {
    super.onViewModelDestroy();
  }

  @override
  void onDispose() {
    super.onDispose();
    _scrollController?.dispose();
    _scrollController = null;
  }
}
