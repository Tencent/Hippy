import 'package:voltron_renderer/render.dart';

import 'group.dart';

class ListItemViewModel extends GroupViewModel {
  bool shouldSticky;

  ListItemViewModel(int id, int instanceId, String className, this.shouldSticky,
      RenderContext context)
      : super(id, instanceId, className, context);

  ListItemViewModel.copy(int id, int instanceId, String className,
      this.shouldSticky, RenderContext context, ListItemViewModel viewModel)
      : super.copy(id, instanceId, className, context, viewModel) {
    shouldSticky = viewModel.shouldSticky;
  }

  @override
  bool operator ==(Object other) {
    return other is ListItemViewModel &&
        shouldSticky == other.shouldSticky &&
        super == (other);
  }

  @override
  int get hashCode => shouldSticky.hashCode | super.hashCode;
}
