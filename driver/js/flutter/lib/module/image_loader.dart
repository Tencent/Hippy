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
import 'package:tencent_voltron_render/engine/js_engine_context.dart';
import 'package:voltron_renderer/common/voltron_map.dart';
import 'package:voltron_renderer/util/image_util.dart';

import 'module.dart';
import 'promise.dart';

class ImageLoaderModule extends VoltronNativeModule {
  static const String kImageLoaderModuleName = "ImageLoaderModule";

  static const String kFuncGetSize = "getSize";
  static const String kFuncPrefetch = "prefetch";

  ImageLoaderModule(EngineContext context) : super(context);

  @VoltronMethod(kFuncGetSize)
  bool getSize(String url, JSPromise promise) {
    var img = getImage(url);
    img.resolve(const ImageConfiguration()).addListener(ImageStreamListener(
          (image, sync) {
            var img = image.image;
            var params = VoltronMap();
            params.push('width', img.width);
            params.push('height', img.height);
            promise.resolve(params);
          },
          onError: (exception, stackTrace) {
            var err = FlutterErrorDetails(
              context: ErrorDescription('image failed to precache'),
              library: 'image resource service',
              exception: exception,
              stack: stackTrace,
              silent: true,
            );
            var params = VoltronMap();
            params.push('code', 10002);
            params.push('msg', err.toString());
            promise.reject(params);
          },
        ));
    return true;
  }

  @VoltronMethod(kFuncPrefetch)
  bool prefetch(String url, JSPromise promise) {
    var img = getImage(url);
    // img.obtainKey(ImageConfiguration());
    // ImageCache().
    img.resolve(const ImageConfiguration()).addListener(ImageStreamListener(
          (image, sync) {
            var img = image.image;
            var params = VoltronMap();
            params.push('width', img.width);
            params.push('height', img.width);
            promise.resolve(params);
          },
          onError: (exception, stackTrace) {
            var err = FlutterErrorDetails(
              context: ErrorDescription('image failed to precache'),
              library: 'image resource service',
              exception: exception,
              stack: stackTrace,
              silent: true,
            );
            var params = VoltronMap();
            params.push('code', 10002);
            params.push('msg', err.toString());
            promise.reject(params);
          },
        ));
    return true;
  }

  @override
  Map<String, Function> get extraFuncMap =>
      {kFuncGetSize: getSize, kFuncPrefetch: prefetch};

  @override
  String get moduleName => kImageLoaderModuleName;
}
