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
package com.tencent.mtt.hippy.dom.node;


import android.graphics.Color;
import android.text.style.ImageSpan;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.views.image.HippyImageView.ImageEvent;
import java.util.ArrayList;

@SuppressWarnings({"unused"})
public class ImageNode extends StyleNode {

  @Deprecated
  public static final String PROP_VERTICAL_ALIGNMENT = "verticalAlignment";

  private final boolean mIsVirtual;
  private HippyImageSpan mImageSpan = null;
  @Deprecated
  private int mVerticalAlignment = ImageSpan.ALIGN_BASELINE;
  private String mVerticalAlign;
  private int mTintColor = Color.TRANSPARENT;
  private int mBackgroundColor = Color.TRANSPARENT;
  private final boolean[] shouldSendImageEvent;

  private ArrayList<String> mGestureTypes = null;

  public ImageNode(boolean mIsVirtual) {
    this.mIsVirtual = mIsVirtual;
    shouldSendImageEvent = new boolean[ImageEvent.values().length];
  }

  public void setImageSpan(HippyImageSpan imageSpan) {
    mImageSpan = imageSpan;
  }

  public boolean isEnableImageEvent(ImageEvent event) {
    return shouldSendImageEvent[event.ordinal()];
  }

  /**
   * @deprecated use {@link #getVerticalAlign} instead
   */
  @Deprecated
  public int getVerticalAlignment() {
    return mVerticalAlignment;
  }

  public String getVerticalAlign() {
      if (mVerticalAlign != null) {
          return mVerticalAlign;
      }
      DomNode parent = getParent();
      if (parent instanceof TextNode) {
          return ((TextNode) parent).getVerticalAlign();
      }
      return null;
  }

  public boolean isVirtual() {
    return mIsVirtual;
  }

  public ArrayList<String> getGestureTypes() {
    return mGestureTypes;
  }

  @HippyControllerProps(name = NodeProps.ON_CLICK, defaultType = HippyControllerProps.BOOLEAN)
  public void clickEnable(boolean flag) {
    if (flag) {
      if (mGestureTypes == null) {
        mGestureTypes = new ArrayList<>();
      }
      mGestureTypes.add(NodeProps.ON_CLICK);
    }
  }

  @HippyControllerProps(name = NodeProps.ON_LONG_CLICK, defaultType = HippyControllerProps.BOOLEAN)
  public void longClickEnable(boolean flag) {
    if (flag) {
      if (mGestureTypes == null) {
        mGestureTypes = new ArrayList<>();
      }
      mGestureTypes.add(NodeProps.ON_LONG_CLICK);
    }
  }

  @HippyControllerProps(name = NodeProps.ON_PRESS_IN, defaultType = HippyControllerProps.BOOLEAN)
  public void pressInEnable(boolean flag) {
    if (flag) {
      if (mGestureTypes == null) {
        mGestureTypes = new ArrayList<>();
      }
      mGestureTypes.add(NodeProps.ON_PRESS_IN);
    }
  }

  @HippyControllerProps(name = NodeProps.ON_PRESS_OUT)
  public void pressOutEnable(boolean flag) {
    if (flag) {
      if (mGestureTypes == null) {
        mGestureTypes = new ArrayList<>();
      }
      mGestureTypes.add(NodeProps.ON_PRESS_OUT);
    }
  }

  @HippyControllerProps(name = NodeProps.ON_TOUCH_DOWN, defaultType = HippyControllerProps.BOOLEAN)
  public void touchDownEnable(boolean flag) {
    if (flag) {
      if (mGestureTypes == null) {
        mGestureTypes = new ArrayList<>();
      }
      mGestureTypes.add(NodeProps.ON_TOUCH_DOWN);
    }
  }

  @HippyControllerProps(name = NodeProps.ON_TOUCH_MOVE, defaultType = HippyControllerProps.BOOLEAN)
  public void touchUpEnable(boolean flag) {
    if (flag) {
      if (mGestureTypes == null) {
        mGestureTypes = new ArrayList<>();
      }
      mGestureTypes.add(NodeProps.ON_TOUCH_MOVE);
    }
  }

  @HippyControllerProps(name = NodeProps.ON_TOUCH_END, defaultType = HippyControllerProps.BOOLEAN)
  public void touchEndEnable(boolean flag) {
    if (flag) {
      if (mGestureTypes == null) {
        mGestureTypes = new ArrayList<>();
      }
      mGestureTypes.add(NodeProps.ON_TOUCH_END);
    }
  }

  @HippyControllerProps(name = NodeProps.ON_TOUCH_CANCEL, defaultType = HippyControllerProps.BOOLEAN)
  public void touchCancelable(boolean flag) {
    if (flag) {
      if (mGestureTypes == null) {
        mGestureTypes = new ArrayList<>();
      }
      mGestureTypes.add(NodeProps.ON_TOUCH_CANCEL);
    }
  }

  /**
   * @deprecated use {@link #setVerticalAlign} instead
   */
  @Deprecated
  @HippyControllerProps(name = PROP_VERTICAL_ALIGNMENT, defaultType = HippyControllerProps.NUMBER, defaultNumber = ImageSpan.ALIGN_BASELINE)
  public void setVerticalAlignment(int verticalAlignment) {
    mVerticalAlignment = verticalAlignment;
  }

  @HippyControllerProps(name = TextNode.PROP_VERTICAL_ALIGN, defaultType = HippyControllerProps.STRING)
  public void setVerticalAlign(String align) {
      switch (align) {
          case TextNode.V_ALIGN_TOP:
          case TextNode.V_ALIGN_MIDDLE:
          case TextNode.V_ALIGN_BASELINE:
          case TextNode.V_ALIGN_BOTTOM:
              mVerticalAlign = align;
              break;
          default:
              mVerticalAlign = TextNode.V_ALIGN_BASELINE;
              break;
      }
  }

  @HippyControllerProps(name = "src", defaultType = HippyControllerProps.STRING)
  public void setUrl(String url) {
    if (mImageSpan != null) {
      mImageSpan.setUrl(url);
    }
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = "onLoad", defaultType = HippyControllerProps.BOOLEAN)
  public void setOnLoadEnd(boolean enable) {
    shouldSendImageEvent[ImageEvent.ONLOAD.ordinal()] = enable;
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = "onError", defaultType = HippyControllerProps.BOOLEAN)
  public void setOnError(boolean enable) {
    shouldSendImageEvent[ImageEvent.ONERROR.ordinal()] = enable;
  }

  @HippyControllerProps(name = "tintColor", defaultType = HippyControllerProps.NUMBER)
  public void setTintColor(int tintColor) {
      mTintColor = tintColor;
      if (mImageSpan != null) {
          mImageSpan.setTintColor(tintColor);
      }
  }

  public boolean hasTintColor() {
      return mTintColor != Color.TRANSPARENT;
  }

  public int getTintColor() {
      return mTintColor;
  }

  @HippyControllerProps(name = NodeProps.BACKGROUND_COLOR, defaultType = HippyControllerProps.NUMBER)
  public void setBackgroundColor(int color) {
      mBackgroundColor = color;
      if (mImageSpan != null) {
          mImageSpan.setBackgroundColor(color);
      }
  }

  public boolean hasBackgroundColor() {
      return mBackgroundColor != Color.TRANSPARENT;
  }

  public int getBackgroundColor() {
      return mBackgroundColor;
  }
}
