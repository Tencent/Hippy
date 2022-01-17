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
package com.tencent.mtt.hippy.views.image;

import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.ImageNode;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.dom.node.StyleNode;
import com.tencent.mtt.hippy.uimanager.HippyViewController;

import android.content.Context;
import android.graphics.Color;
import android.view.View;

import com.tencent.renderer.NativeRenderContext;

@SuppressWarnings({"deprecation", "unused"})
@HippyController(name = HippyImageViewController.CLASS_NAME)
public class HippyImageViewController extends HippyViewController<HippyImageView> {

  public static final String CLASS_NAME = "Image";

  @Override
  protected StyleNode createNode(boolean virtual) {
    return new ImageNode(virtual);
  }

  @Override
  protected View createViewImpl(Context context, HippyMap iniProps) {
    HippyImageView imageView = new HippyImageView(context);
    if (iniProps != null) {
      imageView.setInitProps(iniProps);
    }

    return imageView;
  }

  @SuppressWarnings("unused")
  @Override
  protected View createViewImpl(Context context) {
    return new HippyImageView(context);
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = NodeProps.CUSTOM_PROP_IMAGE_TYPE, defaultType = HippyControllerProps.STRING)
  public void setImageType(HippyImageView hippyImageView, String type) {
    hippyImageView.setImageType(type);
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = "src", defaultType = HippyControllerProps.STRING)
  public void setUrl(HippyImageView hippyImageView, String url) {
    hippyImageView.setUrl(getInnerPath((NativeRenderContext)hippyImageView.getContext(), url));
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = "tintColor", defaultType = HippyControllerProps.NUMBER, defaultNumber = Color.TRANSPARENT)
  public void setTintColor(HippyImageView hippyImageView, int tintColor) {
    hippyImageView.setTintColor(tintColor);
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = NodeProps.RESIZE_MODE, defaultType = HippyControllerProps.STRING, defaultString = "fitXY")
  public void setResizeMode(HippyImageView hippyImageView, String resizeModeValue) {
    if ("contain".equals(resizeModeValue)) {
      // 在保持图片宽高比的前提下缩放图片，直到宽度和高度都小于等于容器视图的尺寸
      // 这样图片完全被包裹在容器中，容器中可能留有空白
      hippyImageView.setScaleType(HippyImageView.ScaleType.CENTER_INSIDE);
    } else if ("cover".equals(resizeModeValue)) {
      // 在保持图片宽高比的前提下缩放图片，直到宽度和高度都大于等于容器视图的尺寸
      // 这样图片完全覆盖甚至超出容器，容器中不留任何空白
      hippyImageView.setScaleType(HippyImageView.ScaleType.CENTER_CROP);
    } else if ("center".equals(resizeModeValue)) {
      // 居中不拉伸
      hippyImageView.setScaleType(HippyImageView.ScaleType.CENTER);
    } else if ("origin".equals(resizeModeValue)) {
      // 不拉伸，居左上
      hippyImageView.setScaleType(HippyImageView.ScaleType.ORIGIN);
    } else if ("repeat".equals(resizeModeValue)) {
      hippyImageView.setScaleType(HippyImageView.ScaleType.REPEAT);
    } else {
      // stretch and other mode
      // 拉伸图片且不维持宽高比，直到宽高都刚好填满容器
      hippyImageView.setScaleType(HippyImageView.ScaleType.FIT_XY);
    }
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = NodeProps.BACKGROUND_COLOR, defaultType = HippyControllerProps.NUMBER, defaultNumber = Color.TRANSPARENT)
  public void setBackgroundColor(HippyImageView view, int backgroundColor) {
    view.setBackgroundColor(backgroundColor);
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = "defaultSource", defaultType = HippyControllerProps.STRING)
  public void setDefaultSource(HippyImageView hippyImageView, String defaultSource) {
    hippyImageView.setHippyViewDefaultSource(
        getInnerPath((NativeRenderContext)hippyImageView.getContext(), defaultSource));
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = "capInsets", defaultType = HippyControllerProps.MAP)
  public void setCapInsets(HippyImageView hippyImageView, HippyMap capInsetsMap) {
    if (capInsetsMap == null) {
      hippyImageView.setNinePatchCoordinate(true, 0, 0, 0, 0);
    } else {
      int topCoordinate = capInsetsMap.getInt("top");
      int leftCoordinate = capInsetsMap.getInt("left");
      int bottomCoordinate = capInsetsMap.getInt("bottom");
      int rightCoordinate = capInsetsMap.getInt("right");
      hippyImageView.setNinePatchCoordinate(false, leftCoordinate, topCoordinate, rightCoordinate,
          bottomCoordinate);
    }
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = "onLoad", defaultType = HippyControllerProps.BOOLEAN)
  public void setOnLoad(HippyImageView hippyImageView, boolean enable) {
    hippyImageView.setImageEventEnable(HippyImageView.ImageEvent.ONLOAD.ordinal(), enable);
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = "onLoadEnd", defaultType = HippyControllerProps.BOOLEAN)
  public void setOnLoadEnd(HippyImageView hippyImageView, boolean enable) {
    hippyImageView.setImageEventEnable(HippyImageView.ImageEvent.ONLOAD_END.ordinal(), enable);
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = "onLoadStart", defaultType = HippyControllerProps.BOOLEAN)
  public void setOnLoadStart(HippyImageView hippyImageView, boolean enable) {
    hippyImageView.setImageEventEnable(HippyImageView.ImageEvent.ONLOAD_START.ordinal(), enable);
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = "onError", defaultType = HippyControllerProps.BOOLEAN)
  public void setOnError(HippyImageView hippyImageView, boolean enable) {
    hippyImageView.setImageEventEnable(HippyImageView.ImageEvent.ONERROR.ordinal(), enable);
  }
}
