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
import android.graphics.DashPathEffect;
import android.graphics.Path;
import android.graphics.PathDashPathEffect;
import android.graphics.PathEffect;
import android.graphics.RectF;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.renderer.component.drawable.BackgroundDrawable.BorderColor;
import com.tencent.renderer.component.drawable.BackgroundDrawable.BorderRadius;
import com.tencent.renderer.component.drawable.BackgroundDrawable.BorderSide;
import com.tencent.renderer.component.drawable.BackgroundDrawable.BorderStyle;
import com.tencent.renderer.component.drawable.BackgroundDrawable.BorderStyles;
import com.tencent.renderer.component.drawable.BackgroundDrawable.BorderWidth;

final class BorderResolvedInfo {

    static class BorderSideValue<T> {

        T left;
        T top;
        T right;
        T bottom;
    }

    private static final ThreadLocal<float[]> sTempFloatArray = new ThreadLocal<float[]>() {
        @Override
        protected float[] initialValue() {
            return new float[8];
        }
    };
    /**
     * region that excluded border width
     */
    final RectF contentRegion = new RectF();
    final BorderWidth strokeWidth = new BorderWidth(0);
    final BorderColor borderColor = new BorderColor(Color.TRANSPARENT);
    final BorderSideValue<Path> borderSideClip = new BorderSideValue<>();
    final BorderSideValue<Path> borderSideMidline = new BorderSideValue<>();
    final BorderSideValue<PathEffect> pathEffect = new BorderSideValue<>();
    boolean hasVisibleBorder;
    boolean hasBorderRadius;
    boolean hasContentRadius;
    boolean drawBorderSideBySide;
    Path borderOutsidePath;
    Path borderInsidePath;
    Path borderMidlinePath;
    RectF borderMidlineRect;
    private final BorderWidth borderWidth = new BorderWidth(0);
    private final BorderRadius borderRadius = new BorderRadius(0);
    private final BorderStyles borderStyles = new BorderStyles(BorderStyle.NONE);

    void resolve(RectF rect, int preferBorderWidth, BorderWidth preferBorderWidths, float preferBorderRadius,
            BorderRadius preferBorderRadii, int preferBorderColor, BorderColor preferBorderColors,
            BorderStyle preferBorderStyle, BorderStyles preferBorderStyles) {
        final float width = rect.width();
        final float height = rect.height();
        // resolve border width
        final boolean hasBorderWidth = resolveBorderWidth(width, height, preferBorderWidth, preferBorderWidths);
        if (hasBorderWidth) {
            contentRegion.set(rect.left + borderWidth.left,
                    rect.top + borderWidth.top,
                    rect.right - borderWidth.right,
                    rect.bottom - borderWidth.bottom);
        } else {
            contentRegion.set(rect);
        }

        // resolve border radius
        hasBorderRadius = resolveBorderRadius(width, height, preferBorderRadius, preferBorderRadii);
        if (hasBorderRadius) {
            if (borderOutsidePath == null) {
                borderOutsidePath = new Path();
            }
            if (borderInsidePath == null) {
                borderInsidePath = new Path();
            }
            buildRoundRectPath(rect, borderRadius, null, 0, borderOutsidePath);
            if (hasBorderWidth) {
                hasContentRadius = hasContentRadius(borderWidth, borderRadius);
                if (hasContentRadius) {
                    buildRoundRectPath(contentRegion, borderRadius, borderWidth, 1, borderInsidePath);
                }
            } else {
                hasContentRadius = true;
                borderInsidePath.set(borderOutsidePath);
            }
        } else {
            hasContentRadius = false;
        }

        resolveBorderColor(preferBorderColor, preferBorderColors);
        resolveBorderStyle(preferBorderStyle, preferBorderStyles);
        if (!borderWidth.hasSameWidthOnAllSides()
                || !borderColor.hasSameColorOnAllSides()
                || !borderStyles.hasSameStyleOnAllSides()
                || (borderStyles.left == BorderStyle.DOTTED && borderWidth.left > PixelUtil.dp2px(1))) {
            // build side by side border stroke path
            drawBorderSideBySide = hasVisibleBorder = updateBorderStrokeSides(rect);
        } else {
            drawBorderSideBySide = false;
            hasVisibleBorder = isVisible(borderWidth.left, borderColor.left, borderStyles.left);
            if (hasVisibleBorder) {
                strokeWidth.setBorderWith(borderWidth.left, BorderSide.ALL);
                pathEffect.left = pathEffect.top = pathEffect.right = pathEffect.bottom = buildPathEffect(
                        borderStyles.left, borderWidth.left, 0, false, false);

                // build border stroke path
                if (borderMidlineRect == null) {
                    borderMidlineRect = new RectF();
                }
                float inset = borderWidth.left * 0.5f;
                borderMidlineRect.set(rect.left + inset, rect.top + inset, rect.right - inset, rect.bottom - inset);
                if (hasContentRadius) {
                    if (borderMidlinePath == null) {
                        borderMidlinePath = new Path();
                    }
                    buildRoundRectPath(borderMidlineRect, borderRadius, borderWidth, 0.5f, borderMidlinePath);
                }
            } else {
                strokeWidth.setBorderWith(0, BorderSide.ALL);
                pathEffect.left = pathEffect.top = pathEffect.right = pathEffect.bottom = null;
            }
        }
    }

    private boolean resolveBorderWidth(float regionWidth, float regionHeight, int preferBorderWidth,
            BorderWidth preferBorderWidths) {
        final int left;
        final int top;
        final int right;
        final int bottom;
        final boolean hasBorderWidth;
        if (preferBorderWidths == null) {
            left = top = right = bottom = preferBorderWidth;
            hasBorderWidth = preferBorderWidth > 0;
        } else {
            left = preferBorderWidths.left;
            top = preferBorderWidths.top;
            right = preferBorderWidths.right;
            bottom = preferBorderWidths.bottom;
            hasBorderWidth = left > 0 || top > 0 || right > 0 || bottom > 0;
        }
        boolean needScale = false;
        float radio = 1;
        if (hasBorderWidth) {
            if (left + right > regionWidth) {
                radio = regionWidth / (left + right);
                needScale = true;
            }
            if (top + bottom > regionHeight) {
                radio = Math.min(radio, regionHeight / (top + bottom));
                needScale = true;
            }
        }
        if (needScale) {
            borderWidth.left = (int) (left * radio);
            borderWidth.top = (int) (top * radio);
            borderWidth.right = (int) (right * radio);
            borderWidth.bottom = (int) (bottom * radio);
        } else {
            borderWidth.left = left;
            borderWidth.top = top;
            borderWidth.right = right;
            borderWidth.bottom = bottom;
        }
        return hasBorderWidth;
    }

    private boolean resolveBorderRadius(float regionWidth, float regionHeight, float preferBorderRadius,
            BorderRadius preferBorderRadii) {
        final float topLeft;
        final float topRight;
        final float bottomRight;
        final float bottomLeft;
        final boolean hasBorderRadius;
        if (preferBorderRadii == null) {
            topLeft = topRight = bottomRight = bottomLeft = preferBorderRadius;
            hasBorderRadius = preferBorderRadius > 0;
        } else {
            topLeft = preferBorderRadii.topLeft;
            topRight = preferBorderRadii.topRight;
            bottomRight = preferBorderRadii.bottomRight;
            bottomLeft = preferBorderRadii.bottomLeft;
            hasBorderRadius = topLeft > 0 || topRight > 0 || bottomRight > 0 || bottomLeft > 0;
        }
        boolean needScale = false;
        float radio = 1;
        if (hasBorderRadius) {
            float preferTop = Math.max(topLeft, borderWidth.left) + Math.max(topRight, borderWidth.right);
            float preferBottom = Math.max(bottomLeft, borderWidth.left) + Math.max(bottomRight, borderWidth.right);
            if (preferTop > regionWidth || preferBottom > regionWidth) {
                radio = regionWidth / Math.max(preferTop, preferBottom);
                needScale = true;
            }
            float preferLeft = Math.max(topLeft, borderWidth.top) + Math.max(bottomLeft, borderWidth.bottom);
            float preferRight = Math.max(topRight, borderWidth.top) + Math.max(bottomRight, borderWidth.bottom);
            if (preferLeft > regionHeight || preferRight > regionHeight) {
                radio = Math.min(radio, regionHeight / Math.max(preferLeft, preferRight));
                needScale = true;
            }
        }
        if (needScale) {
            borderRadius.topLeft = topLeft * radio;
            borderRadius.topRight = topRight * radio;
            borderRadius.bottomRight = bottomRight * radio;
            borderRadius.bottomLeft = bottomLeft * radio;
        } else {
            borderRadius.topLeft = topLeft;
            borderRadius.topRight = topRight;
            borderRadius.bottomRight = bottomRight;
            borderRadius.bottomLeft = bottomLeft;
        }
        return hasBorderRadius;
    }

    private void resolveBorderColor(int preferBorderColor, BorderColor preferBorderColors) {
        if (preferBorderColors == null) {
            borderColor.setBorderColor(preferBorderColor, BorderSide.ALL);
        } else {
            borderColor.left = preferBorderColors.left;
            borderColor.top = preferBorderColors.top;
            borderColor.right = preferBorderColors.right;
            borderColor.bottom = preferBorderColors.bottom;
        }
    }

    private void resolveBorderStyle(BorderStyle preferBorderStyle, BorderStyles preferBorderStyles) {
        if (preferBorderStyles == null) {
            borderStyles.setBorderStyle(preferBorderStyle, BorderSide.ALL);
        } else {
            borderStyles.left = preferBorderStyles.left;
            borderStyles.top = preferBorderStyles.top;
            borderStyles.right = preferBorderStyles.right;
            borderStyles.bottom = preferBorderStyles.bottom;
        }
    }

    private boolean updateBorderStrokeSides(RectF rect) {
        boolean hasVisible = false;
        if (isVisible(borderWidth.left, borderColor.left, borderStyles.left)) {
            updateBorderStrokeLeft(rect);
            hasVisible = true;
        } else {
            pathEffect.left = null;
            strokeWidth.left = 0;
        }

        if (isVisible(borderWidth.top, borderColor.top, borderStyles.top)) {
            updateBorderStrokeTop(rect);
            hasVisible = true;
        } else {
            pathEffect.top = null;
            strokeWidth.top = 0;
        }

        if (isVisible(borderWidth.right, borderColor.right, borderStyles.right)) {
            updateBorderStrokeRight(rect);
            hasVisible = true;
        } else {
            pathEffect.right = null;
            strokeWidth.right = 0;
        }

        if (isVisible(borderWidth.bottom, borderColor.bottom, borderStyles.bottom)) {
            updateBorderStrokeBottom(rect);
            hasVisible = true;
        } else {
            pathEffect.bottom = null;
            strokeWidth.bottom = 0;
        }
        return hasVisible;
    }

    private PathEffect buildPathEffect(BorderStyle style, int borderSize, int pathLength, boolean roundStart,
            boolean roundEnd) {
        if (style == BorderStyle.DASHED) {
            int fix = (int) PixelUtil.dp2px(5);
            return new DashPathEffect(new float[]{2 * borderSize + fix, borderSize + fix}, 0);
        } else if (style == BorderStyle.DOTTED) {
            if (borderSize <= 2) {
                return new DashPathEffect(new float[]{borderSize, borderSize}, 0);
            }
            Path circle = new Path();
            circle.addCircle(0, 0, borderSize * 0.5f, Path.Direction.CW);
            final float advance;
            if (pathLength < borderSize) {
                advance = borderSize;
            } else if (pathLength < borderSize * 2) {
                advance = pathLength;
            } else {
                float weight = (roundStart ? 0 : 0.25f) + (roundEnd ? 0 : 0.25f);
                int count = (int) Math.ceil(pathLength * 0.5 / borderSize + weight);
                advance = (pathLength - count * borderSize) / (count - weight * 2) + borderSize;
            }
            float phase = roundStart ? -advance * 0.5f : -borderSize * 0.5f;
            return new PathDashPathEffect(circle, advance, phase, PathDashPathEffect.Style.TRANSLATE);
        } else {
            return null;
        }
    }

    private void updateBorderStrokeLeft(RectF rect) {
        Path clip = borderSideClip.left;
        if (clip == null) {
            borderSideClip.left = clip = new Path();
        } else {
            clip.rewind();
        }
        Path midline = borderSideMidline.left;
        if (midline == null) {
            borderSideMidline.left = midline = new Path();
        } else {
            midline.rewind();
        }
        BorderStyle style = borderStyles.left;
        float startRadius = borderRadius.topLeft;
        float endRadius = borderRadius.bottomLeft;
        int strokeSize = borderWidth.left;
        float strokeLength = rect.height();
        boolean roundStart = false;
        boolean roundEnd = false;
        clip.moveTo(rect.left, rect.top);
        if (startRadius > borderWidth.left && startRadius > borderWidth.top) {
            float startDiameter = 2 * startRadius;
            // top-left inside arc
            float startAngle = arcAngle(startRadius, borderWidth.left, borderWidth.top, 1);
            clip.arcTo(
                    rect.left + borderWidth.left,
                    rect.top + borderWidth.top,
                    rect.left + startDiameter - borderWidth.left,
                    rect.top + startDiameter - borderWidth.top,
                    180 + startAngle, -startAngle, false);
            // top-left midline arc
            float startMidlineAngle = style != BorderStyle.DOTTED ? 90
                    : arcAngle(startRadius, borderWidth.left, borderWidth.top, 0.5f);
            midline.addArc(
                    rect.left + borderWidth.left * 0.5f,
                    rect.top + borderWidth.top * 0.5f,
                    rect.left + startDiameter - borderWidth.left * 0.5f,
                    rect.top + startDiameter - borderWidth.top * 0.5f,
                    180 + startMidlineAngle, -startMidlineAngle);
            if (style == BorderStyle.DOTTED) {
                roundStart = true;
                strokeLength += arcLength(startRadius - borderWidth.left * 0.5f, startRadius - borderWidth.top * 0.5f,
                        startMidlineAngle) - startRadius;
            } else {
                strokeSize = Math.max(strokeSize, borderWidth.top);
            }
        } else {
            clip.lineTo(rect.left + borderWidth.left, rect.top + borderWidth.top);
            midline.moveTo(rect.left + borderWidth.left * 0.5f, rect.top);
        }
        if (endRadius > borderWidth.left && endRadius > borderWidth.bottom) {
            float endDiameter = 2 * endRadius;
            // bottom-left inside arc
            float endAngle = 90 - arcAngle(endRadius, borderWidth.bottom, borderWidth.left, 1);
            clip.arcTo(
                    rect.left + borderWidth.left,
                    rect.bottom - endDiameter + borderWidth.bottom,
                    rect.left + endDiameter - borderWidth.left,
                    rect.bottom - borderWidth.bottom,
                    180, -endAngle, false);
            // bottom-left midline arc
            float endMidlineAngle = style != BorderStyle.DOTTED ? 90
                    : 90 - arcAngle(endRadius, borderWidth.bottom, borderWidth.left, 0.5f);
            midline.arcTo(
                    rect.left + borderWidth.left * 0.5f,
                    rect.bottom - endDiameter + borderWidth.bottom * 0.5f,
                    rect.left + endDiameter - borderWidth.left * 0.5f,
                    rect.bottom - borderWidth.bottom * 0.5f,
                    180, -endMidlineAngle, false);
            if (style == BorderStyle.DOTTED) {
                roundEnd = true;
                strokeLength += arcLength(endRadius - borderWidth.left * 0.5f, endRadius - borderWidth.bottom * 0.5f,
                        endMidlineAngle) - endRadius;
            } else {
                strokeSize = Math.max(strokeSize, borderWidth.bottom);
            }
        } else {
            clip.lineTo(rect.left + borderWidth.left, rect.bottom - borderWidth.bottom);
            midline.lineTo(rect.left + borderWidth.left * 0.5f, rect.bottom);
        }
        clip.lineTo(rect.left, rect.bottom);
        clip.close();
        strokeWidth.left = strokeSize;
        pathEffect.left = buildPathEffect(style, borderWidth.left, (int) strokeLength, roundStart, roundEnd);
    }

    private void updateBorderStrokeTop(RectF rect) {
        Path clip = borderSideClip.top;
        if (clip == null) {
            borderSideClip.top = clip = new Path();
        } else {
            clip.rewind();
        }
        Path midline = borderSideMidline.top;
        if (midline == null) {
            borderSideMidline.top = midline = new Path();
        } else {
            midline.rewind();
        }
        BorderStyle style = borderStyles.top;
        float startRadius = borderRadius.topRight;
        float endRadius = borderRadius.topLeft;
        int strokeSize = borderWidth.top;
        float strokeLength = rect.width();
        boolean roundStart = false;
        boolean roundEnd = false;
        clip.moveTo(rect.right, rect.top);
        if (startRadius > borderWidth.right && startRadius > borderWidth.top) {
            float startDiameter = 2 * startRadius;
            // top-right inside arc
            float startAngle = arcAngle(startRadius, borderWidth.top, borderWidth.right, 1);
            clip.arcTo(
                    rect.right - startDiameter + borderWidth.right,
                    rect.top + borderWidth.top,
                    rect.right - borderWidth.right,
                    rect.top + startDiameter - borderWidth.top,
                    270 + startAngle, -startAngle, false);
            // top-right midline arc
            float startMidlineAngle = style != BorderStyle.DOTTED ? 90
                    : arcAngle(startRadius, borderWidth.top, borderWidth.right, 0.5f);
            midline.addArc(
                    rect.right - startDiameter + borderWidth.right * 0.5f,
                    rect.top + borderWidth.top * 0.5f,
                    rect.right - borderWidth.right * 0.5f,
                    rect.top + startDiameter - borderWidth.top * 0.5f,
                    270 + startMidlineAngle, -startMidlineAngle);
            if (style == BorderStyle.DOTTED) {
                roundStart = true;
                strokeLength += arcLength(startRadius - borderWidth.right * 0.5f, startRadius - borderWidth.top * 0.5f,
                        startMidlineAngle) - startRadius;
            } else {
                strokeSize = Math.max(strokeSize, borderWidth.right);
            }
        } else {
            clip.lineTo(rect.right - borderWidth.right, rect.top + borderWidth.top);
            midline.moveTo(rect.right, rect.top + borderWidth.top * 0.5f);
        }
        if (endRadius > borderWidth.top && endRadius > borderWidth.left) {
            float endDiameter = 2 * endRadius;
            // top-left inside arc
            float endAngle = 90 - arcAngle(startRadius, borderWidth.left, borderWidth.top, 1);
            clip.arcTo(
                    rect.left + borderWidth.left,
                    rect.top + borderWidth.top,
                    rect.left + endDiameter - borderWidth.left,
                    rect.top + endDiameter - borderWidth.top,
                    270, -endAngle, false);
            // top-left midline arc
            float endMidlineAngle = style != BorderStyle.DOTTED ? 90
                    : 90 - arcAngle(startRadius, borderWidth.left, borderWidth.top, 0.5f);
            midline.arcTo(
                    rect.left + borderWidth.left * 0.5f,
                    rect.top + borderWidth.top * 0.5f,
                    rect.left + endDiameter - borderWidth.left * 0.5f,
                    rect.top + endDiameter - borderWidth.top * 0.5f,
                    270, -endMidlineAngle, false);
            if (style == BorderStyle.DOTTED) {
                roundEnd = true;
                strokeLength += arcLength(endRadius - borderWidth.left * 0.5f, endRadius - borderWidth.top * 0.5f,
                        endMidlineAngle) - endRadius;
            } else {
                strokeSize = Math.max(strokeSize, borderWidth.left);
            }
        } else {
            clip.lineTo(rect.left + borderWidth.left, rect.top + borderWidth.top);
            midline.lineTo(rect.left, rect.top + borderWidth.top * 0.5f);
        }
        clip.lineTo(rect.left, rect.top);
        clip.close();
        strokeWidth.top = strokeSize;
        pathEffect.top = buildPathEffect(style, borderWidth.top, (int) strokeLength, roundStart, roundEnd);
    }

    private void updateBorderStrokeRight(RectF rect) {
        Path clip = borderSideClip.right;
        if (clip == null) {
            borderSideClip.right = clip = new Path();
        } else {
            clip.rewind();
        }
        Path midline = borderSideMidline.right;
        if (midline == null) {
            borderSideMidline.right = midline = new Path();
        } else {
            midline.rewind();
        }
        BorderStyle style = borderStyles.right;
        float startRadius = borderRadius.bottomRight;
        float endRadius = borderRadius.topRight;
        int strokeSize = borderWidth.right;
        float strokeLength = rect.height();
        boolean roundStart = false;
        boolean roundEnd = false;
        clip.moveTo(rect.right, rect.bottom);
        if (startRadius > borderWidth.bottom && startRadius > borderWidth.right) {
            float startDiameter = 2 * startRadius;
            // bottom-right inside arc
            float startAngle = arcAngle(startRadius, borderWidth.right, borderWidth.bottom, 1);
            clip.arcTo(
                    rect.right - startDiameter + borderWidth.right,
                    rect.bottom - startDiameter + borderWidth.bottom,
                    rect.right - borderWidth.right,
                    rect.bottom - borderWidth.bottom,
                    startAngle, -startAngle, false);
            // bottom-right midline arc
            float startMidlineAngle = style != BorderStyle.DOTTED ? 90
                    : arcAngle(startRadius, borderWidth.right, borderWidth.bottom, 0.5f);
            midline.addArc(
                    rect.right - startDiameter + borderWidth.right * 0.5f,
                    rect.bottom - startDiameter + borderWidth.bottom * 0.5f,
                    rect.right - borderWidth.right * 0.5f,
                    rect.bottom - borderWidth.bottom * 0.5f,
                    startMidlineAngle, -startMidlineAngle);
            if (style == BorderStyle.DOTTED) {
                roundStart = true;
                strokeLength +=
                        arcLength(startRadius - borderWidth.right * 0.5f, startRadius - borderWidth.bottom * 0.5f,
                                startMidlineAngle) - startRadius;
            } else {
                strokeSize = Math.max(strokeSize, borderWidth.bottom);
            }
        } else {
            clip.lineTo(rect.right - borderWidth.right, rect.bottom - borderWidth.bottom);
            midline.moveTo(rect.right - borderWidth.right * 0.5f, rect.bottom);
        }
        if (endRadius > borderWidth.top && endRadius > borderWidth.right) {
            float endDiameter = 2 * endRadius;
            // top-right inside arc
            float endAngle = 90 - arcAngle(startRadius, borderWidth.top, borderWidth.right, 1);
            clip.arcTo(
                    rect.right - endDiameter + borderWidth.right,
                    rect.top + borderWidth.top,
                    rect.right - borderWidth.right,
                    rect.top + endDiameter - borderWidth.top,
                    0, -endAngle, false);
            // top-right midline arc
            float endMidlineAngle = style != BorderStyle.DOTTED ? 90
                    : 90 - arcAngle(startRadius, borderWidth.top, borderWidth.right, 0.5f);
            midline.arcTo(
                    rect.right - endDiameter + borderWidth.right * 0.5f,
                    rect.top + borderWidth.top * 0.5f,
                    rect.right - borderWidth.right * 0.5f,
                    rect.top + endDiameter - borderWidth.top * 0.5f,
                    0, -endMidlineAngle, false);
            if (style == BorderStyle.DOTTED) {
                roundEnd = true;
                strokeLength += arcLength(endRadius - borderWidth.right * 0.5f, endRadius - borderWidth.top * 0.5f,
                        endMidlineAngle) - endRadius;
            } else {
                strokeSize = Math.max(strokeSize, borderWidth.top);
            }
        } else {
            clip.lineTo(rect.right - borderWidth.right, rect.top + borderWidth.top);
            midline.lineTo(rect.right - borderWidth.right * 0.5f, rect.top);
        }
        clip.lineTo(rect.right, rect.top);
        clip.close();
        strokeWidth.right = strokeSize;
        pathEffect.right = buildPathEffect(style, borderWidth.right, (int) strokeLength, roundStart, roundEnd);
    }

    private void updateBorderStrokeBottom(RectF rect) {
        Path clip = borderSideClip.bottom;
        if (clip == null) {
            borderSideClip.bottom = clip = new Path();
        } else {
            clip.rewind();
        }
        Path midline = borderSideMidline.bottom;
        if (midline == null) {
            borderSideMidline.bottom = midline = new Path();
        } else {
            midline.rewind();
        }
        BorderStyle style = borderStyles.bottom;
        float startRadius = borderRadius.bottomLeft;
        float endRadius = borderRadius.bottomRight;
        int strokeSize = borderWidth.bottom;
        float strokeLength = rect.width();
        boolean roundStart = false;
        boolean roundEnd = false;
        clip.moveTo(rect.left, rect.bottom);
        if (startRadius > borderWidth.bottom && startRadius > borderWidth.left) {
            float startDiameter = 2 * startRadius;
            // bottom-left inside arc
            float startAngle = arcAngle(startRadius, borderWidth.bottom, borderWidth.left, 1);
            clip.arcTo(
                    rect.left + borderWidth.left,
                    rect.bottom - startDiameter + borderWidth.bottom,
                    rect.left + startDiameter - borderWidth.left,
                    rect.bottom - borderWidth.bottom,
                    90 + startAngle, -startAngle, false);
            // bottom-left midline arc
            float startMidlineAngle = style != BorderStyle.DOTTED ? 90
                    : arcAngle(startRadius, borderWidth.bottom, borderWidth.left, 0.5f);
            midline.addArc(
                    rect.left + borderWidth.left * 0.5f,
                    rect.bottom - startDiameter + borderWidth.bottom * 0.5f,
                    rect.left + startDiameter - borderWidth.left * 0.5f,
                    rect.bottom - borderWidth.bottom * 0.5f,
                    90 + startMidlineAngle, -startMidlineAngle);
            if (style == BorderStyle.DOTTED) {
                roundStart = true;
                strokeLength +=
                        arcLength(startRadius - borderWidth.left * 0.5f, startRadius - borderWidth.bottom * 0.5f,
                                startMidlineAngle) - startRadius;
            } else {
                strokeSize = Math.max(strokeSize, borderWidth.left);
            }
        } else {
            clip.lineTo(rect.left + borderWidth.left, rect.bottom - borderWidth.bottom);
            midline.moveTo(rect.left, rect.bottom - borderWidth.bottom * 0.5f);
        }
        if (endRadius > borderWidth.bottom && endRadius > borderWidth.right) {
            float endDiameter = 2 * endRadius;
            // bottom-right inside arc
            float endAngle = 90 - arcAngle(startRadius, borderWidth.right, borderWidth.bottom, 1);
            clip.arcTo(
                    rect.right - endDiameter + borderWidth.right,
                    rect.bottom - endDiameter + borderWidth.bottom,
                    rect.right - borderWidth.right,
                    rect.bottom - borderWidth.bottom,
                    90, -endAngle, false);
            // bottom-right midline arc
            float endMidlineAngle = style != BorderStyle.DOTTED ? 90
                    : 90 - arcAngle(startRadius, borderWidth.right, borderWidth.bottom, 0.5f);
            midline.arcTo(
                    rect.right - endDiameter + borderWidth.right * 0.5f,
                    rect.bottom - endDiameter + borderWidth.bottom * 0.5f,
                    rect.right - borderWidth.right * 0.5f,
                    rect.bottom - borderWidth.bottom * 0.5f,
                    90, -endMidlineAngle, false);
            if (style == BorderStyle.DOTTED) {
                roundEnd = true;
                strokeLength += arcLength(endRadius - borderWidth.right * 0.5f, endRadius - borderWidth.bottom * 0.5f,
                        endMidlineAngle) - endRadius;
            } else {
                strokeSize = Math.max(strokeSize, borderWidth.right);
            }
        } else {
            clip.lineTo(rect.right - borderWidth.right, rect.bottom - borderWidth.bottom);
            midline.lineTo(rect.right, rect.bottom - borderWidth.bottom * 0.5f);
        }
        clip.lineTo(rect.right, rect.bottom);
        clip.close();
        strokeWidth.bottom = strokeSize;
        pathEffect.bottom = buildPathEffect(style, borderWidth.bottom, (int) strokeLength, roundStart, roundEnd);
    }

    private static boolean hasContentRadius(BorderWidth borderWidth, BorderRadius borderRadius) {
        return borderRadius.topLeft > borderWidth.left || borderRadius.topLeft > borderWidth.top
                || borderRadius.topRight > borderWidth.top || borderRadius.topRight > borderWidth.right
                || borderRadius.bottomRight > borderWidth.right || borderRadius.bottomRight > borderWidth.bottom
                || borderRadius.bottomLeft > borderWidth.bottom || borderRadius.bottomLeft > borderWidth.left;
    }

    private static boolean isVisible(int borderWidth, int borderColor, BorderStyle borderStyle) {
        return borderWidth > 0 && borderColor != Color.TRANSPARENT && borderStyle != BorderStyle.NONE;
    }

    private static void buildRoundRectPath(RectF rect, BorderRadius src, BorderWidth insets, float weight, Path dst) {
        float[] tmp = sTempFloatArray.get();
        assert tmp != null;
        if (insets == null || weight == 0) {
            tmp[0] = tmp[1] = src.topLeft;
            tmp[2] = tmp[3] = src.topRight;
            tmp[4] = tmp[5] = src.bottomRight;
            tmp[6] = tmp[7] = src.bottomLeft;
        } else {
            tmp[0] = Math.max(0, src.topLeft - insets.left * weight);
            tmp[1] = Math.max(0, src.topLeft - insets.top * weight);
            tmp[2] = Math.max(0, src.topRight - insets.right * weight);
            tmp[3] = Math.max(0, src.topRight - insets.top * weight);
            tmp[4] = Math.max(0, src.bottomRight - insets.right * weight);
            tmp[5] = Math.max(0, src.bottomRight - insets.bottom * weight);
            tmp[6] = Math.max(0, src.bottomLeft - insets.left * weight);
            tmp[7] = Math.max(0, src.bottomLeft - insets.bottom * weight);
        }
        dst.rewind();
        dst.addRoundRect(rect, tmp, Path.Direction.CW);
    }

    /**
     * calculate the eccentric anomaly of the top-left border radius (can be used for other corner after rotation), use
     * with {@link Path#addArc} and {@link Path#arcTo}
     *
     * @param radius border outside radius
     * @param insetX border width left, must > 0
     * @param insetY border width top, must >= 0
     * @param ovalWeight percentage of border path inset in range of [0, 1]
     * @return eccentric anomaly in degrees in range of [0, 90)
     */
    private static float arcAngle(float radius, float insetX, float insetY, float ovalWeight) {
        // resolve the intersection point between:
        // - line: (y - (-radius)) / insetY = (x - (-radius)) / insetX
        // - ellipse: x^2 / radiusA^2 + y^2 / radiusB^2 = 1
        final float k = insetY / insetX;
        final float radiusA = radius - insetX * ovalWeight;
        final float radiusB = radius - insetY * ovalWeight;
        final float sub = k * radius - radius;
        // A, B, C are the coefficients of a quadratic equation
        final float A = radiusB * radiusB + radiusA * radiusA * k * k;
        final float B = 2 * radiusA * radiusA * k * sub;
        final float C = radiusA * radiusA * (sub * sub - radiusB * radiusB);
        // (x, y) is the intersection point that closest to the top-left
        final double x = (-B - (float) Math.sqrt(B * B - 4 * A * C)) / (2 * A);
        final double y = k * (x + radius) - radius;
        // convert to eccentric anomaly in degrees
        return 180 + (float) (Math.atan2(y * radiusA / radiusB, x) * 180 / Math.PI);
    }

    /**
     * approximation value of ellipse arc length
     *
     * @param radiusA semi-major axis
     * @param radiusB semi-minor axis
     * @param degree eccentric anomaly in degrees
     * @return arc length
     */
    private static float arcLength(float radiusA, float radiusB, float degree) {
        // length = radian * sqrt((a^2 + b^2) / 2)
        return degree / 360f * (float) (Math.PI * Math.sqrt(2 * (radiusA * radiusA + radiusB * radiusB)));
    }

}
