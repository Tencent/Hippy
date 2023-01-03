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

import 'package:collection/collection.dart';
import 'package:flutter/widgets.dart';
import 'package:voltron_renderer/render.dart';

import '../common.dart';
import '../controller.dart';
import '../gesture.dart';
import 'list.dart';
import 'view_model.dart';

class ScrollViewRenderViewModel extends ScrollableModel {
  bool pagingEnable = false;
  double _initOffset = 0;
  bool flingEnable = false;
  bool showScrollIndicator = false;
  bool isHorizontal = false;
  bool bounces = true;
  late ScrollViewDetailRenderViewModel scrollViewDetailRenderViewModel;

  double get initOffset => _initOffset;

  void setInitOffset(VoltronMap map) {
    if (isHorizontal) {
      var offset = map.get<double>("x") ?? map.get<int>("x")?.toDouble() ?? 0;
      _initOffset = offset;
    } else {
      var offset = map.get<double>("y") ?? map.get<int>("y")?.toDouble() ?? 0;
      _initOffset = offset;
    }
  }

  @override
  ScrollController createController() {
    return ScrollController(initialScrollOffset: _initOffset);
  }

  void scrollTo(double offset, int duration) {
    if (offset >= 0 && scrollController.hasClients) {
      // 预防滑动超出之后的异常回弹
      var finalOffset = offset < scrollController.position.maxScrollExtent
          ? offset
          : scrollController.position.maxScrollExtent;
      if (duration > 0) {
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

  @override
  bool get useStackLayout => false;

  ScrollViewRenderViewModel(
    int id,
    int instanceId,
    String className,
    RenderContext context, [
    this.isHorizontal = false,
  ]) : super(id, instanceId, className, context);

  ScrollViewRenderViewModel.copy(
    int id,
    int instanceId,
    String className,
    RenderContext context,
    ScrollViewRenderViewModel viewModel, [
    this.isHorizontal = false,
  ]) : super.copy(id, instanceId, className, context, viewModel) {
    pagingEnable = viewModel.pagingEnable;
    flingEnable = viewModel.flingEnable;
    showScrollIndicator = viewModel.showScrollIndicator;
    isHorizontal = viewModel.isHorizontal;
    scrollGestureDispatcher = viewModel.scrollGestureDispatcher;
    bounces = viewModel.bounces;

    scrollViewDetailRenderViewModel = ScrollViewDetailRenderViewModel(
      viewModel.children,
      viewModel.context.renderManager.controllerManager,
      viewModel.scrollController,
      viewModel.scrollGestureDispatcher,
      viewModel.pagingEnable,
      viewModel.isHorizontal,
      viewModel.showScrollIndicator,
      viewModel.bounces,
    );
  }

  @override
  bool get withBoxPadding => false;

  @override
  bool operator ==(Object other) {
    return other is ScrollViewRenderViewModel &&
        pagingEnable == other.pagingEnable &&
        flingEnable == other.flingEnable &&
        showScrollIndicator == other.showScrollIndicator &&
        isHorizontal == other.isHorizontal &&
        bounces == other.bounces &&
        super == other;
  }

  @override
  int get hashCode =>
      pagingEnable.hashCode |
      flingEnable.hashCode |
      showScrollIndicator.hashCode |
      isHorizontal.hashCode |
      bounces.hashCode |
      super.hashCode;
}

class ScrollViewDetailRenderViewModel {
  final List<RenderViewModel> children = [];
  final ControllerManager controllerManager;
  final ScrollController controller;
  final NativeScrollGestureDispatcher scrollGestureDispatcher;
  bool showScrollIndicator = false;
  bool isHorizontal = false;
  bool pagingEnable = false;
  bool bounces = true;

  ScrollViewDetailRenderViewModel(
    List<RenderViewModel> childrenList,
    this.controllerManager,
    this.controller,
    this.scrollGestureDispatcher,
    this.pagingEnable,
    this.isHorizontal,
    this.showScrollIndicator,
    this.bounces,
  ) {
    children.addAll(childrenList);
  }

  @override
  // ignore: unnecessary_overrides
  int get hashCode => super.hashCode;

  @override
  bool operator ==(Object other) =>
      other is ScrollViewDetailRenderViewModel &&
      const DeepCollectionEquality().equals(children, other.children) &&
      controller == other.controller &&
      scrollGestureDispatcher == other.scrollGestureDispatcher &&
      pagingEnable == other.pagingEnable &&
      isHorizontal == other.isHorizontal &&
      showScrollIndicator == other.showScrollIndicator &&
      bounces == other.bounces;
}
