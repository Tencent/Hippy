import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

import '../common/voltron_array.dart';
import '../common/voltron_map.dart';
import '../controller/manager.dart';
import '../controller/props.dart';
import '../dom/prop.dart';
import '../engine/context.dart';
import '../engine/engine_context.dart';
import '../util/image_util.dart';
import '../util/log_util.dart';
import '../widget/image.dart';
import 'controller.dart';
import 'node.dart';
import 'tree.dart';
import 'view_model.dart';

class ImageController extends VoltronViewController<ImageRenderNode> {
  static const String className = "Image";

  @override
  ImageRenderNode createRenderNode(int id, VoltronMap? props, String name,
      RenderTree tree, ControllerManager controllerManager, bool lazy) {
    return ImageRenderNode(id, name, tree, controllerManager, props);
  }

  @override
  Widget createWidget(BuildContext context, ImageRenderNode renderNode) {
    return ImageWidget(renderNode.renderViewModel);
  }

  @override
  Map<String, ControllerMethodProp> get extendRegisteredMethodProp {
    var extraMap = <String, ControllerMethodProp>{};
    extraMap[NodeProps.src] = ControllerMethodProp(setUrl, '');
    extraMap[NodeProps.source] = ControllerMethodProp(setSource, null);
    extraMap[NodeProps.resizeMode] = ControllerMethodProp(setResizeMode, '');
    extraMap[NodeProps.onLoad] = ControllerMethodProp(setOnLoad, false);
    extraMap[NodeProps.onLoadStart] =
        ControllerMethodProp(setOnLoadStart, false);
    extraMap[NodeProps.onLoadEnd] = ControllerMethodProp(setOnLoadEnd, false);
    extraMap[NodeProps.onError] = ControllerMethodProp(setOnError, false);
    extraMap[NodeProps.capInsets] = ControllerMethodProp(setCapInsets, null);
    extraMap[NodeProps.defaultSource] =
        ControllerMethodProp(setDefaultSource, null);

    return extraMap;
  }

  // for Android
  @ControllerProps(NodeProps.src)
  void setUrl(ImageRenderNode node, String src) {
    src = getInnerPath(
        node.renderViewModel.context.getInstance(node.rootId)?.instanceContext,
        src);
    if (src != node.renderViewModel.src) {
      node.renderViewModel.src = getInnerPath(
          node.renderViewModel.context
              .getInstance(node.rootId)
              ?.instanceContext,
          src);
      loadImage(node);
    }
  }

  // for iOS
  @ControllerProps(NodeProps.source)
  void setSource(ImageRenderNode node, VoltronArray source) {
    if (source.size() == 0) return;
    VoltronMap firstObj = source.get(0);
    String src = firstObj.get('uri');
    src = getInnerPath(
        node.renderViewModel.context.getInstance(node.rootId)?.instanceContext,
        src);
    if (src != node.renderViewModel.src) {
      node.renderViewModel.src = getInnerPath(
          node.renderViewModel.context
              .getInstance(node.rootId)
              ?.instanceContext,
          src);
      loadImage(node);
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

  void loadImage(ImageRenderNode node) {
    var viewModel = node.renderViewModel;
    viewModel.imageEventDispatcher.handleOnLoadStart();
    viewModel.dispatchedEvent = {};
    var src = viewModel.src;
    if (src == null) {
      return;
    }

    var image = getImage(src);
    image
        .resolve(ImageConfiguration())
        .addListener(ImageStreamListener((image, flag) {
          if (!viewModel.dispatchedEvent.contains(NodeProps.onLoad)) {
            viewModel.imageEventDispatcher.handleOnLoad();
            viewModel.imageEventDispatcher.handleOnLoadEnd();
            viewModel.imageWidth = image.image.width;
            viewModel.imageHeight = image.image.height;
            if (viewModel.capInsets != null || viewModel.defaultImage != null) {
              node.update();
            }
            viewModel.dispatchedEvent.add(NodeProps.onLoad);
            viewModel.dispatchedEvent.add(NodeProps.onLoadEnd);

            LogUtils.d('ImageController',
                "ImageProvider onImage, info: ${image.toString()}");
          }
        }, onError: (exception, stackTrace) {
          viewModel.imageEventDispatcher.handleOnError();
          viewModel.imageEventDispatcher.handleOnLoadEnd();
          LogUtils.w('ImageController',
              "ImageProvider onError, src ${viewModel.src} exception: ${exception.toString()}");
        }));
    viewModel.image = image;
  }

  @ControllerProps(NodeProps.resizeMode)
  void setResizeMode(ImageRenderNode node, String resizeMode) {
    if (resizeMode == 'contain') {
      node.renderViewModel.fit = BoxFit.contain;
    } else if (resizeMode == 'cover') {
      node.renderViewModel.fit = BoxFit.cover;
    } else if (resizeMode == 'center') {
      node.renderViewModel.alignment = Alignment.center;
    } else if (resizeMode == 'origin') {
      node.renderViewModel.alignment = Alignment.topLeft;
    } else if (resizeMode == 'repeat') {
      node.renderViewModel.repeat = ImageRepeat.repeat;
    } else {
      node.renderViewModel.fit = BoxFit.cover;
    }
  }

  @ControllerProps(NodeProps.tintColor)
  void setTintColor(ImageRenderNode node, int tintColor) {
    node.renderViewModel.tintColor = tintColor;
  }

  @ControllerProps(NodeProps.defaultSource)
  void setDefaultSource(ImageRenderNode node, String defaultSource) {
    if (defaultSource.indexOf('data:image/png;base64,') == 0) {
      var bytesImage = Base64Decoder()
          .convert(defaultSource.replaceFirst('data:image/png;base64,', ''));
      node.renderViewModel.defaultImage = Image.memory(bytesImage);
    } else {
      LogUtils.w('ImageController',
          "setDefaultSource error, defaultSource must be base64");
    }
  }

  @ControllerProps(NodeProps.onLoad)
  void setOnLoad(ImageRenderNode node, bool enable) {
    setEventType(NodeProps.onLoad, node, enable);
  }

  @ControllerProps(NodeProps.onLoadEnd)
  void setOnLoadEnd(ImageRenderNode node, bool enable) {
    setEventType(NodeProps.onLoadEnd, node, enable);
  }

  @ControllerProps(NodeProps.onLoadStart)
  void setOnLoadStart(ImageRenderNode node, bool enable) {
    setEventType(NodeProps.onLoadStart, node, enable);
  }

  @ControllerProps(NodeProps.onError)
  void setOnError(ImageRenderNode node, bool enable) {
    setEventType(NodeProps.onError, node, enable);
  }

  @ControllerProps(NodeProps.capInsets)
  void setCapInsets(ImageRenderNode node, VoltronMap capInsetsMap) {
    node.renderViewModel.capInsets = CapInsets(
        left: capInsetsMap.get('left').toDouble(),
        top: capInsetsMap.get('top').toDouble(),
        right: capInsetsMap.get('right').toDouble(),
        bottom: capInsetsMap.get('bottom').toDouble());
  }

  void setEventType(String type, ImageRenderNode node, bool enable) {
    if (enable) {
      node.renderViewModel.imageEventDispatcher.addEventType(type);
    } else {
      node.renderViewModel.imageEventDispatcher.removeEventType(type);
    }
  }

  @override
  String get name => className;
}

class ImageRenderViewModel extends RenderViewModel {
  int tintColor = Colors.transparent.value;
  String? src;
  BoxFit? fit;
  Alignment? alignment;
  ImageRepeat? repeat;
  late ImageEventDispatcher imageEventDispatcher;
  Rect? centerSlice;
  CapInsets? capInsets;
  ImageProvider? image;
  int? imageWidth;
  int? imageHeight;
  Image? defaultImage;
  Set<String> dispatchedEvent = {};

  ImageRenderViewModel(
      int id, int instanceId, String className, EngineContext context)
      : super(id, instanceId, className, context) {
    imageEventDispatcher = createImageEventDispatcher();
  }

  ImageEventDispatcher createImageEventDispatcher() {
    return ImageEventDispatcher(id, context);
  }
}

class ImageRenderNode extends RenderNode<ImageRenderViewModel> {
  ImageRenderNode(int id, String className, RenderTree root,
      ControllerManager controllerManager, VoltronMap? props)
      : super(id, className, root, controllerManager, props);

  @override
  ImageRenderViewModel createRenderViewModel(EngineContext context) {
    return ImageRenderViewModel(id, rootId, name, context);
  }
}
