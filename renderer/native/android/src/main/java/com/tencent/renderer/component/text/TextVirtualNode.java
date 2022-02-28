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
import android.text.style.StrikethroughSpan;
import android.text.style.UnderlineSpan;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.link_supplier.proxy.framework.FontAdapter;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.utils.I18nUtil;
import com.tencent.mtt.hippy.utils.PixelUtil;

import com.tencent.renderer.NativeRender;
import com.tencent.renderer.utils.FlexUtils.FlexMeasureMode;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TextVirtualNode extends VirtualNode {

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
    protected float mLineSpacingMultiplier = 1.0f;
    protected float mLineSpacingExtra;
    private float mLetterSpacing;
    private float mLastLayoutWidth = 0.0f;
    private boolean mHasUnderlineTextDecoration = false;
    private boolean mHasLineThroughTextDecoration = false;
    private boolean mEnableScale = false;
    @Nullable
    private String mFontFamily;
    @Nullable
    private SpannableStringBuilder mSpanned;
    @Nullable
    private CharSequence mText;
    private Layout.Alignment mAlignment = Layout.Alignment.ALIGN_NORMAL;
    @Nullable
    private TextPaint mTextPaint;
    @Nullable
    private final FontAdapter mFontAdapter;
    @Nullable
    private Layout mLayout;
    // Can only be accessed inside sdk.
    @Nullable
    Map<String, Object> mUnusedProps;

    public TextVirtualNode(int id, int pid, int index, @NonNull NativeRender nativeRender) {
        super(id, pid, index);
        mFontAdapter = nativeRender.getFontAdapter();
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

    @SuppressWarnings({"unused", "rawtypes"})
    @HippyControllerProps(name = TEXT_SHADOW_OFFSET, defaultType = HippyControllerProps.MAP)
    public void textShadowOffset(HashMap offsetMap) {
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
    @HippyControllerProps(name = NodeProps.LINE_SPACING_MULTIPLIER, defaultType = HippyControllerProps.NUMBER)
    public void lineSpacingMultiplier(float lineSpacingMultiplier) {
        mLineSpacingMultiplier = lineSpacingMultiplier;
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.LINE_SPACING_EXTRA, defaultType = HippyControllerProps.NUMBER)
    public void lineSpacingExtra(float lineSpacingExtra) {
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

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.BORDER_RADIUS, defaultType = HippyControllerProps.NUMBER)
    public void setBorderRadius(float borderRadius) {
        addUnusedProps(NodeProps.BORDER_RADIUS, borderRadius);
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.BORDER_WIDTH, defaultType = HippyControllerProps.NUMBER)
    public void setBorderWidth(float borderWidth) {
        addUnusedProps(NodeProps.BORDER_WIDTH, borderWidth);
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.BORDER_LEFT_WIDTH, defaultType = HippyControllerProps.NUMBER)
    public void setLeftBorderWidth(float leftWidth) {
        addUnusedProps(NodeProps.BORDER_LEFT_WIDTH, leftWidth);
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.BORDER_TOP_WIDTH, defaultType = HippyControllerProps.NUMBER)
    public void setTopBorderWidth(float topWidth) {
        addUnusedProps(NodeProps.BORDER_LEFT_WIDTH, topWidth);
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.BORDER_RIGHT_WIDTH, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
    public void setRightBorderWidth(float rightWidth) {
        addUnusedProps(NodeProps.BORDER_RIGHT_WIDTH, rightWidth);
    }

    @HippyControllerProps(name = NodeProps.BORDER_BOTTOM_WIDTH, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
    public void setBottomBorderWidth(float bottomWidth) {
        addUnusedProps(NodeProps.BORDER_BOTTOM_WIDTH, bottomWidth);
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.BORDER_COLOR, defaultType = HippyControllerProps.NUMBER, defaultNumber = Color.TRANSPARENT)
    public void setBorderColor(int borderColor) {
        addUnusedProps(NodeProps.BORDER_COLOR, borderColor);
    }

    private void addUnusedProps(@NonNull String key, @NonNull Object value) {
        // Only top level text node need set unused props to render node.
        if (mParent != null) {
            return;
        }
        if (mUnusedProps == null) {
            mUnusedProps = new HashMap<>();
        }
        mUnusedProps.put(key, value);
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
                // Only support nest one level, do not recurse check grandson node
                // so we should set useChild to false here
                child.createSpanOperation(ops, builder, false);
            }
        }
    }

    protected TextForegroundColorSpan createForegroundColorSpan() {
        return new TextForegroundColorSpan(mColor);
    }

    protected void createSpanOperationImpl(@NonNull List<SpanOperation> ops,
            @NonNull SpannableStringBuilder builder, @Nullable CharSequence text,
            boolean useChild) {
        int start = builder.length();
        builder.append(getEmoticonText(text));
        int end = builder.length();
        if (start > end) {
            return;
        }
        ops.add(new SpanOperation(start, end, createForegroundColorSpan()));
        if (mLetterSpacing != 0 && Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            ops.add(new SpanOperation(start, end,
                    new TextLetterSpacingSpan(mLetterSpacing)));
        }
        int size = mFontSize;
        if (mFontAdapter != null && mEnableScale) {
            size = (int) (size * mFontAdapter.getFontScale());
        }
        ops.add(new SpanOperation(start, end, new AbsoluteSizeSpan(size)));
        ops.add(new SpanOperation(start, end,
                new TextStyleSpan(mFontStyle, mFontWeight, mFontFamily, mFontAdapter)));
        if (mHasUnderlineTextDecoration) {
            ops.add(new SpanOperation(start, end, new UnderlineSpan()));
        }
        if (mHasLineThroughTextDecoration) {
            ops.add(new SpanOperation(start, end, new StrikethroughSpan()));
        }
        if (mShadowOffsetDx != 0 || mShadowOffsetDy != 0) {
            ops.add(new SpanOperation(start, end,
                    new TextShadowSpan(mShadowOffsetDx, mShadowOffsetDy, mShadowRadius,
                            mShadowColor)));
        }
        if (mLineHeight != 0 && mLineSpacingMultiplier == 1.0f && mLineSpacingExtra == 0) {
            float lh = mLineHeight;
            if (mFontAdapter != null && mEnableScale) {
                lh = (lh * mFontAdapter.getFontScale());
            }
            ops.add(new SpanOperation(start, end, new TextLineHeightSpan(lh)));
        }
        if (mGestureTypes != null && mGestureTypes.size() > 0) {
            TextGestureSpan span = new TextGestureSpan(mId);
            span.addGestureTypes(mGestureTypes);
            ops.add(new SpanOperation(start, end, span));
        }
        if (useChild) {
            createChildrenSpanOperation(ops, builder);
        }
    }

    protected float getLineSpacingMultiplier() {
        return mLineSpacingMultiplier <= 0 ? 1.0f : mLineSpacingMultiplier;
    }

    public Layout createLayout(final float width, final FlexMeasureMode widthMode) {
        if (mTextPaint == null) {
            mTextPaint = new TextPaint(TextPaint.ANTI_ALIAS_FLAG);
        }
        if (mSpanned == null || mDirty) {
            mSpanned = createSpan(true);
            mDirty = false;
        } else if (mLayout != null && width > 0 && mLastLayoutWidth == width) {
            // If the property of text node no change, and the measure width same as last time,
            // no need to create layout again.
            return mLayout;
        }
        Layout layout;
        BoringLayout.Metrics boring = BoringLayout.isBoring(mSpanned, mTextPaint);
        float desiredWidth = Layout.getDesiredWidth(mSpanned, mTextPaint);
        boolean unconstrainedWidth = (widthMode == FlexMeasureMode.UNDEFINED) || width < 0;
        if (boring != null && (unconstrainedWidth || boring.width <= width)) {
            layout = BoringLayout
                    .make(mSpanned, mTextPaint, boring.width, mAlignment,
                            getLineSpacingMultiplier(), mLineSpacingExtra, boring, true);
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
        mLayout = layout;
        mLastLayoutWidth = layout.getWidth();
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
        return new StaticLayout(source, mTextPaint, width, alignment, getLineSpacingMultiplier(),
                mLineSpacingExtra, true);
    }

    @NonNull
    private StaticLayout createLayoutWithNumberOfLine(int lastLineStart, int width) {
        String text = (mSpanned == null) ? "" : mSpanned.toString();
        SpannableStringBuilder builder = (SpannableStringBuilder) mSpanned
                .subSequence(0, text.length());
        String ellipsizeStr = (String) TextUtils
                .ellipsize(text.substring(lastLineStart), mTextPaint, width,
                        TextUtils.TruncateAt.END);
        String tempStr =
                text.subSequence(0, lastLineStart) + truncate(ellipsizeStr, width);
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

    protected String truncate(@Nullable String source, int width) {
        String result = "";
        if (source == null) {
            return result;
        }
        for (int i = source.length(); i > 0; i--) {
            int endIndex = i > 1 ? i - 1 : i;
            String builder = source.substring(0, endIndex) + ELLIPSIS;
            Spanned spanned = createSpan(builder, false);
            StaticLayout layout = buildStaticLayout(spanned, width);
            if (layout.getLineCount() <= 1) {
                result = spanned.toString();
                break;
            }
        }
        return result;
    }
}
