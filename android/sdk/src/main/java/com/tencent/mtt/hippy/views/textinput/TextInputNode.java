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
package com.tencent.mtt.hippy.views.textinput;

import android.util.TypedValue;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.flex.FlexMeasureMode;
import com.tencent.mtt.hippy.dom.flex.FlexNodeAPI;
import com.tencent.mtt.hippy.dom.flex.FlexOutput;
import com.tencent.mtt.hippy.dom.flex.FlexSpacing;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.dom.node.TextNode;
import com.tencent.mtt.hippy.utils.ContextHolder;
import com.tencent.mtt.hippy.utils.PixelUtil;

/**
 * @Description: TODO
 * @author: edsheng
 * @date: 2017/12/20 12:17
 * @version: V1.0
 */

public class TextInputNode extends TextNode implements FlexNodeAPI.MeasureFunction
{
	private EditText	mEditText;
	private float[]		mComputedPadding;


	public TextInputNode(boolean isvurtla)
	{
		super(isvurtla);
		setMeasureFunction(this);
	}

	@Override
	public void updateProps(HippyMap props)
	{

	}

	@Override
	public void layoutBefore(HippyEngineContext context)
	{

		if (mEditText == null)
		{
			mEditText = new EditText(ContextHolder.getAppContext());
			mEditText.setLayoutParams(new ViewGroup.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT));

			setDefaultPadding(FlexSpacing.START, mEditText.getPaddingLeft());
			setDefaultPadding(FlexSpacing.TOP, mEditText.getPaddingTop());
			setDefaultPadding(FlexSpacing.END, mEditText.getPaddingRight());
			setDefaultPadding(FlexSpacing.BOTTOM, mEditText.getPaddingBottom());
			mComputedPadding = new float[] { getPadding(FlexSpacing.START), getPadding(FlexSpacing.TOP), getPadding(FlexSpacing.END), getPadding(FlexSpacing.BOTTOM), };
		}
	}

	@Override
	public void layoutAfter(HippyEngineContext context)
	{
		// 不能删
	}

	private int getMeasureSpec(float size, FlexMeasureMode mode)
	{
		if (mode == FlexMeasureMode.EXACTLY)
		{
			return View.MeasureSpec.makeMeasureSpec((int) size, View.MeasureSpec.EXACTLY);
		}
		else if (mode == FlexMeasureMode.AT_MOST)
		{
			return View.MeasureSpec.makeMeasureSpec((int) size, View.MeasureSpec.AT_MOST);
		}
		else
		{
			return View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED);
		}
	}
	@Override
	public void setPadding(int spacingType, float padding) {
		super.setPadding(spacingType, padding);
		mComputedPadding = new float[] {
				getPadding(FlexSpacing.START),
				getPadding(FlexSpacing.TOP),
				getPadding(FlexSpacing.END),
				getPadding(FlexSpacing.BOTTOM),
		};
		markUpdated();
	}
	@Override
	public long measure(FlexNodeAPI node, float width, FlexMeasureMode widthMode, float height, FlexMeasureMode heightMode)
	{
		mEditText.setTextSize(TypedValue.COMPLEX_UNIT_PX, mFontSize == UNSET ? (int) Math.ceil(PixelUtil.dp2px(NodeProps.FONT_SIZE_SP)) : mFontSize);
		mComputedPadding = new float[] { getPadding(FlexSpacing.START), getPadding(FlexSpacing.TOP), getPadding(FlexSpacing.END), getPadding(FlexSpacing.BOTTOM), };
		mEditText.setPadding((int) Math.floor(getPadding(FlexSpacing.START)), (int) Math.floor(getPadding(FlexSpacing.TOP)),
				(int) Math.floor(getPadding(FlexSpacing.END)), (int) Math.floor(getPadding(FlexSpacing.BOTTOM)));

		if (mNumberOfLines != UNSET)
		{
			mEditText.setLines(mNumberOfLines);
		}
		mEditText.measure(getMeasureSpec(width, widthMode), getMeasureSpec(height, heightMode));

		return FlexOutput.make(mEditText.getMeasuredWidth(), mEditText.getMeasuredHeight());
	}
}
