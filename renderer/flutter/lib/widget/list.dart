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

import '../viewmodel.dart';
import 'base.dart';
import 'div.dart';
import 'scroller.dart';

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
          return ListViewModel.copy(viewModel.id, viewModel.rootId,
              viewModel.name, viewModel.context, viewModel);
        },
        builder: (context, viewModel, _) {
          return PositionWidget(viewModel,
              child: Selector0<ListViewDetailModel>(
                selector: (context) => viewModel.listViewDetailModel,
                builder: (context, viewModel, _) => listView(viewModel),
              ));
        },
      ),
    );
  }

  Widget listView(ListViewDetailModel viewModel) {
    if (viewModel.children.isEmpty) {
      return Container();
    }
    ScrollPhysics physics = BouncingScrollPhysics();
    if (!(viewModel.scrollGestureDispatcher.enableScroll == true)) {
      physics = NeverScrollableScrollPhysics();
    }

    var delegate = viewModel.delegate;

    Widget list;
    if (viewModel.hasStickyItem && ((viewModel.stickyChildList.length) > 1)) {
      var sliverList = <Widget>[];
      for (var element in viewModel.stickyChildList) {
        if (element.isNotEmpty) {
          var item = element[0];
          if (item is ListItemViewModel && item.shouldSticky) {
            // stickyItem
            sliverList.add(SliverPersistentHeader(
                delegate: StickyTabBarDelegate(
                    width: item.width ?? 0,
                    height: item.height ?? 0,
                    child: generateByViewModel(context, item)),
                pinned: true));
          } else {
            sliverList.add(SliverList(
                delegate: SliverChildBuilderDelegate((context, index) {
              var child = element[index];
              return generateByViewModel(context, child);
            }, childCount: element.length)));
          }
        }
      }
      list = CustomScrollView(
          controller: viewModel.controller,
          physics: physics,
          cacheExtent: viewModel.preloadSize,
          scrollDirection: Axis.vertical,
          slivers: sliverList);
      if (viewModel.paddingTop > 0 ||
          viewModel.paddingRight > 0 ||
          viewModel.paddingBottom > 0 ||
          viewModel.paddingLeft > 0) {
        list = Padding(
            padding: EdgeInsets.only(
                top: viewModel.paddingTop,
                right: viewModel.paddingRight,
                bottom: viewModel.paddingBottom,
                left: viewModel.paddingLeft),
            child: list);
      }
    } else {
      list = ListView.builder(
        padding: EdgeInsets.only(
            top: viewModel.paddingTop,
            right: viewModel.paddingRight,
            bottom: viewModel.paddingBottom,
            left: viewModel.paddingLeft),
        itemBuilder: (context, pos) {
          var child = viewModel.children[pos];
          return generateByViewModel(context, child);
        },
        scrollDirection: Axis.vertical,
        itemCount: viewModel.children.length,
        controller: viewModel.controller,
        physics: physics,
      );
    }
    if (delegate != null) {
      Widget wrapper = delegate(context, list);
      list = wrapper;
    }

    var scrollBar = list;
    if (viewModel.showScrollIndicator) {
      scrollBar = Scrollbar(child: list);
    }

    return ScrollNotificationListener(
        child: scrollBar,
        viewModel: _renderViewModel(),
        scrollGestureDispatcher: viewModel.scrollGestureDispatcher);
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
