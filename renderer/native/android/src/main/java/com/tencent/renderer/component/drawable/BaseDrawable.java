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

import android.graphics.ColorFilter;
import android.graphics.PixelFormat;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.drawable.Drawable;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public abstract class BaseDrawable extends Drawable {

    protected boolean mUpdatePathRequired = false;
    @Nullable
    protected ShadowPaint mShadowPaint;
    protected RectF mRect = new RectF();

    @Override
    public void setBounds(int left, int top, int right, int bottom) {
        super.setBounds(left, top, right, bottom);
    }

    @Override
    protected void onBoundsChange(Rect bounds) {
        super.onBoundsChange(bounds);
        updateContentRegion();
        mUpdatePathRequired = true;
    }

    @NonNull
    protected ShadowPaint ensureShadowPaint() {
        if (mShadowPaint == null) {
            mShadowPaint = new ShadowPaint();
        }
        return mShadowPaint;
    }

    @Override
    public int getOpacity() {
        return PixelFormat.UNKNOWN;
    }

    @Override
    public void setAlpha(int alpha) {

    }

    @Override
    public void setColorFilter(ColorFilter colorFilter) {

    }

    public void updateContentRegion() {
        if (mShadowPaint == null){
            mRect.set(getBounds());
            return;
        }
        Rect rectT = getBounds();
        float radius = mShadowPaint.getShadowRadius();
        float offsetX = mShadowPaint.getShadowOffsetX();
        float offsetY = mShadowPaint.getShadowOffsetY();
        float topT = rectT.top + radius;
        float leftT = rectT.left + radius;
        float rightT = rectT.right - radius;
        float bottomT = rectT.bottom - radius;
        if (offsetX > 0) {
            if (radius >= offsetX) {
                leftT -= offsetX;
                rightT -= offsetX;
            } else {
                leftT -= radius;
            }
        } else {
            float offsetXAbs = Math.abs(offsetX);
            if (radius >= offsetXAbs) {
                leftT += offsetXAbs;
                rightT += offsetXAbs;
            } else {
                rightT += radius;
            }
        }
        if (offsetY > 0) {
            if (radius >= offsetY) {
                topT -= offsetY;
                bottomT -= offsetY;
            } else {
                topT -= radius;
            }
        } else {
            float offsetYAbs = Math.abs(offsetY);
            if (radius >= offsetYAbs) {
                topT += offsetY;
                bottomT += offsetY;
            } else {
                bottomT += radius;
            }
        }
        mRect.set(new RectF(leftT, topT, rightT, bottomT));
    }
}
