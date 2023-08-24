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

import android.graphics.Paint.FontMetricsInt;
import android.text.TextPaint;
import android.text.style.CharacterStyle;
import com.tencent.renderer.node.TextVirtualNode;

public class TextVerticalAlignSpan extends CharacterStyle {

    private final FontMetricsInt mReusableFontMetricsInt = new FontMetricsInt();
    private final String mVerticalAlign;
    private int mLineTop;
    private int mLineBottom;

    public TextVerticalAlignSpan(String verticalAlign) {
        this.mVerticalAlign = verticalAlign;
    }

    public void setLineMetrics(int top, int bottom) {
        mLineTop = top;
        mLineBottom = bottom;
    }

    @Override
    public void updateDrawState(TextPaint tp) {
        if (mLineTop != 0 || mLineBottom != 0) {
            final FontMetricsInt fmi = mReusableFontMetricsInt;
            switch (mVerticalAlign) {
                case TextVirtualNode.V_ALIGN_TOP:
                    tp.getFontMetricsInt(fmi);
                    tp.baselineShift = mLineTop - fmi.top;
                    break;
                case TextVirtualNode.V_ALIGN_MIDDLE:
                    tp.getFontMetricsInt(fmi);
                    tp.baselineShift = (mLineTop + mLineBottom - fmi.top - fmi.bottom) / 2;
                    break;
                case TextVirtualNode.V_ALIGN_BOTTOM:
                    tp.getFontMetricsInt(fmi);
                    tp.baselineShift = mLineBottom - fmi.bottom;
                    break;
                case TextVirtualNode.V_ALIGN_BASELINE:
                default:
                    break;
            }
        }
    }
}
