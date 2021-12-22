import '../common.dart';
import '../controller.dart';
import 'node.dart';
import 'tree.dart';

class ModalRenderNode extends RenderNode {
  ModalRenderNode(int id, String className, RenderTree root,
      ControllerManager controllerManager, VoltronMap? props)
      : super(id, className, root, controllerManager, props);

  void addChild(RenderNode? node, int index) {
    super.addChild(node, index);
    // child.styleWidth = ScreenUtil.getInstance().screenWidth;
    // child.styleHeight = ScreenUtil.getInstance().screenHeight;
  }
}
