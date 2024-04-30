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

import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Paint.FontMetricsInt;
import android.graphics.Rect;
import android.graphics.drawable.Drawable;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

@Deprecated
interface LegacyIAlignConfig {

    int ALIGN_BOTTOM = 0;
    int ALIGN_BASELINE = 1;
    int ALIGN_CENTER = 2;
    int ALIGN_TOP = 3;

    static LegacyIAlignConfig fromVerticalAlignment(int verticalAlignment) {
        switch (verticalAlignment) {
            case ALIGN_BASELINE:
                return new AlignBaselineConfig();
            case ALIGN_CENTER:
                return new AlignCenterConfig();
            case ALIGN_TOP:
                return new AlignTopConfig();
            case ALIGN_BOTTOM:
            default:
                return new AlignBottomConfig();
        }
    }

    void setDesiredSize(int desiredDrawableWidth, int desiredDrawableHeight);

    void setActiveSizeWithRate(float heightRate);

    void setMargin(int marginLeft, int marginRight);

    int getSize(@NonNull Paint paint,
        CharSequence text, int start, int end,
        @Nullable FontMetricsInt fm,
        Drawable drawable);

    void draw(@NonNull Canvas canvas,
        CharSequence text, int start, int end,
        float baseLineX, int lineTop, int baselineY, int lintBottom,
        @NonNull Paint paint,
        Drawable drawable, @Nullable Paint backgroundPaint);

    abstract class BaseAlignConfig implements LegacyIAlignConfig {

        private final int[] size = new int[2];
        private int desiredDrawableWidth;
        private int desiredDrawableHeight;
        private float heightRate;
        private int marginLeft;
        private int marginRight;

        private static int adjustTransY(
            int transY,
            int lineTop,
            int lineBottom,
            int drawableHeight
        ) {
            if (drawableHeight + transY > lineBottom) {
                transY = lineBottom - drawableHeight;
            }
            if (transY < lineTop) {
                transY = lineTop;
            }
            return transY;
        }

        @Override
        public void setDesiredSize(int desiredDrawableWidth, int desiredDrawableHeight) {
            this.desiredDrawableWidth = desiredDrawableWidth;
            this.desiredDrawableHeight = desiredDrawableHeight;

            heightRate = 0;
        }

        @Override
        public void setActiveSizeWithRate(float heightRate) {
            this.heightRate = heightRate;

            desiredDrawableWidth = 0;
            desiredDrawableHeight = 0;
        }

        @Override
        public void setMargin(int marginLeft, int marginRight) {
            this.marginLeft = marginLeft;
            this.marginRight = marginRight;
        }

        private void calDrawableSize(Rect drawableBounds, Paint paint) {
            int dWidth;
            int dHeight;
            if (heightRate > 0) {
                int textSize = (int) paint.getTextSize();
                dHeight = (int) (textSize * heightRate);
                dWidth = drawableBounds.right * dHeight / drawableBounds.bottom;
            } else {
                dHeight = desiredDrawableHeight;
                dWidth = desiredDrawableWidth;
            }

            if (dWidth <= 0 || dHeight <= 0) {
                dWidth = drawableBounds.right;
                dHeight = drawableBounds.bottom;
            }

            size[0] = dWidth;
            size[1] = dHeight;
        }

        @Override
        public int getSize(@NonNull Paint paint,
            CharSequence text, int start, int end,
            @Nullable FontMetricsInt fm,
            Drawable drawable) {

            calDrawableSize(drawable.getBounds(), paint);
            int dWidth = size[0];
            int dHeight = size[1];

            int deltaTop = 0;
            int deltaBottom = 0;
            if (fm != null) {
                deltaTop = fm.top - fm.ascent;
                deltaBottom = fm.bottom - fm.descent;
            }

            int size = getCustomSize(paint,
                text, start, end,
                fm, dWidth, dHeight);
            if (fm != null) {
                fm.top = fm.ascent + deltaTop;
                fm.bottom = fm.descent + deltaBottom;
            }
            return marginLeft + size + marginRight;
        }

        @Override
        public void draw(@NonNull Canvas canvas,
            CharSequence text, int start, int end,
            float baseLineX, int lineTop, int baselineY, int lineBottom,
            @NonNull Paint paint,
            Drawable drawable, @Nullable Paint backgroundPaint) {
            Rect drawableBounds = drawable.getBounds();

            int dWidth = size[0];
            int dHeight = size[1];

            FontMetricsInt fontMetricsInt = paint.getFontMetricsInt();

            int transY = getTransY(canvas,
                text, start, end,
                baseLineX, lineTop, baselineY, lineBottom,
                paint, fontMetricsInt,
                dWidth, dHeight);
            transY = adjustTransY(transY, lineTop, lineBottom, dHeight);

            float scaleX = (float) dWidth / drawableBounds.right;
            float scaleY = (float) dHeight / drawableBounds.bottom;

            canvas.save();
            canvas.translate(baseLineX + marginLeft, transY);
            canvas.scale(scaleX, scaleY);
            if (backgroundPaint != null) {
                canvas.drawRect(0, 0, dWidth, dHeight, backgroundPaint);
            }
            drawable.draw(canvas);
            canvas.restore();
        }

        abstract int getCustomSize(@NonNull Paint paint,
            CharSequence text, int start, int end,
            @Nullable FontMetricsInt fm,
            int drawableWidth, int drawableHeight);

        abstract int getTransY(@NonNull Canvas canvas,
            CharSequence text, int start, int end,
            float baseLineX, int lineTop, int baselineY, int lineBottom,
            @NonNull Paint paint, FontMetricsInt fontMetricsInt,
            int drawableWidth, int drawableHeight);
    }

    class AlignBaselineConfig extends BaseAlignConfig {

        @Override
        public int getCustomSize(@NonNull Paint paint,
            CharSequence text, int start, int end,
            @Nullable FontMetricsInt fm,
            int drawableWidth, int drawableHeight) {
            if (fm != null) {
                fm.ascent = -drawableHeight;
            }
            return drawableWidth;
        }

        @Override
        public int getTransY(@NonNull Canvas canvas,
            CharSequence text, int start, int end,
            float baseLineX, int lineTop, int baselineY, int lineBottom,
            @NonNull Paint paint, FontMetricsInt fontMetricsInt,
            int drawableWidth, int drawableHeight) {
            return baselineY - drawableHeight;
        }
    }

    class AlignBottomConfig extends AlignBaselineConfig {

        @Override
        public int getCustomSize(@NonNull Paint paint,
            CharSequence text, int start, int end,
            @Nullable FontMetricsInt fm,
            int drawableWidth, int drawableHeight) {
            if (fm != null) {
                fm.ascent = fm.descent - drawableHeight;
            }
            return drawableWidth;
        }

        @Override
        public int getTransY(@NonNull Canvas canvas,
            CharSequence text, int start, int end,
            float baseLineX, int lineTop, int baselineY, int lineBottom,
            @NonNull Paint paint, FontMetricsInt fontMetricsInt,
            int drawableWidth, int drawableHeight) {
            return super.getTransY(canvas,
                text, start, end,
                baseLineX, lineTop, baselineY, lineBottom,
                paint, fontMetricsInt,
                drawableWidth, drawableHeight) + fontMetricsInt.descent;
        }
    }

    class AlignCenterConfig extends AlignBottomConfig {

        @Override
        public int getCustomSize(@NonNull Paint paint,
            CharSequence text, int start, int end,
            @Nullable FontMetricsInt fm,
            int drawableWidth, int drawableHeight) {
            if (fm != null) {
                int textAreaHeight = fm.descent - fm.ascent;
                if (textAreaHeight < drawableHeight) {
                    int oldSumOfAscentAndDescent = fm.ascent + fm.descent;
                    fm.ascent = oldSumOfAscentAndDescent - drawableHeight >> 1;
                    fm.descent = oldSumOfAscentAndDescent + drawableHeight >> 1;
                }

            }
            return drawableWidth;
        }

        @Override
        public int getTransY(@NonNull Canvas canvas,
            CharSequence text, int start, int end,
            float baseLineX, int lineTop, int baselineY, int lineBottom,
            @NonNull Paint paint, FontMetricsInt fontMetricsInt,
            int drawableWidth, int drawableHeight) {
            int transY = super.getTransY(canvas,
                text, start, end,
                baseLineX, lineTop, baselineY, lineBottom,
                paint, fontMetricsInt,
                drawableWidth, drawableHeight);

            int fontHeight = fontMetricsInt.descent - fontMetricsInt.ascent;
            transY = transY - (fontHeight >> 1) + (drawableHeight >> 1);

            return transY;
        }
    }

    class AlignTopConfig extends BaseAlignConfig {

        @Override
        public int getCustomSize(@NonNull Paint paint,
            CharSequence text, int start, int end,
            @Nullable FontMetricsInt fm,
            int drawableWidth, int drawableHeight) {
            if (fm != null) {
                fm.descent = drawableHeight + fm.ascent;
            }
            return drawableWidth;
        }

        @Override
        public int getTransY(@NonNull Canvas canvas,
            CharSequence text, int start, int end,
            float baseLineX, int lineTop, int baselineY, int lintBottom,
            @NonNull Paint paint, FontMetricsInt fontMetricsInt,
            int drawableWidth, int drawableHeight) {
            return baselineY + fontMetricsInt.ascent;
        }
    }
}
