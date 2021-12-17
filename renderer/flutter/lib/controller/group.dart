import '../common/voltron_map.dart';
import '../controller/controller.dart';
import '../controller/manager.dart';
import '../controller/props.dart';
import '../render/node.dart';
import '../render/tree.dart';
import '../style/prop.dart';
import '../viewmodel/group.dart';

abstract class BaseGroupController<T extends GroupViewModel>
    extends GroupController<T, RenderNode> {
  @override
  RenderNode createRenderNode(int id, VoltronMap? props, String name,
      RenderTree tree, ControllerManager controllerManager, bool lazy) {
    return RenderNode(id, name, tree, controllerManager, props);
  }
}

abstract class GroupController<T extends GroupViewModel, R extends RenderNode>
    extends VoltronViewController<T, R> {
  @override
  Map<String, ControllerMethodProp> get extendRegisteredMethodProp {
    var extraMap = <String, ControllerMethodProp>{};
    extraMap[NodeProps.onInterceptTouchEvent] =
        ControllerMethodProp(setInterceptTouch, false);
    extraMap[NodeProps.onInterceptPullUpEvent] =
        ControllerMethodProp(setInterceptPullUp, false);
    extraMap.addAll(groupExtraMethodProp);

    return extraMap;
  }

  Map<String, ControllerMethodProp> get groupExtraMethodProp;

  @ControllerProps(NodeProps.onInterceptTouchEvent)
  void setInterceptTouch(T viewModel, bool flag) {
    viewModel.interceptTouch = flag;
  }

  @ControllerProps(NodeProps.onInterceptPullUpEvent)
  void setInterceptPullUp(T viewModel, bool flag) {
    viewModel.interceptPullUp = flag;
  }
}
