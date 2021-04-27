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
import android.text.*;
import android.text.style.*;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.adapter.font.HippyFontScaleAdapter;
import com.tencent.mtt.hippy.adapter.image.HippyDrawable;
import com.tencent.mtt.hippy.adapter.image.HippyImageLoader;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.flex.*;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.text.HippyTextView;

import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.List;

public class TextNode extends StyleNode
{

	SpannableStringBuilder			mSpanned;

	public final static int			UNSET							= -1;
	CharSequence					mText;
	protected int					mNumberOfLines					= UNSET;

	protected int					mFontSize						= (int) Math.ceil(PixelUtil.dp2px(NodeProps.FONT_SIZE_SP));
	private float					mLineHeight						= UNSET;
	private float					mLetterSpacing					= UNSET;

	private int						mColor							= Color.BLACK;
	private final boolean			mIsBackgroundColorSet			= false;
	private int                     mBackgroundColor;
	private String					mFontFamily						= null;

	public static final int			DEFAULT_TEXT_SHADOW_COLOR		= 0x55000000;
	protected Layout.Alignment		mTextAlign						= Layout.Alignment.ALIGN_NORMAL;

	protected final TextUtils.TruncateAt	mTruncateAt				= TextUtils.TruncateAt.END;

	private float					mTextShadowOffsetDx				= 0;
	private float					mTextShadowOffsetDy				= 0;
	private float					mTextShadowRadius				= 1;
	private int						mTextShadowColor				= DEFAULT_TEXT_SHADOW_COLOR;

	private boolean					mIsUnderlineTextDecorationSet	= false;
	private boolean					mIsLineThroughTextDecorationSet	= false;


	private int						mFontStyle						= UNSET;
	private int						mFontWeight						= UNSET;

	private ArrayList<String>		mGestureTypes					= null;

	public static final String		PROP_SHADOW_OFFSET				= "textShadowOffset";
	public static final String		PROP_SHADOW_OFFSET_WIDTH		= "width";
	public static final String		PROP_SHADOW_OFFSET_HEIGHT		= "height";
	public static final String		PROP_SHADOW_RADIUS				= "textShadowRadius";
	public static final String		PROP_SHADOW_COLOR				= "textShadowColor";

	public static final String		IMAGE_SPAN_TEXT				= "[img]";

	final TextPaint					sTextPaintInstance				= new TextPaint(TextPaint.ANTI_ALIAS_FLAG);

	private final boolean			mIsVirtual;

	protected boolean				mEnableScale					= false;

	private WeakReference<HippyTextView> mTextViewWeakRefrence = null;


	public TextNode(boolean mIsVirtual)
	{
		this.mIsVirtual = mIsVirtual;
		if (!mIsVirtual)
			setMeasureFunction(TEXT_MEASURE_FUNCTION);
	}

	public void setTextView(HippyTextView view) {
		mTextViewWeakRefrence = new WeakReference<HippyTextView>(view);
	}
	
  public void postInvalidateDelayed(long delayMilliseconds) {
	  if (mTextViewWeakRefrence != null && mTextViewWeakRefrence.get() != null) {
      mTextViewWeakRefrence.get().postInvalidateDelayed(delayMilliseconds);
    }
  }
  
	public boolean isVirtual()
	{
		return mIsVirtual;
	}

	@HippyControllerProps(name = NodeProps.FONT_STYLE, defaultType = HippyControllerProps.STRING, defaultString = "normal")
	public void fontStyle(String fontStyleString)
	{
		int fontStyle = UNSET;
		if ("italic".equals(fontStyleString))
		{
			fontStyle = Typeface.ITALIC;
		}
		else if ("normal".equals(fontStyleString))
		{
			fontStyle = Typeface.NORMAL;
		}
		if (fontStyle != mFontStyle)
		{
			mFontStyle = fontStyle;
			markUpdated();
		}
	}

	@HippyControllerProps(name = NodeProps.LETTER_SPACING, defaultType = HippyControllerProps.NUMBER, defaultNumber = UNSET)
	public void letterSpacing(float letterSpace)
	{
		if (letterSpace != UNSET)
		{
			mLetterSpacing = PixelUtil.dp2px(letterSpace);
			markUpdated();
		}
	}

	@HippyControllerProps(name = NodeProps.COLOR, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
	public void color(Integer color)
	{
		mColor = color;
		markUpdated();
	}

	public boolean enableScale()
	{
		return mEnableScale;
	}


	public Spannable getSpan()
	{
		return mSpanned;
	}

	@HippyControllerProps(name = NodeProps.FONT_SIZE, defaultType = HippyControllerProps.NUMBER, defaultNumber = NodeProps.FONT_SIZE_SP)
	public void fontSize(float fontSize)
	{
		this.mFontSize = (int) Math.ceil(PixelUtil.dp2px(fontSize));
		markUpdated();
	}

	@HippyControllerProps(name = NodeProps.FONT_FAMILY)
	public void fontFamily(String fontFamily)
	{
		mFontFamily = fontFamily;
		markUpdated();
	}

	@Override
	public void updateProps(HippyMap props)
	{
		super.updateProps(props);
		HippyMap styleMap = (HippyMap) props.get(NodeProps.STYLE);
		if (styleMap != null && styleMap.get(NodeProps.COLOR) == null)
		{
			styleMap.pushInt(NodeProps.COLOR, Color.BLACK);
		}
	}

	private static int parseArgument(String wight)
	{
		return wight.length() == 3 && wight.endsWith("00") && wight.charAt(0) <= '9' && wight.charAt(0) >= '1' ? 100 * (wight.charAt(0) - '0') : -1;
	}

	@HippyControllerProps(name = NodeProps.FONT_WEIGHT)
	public void fontWeight(String wight)
	{
		int fontWeightNumeric = wight != null ? parseArgument(wight) : -1;
		int fontWeight = UNSET;
		if (fontWeightNumeric >= 500 || "bold".equals(wight))
		{
			fontWeight = Typeface.BOLD;
		}
		else if ("normal".equals(wight) || (fontWeightNumeric != -1 && fontWeightNumeric < 500))
		{
			fontWeight = Typeface.NORMAL;
		}
		if (fontWeight != mFontWeight)
		{
			mFontWeight = fontWeight;
			markUpdated();
		}
	}

	@HippyControllerProps(name = NodeProps.TEXT_DECORATION_LINE)
	public void textDecorationLine(String textDecorationLineString)
	{
		mIsUnderlineTextDecorationSet = false;
		mIsLineThroughTextDecorationSet = false;
		if (textDecorationLineString != null)
		{
			for (String textDecorationLineSubString : textDecorationLineString.split(" "))
			{
				if ("underline".equals(textDecorationLineSubString))
				{
					mIsUnderlineTextDecorationSet = true;
				}
				else if ("line-through".equals(textDecorationLineSubString))
				{
					mIsLineThroughTextDecorationSet = true;
				}
			}
		}
		markUpdated();
	}

	@HippyControllerProps(name = PROP_SHADOW_OFFSET)
	public void textShadowOffset(HippyMap offsetMap)
	{
		mTextShadowOffsetDx = 0;
		mTextShadowOffsetDy = 0;
		if (offsetMap != null)
		{
			if (offsetMap.get(PROP_SHADOW_OFFSET_WIDTH) != null)
			{
				mTextShadowOffsetDx = PixelUtil.dp2px(offsetMap.getDouble(PROP_SHADOW_OFFSET_WIDTH));
			}
			if (offsetMap.get(PROP_SHADOW_OFFSET_HEIGHT) != null)
			{
				mTextShadowOffsetDy = PixelUtil.dp2px(offsetMap.getDouble(PROP_SHADOW_OFFSET_HEIGHT));
			}
		}

		markUpdated();
	}

	@HippyControllerProps(name = PROP_SHADOW_RADIUS, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
	public void textShadowRadius(float textShadowRadius)
	{
		if (textShadowRadius != mTextShadowRadius)
		{
			mTextShadowRadius = textShadowRadius;
			markUpdated();
		}
	}

	@HippyControllerProps(name = PROP_SHADOW_COLOR, defaultType = HippyControllerProps.NUMBER, defaultNumber = Color.TRANSPARENT)
	public void setTextShadowColor(int textShadowColor)
	{
		if (textShadowColor != mTextShadowColor)
		{
			mTextShadowColor = textShadowColor;
			markUpdated();
		}
	}

	@HippyControllerProps(name = NodeProps.LINE_HEIGHT, defaultType = HippyControllerProps.NUMBER, defaultNumber = UNSET)
	public void lineHeight(int lineHeight)
	{
		mLineHeight = lineHeight == UNSET ? UNSET : PixelUtil.dp2px(lineHeight);
		markUpdated();
	}

	@HippyControllerProps(name = NodeProps.TEXT_ALIGN, defaultType = HippyControllerProps.STRING, defaultString = "left")
	public void setTextAlign(String textAlign)
	{
		if (textAlign == null || "auto".equals(textAlign))
		{
			mTextAlign = Layout.Alignment.ALIGN_NORMAL;
		}
		else if ("left".equals(textAlign))
		{
			mTextAlign = Layout.Alignment.ALIGN_NORMAL;
		}
		else if ("right".equals(textAlign))
		{
			mTextAlign = Layout.Alignment.ALIGN_OPPOSITE;
		}
		else if ("center".equals(textAlign))
		{
			mTextAlign = Layout.Alignment.ALIGN_CENTER;
		}
		else if ("justify".equals(textAlign))
		{
			mTextAlign = Layout.Alignment.ALIGN_NORMAL;
		}
		else
		{
			throw new RuntimeException("Invalid textAlign: " + textAlign);
		}
		markUpdated();
	}

	@HippyControllerProps(name = "text")
	public void text(String text)
	{
		mText = text;
		markUpdated();
	}

	@HippyControllerProps(name = NodeProps.ON_CLICK, defaultType = HippyControllerProps.BOOLEAN)
	public void clickEnable(boolean flag)
	{
		if (flag)
		{
			if (mGestureTypes == null)
			{
				mGestureTypes = new ArrayList<>();
			}
			mGestureTypes.add(NodeProps.ON_CLICK);
		}
	}

	@HippyControllerProps(name = NodeProps.ON_LONG_CLICK, defaultType = HippyControllerProps.BOOLEAN)
	public void longClickEnable(boolean flag)
	{
		if (flag)
		{
			if (mGestureTypes == null)
			{
				mGestureTypes = new ArrayList<>();
			}
			mGestureTypes.add(NodeProps.ON_LONG_CLICK);
		}
	}

	@HippyControllerProps(name = NodeProps.ON_PRESS_IN, defaultType = HippyControllerProps.BOOLEAN)
	public void pressInEnable(boolean flag)
	{
		if (flag)
		{
			if (mGestureTypes == null)
			{
				mGestureTypes = new ArrayList<>();
			}
			mGestureTypes.add(NodeProps.ON_PRESS_IN);
		}
	}

	@HippyControllerProps(name = NodeProps.ON_PRESS_OUT)
	public void pressOutEnable(boolean flag)
	{
		if (flag)
		{
			if (mGestureTypes == null)
			{
				mGestureTypes = new ArrayList<>();
			}
			mGestureTypes.add(NodeProps.ON_PRESS_OUT);
		}
	}

	@HippyControllerProps(name = NodeProps.ON_TOUCH_DOWN, defaultType = HippyControllerProps.BOOLEAN)
	public void touchDownEnable(boolean flag)
	{
		if (flag)
		{
			if (mGestureTypes == null)
			{
				mGestureTypes = new ArrayList<>();
			}
			mGestureTypes.add(NodeProps.ON_TOUCH_DOWN);
		}
	}

	@HippyControllerProps(name = NodeProps.ON_TOUCH_MOVE, defaultType = HippyControllerProps.BOOLEAN)
	public void touchUpEnable(boolean flag)
	{
		if (flag)
		{
			if (mGestureTypes == null)
			{
				mGestureTypes = new ArrayList<>();
			}
			mGestureTypes.add(NodeProps.ON_TOUCH_MOVE);
		}
	}

	@HippyControllerProps(name = NodeProps.ON_TOUCH_END, defaultType = HippyControllerProps.BOOLEAN)
	public void touchEndEnable(boolean flag)
	{
		if (flag)
		{
			if (mGestureTypes == null)
			{
				mGestureTypes = new ArrayList<>();
			}
			mGestureTypes.add(NodeProps.ON_TOUCH_END);
		}
	}

	@HippyControllerProps(name = NodeProps.ON_TOUCH_CANCEL, defaultType = HippyControllerProps.BOOLEAN)
	public void touchCancelable(boolean flag)
	{
		if (flag)
		{
			if (mGestureTypes == null)
			{
				mGestureTypes = new ArrayList<>();
			}
			mGestureTypes.add(NodeProps.ON_TOUCH_CANCEL);
		}
	}

	@HippyControllerProps(name = "enableScale", defaultType = HippyControllerProps.BOOLEAN)
	public void enableScale(boolean flag)
	{
		this.mEnableScale = flag;
		markUpdated();
	}

	@Override
	public void markUpdated()
	{
		super.markUpdated();
		if (!mIsVirtual)
		{
			super.dirty();
		}
	}

	@HippyControllerProps(name = NodeProps.NUMBER_OF_LINES, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
	public void setNumberOfLines(int numberOfLines)
	{
		mNumberOfLines = numberOfLines == 0 ? -1 : numberOfLines;
		markUpdated();
	}

	protected HippyFontScaleAdapter	mFontScaleAdapter;
	protected HippyEngineContext engineContext;
	protected HippyImageLoader mImageAdapter;

	@Override
	public void layoutBefore(HippyEngineContext context) {
		super.layoutBefore(context);

		engineContext = context;
		if (mFontScaleAdapter == null) {
			mFontScaleAdapter = context.getGlobalConfigs().getFontScaleAdapter();
		}

		if (mImageAdapter == null) {
			mImageAdapter = context.getGlobalConfigs().getImageLoaderAdapter();
		}
		
		if (mIsVirtual) {
			return;
		}

		if (mFontScaleAdapter != null && !TextUtils.isEmpty(mText)) {
			CharSequence s = mFontScaleAdapter.getEmoticonText(mText, mFontSize);
			if (s != null) {
				mText = s;
			}
		}

		mSpanned = createSpan(mText, true);
	}

	@SuppressWarnings("EmptyMethod")
	protected void createCustomSpan(CharSequence text, Spannable spannableText) {

	}

	private SpannableStringBuilder createSpan(CharSequence text, boolean useChild)
	{
		if (text != null)
		{
			SpannableStringBuilder spannable = new SpannableStringBuilder();
			List<SpanOperation> ops = new ArrayList<>();
			createSpanOperations(ops, spannable, this, text, useChild);

			for (int i = ops.size() - 1; i >= 0; i--)
			{
				SpanOperation op = ops.get(i);

				op.execute(spannable);
			}

			createCustomSpan(text, spannable);

			return spannable;
		}
		return new SpannableStringBuilder("");
	}

	private void createImageSpanOperation(List<SpanOperation> ops, SpannableStringBuilder sb, ImageNode imageNode) {
		String url = null;
		String defaultSource = null;
		HippyMap props = imageNode.getTotalProps();
		if (props != null) {
			url = props.getString("src");
			defaultSource = props.getString("defaultSource");
		}

		Drawable drawable = null;
		if (!TextUtils.isEmpty(defaultSource) && mImageAdapter != null) {
			HippyDrawable hippyDrawable = mImageAdapter.getImage(defaultSource, null);
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

		HippyImageSpan imageSpan = new HippyImageSpan(drawable, url, imageNode, mImageAdapter, engineContext);
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
  
	private void createSpanOperations(List<SpanOperation> ops, SpannableStringBuilder sb, TextNode textNode, CharSequence text, boolean useChild)
	{
		int start = sb.length();
		sb.append(text);
		int end = sb.length();
		if (start <= end)
		{

			ops.add(new SpanOperation(start, end, new ForegroundColorSpan(textNode.mColor)));
			if (textNode.mIsBackgroundColorSet)
			{
				ops.add(new SpanOperation(start, end, new BackgroundColorSpan(textNode.mBackgroundColor)));
			}
			if (textNode.mLetterSpacing != UNSET)
			{
				if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP)
				{
					ops.add(new SpanOperation(start, end, new HippyLetterSpacingSpan(textNode.mLetterSpacing)));
				}
			}
			if (textNode.mFontSize != UNSET)
			{
				int fontSize = textNode.mFontSize;

				if (textNode.mFontScaleAdapter != null && textNode.mEnableScale)
				{
					fontSize = (int) (fontSize * textNode.mFontScaleAdapter.getFontScale());
				}
				ops.add(new SpanOperation(start, end, new AbsoluteSizeSpan(fontSize)));
			}

			if (textNode.mFontStyle != UNSET || textNode.mFontWeight != UNSET || textNode.mFontFamily != null)
			{
				ops.add(new SpanOperation(start, end, new HippyStyleSpan(textNode.mFontStyle, textNode.mFontWeight, textNode.mFontFamily, mFontScaleAdapter)));
			}
			if (textNode.mIsUnderlineTextDecorationSet)
			{
				ops.add(new SpanOperation(start, end, new UnderlineSpan()));
			}
			if (textNode.mIsLineThroughTextDecorationSet)
			{
				ops.add(new SpanOperation(start, end, new StrikethroughSpan()));
			}
			if (textNode.mTextShadowOffsetDx != 0 || textNode.mTextShadowOffsetDy != 0)
			{
				ops.add(new SpanOperation(start, end, new HippyShadowSpan(textNode.mTextShadowOffsetDx, textNode.mTextShadowOffsetDy,
						textNode.mTextShadowRadius, textNode.mTextShadowColor)));
			}
			if (textNode.mLineHeight != UNSET)
			{
				float lineHeight = textNode.mLineHeight;

				if (textNode.mFontScaleAdapter != null && textNode.mEnableScale)
				{
					lineHeight = (lineHeight * textNode.mFontScaleAdapter.getFontScale());
				}
				ops.add(new SpanOperation(start, end, new HippyLineHeightSpan(lineHeight)));
			}

			if (textNode.mGestureTypes != null && textNode.mGestureTypes.size() > 0)
			{
				HippyNativeGestureSpan span = new HippyNativeGestureSpan(textNode.getId(), isVirtual());
				span.addGestureTypes(textNode.mGestureTypes);
				ops.add(new SpanOperation(start, end, span));
			}
		}

		if (useChild) {
			for (int i = 0; i < textNode.getChildCount(); i++) {
				DomNode domNode = textNode.getChildAt(i);
				if (domNode instanceof TextNode) {
					TextNode tempNode = (TextNode)domNode;
					CharSequence tempText = tempNode.mText;
					if (mFontScaleAdapter != null && !TextUtils.isEmpty(tempText)) {
						CharSequence s = mFontScaleAdapter.getEmoticonText(tempText, tempNode.mFontSize);
						if (s != null) {
							tempText = s;
						}
					}
					createSpanOperations(ops, sb, tempNode, tempText, useChild);
				} else if (domNode instanceof ImageNode) {
					createImageSpanOperation(ops, sb, (ImageNode)domNode);
				} else {
					throw new RuntimeException(domNode.getViewClass() + "is not support in Text");
				}

				domNode.markUpdateSeen();
			}
		}
	}

	private static final FlexNodeAPI.MeasureFunction	TEXT_MEASURE_FUNCTION	= new FlexNodeAPI.MeasureFunction()
																				{
																					@Override
																					public long measure(FlexNodeAPI node, float width,
																							FlexMeasureMode widthMode, float height,
																							FlexMeasureMode heightMode)
																					{
																						TextNode reactCSSNode = (TextNode) node;

																						Layout layout = null;
																						boolean exception = false;

																						try
																						{

																							layout = reactCSSNode.createLayout(width, widthMode);
																						}
																						catch (Throwable throwable)
																						{
																							LogUtils.e("TextNode", "text createLayout", throwable);
																							exception = true;
																						}

																						if (exception || layout == null)
																						{
																							return FlexOutput.make(width, height);
																						}
																						else
																						{
																							LogUtils.d("TextNode",
																									"measure:" + " w: " + layout.getWidth() + " h: "
																											+ layout.getHeight());
																							return FlexOutput.make(layout.getWidth(),
																									layout.getHeight());
																						}
																					}
																				};

	public void layoutAfter(HippyEngineContext context)
	{
		if (!isVirtual())
		{
			LogUtils.d("TextNode", "measure:layoutAfter" + " w: " + getLayoutWidth() + " h: " + getLayoutHeight());
			Layout mLayout = createLayout(getLayoutWidth() - getPadding(FlexSpacing.LEFT) - getPadding(FlexSpacing.RIGHT), FlexMeasureMode.EXACTLY);
			context.getDomManager().postWarmLayout(mLayout);
			setData(mLayout);
		}

	}

	private Layout createLayout(float width, FlexMeasureMode widthMode)
	{
		TextPaint textPaint = sTextPaintInstance;
		Layout layout;
		Spanned text = mSpanned == null ? new SpannedString("") : mSpanned;
		BoringLayout.Metrics boring = null;
		try
		{
			boring = BoringLayout.isBoring(text, textPaint);
		}
		catch (Throwable e)
		{
			LogUtils.d("TextNode", "createLayout: " + e.getMessage());
		}
		float desiredWidth = boring == null ? Layout.getDesiredWidth(text, textPaint) : Float.NaN;

		boolean unconstrainedWidth = widthMode == FlexMeasureMode.UNDEFINED || width < 0;
		if (boring == null && (unconstrainedWidth || (!FlexConstants.isUndefined(desiredWidth) && desiredWidth <= width)))
		{
			layout = new StaticLayout(text, textPaint, (int) Math.ceil(desiredWidth), mTextAlign, 1.f, 0.f, true);
		}
		else if (boring != null && (unconstrainedWidth || boring.width <= width))
		{
			layout = BoringLayout.make(text, textPaint, boring.width, mTextAlign, 1.f, 0.f, boring, true);
		}
		else
		{
			layout = new StaticLayout(text, textPaint, (int) Math.ceil(width), mTextAlign, 1.f, 0.f, true);
		}
		if (mNumberOfLines != UNSET && mNumberOfLines > 0)
		{
			if (layout.getLineCount() > mNumberOfLines)
			{
				int lastLineStart = layout.getLineStart(mNumberOfLines - 1);
				int lastLineEnd = layout.getLineEnd(mNumberOfLines - 1);
				if (lastLineStart < lastLineEnd)
				{
					layout = createLayoutWithNumberOfLine(lastLineStart, lastLineEnd, layout.getWidth());
				}
			}
		}
		
		layout.getPaint().setTextSize(mFontSize);
		return layout;
	}

	private StaticLayout createLayoutWithNumberOfLine(int lastLineStart, int lastLineEnd, int width)
	{
		if (mSpanned == null)
		{
			return null;
		}
		String text = mSpanned.toString();
		SpannableStringBuilder temp = (SpannableStringBuilder) mSpanned.subSequence(0, text.length());
		String ellipsizeStr = (String)TextUtils.ellipsize(text.substring(lastLineStart), sTextPaintInstance, width, TextUtils.TruncateAt.END);
		String newString = text.subSequence(0, lastLineStart).toString()
				+ truncate(ellipsizeStr, sTextPaintInstance, width, mTruncateAt);

		int start = Math.max(newString.length() - 1, 0);
		CharacterStyle[] hippyStyleSpans = temp.getSpans(start, text.length(), CharacterStyle.class);
		if (hippyStyleSpans != null && hippyStyleSpans.length > 0)
		{
			for (CharacterStyle hippyStyleSpan : hippyStyleSpans)
			{
				if (temp.getSpanStart(hippyStyleSpan) >= start)
				{
					temp.removeSpan(hippyStyleSpan);
				}
			}
		}

		return new StaticLayout(temp.replace(start, text.length(), ELLIPSIS), sTextPaintInstance, width, mTextAlign, 1.f, 0.f,
				true);
	}

	private static final String	ELLIPSIS	= "\u2026";

	public String truncate(String source, TextPaint paint, int desired, TextUtils.TruncateAt truncateAt)
	{
		if (!TextUtils.isEmpty(source))
		{
			StringBuilder builder;
			Spanned spanned;
			StaticLayout layout;
			for (int i = source.length(); i > 0; i--)
			{
				builder = new StringBuilder(i + 1);
				if (truncateAt != null)
				{
					builder.append(source, 0, i > 1 ? i - 1 : i);
					builder.append(ELLIPSIS);
				}
				else
				{
					builder.append(source, 0, i);
				}
				spanned = createSpan(builder.toString(), false);
				layout = new StaticLayout(spanned, paint, desired, Layout.Alignment.ALIGN_NORMAL, 1, 0, true);
				if (layout.getLineCount() <= 1)
				{
					return spanned.toString();
				}
			}
		}
		return "";
	}

	private static class SpanOperation
	{
		protected final int		start;
		protected final int end;
		protected final Object	what;

		SpanOperation(int start, int end, Object what)
		{
			this.start = start;
			this.end = end;
			this.what = what;
		}

		public void execute(SpannableStringBuilder sb)
		{
			int spanFlags = Spannable.SPAN_EXCLUSIVE_INCLUSIVE;
			if (start == 0)
			{
				spanFlags = Spannable.SPAN_INCLUSIVE_INCLUSIVE;
			}

			try {
				sb.setSpan(what, start, end, spanFlags);
			} catch (Exception e) {
				LogUtils.e("TextNode", "setSpan exception msg: " + e.getMessage());
			}
		}
	}
}
