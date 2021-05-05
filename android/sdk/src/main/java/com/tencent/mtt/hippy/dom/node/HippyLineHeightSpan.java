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

import android.graphics.Paint;
import android.text.style.LineHeightSpan;

@SuppressWarnings({"unused"})
public class HippyLineHeightSpan implements LineHeightSpan {

    private final int mHeight;
    public HippyLineHeightSpan(float lineHeight){
        this.mHeight= (int) Math.ceil(lineHeight);
    }
    @Override
    public void chooseHeight(CharSequence text, int start, int end, int spanstartv, int v, Paint.FontMetricsInt fm) {
        if (fm.descent > mHeight) {
            fm.bottom = fm.descent = Math.min(mHeight, fm.descent);
            fm.top = fm.ascent = 0;
        } else if (-fm.ascent + fm.descent > mHeight) {
            fm.bottom = fm.descent;
            fm.top = fm.ascent = -mHeight + fm.descent;
        } else if (-fm.ascent + fm.bottom > mHeight) {
            fm.top = fm.ascent;
            fm.bottom = fm.ascent + mHeight;
        } else if (-fm.top + fm.bottom > mHeight) {
            fm.top = fm.bottom - mHeight;
        } else {
            final int additional = mHeight - (-fm.top + fm.bottom);
            fm.top -= Math.ceil(additional / 2.0f);
            fm.bottom += Math.floor(additional / 2.0f);
            fm.ascent = fm.top;
            fm.descent = fm.bottom;
        }
    }
}
