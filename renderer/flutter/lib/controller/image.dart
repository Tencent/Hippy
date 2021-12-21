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
  static const String kClassName = "Image";

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
    extraMap[NodeProps.kSrc] = ControllerMethodProp(setUrl, '');
    extraMap[NodeProps.kSource] = ControllerMethodProp(setSource, null);
    extraMap[NodeProps.kResizeMode] = ControllerMethodProp(setResizeMode, '');
    extraMap[NodeProps.kOnLoad] = ControllerMethodProp(setOnLoad, false);
    extraMap[NodeProps.kOnLoadStart] =
        ControllerMethodProp(setOnLoadStart, false);
    extraMap[NodeProps.kOnLoadEnd] = ControllerMethodProp(setOnLoadEnd, false);
    extraMap[NodeProps.kOnError] = ControllerMethodProp(setOnError, false);
    extraMap[NodeProps.kCapInsets] = ControllerMethodProp(setCapInsets, null);
    extraMap[NodeProps.kDefaultSource] =
        ControllerMethodProp(setDefaultSource, null);

    return extraMap;
  }

  // for Android
  @ControllerProps(NodeProps.kSrc)
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
  @ControllerProps(NodeProps.kSource)
  void setSource(ImageRenderViewModel renderViewModel, VoltronArray source) {
    if (source.size() == 0) return;
    VoltronMap firstObj = source.get(0);
    String src = firstObj.get('uri');
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
          if (!viewModel.dispatchedEvent.contains(NodeProps.kOnLoad)) {
            viewModel.imageEventDispatcher.handleOnLoad();
            viewModel.imageEventDispatcher.handleOnLoadEnd();
            viewModel.imageWidth = image.image.width;
            viewModel.imageHeight = image.image.height;
            viewModel.dispatchedEvent.add(NodeProps.kOnLoad);
            viewModel.dispatchedEvent.add(NodeProps.kOnLoadEnd);

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

  @ControllerProps(NodeProps.kResizeMode)
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

  @ControllerProps(NodeProps.kTintColor)
  void setTintColor(ImageRenderViewModel renderViewModel, int tintColor) {
    renderViewModel.tintColor = tintColor;
  }

  @ControllerProps(NodeProps.kDefaultSource)
  void setDefaultSource(
      ImageRenderViewModel renderViewModel, String defaultSource) {
    if (defaultSource.indexOf('data:image/png;base64,') == 0) {
      var bytesImage = Base64Decoder()
          .convert(defaultSource.replaceFirst('data:image/png;base64,', ''));
      renderViewModel.defaultImage = Image.memory(bytesImage);
    } else {
      LogUtils.w('ImageController',
          "setDefaultSource error, defaultSource must be base64");
    }
  }

  @ControllerProps(NodeProps.kOnLoad)
  void setOnLoad(ImageRenderViewModel renderViewModel, bool enable) {
    setEventType(NodeProps.kOnLoad, renderViewModel, enable);
  }

  @ControllerProps(NodeProps.kOnLoadEnd)
  void setOnLoadEnd(ImageRenderViewModel renderViewModel, bool enable) {
    setEventType(NodeProps.kOnLoadEnd, renderViewModel, enable);
  }

  @ControllerProps(NodeProps.kOnLoadStart)
  void setOnLoadStart(ImageRenderViewModel renderViewModel, bool enable) {
    setEventType(NodeProps.kOnLoadStart, renderViewModel, enable);
  }

  @ControllerProps(NodeProps.kOnError)
  void setOnError(ImageRenderViewModel renderViewModel, bool enable) {
    setEventType(NodeProps.kOnError, renderViewModel, enable);
  }

  @ControllerProps(NodeProps.kCapInsets)
  void setCapInsets(
      ImageRenderViewModel renderViewModel, VoltronMap capInsetsMap) {
    renderViewModel.capInsets = CapInsets(
        left: capInsetsMap.get('left').toDouble(),
        top: capInsetsMap.get('top').toDouble(),
        right: capInsetsMap.get('right').toDouble(),
        bottom: capInsetsMap.get('bottom').toDouble());
  }

  void setEventType(
      String type, ImageRenderViewModel renderViewModel, bool enable) {
    if (enable) {
      renderViewModel.imageEventDispatcher.addEventType(type);
    } else {
      renderViewModel.imageEventDispatcher.removeEventType(type);
    }
  }

  @override
  String get name => kClassName;
}
