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
package com.tencent.mtt.supportui.views.asyncimage;

import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.drawable.Drawable;

public abstract class BaseDrawable extends Drawable
{
  protected float mShadowOffsetX;
  protected float mShadowOffsetY;
  protected float mShadowRadius;
  protected RectF mRect = new RectF();
  
  public void updateContentRegion() {
    Rect rectT = getBounds();
    
    float topT = rectT.top + mShadowRadius;
    float leftT = rectT.left + mShadowRadius;
    float rightT = rectT.right - mShadowRadius;
    float bottomT = rectT.bottom - mShadowRadius;
    
    if (mShadowOffsetX > 0) {
      if (mShadowRadius >= mShadowOffsetX) {
        leftT -= mShadowOffsetX;
        rightT -= mShadowOffsetX;
      } else {
        leftT -= mShadowRadius;
      }
    } else {
      float offsetXAbs = Math.abs(mShadowOffsetX);
      if (mShadowRadius >= offsetXAbs) {
        leftT += offsetXAbs;
        rightT += offsetXAbs;
      } else {
        rightT += mShadowRadius;
      }
    }
    
    if (mShadowOffsetY > 0) {
      if (mShadowRadius >= mShadowOffsetY) {
        topT -= mShadowOffsetY;
        bottomT -= mShadowOffsetY;
      } else {
        topT -= mShadowRadius;
      }
    } else {
      float offsetYAbs = Math.abs(mShadowOffsetY);
      if (mShadowRadius >= offsetYAbs) {
        topT += mShadowOffsetY;
        bottomT += mShadowOffsetY;
      } else {
        bottomT += mShadowRadius;
      }
    }
    
    mRect.set(new RectF(leftT, topT, rightT, bottomT));
  }
  
  public void setShadowOffsetX(float x) {
    mShadowOffsetX = x;
    invalidateSelf();
  }
  
  public void setShadowOffsetY(float y) {
    mShadowOffsetY = y;
    invalidateSelf();
  }
  
  public void setShadowRadius(float radius) {
    mShadowRadius = radius;
    invalidateSelf();
  }
}
