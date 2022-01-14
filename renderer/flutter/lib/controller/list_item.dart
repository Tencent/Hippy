import 'package:flutter/widgets.dart';

import '../common.dart';
import '../controller.dart';
import '../render.dart';
import '../viewmodel.dart';
import '../widget.dart';

class ListItemViewController
    extends GroupController<ListItemViewModel, ListItemRenderNode> {
  static const String kClassName = "ListViewItem";

  @override
  Widget createWidget(BuildContext context, ListItemViewModel viewModel) {
    return ListItemWidget(viewModel);
  }

  @override
  ListItemViewModel createRenderViewModel(
      ListItemRenderNode node, RenderContext context) {
    return ListItemViewModel(
        node.id, node.rootId, node.name, node.shouldSticky, context);
  }

  @override
  String get name => kClassName;

  @override
  ListItemRenderNode createRenderNode(int id, VoltronMap? props, String name,
      RenderTree tree, ControllerManager controllerManager, bool lazy) {
    return ListItemRenderNode(id, name, tree, controllerManager, props, lazy);
  }

  @override
  Map<String, ControllerMethodProp> get groupExtraMethodProp => {};
}
