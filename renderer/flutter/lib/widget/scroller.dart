import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../gesture/scroll.dart';
import '../viewmodel/scroller.dart';
import '../viewmodel/view_model.dart';
import 'base.dart';
import 'div.dart';

class ScrollViewWidget extends FRStatefulWidget {
  final ScrollViewRenderViewModel _viewModel;

  ScrollViewWidget(this._viewModel) : super(_viewModel);

  @override
  State<StatefulWidget> createState() {
    return _ScrollViewWidgetState();
  }
}

class _ScrollViewWidgetState extends FRState<ScrollViewWidget> {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: widget._viewModel,
      child: Selector<ScrollViewRenderViewModel, ScrollViewRenderViewModel>(
        selector: (context, viewModel) {
          return ScrollViewRenderViewModel.copy(viewModel.id, viewModel.rootId,
              viewModel.name, viewModel.context, viewModel);
        },
        builder: (context, viewModel, _) {
          return PositionWidget(viewModel,
              child: Selector0<ScrollViewDetailRenderViewModel>(
                selector: (context) =>
                    viewModel.scrollViewDetailRenderViewModel,
                builder: (context, viewModel, _) => scrollView(viewModel),
              ));
        },
      ),
    );
  }

  Widget scrollView(ScrollViewDetailRenderViewModel widgetModel) {
    if (widgetModel.children.isEmpty) {
      return Container();
    }
    ScrollPhysics physics = BouncingScrollPhysics();
    if (!(widgetModel.scrollGestureDispatcher.enableScroll == true)) {
      physics = NeverScrollableScrollPhysics();
    } else {
      if (widgetModel.pagingEnable) {
        physics = PageScrollPhysics().applyTo(BouncingScrollPhysics());
      }
    }
    var direction = Axis.vertical;
    if (widgetModel.isHorizontal) {
      direction = Axis.horizontal;
    }

    var scrollView = SingleChildScrollView(
        scrollDirection: direction,
        controller: widgetModel.controller,
        physics: physics,
        // scrollView只允许有一个子节点，所以这里只需要生成第0个节点的widget即可
        child: direction == Axis.vertical
            ? Column(
                children: [
                  generateByViewModel(context, widgetModel.children[0]),
                ],
              )
            : Row(
                children: [
                  generateByViewModel(context, widgetModel.children[0]),
                ],
              ));

    Widget scrollBar = scrollView;
    if (widgetModel.showScrollIndicator) {
      scrollBar = Scrollbar(child: scrollView);
    }

    return ScrollNotificationListener(
        child: scrollBar,
        scrollGestureDispatcher: widgetModel.scrollGestureDispatcher,
        isHorizontal: widgetModel.isHorizontal,
        viewModel: viewModel());
  }

  RenderViewModel viewModel() {
    return widget._viewModel;
  }

  @override
  void dispose() {
    super.dispose();
    if (!widget._viewModel.isDispose) {
      widget._viewModel.onDispose();
    }
  }
}

class ScrollNotificationListener extends StatefulWidget {
  final NativeScrollGestureDispatcher scrollGestureDispatcher;
  final Widget child;
  final bool isHorizontal;
  final RenderViewModel viewModel;

  ScrollNotificationListener(
      {required this.scrollGestureDispatcher,
      required this.child,
      this.isHorizontal = false,
      required this.viewModel});

  @override
  State<StatefulWidget> createState() {
    return _ScrollNotificationListenerState();
  }
}

class _ScrollNotificationListenerState
    extends State<ScrollNotificationListener> {
  static const double extraScrollEndOffset = 5;
  bool _scrollFlingStartHandle = false;
  bool _hasReachEnd = false;

  @override
  Widget build(BuildContext context) {
    if (widget.scrollGestureDispatcher.needListenScroll) {
      return NotificationListener<ScrollNotification>(
          child: widget.child,
          onNotification: (scrollNotification) {
            if (scrollNotification is ScrollStartNotification) {
              if (scrollNotification.dragDetails != null) {
                // dragDetails 非空表示手指开始拖动
                _scrollFlingStartHandle = false;
                var scrollSize = _scrollSize(scrollNotification);
                widget.scrollGestureDispatcher.handleScrollBegin(
                    widget.viewModel, scrollSize.width, scrollSize.height);
              } else {
                // dragDetails 表示fling手势开始
                _scrollFlingStartHandle = true;
                var scrollSize = _scrollSize(scrollNotification);
                widget.scrollGestureDispatcher.handleScrollMomentumBegin(
                    widget.viewModel, scrollSize.width, scrollSize.height);
              }
            } else if (scrollNotification is ScrollUpdateNotification) {
              var scrollSize = _scrollSize(scrollNotification);
              if (scrollNotification.dragDetails == null) {
                // dragDetails 表示fling中
                if (!_scrollFlingStartHandle) {
                  _scrollFlingStartHandle = true;
                  widget.scrollGestureDispatcher.handleScrollMomentumBegin(
                      widget.viewModel, scrollSize.width, scrollSize.height);
                  widget.scrollGestureDispatcher.handleScrollEnd(
                      widget.viewModel, scrollSize.width, scrollSize.height);
                }
              }
              widget.scrollGestureDispatcher.handleScroll(
                  widget.viewModel, scrollSize.width, scrollSize.height);
            } else if (scrollNotification is ScrollEndNotification) {
              var scrollSize = _scrollSize(scrollNotification);
              if (scrollNotification.dragDetails == null) {
                // dragDetails 表示fling中
                if (_scrollFlingStartHandle) {
                  _scrollFlingStartHandle = false;
                  widget.scrollGestureDispatcher.handleScrollMomentumEnd(
                      widget.viewModel, scrollSize.width, scrollSize.height);
                  return false;
                }
              }
              widget.scrollGestureDispatcher.handleScrollEnd(
                  widget.viewModel, scrollSize.width, scrollSize.height);
            }

            if (judgeReachEnd(scrollNotification.metrics.pixels,
                scrollNotification.metrics.maxScrollExtent)) {
              if (!_hasReachEnd) {
                _hasReachEnd = true;
                widget.scrollGestureDispatcher
                    .handleScrollReachedEnd(widget.viewModel);
              }
            } else {
              _hasReachEnd = false;
            }

            return false;
          });
    }
    return widget.child;
  }

  bool judgeReachEnd(double curScrollOffset, double maxScrollOffset) {
    var preloadNumber = widget.scrollGestureDispatcher.preloadItemNumber;
    if (preloadNumber == 0) {
      return curScrollOffset + extraScrollEndOffset >= maxScrollOffset;
    }

    if (widget.viewModel.childCount <= preloadNumber) {
      return true;
    }

    var extraOffset = 0.0;
    for (var i = 1; i <= preloadNumber; i++) {
      extraOffset +=
          widget.viewModel.children?[widget.viewModel.childCount - i].height ??
              0;
      if (curScrollOffset + extraOffset + extraScrollEndOffset >=
          maxScrollOffset) {
        return true;
      }
    }

    return false;
  }

  Size _scrollSize(ScrollNotification notification) {
    var scrollX = 0.0;
    var scrollY = 0.0;
    if (widget.isHorizontal) {
      scrollX = notification.metrics.pixels;
    } else {
      scrollY = notification.metrics.pixels;
    }

    return Size(scrollX, scrollY);
  }
}
