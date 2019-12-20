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

import android.graphics.Canvas;
import android.graphics.Picture;
import android.os.Build;
import android.text.Layout;
import android.text.StaticLayout;

import com.tencent.mtt.hippy.common.HippyHandlerThread;
import com.tencent.mtt.hippy.common.HippyThreadRunnable;
import com.tencent.mtt.hippy.utils.LogUtils;

/**
 * @Description: TODO
 * @author: edsheng
 * @date: 2017/12/12 18:00
 * @version: V1.0
 */

public class LayoutHelper
{
	private HippyHandlerThread	mHandlerThread;
	private Picture				mPicture	= new Picture();

	public  LayoutHelper()
	{
		mHandlerThread = new HippyHandlerThread("text-warm-thread");
	}

	public void release()
	{
		if (mHandlerThread != null)
		{
			mHandlerThread.quit();
		}
		mHandlerThread = null;
	}

	public void postWarmLayout(Layout layout)
	{
		if (mHandlerThread != null && mHandlerThread.isThreadAlive())
			mHandlerThread.runOnQueue(new HippyThreadRunnable<Layout>(layout)
			{
				@Override
				public void run(Layout param)
				{
					warmUpLayout(param);
				}
			});
	}

	private int getHeight(Layout layout)
	{
		if (layout == null)
		{
			return 0;
		}

		int extra = 0;
		if (Build.VERSION.SDK_INT < Build.VERSION_CODES.KITKAT_WATCH && layout instanceof StaticLayout)
		{
			int above = layout.getLineAscent(layout.getLineCount() - 1);
			int below = layout.getLineDescent(layout.getLineCount() - 1);
			float originalSize = (below - above - layout.getSpacingAdd()) / layout.getSpacingMultiplier();
			float ex = below - above - originalSize;
			if (ex >= 0)
			{
				extra = (int) (ex + 0.5);
			}
			else
			{
				extra = -(int) (-ex + 0.5);
			}
		}
		return layout.getHeight() - extra;
	}

	private int getWidth(Layout layout)
	{
		if (layout == null)
		{
			return 0;
		}

		// Supplying VERY_WIDE will make layout.getWidth() return a very large value.
		int count = layout.getLineCount();
		int maxWidth = 0;

		for (int i = 0; i < count; i++)
		{
			maxWidth = Math.max(maxWidth, (int) layout.getLineRight(i));
		}

		return maxWidth;
	}

	private boolean warmUpLayout(Layout layout)
	{
		boolean result;
		try
		{
			Canvas canvas = mPicture.beginRecording(getWidth(layout), getHeight(layout));
			layout.draw(canvas);
			mPicture.endRecording();
			result = true;
		}
		catch (Exception e)
		{
			LogUtils.e("TextNode", "warmUpTextLayoutCache error", e);
			result = false;
		}
		return result;
	}


}
