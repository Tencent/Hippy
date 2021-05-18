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
package com.tencent.mtt.hippy.views.common;

import com.tencent.mtt.hippy.dom.flex.FlexConstants;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.supportui.views.asyncimage.BackgroundDrawable;

/**
 * Created by leonardgong on 2017/11/30 0030.
 */

public class CommonBackgroundDrawable extends BackgroundDrawable {

  public void setBorderRadius(float radius, int position) {
    if (!FlexConstants.isUndefined(radius)) {
      radius = PixelUtil.dp2px(radius);
      super.setBorderRadius(radius, position);
    }
  }

  public void setBorderWidth(float width, int position) {
    if (!FlexConstants.isUndefined(width)) {
      width = PixelUtil.dp2px(width);
      super.setBorderWidth(width, position);
    }
  }

  public void setShadowOffsetX(float x) {
    if (!FlexConstants.isUndefined(x)) {
      x = PixelUtil.dp2px(x);
      super.setShadowOffsetX(x);
    }
  }

  public void setShadowOffsetY(float y) {
    if (!FlexConstants.isUndefined(y)) {
      y = PixelUtil.dp2px(y);
      super.setShadowOffsetY(y);
    }
  }

  public void setShadowRadius(float radius) {
    if (!FlexConstants.isUndefined(radius)) {
      radius = PixelUtil.dp2px(radius);
      super.setShadowRadius(radius);
    }
  }
}
