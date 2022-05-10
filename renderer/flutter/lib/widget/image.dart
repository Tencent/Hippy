//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2019 THL A29 Limited, a Tencent company.
// All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import 'dart:collection';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../common/voltron_map.dart';
import '../render.dart';
import '../style.dart';
import '../util.dart';
import '../viewmodel.dart';
import 'base.dart';
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
          return PositionWidget(
            viewModel,
            child: imageChild(viewModel),
          );
        },
      ),
    );
  }

  Widget imageChild(ImageRenderViewModel imageViewModel) {
    var image = imageViewModel.image;
    var defaultImage = imageViewModel.defaultImage;
    late Widget imageWidget;
    if (defaultImage != null &&
        !imageViewModel.dispatchedEvent.contains(NodeProps.kOnLoadEnd)) {
      // 默认图
      imageWidget = Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(imageViewModel.borderRadius ?? 0),
          image: DecorationImage(
            image: defaultImage.image,
            fit: imageViewModel.fit,
            alignment: imageViewModel.alignment ?? Alignment.center,
            repeat: imageViewModel.repeat ?? ImageRepeat.noRepeat,
          ),
        ),
      );
    } else if (imageViewModel.capInsets != null &&
        imageViewModel.imageHeight == null) {
      //.9图，图片信息未加载完成时，先占位
      imageWidget = const Placeholder(color: Colors.transparent);
    } else if (image != null) {
      var centerSliceParam = createCenterSlice(imageViewModel);
      var fitMode = centerSliceParam != null ? BoxFit.fill : imageViewModel.fit;
      imageWidget = Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(imageViewModel.borderRadius ?? 0),
          image: DecorationImage(
            image: image,
            fit: fitMode,
            alignment: imageViewModel.alignment ?? Alignment.center,
            repeat: imageViewModel.repeat ?? ImageRepeat.noRepeat,
            centerSlice: centerSliceParam,
          ),
        ),
      );
    } else {
      imageWidget = Container();
    }
    if (imageViewModel.tintColor > 0) {
      imageWidget = ColorFiltered(
        colorFilter: ColorFilter.mode(
          Color(imageViewModel.tintColor),
          BlendMode.srcATop,
        ),
        child: imageWidget,
      );
    }
    return imageWidget;
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
      LogUtils.d(
        'ImageWidget',
        "createCenterSlice, left: ${left.toString()} top: ${top.toString()} right: ${right.toString()} bottom: ${bottom.toString()}",
      );
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

  CapInsets({
    required this.left,
    required this.top,
    required this.right,
    required this.bottom,
  });
}

class ImageEventDispatcher {
  final int _id;
  final RenderContext _context;
  final HashSet<String> _gestureTypes = HashSet();

  ImageEventDispatcher(this._id, this._context);

  void handleOnLoad() {
    if (_needHandle(NodeProps.kOnLoad)) {
      _handleEvent(NodeProps.kOnLoad, VoltronMap());
    }
  }

  void handleOnLoadEnd() {
    if (_needHandle(NodeProps.kOnLoadEnd)) {
      _handleEvent(NodeProps.kOnLoadEnd, VoltronMap());
    }
  }

  void handleOnLoadStart() {
    if (_needHandle(NodeProps.kOnLoadStart)) {
      _handleEvent(NodeProps.kOnLoadStart, VoltronMap());
    }
  }

  void handleOnError() {
    if (_needHandle(NodeProps.kOnError)) {
      _handleEvent(NodeProps.kOnError, VoltronMap());
    }
  }

  void handleOnProgress(VoltronMap params) {
    if (_needHandle(NodeProps.kOnProgress)) {
      _handleEvent(NodeProps.kOnProgress, params);
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

  void _handleEvent(String type, VoltronMap params) {
    _context.eventHandler.receiveUIComponentEvent(_id, type, params);
  }
}
