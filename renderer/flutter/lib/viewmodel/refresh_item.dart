import 'package:voltron_renderer/render.dart';

import 'group.dart';

class RefreshWrapperItemRenderViewModel extends GroupViewModel {
  RefreshWrapperItemRenderViewModel(
      int id, int instanceId, String className, RenderContext context)
      : super(id, instanceId, className, context);

  RefreshWrapperItemRenderViewModel.copy(
      int id,
      int instanceId,
      String className,
      RenderContext context,
      RefreshWrapperItemRenderViewModel viewModel)
      : super.copy(id, instanceId, className, context, viewModel);

}
