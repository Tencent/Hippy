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
package com.tencent.smtt.flexbox;

import com.tencent.mtt.hippy.dom.flex.FlexAlign;
import com.tencent.mtt.hippy.dom.flex.FlexConstants;
import com.tencent.mtt.hippy.dom.flex.FlexDirection;
import com.tencent.mtt.hippy.dom.flex.FlexCSSDirection;
import com.tencent.mtt.hippy.dom.flex.FlexJustify;
import com.tencent.mtt.hippy.dom.flex.FlexOverflow;
import com.tencent.mtt.hippy.dom.flex.FlexPositionType;
import com.tencent.mtt.hippy.dom.flex.FlexWrap;

@SuppressWarnings("all")
public class FlexNodeStyle
{
	private long	mNativePointer	= 0;

	public FlexNodeStyle(long flexNode)
	{
		mNativePointer = nativeFlexNodeStyleNew();
		if (mNativePointer == 0)
		{
			throw new IllegalStateException("Failed to allocate native memory");
		}
		nativeSetFlexNode(mNativePointer, flexNode);
	}

	@Override
	public String toString()
	{

		StringBuilder indentation = new StringBuilder();
		indentation.append("style: {");
		indentation.append("flex-direction: " + this.getFlexDirection().toString().toLowerCase() + ", ");

		if (this.getFlexGrow() != 0)
			indentation.append("flex-grow: " + this.getFlexGrow() + ", ");

		if (this.getFlexBasis().value() != FlexConstants.UNDEFINED)
			indentation.append("flex-basis: " + this.getFlexBasis().value() + ", ");

		if (this.getFlexShrink() != 0)
			indentation.append("flex-shrink: " + this.getFlexShrink() + ", ");

		if (this.getJustifyContent() != FlexJustify.FLEX_START)
			indentation.append("justifycontent: " + this.getJustifyContent().toString().toLowerCase() + ", ");

		if (this.getAlignContent() != FlexAlign.FLEX_START)
			indentation.append("aligncontent: " + this.getAlignContent().toString().toLowerCase() + ", ");

		if (this.getAlignItems() != FlexAlign.STRETCH)
			indentation.append("alignitems: " + this.getAlignItems().toString().toLowerCase() + ", ");

		if (this.getAlignSelf() != FlexAlign.AUTO)
			indentation.append("alignself: " + this.getAlignSelf().toString().toLowerCase() + ", ");

		if (this.getWrap() != FlexWrap.NOWRAP)
			indentation.append("wrap: " + this.getWrap().toString().toLowerCase() + ", ");

		if (this.getOverflow() != FlexOverflow.VISIBLE)
			indentation.append("overflow: " + this.getOverflow().toString().toLowerCase() + ", ");

		if (this.getPositionType() != FlexPositionType.RELATIVE)
			indentation.append("positionType: " + this.getPositionType().toString().toLowerCase() + ", ");

		if (this.getWidth().value() != 0)
			indentation.append("width: " + this.getWidth().value() + ", ");

		if (this.getHeight().value() != 0)
			indentation.append("height: " + getHeight().value() + ", ");

		if (this.getMaxWidth().value() != 0)
			indentation.append("max-width: " + getMaxWidth().value() + ", ");

		if (this.getMaxHeight().value() != 0)
			indentation.append("max-height: " + getMaxHeight().value() + ", ");

		if (this.getMinWidth().value() != 0)
			indentation.append("min-height: " + getMinWidth().value() + ", ");

		if (this.getMinHeight().value() != 0)
			indentation.append("min-height: " + getMinHeight().value() + ", ");

		indentation.append("}");
		return indentation.toString();
	}

	@CalledByNative
	private static Object createFlexValue(float value, int unit)
	{
		return new FlexValue(value, FlexValue.Unit.fromInt(unit));
	}

	private native long nativeFlexNodeStyleNew();

	private native void nativeFlexNodeStyleFree(long nativeFlexNodeStyle);

	protected void finalize() throws Throwable
	{
		try
		{
			nativeFlexNodeStyleFree(mNativePointer);
			mNativePointer = 0;
		}
		finally
		{
			super.finalize();
		}
	}

	private native void nativeSetFlexNode(long nativeFlexNodeStyle, long nativeFlexNode);

	private FlexDirection mDirection = FlexDirection.LTR;

	private native int nativeFlexNodeStyleGetDirection(long nativeFlexNodeStyle);

	public FlexDirection getDirection()
	{
		return mDirection;
	}

	private native void nativeFlexNodeStyleSetDirection(long nativeFlexNodeStyle, int direction);

	public void setDirection(FlexDirection direction)
	{
		mDirection = direction;
		nativeFlexNodeStyleSetDirection(mNativePointer, direction.ordinal());
	}

	private FlexCSSDirection mFlexDirection;

	private native int nativeFlexNodeStyleGetFlexDirection(long nativeFlexNodeStyle);

	public FlexCSSDirection getFlexDirection()
	{
		return mFlexDirection;//CSSFlexDirection.fromInt(nativeFlexNodeStyleGetFlexDirection(mNativePointer));
	}

	private native void nativeFlexNodeStyleSetFlexDirection(long nativeFlexNodeStyle, int flexDirection);

	public void setFlexDirection(FlexCSSDirection flexDirection)
	{
		mFlexDirection = flexDirection;
		nativeFlexNodeStyleSetFlexDirection(mNativePointer, flexDirection.ordinal());
	}

	private FlexJustify mJustifyContent;

	private native int nativeFlexNodeStyleGetJustifyContent(long nativeFlexNodeStyle);

	public FlexJustify getJustifyContent()
	{
		return mJustifyContent;
	}

	private native void nativeFlexNodeStyleSetJustifyContent(long nativeFlexNodeStyle, int justifyContent);

	public void setJustifyContent(FlexJustify justifyContent)
	{
		int order = justifyContent.ordinal();
		mJustifyContent = justifyContent;
		switch (order)
		{//FLEX_START
			case 1:
			{//CENTER;
				order = 2;
				break;
			}
			case 2:
			{//FLEX_END;
				order = 3;
				break;
			}
			case 3:
			{//SPACE_BETWEEN;
				order = 6;
				break;
			}
			case 4:
			{//SPACE_AROUND;
				order = 7;
				break;
			}
			case 5:
			{//SPACE_EVENLY;
				order = 8;
				break;
			}
			case 0:
			default:
			{
				order = 1;//default FLEX_START
				break;
			}
		}
		nativeFlexNodeStyleSetJustifyContent(mNativePointer, order);
	}

	private FlexAlign mAlignItems;

	private native int nativeFlexNodeStyleGetAlignItems(long nativeFlexNodeStyle);

	public FlexAlign getAlignItems()
	{
		return mAlignItems;
	}

	private native void nativeFlexNodeStyleSetAlignItems(long nativeFlexNodeStyle, int alignItems);

	public void setAlignItems(FlexAlign alignItems)
	{
		mAlignItems = alignItems;
		nativeFlexNodeStyleSetAlignItems(mNativePointer, alignItems.ordinal());
	}

	private FlexAlign mAlignSelf;

	private native int nativeFlexNodeStyleGetAlignSelf(long nativeFlexNodeStyle);

	public FlexAlign getAlignSelf()
	{
		return mAlignSelf;
	}

	private native void nativeFlexNodeStyleSetAlignSelf(long nativeFlexNodeStyle, int alignSelf);

	public void setAlignSelf(FlexAlign alignSelf)
	{
		mAlignSelf = alignSelf;
		nativeFlexNodeStyleSetAlignSelf(mNativePointer, alignSelf.ordinal());
	}

	private FlexAlign mAlignContent;

	private native int nativeFlexNodeStyleGetAlignContent(long nativeFlexNodeStyle);

	public FlexAlign getAlignContent()
	{
		return mAlignContent;
	}

	private native void nativeFlexNodeStyleSetAlignContent(long nativeFlexNodeStyle, int alignContent);

	public void setAlignContent(FlexAlign alignContent)
	{
		mAlignContent = alignContent;
		nativeFlexNodeStyleSetAlignContent(mNativePointer, alignContent.ordinal());
	}

	private FlexPositionType mPositionType;

	private native int nativeFlexNodeStyleGetPositionType(long nativeFlexNodeStyle);

	public FlexPositionType getPositionType()
	{
		return mPositionType;
	}

	private native void nativeFlexNodeStyleSetPositionType(long nativeFlexNodeStyle, int positionType);

	public void setPositionType(FlexPositionType positionType)
	{
		mPositionType = positionType;
		nativeFlexNodeStyleSetPositionType(mNativePointer, positionType.ordinal());
	}

	private FlexWrap mFlexWrap;

	private native void nativeFlexNodeStyleSetFlexWrap(long nativeFlexNodeStyle, int wrapType);

	public void setWrap(FlexWrap flexWrap)
	{
		mFlexWrap = flexWrap;
		nativeFlexNodeStyleSetFlexWrap(mNativePointer, flexWrap.ordinal());
	}

	private native int nativeFlexNodeStyleGetFlexWrap(long nativeFlexNodeStyle);

	public FlexWrap getWrap()
	{
		return mFlexWrap;
	}

	private FlexOverflow mOverFlow;

	private native int nativeFlexNodeStyleGetOverflow(long nativeFlexNodeStyle);

	public FlexOverflow getOverflow()
	{
		return mOverFlow;
	}

	private native void nativeFlexNodeStyleSetOverflow(long nativeFlexNodeStyle, int overflow);

	public void setOverflow(FlexOverflow overflow)
	{
		mOverFlow = overflow;
		nativeFlexNodeStyleSetOverflow(mNativePointer, overflow.ordinal());
	}

	public enum Display
	{
		DISPLAY_FLEX,
		DISPLAY_NONE;
		public static Display fromInt(int value)
		{
			switch (value)
			{
				case 0:
					return DISPLAY_FLEX;
				case 1:
					return DISPLAY_NONE;
				default:
					throw new IllegalArgumentException("Unknown enum value: " + value);
			}
		}
	}

	private Display	mDisplay;

	private native int nativeFlexNodeStyleGetDisplay(long nativeFlexNodeStyle);

	public Display getDisplay()
	{
		return mDisplay;
	}

	private native void nativeFlexNodeStyleSetDisplay(long nativeFlexNodeStyle, int display);

	public void setDisplay(Display display)
	{
		mDisplay = display;
		nativeFlexNodeStyleSetDisplay(mNativePointer, display.ordinal());
	}

	private float	mFlex	= 0;

	private native float nativeFlexNodeStyleGetFlex(long nativeFlexNodeStyle);

	public float getFlex()
	{
		return mFlex;
	}

	private native void nativeFlexNodeStyleSetFlex(long nativeFlexNodeStyle, float flex);

	public void setFlex(float flex)
	{
		mFlex = flex;
		nativeFlexNodeStyleSetFlex(mNativePointer, flex);
	}

	private float	mFlexGrow;

	private native float nativeFlexNodeStyleGetFlexGrow(long nativeFlexNodeStyle);

	public float getFlexGrow()
	{
		return mFlexGrow;
	}

	private native void nativeFlexNodeStyleSetFlexGrow(long nativeFlexNodeStyle, float flexGrow);

	public void setFlexGrow(float flexGrow)
	{
		mFlexGrow = flexGrow;
		nativeFlexNodeStyleSetFlexGrow(mNativePointer, flexGrow);
	}

	private float	mFlexShrink	= 0;

	private native float nativeFlexNodeStyleGetFlexShrink(long nativeFlexNodeStyle);

	public float getFlexShrink()
	{
		return mFlexShrink;
	}

	private native void nativeFlexNodeStyleSetFlexShrink(long nativeFlexNodeStyle, float flexShrink);

	public void setFlexShrink(float flexShrink)
	{
		mFlexShrink = flexShrink;
		nativeFlexNodeStyleSetFlexShrink(mNativePointer, flexShrink);
	}

	private float	mFlexBasis	= 0;

	private native Object nativeFlexNodeStyleGetFlexBasis(long nativeFlexNodeStyle);

	public FlexValue getFlexBasis()
	{
		return new FlexValue(mFlexBasis, FlexValue.Unit.POINT);
	}

	private native void nativeFlexNodeStyleSetFlexBasis(long nativeFlexNodeStyle, float flexBasis);

	public void setFlexBasis(float flexBasis)
	{
		mFlexBasis = flexBasis;
		nativeFlexNodeStyleSetFlexBasis(mNativePointer, flexBasis);
	}

	private native void nativeFlexNodeStyleSetFlexBasisPercent(long nativeFlexNodeStyle, float percent);

	public void setFlexBasisPercent(float percent)
	{
		nativeFlexNodeStyleSetFlexBasisPercent(mNativePointer, percent);
	}

	private native void nativeFlexNodeStyleSetFlexBasisAuto(long nativeFlexNodeStyle);

	public void setFlexBasisAuto()
	{
		nativeFlexNodeStyleSetFlexBasisAuto(mNativePointer);
	}

	public enum Edge
	{
		EDGE_LEFT,
		EDGE_TOP,
		EDGE_RIGHT,
		EDGE_BOTTOM,
		EDGE_START,
		EDGE_END,
		EDGE_HORIZONTAL,
		EDGE_VERTICAL,
		EDGE_ALL;
		public static Edge fromInt(int value)
		{
			switch (value)
			{
				case 0:
					return EDGE_LEFT;
				case 1:
					return EDGE_TOP;
				case 2:
					return EDGE_RIGHT;
				case 3:
					return EDGE_BOTTOM;
				case 4:
					return EDGE_START;
				case 5:
					return EDGE_END;
				case 6:
					return EDGE_HORIZONTAL;
				case 7:
					return EDGE_VERTICAL;
				case 8:
					return EDGE_ALL;
				default:
					throw new IllegalArgumentException("Unknown enum value: " + value);
			}
		}
	}

	private final float[] mMargin = new float[Edge.EDGE_ALL.ordinal() + 1];
	private final float[] mPadding = new float[Edge.EDGE_ALL.ordinal() + 1];
	private final float[] mBorder = new float[Edge.EDGE_ALL.ordinal() + 1];
	private final float[] mPosition = new float[Edge.EDGE_ALL.ordinal() + 1];

	private native Object nativeFlexNodeStyleGetMargin(long nativeFlexNodeStyle, int edge);

	public FlexValue getMargin(Edge edge)
	{
		return new FlexValue(mMargin[edge.ordinal()], FlexValue.Unit.POINT);
	}

	private native void nativeFlexNodeStyleSetMargin(long nativeFlexNodeStyle, int edge, float margin);

	public void setMargin(Edge edge, float margin)
	{
		mMargin[edge.ordinal()] = margin;
		nativeFlexNodeStyleSetMargin(mNativePointer, edge.ordinal(), margin);
	}

	private native void nativeFlexNodeStyleSetMarginPercent(long nativeFlexNodeStyle, int edge, float percent);

	public void setMarginPercent(Edge edge, float percent)
	{
		nativeFlexNodeStyleSetMarginPercent(mNativePointer, edge.ordinal(), percent);
	}

	private native void nativeFlexNodeStyleSetMarginAuto(long nativeFlexNodeStyle, int edge);

	public void setMarginAuto(Edge edge)
	{
		nativeFlexNodeStyleSetMarginAuto(mNativePointer, edge.ordinal());
	}

	private native Object nativeFlexNodeStyleGetPadding(long nativeFlexNodeStyle, int edge);

	public FlexValue getPadding(Edge edge)
	{
		return new FlexValue(mPadding[edge.ordinal()], FlexValue.Unit.POINT);
	}

	private native void nativeFlexNodeStyleSetPadding(long nativeFlexNodeStyle, int edge, float padding);

	public void setPadding(Edge edge, float padding)
	{
		mPadding[edge.ordinal()] = padding;
		nativeFlexNodeStyleSetPadding(mNativePointer, edge.ordinal(), padding);
	}

	private native void nativeFlexNodeStyleSetPaddingPercent(long nativeFlexNodeStyle, int edge, float percent);

	public void setPaddingPercent(Edge edge, float percent)
	{
		nativeFlexNodeStyleSetPaddingPercent(mNativePointer, edge.ordinal(), percent);
	}

	private native Object nativeFlexNodeStyleGetBorder(long nativeFlexNodeStyle, int edge);

	public FlexValue getBorder(Edge edge)
	{
		return new FlexValue(mBorder[edge.ordinal()], FlexValue.Unit.POINT);
	}

	private native void nativeFlexNodeStyleSetBorder(long nativeFlexNodeStyle, int edge, float border);

	public void setBorder(Edge edge, float border)
	{
		mBorder[edge.ordinal()] = border;
		nativeFlexNodeStyleSetBorder(mNativePointer, edge.ordinal(), border);
	}

	private native Object nativeFlexNodeStyleGetPosition(long nativeFlexNodeStyle, int edge);

	public FlexValue getPosition(Edge edge)
	{
		return new FlexValue(mPosition[edge.ordinal()], FlexValue.Unit.POINT);
	}

	private native void nativeFlexNodeStyleSetPosition(long nativeFlexNodeStyle, int edge, float position);

	public void setPosition(Edge edge, float position)
	{
		mPosition[edge.ordinal()] = position;
		nativeFlexNodeStyleSetPosition(mNativePointer, edge.ordinal(), position);
	}

	private native void nativeFlexNodeStyleSetPositionPercent(long nativeFlexNodeStyle, int edge, float percent);

	public void setPositionPercent(Edge edge, float percent)
	{
		nativeFlexNodeStyleSetPositionPercent(mNativePointer, edge.ordinal(), percent);
	}

	private float	mWidth	= 0;

	private native Object nativeFlexNodeStyleGetWidth(long nativeFlexNodeStyle);

	public FlexValue getWidth()
	{
		return new FlexValue(mWidth, FlexValue.Unit.POINT);
	}

	private native void nativeFlexNodeStyleSetWidth(long nativeFlexNodeStyle, float width);

	public void setWidth(float width)
	{
		mWidth = width;
		nativeFlexNodeStyleSetWidth(mNativePointer, width);
	}

	private native void nativeFlexNodeStyleSetWidthPercent(long nativeFlexNodeStyle, float percent);

	public void setWidthPercent(float percent)
	{
		nativeFlexNodeStyleSetWidthPercent(mNativePointer, percent);
	}

	private native void nativeFlexNodeStyleSetWidthAuto(long nativeFlexNodeStyle);

	public void setWidthAuto()
	{
		nativeFlexNodeStyleSetWidthAuto(mNativePointer);
	}

	private float	mHeight	= 0;

	private native Object nativeFlexNodeStyleGetHeight(long nativeFlexNodeStyle);

	public FlexValue getHeight()
	{
		return new FlexValue(mHeight, FlexValue.Unit.POINT);
	}

	private native void nativeFlexNodeStyleSetHeight(long nativeFlexNodeStyle, float height);

	public void setHeight(float height)
	{
		mHeight = height;
		nativeFlexNodeStyleSetHeight(mNativePointer, height);
	}

	private native void nativeFlexNodeStyleSetHeightPercent(long nativeFlexNodeStyle, float percent);

	public void setHeightPercent(float percent)
	{
		nativeFlexNodeStyleSetHeightPercent(mNativePointer, percent);
	}

	private native void nativeFlexNodeStyleSetHeightAuto(long nativeFlexNodeStyle);

	public void setHeightAuto()
	{
		nativeFlexNodeStyleSetHeightAuto(mNativePointer);
	}

	private float	mMinWidth;

	private native Object nativeFlexNodeStyleGetMinWidth(long nativeFlexNodeStyle);

	public FlexValue getMinWidth()
	{
		return new FlexValue(mMinWidth, FlexValue.Unit.POINT);//(FlexValue) nativeFlexNodeStyleGetMinWidth(mNativePointer);
	}

	private native void nativeFlexNodeStyleSetMinWidth(long nativeFlexNodeStyle, float minWidth);

	public void setMinWidth(float minWidth)
	{
		mMinWidth = minWidth;
		nativeFlexNodeStyleSetMinWidth(mNativePointer, minWidth);
	}

	private native void nativeFlexNodeStyleSetMinWidthPercent(long nativeFlexNodeStyle, float percent);

	public void setMinWidthPercent(float percent)
	{
		nativeFlexNodeStyleSetMinWidthPercent(mNativePointer, percent);
	}

	private float	mMinHeight;

	private native Object nativeFlexNodeStyleGetMinHeight(long nativeFlexNodeStyle);

	public FlexValue getMinHeight()
	{
		return new FlexValue(mMinHeight, FlexValue.Unit.POINT);
	}

	private native void nativeFlexNodeStyleSetMinHeight(long nativeFlexNodeStyle, float minHeight);

	public void setMinHeight(float minHeight)
	{
		mMinHeight = minHeight;
		nativeFlexNodeStyleSetMinHeight(mNativePointer, minHeight);
	}

	private native void nativeFlexNodeStyleSetMinHeightPercent(long nativeFlexNodeStyle, float percent);

	public void setMinHeightPercent(float percent)
	{
		nativeFlexNodeStyleSetMinHeightPercent(mNativePointer, percent);
	}

	private float	mMaxWidth;

	private native Object nativeFlexNodeStyleGetMaxWidth(long nativeFlexNodeStyle);

	public FlexValue getMaxWidth()
	{
		return new FlexValue(mMaxWidth, FlexValue.Unit.POINT);
	}

	private native void nativeFlexNodeStyleSetMaxWidth(long nativeFlexNodeStyle, float maxWidth);

	public void setMaxWidth(float maxWidth)
	{
		mMaxWidth = maxWidth;
		nativeFlexNodeStyleSetMaxWidth(mNativePointer, maxWidth);
	}

	private native void nativeFlexNodeStyleSetMaxWidthPercent(long nativeFlexNodeStyle, float percent);

	public void setMaxWidthPercent(float percent)
	{
		nativeFlexNodeStyleSetMaxWidthPercent(mNativePointer, percent);
	}

	private float	mMaxHeight;

	private native Object nativeFlexNodeStyleGetMaxHeight(long nativeFlexNodeStyle);

	public FlexValue getMaxHeight()
	{
		return new FlexValue(mMaxHeight, FlexValue.Unit.POINT);
	}

	private native void nativeFlexNodeStyleSetMaxHeight(long nativeFlexNodeStyle, float maxHeight);

	public void setMaxHeight(float maxHeight)
	{
		mMaxHeight = maxHeight;
		nativeFlexNodeStyleSetMaxHeight(mNativePointer, maxHeight);
	}

	private native void nativeFlexNodeStyleSetMaxHeightPercent(long nativeFlexNodeStyle, float percent);

	public void setMaxHeightPercent(float percent)
	{
		nativeFlexNodeStyleSetMaxHeightPercent(mNativePointer, percent);
	}

	private float mAspectRatio;

	private native float nativeFlexNodeStyleGetAspectRatio(long nativeFlexNodeStyle);

	public float getAspectRatio()
	{
		return mAspectRatio;
	}

	private native void nativeFlexNodeStyleSetAspectRatio(long nativeFlexNodeStyle, float aspectRatio);

	public void setAspectRatio(float aspectRatio)
	{
		mAspectRatio = aspectRatio;
		nativeFlexNodeStyleSetAspectRatio(mNativePointer, aspectRatio);
	}

}
