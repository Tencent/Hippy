package com.tencent.mtt.hippy.modules.nativemodules.audio;

import android.content.Context;
import android.media.MediaPlayer;
import android.media.MediaPlayer.OnBufferingUpdateListener;
import android.media.MediaPlayer.OnCompletionListener;
import android.media.MediaPlayer.OnErrorListener;
import android.media.MediaPlayer.OnPreparedListener;
import android.net.Uri;
import android.util.Log;

import com.tencent.mtt.hippy.utils.LogUtils;
import java.io.IOException;
import java.util.EnumSet;

/**
 * A wrapper class for {@link android.media.MediaPlayer}.
 * <p>
 * Encapsulates an instance of MediaPlayer, and makes a record of its internal
 * state accessible via
 * a {@link MediaPlayerStateWrapper#getState()} accessor. Most of the frequently
 * used methods are
 * available, but some still need adding.
 * </p>
 */
@SuppressWarnings({ "WeakerAccess", "unused", "FieldCanBeLocal" })
public class MediaPlayerStateWrapper
{
	private static final String				tag							= "MediaPlayerWrapper";
	private final MediaPlayer				mPlayer;
	private State						    currentState;
	private final MediaPlayerStateWrapper	mWrapper;

	/* INTERNAL LISTENERS */
	private final OnPreparedListener		mOnPreparedListener			= new OnPreparedListener()
																	{
																		@Override
																		public void onPrepared(MediaPlayer mp)
																		{
																			Log.d(tag, "on prepared");
																			currentState = State.PREPARED;
																			mWrapper.onPrepared(mp);
																			mPlayer.start();
																			currentState = State.STARTED;
																		}
																	};

	private final OnCompletionListener		mOnCompletionListener		= new OnCompletionListener()
																	{
																		@Override
																		public void onCompletion(MediaPlayer mp)
																		{
																			Log.d(tag, "on completion");
																			currentState = State.PLAYBACK_COMPLETE;
																			mWrapper.onCompletion(mp);
																		}
																	};

	private final OnBufferingUpdateListener	mOnBufferingUpdateListener	= new OnBufferingUpdateListener()
																	{
																		@Override
																		public void onBufferingUpdate(MediaPlayer mp, int percent)
																		{
																			Log.d(tag, "on buffering update");
																			mWrapper.onBufferingUpdate(mp, percent);
																		}
																	};

	private final OnErrorListener				mOnErrorListener			= new OnErrorListener()
																	{
																		@Override
																		public boolean onError(MediaPlayer mp, int what, int extra)
																		{
																			Log.d(tag, "on error");
																			currentState = State.ERROR;
																			mWrapper.onError(mp, what, extra);
																			return false;
																		}
																	};

	MediaPlayerStateWrapper()
	{
		mWrapper = this;
		mPlayer = new MediaPlayer();
		currentState = State.IDLE;
		mPlayer.setOnPreparedListener(mOnPreparedListener);
		mPlayer.setOnCompletionListener(mOnCompletionListener);
		mPlayer.setOnBufferingUpdateListener(mOnBufferingUpdateListener);
		mPlayer.setOnErrorListener(mOnErrorListener);
	}

	public void setDataSource(String path)
	{
		if (currentState == State.IDLE)
		{
			try
			{
				mPlayer.setDataSource(path);
				currentState = State.INITIALIZED;
			}
			catch (IllegalArgumentException | IllegalStateException | IOException ex)
			{
				ex.printStackTrace();
			}
		}
		else
			throw new RuntimeException();
	}

	public void setDataSource(Context context, Uri uri) {
		if (currentState == State.IDLE)
		{
			try
			{
				mPlayer.setDataSource(context, uri);
				currentState = State.INITIALIZED;
			}
			catch (IllegalArgumentException | IllegalStateException | IOException ex)
			{
				ex.printStackTrace();
			}
		}
		else
			throw new RuntimeException();
	}

	public void prepareAsync()
	{
		Log.d(tag, "prepareAsync()");
		if (EnumSet.of(State.INITIALIZED, State.STOPPED).contains(currentState))
		{
			mPlayer.prepareAsync();
			currentState = State.PREPARING;
		}
		else
			throw new RuntimeException();
	}

	public boolean isPlaying()
	{
		Log.d(tag, "isPlaying()");
		if (currentState != State.ERROR)
		{
			return mPlayer.isPlaying();
		}
		else
			throw new RuntimeException();
	}

	public void seekTo(int ms)
	{
		Log.d(tag, "seekTo()");
		if (EnumSet.of(State.PREPARED, State.STARTED, State.PAUSED, State.PLAYBACK_COMPLETE).contains(currentState))
		{
			mPlayer.seekTo(ms);
		}
		else
			throw new RuntimeException();
	}

	public void pause()
	{
		Log.d(tag, "pause()");
		if (EnumSet.of(State.STARTED, State.PAUSED).contains(currentState))
		{
			mPlayer.pause();
			currentState = State.PAUSED;
		}
		else
			throw new RuntimeException();
	}

	public void start()
	{
		Log.d(tag, "start()");
		if (EnumSet.of(State.PREPARED, State.STARTED, State.PAUSED, State.PLAYBACK_COMPLETE).contains(currentState))
		{
			mPlayer.start();
			currentState = State.STARTED;
		}
		else
			throw new RuntimeException();
	}

	public void stop()
	{
		Log.d(tag, "stop()");
		if (EnumSet.of(State.PREPARED, State.STARTED, State.STOPPED, State.PAUSED, State.PLAYBACK_COMPLETE).contains(currentState))
		{
			mPlayer.stop();
			currentState = State.STOPPED;
		}
		else
			throw new RuntimeException();
	}

	public void reset()
	{
		Log.d(tag, "reset()");
		mPlayer.reset();
		currentState = State.IDLE;
	}

	/**
	 * @return The current state of the mediaplayer state machine.
	 */
	public State getState()
	{
		Log.d(tag, "getState()");
		return currentState;
	}

	public void release()
	{
		Log.d(tag, "release()");
		mPlayer.release();
	}

	/* EXTERNAL STUBS TO OVERRIDE */
	public void onPrepared(MediaPlayer mp) {
		LogUtils.d("MediaPlayerStateWrapper", "onPrepared");
	}

	public void onCompletion(MediaPlayer mp) {
		LogUtils.d("MediaPlayerStateWrapper", "onCompletion");
	}

	public void onBufferingUpdate(MediaPlayer mp, int percent) {
		LogUtils.d("MediaPlayerStateWrapper", "onBufferingUpdate");
	}

	@SuppressWarnings({"SameReturnValue", "UnusedReturnValue"})
	boolean onError(MediaPlayer mp, int what, int extra)
	{
		return false;
	}

	@SuppressWarnings("SameReturnValue")
	public boolean onInfo(MediaPlayer mp, int what, int extra)
	{
		return false;
	}

	/* OTHER STUFF */
	public int getCurrentPosition()
	{
		if (currentState != State.ERROR)
		{
			return mPlayer.getCurrentPosition();
		}
		else
		{
			return 0;
		}
	}

	public int getDuration()
	{
		// Prepared, Started, Paused, Stopped, PlaybackCompleted
		if (EnumSet.of(State.PREPARED, State.STARTED, State.PAUSED, State.STOPPED, State.PLAYBACK_COMPLETE).contains(currentState))
		{
			return mPlayer.getDuration();
		}
		else
		{
			return 100;
		}
	}

	public void prepare() throws IOException
	{
		mPlayer.prepare();
	}

	public void setAudioStreamType(int streamMusic)
	{
		mPlayer.setAudioStreamType(streamMusic);
	}

	public void setOnPreparedListener(final OnPreparedListener onPreparedListener)
	{
		mPlayer.setOnPreparedListener(new OnPreparedListener()
		{
			@Override
			public void onPrepared(MediaPlayer mp)
			{
				mOnPreparedListener.onPrepared(mp);
				onPreparedListener.onPrepared(mp);
			}
		});
	}

	public void setOnCompletionListener(final OnCompletionListener onCompletionListener)
	{
		mPlayer.setOnCompletionListener(new OnCompletionListener()
		{
			@Override
			public void onCompletion(MediaPlayer mp)
			{
				mOnCompletionListener.onCompletion(mp);
				onCompletionListener.onCompletion(mp);
			}
		});
	}

	/* METHOD WRAPPING FOR STATE CHANGES */
	@SuppressWarnings("WeakerAccess")
	public enum State
	{
		IDLE,
		ERROR,
		INITIALIZED,
		PREPARING,
		PREPARED,
		STARTED,
		STOPPED,
		PLAYBACK_COMPLETE,
		PAUSED
	}
}
