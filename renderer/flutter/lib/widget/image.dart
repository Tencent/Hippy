import 'dart:collection';

import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:provider/provider.dart';

import '../dom/prop.dart';
import '../engine/engine_context.dart';
import '../module/event_dispatcher.dart';
import '../module/module.dart';
import '../render/image.dart';
import '../render/view_model.dart';
import '../util/enum_util.dart';
import '../util/log_util.dart';
import 'div.dart';

class ImageWidget extends FRStatefulWidget {
  final ImageRenderViewModel viewModel;

  ImageWidget(this.viewModel) : super(viewModel);

  @override
  State<StatefulWidget> createState() {
    return _ImageWidgetState();
  }
}

class _ImageWidgetState extends FRState<ImageWidget> {
  @override
  Widget build(BuildContext context) {
    LogUtils.dWidget("ImageWidget",
        "build image widget:(id: ${widget.viewModel.id}, name: ${widget.viewModel.name}, parent: ${widget.viewModel.parent?.id})");
    return ChangeNotifierProvider.value(
        value: widget.viewModel,
        child: Consumer<ImageRenderViewModel>(
          builder: (context, viewModel, widget) {
            return PositionWidget(viewModel, child: imageChild(viewModel));
          },
        ));
  }

  Widget imageChild(ImageRenderViewModel imageViewModel) {
    var image = imageViewModel.image;
    var defaultImage = imageViewModel.defaultImage;
    if (defaultImage != null &&
        !imageViewModel.dispatchedEvent.contains(NodeProps.onLoadEnd)) {
      // 默认图
      return defaultImage;
    } else if (imageViewModel.capInsets != null &&
        imageViewModel.imageHeight == null) {
      //.9图，图片信息未加载完成时，先占位
      return Placeholder(color: Colors.transparent);
    } else if (image != null) {
      return Container(
        width: imageViewModel.width,
        height: imageViewModel.height,
        decoration: BoxDecoration(
            borderRadius:
                BorderRadius.circular(imageViewModel.borderRadius ?? 0),
            image: DecorationImage(
                image: image,
                fit: imageViewModel.fit,
                alignment: imageViewModel.alignment ?? Alignment.center,
                repeat: imageViewModel.repeat ?? ImageRepeat.noRepeat,
                centerSlice: createCenterSlice(imageViewModel))),
      );
    } else {
      return Container(
        width: imageViewModel.width,
        height: imageViewModel.height,
      );
    }
  }

  Rect? createCenterSlice(ImageRenderViewModel viewModel) {
    var capInsets = viewModel.capInsets;
    var imageWidth = viewModel.imageWidth;
    var imageHeight = viewModel.imageHeight;
    if (capInsets != null && imageWidth != null && imageHeight != null) {
      var left = capInsets.left;
      var top = capInsets.top;
      var right = capInsets.right;
      var bottom = capInsets.bottom;

      right = imageWidth - right;
      bottom = imageHeight - bottom;
      LogUtils.d('ImageWidget',
          "createCenterSlice, left: ${left.toString()} top: ${top.toString()} right: ${right.toString()} bottom: ${bottom.toString()}");
      return Rect.fromLTRB(left, top, right, bottom);
    }
    return null;
  }
}

class CapInsets {
  double left;
  double top;
  double right;
  double bottom;

  CapInsets(
      {required this.left,
      required this.top,
      required this.right,
      required this.bottom});
}

class ImageEventDispatcher {
  final int _id;
  final EngineContext _context;
  final HashSet<String> _gestureTypes = HashSet();

  ImageEventDispatcher(this._id, this._context);

  void handleOnLoad() {
    if (_needHandle(NodeProps.onLoad)) {
      _handleEvent(NodeProps.onLoad);
    }
  }

  void handleOnLoadEnd() {
    if (_needHandle(NodeProps.onLoadEnd)) {
      _handleEvent(NodeProps.onLoadEnd);
    }
  }

  void handleOnLoadStart() {
    if (_needHandle(NodeProps.onLoadStart)) {
      _handleEvent(NodeProps.onLoadStart);
    }
  }

  void handleOnError() {
    if (_needHandle(NodeProps.onError)) {
      _handleEvent(NodeProps.onError);
    }
  }

  bool _needHandle(String type) {
    return _gestureTypes.contains(type);
  }

  void addEventType(String type) {
    _gestureTypes.add(type);
  }

  void removeEventType(String type) {
    _gestureTypes.remove(type);
  }

  void _handleEvent(String type) {
    _context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveUIComponentEvent(_id, type, null);
  }
}
