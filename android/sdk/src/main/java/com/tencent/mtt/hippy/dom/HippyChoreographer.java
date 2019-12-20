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


package com.tencent.mtt.hippy.dom;

import java.util.ArrayDeque;

/**
 * A simple wrapper around Choreographer that allows us to control the order
 * certain callbacks
 * are executed within a given frame. The main difference is that we enforce
 * this is accessed from
 * the UI thread: this is because this ordering cannot be guaranteed across
 * multiple threads.
 */
public class HippyChoreographer
{

	public interface FrameCallback
	{
		void doFrame(long frameTimeNanos);
	}


	private static HippyChoreographer	sInstance;

	public static HippyChoreographer getInstance()
	{
		if (sInstance == null)
		{
			sInstance = new HippyChoreographer();
		}
		return sInstance;
	}

	private final HippyChoreographerDispatcher	mReactChoreographerDispatcher;
	final ArrayDeque<FrameCallback>				mCallbackQueues;

	int											mTotalCallbacks		= 0;
	boolean										mHasPostedCallback	= false;

	private HippyChoreographer()
	{
		mReactChoreographerDispatcher = new HippyChoreographerDispatcher();
		mCallbackQueues = new ArrayDeque<>();
	}

	public void postFrameCallback(FrameCallback frameCallback)
	{
		if (!mCallbackQueues.contains(frameCallback))
		{
			mCallbackQueues.addLast(frameCallback);
			mTotalCallbacks++;
			if (!mHasPostedCallback)
			{
				try
				{
					ChoreographerCompat.getInstance().postFrameCallback(mReactChoreographerDispatcher);
					mHasPostedCallback = true;
				}
				catch (Exception e)
				{

				}
			}
		}
	}

	public void removeFrameCallback(FrameCallback frameCallback)
	{
		if (mCallbackQueues.removeFirstOccurrence(frameCallback))
		{
			mTotalCallbacks--;
			maybeRemoveFrameCallback();
		}
	}

	void maybeRemoveFrameCallback()
	{
		if (mTotalCallbacks == 0 && mHasPostedCallback)
		{
			ChoreographerCompat.getInstance().removeFrameCallback(mReactChoreographerDispatcher);
			mHasPostedCallback = false;
		}
	}

	private class HippyChoreographerDispatcher implements FrameCallback
	{

		@Override
		public void doFrame(long frameTimeNanos)
		{
			mHasPostedCallback = false;
			int initialLength = mCallbackQueues.size();
			for (int callback = 0; callback < initialLength; callback++)
			{
				mCallbackQueues.removeFirst().doFrame(frameTimeNanos);
				mTotalCallbacks--;
			}
			maybeRemoveFrameCallback();
		}
	}
}
