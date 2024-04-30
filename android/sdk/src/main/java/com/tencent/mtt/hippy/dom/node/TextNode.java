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

import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
import android.os.Build;
import android.text.BidiFormatter;
import android.text.BoringLayout;
import android.text.Layout;
import android.text.Spannable;
import android.text.SpannableStringBuilder;
import android.text.Spanned;
import android.text.SpannedString;
import android.text.StaticLayout;
import android.text.TextPaint;
import android.text.TextUtils;
import android.text.style.AbsoluteSizeSpan;
import android.text.style.BackgroundColorSpan;
import android.text.style.ImageSpan;
import android.text.style.StrikethroughSpan;
import android.text.style.UnderlineSpan;
import androidx.annotation.RequiresApi;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.adapter.font.HippyFontScaleAdapter;
import com.tencent.mtt.hippy.adapter.image.HippyDrawable;
import com.tencent.mtt.hippy.adapter.image.HippyImageLoader;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.flex.FlexMeasureMode;
import com.tencent.mtt.hippy.dom.flex.FlexNodeAPI;
import com.tencent.mtt.hippy.dom.flex.FlexOutput;
import com.tencent.mtt.hippy.dom.flex.FlexSpacing;
import com.tencent.mtt.hippy.utils.I18nUtil;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.text.HippyTextView;
import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.List;

@SuppressWarnings({"deprecation", "unused"})
public class TextNode extends StyleNode {

  SpannableStringBuilder mSpanned;

  public final static int UNSET = -1;
  public final static String MODE_HEAD = "head";
  public final static String MODE_MIDDLE = "middle";
  public final static String MODE_TAIL = "tail";
  public final static String MODE_CLIP = "clip";
  public final static String STRATEGY_SIMPLE = "simple";
  public final static String STRATEGY_HIGH_QUALITY = "high_quality";
  public final static String STRATEGY_BALANCED = "balanced";
  public static final String PROP_VERTICAL_ALIGN = "verticalAlign";

  /*package*/ final static String V_ALIGN_TOP = "top";
  /*package*/ final static String V_ALIGN_MIDDLE = "middle";
  /*package*/ final static String V_ALIGN_BASELINE = "baseline";
  /*package*/ final static String V_ALIGN_BOTTOM = "bottom";

  CharSequence mText;
  protected int mNumberOfLines = UNSET;
  private String mEllipsizeMode = MODE_TAIL;
  private String mBreakStrategy = STRATEGY_SIMPLE;

  protected int mFontSize = (int) Math.ceil(PixelUtil.dp2px(NodeProps.FONT_SIZE_SP));
  private float mLineHeight = UNSET;
  private float mLetterSpacing = UNSET;
  protected float mLineSpacingMultiplier = UNSET;
  protected float mLineSpacingExtra;

  protected int mColor = Color.BLACK;
  private int mBackgroundColor = Color.TRANSPARENT;
  private String mFontFamily = null;

  public static final int DEFAULT_TEXT_SHADOW_COLOR = 0x55000000;
  protected Layout.Alignment mTextAlign = Layout.Alignment.ALIGN_NORMAL;

  protected final TextUtils.TruncateAt mTruncateAt = TextUtils.TruncateAt.END;

  private float mTextShadowOffsetDx = 0;
  private float mTextShadowOffsetDy = 0;
  private float mTextShadowRadius = 1;
  private int mTextShadowColor = DEFAULT_TEXT_SHADOW_COLOR;

  private boolean mIsUnderlineTextDecorationSet = false;
  private boolean mIsLineThroughTextDecorationSet = false;


  private int mFontStyle = UNSET;
  private int mFontWeight = UNSET;

  private ArrayList<String> mGestureTypes = null;

  public static final String PROP_SHADOW_OFFSET = "textShadowOffset";
  public static final String PROP_SHADOW_OFFSET_WIDTH = "width";
  public static final String PROP_SHADOW_OFFSET_HEIGHT = "height";
  public static final String PROP_SHADOW_RADIUS = "textShadowRadius";
  public static final String PROP_SHADOW_COLOR = "textShadowColor";

  public static final String IMAGE_SPAN_TEXT = "[img]";

  final TextPaint mTextPaintInstance;
  // 这个TextPaint用于兼容2.13.x及之前版本对于空Text节点的layout高度
  private TextPaint mTextPaintForEmpty;

  private final boolean mIsVirtual;

  protected boolean mEnableScale = false;

  private WeakReference<HippyTextView> mTextViewWeakRefrence = null;
  private String mVerticalAlign;

  public TextNode(boolean mIsVirtual) {
    this.mIsVirtual = mIsVirtual;
    if (!mIsVirtual) {
      setMeasureFunction(TEXT_MEASURE_FUNCTION);
    }

    if (I18nUtil.isRTL()) {
      mTextAlign = Layout.Alignment.ALIGN_OPPOSITE;
    }

    mTextPaintInstance = new TextPaint(TextPaint.ANTI_ALIAS_FLAG);
    mTextPaintInstance.setTextSize(mFontSize);
  }

  public void setTextView(HippyTextView view) {
    mTextViewWeakRefrence = new WeakReference<>(view);
  }

  public void postInvalidateDelayed(long delayMilliseconds) {
    if (mTextViewWeakRefrence != null && mTextViewWeakRefrence.get() != null) {
      mTextViewWeakRefrence.get().postInvalidateDelayed(delayMilliseconds);
    }
  }

  public boolean isVirtual() {
    return mIsVirtual;
  }

  @HippyControllerProps(name = NodeProps.FONT_STYLE, defaultType = HippyControllerProps.STRING, defaultString = "normal")
  public void fontStyle(String fontStyleString) {
    int fontStyle = UNSET;
    if ("italic".equals(fontStyleString)) {
      fontStyle = Typeface.ITALIC;
    } else if ("normal".equals(fontStyleString)) {
      fontStyle = Typeface.NORMAL;
    }
    if (fontStyle != mFontStyle) {
      mFontStyle = fontStyle;
      markUpdated();
    }
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = NodeProps.LETTER_SPACING, defaultType = HippyControllerProps.NUMBER, defaultNumber = UNSET)
  public void letterSpacing(float letterSpace) {
    if (letterSpace != UNSET) {
      mLetterSpacing = PixelUtil.dp2px(letterSpace);
      markUpdated();
    }
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = NodeProps.COLOR, defaultType = HippyControllerProps.NUMBER, defaultNumber = Color.BLACK)
  public void color(Integer color) {
    mColor = color;
    markUpdated();
  }

  public boolean enableScale() {
    return mEnableScale;
  }

  @SuppressWarnings("unused")
  public Spannable getSpan() {
    return mSpanned;
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = NodeProps.FONT_SIZE, defaultType = HippyControllerProps.NUMBER, defaultNumber = NodeProps.FONT_SIZE_SP)
  public void fontSize(float fontSize) {
    this.mFontSize = (int) Math.ceil(PixelUtil.dp2px(fontSize));
    mTextPaintInstance.setTextSize(mFontSize);
    markUpdated();
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = NodeProps.FONT_FAMILY)
  public void fontFamily(String fontFamily) {
    mFontFamily = fontFamily;
    markUpdated();
  }

  private static int parseArgument(String wight) {
    return wight.length() == 3 && wight.endsWith("00") && wight.charAt(0) <= '9'
        && wight.charAt(0) >= '1' ? 100 * (wight.charAt(0) - '0') : -1;
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = NodeProps.FONT_WEIGHT)
  public void fontWeight(String wight) {
    int fontWeightNumeric = wight != null ? parseArgument(wight) : -1;
    int fontWeight = UNSET;
    if (fontWeightNumeric >= 500 || "bold".equals(wight)) {
      fontWeight = Typeface.BOLD;
    } else if ("normal".equals(wight) || fontWeightNumeric != -1) {
      fontWeight = Typeface.NORMAL;
    }
    if (fontWeight != mFontWeight) {
      mFontWeight = fontWeight;
      markUpdated();
    }
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = NodeProps.TEXT_DECORATION_LINE)
  public void textDecorationLine(String textDecorationLineString) {
    mIsUnderlineTextDecorationSet = false;
    mIsLineThroughTextDecorationSet = false;
    if (textDecorationLineString != null) {
      for (String textDecorationLineSubString : textDecorationLineString.split(" ")) {
        if ("underline".equals(textDecorationLineSubString)) {
          mIsUnderlineTextDecorationSet = true;
        } else if ("line-through".equals(textDecorationLineSubString)) {
          mIsLineThroughTextDecorationSet = true;
        }
      }
    }
    markUpdated();
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = PROP_SHADOW_OFFSET)
  public void textShadowOffset(HippyMap offsetMap) {
    mTextShadowOffsetDx = 0;
    mTextShadowOffsetDy = 0;
    if (offsetMap != null) {
      if (offsetMap.get(PROP_SHADOW_OFFSET_WIDTH) != null) {
        mTextShadowOffsetDx = PixelUtil.dp2px(offsetMap.getDouble(PROP_SHADOW_OFFSET_WIDTH));
      }
      if (offsetMap.get(PROP_SHADOW_OFFSET_HEIGHT) != null) {
        mTextShadowOffsetDy = PixelUtil.dp2px(offsetMap.getDouble(PROP_SHADOW_OFFSET_HEIGHT));
      }
    }

    markUpdated();
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = PROP_SHADOW_RADIUS, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
  public void textShadowRadius(float textShadowRadius) {
    if (textShadowRadius != mTextShadowRadius) {
      mTextShadowRadius = textShadowRadius;
      markUpdated();
    }
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = PROP_SHADOW_COLOR, defaultType = HippyControllerProps.NUMBER, defaultNumber = Color.TRANSPARENT)
  public void setTextShadowColor(int textShadowColor) {
    if (textShadowColor != mTextShadowColor) {
      mTextShadowColor = textShadowColor;
      markUpdated();
    }
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = NodeProps.LINE_HEIGHT, defaultType = HippyControllerProps.NUMBER, defaultNumber = UNSET)
  public void lineHeight(int lineHeight) {
    mLineHeight = lineHeight == UNSET ? UNSET : PixelUtil.dp2px(lineHeight);
    markUpdated();
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = NodeProps.LINE_SPACING_MULTIPLIER, defaultType = HippyControllerProps.NUMBER, defaultNumber = UNSET)
  public void lineSpacingMultiplier(float lineSpacingMultiplier) {
    mLineSpacingMultiplier = lineSpacingMultiplier;
    markUpdated();
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = NodeProps.LINE_SPACING_EXTRA, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0.0f)
  public void lineSpacingExtra(float lineSpacingExtra) {
    mLineSpacingExtra = PixelUtil.dp2px(lineSpacingExtra);
    markUpdated();
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = NodeProps.TEXT_ALIGN, defaultType = HippyControllerProps.STRING, defaultString = "left")
  public void setTextAlign(String textAlign) {
    if (textAlign == null || "auto".equals(textAlign) || "justify".equals(textAlign)) {
      mTextAlign = I18nUtil.isRTL() ? Layout.Alignment.ALIGN_OPPOSITE : Layout.Alignment.ALIGN_NORMAL;
    } else if ("left".equals(textAlign)) {
      mTextAlign = Layout.Alignment.ALIGN_NORMAL;
    } else if ("right".equals(textAlign)) {
      mTextAlign = Layout.Alignment.ALIGN_OPPOSITE;
    } else if ("center".equals(textAlign)) {
      mTextAlign = Layout.Alignment.ALIGN_CENTER;
    } else {
      throw new RuntimeException("Invalid textAlign: " + textAlign);
    }
    markUpdated();
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = "text")
  public void text(String text) {
    mText = text;
    markUpdated();
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = NodeProps.ON_CLICK, defaultType = HippyControllerProps.BOOLEAN)
  public void clickEnable(boolean flag) {
    if (flag) {
      if (mGestureTypes == null) {
        mGestureTypes = new ArrayList<>();
      }
      mGestureTypes.add(NodeProps.ON_CLICK);
    }
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = NodeProps.ON_LONG_CLICK, defaultType = HippyControllerProps.BOOLEAN)
  public void longClickEnable(boolean flag) {
    if (flag) {
      if (mGestureTypes == null) {
        mGestureTypes = new ArrayList<>();
      }
      mGestureTypes.add(NodeProps.ON_LONG_CLICK);
    }
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = NodeProps.ON_PRESS_IN, defaultType = HippyControllerProps.BOOLEAN)
  public void pressInEnable(boolean flag) {
    if (flag) {
      if (mGestureTypes == null) {
        mGestureTypes = new ArrayList<>();
      }
      mGestureTypes.add(NodeProps.ON_PRESS_IN);
    }
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = NodeProps.ON_PRESS_OUT)
  public void pressOutEnable(boolean flag) {
    if (flag) {
      if (mGestureTypes == null) {
        mGestureTypes = new ArrayList<>();
      }
      mGestureTypes.add(NodeProps.ON_PRESS_OUT);
    }
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = NodeProps.ON_TOUCH_DOWN, defaultType = HippyControllerProps.BOOLEAN)
  public void touchDownEnable(boolean flag) {
    if (flag) {
      if (mGestureTypes == null) {
        mGestureTypes = new ArrayList<>();
      }
      mGestureTypes.add(NodeProps.ON_TOUCH_DOWN);
    }
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = NodeProps.ON_TOUCH_MOVE, defaultType = HippyControllerProps.BOOLEAN)
  public void touchUpEnable(boolean flag) {
    if (flag) {
      if (mGestureTypes == null) {
        mGestureTypes = new ArrayList<>();
      }
      mGestureTypes.add(NodeProps.ON_TOUCH_MOVE);
    }
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = NodeProps.ON_TOUCH_END, defaultType = HippyControllerProps.BOOLEAN)
  public void touchEndEnable(boolean flag) {
    if (flag) {
      if (mGestureTypes == null) {
        mGestureTypes = new ArrayList<>();
      }
      mGestureTypes.add(NodeProps.ON_TOUCH_END);
    }
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = NodeProps.ON_TOUCH_CANCEL, defaultType = HippyControllerProps.BOOLEAN)
  public void touchCancelable(boolean flag) {
    if (flag) {
      if (mGestureTypes == null) {
        mGestureTypes = new ArrayList<>();
      }
      mGestureTypes.add(NodeProps.ON_TOUCH_CANCEL);
    }
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = "enableScale", defaultType = HippyControllerProps.BOOLEAN)
  public void enableScale(boolean flag) {
    this.mEnableScale = flag;
    markUpdated();
  }

  @Override
  public void markUpdated() {
    super.markUpdated();
    if (!mIsVirtual) {
      super.dirty();
    }
  }

  @SuppressWarnings("unused")
  @HippyControllerProps(name = NodeProps.NUMBER_OF_LINES, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
  public void setNumberOfLines(int numberOfLines) {
    mNumberOfLines = numberOfLines == 0 ? -1 : numberOfLines;
    markUpdated();
  }

  @HippyControllerProps(name = NodeProps.ELLIPSIZE_MODE, defaultType = HippyControllerProps.STRING, defaultString = MODE_TAIL)
  public void setEllipsizeMode(String mode) {
    if (TextUtils.isEmpty(mode)) {
      mode = MODE_TAIL;
    }
    if (!mEllipsizeMode.equals(mode)) {
      if (MODE_TAIL.equals(mode) || MODE_CLIP.equals(mode) || MODE_MIDDLE.equals(mode) || MODE_HEAD.equals(mode)) {
        mEllipsizeMode = mode;
        markUpdated();
      } else {
        throw new RuntimeException("Invalid ellipsizeMode: " + mode);
      }
    }
  }

  @HippyControllerProps(name = NodeProps.BREAK_STRATEGY, defaultType = HippyControllerProps.STRING, defaultString = STRATEGY_SIMPLE)
  public void setBreakStrategy(String strategy) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
      return;
    }
    if (TextUtils.isEmpty(strategy)) {
      strategy = STRATEGY_SIMPLE;
    }
    if (!mBreakStrategy.equals(strategy)) {
      if (STRATEGY_SIMPLE.equals(strategy) || STRATEGY_HIGH_QUALITY.equals(strategy) || STRATEGY_BALANCED.equals(strategy)) {
        mBreakStrategy = strategy;
        markUpdated();
      } else {
        throw new RuntimeException("Invalid breakStrategy: " + strategy);
      }
    }
  }

  @HippyControllerProps(name = NodeProps.BACKGROUND_COLOR, defaultType = HippyControllerProps.NUMBER)
  public void setBackgroundColor(int backgroundColor) {
      mBackgroundColor = backgroundColor;
  }

  @Override
  public void layoutBefore(HippyEngineContext context) {
    super.layoutBefore(context);

    HippyFontScaleAdapter fontScaleAdapter = context.getGlobalConfigs().getFontScaleAdapter();
    HippyImageLoader imageAdapter = context.getGlobalConfigs().getImageLoaderAdapter();

    if (mIsVirtual) {
      return;
    }

    if (fontScaleAdapter != null && !TextUtils.isEmpty(mText)) {
      CharSequence s = fontScaleAdapter.getEmoticonText(mText, mFontSize);
      if (s != null) {
        mText = s;
      }
    }

    mSpanned = createSpan(mText, true, context, fontScaleAdapter, imageAdapter);
  }

  @SuppressWarnings({"EmptyMethod", "unused"})
  protected void createCustomSpan(CharSequence text, Spannable spannableText) {

  }

  private SpannableStringBuilder createSpan(CharSequence text, boolean useChild, HippyEngineContext context,
          HippyFontScaleAdapter fontScaleAdapter, HippyImageLoader imageAdapter) {
    if (text != null) {
      SpannableStringBuilder spannable = new SpannableStringBuilder();
      List<SpanOperation> ops = new ArrayList<>();
      createSpanOperations(ops, spannable, this, text, useChild, context, fontScaleAdapter, imageAdapter);

      for (int i = ops.size() - 1; i >= 0; i--) {
        SpanOperation op = ops.get(i);

        op.execute(spannable);
      }

      createCustomSpan(text, spannable);

      return spannable;
    }
    return new SpannableStringBuilder("");
  }

  private void createImageSpanOperation(List<SpanOperation> ops, SpannableStringBuilder sb,
          ImageNode imageNode, HippyEngineContext context, HippyImageLoader imageAdapter) {
    String url = null;
    String defaultSource = null;
    HippyMap props = imageNode.getTotalProps();
    if (props != null) {
      url = props.getString("src");
      defaultSource = props.getString("defaultSource");
    }

    Drawable drawable = null;
    if (!TextUtils.isEmpty(defaultSource) && imageAdapter != null) {
      assert defaultSource != null;
      HippyDrawable hippyDrawable = imageAdapter.getImage(defaultSource, null);
      Bitmap bitmap = hippyDrawable.getBitmap();
      if (bitmap != null) {
        drawable = new BitmapDrawable(bitmap);
      }
    }

    if (drawable == null) {
      drawable = new ColorDrawable(Color.parseColor("#00000000"));
    }

    int width = Math.round(imageNode.getStyleWidth());
    int height = Math.round(imageNode.getStyleHeight());
    drawable.setBounds(0, 0, width, height);

    HippyImageSpan imageSpan = new HippyImageSpan(drawable, url, imageNode, imageAdapter, context);
    imageNode.setImageSpan(imageSpan);

    int start = sb.length();
    sb.append(IMAGE_SPAN_TEXT);
    int end = start + IMAGE_SPAN_TEXT.length();
    ops.add(new SpanOperation(start, end, imageSpan));

    if (imageNode.getGestureTypes() != null && imageNode.getGestureTypes().size() > 0) {
      HippyNativeGestureSpan span = new HippyNativeGestureSpan(imageNode.getId(), true);
      span.addGestureTypes(imageNode.getGestureTypes());
      ops.add(new SpanOperation(start, end, span));
    }
  }

  private void createSpanOperations(List<SpanOperation> ops, SpannableStringBuilder sb,
          TextNode textNode, CharSequence text, boolean useChild, HippyEngineContext context,
          HippyFontScaleAdapter fontScaleAdapter, HippyImageLoader imageAdapter) {
    int start = sb.length();
    sb.append(text);
    int end = sb.length();
    if (start <= end) {
      String verticalAlign = textNode.getVerticalAlign();
      if (verticalAlign != null) {
        HippyVerticalAlignSpan span = new HippyVerticalAlignSpan(verticalAlign);
        ops.add(new SpanOperation(start, end, span, SpanOperation.PRIORITY_LOWEST));
      }

      ops
        .add(new SpanOperation(start, end, createForegroundColorSpan(textNode.mColor, textNode)));
      if (textNode.isVirtual() && textNode.mBackgroundColor != Color.TRANSPARENT) {
        ops.add(new SpanOperation(start, end, new BackgroundColorSpan(textNode.mBackgroundColor)));
      }
      if (textNode.mLetterSpacing != UNSET) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
          ops.add(
              new SpanOperation(start, end, new HippyLetterSpacingSpan(textNode.mLetterSpacing)));
        }
      }
      if (textNode.mFontSize != UNSET) {
        int fontSize = textNode.mFontSize;

        if (fontScaleAdapter != null && textNode.mEnableScale) {
          fontSize = (int) (fontSize * fontScaleAdapter.getFontScale());
        }
        ops.add(new SpanOperation(start, end, new AbsoluteSizeSpan(fontSize)));
      }
      String fontFamily = textNode.mFontFamily;
      if (fontFamily == null && fontScaleAdapter != null) {
        fontFamily = fontScaleAdapter.getCustomDefaultFontFamily();
      }
      if (textNode.mFontStyle != UNSET || textNode.mFontWeight != UNSET || fontFamily != null) {
        ops.add(new SpanOperation(start, end,
            new HippyStyleSpan(textNode.mFontStyle, textNode.mFontWeight, fontFamily, fontScaleAdapter)));
      }
      if (textNode.mIsUnderlineTextDecorationSet) {
        ops.add(new SpanOperation(start, end, new UnderlineSpan()));
      }
      if (textNode.mIsLineThroughTextDecorationSet) {
        ops.add(new SpanOperation(start, end, new StrikethroughSpan()));
      }
      if (textNode.mTextShadowOffsetDx != 0 || textNode.mTextShadowOffsetDy != 0) {
        ops.add(new SpanOperation(start, end,
            new HippyShadowSpan(textNode.mTextShadowOffsetDx, textNode.mTextShadowOffsetDy,
                textNode.mTextShadowRadius, textNode.mTextShadowColor)));
      }
      if (textNode.mLineHeight != UNSET
        && mLineSpacingMultiplier == UNSET
        && mLineSpacingExtra == 0) {
        float lineHeight = textNode.mLineHeight;

        if (fontScaleAdapter != null && textNode.mEnableScale) {
          lineHeight = (lineHeight * fontScaleAdapter.getFontScale());
        }
        ops.add(new SpanOperation(start, end, new HippyLineHeightSpan(lineHeight)));
      }

      if (textNode.mGestureTypes != null && textNode.mGestureTypes.size() > 0) {
        HippyNativeGestureSpan span = new HippyNativeGestureSpan(textNode.getId(), isVirtual());
        span.addGestureTypes(textNode.mGestureTypes);
        ops.add(new SpanOperation(start, end, span));
      }
    }

    if (useChild) {
      for (int i = 0; i < textNode.getChildCount(); i++) {
        DomNode domNode = textNode.getChildAt(i);
        if (domNode instanceof TextNode) {
          TextNode tempNode = (TextNode) domNode;
          CharSequence tempText = tempNode.mText;
          if (fontScaleAdapter != null && !TextUtils.isEmpty(tempText)) {
            CharSequence s = fontScaleAdapter.getEmoticonText(tempText, tempNode.mFontSize);
            if (s != null) {
              tempText = s;
            }
          }
          //noinspection ConstantConditions
          createSpanOperations(ops, sb, tempNode, tempText, useChild, context, fontScaleAdapter, imageAdapter);
        } else if (domNode instanceof ImageNode) {
          createImageSpanOperation(ops, sb, (ImageNode) domNode, context, imageAdapter);
        } else {
          throw new RuntimeException(domNode.getViewClass() + "is not support in Text");
        }

        domNode.markUpdateSeen();
      }
    }
  }

  protected HippyForegroundColorSpan createForegroundColorSpan(int color, TextNode textNode) {
    return new HippyForegroundColorSpan(color);
  }

  private static final FlexNodeAPI.MeasureFunction TEXT_MEASURE_FUNCTION = new FlexNodeAPI.MeasureFunction() {
    @SuppressWarnings("rawtypes")
    @Override
    public long measure(FlexNodeAPI node, float width,
        FlexMeasureMode widthMode, float height,
        FlexMeasureMode heightMode) {
      TextNode reactCSSNode = (TextNode) node;

      Layout layout = null;
      boolean exception = false;

      try {

        layout = reactCSSNode.createLayout(width, widthMode);
      } catch (Throwable throwable) {
        LogUtils.e("TextNode", "text createLayout", throwable);
        exception = true;
      }

      //noinspection ConstantConditions
      if (exception || layout == null) {
        return FlexOutput.make(width, height);
      } else {
        LogUtils.d("TextNode",
            "measure:" + " w: " + layout.getWidth() + " h: "
                + layout.getHeight());
        return FlexOutput.make(layout.getWidth(),
            layout.getHeight());
      }
    }
  };

  public void layoutAfter(HippyEngineContext context) {
    if (!isVirtual()) {
      LogUtils.d("TextNode",
          "measure:layoutAfter" + " w: " + getLayoutWidth() + " h: " + getLayoutHeight());
      Layout mLayout = createLayout(
          getLayoutWidth() - getPadding(FlexSpacing.LEFT) - getPadding(FlexSpacing.RIGHT),
          FlexMeasureMode.EXACTLY);
      context.getDomManager().postWarmLayout(mLayout);
      setData(mLayout);
    }

  }

  protected float getLineSpacingMultiplier() {
    return mLineSpacingMultiplier <= 0 ? 1.0f : mLineSpacingMultiplier;
  }

  @RequiresApi(api = Build.VERSION_CODES.M)
  private int getBreakStrategy() {
    final String strategy = mBreakStrategy;
    switch (strategy) {
      case STRATEGY_SIMPLE:
        return Layout.BREAK_STRATEGY_SIMPLE;
      case STRATEGY_HIGH_QUALITY:
        return Layout.BREAK_STRATEGY_HIGH_QUALITY;
      case STRATEGY_BALANCED:
        return Layout.BREAK_STRATEGY_BALANCED;
      default:
        throw new RuntimeException("Invalid breakStrategy: " + strategy);
    }
  }

  private StaticLayout buildStaticLayout(CharSequence source, TextPaint paint, int width) {
    Layout.Alignment textAlign = mTextAlign;
    if (I18nUtil.isRTL()) {
      BidiFormatter bidiFormatter = BidiFormatter.getInstance();
      if (bidiFormatter.isRtl(source.toString()) && textAlign == Layout.Alignment.ALIGN_OPPOSITE) {
        textAlign = Layout.Alignment.ALIGN_NORMAL;
      }
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      return StaticLayout.Builder.obtain(source, 0, source.length(), paint, width)
        .setAlignment(textAlign)
        .setLineSpacing(mLineSpacingExtra, getLineSpacingMultiplier())
        .setIncludePad(true)
        .setBreakStrategy(getBreakStrategy())
        .build();
    } else {
      return new StaticLayout(source, paint, width, textAlign, getLineSpacingMultiplier(),
        mLineSpacingExtra, true);
    }
  }

  protected Layout createLayout(float width, FlexMeasureMode widthMode) {
    final TextPaint textPaint = getTextPaint();
    Layout layout;
    Spanned text = mSpanned == null ? new SpannedString("") : mSpanned;
    BoringLayout.Metrics boring = null;
    try {
      boring = BoringLayout.isBoring(text, textPaint);
    } catch (Throwable e) {
      LogUtils.d("TextNode", "createLayout: " + e.getMessage());
    }

    boolean unconstrainedWidth = widthMode == FlexMeasureMode.UNDEFINED || width < 0;
    if (boring != null && (unconstrainedWidth || boring.width <= width)) {
      layout = BoringLayout.make(text, textPaint, boring.width, mTextAlign, getLineSpacingMultiplier(), mLineSpacingExtra, boring, true);
    } else {
      float desiredWidth = Layout.getDesiredWidth(text, textPaint);
      if (!unconstrainedWidth && (widthMode == FlexMeasureMode.EXACTLY || desiredWidth > width)) {
          desiredWidth = width;
      }
      layout = buildStaticLayout(text, textPaint, (int) Math.ceil(desiredWidth));
      if (mNumberOfLines != UNSET && mNumberOfLines > 0) {
        if (layout.getLineCount() > mNumberOfLines) {
          int lastLineStart = layout.getLineStart(mNumberOfLines - 1);
          int lastLineEnd = layout.getLineEnd(mNumberOfLines - 1);
          if (lastLineStart < lastLineEnd) {
            int measureWidth = (int)Math.ceil(unconstrainedWidth ? desiredWidth : width);
            layout = truncateLayoutWithNumberOfLine(layout, measureWidth, mNumberOfLines);
          }
        }
      }
    }

    assert layout != null;
    CharSequence layoutText = layout.getText();
    if (layoutText instanceof Spanned) {
        Spanned spanned = (Spanned) layoutText;
        HippyVerticalAlignSpan[] spans = spanned.getSpans(0, spanned.length(), HippyVerticalAlignSpan.class);
        for (HippyVerticalAlignSpan span : spans) {
            int offset = spanned.getSpanStart(span);
            int line = layout.getLineForOffset(offset);
            int baseline = layout.getLineBaseline(line);
            span.setLineMetrics(layout.getLineTop(line) - baseline, layout.getLineBottom(line) - baseline);
        }
    }
    return layout;
  }

  private TextPaint getTextPaint() {
    if (TextUtils.isEmpty(mText)) {
      if (mTextPaintForEmpty == null) {
        mTextPaintForEmpty = new TextPaint(TextPaint.ANTI_ALIAS_FLAG);
      }
      return mTextPaintForEmpty;
    }
    return mTextPaintInstance;
  }

  private StaticLayout truncateLayoutWithNumberOfLine(Layout preLayout, int width, int numberOfLines) {
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
        float formerTextSize = numberOfLines >= 2 ? getLineHeight(preLayout, numberOfLines - 2) : paint.getTextSize();
        float latterTextSize = Math.max(getLineHeight(preLayout, lineCount - 2), getLineHeight(preLayout, lineCount - 1));
        measurePaint.setTextSize(Math.max(formerTextSize, latterTextSize));
        lastLine = ellipsizeHead(origin, measurePaint, width, start);
      } else if (MODE_MIDDLE.equals(mEllipsizeMode)) {
        measurePaint.setTextSize(Math.max(getLineHeight(preLayout, numberOfLines - 1), getLineHeight(preLayout, lineCount - 1)));
        lastLine = ellipsizeMiddle(origin, measurePaint, width, start);
      } else /*if (MODE_TAIL.equals(mEllipsizeMode))*/ {
        measurePaint.setTextSize(getLineHeight(preLayout, numberOfLines - 1));
        int end = preLayout.getLineEnd(numberOfLines);
        lastLine = ellipsizeTail(origin, measurePaint, width, start, end);
      }
      // concat everything
      truncated = formerLines == null ? lastLine : formerLines instanceof SpannableStringBuilder
          ? ((SpannableStringBuilder) formerLines).append(lastLine)
          : ((StringBuilder) formerLines).append(lastLine);
    }

    return buildStaticLayout(truncated, paint, width);
  }

  private float getLineHeight(Layout layout, int line) {
    return layout.getLineTop(line + 1) - layout.getLineTop(line);
  }

  private CharSequence ellipsizeHead(CharSequence origin, TextPaint paint, int width, int start) {
    start = Math.max(start, TextUtils.lastIndexOf(origin, '\n') + 1);
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

  private CharSequence ellipsizeMiddle(CharSequence origin, TextPaint paint, int width, int start) {
    int leftEnd, rightStart;
    if ((leftEnd = TextUtils.indexOf(origin, '\n', start)) != -1) {
      rightStart = TextUtils.lastIndexOf(origin, '\n') + 1;
      assert leftEnd < rightStart;
      // "${first line of the rest part}…${last line of the rest part}"
      CharSequence tmp;
      if (origin instanceof Spanned) {
        tmp = new SpannableStringBuilder()
            .append(origin, start, leftEnd)
            .append(ELLIPSIS)
            .append(origin, rightStart, origin.length());
      } else {
        tmp = new StringBuilder(leftEnd - start + ELLIPSIS.length() + origin.length() - rightStart)
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
      CharSequence line = TextUtils.ellipsize(tmp, paint, width, TextUtils.TruncateAt.MIDDLE, false, callback);
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
      return TextUtils.ellipsize(tmp, paint, width, TextUtils.TruncateAt.MIDDLE);
    }
  }

  private CharSequence ellipsizeTail(CharSequence origin, TextPaint paint, int width, int start, int end) {
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
    return TextUtils.ellipsize(tmp, paint, width, TextUtils.TruncateAt.END);
  }

  @HippyControllerProps(name = PROP_VERTICAL_ALIGN, defaultType = HippyControllerProps.STRING)
  public void setVerticalAlign(String align) {
      switch (align) {
          case HippyControllerProps.DEFAULT:
              // reset to default
              mVerticalAlign = null;
              break;
          case TextNode.V_ALIGN_TOP:
          case TextNode.V_ALIGN_MIDDLE:
          case TextNode.V_ALIGN_BASELINE:
          case TextNode.V_ALIGN_BOTTOM:
              mVerticalAlign = align;
              break;
          default:
              mVerticalAlign = TextNode.V_ALIGN_BASELINE;
              break;
      }
  }

  public String getVerticalAlign() {
      if (mVerticalAlign != null) {
          return mVerticalAlign;
      }
      DomNode parent = getParent();
      if (parent instanceof TextNode) {
          return ((TextNode) parent).getVerticalAlign();
      }
      return null;
  }

  private static final String ELLIPSIS = "\u2026";

  private static class SpanOperation {

    public static final int PRIORITY_DEFAULT = 1;
    public static final int PRIORITY_LOWEST = 0;
    protected final int start;
    protected final int end;
    protected final Object what;
    protected final int priority;

    @SuppressWarnings("unused")
    SpanOperation(int start, int end, Object what) {
      this.start = start;
      this.end = end;
      this.what = what;
      this.priority = PRIORITY_DEFAULT;
    }

    SpanOperation(int start, int end, Object what, int priority) {
      this.start = start;
      this.end = end;
      this.what = what;
      this.priority = priority;
    }

    public void execute(SpannableStringBuilder sb) {
      int spanFlags;
      if (what instanceof ImageSpan) {
        spanFlags = Spannable.SPAN_EXCLUSIVE_EXCLUSIVE;
      } else if (start == 0) {
        spanFlags = Spannable.SPAN_INCLUSIVE_INCLUSIVE;
      } else {
        spanFlags = Spannable.SPAN_EXCLUSIVE_INCLUSIVE;
      }
      spanFlags |= (priority << Spannable.SPAN_PRIORITY_SHIFT) & Spannable.SPAN_PRIORITY;

      try {
        sb.setSpan(what, start, end, spanFlags);
      } catch (Exception e) {
        LogUtils.e("TextNode", "setSpan exception msg: " + e.getMessage());
      }
    }
  }
}
