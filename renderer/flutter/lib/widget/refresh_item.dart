import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../viewmodel/group.dart';
import '../viewmodel/refresh_item.dart';
import 'base.dart';
import 'div.dart';

class RefreshWrapperItemWidget extends FRStatefulWidget {
  final RefreshWrapperItemRenderViewModel viewModel;

  RefreshWrapperItemWidget(this.viewModel) : super(viewModel);

  @override
  State<StatefulWidget> createState() {
    return _RefreshWrapperItemWidgetState();
  }
}

class _RefreshWrapperItemWidgetState extends FRState<RefreshWrapperItemWidget> {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
        value: widget.viewModel, child: _boxContent());
  }

  Widget _boxContent() {
    return Selector<RefreshWrapperItemRenderViewModel,
        RefreshWrapperItemRenderViewModel>(builder: (context, viewModel, _) {
      return BoxWidget(viewModel,
          child: Selector0<DivContainerViewModel>(
            selector: (context) => viewModel.divContainerViewModel,
            builder: (context, viewModel, _) => DivContainerWidget(viewModel),
          ));
    }, selector: (context, viewModel) {
      return RefreshWrapperItemRenderViewModel.copy(viewModel.id,
          viewModel.rootId, viewModel.name, viewModel.context, viewModel);
    });
  }
}
