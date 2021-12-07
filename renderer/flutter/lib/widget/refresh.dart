import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
// ignore: import_of_legacy_library_into_null_safe
import 'package:pull_to_refresh/pull_to_refresh.dart';

import '../viewmodel/list.dart';
import '../viewmodel/refresh.dart';
import 'base.dart';
import 'div.dart';

class RefreshWrapperWidget extends FRStatefulWidget {
  final RefreshWrapperRenderViewModel _viewModel;

  RefreshWrapperWidget(this._viewModel) : super(_viewModel);

  @override
  State<StatefulWidget> createState() {
    return _RefreshWrapperWidgetState();
  }
}

class _RefreshWrapperWidgetState extends FRState<RefreshWrapperWidget> {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
        value: widget._viewModel,
        child: Selector<RefreshWrapperRenderViewModel,
            RefreshWrapperRenderViewModel>(
          selector: (context, viewModel) {
            return RefreshWrapperRenderViewModel.copy(viewModel.id,
                viewModel.rootId, viewModel.name, viewModel.context, viewModel);
          },
          builder: (context, viewModel, _) {
            return PositionWidget(viewModel,
                child: Selector0<RefreshWrapperRenderContentViewModel>(
                  selector: (context) =>
                      viewModel.refreshWrapperRenderContentViewModel,
                  builder: (context, viewModel, _) => refreshWrapper(viewModel),
                ));
          },
        ));
  }

  Widget refreshWrapper(RefreshWrapperRenderContentViewModel viewModel) {
    var content = viewModel.content;
    if (content == null) {
      return Container();
    }

    var headerModel = viewModel.header;
    Widget? header;
    if (headerModel != null) {
      header = generateByViewModel(context, headerModel);
    }
    var listChild = content;
    listChild.pushExtraInfo(ListViewModel.wrapperKey, (context, child) {
      return SmartRefresher(
        enablePullDown: true,
        controller: viewModel.controller,
        onRefresh: () {
          viewModel.dispatcher.startRefresh();
        },
        header: header == null
            ? null
            : CustomHeader(
                height: headerModel?.height ?? 0,
                builder: (context, status) {
                  return header!;
                },
              ),
        child: child,
      );
    });
    var list = generateByViewModel(context, listChild);
    var stack = Stack(
      children: [list],
    );
    return stack;
  }
}
