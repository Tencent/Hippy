import 'package:flutter/widgets.dart';

import '../controller.dart';
import '../engine.dart';
import '../render.dart';
import '../viewmodel.dart';
import '../widget.dart';
import 'group.dart';

class RefreshItemController
    extends BaseGroupController<RefreshWrapperItemRenderViewModel> {
  static const String className = "RefreshWrapperItemView";

  @override
  RefreshWrapperItemRenderViewModel createRenderViewModel(
      RenderNode node, EngineContext context) {
    return RefreshWrapperItemRenderViewModel(
        node.id, node.rootId, node.name, context);
  }

  @override
  Widget createWidget(
      BuildContext context, RefreshWrapperItemRenderViewModel renderViewModel) {
    return RefreshWrapperItemWidget(renderViewModel);
  }

  @override
  Map<String, ControllerMethodProp> get groupExtraMethodProp => {};

  @override
  String get name => className;
}
