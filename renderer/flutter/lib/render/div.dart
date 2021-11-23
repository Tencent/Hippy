import 'dart:io';

import 'package:flutter/widgets.dart';

import '../common/voltron_map.dart';
import '../controller/manager.dart';
import '../controller/props.dart';
import '../dom/prop.dart';
import '../engine/context.dart';
import '../engine/engine_context.dart';
import '../util/enum_util.dart';
import '../widget/div.dart';
import 'group.dart';
import 'tree.dart';

class DivController extends GroupController<DivRenderNode> {
  static const String className = "View";

  @override
  DivRenderNode createRenderNode(int id, VoltronMap? props, String name,
      RenderTree tree, ControllerManager controllerManager, bool lazy) {
    return DivRenderNode(id, name, tree, controllerManager, props, lazy);
  }

  @override
  Widget createWidget(BuildContext context, DivRenderNode renderNode) {
    return DivWidget(renderNode.renderViewModel);
  }

  @override
  Map<String, ControllerMethodProp> get groupExtraMethodProp => {
        NodeProps.overflow: ControllerMethodProp(
            setOverflow, enumValueToString(ContainOverflow.visible)),
        NodeProps.backgroundImage:
            ControllerMethodProp(setBackgroundImage, null),
        NodeProps.backgroundSize: ControllerMethodProp(
            setBackgroundImageSize, enumValueToString(ImageResizeMode.auto)),
        NodeProps.backgroundPositionX:
            ControllerMethodProp(setBackgroundImagePositionX, ''),
        NodeProps.backgroundPositionY:
            ControllerMethodProp(setBackgroundImagePositionY, ''),
        NodeProps.backgroundRepeat:
            ControllerMethodProp(setBackgroundImageRepeat, ''),
      };

  @ControllerProps(NodeProps.overflow)
  void setOverflow(DivRenderNode node, String overflow) {
    node.renderViewModel.overflow = overflow;
  }

  @ControllerProps(NodeProps.backgroundImage)
  void setBackgroundImage(DivRenderNode node, Object data) {
    if (data is String) {
      node.renderViewModel.backgroundImg = getInnerPath(
          node.renderViewModel.context
              .getInstance(node.rootId)
              ?.instanceContext,
          data);
    } else {
      node.renderViewModel.backgroundImg = data;
    }
  }

  String getInnerPath(InstanceContext? context, String path) {
    if (context != null && path.startsWith("hpfile://")) {
      var relativePath = path.replaceFirst("hpfile://./", "");
      var bundleLoaderPath = context.bundleLoader?.path;
      if (bundleLoaderPath != null) {
        path = bundleLoaderPath.substring(
                0, bundleLoaderPath.lastIndexOf(Platform.pathSeparator) + 1) +
            relativePath;
      }
    }
    return path;
  }

  @ControllerProps(NodeProps.backgroundSize)
  void setBackgroundImageSize(DivRenderNode node, String resizeModeValue) {
    node.renderViewModel.backgroundImgSize = resizeModeValue;
  }

  @ControllerProps(NodeProps.backgroundPositionX)
  void setBackgroundImagePositionX(DivRenderNode node, String positionX) {
    node.renderViewModel.imagePositionX = positionX;
  }

  @ControllerProps(NodeProps.backgroundPositionY)
  void setBackgroundImagePositionY(DivRenderNode node, String positionY) {
    node.renderViewModel.imagePositionY = positionY;
  }

  @ControllerProps(NodeProps.backgroundRepeat)
  void setBackgroundImageRepeat(DivRenderNode node, String value) {
    node.renderViewModel.backgroundImgRepeat = value;
  }

  @override
  String get name => className;
}

class DivRenderNode extends GroupRenderNode<DivRenderViewModel> {
  DivRenderNode(int id, String className, RenderTree root,
      ControllerManager controllerManager, VoltronMap? props, bool isLazy)
      : super(id, className, root, controllerManager, props, isLazy);

  @override
  DivRenderViewModel createRenderViewModel(EngineContext context) {
    return DivRenderViewModel(id, rootId, name, context);
  }
}

class DivRenderViewModel extends GroupViewModel {
  @override
  String overflow = enumValueToString(ContainOverflow.visible);
  Object? backgroundImg;
  String backgroundImgSize = enumValueToString(ImageResizeMode.auto);

  String imagePositionX = "";
  String imagePositionY = "";
  String backgroundImgRepeat = "";

  @override
  Decoration? getDecoration({Color? backgroundColor}) {
    return toDecoration(
        decorationColor: backgroundColor,
        backgroundImg: backgroundImg,
        backgroundImgSize: backgroundImgSize,
        backgroundImgRepeat: backgroundImgRepeat,
        backgroundImgPositionX: imagePositionX,
        backgroundImgPositionY: imagePositionY);
  }

  DivRenderViewModel(
      int id, int instanceId, String className, EngineContext context)
      : super(id, instanceId, className, context);

  DivRenderViewModel.copy(int id, int instanceId, String className,
      EngineContext context, DivRenderViewModel viewModel)
      : super.copy(id, instanceId, className, context, viewModel) {
    backgroundImg = viewModel.backgroundImg;
    backgroundImgSize = viewModel.backgroundImgSize;
    imagePositionX = viewModel.imagePositionX;
    imagePositionY = viewModel.imagePositionY;
    backgroundImgRepeat = viewModel.backgroundImgRepeat;
  }

  @override
  bool operator ==(Object other) {
    return other is DivRenderViewModel &&
        overflow == other.overflow &&
        backgroundImg == other.backgroundImg &&
        backgroundImgSize == other.backgroundImgSize &&
        backgroundImgRepeat == other.backgroundImgRepeat &&
        imagePositionX == other.imagePositionX &&
        imagePositionY == other.imagePositionY &&
        super == (other);
  }

  @override
  int get hashCode =>
      overflow.hashCode |
      backgroundImg.hashCode |
      backgroundImgSize.hashCode |
      backgroundImgRepeat.hashCode |
      imagePositionX.hashCode |
      imagePositionY.hashCode |
      super.hashCode;
}
