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

package com.tencent.renderer.component.drawable;

import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffXfermode;
import android.graphics.Rect;
import android.graphics.RectF;

public class ShadowPaint extends Paint {
    private float mShadowOffsetX;
    private float mShadowOffsetY;
    private float mShadowRadius;
    private float mShadowOpacity = 0.4f;
    private int mShadowColor = Color.GRAY;

    public float getShadowOffsetX() {
        return mShadowOffsetX;
    }

    public float getShadowOffsetY() {
        return mShadowOffsetY;
    }

    public float getShadowRadius() {
        return mShadowRadius;
    }

    public void setShadowOffsetX(float offsetX) {
        mShadowOffsetX = offsetX;
    }

    public void setShadowOffsetY(float offsetY) {
        mShadowOffsetY = offsetY;
    }

    public void setShadowRadius(float radius) {
        mShadowRadius = radius;
    }

    public void setShadowOpacity(float opacity) {
        mShadowOpacity = opacity;
    }

    public void setShadowColor(int color) {
        mShadowColor = color;
    }

    protected RectF initialize(Rect bounds) {
        if (mShadowRadius == 0 || mShadowOpacity <= 0) {
            return null;
        }
        int opacity = (mShadowOpacity >= 1) ? 255 : Math.round(255 * mShadowOpacity);
        setColor(Color.TRANSPARENT);
        setAntiAlias(true);
        setAlpha(opacity);
        setShadowLayer(mShadowRadius, mShadowOffsetX, mShadowOffsetY, mShadowColor);
        return new RectF(bounds.left + mShadowRadius - mShadowOffsetX,
                bounds.top + mShadowRadius - mShadowOffsetY, bounds.right - mShadowRadius - mShadowOffsetX,
                bounds.bottom - mShadowRadius - mShadowOffsetY);
    }
}
