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

import android.text.TextPaint;
import android.text.style.MetricAffectingSpan;
import com.tencent.mtt.hippy.adapter.font.HippyFontScaleAdapter;

public class HippyStyleSpan extends MetricAffectingSpan
{
	private final int			mStyle;
	private final int			mWeight;
	private final String		mFontFamily;
	private final HippyFontScaleAdapter fontAdapter;

	public HippyStyleSpan(int fontStyle, int fontWeight, String fontFamily, HippyFontScaleAdapter adapter)
	{
		mStyle = fontStyle;
		mWeight = fontWeight;
		mFontFamily = fontFamily;
		fontAdapter = adapter;
	}

	@Override
	public void updateDrawState(TextPaint ds)
	{
		TypeFaceUtil.apply(ds, mStyle, mWeight, mFontFamily, fontAdapter);
	}

	@Override
	public void updateMeasureState(TextPaint paint)
	{
		TypeFaceUtil.apply(paint, mStyle, mWeight, mFontFamily, fontAdapter);
	}

	public int getStyle()
	{
		return (mStyle == TextNode.UNSET ? 0 : mStyle);
	}




}
