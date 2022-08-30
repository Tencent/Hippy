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
import 'package:voltron_renderer/render.dart';

import '../controller.dart';
import 'list.dart';
import 'refresh_item.dart';
import 'view_model.dart';

class RefreshWrapperRenderViewModel extends ScrollableModel {
  RefreshWrapperItemRenderViewModel? _refreshWrapperItemRenderViewModel;
  late RefreshEventDispatcher refreshEventDispatcher;
  RenderViewModel? _content;

  int bounceTime = 300;
  double? preloadSize;

  RenderViewModel? get content => _content;

  RefreshWrapperItemRenderViewModel? get header => _refreshWrapperItemRenderViewModel;

  RefreshEventDispatcher get dispatcher => refreshEventDispatcher;

  late RefreshWrapperRenderContentViewModel refreshWrapperRenderContentViewModel;

  RefreshWrapperRenderViewModel(
    int id,
    int instanceId,
    String className,
    RenderContext context,
  ) : super(id, instanceId, className, context) {
    refreshEventDispatcher = createRefreshDispatcher();
  }

  RefreshWrapperRenderViewModel.copy(
    int id,
    int instanceId,
    String className,
    RenderContext context,
    RefreshWrapperRenderViewModel viewModel,
  ) : super.copy(id, instanceId, className, context, viewModel) {
    _refreshWrapperItemRenderViewModel = viewModel.header;
    refreshEventDispatcher = viewModel.dispatcher;
    _content = viewModel.content;
    bounceTime = viewModel.bounceTime;
    preloadSize = viewModel.preloadSize;
    scrollGestureDispatcher = viewModel.scrollGestureDispatcher;
    refreshWrapperRenderContentViewModel = RefreshWrapperRenderContentViewModel(
      header: viewModel.header,
      content: viewModel.content,
      dispatcher: viewModel.dispatcher,
    );
  }

  @override
  bool operator ==(Object other) {
    return other is RefreshWrapperRenderViewModel &&
        _content == other.content &&
        bounceTime == other.bounceTime &&
        preloadSize == other.preloadSize;
  }

  @override
  int get hashCode => _content.hashCode | bounceTime.hashCode | preloadSize.hashCode;

  RefreshEventDispatcher createRefreshDispatcher() {
    return RefreshEventDispatcher(id, context);
  }

  @override
  ScrollController createController() {
    return TrackingScrollController(initialScrollOffset: 0);
  }

  @override
  void addViewModel(RenderViewModel child, int index) {
    if (child is RefreshWrapperItemRenderViewModel) {
      _refreshWrapperItemRenderViewModel = child;
    } else {
      _content = child;
    }
    super.addViewModel(child, index);
  }

  @override
  void doDispose() {
    super.doDispose();
  }
}

class RefreshWrapperRenderContentViewModel {
  RefreshWrapperItemRenderViewModel? header;
  RenderViewModel? content;
  RefreshEventDispatcher dispatcher;

  RefreshWrapperRenderContentViewModel({
    this.header,
    this.content,
    required this.dispatcher,
  });

  @override
  // ignore: unnecessary_overrides
  int get hashCode => super.hashCode;

  @override
  bool operator ==(Object other) =>
      other is RefreshWrapperRenderContentViewModel &&
      header == other.header &&
      content == other.content &&
      dispatcher == other.dispatcher;
}
