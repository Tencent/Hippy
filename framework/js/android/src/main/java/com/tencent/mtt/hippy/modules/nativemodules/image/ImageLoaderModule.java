/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.tencent.mtt.hippy.modules.nativemodules.image;

import com.tencent.link_supplier.proxy.framework.ImageDataSupplier;
import com.tencent.link_supplier.proxy.framework.ImageLoaderAdapter;
import com.tencent.link_supplier.proxy.framework.ImageRequestListener;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.annotation.HippyMethod;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;

import java.util.HashMap;
import java.util.Map;

@SuppressWarnings({"deprecation", "unused"})
@HippyNativeModule(name = "ImageLoaderModule")
public class ImageLoaderModule extends HippyNativeModuleBase {

  final ImageLoaderAdapter mImageAdapter;

  public ImageLoaderModule(HippyEngineContext context) {
    super(context);
    mImageAdapter = context.getGlobalConfigs().getImageLoaderAdapter();
  }

  @HippyMethod(name = "getSize")
  public void getSize(final String url, final Promise promise) {
    mImageAdapter.fetchImage(url, new ImageRequestListener() {
      @Override
      public void onRequestStart(ImageDataSupplier supplier) {
      }

      @Override
      public void onRequestSuccess(ImageDataSupplier supplier) {
        if (supplier != null) {
          HippyMap resultMap = new HippyMap();
          resultMap.pushInt("width", supplier.getImageWidth());
          resultMap.pushInt("height", supplier.getImageWidth());
          promise.resolve(resultMap);
        } else {
          promise.reject("Fetch image failed, source=" + url);
        }
      }

      @Override
      public void onRequestFail(Throwable throwable, String source) {
        promise.reject("Fetch image failed, source=" + source);
      }
    }, null);
  }

  @HippyMethod(name = "prefetch")
  public void prefetch(String url) {
    mImageAdapter.fetchImage(url, new ImageRequestListener() {
      @Override
      public void onRequestStart(ImageDataSupplier supplier) {
      }

      @Override
      public void onRequestSuccess(ImageDataSupplier supplier) {
      }

      @Override
      public void onRequestFail(Throwable throwable, String source) {
      }
    }, null);
  }
}
