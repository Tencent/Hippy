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
    private static final String ELLIPSIS = "...";

    protected int mColor = Color.BLACK;
    protected int mNumberOfLines;
    protected int mFontStyle = Typeface.NORMAL;
    protected int mFontWeight = Typeface.NORMAL;
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
    protected boolean mEnableScale = false;
    @Nullable
    protected String mFontFamily;
    @Nullable
    protected SpannableStringBuilder mSpanned;
    @Nullable
    protected CharSequence mText;
    protected Layout.Alignment mAlignment = Layout.Alignment.ALIGN_NORMAL;
    @Nullable
    protected TextPaint mTextPaint;
    @Nullable
    protected final FontAdapter mFontAdapter;
    @Nullable
    protected Layout mLayout;
    @Nullable
    protected Map<String, Object> mUnusedProps;

    public TextVirtualNode(int id, int pid, int index, @NonNull NativeRender nativeRender) {
        super(id, pid, index);
        mFontAdapter = nativeRender.getFontAdapter();
        if (I18nUtil.isRTL()) {
            mAlignment = Layout.Alignment.ALIGN_OPPOSITE;
        }
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.FONT_STYLE, defaultType = HippyControllerProps.STRING)
    public void setFontStyle(String style) {
        if (TEXT_FONT_STYLE_ITALIC.equals(style)) {
            mFontStyle = Typeface.ITALIC;
        } else {
            mFontStyle = Typeface.NORMAL;
        }
        markDirty();
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
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.FONT_SIZE, defaultType = HippyControllerProps.NUMBER,
            defaultNumber = NodeProps.FONT_SIZE_SP)
    public void setFontSize(float size) {
        mFontSize = (int) Math.ceil(PixelUtil.dp2px(size));
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.FONT_FAMILY, defaultType = HippyControllerProps.STRING)
    public void setFontFamily(String family) {
        mFontFamily = family;
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.FONT_WEIGHT, defaultType = HippyControllerProps.STRING)
    public void setFontWeight(String weight) {
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

    public void addUnusedProps(@NonNull String key, @Nullable Object value) {
        // Only top level text node need to reserved unused attributes.
        if (mParent != null) {
            return;
        }
        if (mUnusedProps == null) {
            mUnusedProps = new HashMap<>();
        }
        mUnusedProps.put(key, value);
    }

    public void resetProps(@NonNull Map<String, Object> props) {
        props.clear();
        if (mUnusedProps != null) {
            props.putAll(mUnusedProps);
            mUnusedProps.clear();
        }
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

    @NonNull
    protected Layout createLayout() {
        return createLayout(mLastLayoutWidth, FlexMeasureMode.EXACTLY);
    }

    @NonNull
    protected Layout createLayout(final float width, final FlexMeasureMode widthMode) {
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
                try {
                    layout = createLayoutWithNumberOfLine(lastLineEnd, layout.getWidth());
                } catch (Exception e) {
                    e.printStackTrace();
                }
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
    private StaticLayout createLayoutWithNumberOfLine(int lastLineEnd, int width) {
        String text = (mSpanned == null) ? "" : mSpanned.toString();
        SpannableStringBuilder builder = (SpannableStringBuilder) mSpanned
                .subSequence(0, text.length());
        int last = lastLineEnd > ELLIPSIS.length() ? (lastLineEnd - ELLIPSIS.length()) : lastLineEnd;
        CharacterStyle[] spans = builder.getSpans(last, text.length(), CharacterStyle.class);
        if (spans != null && spans.length > 0) {
            for (CharacterStyle span : spans) {
                if (builder.getSpanStart(span) >= last) {
                    builder.removeSpan(span);
                }
            }
        }
        return buildStaticLayout(builder.replace(last, text.length(), ELLIPSIS), width);
    }
}
