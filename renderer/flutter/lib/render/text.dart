import 'package:flutter/widgets.dart';

import '../common/voltron_map.dart';
import '../controller/manager.dart';
import '../controller/props.dart';
import '../dom/prop.dart';
import '../dom/style_node.dart';
import '../dom/text.dart';
import '../engine/engine_context.dart';
import '../flexbox/flex_define.dart';
import '../util/enum_util.dart';
import '../widget/text.dart';
import 'controller.dart';
import 'node.dart';
import 'tree.dart';
import 'view_model.dart';

class TextController extends VoltronViewController<TextRenderNode> {
  static const String className = "Text";

  @override
  TextRenderNode createRenderNode(int id, VoltronMap? props, String name,
      RenderTree tree, ControllerManager controllerManager, bool lazy) {
    return TextRenderNode(id, name, tree, controllerManager, props);
  }

  @override
  Widget createWidget(BuildContext context, TextRenderNode renderNode) {
    return TextWidget(renderNode.renderViewModel);
  }

  @override
  Map<String, ControllerMethodProp> get extendRegisteredMethodProp {
    var extraMap = <String, ControllerMethodProp>{};
    extraMap[NodeProps.style] = ControllerMethodProp(setStyle, VoltronMap());
    return extraMap;
  }

  @ControllerProps(NodeProps.style)
  void setStyle(TextRenderNode node, VoltronMap style) {
    var flexDirection = style.get('flexDirection');
    if (flexDirection != null && flexDirection.isNotEmpty) {
      node.renderViewModel.flexDirection =
          enumValueFromString<FlexCSSDirection>(
                  replaceKey(flexDirection), FlexCSSDirection.values) ??
              FlexCSSDirection.ROW;
    }

    var alignItems = style.get('alignItems');
    if (alignItems != null && alignItems.isNotEmpty) {
      node.renderViewModel.alignItems = enumValueFromString<FlexAlign>(
              replaceKey(alignItems), FlexAlign.values) ??
          FlexAlign.FLEX_START;
    }
    var justifyContent = style.get('justifyContent');
    if (justifyContent != null && justifyContent.isNotEmpty) {
      node.renderViewModel.justifyContent = enumValueFromString<FlexAlign>(
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

  @override
  StyleNode createStyleNode(
      String name, String tagName, int instanceId, int id, bool isVirtual) {
    return TextNode(instanceId, id, name, tagName, isVirtual);
  }

  @override
  void updateExtra(TextRenderNode node, Object updateExtra) {
    if (updateExtra is TextExtra && updateExtra.extra is TextData) {
      node.renderViewModel.padding = EdgeInsets.only(
          left: updateExtra.leftPadding,
          top: updateExtra.topPadding,
          bottom: updateExtra.bottomPadding,
          right: updateExtra.rightPadding);
      node.renderViewModel.data = updateExtra.extra as TextData;
      node.renderViewModel.update(node);
    }
  }
}

class TextRenderViewModel extends RenderViewModel {
  EdgeInsets? padding;
  TextData? data;
  FlexCSSDirection flexDirection = FlexCSSDirection.ROW;
  FlexAlign? alignItems;
  FlexAlign? justifyContent;

  Alignment? getAlignment() {
    if (alignItems == null && justifyContent == null) {
      return null;
    }

    var x = -1.0;
    var y = -1.0;
    if (flexDirection == FlexCSSDirection.ROW) {
      x = _getAlignmentValue(alignItems);
      y = _getAlignmentValue(justifyContent);
    } else {
      y = _getAlignmentValue(alignItems);
      x = _getAlignmentValue(justifyContent);
    }

    print(
        'Alignment ${x.toString()} ${y.toString()} ${alignItems.toString()} ${justifyContent.toString()} ${data?.text} ');
    return Alignment(x, y);
  }

  double _getAlignmentValue(FlexAlign? value) {
    if (value == FlexAlign.CENTER) {
      return 0.0;
    } else if (value == FlexAlign.FLEX_END) {
      return 1.0;
    }
    return -1.0;
  }

  TextRenderViewModel(
      int id, int instanceId, String className, EngineContext context)
      : super(id, instanceId, className, context);

  TextRenderViewModel.copy(int id, int instanceId, String className,
      EngineContext context, TextRenderViewModel viewModel)
      : super.copy(id, instanceId, className, context, viewModel) {
    padding = viewModel.padding;
    var data = viewModel.data;
    if (data != null) {
      data = TextData(data.maxLines, data.text, data.textAlign,
          data.textScaleFactor, data.textOverflow);
    }
  }

  @override
  bool operator ==(Object other) {
    return other is TextRenderViewModel &&
        padding?.left == other.padding?.left &&
        padding?.top == other.padding?.top &&
        padding?.bottom == other.padding?.bottom &&
        padding?.left == other.padding?.left &&
        data == other.data &&
        super == other;
  }

  @override
  int get hashCode {
    var paddingValue = padding;
    if (paddingValue == null) {
      return data.hashCode | super.hashCode;
    } else {
      return paddingValue.left.hashCode |
          paddingValue.top.hashCode |
          paddingValue.bottom.hashCode |
          paddingValue.left.hashCode |
          data.hashCode |
          super.hashCode;
    }
  }
}

class TextRenderNode extends RenderNode<TextRenderViewModel> {
  TextRenderNode(int id, String className, RenderTree root,
      ControllerManager controllerManager, VoltronMap? props)
      : super(id, className, root, controllerManager, props);

  @override
  TextRenderViewModel createRenderViewModel(EngineContext context) {
    return TextRenderViewModel(id, rootId, name, context);
  }
}
