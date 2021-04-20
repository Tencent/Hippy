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
package com.tencent.mtt.hippy.modules.nativemodules.animation;

import com.tencent.mtt.hippy.common.HippyArray;

/**
 * FileName: ValueTransformer
 * Description：
 * History：
 * 1.0 xiandongluo on 2018/2/11
 */
public class ValueTransformer
{

	protected final HippyArray	mInputRange;
	protected final HippyArray	mOutputRange;

	public ValueTransformer(HippyArray input, HippyArray output)
	{
		this.mInputRange = input;
		this.mOutputRange = output;
	}

	public Object transform(Number value)
	{
		if (mInputRange == null)
		{
			return null;
		}
		if (mOutputRange == null)
		{
			return null;
		}
		int size = mInputRange.size();
		if (size != mOutputRange.size())
		{
			return null;
		}
		if (size == 0)
		{
			return null;
		}

		int bestIndex = 0;
		double bestSpacing = -1;
		Object obj;
		double rangeValue;
		double transformValue = value.doubleValue();
		double spacing;
		for (int i = 0; i < size; i++)
		{
			obj = mInputRange.get(i);
			if (!(obj instanceof Number))
			{
				return null;
			}

			rangeValue = ((Number) obj).doubleValue();
			if (rangeValue <= transformValue)
			{
				spacing = Math.abs(transformValue - rangeValue);
				if (spacing < bestSpacing || bestSpacing == -1)
				{
					bestIndex = i;
					bestSpacing = spacing;
				}
			}
		}

		return mOutputRange.get(bestIndex);
	}
}
