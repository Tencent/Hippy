import 'package:flutter/widgets.dart';

import '../common.dart';
import '../controller.dart';
import '../engine.dart';
import '../render.dart';
import '../style.dart';
import '../util.dart';
import '../viewmodel.dart';
import '../widget.dart';

class TextController
    extends VoltronViewController<TextRenderViewModel, TextRenderNode> {
  static const String kClassName = "Text";

  @override
  TextRenderNode createRenderNode(int id, VoltronMap? props, String name,
      RenderTree tree, ControllerManager controllerManager, bool lazy) {
    return TextRenderNode(id, name, tree, controllerManager, props);
  }

  @override
  TextRenderViewModel createRenderViewModel(
      TextRenderNode node, EngineContext context) {
    return TextRenderViewModel(node.id, node.rootId, node.name, context);
  }

  @override
  Widget createWidget(
      BuildContext context, TextRenderViewModel renderViewModel) {
    return TextWidget(renderViewModel);
  }


  @override
  void onAfterUpdateProps(EngineContext context, TextRenderNode renderNode) {
    renderNode.generateSpan(context);
  }

  @override
  void updateLayout(EngineContext context, TextRenderNode renderNode) {
    renderNode.updateData(context);
    super.updateLayout(context, renderNode);
  }

  @override
  Map<String, ControllerMethodProp> get extendRegisteredMethodProp {
    var extraMap = <String, ControllerMethodProp>{};
    extraMap[NodeProps.kStyle] = ControllerMethodProp(setStyle, VoltronMap());
    return extraMap;
  }

  @ControllerProps(NodeProps.kStyle)
  void setStyle(TextRenderViewModel renderViewModel, VoltronMap style) {
    var flexDirection = style.get<String>('flexDirection') ?? '';
    if (flexDirection.isNotEmpty) {
      renderViewModel.flexDirection =
          flexCssDirectionFromValue(flexDirection) ?? FlexCSSDirection.row;
    }

    var alignItems = style.get<String>('alignItems') ?? '';
    if (alignItems.isNotEmpty) {
      renderViewModel.alignItems =
          flexAlignFromValue(alignItems) ?? FlexAlign.flexStart;
    }
    var justifyContent = style.get<String>('justifyContent') ?? '';
    if (justifyContent.isNotEmpty) {
      renderViewModel.justifyContent =
          flexAlignFromValue(justifyContent) ?? FlexAlign.flexStart;
    }
  }

  @override
  String get name => kClassName;

  @override
  void updateExtra(TextRenderViewModel renderViewModel, Object updateExtra) {
    if (updateExtra is TextExtra && updateExtra.extra is TextData) {
      renderViewModel.padding = EdgeInsets.only(
          left: updateExtra.leftPadding,
          top: updateExtra.topPadding,
          bottom: updateExtra.bottomPadding,
          right: updateExtra.rightPadding);
      renderViewModel.data = updateExtra.extra as TextData;
      renderViewModel.update();
    }
  }
}
