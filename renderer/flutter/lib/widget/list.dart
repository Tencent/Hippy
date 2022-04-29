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

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';

import '../common.dart';
import '../controller.dart';
import '../viewmodel.dart';
import '../widget.dart';

class ListViewWidget extends FRStatefulWidget {
  final ListViewModel _viewModel;

  ListViewWidget(this._viewModel) : super(_viewModel);

  @override
  State<StatefulWidget> createState() {
    return _ListViewWidgetState();
  }
}

class _ListViewWidgetState extends FRState<ListViewWidget> {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: widget._viewModel,
      child: Selector<ListViewModel, ListViewModel>(
        selector: (context, viewModel) {
          return ListViewModel.copy(
            viewModel.id,
            viewModel.rootId,
            viewModel.name,
            viewModel.context,
            viewModel,
          );
        },
        builder: (context, viewModel, _) {
          return PositionWidget(
            viewModel,
            child: Selector0<ListViewDetailModel>(
              selector: (context) => viewModel.listViewDetailModel,
              builder: (context, listViewDetailModel, _) {
                if (!viewModel.hasRemovePreDraw) {
                  viewModel.hasRemovePreDraw = true;
                  WidgetsBinding.instance?.addPostFrameCallback((timeStamp) {
                    widget._viewModel.sendEvent(
                      'initialListReady',
                      VoltronMap(),
                    );
                  });
                }
                return listView(listViewDetailModel);
              },
            ),
          );
        },
      ),
    );
  }

  Widget listView(ListViewDetailModel viewModel) {
    var hasSticky = getStickyStatus(viewModel);

    var delegate = viewModel.delegate;

    Widget list;
    if (hasSticky) {
      list = generateStickyList(viewModel);
    } else {
      list = generateNormalList(viewModel);
    }

    // if delegate exist, ignore pull-header and pull-footer
    if (delegate != null) {
      list = delegate(context: context, child: list);
    } else {
      list = addPullHeaderAndPullFooter(viewModel, list);
    }

    if (viewModel.showScrollIndicator) {
      list = Scrollbar(controller: viewModel.controller, child: list);
    }

    list = ScrollNotificationListener(
      child: list,
      viewModel: _renderViewModel(),
      scrollGestureDispatcher: viewModel.scrollGestureDispatcher,
    );

    var hasPadding = getPaddingStatus(viewModel);
    if (hasPadding) {
      list = Padding(
        padding: EdgeInsets.only(
          top: viewModel.paddingTop,
          right: viewModel.paddingRight,
          bottom: viewModel.paddingBottom,
          left: viewModel.paddingLeft,
        ),
        child: list,
      );
    }

    return list;
  }

  ScrollPhysics getScrollPhysics(ListViewDetailModel viewModel) {
    ScrollPhysics physics = const BouncingScrollPhysics();
    if (!viewModel.bounces) {
      physics = const ClampingScrollPhysics();
    }
    if (!(viewModel.scrollGestureDispatcher.enableScroll == true)) {
      physics = const NeverScrollableScrollPhysics();
    }
    return physics;
  }

  bool getStickyStatus(ListViewDetailModel viewModel) {
    return viewModel.hasStickyItem && ((viewModel.stickyChildList.length) > 1);
  }

  bool getPaddingStatus(ListViewDetailModel viewModel) {
    return viewModel.paddingTop > 0 ||
        viewModel.paddingRight > 0 ||
        viewModel.paddingBottom > 0 ||
        viewModel.paddingLeft > 0;
  }

  Axis getDirection(ListViewDetailModel viewModel) {
    return viewModel.horizontal ? Axis.horizontal : Axis.vertical;
  }

  Widget generateStickyList(ListViewDetailModel viewModel) {
    Widget list;
    var sliverList = <Widget>[];
    for (var element in viewModel.stickyChildList) {
      if (element.isNotEmpty) {
        var item = element[0];
        if (item is ListItemViewModel && item.shouldSticky) {
          // stickyItem
          sliverList.add(
            SliverPersistentHeader(
              delegate: StickyTabBarDelegate(
                width: item.width ?? 0,
                height: item.height ?? 0,
                child: generateByViewModel(context, item),
              ),
              pinned: true,
            ),
          );
        } else {
          sliverList.add(
            SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  var child = element[index];
                  return generateByViewModel(context, child);
                },
                childCount: element.length,
              ),
            ),
          );
        }
      }
    }
    list = CustomScrollView(
      controller: viewModel.controller,
      physics: getScrollPhysics(viewModel),
      cacheExtent: viewModel.preloadSize,
      scrollDirection: getDirection(viewModel),
      slivers: sliverList,
    );
    return list;
  }

  Widget generateNormalList(ListViewDetailModel viewModel) {
    var list = ListView.builder(
      padding: EdgeInsets.zero,
      controller: viewModel.controller,
      physics: getScrollPhysics(viewModel),
      itemBuilder: (context, pos) {
        var child = viewModel.realItemList[pos];
        return generateByViewModel(context, child);
      },
      scrollDirection: getDirection(viewModel),
      itemCount: viewModel.realItemList.length,
    );
    return list;
  }

  Widget addPullHeaderAndPullFooter(
      ListViewDetailModel viewModel, Widget list) {
    Widget? header;
    Widget? footer;
    Widget? refresher;
    var pullHeaderViewModel = viewModel.pullHeaderViewModel;
    var pullFooterViewModel = viewModel.pullFooterViewModel;
    if (pullHeaderViewModel != null) {
      header = generateByViewModel(context, pullHeaderViewModel);
    }
    if (pullFooterViewModel != null) {
      footer = generateByViewModel(context, pullFooterViewModel);
    }
    if (header != null || footer != null) {
      refresher = RefreshConfiguration(
        headerTriggerDistance: viewModel.pullHeaderViewModel?.height ?? 1,
        footerTriggerDistance: viewModel.pullFooterViewModel?.height ?? 1,
        enableBallisticLoad: false,
        child: SmartRefresher(
          scrollController: viewModel.controller,
          physics: getScrollPhysics(viewModel),
          enablePullDown: header != null,
          enablePullUp: footer != null,
          header: header != null
              ? CustomHeader(
                  height: viewModel.pullHeaderViewModel?.height ?? 0,
                  builder: (context, status) => header!,
                  onOffsetChange: (offset) {
                    var headerStatus = viewModel
                        .refreshEventDispatcher.refreshController.headerStatus;
                    if (headerStatus != RefreshStatus.refreshing &&
                        offset > 0) {
                      var params = VoltronMap();
                      params.push('contentOffset', offset);
                      pullHeaderViewModel?.sendEvent(
                        ListPullHeaderViewController.onHeaderPulling,
                        params,
                      );
                    }
                  },
                )
              : null,
          footer: footer != null
              ? CustomFooter(
                  loadStyle: LoadStyle.ShowWhenLoading,
                  height: viewModel.pullFooterViewModel?.height ?? 0,
                  builder: (context, status) => footer!,
                  onOffsetChange: (offset) {
                    var footerStatus = viewModel
                        .refreshEventDispatcher.refreshController.footerStatus;
                    if (footerStatus != LoadStatus.loading && offset > 0) {
                      var params = VoltronMap();
                      params.push('contentOffset', offset);
                      pullFooterViewModel?.sendEvent(
                        ListPullFooterViewController.onFooterPulling,
                        params,
                      );
                    }
                  },
                  // onModeChange: (mode) {
                  //   if (mode == LoadStatus.idle) {
                  //     Future.delayed(const Duration(milliseconds: 300))
                  //         .then((dy) {
                  //       setState(() {});
                  //     });
                  //   }
                  // },
                )
              : null,
          controller: viewModel.refreshEventDispatcher.refreshController,
          onRefresh: () {
            pullHeaderViewModel?.sendEvent(
              ListPullHeaderViewController.onHeaderReleased,
              VoltronMap(),
            );
          },
          onLoading: () {
            pullFooterViewModel?.sendEvent(
              ListPullFooterViewController.onFooterReleased,
              VoltronMap(),
            );
          },
          child: list,
        ),
      );
    }
    return refresher ?? list;
  }

  RenderViewModel _renderViewModel() {
    return widget._viewModel;
  }
}

class StickyTabBarDelegate extends SliverPersistentHeaderDelegate {
  final Widget child;
  final double width;
  final double height;

  StickyTabBarDelegate(
      {required this.child, required this.width, required this.height});

  @override
  Widget build(
      BuildContext context, double shrinkOffset, bool overlapsContent) {
    return child;
  }

  @override
  double get maxExtent => height;

  @override
  double get minExtent => height;

  @override
  bool shouldRebuild(SliverPersistentHeaderDelegate oldDelegate) {
    return true;
  }
}
