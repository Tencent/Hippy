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
  static const String kClassName = "View";

  @override
  Widget createWidget(
      BuildContext context, DivRenderViewModel renderViewModel) {
    return DivWidget(renderViewModel);
  }

  @override
  DivRenderViewModel createRenderViewModel(
      RenderNode node, EngineContext context) {
    return DivRenderViewModel(node.id, node.rootId, node.name, context);
  }

  @override
  Map<String, ControllerMethodProp> get groupExtraMethodProp => {
        NodeProps.kOverflow: ControllerMethodProp(
            setOverflow, enumValueToString(ContainOverflow.visible)),
        NodeProps.kBackgroundImage:
            ControllerMethodProp(setBackgroundImage, null),
        NodeProps.kBackgroundSize: ControllerMethodProp(
            setBackgroundImageSize, enumValueToString(ImageResizeMode.auto)),
        NodeProps.kBackgroundPositionX:
            ControllerMethodProp(setBackgroundImagePositionX, ''),
        NodeProps.kBackgroundPositionY:
            ControllerMethodProp(setBackgroundImagePositionY, ''),
        NodeProps.kBackgroundRepeat:
            ControllerMethodProp(setBackgroundImageRepeat, ''),
      };

  @ControllerProps(NodeProps.kOverflow)
  void setOverflow(DivRenderViewModel viewModel, String overflow) {
    viewModel.overflow = overflow;
  }

  @ControllerProps(NodeProps.kBackgroundImage)
  void setBackgroundImage(DivRenderViewModel viewModel, Object data) {
    if (data is String) {
      viewModel.backgroundImg = getInnerPath(
          viewModel.context.getInstance(viewModel.rootId)?.instanceContext,
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

  @ControllerProps(NodeProps.kBackgroundSize)
  void setBackgroundImageSize(
      DivRenderViewModel viewModel, String resizeModeValue) {
    viewModel.backgroundImgSize = resizeModeValue;
  }

  @ControllerProps(NodeProps.kBackgroundPositionX)
  void setBackgroundImagePositionX(
      DivRenderViewModel viewModel, String positionX) {
    viewModel.imagePositionX = positionX;
  }

  @ControllerProps(NodeProps.kBackgroundPositionY)
  void setBackgroundImagePositionY(
      DivRenderViewModel viewModel, String positionY) {
    viewModel.imagePositionY = positionY;
  }

  @ControllerProps(NodeProps.kBackgroundRepeat)
  void setBackgroundImageRepeat(DivRenderViewModel viewModel, String value) {
    viewModel.backgroundImgRepeat = value;
  }

  @override
  String get name => kClassName;
}
