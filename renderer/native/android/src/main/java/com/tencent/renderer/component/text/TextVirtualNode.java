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

import static com.tencent.mtt.hippy.dom.node.NodeProps.TEXT_SHADOW_COLOR;
import static com.tencent.mtt.hippy.dom.node.NodeProps.TEXT_SHADOW_OFFSET;
import static com.tencent.mtt.hippy.dom.node.NodeProps.TEXT_SHADOW_RADIUS;

import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Build;
import android.text.BidiFormatter;
import android.text.BoringLayout;
import android.text.Layout;
import android.text.SpannableStringBuilder;
import android.text.Spanned;
import android.text.StaticLayout;
import android.text.TextPaint;
import android.text.TextUtils;
import android.text.style.AbsoluteSizeSpan;
import android.text.style.CharacterStyle;
import android.text.style.ForegroundColorSpan;
import android.text.style.StrikethroughSpan;
import android.text.style.UnderlineSpan;
import com.tencent.mtt.hippy.adapter.font.HippyFontScaleAdapter;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.dom.flex.FlexMeasureMode;
import com.tencent.mtt.hippy.dom.flex.FlexSpacing;
import com.tencent.mtt.hippy.dom.node.HippyLetterSpacingSpan;
import com.tencent.mtt.hippy.dom.node.HippyLineHeightSpan;
import com.tencent.mtt.hippy.dom.node.HippyShadowSpan;
import com.tencent.mtt.hippy.dom.node.HippyStyleSpan;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.utils.I18nUtil;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class TextVirtualNode extends VirtualNode {

    private static final String TAG = "TextVirtualNode";
    private static final int TEXT_BOLD_MIN_VALUE = 500;
    private static final int TEXT_SHADOW_COLOR_DEFAULT = 0x55000000;
    private static final String TEXT_FONT_STYLE_ITALIC = "italic";
    private static final String TEXT_FONT_STYLE_BOLD = "bold";
    private static final String TEXT_DECORATION_UNDERLINE = "underline";
    private static final String TEXT_DECORATION_LINE_THROUGH = "line-through";
    private static final String TEXT_ALIGN_LEFT = "left";
    private static final String TEXT_ALIGN_AUTO = "auto";
    private static final String TEXT_ALIGN_JUSTIFY = "justify";
    private static final String TEXT_ALIGN_RIGHT = "right";
    private static final String TEXT_ALIGN_CENTER = "center";
    private static final String ELLIPSIS = "\u2026";

    private int mStart;
    private int mEnd;
    private int mColor = Color.BLACK;
    private int mNumberOfLines;
    private int mFontStyle = Typeface.NORMAL;
    private int mFontWeight = Typeface.NORMAL;
    private int mFontSize = (int) Math.ceil(PixelUtil.dp2px(NodeProps.FONT_SIZE_SP));
    private int mShadowColor = TEXT_SHADOW_COLOR_DEFAULT;
    private float mShadowOffsetDx = 0.0f;
    private float mShadowOffsetDy = 0.0f;
    private float mShadowRadius = 1.0f;
    private float mLineHeight;
    private float mLetterSpacing;
    private float mLeftPadding;
    private float mBottomPadding;
    private float mTopPadding;
    private float mRightPadding;
    private boolean mHasUnderlineTextDecoration = false;
    private boolean mHasLineThroughTextDecoration = false;
    private boolean mEnableScale = false;
    private String mFontFamily = null;
    private SpannableStringBuilder mSpanned = null;
    private CharSequence mText;
    private Layout.Alignment mAlignment = Layout.Alignment.ALIGN_NORMAL;
    private final TextUtils.TruncateAt mTruncateAt = TextUtils.TruncateAt.END;
    private TextPaint mTextPaint = null;
    private Layout mLayout = null;
    private ArrayList<String> mGestureTypes = null;
    private HippyFontScaleAdapter mFontAdapter;

    public TextVirtualNode(int id, int pid, int index, HippyFontScaleAdapter fontAdapter) {
        super(id, pid, index);
        mFontAdapter = fontAdapter;
        if (I18nUtil.isRTL()) {
            mAlignment = Layout.Alignment.ALIGN_OPPOSITE;
        }
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.FONT_STYLE, defaultType = HippyControllerProps.STRING)
    public void fontStyle(String style) {
        if (TEXT_FONT_STYLE_ITALIC.equals(style)) {
            mFontStyle = Typeface.ITALIC;
        } else {
            mFontStyle = Typeface.NORMAL;
        }
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.LETTER_SPACING, defaultType = HippyControllerProps.NUMBER)
    public void letterSpacing(float spacing) {
        mLetterSpacing = PixelUtil.dp2px(spacing);
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.COLOR, defaultType = HippyControllerProps.NUMBER, defaultNumber = Color.BLACK)
    public void color(Integer color) {
        mColor = color;
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.FONT_SIZE, defaultType = HippyControllerProps.NUMBER, defaultNumber = NodeProps.FONT_SIZE_SP)
    public void fontSize(float size) {
        mFontSize = (int) Math.ceil(PixelUtil.dp2px(size));
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.FONT_FAMILY, defaultType = HippyControllerProps.STRING)
    public void fontFamily(String family) {
        mFontFamily = family;
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.FONT_WEIGHT, defaultType = HippyControllerProps.STRING)
    public void fontWeight(String weight) {
        int fontWeight = 0;
        if (!TextUtils.isEmpty(weight) && weight.length() == 3
                && weight.endsWith("00")
                && weight.charAt(0) <= '9'
                && weight.charAt(0) >= '1') {
            fontWeight = 100 * (weight.charAt(0) - '0');
        }
        if (fontWeight >= TEXT_BOLD_MIN_VALUE || TEXT_FONT_STYLE_BOLD.equals(weight)) {
            mFontWeight = Typeface.BOLD;
        } else {
            mFontWeight = Typeface.NORMAL;
        }
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.TEXT_DECORATION_LINE, defaultType = HippyControllerProps.STRING)
    public void textDecorationLine(String textDecorationLine) {
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
    @HippyControllerProps(name = TEXT_SHADOW_OFFSET)
    public void textShadowOffset(HashMap offsetMap) {
        mShadowOffsetDx = 0.0f;
        mShadowOffsetDy = 0.0f;
        if (offsetMap == null) {
            return;
        }
        try {
            Object widthObj = offsetMap.get(NodeProps.WIDTH);
            Object heightObj = offsetMap.get(NodeProps.HEIGHT);
            mShadowOffsetDx = PixelUtil.dp2px(((Number) widthObj).doubleValue());
            mShadowOffsetDy = PixelUtil.dp2px(((Number) heightObj).doubleValue());
        } catch (Exception ignored) {
            LogUtils.d(TAG, "textShadowOffset: " + ignored.getMessage());
        }
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = TEXT_SHADOW_RADIUS, defaultType = HippyControllerProps.NUMBER, defaultNumber = 1.0f)
    public void textShadowRadius(float shadowRadius) {
        mShadowRadius = shadowRadius;
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = TEXT_SHADOW_COLOR, defaultType = HippyControllerProps.NUMBER, defaultNumber = TEXT_SHADOW_COLOR_DEFAULT)
    public void setTextShadowColor(int shadowColor) {
        mShadowColor = shadowColor;
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.LINE_HEIGHT, defaultType = HippyControllerProps.NUMBER)
    public void lineHeight(int lineHeight) {
        mLineHeight = PixelUtil.dp2px(lineHeight);
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.NUMBER_OF_LINES, defaultType = HippyControllerProps.NUMBER)
    public void setNumberOfLines(int numberOfLines) {
        mNumberOfLines = numberOfLines;
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.TEXT_ALIGN, defaultType = HippyControllerProps.STRING, defaultString = TEXT_ALIGN_LEFT)
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
    public void text(String text) {
        mText = text;
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = "enableScale", defaultType = HippyControllerProps.BOOLEAN)
    public void enableScale(boolean enable) {
        mEnableScale = enable;
    }

    public void setPadding(float leftPadding, float topPadding, float rightPadding,
            float bottomPadding) {
        mLeftPadding = leftPadding;
        mTopPadding = topPadding;
        mRightPadding = rightPadding;
        mBottomPadding = bottomPadding;
    }

    private SpannableStringBuilder createSpan(CharSequence text, boolean useChild) {
        if (TextUtils.isEmpty(text)) {
            return new SpannableStringBuilder("");
        }
        SpannableStringBuilder spannable = new SpannableStringBuilder();
        List<SpanOperation> ops = new ArrayList<>();
        createSpanOperation(ops, spannable, useChild);
        for (int i = ops.size() - 1; i >= 0; i--) {
            SpanOperation operation = ops.get(i);
            operation.execute(spannable);
        }
        return spannable;
    }

    private SpannableStringBuilder createSpan(boolean useChild) {
        return createSpan(mSpanned, useChild);
    }

    private CharSequence getEmoticonText() {
        CharSequence emoticonText = null;
        if (mFontAdapter != null && !TextUtils.isEmpty(mText)) {
            emoticonText = mFontAdapter.getEmoticonText(mText, mFontSize);
        }
        return (emoticonText != null) ? emoticonText : mText;
    }

    @Override
    protected void createSpanOperation(List<SpanOperation> ops, SpannableStringBuilder builder,
            boolean useChild) {
        mStart = builder.length();
        builder.append(getEmoticonText());
        mEnd = builder.length();
        if (mStart > mEnd) {
            return;
        }
        ops.add(new SpanOperation(mStart, mEnd, new ForegroundColorSpan(mColor)));
        if (mLetterSpacing != 0 && Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            ops.add(new SpanOperation(mStart, mEnd,
                    new HippyLetterSpacingSpan(mLetterSpacing)));
        }
        int size = mFontSize;
        if (mFontAdapter != null && mEnableScale) {
            size = (int) (size * mFontAdapter.getFontScale());
        }
        ops.add(new SpanOperation(mStart, mEnd, new AbsoluteSizeSpan(size)));
        ops.add(new SpanOperation(mStart, mEnd,
                new HippyStyleSpan(mFontStyle, mFontWeight, mFontFamily, mFontAdapter)));
        if (mHasUnderlineTextDecoration) {
            ops.add(new SpanOperation(mStart, mEnd, new UnderlineSpan()));
        }
        if (mHasLineThroughTextDecoration) {
            ops.add(new SpanOperation(mStart, mEnd, new StrikethroughSpan()));
        }
        if (mShadowOffsetDx != 0 || mShadowOffsetDy != 0) {
            ops.add(new SpanOperation(mStart, mEnd,
                    new HippyShadowSpan(mShadowOffsetDx, mShadowOffsetDy, mShadowRadius,
                            mShadowColor)));
        }
        if (mLineHeight != 0) {
            float lh = mLineHeight;
            if (mFontAdapter != null && mEnableScale) {
                lh = (lh * mFontAdapter.getFontScale());
            }
            ops.add(new SpanOperation(mStart, mEnd, new HippyLineHeightSpan(lh)));
        }
        if (!useChild) {
            return;
        }
        for (int i = 0; i < getChildCount(); i++) {
            VirtualNode child = getChildAt(i);
            // Only support nest one level, do not recurse check grandson node
            // so we should set useChild to false here
            child.createSpanOperation(ops, builder, false);
        }
    }

    public void updateLayout(float width) {
        mLayout = createLayout(width - mLeftPadding - mRightPadding, FlexMeasureMode.EXACTLY);
    }

    public Layout createLayout(float width, FlexMeasureMode widthMode) {
        if (mTextPaint == null) {
            mTextPaint = new TextPaint(TextPaint.ANTI_ALIAS_FLAG);
        }
        if (mSpanned == null || mDirty) {
            mSpanned = createSpan(true);
        }
        Layout layout;
        BoringLayout.Metrics boring = null;
        try {
            boring = BoringLayout.isBoring(mSpanned, mTextPaint);
        } catch (Throwable ignored) {
            LogUtils.e(TAG, "createLayout: " + ignored.getMessage());
        }
        float desiredWidth = Layout.getDesiredWidth(mSpanned, mTextPaint);
        boolean unconstrainedWidth = (widthMode == FlexMeasureMode.UNDEFINED) || width < 0;
        if (boring != null && (unconstrainedWidth || boring.width <= width)) {
            layout = BoringLayout
                    .make(mSpanned, mTextPaint, boring.width, mAlignment, 1.f, 0.f, boring, true);
        } else {
            if (!unconstrainedWidth && desiredWidth > width) {
                desiredWidth = width;
            }
            layout = buildStaticLayout(mSpanned, (int) Math.ceil(desiredWidth));
        }
        if (mNumberOfLines > 0 && layout.getLineCount() > mNumberOfLines) {
            int lastLineStart = layout.getLineStart(mNumberOfLines - 1);
            int lastLineEnd = layout.getLineEnd(mNumberOfLines - 1);
            if (lastLineStart < lastLineEnd) {
                layout = createLayoutWithNumberOfLine(lastLineStart, layout.getWidth());
            }
        }
        layout.getPaint().setTextSize(mFontSize);
        return layout;
    }

    private StaticLayout buildStaticLayout(CharSequence source, int width) {
        Layout.Alignment alignment = mAlignment;
        if (I18nUtil.isRTL()) {
            BidiFormatter bidiFormatter = BidiFormatter.getInstance();
            if (bidiFormatter.isRtl(source.toString())
                    && mAlignment == Layout.Alignment.ALIGN_OPPOSITE) {
                alignment = Layout.Alignment.ALIGN_NORMAL;
            }
        }
        return new StaticLayout(source, mTextPaint, width, alignment, 1.f, 0.f,
                true);
    }

    private StaticLayout createLayoutWithNumberOfLine(int lastLineStart, int width) {
        String text = mSpanned.toString();
        SpannableStringBuilder builder = (SpannableStringBuilder) mSpanned
                .subSequence(0, text.length());
        String ellipsizeStr = (String) TextUtils
                .ellipsize(text.substring(lastLineStart), mTextPaint, width,
                        TextUtils.TruncateAt.END);
        String tempStr =
                text.subSequence(0, lastLineStart).toString() + truncate(ellipsizeStr, width);
        int start = Math.max(tempStr.length() - 1, 0);
        CharacterStyle[] spans = builder.getSpans(start, text.length(), CharacterStyle.class);
        if (spans != null && spans.length > 0) {
            for (CharacterStyle span : spans) {
                if (builder.getSpanStart(span) >= start) {
                    builder.removeSpan(span);
                }
            }
        }
        return buildStaticLayout(builder.replace(start, text.length(), ELLIPSIS), width);
    }

    private String truncate(String source, int width) {
        String result = "";
        if (TextUtils.isEmpty(source)) {
            return result;
        }
        for (int i = source.length(); i > 0; i--) {
            StringBuilder builder = new StringBuilder(i + 1);
            if (mTruncateAt != null) {
                builder.append(source, 0, i > 1 ? i - 1 : i);
                builder.append(ELLIPSIS);
            } else {
                builder.append(source, 0, i);
            }
            Spanned spanned = createSpan(builder.toString(), false);
            StaticLayout layout = buildStaticLayout(spanned, width);
            if (layout.getLineCount() <= 1) {
                result = spanned.toString();
                break;
            }
        }
        return result;
    }
}
