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
import 'package:provider/provider.dart';

import '../style.dart';
import '../util.dart';
import '../viewmodel.dart';
import 'base.dart';
import 'div.dart';

class ViewPagerWidget extends FRStatefulWidget {
  final ViewPagerRenderViewModel _viewModel;

  ViewPagerWidget(this._viewModel) : super(_viewModel);

  @override
  State<StatefulWidget> createState() {
    return _ViewPagerWidgetState();
  }
}

class _ViewPagerWidgetState extends FRState<ViewPagerWidget> {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: widget._viewModel,
      child: Selector<ViewPagerRenderViewModel, ViewPagerRenderViewModel>(
        selector: (context, viewModel) {
          return ViewPagerRenderViewModel.copy(
            id: viewModel.id,
            instanceId: viewModel.rootId,
            className: viewModel.name,
            context: viewModel.context,
            viewModel: viewModel,
          );
        },
        builder: (context, viewModel, widget) {
          return PositionWidget(
            viewModel,
            child: viewPager(viewModel),
          );
        },
      ),
    );
  }

  Widget viewPager(ViewPagerRenderViewModel viewModel) {
    LogUtils.dWidget("view_pager",
        "build view pager, children:${viewModel.children.length}");
    if (viewModel.children.isEmpty) {
      return Container();
    } else {
      // viewPortFraction必须大于0
      var viewPortFraction =
          viewModel.pageMargin > 0 ? viewModel.pageMargin : 1.0;
      var controller = PageController(
        initialPage: viewModel.initialPage,
        viewportFraction: viewPortFraction,
      );
      changeController(controller);
      var physics = getScrollPhysics(viewModel);
      var overflow = viewModel.overflow;
      if (widget._viewModel.firstRender) {
        // 创建viewpager时需要回调一下js当前的Page，防止数据不一致的问题
        widget._viewModel.firstRender = false;
        onPageChanged(viewModel.initialPage);
      }
      return NotificationListener<ScrollNotification>(
        onNotification: onScrollNotification,
        child: PageView.builder(
          scrollDirection:
              viewModel.isVertical ? Axis.vertical : Axis.horizontal,
          itemBuilder: (context, index) {
            if (index < 0 || index >= viewModel.children.length) {
              return Container();
            }
            return pageChild(
              context,
              viewModel.children[index],
              overflow,
              viewPortFraction,
            );
          },
          controller: controller,
          physics: physics,
          onPageChanged: onPageChanged,
          itemCount: viewModel.children.length,
        ),
      );
    }
  }

  ScrollPhysics getScrollPhysics(ViewPagerRenderViewModel viewModel) {
    return viewModel.scrollEnabled
        ? viewModel.bounces
            ? const BouncingScrollPhysics()
            : const ClampingScrollPhysics()
        : const NeverScrollableScrollPhysics();
  }

  void changeController(PageController controller) {
    widget._viewModel.setController(controller);
  }

  void onPageChanged(int page) {
    LogUtils.d("view_pager", "page change:$page");
    widget._viewModel.onPageChanged(page);
  }

  bool onScrollNotification(ScrollNotification notification) {
    widget._viewModel.onScrollNotification(notification);
    return false;
  }

  Widget pageChild(
    BuildContext context,
    RenderViewModel childViewModel,
    String overflow,
    double viewPortFraction,
  ) {
    var content = generateByViewModel(context, childViewModel);

    content = Stack(
      children: [content],
      clipBehavior: toOverflow(overflow),
    );
    if (viewPortFraction != 1.0) {
      content = FractionallySizedBox(
        widthFactor: 1 / viewPortFraction,
        child: content,
      );
    }

    LogUtils.dWidget(
      "view_pager",
      "build view pager child(${childViewModel.id}) success",
    );
    return content;
  }

  @override
  void dispose() {
    super.dispose();
    if (!widget._viewModel.isDispose) {
      widget._viewModel.onDispose();
    }
  }
}

class ViewPagerItemWidget extends FRStatefulWidget {
  final ViewPagerItemRenderViewModel _itemViewModel;

  ViewPagerItemWidget(this._itemViewModel) : super(_itemViewModel);

  @override
  State<StatefulWidget> createState() {
    return _ViewPagerItemWidgetState();
  }
}

class _ViewPagerItemWidgetState extends FRState<ViewPagerItemWidget> {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: widget._itemViewModel,
      child: Consumer<ViewPagerItemRenderViewModel>(
        builder: (context, viewModel, child) {
          return BoxWidget(
            viewModel,
            child:
                Selector<ViewPagerItemRenderViewModel, DivContainerViewModel>(
              selector: (context, viewModel) => DivContainerViewModel(
                viewModel,
              ),
              builder: (context, viewModel, _) => DivContainerWidget(viewModel),
            ),
          );
        },
      ),
    );
  }

  @override
  void dispose() {
    super.dispose();
    if (!widget._itemViewModel.isDispose) {
      widget._itemViewModel.onDispose();
    }
  }
}
