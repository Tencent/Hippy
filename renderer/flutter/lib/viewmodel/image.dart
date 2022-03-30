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

import 'package:flutter/material.dart';

import '../common/voltron_map.dart';
import '../render.dart';
import '../style/prop.dart';
import '../util/image_util.dart';
import '../util/log_util.dart';
import '../widget.dart';
import 'view_model.dart';

class ImageRenderViewModel extends RenderViewModel {
  int tintColor = Colors.transparent.value;
  String? curSrc;
  bool needLoadImage = false;
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

  String? get src {
    return curSrc;
  }

  set src(String? str) {
    if (str != null) {
      needLoadImage = true;
      curSrc = str;
    }
  }

  ImageRenderViewModel(
      int id, int instanceId, String className, RenderContext context)
      : super(id, instanceId, className, context) {
    imageEventDispatcher = createImageEventDispatcher();
  }

  ImageEventDispatcher createImageEventDispatcher() {
    return ImageEventDispatcher(id, context);
  }

  @override
  void update() {
    super.update();
    if (needLoadImage) {
      needLoadImage = false;
      loadImage();
    }
  }

  void loadImage() {
    imageEventDispatcher.handleOnLoadStart();
    var src = curSrc;
    if (src == null) {
      imageEventDispatcher.handleOnError();
      imageEventDispatcher.handleOnLoadEnd();
      return;
    } else {
      dispatchedEvent = {};
      var img = getImage(src);
      img
          .resolve(const ImageConfiguration())
          .addListener(ImageStreamListener((image, flag) {
        if (!dispatchedEvent.contains(NodeProps.kOnLoad) && src == curSrc) {
          imageEventDispatcher.handleOnLoad();
          imageEventDispatcher.handleOnLoadEnd();
          imageWidth = image.image.width;
          imageHeight = image.image.height;
          // notifyListeners();
          dispatchedEvent.add(NodeProps.kOnLoad);
          dispatchedEvent.add(NodeProps.kOnLoadEnd);
          LogUtils.d('ImageRenderViewModel',
              "ImageProvider onImage, info: ${image.toString()}");
        }
      }, onChunk: (event) {
        var total = event.expectedTotalBytes;
        var loaded = event.cumulativeBytesLoaded;
        if (loaded > 0 && total is int && total > 0) {
          var params = VoltronMap();
          params.push('loaded', loaded);
          params.push('total', total);
          imageEventDispatcher.handleOnProgress(params);
        }
      }, onError: (exception, stackTrace) {
        if (src == curSrc) {
          imageEventDispatcher.handleOnError();
          imageEventDispatcher.handleOnLoadEnd();
          LogUtils.w('ImageController',
              "ImageProvider onError, src $src exception: ${exception.toString()}");
        }
      }));
      image = img;
    }
  }
}
