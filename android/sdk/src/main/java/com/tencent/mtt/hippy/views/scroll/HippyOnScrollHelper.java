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
package com.tencent.mtt.hippy.views.scroll;

import android.os.SystemClock;

public class HippyOnScrollHelper
{
	private static final int	MIN_EVENT_SEPARATION_MS	= 10;

	private int					mPrevX					= Integer.MIN_VALUE;
	private int					mPrevY					= Integer.MIN_VALUE;
	private long				mLastScrollEventTimeMs	= -(MIN_EVENT_SEPARATION_MS + 1);

	public boolean onScrollChanged(int x, int y)
	{
		long eventTime = SystemClock.uptimeMillis();
		boolean shouldDispatch = eventTime - mLastScrollEventTimeMs > MIN_EVENT_SEPARATION_MS || mPrevX != x || mPrevY != y;

		mLastScrollEventTimeMs = eventTime;
		mPrevX = x;
		mPrevY = y;

		return shouldDispatch;
	}
}
