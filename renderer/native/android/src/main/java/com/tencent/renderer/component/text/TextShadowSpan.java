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
package com.tencent.renderer.component.text;

import android.text.TextPaint;
import android.text.style.CharacterStyle;

public class TextShadowSpan extends CharacterStyle implements TextLineMetricsHelper.LineMetrics {

    private final float mDx;
    private final float mDy;
    private final float mRadius;
    private final int mColor;
    private TextLineMetricsHelper mHelper;

    public TextShadowSpan(float dx, float dy, float radius, int color) {
        mDx = dx;
        mDy = dy;
        mRadius = radius;
        mColor = color;
    }

    @Override
    public void updateDrawState(TextPaint textPaint) {
        textPaint.setShadowLayer(mRadius, mDx, mDy, mColor);
        if (mHelper != null) {
            mHelper.markShadow(mRadius, mDx, mDy, mColor);
        }
    }

    @Override
    public void setLineMetrics(TextLineMetricsHelper helper) {
        mHelper = helper;
    }
}
