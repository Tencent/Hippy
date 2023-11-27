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
import android.graphics.DashPathEffect;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.PathDashPathEffect;
import android.graphics.PathEffect;
import android.os.Build;
import android.text.Layout;
import android.text.style.LeadingMarginSpan;
import android.util.SparseArray;
import androidx.annotation.NonNull;
import com.tencent.mtt.hippy.utils.PixelUtil;
import java.util.ArrayList;

public class TextLineMetricsHelper implements LeadingMarginSpan {

    private boolean running;
    private int lineTop;
    private int lineBottom;
    private final ArrayList<TextDecorationRecord> textDecorationRecords = new ArrayList<>();
    private int textDecorationRecordCount = 0;
    private TextDecorationRecord startedRecord;
    private Paint textDecorationPaint;
    private SparseArray<PathEffect> dashedEffect;
    private SparseArray<PathEffect> dottedEffect;
    private Path reusablePath;

    @Override
    public int getLeadingMargin(boolean first) {
        return 0;
    }

    @Override
    public void drawLeadingMargin(Canvas c, Paint p, int x, int dir, int top, int baseline, int bottom,
            CharSequence text, int start, int end, boolean first, Layout layout) {
        if (!running) {
            return;
        }
        lineTop = top - baseline;
        lineBottom = bottom - baseline;
        if (startedRecord != null) {
            // handle line break between text decoration
            if (startedRecord.underline || startedRecord.lineThrough) {
                // the started record is not empty, we should start a new record for the new line
                TextDecorationRecord lastRecord = startedRecord;
                startedRecord = obtainTextDecorationRecord();
                startedRecord.mark = lastRecord.mark;
                startedRecord.lineOfSpan = lastRecord.lineOfSpan + 1;
                startedRecord.indexOfChars = lastRecord.indexOfChars;
            } else {
                // otherwise reuse it
                ++startedRecord.lineOfSpan;
            }
            startedRecord.left = -1;
            startedRecord.baseline = baseline;
        }
    }

    private TextDecorationRecord obtainTextDecorationRecord() {
        TextDecorationRecord record;
        if (textDecorationRecords.size() > textDecorationRecordCount) {
            record = textDecorationRecords.get(textDecorationRecordCount);
        } else {
            record = new TextDecorationRecord();
            textDecorationRecords.add(record);
        }
        ++textDecorationRecordCount;
        return record;
    }

    public int getLineTop() {
        return lineTop;
    }

    public int getLineBottom() {
        return lineBottom;
    }

    public void initialize() {
        reset();
        running = true;
    }

    private void reset() {
        // since this is running within draw, we reset the count and reuse the items
        // rather than {@link ArrayList#clear()} to avoid allocating objects frequently
        for (int i = 0; i < textDecorationRecordCount; ++i) {
            textDecorationRecords.get(i).reset();
        }
        lineTop = 0;
        lineBottom = 0;
        textDecorationRecordCount = 0;
        startedRecord = null;
        running = false;
    }

    public void markTextDecorationStart(TextDecorationSpan.StartMark span, int index, float x, float baseline) {
        if (!running) {
            return;
        }
        startedRecord = obtainTextDecorationRecord();
        startedRecord.mark = span;
        startedRecord.indexOfChars = index;
        startedRecord.left = x;
        startedRecord.baseline = baseline;
    }

    public void markTextDecoration(boolean underline, boolean lineThrough, int color, int style, float textSize) {
        if (startedRecord != null) {
            startedRecord.underline = underline;
            startedRecord.lineThrough = lineThrough;
            startedRecord.color = color;
            startedRecord.style = style;
            startedRecord.textSize = textSize;
        }
    }

    public void markTextDecorationEnd(float x) {
        if (startedRecord != null) {
            if (startedRecord.underline || startedRecord.lineThrough) {
                // the started record is not empty, mark end
                startedRecord.right = x;
            } else {
                // otherwise recycle it
                startedRecord.reset();
                --textDecorationRecordCount;
            }
            startedRecord = null;
        }
    }

    public void markShadow(float radius, float dx, float dy, int color) {
        if (startedRecord != null) {
            startedRecord.hasShadow = radius > 0 && color != Color.TRANSPARENT;
            startedRecord.shadowRadius = radius;
            startedRecord.shadowX = dx;
            startedRecord.shadowY = dy;
            startedRecord.shadowColor = color;
        }
    }

    public void markVerticalOffset(float baselineShift) {
        if (startedRecord != null) {
            startedRecord.baselineShift = baselineShift;
        }
    }

    public void drawTextDecoration(Canvas canvas, Layout layout) {
        TextDecorationSpan.StartMark lastSpan = null;
        int line = -1;
        for (int i = 0; i < textDecorationRecordCount; ++i) {
            if (textDecorationPaint == null) {
                textDecorationPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
                textDecorationPaint.setStyle(Paint.Style.STROKE);
            }
            TextDecorationRecord record = textDecorationRecords.get(i);
            textDecorationPaint.setColor(record.color);
            float left = record.left;
            if (left < 0) {
                if (lastSpan != record.mark) {
                    lastSpan = record.mark;
                    line = layout.getLineForOffset(record.indexOfChars);
                }
                left = layout.getLineLeft(line + record.lineOfSpan);
            }
            float right = record.right;
            if (right < 0) {
                if (lastSpan != record.mark) {
                    lastSpan = record.mark;
                    line = layout.getLineForOffset(record.indexOfChars);
                }
                right = layout.getLineRight(line + record.lineOfSpan);
            }
            if (record.underline) {
                drawLineInternal(canvas, left, right, record.underlinePosition(), textDecorationPaint, record);
            }
            if (record.lineThrough) {
                drawLineInternal(canvas, left, right, record.lineThroughPosition(), textDecorationPaint, record);
            }
        }
        reset();
    }

    private void drawLineInternal(@NonNull Canvas canvas, float startX, float endX, float y, @NonNull Paint paint,
            TextDecorationRecord record) {
        float thickness = record.thickness();
        PathEffect pathEffect = null;
        switch (record.style) {
            case TextDecorationSpan.STYLE_DASHED:
                // fall through
            case TextDecorationSpan.STYLE_DOTTED:
                pathEffect = buildPathEffect(thickness, record.style);
                paint.setPathEffect(pathEffect);
                // fall through
            case TextDecorationSpan.STYLE_SOLID:
                paint.setStrokeWidth(thickness);
                boolean needDrawShadow = false;
                if (record.hasShadow) {
                    if (pathEffect == null || isShadowLayerWithPathEffectSupported(canvas)) {
                        paint.setShadowLayer(record.shadowRadius, record.shadowX, record.shadowY, record.shadowColor);
                    } else {
                        needDrawShadow = isShadowLayerForNonTextSupported(canvas);
                    }
                }
                if (pathEffect == null || isPathEffectForLineSupported(canvas)) {
                    canvas.drawLine(startX, y, endX, y, paint);
                } else {
                    if (reusablePath == null) {
                        reusablePath = new Path();
                    } else {
                        reusablePath.rewind();
                    }
                    reusablePath.moveTo(startX, y);
                    reusablePath.lineTo(endX, y);
                    canvas.drawPath(reusablePath, paint);
                }
                if (pathEffect != null) {
                    paint.setPathEffect(null);
                    if (needDrawShadow) {
                        // draw shadow after clear PathEffect
                        final int previousColor = paint.getColor();
                        paint.setColor(Color.TRANSPARENT);
                        paint.setShadowLayer(record.shadowRadius, record.shadowX, record.shadowY, record.shadowColor);
                        canvas.drawLine(startX, y, endX, y, paint);
                        paint.setColor(previousColor);
                    }
                }
                break;
            case TextDecorationSpan.STYLE_DOUBLE:
                thickness *= 2 / 3f;
                paint.setStrokeWidth(thickness);
                if (record.hasShadow) {
                    paint.setShadowLayer(record.shadowRadius, record.shadowX, record.shadowY, record.shadowColor);
                }
                canvas.drawLine(startX, y - thickness, endX, y - thickness, paint);
                canvas.drawLine(startX, y + thickness, endX, y + thickness, paint);
                break;
            default:
                break;
        }
        if (record.hasShadow) {
            paint.clearShadowLayer();
        }
    }

    private boolean isShadowLayerWithPathEffectSupported(Canvas canvas) {
        // when hardware acceleration is enabled:
        // * ShadowLayer is not blurred with PathEffect on API Level >= 28
        // * ShadowLayer not supported for non-text on API Level < 28
        return !canvas.isHardwareAccelerated();
    }

    private boolean isPathEffectForLineSupported(Canvas canvas) {
        // https://developer.android.com/topic/performance/hardware-accel#drawing-support
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.P || !canvas.isHardwareAccelerated();
    }

    private boolean isShadowLayerForNonTextSupported(Canvas canvas) {
        // https://developer.android.com/topic/performance/hardware-accel#drawing-support
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.P || !canvas.isHardwareAccelerated();
    }

    private PathEffect buildPathEffect(float thickness, int style) {
        int key = (int) Math.ceil(thickness);
        PathEffect pathEffect = null;
        if (style == TextDecorationSpan.STYLE_DASHED) {
            if (dashedEffect == null) {
                dashedEffect = new SparseArray<>();
            } else {
                pathEffect = dashedEffect.get(key);
            }
            if (pathEffect == null) {
                int fix = (int) PixelUtil.dp2px(5);
                pathEffect = new DashPathEffect(new float[]{2 * key + fix, key + fix}, 0);
                dashedEffect.put(key, pathEffect);
            }
            return pathEffect;
        } else if (style == TextDecorationSpan.STYLE_DOTTED) {
            if (dottedEffect == null) {
                dottedEffect = new SparseArray<>();
            } else {
                pathEffect = dottedEffect.get(key);
            }
            if (pathEffect == null) {
                if (key <= 2) {
                    pathEffect = new DashPathEffect(new float[]{key, key}, 0);
                } else {
                    Path circle = new Path();
                    circle.addCircle(0, 0, key * 0.5f, Path.Direction.CW);
                    pathEffect = new PathDashPathEffect(circle, key * 2, key * 0.5f,
                            PathDashPathEffect.Style.TRANSLATE);
                }
                dottedEffect.put(key, pathEffect);
            }

        }
        return pathEffect;
    }

    private static class TextDecorationRecord {

        // according to kStdUnderline_Thickness defined in aosp's Paint.h
        private static final float THICKNESS = (1.0f / 18.0f);
        // according to kStdUnderline_Offset defined in aosp's Paint.h
        private static final float UNDERLINE_OFFSET = (1.0f / 9.0f);
        // according to kStdStrikeThru_Offset defined in aosp's Paint.h
        private static final float LINE_THROUGH_OFFSET = (-6.0f / 21.0f);

        TextDecorationSpan.StartMark mark;
        int indexOfChars = -1;
        int lineOfSpan;
        float left = -1;
        float right = -1;
        float baseline;
        float baselineShift;

        boolean underline;
        boolean lineThrough;
        int color;
        int style;
        float textSize;

        boolean hasShadow;
        int shadowColor;
        float shadowRadius;
        float shadowX;
        float shadowY;

        float thickness() {
            return textSize * THICKNESS;
        }

        float underlinePosition() {
            return baseline + baselineShift + textSize * UNDERLINE_OFFSET;
        }

        float lineThroughPosition() {
            return baseline + baselineShift + textSize * LINE_THROUGH_OFFSET;
        }

        void reset() {
            mark = null;
            indexOfChars = -1;
            lineOfSpan = 0;
            left = -1;
            right = -1;
            baseline = 0;
            baselineShift = 0;

            underline = false;
            lineThrough = false;
            hasShadow = false;
        }
    }

    public interface LineMetrics {

        void setLineMetrics(TextLineMetricsHelper helper);
    }

}
