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

import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.os.SystemClock;
import android.util.Log;
import android.view.Choreographer;
import android.view.View;

/**
 * Coordinates the timing of animations, input and drawing.
 * <p>
 * The choreographer receives timing pulses (such as vertical synchronization)
 * from the display subsystem then schedules work to occur as part of rendering
 * the next display frame.
 * </p>
 * <p>
 * Applications typically interact with the choreographer indirectly using
 * higher level abstractions in the animation framework or the view hierarchy.
 * Here are some examples of things you can do using the higher-level APIs.
 * </p>
 * <ul>
 * <li>To post an animation to be processed on a regular time basis synchronized
 * with
 * display frame rendering, use {@link android.animation.ValueAnimator#start}.
 * </li>
 * <li>To post a {@link Runnable} to be invoked once at the beginning of the
 * next display
 * frame, use {@link View#postOnAnimation}.</li>
 * <li>To post a {@link Runnable} to be invoked once at the beginning of the
 * next display
 * frame after a delay, use {@link View#postOnAnimationDelayed}.</li>
 * <li>To post a call to {@link View#invalidate()} to occur once at the
 * beginning of the
 * next display frame, use {@link View#postInvalidateOnAnimation()} or
 * {@link View#postInvalidateOnAnimation(int, int, int, int)}.</li>
 * <li>To ensure that the contents of a {@link View} scroll smoothly and are
 * drawn in
 * sync with display frame rendering, do nothing. This already happens
 * automatically.
 * {@link View#onDraw} will be called at the appropriate time.</li>
 * </ul>
 * <p>
 * However, there are a few cases where you might want to use the functions of
 * the
 * choreographer directly in your application. Here are some examples.
 * </p>
 * <ul>
 * <li>If your application does its rendering in a different thread, possibly
 * using GL,
 * or does not use the animation framework or view hierarchy at all
 * and you want to ensure that it is appropriately synchronized with the
 * display, then use
 * {@link Choreographer#postFrameCallback}.</li>
 * <li>... and that's about it.</li>
 * </ul>
 * <p>
 * Each {@link Looper} thread has its own choreographer. Other threads can
 * post callbacks to run on the choreographer but they will run on the
 * {@link Looper}
 * to which the choreographer belongs.
 * </p>
 */
public final class ICSChoreographer
{
	private static final String							TAG							= "Choreographer";
	private static final boolean						DEBUG						= false;

	private static final long							DEFAULT_FRAME_DELAY			= 10;

	// The number of milliseconds between animation frames.
	private static volatile long						sFrameDelay					= DEFAULT_FRAME_DELAY;

	// Thread local storage for the choreographer.
	private static final ThreadLocal<ICSChoreographer>	sThreadInstance				= new ThreadLocal<ICSChoreographer>()
																					{
																						@Override
																						protected ICSChoreographer initialValue()
																						{
																							Looper looper = Looper.myLooper();
																							if (looper == null)
																							{
																								throw new IllegalStateException(
																										"The current thread must have a looper!");
																							}
																							return new ICSChoreographer(looper);
																						}
																					};

	// Enable/disable vsync for animations and drawing.
	private static final boolean						USE_VSYNC					= false;

	// Enable/disable using the frame time instead of returning now.
	private static final boolean						USE_FRAME_TIME				= true;

	// Set a limit to warn about skipped frames.
	// Skipped frames imply jank.
	private static final int							SKIPPED_FRAME_WARNING_LIMIT	= 30;

	private static final long							NANOS_PER_MS				= 1000000;

	private static final int							MSG_DO_FRAME				= 0;
	private static final int							MSG_DO_SCHEDULE_VSYNC		= 1;
	private static final int							MSG_DO_SCHEDULE_CALLBACK	= 2;

	// All frame callbacks posted by applications have this token.
	static final Object									FRAME_CALLBACK_TOKEN		= new Object()
																					{
																						public String toString()
																						{
																							return "FRAME_CALLBACK_TOKEN";
																						}
																					};

	private final Object								mLock						= new Object();

	private final Looper								mLooper;
	private final FrameHandler							mHandler;

	// The display event receiver can only be accessed by the looper thread to
	// which
	// it is attached. We take care to ensure that we post message to the looper
	// if appropriate when interacting with the display event receiver.
	private final FrameDisplayEventReceiver				mDisplayEventReceiver;

	private CallbackRecord								mCallbackPool;

	private final CallbackQueue[]						mCallbackQueues;

	private boolean										mFrameScheduled;
	private boolean										mCallbacksRunning;
	private long										mLastFrameTimeNanos;
	private long										mFrameIntervalNanos;

	/**
	 * Callback type: Input callback. Runs first.
	 *
	 * @hide
	 */
	public static final int								CALLBACK_INPUT				= 0;

	/**
	 * Callback type: Animation callback. Runs before traversals.
	 * 
	 * @hide
	 */
	public static final int								CALLBACK_ANIMATION			= 1;

	/**
	 * Callback type: Traversal callback. Handles layout and draw. Runs last
	 * after all other asynchronous messages have been handled.
	 * 
	 * @hide
	 */
	public static final int								CALLBACK_TRAVERSAL			= 2;

	private static final int							CALLBACK_LAST				= CALLBACK_TRAVERSAL;

	private ICSChoreographer(Looper looper)
	{
		mLooper = looper;
		mHandler = new FrameHandler(looper);
		mDisplayEventReceiver = USE_VSYNC ? new FrameDisplayEventReceiver(looper) : null;
		mLastFrameTimeNanos = Long.MIN_VALUE;

		mFrameIntervalNanos = (long) (1000000000 / getRefreshRate());

		mCallbackQueues = new CallbackQueue[CALLBACK_LAST + 1];
		for (int i = 0; i <= CALLBACK_LAST; i++)
		{
			mCallbackQueues[i] = new CallbackQueue();
		}
	}

	private static float getRefreshRate()
	{
		return 60;
	}

	/**
	 * Gets the choreographer for the calling thread. Must be called from
	 * a thread that already has a {@link android.os.Looper} associated with it.
	 *
	 * @return The choreographer for this thread.
	 * @throws IllegalStateException if the thread does not have a looper.
	 */
	public static ICSChoreographer getInstance()
	{
		return sThreadInstance.get();
	}

	private void postCallbackDelayedInternal(int callbackType, Object action, Object token, long delayMillis)
	{
		if (DEBUG)
		{
			Log.d(TAG, "PostCallback: type=" + callbackType + ", action=" + action + ", token=" + token + ", delayMillis=" + delayMillis);
		}

		synchronized (mLock)
		{
			final long now = SystemClock.uptimeMillis();
			final long dueTime = now + delayMillis;
			mCallbackQueues[callbackType].addCallbackLocked(dueTime, action, token);

			if (dueTime <= now)
			{
				scheduleFrameLocked(now);
			}
			else
			{
				Message msg = mHandler.obtainMessage(MSG_DO_SCHEDULE_CALLBACK, action);
				msg.arg1 = callbackType;
				//				msg.setAsynchronous(true);
				mHandler.sendMessageAtTime(msg, dueTime);
			}
		}
	}

	private void removeCallbacksInternal(int callbackType, Object action, Object token)
	{
		if (DEBUG)
		{
			Log.d(TAG, "RemoveCallbacks: type=" + callbackType + ", action=" + action + ", token=" + token);
		}

		synchronized (mLock)
		{
			mCallbackQueues[callbackType].removeCallbacksLocked(action, token);
			if (action != null && token == null)
			{
				mHandler.removeMessages(MSG_DO_SCHEDULE_CALLBACK, action);
			}
		}
	}

	/**
	 * Posts a frame callback to run on the next frame.
	 * <p>
	 * The callback runs once then is automatically removed.
	 * </p>
	 *
	 * @param callback The frame callback to run during the next frame.
	 *
	 * @see #postFrameCallbackDelayed
	 * @see #removeFrameCallback
	 */
	public void postFrameCallback(HippyChoreographer.FrameCallback callback)
	{
		postFrameCallbackDelayed(callback, 0);
	}

	/**
	 * Posts a frame callback to run on the next frame after the specified
	 * delay.
	 * <p>
	 * The callback runs once then is automatically removed.
	 * </p>
	 *
	 * @param callback The frame callback to run during the next frame.
	 * @param delayMillis The delay time in milliseconds.
	 *
	 * @see #postFrameCallback
	 * @see #removeFrameCallback
	 */
	public void postFrameCallbackDelayed(HippyChoreographer.FrameCallback callback, long delayMillis)
	{
		if (callback == null)
		{
			throw new IllegalArgumentException("callback must not be null");
		}

		postCallbackDelayedInternal(CALLBACK_ANIMATION, callback, FRAME_CALLBACK_TOKEN, delayMillis);
	}

	/**
	 * Removes a previously posted frame callback.
	 *
	 * @param callback The frame callback to remove.
	 *
	 * @see #postFrameCallback
	 * @see #postFrameCallbackDelayed
	 */
	public void removeFrameCallback(HippyChoreographer.FrameCallback callback)
	{
		if (callback == null)
		{
			throw new IllegalArgumentException("callback must not be null");
		}

		removeCallbacksInternal(CALLBACK_ANIMATION, callback, FRAME_CALLBACK_TOKEN);
	}

//	/**
//	 * Same as {@link #getFrameTime()} but with nanosecond precision.
//	 *
//	 * @return The frame start time, in the {@link System#nanoTime()} time base.
//	 *
//	 * @throws IllegalStateException if no frame is in progress.
//	 * @hide
//	 */
//	public long getFrameTimeNanos()
//	{
//		synchronized (mLock)
//		{
//			if (!mCallbacksRunning)
//			{
//				throw new IllegalStateException("This method must only be called as " + "part of a callback while a frame is in progress.");
//			}
//			return USE_FRAME_TIME ? mLastFrameTimeNanos : System.nanoTime();
//		}
//	}

	private void scheduleFrameLocked(long now)
	{
		if (!mFrameScheduled)
		{
			mFrameScheduled = true;
			if (USE_VSYNC)
			{
				if (DEBUG)
				{
					Log.d(TAG, "Scheduling next frame on vsync.");
				}

				// If running on the Looper thread, then schedule the vsync
				// immediately,
				// otherwise post a message to schedule the vsync from the UI
				// thread
				// as soon as possible.
				if (isRunningOnLooperThreadLocked())
				{
					scheduleVsyncLocked();
				}
				else
				{
					Message msg = mHandler.obtainMessage(MSG_DO_SCHEDULE_VSYNC);
					//					msg.setAsynchronous(true);
					mHandler.sendMessageAtFrontOfQueue(msg);
				}
			}
			else
			{
				final long nextFrameTime = Math.max(mLastFrameTimeNanos / NANOS_PER_MS + sFrameDelay, now);
				if (DEBUG)
				{
					Log.d(TAG, "Scheduling next frame in " + (nextFrameTime - now) + " ms.");
				}
				Message msg = mHandler.obtainMessage(MSG_DO_FRAME);
				//				msg.setAsynchronous(true);
				mHandler.sendMessageAtTime(msg, nextFrameTime);
			}
		}
	}

	void doFrame(long frameTimeNanos, int frame)
	{
		final long startNanos;
		synchronized (mLock)
		{
			if (!mFrameScheduled)
			{
				return; // no work to do
			}

			startNanos = System.nanoTime();
			final long jitterNanos = startNanos - frameTimeNanos;
			if (jitterNanos >= mFrameIntervalNanos)
			{
				final long skippedFrames = jitterNanos / mFrameIntervalNanos;
				if (skippedFrames >= SKIPPED_FRAME_WARNING_LIMIT)
				{
					Log.i(TAG, "Skipped " + skippedFrames + " frames!  " + "The application may be doing too much work on its main thread.");
				}
				final long lastFrameOffset = jitterNanos % mFrameIntervalNanos;
				if (DEBUG)
				{
					Log.d(TAG,
							"Missed vsync by " + (jitterNanos * 0.000001f) + " ms " + "which is more than the frame interval of "
									+ (mFrameIntervalNanos * 0.000001f) + " ms!  " + "Skipping " + skippedFrames + " frames and setting frame "
									+ "time to " + (lastFrameOffset * 0.000001f) + " ms in the past.");
				}
				frameTimeNanos = startNanos - lastFrameOffset;
			}

			if (frameTimeNanos < mLastFrameTimeNanos)
			{
				if (DEBUG)
				{
					Log.d(TAG, "Frame time appears to be going backwards.  May be due to a " + "previously skipped frame.  Waiting for next vsync.");
				}
				scheduleVsyncLocked();
				return;
			}

			mFrameScheduled = false;
			mLastFrameTimeNanos = frameTimeNanos;
		}

		doCallbacks(0, frameTimeNanos);
		doCallbacks(1, frameTimeNanos);
		doCallbacks(2, frameTimeNanos);

		if (DEBUG)
		{
			final long endNanos = System.nanoTime();
			Log.d(TAG, "Frame " + frame + ": Finished, took " + (endNanos - startNanos) * 0.000001f + " ms, latency "
					+ (startNanos - frameTimeNanos) * 0.000001f + " ms.");
		}
	}

	void doCallbacks(int callbackType, long frameTimeNanos)
	{
		CallbackRecord callbacks;
		synchronized (mLock)
		{
			// We use "now" to determine when callbacks become due because it's
			// possible
			// for earlier processing phases in a frame to post callbacks that
			// should run
			// in a following phase, such as an input event that causes an
			// animation to start.
			final long now = SystemClock.uptimeMillis();
			callbacks = mCallbackQueues[callbackType].extractDueCallbacksLocked(now);
			if (callbacks == null)
			{
				return;
			}
			mCallbacksRunning = true;
		}
		try
		{
			for (CallbackRecord c = callbacks; c != null; c = c.next)
			{
				if (DEBUG)
				{
					Log.d(TAG, "RunCallback: type=" + callbackType + ", action=" + c.action + ", token=" + c.token + ", latencyMillis="
							+ (SystemClock.uptimeMillis() - c.dueTime));
				}
				c.run(frameTimeNanos);
			}
		}
		finally
		{
			synchronized (mLock)
			{
				mCallbacksRunning = false;
				do
				{
					final CallbackRecord next = callbacks.next;
					recycleCallbackLocked(callbacks);
					callbacks = next;
				}
				while (callbacks != null);
			}
		}
	}

	void doScheduleVsync()
	{
		synchronized (mLock)
		{
			if (mFrameScheduled)
			{
				scheduleVsyncLocked();
			}
		}
	}

	void doScheduleCallback(int callbackType)
	{
		synchronized (mLock)
		{
			if (!mFrameScheduled)
			{
				final long now = SystemClock.uptimeMillis();
				if (mCallbackQueues[callbackType].hasDueCallbacksLocked(now))
				{
					scheduleFrameLocked(now);
				}
			}
		}
	}

	private void scheduleVsyncLocked()
	{
		mDisplayEventReceiver.scheduleVsync();
	}

	private boolean isRunningOnLooperThreadLocked()
	{
		return Looper.myLooper() == mLooper;
	}

	CallbackRecord obtainCallbackLocked(long dueTime, Object action, Object token)
	{
		CallbackRecord callback = mCallbackPool;
		if (callback == null)
		{
			callback = new CallbackRecord();
		}
		else
		{
			mCallbackPool = callback.next;
			callback.next = null;
		}
		callback.dueTime = dueTime;
		callback.action = action;
		callback.token = token;
		return callback;
	}

	void recycleCallbackLocked(CallbackRecord callback)
	{
		callback.action = null;
		callback.token = null;
		callback.next = mCallbackPool;
		mCallbackPool = callback;
	}

	/**
	 * Implement this interface to receive a callback when a new display frame
	 * is
	 * being rendered. The callback is invoked on the {@link Looper} thread to
	 */

	private final class FrameHandler extends Handler
	{
		public FrameHandler(Looper looper)
		{
			super(looper);
		}

		@Override
		public void handleMessage(Message msg)
		{
			switch (msg.what)
			{
				case MSG_DO_FRAME:
					doFrame(System.nanoTime(), 0);
					break;
				case MSG_DO_SCHEDULE_VSYNC:
					doScheduleVsync();
					break;
				case MSG_DO_SCHEDULE_CALLBACK:
					doScheduleCallback(msg.arg1);
					break;
			}
		}
	}

	private final class FrameDisplayEventReceiver implements Runnable
	{
		private boolean	mHavePendingVsync;
		private long	mTimestampNanos;
		private int		mFrame;
		private Handler	mHandler;

		public FrameDisplayEventReceiver(Looper looper)
		{
			mHandler = new Handler(looper);
		}

		public void onVsync(long timestampNanos, int builtInDisplayId, int frame)
		{
			// Ignore vsync from secondary display.
			// This can be problematic because the call to scheduleVsync() is a
			// one-shot.
			// We need to ensure that we will still receive the vsync from the
			// primary
			// display which is the one we really care about. Ideally we should
			// schedule
			// vsync for a particular display.
			// At this time Surface Flinger won't send us vsyncs for secondary
			// displays
			// but that could change in the future so let's log a message to
			// help us remember
			// that we need to fix this.

			// Post the vsync event to the Handler.
			// The idea is to prevent incoming vsync events from completely
			// starving
			// the message queue. If there are no messages in the queue with
			// timestamps
			// earlier than the frame time, then the vsync event will be
			// processed immediately.
			// Otherwise, messages that predate the vsync event will be handled
			// first.
			long now = System.nanoTime();
			if (timestampNanos > now)
			{
				Log.w(TAG, "Frame time is " + ((timestampNanos - now) * 0.000001f)
						+ " ms in the future!  Check that graphics HAL is generating vsync " + "timestamps using the correct timebase.");
				timestampNanos = now;
			}

			if (mHavePendingVsync)
			{
				Log.w(TAG, "Already have a pending vsync event.  There should only be " + "one at a time.");
			}
			else
			{
				mHavePendingVsync = true;
			}

			mTimestampNanos = timestampNanos;
			mFrame = frame;
			Message msg = Message.obtain(mHandler, this);
			//			msg.setAsynchronous(true);
			mHandler.sendMessageAtTime(msg, timestampNanos / NANOS_PER_MS);
		}

		@Override
		public void run()
		{
			mHavePendingVsync = false;
			doFrame(mTimestampNanos, mFrame);
		}

		public void scheduleVsync()
		{
			mHandler.postDelayed(this, 16);
		}
	}

	static final class CallbackRecord
	{
		public CallbackRecord	next;
		public long				dueTime;
		public Object			action;	// Runnable or FrameCallback
		public Object			token;

		public void run(long frameTimeNanos)
		{
			if (token == FRAME_CALLBACK_TOKEN)
			{
				((HippyChoreographer.FrameCallback) action).doFrame(frameTimeNanos);
			}
			else
			{
				((Runnable) action).run();
			}
		}
	}

	private final class CallbackQueue
	{
		private CallbackRecord mHead;

		public boolean hasDueCallbacksLocked(long now)
		{
			return mHead != null && mHead.dueTime <= now;
		}

		public CallbackRecord extractDueCallbacksLocked(long now)
		{
			CallbackRecord callbacks = mHead;
			if (callbacks == null || callbacks.dueTime > now)
			{
				return null;
			}

			CallbackRecord last = callbacks;
			CallbackRecord next = last.next;
			while (next != null)
			{
				if (next.dueTime > now)
				{
					last.next = null;
					break;
				}
				last = next;
				next = next.next;
			}
			mHead = next;
			return callbacks;
		}

		public void addCallbackLocked(long dueTime, Object action, Object token)
		{
			CallbackRecord callback = obtainCallbackLocked(dueTime, action, token);
			CallbackRecord entry = mHead;
			if (entry == null)
			{
				mHead = callback;
				return;
			}
			if (dueTime < entry.dueTime)
			{
				callback.next = entry;
				mHead = callback;
				return;
			}
			while (entry.next != null)
			{
				if (dueTime < entry.next.dueTime)
				{
					callback.next = entry.next;
					break;
				}
				entry = entry.next;
			}
			entry.next = callback;
		}

		public void removeCallbacksLocked(Object action, Object token)
		{
			CallbackRecord predecessor = null;
			for (CallbackRecord callback = mHead; callback != null;)
			{
				final CallbackRecord next = callback.next;
				if ((action == null || callback.action == action) && (token == null || callback.token == token))
				{
					if (predecessor != null)
					{
						predecessor.next = next;
					}
					else
					{
						mHead = next;
					}
					recycleCallbackLocked(callback);
				}
				else
				{
					predecessor = callback;
				}
				callback = next;
			}
		}
	}
}
