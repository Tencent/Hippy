import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

import '../common.dart';
import '../controller.dart';
import '../engine.dart';
import '../render.dart';
import '../style.dart';
import '../util.dart';
import '../viewmodel.dart';
import '../widget.dart';

class ImageController extends BaseViewController<ImageRenderViewModel> {
  static const String className = "Image";

  @override
  ImageRenderViewModel createRenderViewModel(
      RenderNode node, EngineContext context) {
    return ImageRenderViewModel(node.id, node.rootId, node.name, context);
  }

  @override
  Widget createWidget(
      BuildContext context, ImageRenderViewModel renderViewModel) {
    return ImageWidget(renderViewModel);
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
  void setUrl(ImageRenderViewModel renderViewModel, String src) {
    src = getInnerPath(
        renderViewModel.context
            .getInstance(renderViewModel.rootId)
            ?.instanceContext,
        src);
    if (src != renderViewModel.src) {
      renderViewModel.src = getInnerPath(
          renderViewModel.context
              .getInstance(renderViewModel.rootId)
              ?.instanceContext,
          src);
      loadImage(renderViewModel);
    }
  }

  // for iOS
  @ControllerProps(NodeProps.source)
  void setSource(ImageRenderViewModel renderViewModel, VoltronArray source) {
    if (source.size() == 0) return;
    VoltronMap firstObj = source.get(0);
    String src = firstObj.get('uri');
    src = getInnerPath(
        renderViewModel.context.getInstance(renderViewModel.rootId)?.instanceContext,
        src);
    if (src != renderViewModel.src) {
      renderViewModel.src = getInnerPath(
          renderViewModel.context
              .getInstance(renderViewModel.rootId)
              ?.instanceContext,
          src);
      loadImage(renderViewModel);
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

  void loadImage(ImageRenderViewModel renderViewModel) {
    var viewModel = renderViewModel;
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
  void setResizeMode(ImageRenderViewModel renderViewModel, String resizeMode) {
    if (resizeMode == 'contain') {
      renderViewModel.fit = BoxFit.contain;
    } else if (resizeMode == 'cover') {
      renderViewModel.fit = BoxFit.cover;
    } else if (resizeMode == 'center') {
      renderViewModel.alignment = Alignment.center;
    } else if (resizeMode == 'origin') {
      renderViewModel.alignment = Alignment.topLeft;
    } else if (resizeMode == 'repeat') {
      renderViewModel.repeat = ImageRepeat.repeat;
    } else {
      renderViewModel.fit = BoxFit.cover;
    }
  }

  @ControllerProps(NodeProps.tintColor)
  void setTintColor(ImageRenderViewModel renderViewModel, int tintColor) {
    renderViewModel.tintColor = tintColor;
  }

  @ControllerProps(NodeProps.defaultSource)
  void setDefaultSource(ImageRenderViewModel renderViewModel, String defaultSource) {
    if (defaultSource.indexOf('data:image/png;base64,') == 0) {
      var bytesImage = Base64Decoder()
          .convert(defaultSource.replaceFirst('data:image/png;base64,', ''));
      renderViewModel.defaultImage = Image.memory(bytesImage);
    } else {
      LogUtils.w('ImageController',
          "setDefaultSource error, defaultSource must be base64");
    }
  }

  @ControllerProps(NodeProps.onLoad)
  void setOnLoad(ImageRenderViewModel renderViewModel, bool enable) {
    setEventType(NodeProps.onLoad, renderViewModel, enable);
  }

  @ControllerProps(NodeProps.onLoadEnd)
  void setOnLoadEnd(ImageRenderViewModel renderViewModel, bool enable) {
    setEventType(NodeProps.onLoadEnd, renderViewModel, enable);
  }

  @ControllerProps(NodeProps.onLoadStart)
  void setOnLoadStart(ImageRenderViewModel renderViewModel, bool enable) {
    setEventType(NodeProps.onLoadStart, renderViewModel, enable);
  }

  @ControllerProps(NodeProps.onError)
  void setOnError(ImageRenderViewModel renderViewModel, bool enable) {
    setEventType(NodeProps.onError, renderViewModel, enable);
  }

  @ControllerProps(NodeProps.capInsets)
  void setCapInsets(ImageRenderViewModel renderViewModel, VoltronMap capInsetsMap) {
    renderViewModel.capInsets = CapInsets(
        left: capInsetsMap.get('left').toDouble(),
        top: capInsetsMap.get('top').toDouble(),
        right: capInsetsMap.get('right').toDouble(),
        bottom: capInsetsMap.get('bottom').toDouble());
  }

  void setEventType(String type, ImageRenderViewModel renderViewModel, bool enable) {
    if (enable) {
      renderViewModel.imageEventDispatcher.addEventType(type);
    } else {
      renderViewModel.imageEventDispatcher.removeEventType(type);
    }
  }

  @override
  String get name => className;


}
