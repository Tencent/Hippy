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

package com.tencent.renderer.node;

import static com.tencent.mtt.hippy.dom.node.NodeProps.TEXT_SHADOW_COLOR;
import static com.tencent.mtt.hippy.dom.node.NodeProps.TEXT_SHADOW_OFFSET;
import static com.tencent.mtt.hippy.dom.node.NodeProps.TEXT_SHADOW_RADIUS;

import android.graphics.Color;
import android.os.Build;
import android.text.BidiFormatter;
import android.text.BoringLayout;
import android.text.Layout;
import android.text.Spannable;
import android.text.SpannableStringBuilder;
import android.text.Spanned;
import android.text.StaticLayout;
import android.text.TextPaint;
import android.text.TextUtils;
import android.text.style.AbsoluteSizeSpan;
import android.text.style.BackgroundColorSpan;
import android.text.style.ImageSpan;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.utils.I18nUtil;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.renderer.NativeRender;
import com.tencent.renderer.component.text.FontAdapter;
import com.tencent.renderer.component.text.TextDecorationSpan;
import com.tencent.renderer.component.text.TextForegroundColorSpan;
import com.tencent.renderer.component.text.TextGestureSpan;
import com.tencent.renderer.component.text.TextLetterSpacingSpan;
import com.tencent.renderer.component.text.TextLineHeightSpan;
import com.tencent.renderer.component.text.TextLineMetricsHelper;
import com.tencent.renderer.component.text.TextShadowSpan;
import com.tencent.renderer.component.text.TextStyleSpan;
import com.tencent.renderer.component.text.TextVerticalAlignSpan;
import com.tencent.renderer.component.text.TypeFaceUtil;
import com.tencent.renderer.utils.FlexUtils.FlexMeasureMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Objects;

public class TextVirtualNode extends VirtualNode {

    public static final String STRATEGY_SIMPLE = "simple";
    public static final String STRATEGY_HIGH_QUALITY = "high_quality";
    public static final String STRATEGY_BALANCED = "balanced";

    private static final int TEXT_SHADOW_COLOR_DEFAULT = 0x55000000;
    private static final String TEXT_DECORATION_UNDERLINE = "underline";
    private static final String TEXT_DECORATION_LINE_THROUGH = "line-through";
    private static final String TEXT_DECORATION_DOUBLE = "double";
    private static final String TEXT_DECORATION_DOTTED = "dotted";
    private static final String TEXT_DECORATION_DASHED = "dashed";
    // an invisible mark for text decoration metrics
    private static final String TEXT_DECORATION_MARK = "\u200b";
    private static final String MODE_HEAD = "head";
    private static final String MODE_MIDDLE = "middle";
    private static final String MODE_TAIL = "tail";
    private static final String MODE_CLIP = "clip";
    private static final String TEXT_ALIGN_LEFT = "left";
    private static final String TEXT_ALIGN_AUTO = "auto";
    private static final String TEXT_ALIGN_JUSTIFY = "justify";
    private static final String TEXT_ALIGN_RIGHT = "right";
    private static final String TEXT_ALIGN_CENTER = "center";
    // via android.text.TextUtils#ELLIPSIS_NORMAL
    private static final String ELLIPSIS = "\u2026";

    protected int mColor = Color.BLACK;
    protected int mNumberOfLines;
    protected boolean mItalic = false;
    protected int mFontWeight = TypeFaceUtil.WEIGHT_NORMAL;
    protected int mFontSize = (int) Math.ceil(PixelUtil.dp2px(NodeProps.FONT_SIZE_SP));
    protected int mShadowColor = TEXT_SHADOW_COLOR_DEFAULT;
    protected float mShadowOffsetDx = 0.0f;
    protected float mShadowOffsetDy = 0.0f;
    protected float mShadowRadius = 1.0f;
    protected float mLineHeight;
    protected float mLineSpacingMultiplier = 1.0f;
    protected float mLineSpacingExtra;
    protected float mLetterSpacing;
    protected float mLastLayoutWidth = 0.0f;
    protected boolean mHasUnderlineTextDecoration = false;
    protected boolean mHasLineThroughTextDecoration = false;
    protected int mTextDecorationColor = Color.TRANSPARENT;
    protected int mTextDecorationStyle = TextDecorationSpan.STYLE_SOLID;
    protected boolean mEnableScale = false;
    protected String mEllipsizeMode = MODE_TAIL;
    protected String mBreakStrategy = STRATEGY_SIMPLE;
    @Nullable
    protected String mFontFamily;
    @Nullable
    protected SpannableStringBuilder mSpanned;
    @Nullable
    protected CharSequence mText;
    protected Layout.Alignment mAlignment = Layout.Alignment.ALIGN_NORMAL;
    @Nullable
    protected TextPaint mTextPaintInstance;
    // for compatibility with 2.13.x and earlier versions to calculate the layout height of empty Text nodes
    @Nullable
    protected TextPaint mTextPaintForEmpty;
    @Nullable
    protected final FontAdapter mFontAdapter;
    @Nullable
    protected Layout mLayout;
    protected int mBackgroundColor = Color.TRANSPARENT;

    public TextVirtualNode(int rootId, int id, int pid, int index,
            @NonNull NativeRender nativeRender) {
        super(rootId, id, pid, index);
        mFontAdapter = nativeRender.getFontAdapter();
        if (I18nUtil.isRTL()) {
            mAlignment = Layout.Alignment.ALIGN_OPPOSITE;
        }
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.FONT_STYLE, defaultType = HippyControllerProps.STRING)
    public void setFontStyle(String style) {
        if (TypeFaceUtil.TEXT_FONT_STYLE_ITALIC.equals(style) != mItalic) {
            mItalic = !mItalic;
            markDirty();
        }
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.LETTER_SPACING, defaultType = HippyControllerProps.NUMBER)
    public void setLetterSpacing(float spacing) {
        mLetterSpacing = PixelUtil.dp2px(spacing);
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.COLOR, defaultType = HippyControllerProps.NUMBER,
            defaultNumber = Color.BLACK)
    public void setColor(Integer color) {
        mColor = color;
        if (mTextPaintInstance != null) {
            mTextPaintInstance.setColor(color);
        }
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.FONT_SIZE, defaultType = HippyControllerProps.NUMBER,
            defaultNumber = NodeProps.FONT_SIZE_SP)
    public void setFontSize(float size) {
        mFontSize = (int) Math.ceil(PixelUtil.dp2px(size));
        if (mTextPaintInstance != null) {
            mTextPaintInstance.setTextSize(mFontSize);
        }
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.FONT_FAMILY, defaultType = HippyControllerProps.STRING)
    public void setFontFamily(String family) {
        if (!Objects.equals(mFontFamily, family)) {
            mFontFamily = family;
            markDirty();
        }
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.FONT_WEIGHT, defaultType = HippyControllerProps.STRING)
    public void setFontWeight(String weight) {
        int fontWeight;
        if (TextUtils.isEmpty(weight) || TypeFaceUtil.TEXT_FONT_STYLE_NORMAL.equals(weight)) {
            // case normal
            fontWeight = TypeFaceUtil.WEIGHT_NORMAL;
        } else if (TypeFaceUtil.TEXT_FONT_STYLE_BOLD.equals(weight)) {
            // case bold
            fontWeight = TypeFaceUtil.WEIGHT_BOLE;
        } else {
            // case number
            try {
                fontWeight = Math.min(Math.max(1, Integer.parseInt(weight)), 1000);
            } catch (NumberFormatException ignored) {
                fontWeight = TypeFaceUtil.WEIGHT_NORMAL;
            }
        }
        if (fontWeight != mFontWeight) {
            mFontWeight = fontWeight;
            markDirty();
        }
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.TEXT_DECORATION_LINE, defaultType = HippyControllerProps.STRING)
    public void setTextDecorationLine(String textDecorationLine) {
        mHasUnderlineTextDecoration = false;
        mHasLineThroughTextDecoration = false;
        if (TextUtils.isEmpty(textDecorationLine)) {
            return;
        }
        for (String subString : textDecorationLine.split(" ")) {
            if (TEXT_DECORATION_UNDERLINE.equals(subString)) {
                mHasUnderlineTextDecoration = true;
            } else if (TEXT_DECORATION_LINE_THROUGH.equals(subString)) {
                mHasLineThroughTextDecoration = true;
            }
        }
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.TEXT_DECORATION_COLOR, defaultType = HippyControllerProps.NUMBER)
    public void setTextDecorationColor(int color) {
        if (mTextDecorationColor == color) {
            return;
        }
        mTextDecorationColor = color;
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.TEXT_DECORATION_STYLE, defaultType = HippyControllerProps.STRING)
    public void setTextDecorationStyle(String style) {
        int styleFlag;
        switch (style) {
            case TEXT_DECORATION_DOUBLE:
                styleFlag = TextDecorationSpan.STYLE_DOUBLE;
                break;
            case TEXT_DECORATION_DOTTED:
                styleFlag = TextDecorationSpan.STYLE_DOTTED;
                break;
            case TEXT_DECORATION_DASHED:
                styleFlag = TextDecorationSpan.STYLE_DASHED;
                break;
            default:
                styleFlag = TextDecorationSpan.STYLE_SOLID;
                break;
        }
        if (mTextDecorationStyle == styleFlag) {
            return;
        }
        mTextDecorationStyle = styleFlag;
        markDirty();
    }

    @SuppressWarnings({"unused", "rawtypes"})
    @HippyControllerProps(name = TEXT_SHADOW_OFFSET, defaultType = HippyControllerProps.MAP)
    public void setTextShadowOffset(HashMap offsetMap) {
        mShadowOffsetDx = 0.0f;
        mShadowOffsetDy = 0.0f;
        if (offsetMap == null) {
            return;
        }
        Object widthObj = offsetMap.get(NodeProps.WIDTH);
        Object heightObj = offsetMap.get(NodeProps.HEIGHT);
        if (widthObj instanceof Number) {
            mShadowOffsetDx = PixelUtil.dp2px(((Number) widthObj).doubleValue());
        }
        if (heightObj instanceof Number) {
            mShadowOffsetDy = PixelUtil.dp2px(((Number) heightObj).doubleValue());
        }
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = TEXT_SHADOW_RADIUS, defaultType = HippyControllerProps.NUMBER, defaultNumber = 1.0f)
    public void setTextShadowRadius(float shadowRadius) {
        mShadowRadius = shadowRadius;
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = TEXT_SHADOW_COLOR, defaultType = HippyControllerProps.NUMBER,
            defaultNumber = TEXT_SHADOW_COLOR_DEFAULT)
    public void setTextShadowColor(int shadowColor) {
        mShadowColor = shadowColor;
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.LINE_HEIGHT, defaultType = HippyControllerProps.NUMBER)
    public void setLineHeight(int lineHeight) {
        mLineHeight = PixelUtil.dp2px(lineHeight);
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.LINE_SPACING_MULTIPLIER, defaultType = HippyControllerProps.NUMBER)
    public void setLineSpacingMultiplier(float lineSpacingMultiplier) {
        mLineSpacingMultiplier = lineSpacingMultiplier;
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.LINE_SPACING_EXTRA, defaultType = HippyControllerProps.NUMBER)
    public void setLineSpacingExtra(float lineSpacingExtra) {
        mLineSpacingExtra = PixelUtil.dp2px(lineSpacingExtra);
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.NUMBER_OF_LINES, defaultType = HippyControllerProps.NUMBER)
    public void setNumberOfLines(int numberOfLines) {
        mNumberOfLines = numberOfLines;
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.ELLIPSIZE_MODE, defaultType = HippyControllerProps.STRING)
    public void setEllipsizeMode(String mode) {
        if (TextUtils.equals(mode, mEllipsizeMode)) {
            return;
        }
        switch (mode) {
            case MODE_TAIL:
            case MODE_CLIP:
            case MODE_MIDDLE:
            case MODE_HEAD:
                mEllipsizeMode = mode;
                break;
            default:
                mEllipsizeMode = MODE_TAIL;
        }
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.BREAK_STRATEGY, defaultType = HippyControllerProps.STRING)
    public void setBreakStrategy(String strategy) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            return;
        }
        if (TextUtils.equals(strategy, mBreakStrategy)) {
            return;
        }
        switch (strategy) {
            case STRATEGY_SIMPLE:
            case STRATEGY_HIGH_QUALITY:
            case STRATEGY_BALANCED:
                mBreakStrategy = strategy;
                break;
            default:
                mBreakStrategy = STRATEGY_SIMPLE;
        }
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.TEXT_ALIGN, defaultType = HippyControllerProps.STRING,
            defaultString = TEXT_ALIGN_LEFT)
    public void setTextAlign(String align) {
        switch (align) {
            case TEXT_ALIGN_LEFT:
                mAlignment = Layout.Alignment.ALIGN_NORMAL;
                break;
            case TEXT_ALIGN_RIGHT:
                mAlignment = Layout.Alignment.ALIGN_OPPOSITE;
                break;
            case TEXT_ALIGN_CENTER:
                mAlignment = Layout.Alignment.ALIGN_CENTER;
                break;
            case TEXT_ALIGN_AUTO:
            case TEXT_ALIGN_JUSTIFY:
            default:
                mAlignment = I18nUtil.isRTL() ? Layout.Alignment.ALIGN_OPPOSITE
                        : Layout.Alignment.ALIGN_NORMAL;
        }
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = "text", defaultType = HippyControllerProps.STRING)
    public void setText(String text) {
        mText = text;
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = "enableScale", defaultType = HippyControllerProps.BOOLEAN)
    public void setEnableScale(boolean enable) {
        mEnableScale = enable;
    }

    private SpannableStringBuilder createSpan(@Nullable CharSequence text, boolean useChild) {
        if (text == null) {
            return new SpannableStringBuilder("");
        }
        SpannableStringBuilder spannable = new SpannableStringBuilder();
        List<SpanOperation> ops = new ArrayList<>();
        createSpanOperationImpl(ops, spannable, text, useChild);
        for (int i = ops.size() - 1; i >= 0; i--) {
            SpanOperation operation = ops.get(i);
            operation.execute(spannable);
        }
        return spannable;
    }

    protected SpannableStringBuilder createSpan(boolean useChild) {
        return createSpan(mText, useChild);
    }

    protected CharSequence getEmoticonText(@Nullable CharSequence text) {
        CharSequence emoticonText = null;
        if (mFontAdapter != null && !TextUtils.isEmpty(text)) {
            emoticonText = mFontAdapter.getEmoticonText(text, mFontSize);
        }
        return (emoticonText != null) ? emoticonText : text;
    }

    @Override
    protected void createSpanOperation(@NonNull List<SpanOperation> ops,
            @NonNull SpannableStringBuilder builder, boolean useChild) {
        createSpanOperationImpl(ops, builder, mText, useChild);
    }

    protected void createChildrenSpanOperation(@NonNull List<SpanOperation> ops,
            @NonNull SpannableStringBuilder builder) {
        for (int i = 0; i < getChildCount(); i++) {
            VirtualNode child = getChildAt(i);
            if (child != null) {
                child.createSpanOperation(ops, builder, true);
            }
        }
    }

    protected TextForegroundColorSpan createForegroundColorSpan(float opacity) {
        return new TextForegroundColorSpan(colorWithOpacity(mColor, opacity));
    }

    protected void createSpanOperationImpl(@NonNull List<SpanOperation> ops,
            @NonNull SpannableStringBuilder builder, @Nullable CharSequence text,
            boolean useChild) {
        int start = builder.length();
        builder.append(getEmoticonText(text));
        int end = builder.length();
        if (start < end) {
            if (mHasUnderlineTextDecoration || mHasLineThroughTextDecoration) {
                TextDecorationSpan span = new TextDecorationSpan(mHasUnderlineTextDecoration,
                        mHasLineThroughTextDecoration, mTextDecorationColor, mTextDecorationStyle);
                if (span.needSpecialDraw()) {
                    // inserting changes the position of SpanOperation that >= start, so it must be placed first
                    builder.insert(start, TEXT_DECORATION_MARK);
                    builder.append(TEXT_DECORATION_MARK);
                    ops.add(new SpanOperation(start, start + 1, new TextDecorationSpan.StartMark()));
                    ++start;
                    ++end;
                    ops.add(new SpanOperation(end, end + 1, new TextDecorationSpan.EndMark()));
                }
                ops.add(new SpanOperation(start, end, span, SpanOperation.PRIORITY_LOWEST));
            }
            String verticalAlign = getVerticalAlign();
            if (verticalAlign != null && !V_ALIGN_BASELINE.equals(verticalAlign)) {
                TextVerticalAlignSpan span = new TextVerticalAlignSpan(verticalAlign);
                ops.add(new SpanOperation(start, end, span, SpanOperation.PRIORITY_LOWEST));
            }
            float opacity = getFinalOpacity();
            ops.add(new SpanOperation(start, end, createForegroundColorSpan(opacity)));
            if (mBackgroundColor != Color.TRANSPARENT && mParent != null) {
                int color = colorWithOpacity(mBackgroundColor, opacity);
                if (color != Color.TRANSPARENT) {
                    ops.add(new SpanOperation(start, end, new BackgroundColorSpan(color)));
                }
            }
            if (mLetterSpacing != 0) {
                ops.add(new SpanOperation(start, end,
                        new TextLetterSpacingSpan(mLetterSpacing)));
            }
            int size = mFontSize;
            if (mFontAdapter != null && mEnableScale) {
                size = (int) (size * mFontAdapter.getFontScale());
            }
            ops.add(new SpanOperation(start, end, new AbsoluteSizeSpan(size)));
            ops.add(new SpanOperation(start, end, new TextStyleSpan(mItalic, mFontWeight, mFontFamily, mFontAdapter)));
            if (mShadowOffsetDx != 0 || mShadowOffsetDy != 0) {
                int color = colorWithOpacity(mShadowColor, opacity);
                if (color != Color.TRANSPARENT) {
                    ops.add(new SpanOperation(start, end,
                            new TextShadowSpan(mShadowOffsetDx, mShadowOffsetDy, mShadowRadius, color)));
                }
            }
            if (containGestureEvent()) {
                TextGestureSpan span = new TextGestureSpan(mId);
                span.addGestureTypes(mEventTypes);
                ops.add(new SpanOperation(start, end, span));
            }
        }
        if (useChild) {
            createChildrenSpanOperation(ops, builder);
        }
        // apply paragraph spans
        if (mParent == null) {
            int paragraphStart = 0;
            int paragraphEnd = builder.length();
            if (mLineHeight != 0 && mLineSpacingMultiplier == 1.0f && mLineSpacingExtra == 0) {
                float lh = mLineHeight;
                if (mFontAdapter != null && mEnableScale) {
                    lh = (lh * mFontAdapter.getFontScale());
                }
                ops.add(new SpanOperation(paragraphStart, paragraphEnd, new TextLineHeightSpan(lh)));
            }
            if (needLineMetrics(ops)) {
                ops.add(new SpanOperation(paragraphStart, paragraphEnd, new TextLineMetricsHelper()));
            }
        }
    }

    private boolean needLineMetrics(@NonNull List<SpanOperation> ops) {
        for (SpanOperation op : ops) {
            Object span = op.getSpan();
            if (span instanceof TextVerticalAlignSpan || span instanceof TextDecorationSpan.StartMark) {
                return true;
            }
        }
        return false;
    }

    public static int colorWithOpacity(int color, float opacity) {
        if (opacity >= 1) {
            return color;
        } else if (opacity > 0) {
            int alpha = (color >> 24) & 0xFF;
            return (Math.round(alpha * opacity) << 24) | (color & 0xFFFFFF);
        }
        return Color.TRANSPARENT;
    }

    protected float getLineSpacingMultiplier() {
        return mLineSpacingMultiplier <= 0 ? 1.0f : mLineSpacingMultiplier;
    }

    @NonNull
    protected Layout createLayout() {
        return createLayout(mLastLayoutWidth, FlexMeasureMode.EXACTLY);
    }

    @NonNull
    protected Layout createLayout(final float width, final FlexMeasureMode widthMode) {
        if (mSpanned == null || mDirty) {
            mSpanned = createSpan(true);
            mDirty = false;
        } else if (mLayout != null && width >= (mLastLayoutWidth - 1)
                && width <= (mLastLayoutWidth + 1)) {
            // If the property of text node no change, and the current layout width is equal
            // to the last measurement result, no need to create layout again.
            return mLayout;
        }
        final TextPaint textPaint = getTextPaint();
        Layout layout;
        BoringLayout.Metrics boring = BoringLayout.isBoring(mSpanned, textPaint);
        boolean unconstrainedWidth = (widthMode == FlexMeasureMode.UNDEFINED) || width < 0;
        if (boring != null && (unconstrainedWidth || boring.width <= width)) {
            layout = BoringLayout
                    .make(mSpanned, textPaint, boring.width, mAlignment,
                            getLineSpacingMultiplier(), mLineSpacingExtra, boring, true);
        } else {
            float desiredWidth = Layout.getDesiredWidth(mSpanned, textPaint);
            if (!unconstrainedWidth && (widthMode == FlexMeasureMode.EXACTLY
                    || desiredWidth > width)) {
                desiredWidth = width;
            }
            layout = buildStaticLayout(mSpanned, textPaint, (int) Math.ceil(desiredWidth));
            if (mNumberOfLines > 0 && layout.getLineCount() > mNumberOfLines) {
                int lastLineStart = layout.getLineStart(mNumberOfLines - 1);
                int lastLineEnd = layout.getLineEnd(mNumberOfLines - 1);
                if (lastLineStart < lastLineEnd) {
                    int measureWidth = (int) Math.ceil(unconstrainedWidth ? desiredWidth : width);
                    try {
                        layout = truncateLayoutWithNumberOfLine(layout, measureWidth, mNumberOfLines);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }
        }
        CharSequence layoutText = layout.getText();
        if (layoutText instanceof Spanned) {
            Spanned spanned = (Spanned) layoutText;
            TextLineMetricsHelper helper = getTextLineMetricsHelper(spanned);
            if (helper != null) {
                setTextLineMetricsHelper(spanned, TextVerticalAlignSpan.class, helper);
                setTextLineMetricsHelper(spanned, TextDecorationSpan.StartMark.class, helper);
                setTextLineMetricsHelper(spanned, TextDecorationSpan.class, helper);
                setTextLineMetricsHelper(spanned, TextDecorationSpan.EndMark.class, helper);
                setTextLineMetricsHelper(spanned, TextShadowSpan.class, helper);
            }
        }
        mLayout = layout;
        mLastLayoutWidth = layout.getWidth();
        return layout;
    }

    private TextLineMetricsHelper getTextLineMetricsHelper(Spanned spanned) {
        TextLineMetricsHelper[] spans = spanned.getSpans(0, 0, TextLineMetricsHelper.class);
        return spans != null && spans.length > 0 ? spans[0] : null;
    }

    private <T extends TextLineMetricsHelper.LineMetrics> void setTextLineMetricsHelper(Spanned spanned,
            Class<T> type, TextLineMetricsHelper helper) {
        T[] spans = spanned.getSpans(0, spanned.length(), type);
        if (spans != null) {
            for (T span : spans) {
                span.setLineMetrics(helper);
            }
        }
    }

    private TextPaint getTextPaint() {
        if (TextUtils.isEmpty(mSpanned)) {
            if (mTextPaintForEmpty == null) {
                mTextPaintForEmpty = new TextPaint(TextPaint.ANTI_ALIAS_FLAG);
            }
            return mTextPaintForEmpty;
        }
        if (mTextPaintInstance == null) {
            mTextPaintInstance = new TextPaint(TextPaint.ANTI_ALIAS_FLAG);
            mTextPaintInstance.setTextSize(mFontSize);
            mTextPaintInstance.setColor(mColor);
        }
        return mTextPaintInstance;
    }

    private StaticLayout buildStaticLayout(CharSequence source, TextPaint paint, int width) {
        Layout.Alignment alignment = mAlignment;
        if (I18nUtil.isRTL()) {
            BidiFormatter bidiFormatter = BidiFormatter.getInstance();
            if (bidiFormatter.isRtl(source.toString())
                    && mAlignment == Layout.Alignment.ALIGN_OPPOSITE) {
                alignment = Layout.Alignment.ALIGN_NORMAL;
            }
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return StaticLayout.Builder.obtain(source, 0, source.length(), paint, width)
                    .setAlignment(alignment)
                    .setLineSpacing(mLineSpacingExtra, getLineSpacingMultiplier())
                    .setIncludePad(true)
                    .setBreakStrategy(getBreakStrategy())
                    .build();
        } else {
            return new StaticLayout(source, paint, width, alignment, getLineSpacingMultiplier(),
                    mLineSpacingExtra, true);
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.M)
    private int getBreakStrategy() {
        final String strategy = mBreakStrategy;
        switch (strategy) {
            case STRATEGY_HIGH_QUALITY:
                return Layout.BREAK_STRATEGY_HIGH_QUALITY;
            case STRATEGY_BALANCED:
                return Layout.BREAK_STRATEGY_BALANCED;
            case STRATEGY_SIMPLE:
            default:
                return Layout.BREAK_STRATEGY_SIMPLE;
        }
    }

    private StaticLayout truncateLayoutWithNumberOfLine(Layout preLayout, int width,
            int numberOfLines) {
        int lineCount = preLayout.getLineCount();
        assert lineCount >= 2;
        CharSequence origin = preLayout.getText();
        TextPaint paint = preLayout.getPaint();

        CharSequence truncated;
        if (MODE_CLIP.equals(mEllipsizeMode)) {
            int end = preLayout.getLineEnd(numberOfLines - 1);
            if (origin.charAt(end - 1) == '\n') {
                // there will be an unexpected blank line, if ends with a new line char, trim it
                --end;
            }
            truncated = origin.subSequence(0, end);
        } else {
            TextPaint measurePaint = new TextPaint();
            measurePaint.set(paint);
            int start = preLayout.getLineStart(numberOfLines - 1);
            CharSequence formerLines;
            if (start > 0) {
                boolean newline = origin.charAt(start - 1) != '\n';
                if (origin instanceof Spanned) {
                    formerLines = new SpannableStringBuilder().append(origin, 0, start);
                    if (newline) {
                        ((SpannableStringBuilder) formerLines).append('\n');
                    }
                } else {
                    formerLines = new StringBuilder().append(origin, 0, start);
                    if (newline) {
                        ((StringBuilder) formerLines).append('\n');
                    }
                }
            } else {
                formerLines = null;
            }
            CharSequence lastLine;
            if (MODE_HEAD.equals(mEllipsizeMode)) {
                lastLine = ellipsizeHead(origin, measurePaint, width, preLayout.getLineStart(lineCount - 2));
            } else if (MODE_MIDDLE.equals(mEllipsizeMode)) {
                lastLine = ellipsizeMiddle(origin, measurePaint, width, start, preLayout.getLineEnd(numberOfLines),
                        preLayout.getLineStart(lineCount - 2));
            } else /*if (MODE_TAIL.equals(mEllipsizeMode))*/ {
                lastLine = ellipsizeTail(origin, measurePaint, width, start, preLayout.getLineEnd(numberOfLines));
            }
            // concat everything
            truncated = formerLines == null ? lastLine
                    : formerLines instanceof SpannableStringBuilder
                            ? ((SpannableStringBuilder) formerLines).append(lastLine)
                            : ((StringBuilder) formerLines).append(lastLine);
        }

        return buildStaticLayout(truncated, paint, width);
    }

    private float chooseTextSize(float inherit, CharSequence text) {
        float size = inherit;
        if (text instanceof Spanned) {
            AbsoluteSizeSpan[] spans = ((Spanned) text).getSpans(0, text.length(), AbsoluteSizeSpan.class);
            if (spans != null && spans.length > 0) {
                TextPaint tmp = new TextPaint();
                tmp.setTextSize(size);
                for (AbsoluteSizeSpan span : spans) {
                    span.updateMeasureState(tmp);
                    size = Math.max(size, tmp.getTextSize());
                }
            }
        }
        return size;
    }

    private CharSequence ellipsizeHead(CharSequence origin, TextPaint paint, int width, int start) {
        int index = TextUtils.lastIndexOf(origin, '\n', start, origin.length() - 1);
        if (index != -1) {
            start = index + 1;
        }
        // "…${last line of the rest part}"
        CharSequence tmp;
        if (origin instanceof Spanned) {
            tmp = new SpannableStringBuilder()
                    .append(ELLIPSIS)
                    .append(origin, start, origin.length());
        } else {
            tmp = new StringBuilder(ELLIPSIS.length() + origin.length() - start)
                    .append(ELLIPSIS)
                    .append(origin, start, origin.length());
        }
        paint.setTextSize(chooseTextSize(paint.getTextSize(), tmp));
        CharSequence result = TextUtils.ellipsize(tmp, paint, width, TextUtils.TruncateAt.START);
        if (result instanceof Spannable) {
            // make spans cover the "…"
            Spannable sp = (Spannable) result;
            int spanStart = ELLIPSIS.length();
            Object[] spans = sp.getSpans(spanStart, spanStart, Object.class);
            for (Object span : spans) {
                if (!(span instanceof ImageSpan) && sp.getSpanStart(span) == spanStart) {
                    int flag = sp.getSpanFlags(span);
                    int spanEnd = sp.getSpanEnd(span);
                    sp.removeSpan(span);
                    sp.setSpan(span, 0, spanEnd, flag);
                }
            }
        }
        return result;
    }

    private CharSequence ellipsizeMiddle(CharSequence origin, TextPaint paint, int width,
            int start, int leftEnd, int rightStart) {
        int index = TextUtils.indexOf(origin, '\n', start, leftEnd);
        if (index != -1) {
            leftEnd = index;
        }
        index = TextUtils.lastIndexOf(origin, '\n', rightStart, origin.length() - 1);
        if (index != -1) {
            rightStart = index + 1;
        }
        if (leftEnd < rightStart) {
            // "${first line of the rest part}…${last line of the rest part}"
            CharSequence tmp;
            if (origin instanceof Spanned) {
                tmp = new SpannableStringBuilder()
                        .append(origin, start, leftEnd)
                        .append(ELLIPSIS)
                        .append(origin, rightStart, origin.length());
            } else {
                int len = leftEnd - start + ELLIPSIS.length() + origin.length() - rightStart;
                tmp = new StringBuilder(len)
                        .append(origin, start, leftEnd)
                        .append(ELLIPSIS)
                        .append(origin, rightStart, origin.length());
            }
            final int[] outRange = new int[2];
            TextUtils.EllipsizeCallback callback = new TextUtils.EllipsizeCallback() {
                @Override
                public void ellipsized(int l, int r) {
                    outRange[0] = l;
                    outRange[1] = r;
                }
            };
            paint.setTextSize(chooseTextSize(paint.getTextSize(), tmp));
            CharSequence line = TextUtils.ellipsize(tmp, paint, width, TextUtils.TruncateAt.MIDDLE,
                    false, callback);
            if (line != tmp) {
                int pos0 = leftEnd - start;
                int pos1 = pos0 + ELLIPSIS.length();
                if (outRange[0] > pos0) {
                    line = tmp instanceof SpannableStringBuilder
                            ? ((SpannableStringBuilder) tmp).replace(pos0, outRange[1], ELLIPSIS)
                            : ((StringBuilder) tmp).replace(pos0, outRange[1], ELLIPSIS);
                } else if (outRange[1] < pos1) {
                    line = tmp instanceof SpannableStringBuilder
                            ? ((SpannableStringBuilder) tmp).replace(outRange[0], pos1, ELLIPSIS)
                            : ((StringBuilder) tmp).replace(outRange[0], pos1, ELLIPSIS);
                }
            }
            return line;
        } else {
            // "${only one line of the rest part}"
            CharSequence tmp = origin.subSequence(start, origin.length());
            paint.setTextSize(chooseTextSize(paint.getTextSize(), tmp));
            return TextUtils.ellipsize(tmp, paint, width, TextUtils.TruncateAt.MIDDLE);
        }
    }

    private CharSequence ellipsizeTail(CharSequence origin, TextPaint paint, int width, int start,
            int end) {
        int index = TextUtils.indexOf(origin, '\n', start, end);
        if (index != -1) {
            end = index;
        }
        // "${first line of the rest part}…"
        CharSequence tmp;
        if (origin instanceof Spanned) {
            tmp = new SpannableStringBuilder()
                    .append(origin, start, end).append(ELLIPSIS);
        } else {
            tmp = new StringBuilder(end - start + ELLIPSIS.length())
                    .append(origin, start, end).append(ELLIPSIS);
        }
        paint.setTextSize(chooseTextSize(paint.getTextSize(), tmp));
        return TextUtils.ellipsize(tmp, paint, width, TextUtils.TruncateAt.END);
    }

    @HippyControllerProps(name = NodeProps.BACKGROUND_COLOR, defaultType = HippyControllerProps.NUMBER)
    public void setBackgroundColor(int backgroundColor) {
        mBackgroundColor = backgroundColor;
        markDirty();
    }

    @HippyControllerProps(name = NodeProps.VERTICAL_ALIGN, defaultType = HippyControllerProps.STRING)
    public void setVerticalAlign(String align) {
        super.setVerticalAlign(align);
    }

    @HippyControllerProps(name = NodeProps.OPACITY, defaultType = HippyControllerProps.NUMBER, defaultNumber = 1f)
    public void setOpacity(float opacity) {
        // top-level opacity will be handled by HippyViewController, so only sub-level opacity needs to be considered
        if (mParent != null) {
            super.setOpacity(opacity);
        }
    }

}
