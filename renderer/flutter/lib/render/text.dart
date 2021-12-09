import '../common/voltron_map.dart';
import '../controller/manager.dart';
import '../engine/engine_context.dart';
import '../style/text.dart';
import '../viewmodel/text.dart';
import 'node.dart';
import 'tree.dart';

class TextRenderNode extends RenderNode with TextStyleNode {
  TextRenderNode(int id, String className, RenderTree root,
      ControllerManager controllerManager, VoltronMap? props)
      : super(id, className, root, controllerManager, props);

  @override
  TextRenderViewModel createRenderViewModel(EngineContext context) {
    return TextRenderViewModel(id, rootId, name, context);
  }
}
