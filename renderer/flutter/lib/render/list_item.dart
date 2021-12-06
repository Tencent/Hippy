import 'package:flutter/widgets.dart';

import '../common/voltron_map.dart';
import '../controller/manager.dart';
import '../controller/props.dart';
import '../dom/prop.dart';
import '../engine/engine_context.dart';
import '../widget/list_item.dart';
import 'group.dart';
import 'tree.dart';

class ListItemViewController extends GroupController<ListItemRenderNode> {
  static const String className = "ListViewItem";

  @override
  Widget createWidget(BuildContext context, ListItemRenderNode renderNode) {
    return ListItemWidget(renderNode.renderViewModel);
  }

  @override
  String get name => className;

  @override
  ListItemRenderNode createRenderNode(int id, VoltronMap? props, String name,
      RenderTree tree, ControllerManager controllerManager, bool lazy) {
    return ListItemRenderNode(id, name, tree, controllerManager, props, lazy);
  }

  @override
  Map<String, ControllerMethodProp> get groupExtraMethodProp => {};
}

class ListItemRenderNode extends GroupRenderNode<ListItemViewModel> {
  bool? _shouldSticky;

  ListItemRenderNode(
      int id,
      String className,
      RenderTree root,
      ControllerManager controllerManager,
      VoltronMap? propsToUpdate,
      bool isLazy)
      : super(id, className, root, controllerManager, propsToUpdate, isLazy) {
    _updateShouldSticky();
  }

  @override
  ListItemViewModel createRenderViewModel(EngineContext context) {
    return ListItemViewModel(id, rootId, name, _shouldSticky ?? false, context);
  }

  @override
  void updateNode(VoltronMap map) {
    super.updateNode(map);
    _updateShouldSticky();
  }

  void _updateShouldSticky() {
    _shouldSticky = props?.get(NodeProps.itemSticky) ?? false;
  }
}

class ListItemViewModel extends GroupViewModel {
  bool shouldSticky;

  ListItemViewModel(int id, int instanceId, String className, this.shouldSticky,
      EngineContext context)
      : super(id, instanceId, className, context);

  ListItemViewModel.copy(int id, int instanceId, String className,
      this.shouldSticky, EngineContext context, ListItemViewModel viewModel)
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
