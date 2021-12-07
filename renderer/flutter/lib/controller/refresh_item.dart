import 'package:flutter/widgets.dart';

import '../common/voltron_map.dart';
import '../controller/manager.dart';
import '../controller/props.dart';
import '../engine/engine_context.dart';
import '../render/node.dart';
import '../render/tree.dart';
import '../viewmodel/refresh_item.dart';
import '../widget/refresh_item.dart';
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
