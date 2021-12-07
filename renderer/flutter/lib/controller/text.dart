import 'package:flutter/widgets.dart';

import '../common/voltron_map.dart';
import '../controller/controller.dart';
import '../controller/manager.dart';
import '../controller/props.dart';
import '../engine/engine_context.dart';
import '../render/text.dart';
import '../render/tree.dart';
import '../style/flex_define.dart';
import '../style/prop.dart';
import '../util/enum_util.dart';
import '../viewmodel/text.dart';
import '../widget/text.dart';

class TextController
    extends VoltronViewController<TextRenderViewModel, TextRenderNode> {
  static const String className = "Text";

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
  Map<String, ControllerMethodProp> get extendRegisteredMethodProp {
    var extraMap = <String, ControllerMethodProp>{};
    extraMap[NodeProps.style] = ControllerMethodProp(setStyle, VoltronMap());
    return extraMap;
  }

  @ControllerProps(NodeProps.style)
  void setStyle(TextRenderViewModel renderViewModel, VoltronMap style) {
    var flexDirection = style.get('flexDirection');
    if (flexDirection != null && flexDirection.isNotEmpty) {
      renderViewModel.flexDirection = enumValueFromString<FlexCSSDirection>(
              replaceKey(flexDirection), FlexCSSDirection.values) ??
          FlexCSSDirection.ROW;
    }

    var alignItems = style.get('alignItems');
    if (alignItems != null && alignItems.isNotEmpty) {
      renderViewModel.alignItems = enumValueFromString<FlexAlign>(
              replaceKey(alignItems), FlexAlign.values) ??
          FlexAlign.FLEX_START;
    }
    var justifyContent = style.get('justifyContent');
    if (justifyContent != null && justifyContent.isNotEmpty) {
      renderViewModel.justifyContent = enumValueFromString<FlexAlign>(
              replaceKey(justifyContent), FlexAlign.values) ??
          FlexAlign.FLEX_START;
    }
  }

  String replaceKey(String key, [bool needReplaceCross = true]) {
    if (needReplaceCross) {
      return key.toUpperCase().replaceAll("-", "_");
    }
    return key.toUpperCase();
  }

  @override
  String get name => className;

// @override
// void updateExtra(TextRenderViewModel renderViewModel, Object updateExtra) {
//   if (updateExtra is TextExtra && updateExtra.extra is TextData) {
//     renderViewModel.padding = EdgeInsets.only(
//         left: updateExtra.leftPadding,
//         top: updateExtra.topPadding,
//         bottom: updateExtra.bottomPadding,
//         right: updateExtra.rightPadding);
//     renderViewModel.data = updateExtra.extra as TextData;
//     renderViewModel.update(node);
//   }
// }
}
