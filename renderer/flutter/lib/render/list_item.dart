import '../common.dart';
import '../controller.dart';
import '../style.dart';
import 'node.dart';
import 'tree.dart';

class ListItemRenderNode extends RenderNode {
  bool? _shouldSticky;

  bool get shouldSticky => _shouldSticky ?? false;

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
  void updateNode(VoltronMap map) {
    super.updateNode(map);
    _updateShouldSticky();
  }

  void _updateShouldSticky() {
    _shouldSticky = props?.get(NodeProps.itemSticky) ?? false;
  }
}
