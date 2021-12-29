import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../viewmodel.dart';
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
    return Consumer<RefreshWrapperItemRenderViewModel>(builder: (context, viewModel, _) {
      return BoxWidget(viewModel,
          child: Selector<RefreshWrapperItemRenderViewModel, DivContainerViewModel>(
            selector: (context, viewModel) => DivContainerViewModel(viewModel),
            builder: (context, viewModel, _) => DivContainerWidget(viewModel),
          ));
    });
  }
}
