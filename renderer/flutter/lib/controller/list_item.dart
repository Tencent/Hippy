import 'package:flutter/widgets.dart';

import '../common.dart';
import '../controller.dart';
import '../engine.dart';
import '../render.dart';
import '../viewmodel.dart';
import '../widget.dart';
import 'group.dart';

class ListItemViewController
    extends GroupController<ListItemViewModel, ListItemRenderNode> {
  static const String className = "ListViewItem";

  @override
  Widget createWidget(BuildContext context, ListItemViewModel renderViewModel) {
    return ListItemWidget(renderViewModel);
  }

  @override
  ListItemViewModel createRenderViewModel(
      ListItemRenderNode node, EngineContext context) {
    return ListItemViewModel(
        node.id, node.rootId, node.name, node.shouldSticky, context);
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
