import 'package:flutter/widgets.dart';

import '../common/voltron_map.dart';
import '../controller/manager.dart';
import '../controller/props.dart';
import '../engine/engine_context.dart';
import '../widget/refresh_item.dart';
import 'group.dart';
import 'tree.dart';

class RefreshItemController
    extends GroupController<RefreshWrapperItemRenderNode> {
  static const String className = "RefreshWrapperItemView";

  @override
  RefreshWrapperItemRenderNode createRenderNode(
      int id,
      VoltronMap? props,
      String name,
      RenderTree tree,
      ControllerManager controllerManager,
      bool lazy) {
    return RefreshWrapperItemRenderNode(
        id, name, tree, controllerManager, props, lazy);
  }

  @override
  Widget createWidget(
      BuildContext context, RefreshWrapperItemRenderNode renderNode) {
    return RefreshWrapperItemWidget(renderNode.renderViewModel);
  }

  @override
  Map<String, ControllerMethodProp> get groupExtraMethodProp => {};

  @override
  String get name => className;
}

class RefreshWrapperItemRenderNode
    extends GroupRenderNode<RefreshWrapperItemRenderViewModel> {
  RefreshWrapperItemRenderNode(int id, String className, RenderTree root,
      ControllerManager controllerManager, VoltronMap? props, bool isLazy)
      : super(id, className, root, controllerManager, props, isLazy);

  @override
  RefreshWrapperItemRenderViewModel createRenderViewModel(
      EngineContext context) {
    return RefreshWrapperItemRenderViewModel(id, rootId, name, context);
  }
}

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
