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
import android.text.style.MetricAffectingSpan;

public class TextStyleSpan extends MetricAffectingSpan {

    private final boolean mItalic;
    private final String mFontWeight;
    private final String mFontFamily;
    private final FontAdapter mFontAdapter;

    public TextStyleSpan(boolean italic, String fontWeight, String fontFamily,
            FontAdapter adapter) {
        mItalic = italic;
        mFontWeight = fontWeight;
        mFontFamily = fontFamily;
        mFontAdapter = adapter;
    }

    @Override
    public void updateDrawState(TextPaint textPaint) {
        TypeFaceUtil.apply(textPaint, mItalic, mFontWeight, mFontFamily, mFontAdapter);
    }

    @Override
    public void updateMeasureState(TextPaint textPaint) {
        TypeFaceUtil.apply(textPaint, mItalic, mFontWeight, mFontFamily, mFontAdapter);
    }
}
