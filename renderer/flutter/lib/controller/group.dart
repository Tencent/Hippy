import '../common.dart';
import '../controller.dart';
import '../render.dart';
import '../style.dart';
import '../viewmodel.dart';

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
    extraMap[NodeProps.kOnInterceptTouchEvent] =
        ControllerMethodProp(setInterceptTouch, false);
    extraMap[NodeProps.kOnInterceptPullUpEvent] =
        ControllerMethodProp(setInterceptPullUp, false);
    extraMap.addAll(groupExtraMethodProp);

    return extraMap;
  }

  Map<String, ControllerMethodProp> get groupExtraMethodProp;

  @ControllerProps(NodeProps.kOnInterceptTouchEvent)
  void setInterceptTouch(T viewModel, bool flag) {
    viewModel.interceptTouch = flag;
  }

  @ControllerProps(NodeProps.kOnInterceptPullUpEvent)
  void setInterceptPullUp(T viewModel, bool flag) {
    viewModel.interceptPullUp = flag;
  }
}
