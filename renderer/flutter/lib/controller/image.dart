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

import 'dart:convert';

import 'package:flutter/material.dart';

import '../common.dart';
import '../controller.dart';
import '../render.dart';
import '../style.dart';
import '../util.dart';
import '../viewmodel.dart';
import '../widget.dart';

class ImageController extends BaseViewController<ImageRenderViewModel> {
  static const String kClassName = "Image";

  // new 3.0 eventName
  static const String kEventOnLoad = 'load';
  static const String kEventOnLoadStart = 'loadstart';
  static const String kEventOnLoadEnd = 'loadend';
  static const String kEventOnError = 'error';
  static const String kEventOnProgress = 'progress';

  @override
  ImageRenderViewModel createRenderViewModel(RenderNode node, RenderContext context) {
    return ImageRenderViewModel(node.id, node.rootId, node.name, context);
  }

  @override
  Widget createWidget(BuildContext context, ImageRenderViewModel viewModel) {
    return ImageWidget(viewModel);
  }

  @override
  Map<String, ControllerMethodProp> get extendRegisteredMethodProp {
    var extraMap = <String, ControllerMethodProp>{};
    extraMap[NodeProps.kSrc] = ControllerMethodProp(setUrl, '');
    extraMap[NodeProps.kSource] = ControllerMethodProp(setSource, null);
    extraMap[NodeProps.kResizeMode] = ControllerMethodProp(setResizeMode, '');
    extraMap[NodeProps.kOnLoad] = ControllerMethodProp(setOnLoad, false);
    extraMap[NodeProps.kOnLoadStart] = ControllerMethodProp(setOnLoadStart, false);
    extraMap[NodeProps.kOnLoadEnd] = ControllerMethodProp(setOnLoadEnd, false);
    extraMap[NodeProps.kOnError] = ControllerMethodProp(setOnError, false);
    extraMap[NodeProps.kOnProgress] = ControllerMethodProp(setOnProgress, false);
    extraMap[NodeProps.kCapInsets] = ControllerMethodProp(setCapInsets, null);
    extraMap[NodeProps.kDefaultSource] = ControllerMethodProp(setDefaultSource, null);
    extraMap[NodeProps.kTintColor] = ControllerMethodProp(setTintColor, Colors.transparent.value);

    return extraMap;
  }

  // for Android
  @ControllerProps(NodeProps.kSrc)
  void setUrl(ImageRenderViewModel renderViewModel, String src) {
    src = renderViewModel.context.convertRelativePath(renderViewModel.rootId, src);
    if (src != renderViewModel.src) {
      renderViewModel.src = src;
    }
  }

  // for iOS
  @ControllerProps(NodeProps.kSource)
  void setSource(ImageRenderViewModel renderViewModel, VoltronArray source) {
    if (source.size() == 0) return;
    VoltronMap firstObj = source.get(0);
    String src = firstObj.get('uri');
    src = renderViewModel.context.convertRelativePath(renderViewModel.rootId, src);
    if (src != renderViewModel.src) {
      renderViewModel.src = src;
    }
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
  void setDefaultSource(ImageRenderViewModel renderViewModel, String defaultSource) {
    if (defaultSource.startsWith('data:image/')) {
      var bytesImage = const Base64Decoder().convert(defaultSource.split('base64,').last);
      renderViewModel.defaultImage = Image.memory(bytesImage);
    } else {
      LogUtils.w('ImageController', "setDefaultSource error, defaultSource must be base64");
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

  @ControllerProps(NodeProps.kOnProgress)
  void setOnProgress(ImageRenderViewModel renderViewModel, bool enable) {
    setEventType(NodeProps.kOnProgress, renderViewModel, enable);
  }

  @ControllerProps(NodeProps.kCapInsets)
  void setCapInsets(ImageRenderViewModel renderViewModel, VoltronMap capInsetsMap) {
    renderViewModel.capInsets = CapInsets(
      left: capInsetsMap.get('left').toDouble(),
      top: capInsetsMap.get('top').toDouble(),
      right: capInsetsMap.get('right').toDouble(),
      bottom: capInsetsMap.get('bottom').toDouble(),
    );
  }

  @override
  void updateEvents(
    ImageRenderViewModel renderViewModel,
    Set<EventHolder> holders,
  ) {
    super.updateEvents(renderViewModel, holders);
    if (holders.isNotEmpty) {
      for (var holder in holders) {
        switch (holder.eventName) {
          case kEventOnLoad:
            setOnLoad(renderViewModel, holder.isAdd);
            break;
          case kEventOnLoadStart:
            setOnLoadStart(renderViewModel, holder.isAdd);
            break;
          case kEventOnLoadEnd:
            setOnLoadEnd(renderViewModel, holder.isAdd);
            break;
          case kEventOnError:
            setOnError(renderViewModel, holder.isAdd);
            break;
          case kEventOnProgress:
            setOnProgress(renderViewModel, holder.isAdd);
            break;
        }
      }
    }
  }

  void setEventType(String type, ImageRenderViewModel renderViewModel, bool enable) {
    if (enable) {
      renderViewModel.imageEventDispatcher.addEventType(type);
    } else {
      renderViewModel.imageEventDispatcher.removeEventType(type);
    }
  }

  @override
  String get name => kClassName;
}
