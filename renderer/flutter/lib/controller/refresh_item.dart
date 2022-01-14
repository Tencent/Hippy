import 'package:flutter/widgets.dart';

import '../controller.dart';
import '../render.dart';
import '../viewmodel.dart';
import '../widget.dart';

class RefreshItemController
    extends BaseGroupController<RefreshWrapperItemRenderViewModel> {
  static const String kClassName = "RefreshWrapperItemView";

  @override
  RefreshWrapperItemRenderViewModel createRenderViewModel(
      RenderNode node, RenderContext context) {
    return RefreshWrapperItemRenderViewModel(
        node.id, node.rootId, node.name, context);
  }

  @override
  Widget createWidget(
      BuildContext context, RefreshWrapperItemRenderViewModel viewModel) {
    return RefreshWrapperItemWidget(viewModel);
  }

  @override
  Map<String, ControllerMethodProp> get groupExtraMethodProp => {};

  @override
  String get name => kClassName;
}
