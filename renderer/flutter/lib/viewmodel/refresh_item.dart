import '../engine.dart';
import 'group.dart';

class RefreshWrapperItemRenderViewModel extends GroupViewModel {
  RefreshWrapperItemRenderViewModel(
      int id, int instanceId, String className, EngineContext context)
      : super(id, instanceId, className, context);

  RefreshWrapperItemRenderViewModel.copy(
      int id,
      int instanceId,
      String className,
      EngineContext context,
      RefreshWrapperItemRenderViewModel viewModel)
      : super.copy(id, instanceId, className, context, viewModel);

  @override
  bool operator ==(Object other) {
    return super == (other);
  }

  @override
  int get hashCode => super.hashCode;
}
