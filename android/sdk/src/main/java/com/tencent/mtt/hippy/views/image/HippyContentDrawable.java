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
package com.tencent.mtt.hippy.views.image;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;

import com.tencent.mtt.hippy.utils.ContextHolder;
import com.tencent.mtt.supportui.views.asyncimage.ContentDrawable;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffColorFilter;
import android.graphics.Rect;
import android.graphics.drawable.NinePatchDrawable;

/**
 * Created by leonardgong on 2017/12/5 0005.
 */

class HippyContentDrawable extends ContentDrawable
{
	private Rect				mNinePatchRect;
	private NinePatchDrawable	mNinePatchDrawable;

	HippyContentDrawable()
	{
		super();
	}

	void setNinePatchCoordinate(Rect rect)
	{
		mNinePatchRect = rect;
		mNinePatchDrawable = null;
	}

	@Override
	public void draw(Canvas canvas)
	{
		// 处理.9Patch的形式，不支持缩放、圆角
		if (mNinePatchRect != null && mContentBitmap != null)
		{
			if (mNinePatchDrawable == null)
			{
				mNinePatchDrawable = new NinePatchDrawable(ContextHolder.getAppContext().getResources(), mContentBitmap,
						createNinePatchTrunk(mContentBitmap, mNinePatchRect), null, null);
			}
			mNinePatchDrawable.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
			mNinePatchDrawable.setAlpha(mAlpha);
			if (mTintColor != Color.TRANSPARENT)
			{
				mNinePatchDrawable.setColorFilter(new PorterDuffColorFilter(mTintColor, PorterDuff.Mode.SRC_ATOP));
			}
			mNinePatchDrawable.draw(canvas);
			return;
		}
		super.draw(canvas);
	}

	private byte[] createNinePatchTrunk(Bitmap bitmap, Rect ninePatchRect)
	{
		int[] xRegions = new int[] { ninePatchRect.left, bitmap.getWidth() -ninePatchRect.right };
		int[] yRegions = new int[] { ninePatchRect.top, bitmap.getHeight()- ninePatchRect.bottom };
		int NO_COLOR = 0x00000001;
		int colorSize = 9;
		int bufferSize = xRegions.length * 4 + yRegions.length * 4 + colorSize * 4 + 32;

		ByteBuffer byteBuffer = ByteBuffer.allocate(bufferSize).order(ByteOrder.nativeOrder());
		// 第一个byte，要不等于0
		byteBuffer.put((byte) 1);

		//mDivX length
		byteBuffer.put((byte) 2);
		//mDivY length
		byteBuffer.put((byte) 2);
		//mColors length
		byteBuffer.put((byte) colorSize);

		//skip
		byteBuffer.putInt(0);
		byteBuffer.putInt(0);

		//padding 先设为0
		byteBuffer.putInt(0);
		byteBuffer.putInt(0);
		byteBuffer.putInt(0);
		byteBuffer.putInt(0);

		//skip
		byteBuffer.putInt(0);

		// mDivX
		byteBuffer.putInt(xRegions[0]);
		byteBuffer.putInt(xRegions[1]);

		// mDivY
		byteBuffer.putInt(yRegions[0]);
		byteBuffer.putInt(yRegions[1]);

		// mColors
		for (int i = 0; i < colorSize; i++)
		{
			byteBuffer.putInt(NO_COLOR);
		}

		return byteBuffer.array();
	}
}
