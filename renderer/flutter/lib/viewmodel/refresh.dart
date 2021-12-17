import 'package:flutter/widgets.dart';
// ignore: import_of_legacy_library_into_null_safe
import 'package:pull_to_refresh/pull_to_refresh.dart';

import '../controller.dart';
import '../engine.dart';
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
  RefreshWrapperItemRenderViewModel? get header =>
      _refreshWrapperItemRenderViewModel;
  RefreshController get controller =>
      refreshEventDispatcher.refreshController;
  RefreshEventDispatcher get dispatcher => refreshEventDispatcher;

  late RefreshWrapperRenderContentViewModel
      refreshWrapperRenderContentViewModel;

  RefreshWrapperRenderViewModel(
      int id, int instanceId, String className, EngineContext context)
      : super(id, instanceId, className, context) {
    refreshEventDispatcher = createRefreshDispatcher();
  }

  RefreshWrapperRenderViewModel.copy(int id, int instanceId, String className,
      EngineContext context, RefreshWrapperRenderViewModel viewModel)
      : super.copy(id, instanceId, className, context, viewModel) {
    _refreshWrapperItemRenderViewModel = viewModel.header;
    refreshEventDispatcher = viewModel.dispatcher;
    _content = viewModel.content;
    bounceTime = viewModel.bounceTime;
    preloadSize = viewModel.preloadSize;
    scrollGestureDispatcher = viewModel.scrollGestureDispatcher;
    refreshWrapperRenderContentViewModel = RefreshWrapperRenderContentViewModel(
        header: viewModel.header,
        content: viewModel.content,
        controller: viewModel.controller,
        dispatcher: viewModel.dispatcher);
  }

  @override
  bool operator ==(Object other) {
    return other is RefreshWrapperRenderViewModel &&
        _content == other.content &&
        bounceTime == other.bounceTime &&
        preloadSize == other.preloadSize;
  }

  @override
  int get hashCode =>
      _content.hashCode | bounceTime.hashCode | preloadSize.hashCode;

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
    controller.dispose();
  }
}

class RefreshWrapperRenderContentViewModel {
  RefreshWrapperItemRenderViewModel? header;
  RenderViewModel? content;
  RefreshController controller;
  RefreshEventDispatcher dispatcher;

  RefreshWrapperRenderContentViewModel(
      {this.header,
      this.content,
      required this.controller,
      required this.dispatcher});

  @override
  int get hashCode => super.hashCode;

  @override
  bool operator ==(Object other) =>
      other is RefreshWrapperRenderContentViewModel &&
      header == other.header &&
      content == other.content &&
      controller == other.controller &&
      dispatcher == other.dispatcher;
}
