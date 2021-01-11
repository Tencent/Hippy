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
package com.tencent.mtt.hippy.common;

/**
 * @author: edsheng
 * @date: 2017/11/23 15:21
 * @version: V1.0
 */

public class ThreadExecutor implements Thread.UncaughtExceptionHandler
{
	HippyHandlerThread			mJsThread;
	HippyHandlerThread			mJsBridgeThread;
	HippyHandlerThread			mDomThread;
	UncaughtExceptionHandler	mUncaughtExceptionHandler;
	private int				    mGroupId = -1;

	public ThreadExecutor(int groupId)
	{
		mGroupId = groupId;
		mJsThread = new HippyHandlerThread("hippy-js-Thread");
		mJsThread.setUncaughtExceptionHandler(this);

		mJsBridgeThread = new HippyHandlerThread("hippy-jsBridge-Thread");
		mJsBridgeThread.setUncaughtExceptionHandler(this);
		mDomThread = new HippyHandlerThread("hippy-DomThread");
		mDomThread.setUncaughtExceptionHandler(this);
	}

	public void setUncaughtExceptionHandler(UncaughtExceptionHandler exceptionHandler)
	{
		mUncaughtExceptionHandler = exceptionHandler;
	}

	public void destroy()
	{
		if (mDomThread != null && mDomThread.isThreadAlive())
		{
			mDomThread.quit();
		
			mDomThread.setUncaughtExceptionHandler(null);
		}

		if (mJsBridgeThread != null && mJsBridgeThread.isThreadAlive())
		{
			mJsBridgeThread.quit();
			
			mJsBridgeThread.setUncaughtExceptionHandler(null);
		}

		if (mJsThread != null && mJsThread.isThreadAlive())
		{
			mJsThread.quit();
			
			mJsThread.setUncaughtExceptionHandler(null);
		}

		mUncaughtExceptionHandler = null;
	}

	public void postDelayOnJsThread(int delay, Runnable runnable)
	{
		mJsThread.getHandler().postDelayed(runnable, delay);
	}

	public void postOnJsThread(Runnable runnable)
	{
		mJsBridgeThread.runOnQueue(runnable);
	}

	public void postOnJsBridgeThread(Runnable runnable)
	{
		mJsThread.runOnQueue(runnable);
	}

	public void postOnDomThread(Runnable runnable)
	{
		mDomThread.runOnQueue(runnable);
	}

	public void assertOnJsBridge()
	{
		if (Thread.currentThread().getId() != mJsBridgeThread.getId())
		{
			throw new RuntimeException("call is not on Js-bridge-thread");
		}
	}

	public void assertOnJsThread()
	{
		if (Thread.currentThread().getId() != mJsThread.getId())
		{
			throw new RuntimeException("call is not on Js-thread");
		}
	}

	public void assertOnDomThread()
	{
		if (Thread.currentThread().getId() != mDomThread.getId())
		{
			throw new RuntimeException("call is not on dom-thread");
		}
	}

	public HippyHandlerThread getJsBridgeThread()
	{
		return mJsBridgeThread;
	}

	public HippyHandlerThread getJsThread()
	{
		return mJsThread;
	}

	public HippyHandlerThread getDomThread()
	{
		return mDomThread;
	}

	@Override
	public void uncaughtException(Thread t, Throwable e)
	{
		if (mUncaughtExceptionHandler != null)
		{
			mUncaughtExceptionHandler.handleThreadUncaughtException(t, e, mGroupId);
		}
		else
		{
			throw new RuntimeException(e);
		}

	}

	public interface UncaughtExceptionHandler
	{
		public void handleThreadUncaughtException(Thread t, Throwable e, Integer groupId);
	}
}
