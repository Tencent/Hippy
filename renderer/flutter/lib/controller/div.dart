import 'dart:io';

import 'package:flutter/widgets.dart';

import '../controller.dart';
import '../engine.dart';
import '../render.dart';
import '../style.dart';
import '../util.dart';
import '../viewmodel.dart';
import '../widget.dart';
import 'group.dart';

class DivController extends BaseGroupController<DivRenderViewModel> {
  static const String className = "View";

  @override
  Widget createWidget(BuildContext context, DivRenderViewModel renderViewModel) {
    return DivWidget(renderViewModel);
  }

  @override
  DivRenderViewModel createRenderViewModel(RenderNode node, EngineContext context) {
    return DivRenderViewModel(node.id, node.rootId, node.name, context);
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
  void setOverflow(DivRenderViewModel viewModel, String overflow) {
    viewModel.overflow = overflow;
  }

  @ControllerProps(NodeProps.backgroundImage)
  void setBackgroundImage(DivRenderViewModel viewModel, Object data) {
    if (data is String) {
      viewModel.backgroundImg = getInnerPath(
          viewModel.context
              .getInstance(viewModel.rootId)
              ?.instanceContext,
          data);
    } else {
      viewModel.backgroundImg = data;
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
  void setBackgroundImageSize(DivRenderViewModel viewModel, String resizeModeValue) {
    viewModel.backgroundImgSize = resizeModeValue;
  }

  @ControllerProps(NodeProps.backgroundPositionX)
  void setBackgroundImagePositionX(DivRenderViewModel viewModel, String positionX) {
    viewModel.imagePositionX = positionX;
  }

  @ControllerProps(NodeProps.backgroundPositionY)
  void setBackgroundImagePositionY(DivRenderViewModel viewModel, String positionY) {
    viewModel.imagePositionY = positionY;
  }

  @ControllerProps(NodeProps.backgroundRepeat)
  void setBackgroundImageRepeat(DivRenderViewModel viewModel, String value) {
    viewModel.backgroundImgRepeat = value;
  }

  @override
  String get name => className;

}
