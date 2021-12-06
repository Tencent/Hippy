import '../flexbox/flex_node.dart';
import '../util/screen_util.dart';
import 'style_node.dart';

class ModalStyleNode extends StyleNode {
  ModalStyleNode(int instanceId, int id, String name, String tagName)
      : super(instanceId, id, name, tagName);

  @override
  void addChildAt(FlexNode child, int i) {
    super.addChildAt(child, i);
    child.styleWidth = ScreenUtil.getInstance().screenWidth;
    child.styleHeight = ScreenUtil.getInstance().screenHeight;
  }
}
