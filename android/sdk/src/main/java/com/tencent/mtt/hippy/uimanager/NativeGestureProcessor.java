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
package com.tencent.mtt.hippy.uimanager;

import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.view.MotionEvent;
import android.view.ViewConfiguration;

import com.tencent.mtt.hippy.dom.node.NodeProps;

public class NativeGestureProcessor
{

	static final int			PRESS_IN		= 1;
	static final int			PRESS_OUT		= 2;
	private static final int	TAP_TIMEOUT		= ViewConfiguration.getTapTimeout();
	private static final int	TOUCH_SLOP		= ViewConfiguration.getTouchSlop();

	boolean						mNoPressIn		= false;
	final Callback				mCallback;
	private Handler				mHandler;

	private float				mLastPressInX	= 0;
	private float				mLastPressInY	= 0;

	public NativeGestureProcessor(Callback callback)
	{
		this.mCallback = callback;
	}

	public Handler getGestureHandler()
	{
		if (mHandler == null)
		{
			mHandler = new GestureHandler(this);
		}
		return mHandler;
	}

	private Callback getCallback()
	{
		return mCallback;
	}

	public boolean onTouchEvent(MotionEvent event)
	{
		int action = event.getAction() & MotionEvent.ACTION_MASK;
		boolean handle = false;
		switch (action)
		{
			case MotionEvent.ACTION_DOWN:
			{
				if (mCallback.needHandle(NodeProps.ON_PRESS_IN))
				{
					mNoPressIn = false;
					mLastPressInX = event.getX();
					mLastPressInY = event.getY();
					getGestureHandler().sendEmptyMessageDelayed(PRESS_IN, TAP_TIMEOUT);
					handle = true;
				}
				else
				{
					mNoPressIn = true;
				}

				if (mCallback.needHandle(NodeProps.ON_TOUCH_DOWN))
				{
					mCallback.handle(NodeProps.ON_TOUCH_DOWN, event.getX(), event.getY());
					handle = true;
				}

				if (!handle &&  mCallback.needHandle(NodeProps.ON_TOUCH_MOVE))
				{
					handle = true;
				}

				if (!handle && mCallback.needHandle(NodeProps.ON_TOUCH_END))
				{
					handle = true;
				}

				if (!handle && mCallback.needHandle(NodeProps.ON_TOUCH_CANCEL))
				{
					handle = true;
				}
				break;
			}
			case MotionEvent.ACTION_MOVE:
			{
				if (mCallback.needHandle(NodeProps.ON_TOUCH_MOVE))
				{
					mCallback.handle(NodeProps.ON_TOUCH_MOVE, event.getX(), event.getY());
					handle = true;
				}

				if (!handle && mCallback.needHandle(NodeProps.ON_TOUCH_END))
				{
					handle = true;
				}

				if (!handle && mCallback.needHandle(NodeProps.ON_TOUCH_CANCEL))
				{
					handle = true;
				}

				if (!mNoPressIn)
				{
					float distX = Math.abs(event.getX() - mLastPressInX);
					float distY = Math.abs(event.getY() - mLastPressInY);
					if (distX > TOUCH_SLOP || distY > TOUCH_SLOP)
					{
						getGestureHandler().removeMessages(PRESS_IN);
						mNoPressIn = true;
					}
				}

				break;
			}
			case MotionEvent.ACTION_UP:
			{
				if (mCallback.needHandle(NodeProps.ON_TOUCH_END))
				{
					mCallback.handle(NodeProps.ON_TOUCH_END, event.getX(), event.getY());
					handle = true;
				}

				if (mNoPressIn && mCallback.needHandle(NodeProps.ON_PRESS_OUT))
				{
					mCallback.handle(NodeProps.ON_PRESS_OUT, event.getX(), event.getY());
					handle = true;
				}
				else if (!mNoPressIn && mCallback.needHandle(NodeProps.ON_PRESS_OUT))
				{
					getGestureHandler().sendEmptyMessageDelayed(PRESS_OUT, TAP_TIMEOUT);
					handle = true;
				}

				break;
			}
			case MotionEvent.ACTION_CANCEL:
			case MotionEvent.ACTION_OUTSIDE:
			{
				if (mCallback.needHandle(NodeProps.ON_TOUCH_CANCEL))
				{
					mCallback.handle(NodeProps.ON_TOUCH_CANCEL, event.getX(), event.getY());
					handle = true;
				}

				if (mNoPressIn && mCallback.needHandle(NodeProps.ON_PRESS_OUT))
				{
					mCallback.handle(NodeProps.ON_PRESS_OUT, event.getX(), event.getY());
					handle = true;
				}
				else if (!mNoPressIn && mCallback.needHandle(NodeProps.ON_PRESS_OUT))
				{
					if (getGestureHandler().hasMessages(PRESS_IN))
					{
						getGestureHandler().removeMessages(PRESS_IN);
						break;
					}
					getGestureHandler().sendEmptyMessageDelayed(PRESS_OUT, TAP_TIMEOUT);
					handle = true;
				}
				break;
			}
		}
		return handle;
	}

	public interface Callback
	{
		boolean needHandle(String type);

		void handle(String type, float x, float y);
	}

	private static class GestureHandler extends android.os.Handler
	{
		private final NativeGestureProcessor mDispatcher;
		private final NativeGestureProcessor.Callback mCallback;

		public GestureHandler(NativeGestureProcessor dispatcher)
		{
			super(Looper.getMainLooper());
			mDispatcher = dispatcher;
			mCallback = mDispatcher.getCallback();
		}

		@Override
		public void handleMessage(Message msg)
		{
			switch (msg.what)
			{
				case PRESS_IN:
				{
					mCallback.handle(NodeProps.ON_PRESS_IN, -1, -1);
					mDispatcher.mNoPressIn = true;
					break;
				}
				case PRESS_OUT:
				{
					mCallback.handle(NodeProps.ON_PRESS_OUT, -1, -1);
					break;
				}
			}
		}
	}
}
