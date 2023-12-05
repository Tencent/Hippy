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

import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.text.TextPaint;
import android.text.style.CharacterStyle;
import android.text.style.ReplacementSpan;
import android.text.style.UpdateAppearance;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public class TextDecorationSpan extends CharacterStyle implements UpdateAppearance, TextLineMetricsHelper.LineMetrics {

    public static final int STYLE_SOLID = 0;
    public static final int STYLE_DOUBLE = 1;
    public static final int STYLE_DOTTED = 2;
    public static final int STYLE_DASHED = 3;
    // according to kStdUnderline_Thickness defined in aosp's Paint.h
    private static final float THICKNESS = (1.0f / 18.0f);

    private final boolean underline;
    private final boolean lineThrough;
    private final int color;
    private final int style;
    private final boolean needSpecialDraw;
    
    private TextLineMetricsHelper helper;

    public TextDecorationSpan(boolean underline, boolean lineThrough, int color, int style) {
        assert underline || lineThrough;
        this.underline = underline;
        this.lineThrough = lineThrough;
        this.color = color;
        this.style = style;
        needSpecialDraw = style != STYLE_SOLID || (lineThrough && color != Color.TRANSPARENT);
    }

    public boolean needSpecialDraw() {
        return needSpecialDraw;
    }

    @Override
    public void updateDrawState(TextPaint tp) {
        if (!underline && !lineThrough) {
            // should never happened
            return;
        }
        if (needSpecialDraw && helper != null) {
            int color = this.color == Color.TRANSPARENT ? tp.getColor() : this.color;
            helper.markTextDecoration(underline, lineThrough, color, style, tp.getTextSize());
            return;
        }
        if (underline) {
            if (color == Color.TRANSPARENT || !trySetUnderlineColor(tp, color, tp.getTextSize() * THICKNESS)) {
                tp.setUnderlineText(true);
            }
        }
        if (lineThrough) {
            tp.setStrikeThruText(true);
        }
    }

    private static boolean trySetUnderlineColor(TextPaint tp, int color, float thickness) {
        try {
            // Since these were @hide fields made public, we can link directly against it with
            // a try/catch for its absence instead of doing the same through reflection.
            // noinspection NewApi
            tp.underlineColor = color;
            // noinspection NewApi
            tp.underlineThickness = thickness;
            return true;
        } catch (NoSuchFieldError e) {
            return false;
        }
    }

    @Override
    public void setLineMetrics(TextLineMetricsHelper helper) {
        if (needSpecialDraw) {
            this.helper = helper;
        }
    }

    public static final class StartMark extends ReplacementSpan implements TextLineMetricsHelper.LineMetrics {

        private TextLineMetricsHelper helper;

        @Override
        public int getSize(@NonNull Paint paint, CharSequence text, int start, int end,
                @Nullable Paint.FontMetricsInt fm) {
            return 0;
        }

        @Override
        public void draw(@NonNull Canvas canvas, CharSequence text, int start, int end, float x, int top, int y,
                int bottom, @NonNull Paint paint) {
            if (helper != null) {
                helper.markTextDecorationStart(this, start, x, y);
            }
        }

        @Override
        public void setLineMetrics(TextLineMetricsHelper helper) {
            this.helper = helper;
        }
    }

    public static final class EndMark extends ReplacementSpan implements TextLineMetricsHelper.LineMetrics {

        private TextLineMetricsHelper helper;

        @Override
        public int getSize(@NonNull Paint paint, CharSequence text, int start, int end,
                @Nullable Paint.FontMetricsInt fm) {
            return 0;
        }

        @Override
        public void draw(@NonNull Canvas canvas, CharSequence text, int start, int end, float x, int top, int y,
                int bottom, @NonNull Paint paint) {
            if (helper != null) {
                helper.markTextDecorationEnd(x);
            }
        }

        @Override
        public void setLineMetrics(TextLineMetricsHelper helper) {
            this.helper = helper;
        }
    }
}
