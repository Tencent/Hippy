import 'package:flutter/widgets.dart';
import 'package:provider/provider.dart';

import '../render/group.dart';
import '../render/list.dart';
import '../render/list_item.dart';
import '../render/view_model.dart';
import 'div.dart';

class ListItemWidget extends FRStatefulWidget {
  final ListItemViewModel _viewModel;

  ListItemWidget(this._viewModel) : super(_viewModel);

  @override
  State<StatefulWidget> createState() {
    return _ListItemWidgetState();
  }
}

class _ListItemWidgetState extends FRState<ListItemWidget> {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
        value: widget._viewModel,
        child: Selector<ListItemViewModel, ListItemViewModel>(
            selector: (context, itemViewModel) {
          var parentViewModel = itemViewModel.parent;
          if (parentViewModel is ListViewModel) {}
          return ListItemViewModel.copy(
              itemViewModel.id,
              itemViewModel.rootId,
              itemViewModel.name,
              itemViewModel.shouldSticky,
              itemViewModel.context,
              itemViewModel);
        }, builder: (context, model, oldWidget) {
          return _boxContent();
        }));
  }

  Widget _boxContent() {
    return Selector<ListItemViewModel, ListItemViewModel>(
      selector: (context, viewModel) {
        return ListItemViewModel.copy(
            viewModel.id,
            viewModel.rootId,
            viewModel.name,
            viewModel.shouldSticky,
            viewModel.context,
            viewModel);
      },
      builder: (context, viewModel, child) {
        return BoxWidget(viewModel,
            child: Selector0<DivContainerViewModel>(
              selector: (context) => viewModel.divContainerViewModel,
              builder: (context, viewModel, _) => DivContainerWidget(viewModel),
            ));
      },
    );
  }
}
