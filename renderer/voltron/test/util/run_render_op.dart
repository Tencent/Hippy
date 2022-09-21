import 'package:voltron_renderer/render.dart';
import 'package:voltron_renderer/widget.dart';
import './render_context.dart';

enum RenderOpType {
  addNode,
  deleteNode,
  moveNode,
  updateNode,
  updateLayout,
  layoutBefore,
  layoutFinish,
  batch,
  dispatchUiFunc,
  addEvent,
  removeEvent,
}

class RenderOp {
  RenderOpType type;
  int nodeId;
  int parentId;
  Map? props;

  RenderOp(
      {required this.type,
      required this.nodeId,
      this.props,
      required this.parentId});

  List<dynamic> format() {
    List<dynamic> ret = [];
    ret.add(type.index);
    ret.add(nodeId);
    if (props != null) {
      ret.add(props);
    }
    return ret;
  }
}

class RunRenderOpUtil {
  static void loadInstance(
      RenderContext renderContext, RootWidgetViewModel rootWidgetViewModel) {
    renderContext.createInstance(
      MockLoadInstanceContext(),
      rootWidgetViewModel,
    );
    renderContext.renderManager.onInstanceLoad(rootWidgetViewModel.id);
    rootWidgetViewModel.attachToEngine(renderContext);
  }

  static void doFrame(RenderContext renderContext) {
    renderContext.renderManager.renderBatchEnd();
    renderContext.renderManager.doFrame(Duration.zero);
  }

  static RootWidgetViewModel createRootWidgetViewModel() {
    var renderContext = getRenderContext();
    var renderOpRuner = RenderOperatorRunner(renderContext);
    var viewModel = RootWidgetViewModel();
    loadInstance(renderContext, viewModel);
    return viewModel;
  }

  static RootWidgetViewModel runRenderOp(List<RenderOp> ops) {
    var renderContext = getRenderContext();
    var renderOpRuner = RenderOperatorRunner(renderContext);
    var viewModel = RootWidgetViewModel();
    loadInstance(renderContext, viewModel);
    var _ops = ops.map((e) => e.format()).toList();
    renderOpRuner.consumeRenderOp(viewModel.id, _ops);
    doFrame(renderContext);
    return viewModel;
  }
}
