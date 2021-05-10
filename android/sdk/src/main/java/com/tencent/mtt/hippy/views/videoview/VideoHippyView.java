package com.tencent.mtt.hippy.views.videoview;

import com.tencent.mtt.hippy.utils.LogUtils;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyInstanceContext;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.javascriptmodules.EventDispatcher;
import com.tencent.mtt.hippy.uimanager.HippyViewBase;
import com.tencent.mtt.hippy.uimanager.NativeGestureDispatcher;

import android.annotation.SuppressLint;
import android.annotation.TargetApi;
import android.app.Activity;
import android.content.Context;
import android.content.res.AssetFileDescriptor;
import android.graphics.Matrix;
import android.media.MediaPlayer;
import android.media.TimedMetaData;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.view.Window;
import android.webkit.CookieManager;
import android.widget.MediaController;

@SuppressWarnings({"deprecation","unused"})
public class VideoHippyView extends ScalableVideoView
		implements HippyViewBase, MediaPlayer.OnPreparedListener, MediaPlayer.OnErrorListener, MediaPlayer.OnBufferingUpdateListener,
		MediaPlayer.OnSeekCompleteListener, MediaPlayer.OnCompletionListener, MediaPlayer.OnInfoListener, MediaController.MediaPlayerControl
{

	@Override
	public NativeGestureDispatcher getGestureDispatcher()
	{
		return null;
	}

	@Override
	public void setGestureDispatcher(NativeGestureDispatcher dispatcher)
	{

	}
	//通知播放事件的回调。
	public enum Events
	{
		EVENT_LOAD_START("onVideoLoadStart"),
		EVENT_LOAD("onVideoLoad"),
		EVENT_ERROR("onVideoError"),
		EVENT_PROGRESS("onVideoProgress"),
		EVENT_TIMED_METADATA("onTimedMetadata"),
		EVENT_SEEK("onVideoSeek"),
		EVENT_END("onVideoEnd"),
		EVENT_STALLED("onPlaybackStalled"),
		EVENT_RESUME("onPlaybackResume"),
		EVENT_READY_FOR_DISPLAY("onReadyForDisplay"),
		EVENT_FULLSCREEN_WILL_PRESENT("onVideoFullscreenPlayerWillPresent"),
		EVENT_FULLSCREEN_DID_PRESENT("onVideoFullscreenPlayerDidPresent"),
		EVENT_FULLSCREEN_WILL_DISMISS("onVideoFullscreenPlayerWillDismiss"),
		EVENT_FULLSCREEN_DID_DISMISS("onVideoFullscreenPlayerDidDismiss");

		private final String mName;

		Events(final String name)
		{
			mName = name;
		}

		@Override
		public String toString()
		{
			return mName;
		}
	}


	public static final String	EVENT_PROP_FAST_FORWARD			= "canPlayFastForward";
	public static final String	EVENT_PROP_SLOW_FORWARD			= "canPlaySlowForward";
	public static final String	EVENT_PROP_SLOW_REVERSE			= "canPlaySlowReverse";
	public static final String	EVENT_PROP_REVERSE				= "canPlayReverse";
	public static final String	EVENT_PROP_STEP_FORWARD			= "canStepForward";
	public static final String	EVENT_PROP_STEP_BACKWARD		= "canStepBackward";

	public static final String	EVENT_PROP_DURATION				= "duration";
	public static final String	EVENT_PROP_PLAYABLE_DURATION	= "playableDuration";
	public static final String	EVENT_PROP_SEEKABLE_DURATION	= "seekableDuration";
	public static final String	EVENT_PROP_CURRENT_TIME			= "currentTime";
	public static final String	EVENT_PROP_SEEK_TIME			= "seekTime";
	public static final String	EVENT_PROP_NATURALSIZE			= "naturalSize";
	public static final String	EVENT_PROP_WIDTH				= "width";
	public static final String	EVENT_PROP_HEIGHT				= "height";
	public static final String	EVENT_PROP_ORIENTATION			= "orientation";
	public static final String	EVENT_PROP_METADATA				= "metadata";
	public static final String	EVENT_PROP_TARGET				= "target";
	public static final String	EVENT_PROP_METADATA_IDENTIFIER	= "identifier";
	public static final String	EVENT_PROP_METADATA_VALUE		= "value";

	public static final String	EVENT_PROP_ERROR				= "error";
	public static final String	EVENT_PROP_WHAT					= "what";
	public static final String	EVENT_PROP_EXTRA				= "extra";

	private HippyEngineContext	mHippyContext;
	private final Context mAppContext;
	private final EventDispatcher mEventEmitter;

	private final Handler mProgressUpdateHandler = new Handler();
	private Runnable mProgressUpdateRunnable = null;
	private final Handler videoControlHandler = new Handler();
	private MediaController mediaController;

	private String				mSrcUriString					= null;
	private String				mSrcType						= "mp4";
	private HippyMap			mRequestHeaders					= null;
	private boolean				mSrcIsNetwork					= false;
	private boolean				mSrcIsAsset						= false;
	private ScalableType		mResizeMode						= ScalableType.LEFT_TOP;
	private boolean				mRepeat							= false;
	private boolean				mPaused							= false;
	private boolean				mMuted							= false;
	private float				mVolume							= 1.0f;
	private float				mStereoPan						= 0.0f;
	private float				mProgressUpdateInterval			= 250.0f;
	private float				mRate							= 1.0f;
	private float				mActiveRate						= 1.0f;
	private long				mSeekTime						= 0;
	@SuppressWarnings("FieldCanBeLocal")
	private boolean				mPlayInBackground				= false;
	private final boolean				mBackgroundPaused				= false;
	private boolean				mIsFullscreen					= false;

	private int					mMainVer						= 0;
	private int					mPatchVer						= 0;

	private boolean				mMediaPlayerValid				= false;				// True if mMediaPlayer is in prepared, started, paused or completed state.

	private int					mVideoDuration					= 0;
	private int					mVideoBufferedDuration			= 0;
	private boolean				isCompleted						= false;
	private boolean				mUseNativeControls				= false;

	public VideoHippyView(Context context)
	{
		super(context);
		mHippyContext =    ((HippyInstanceContext) context).getEngineContext();

		mEventEmitter = mHippyContext.getModuleManager().getJavaScriptModule(EventDispatcher.class);
		//        themedReactContext.addLifecycleEventListener(this);
		mAppContext =context;
		initializeMediaPlayerIfNeeded();
		setSurfaceTextureListener(this);

		mProgressUpdateRunnable = new Runnable()
		{
			@Override
			public void run()
			{

				if (mMediaPlayerValid && !isCompleted && !mPaused && !mBackgroundPaused)
				{
					HippyMap event = new HippyMap();
					event.pushDouble(EVENT_PROP_CURRENT_TIME, mMediaPlayer.getCurrentPosition() / 1000.0);
					event.pushDouble(EVENT_PROP_PLAYABLE_DURATION, mVideoBufferedDuration / 1000.0); //TODO:mBufferUpdateRunnable
					event.pushDouble(EVENT_PROP_SEEKABLE_DURATION, mVideoDuration / 1000.0);
					mEventEmitter.receiveUIComponentEvent(getId(), Events.EVENT_PROGRESS.toString(), event);

					// Check for update after an interval
					mProgressUpdateHandler.postDelayed(mProgressUpdateRunnable, Math.round(mProgressUpdateInterval));
				}
			}
		};
	}

	@Override
	public boolean onTouchEvent(MotionEvent event)
	{
		if (mUseNativeControls)
		{
			initializeMediaControllerIfNeeded();
			mediaController.show();
		}

		return super.onTouchEvent(event);
	}

	@Override
	@SuppressLint("DrawAllocation")
	protected void onLayout(boolean changed, int left, int top, int right, int bottom)
	{
		super.onLayout(changed, left, top, right, bottom);

		if (!changed || !mMediaPlayerValid)
		{
			return;
		}

		int videoWidth = getVideoWidth();
		int videoHeight = getVideoHeight();

		if (videoWidth == 0 || videoHeight == 0)
		{
			return;
		}

		Size viewSize = new Size(getWidth(), getHeight());
		Size videoSize = new Size(videoWidth, videoHeight);
		ScaleManager scaleManager = new ScaleManager(viewSize, videoSize);
		Matrix matrix = scaleManager.getScaleMatrix(mScalableType);
		if (matrix != null)
		{
			setTransform(matrix);
		}
	}

	private void initializeMediaPlayerIfNeeded()
	{
		if (mMediaPlayer == null)
		{
			mMediaPlayerValid = false;
			mMediaPlayer = new MediaPlayer();
			mMediaPlayer.setScreenOnWhilePlaying(true);
			mMediaPlayer.setOnVideoSizeChangedListener(this);
			mMediaPlayer.setOnErrorListener(this);
			mMediaPlayer.setOnPreparedListener(this);
			mMediaPlayer.setOnBufferingUpdateListener(this);
			mMediaPlayer.setOnSeekCompleteListener(this);
			mMediaPlayer.setOnCompletionListener(this);
			mMediaPlayer.setOnInfoListener(this);
			if (Build.VERSION.SDK_INT >= 23)
			{
				mMediaPlayer.setOnTimedMetaDataAvailableListener(new TimedMetaDataAvailableListener());
			}
		}
	}

	private void initializeMediaControllerIfNeeded()
	{
		if (mediaController == null)
		{
			mediaController = new MediaController(this.getContext());
		}
	}

	public void cleanupMediaPlayerResources()
	{
		if (mediaController != null)
		{
			mediaController.hide();
		}
		if (mMediaPlayer != null)
		{
			if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
			{
				mMediaPlayer.setOnTimedMetaDataAvailableListener(null);
			}
			mMediaPlayerValid = false;
			release();
		}
		if (mIsFullscreen)
		{
			setFullscreen(false);
		}
		mHippyContext = null;
	}

	public void setSrc(final String uriString, final String type, final boolean isNetwork, final boolean isAsset, final HippyMap requestHeaders)
	{
		setSrc(uriString, type, isNetwork, isAsset, requestHeaders, 0, 0);
	}

	public void setSrc(final String uriString, final String type, final boolean isNetwork, final boolean isAsset, final HippyMap requestHeaders,
			final int expansionMainVersion, final int expansionPatchVersion)
	{

		mSrcUriString = uriString;
		mSrcType = type;
		mSrcIsNetwork = isNetwork;
		mSrcIsAsset = isAsset;
		mRequestHeaders = requestHeaders;
		mMainVer = expansionMainVersion;
		mPatchVer = expansionPatchVersion;


		mMediaPlayerValid = false;
		mVideoDuration = 0;
		mVideoBufferedDuration = 0;

		initializeMediaPlayerIfNeeded();
		mMediaPlayer.reset();

		try
		{
			if (isNetwork)
			{
				// Use the shared CookieManager to access the cookies
				// set by WebViews inside the same app
				CookieManager cookieManager = CookieManager.getInstance();

				Uri parsedUrl = Uri.parse(uriString);
				Uri.Builder builtUrl = parsedUrl.buildUpon();

				String cookie = cookieManager.getCookie(builtUrl.build().toString());

				Map<String, String> headers = new HashMap<>();

				if (cookie != null)
				{
					headers.put("Cookie", cookie);
				}

				if (mRequestHeaders != null)
				{
					headers.putAll(toStringMap(mRequestHeaders));
				}

				/*
				 * According to
				 * https://github.com/react-native-community/react-native-video/pull/537
				 * there is an issue with this where it can cause a IOException.
				 * TODO: diagnose this exception and fix it
				 */
				setDataSource(mAppContext, parsedUrl, headers);
			}
			else if (isAsset)
			{
				if (uriString.startsWith("content://"))
				{
					Uri parsedUrl = Uri.parse(uriString);
					setDataSource(mAppContext, parsedUrl);
				}
				else
				{
					setDataSource(uriString);
				}
			}
			else
			{
				ZipResourceFile expansionFile;
				AssetFileDescriptor fd = null;
				if (mMainVer > 0)
				{
					try
					{
						expansionFile = APKExpansionSupport.getAPKExpansionZipFile(mAppContext, mMainVer, mPatchVer);
						fd = expansionFile.getAssetFileDescriptor(uriString.replace(".mp4", "") + ".mp4");
					}
					catch (IOException | NullPointerException e)
					{
						e.printStackTrace();
					}
				}
				if (fd == null)
				{
					int identifier = mAppContext.getResources().getIdentifier(uriString, "drawable", mAppContext.getPackageName());
					if (identifier == 0)
					{
						identifier = mAppContext.getResources().getIdentifier(uriString, "raw", mAppContext.getPackageName());
					}
					setRawData(identifier);
				}
				else
				{
					setDataSource(fd.getFileDescriptor(), fd.getStartOffset(), fd.getLength());
				}
			}
		}
		catch (Exception e)
		{
			e.printStackTrace();
			return;
		}

		HippyMap src = new HippyMap();

		HippyMap wRequestHeaders = new HippyMap();
		wRequestHeaders.pushAll(mRequestHeaders);

		src.pushString(VideoHippyViewController.PROP_SRC_URI, uriString);
		src.pushString(VideoHippyViewController.PROP_SRC_TYPE, type);
		src.pushMap(VideoHippyViewController.PROP_SRC_HEADERS, wRequestHeaders);
		src.pushBoolean(VideoHippyViewController.PROP_SRC_IS_NETWORK, isNetwork);
		if (mMainVer > 0)
		{
			src.pushInt(VideoHippyViewController.PROP_SRC_MAINVER, mMainVer);
			if (mPatchVer > 0)
			{
				src.pushInt(VideoHippyViewController.PROP_SRC_PATCHVER, mPatchVer);
			}
		}
		HippyMap event = new HippyMap();
		event.pushMap(VideoHippyViewController.PROP_SRC, src);
		mEventEmitter.receiveUIComponentEvent(getId(), Events.EVENT_LOAD_START.toString(), event);
		isCompleted = false;

		try
		{
			prepareAsync(this);
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
	}

	public void setResizeModeModifier(final ScalableType resizeMode)
	{
		mResizeMode = resizeMode;

		if (mMediaPlayerValid)
		{
			setScalableType(resizeMode);
			invalidate();
		}
	}

	public void setRepeatModifier(final boolean repeat)
	{

		mRepeat = repeat;

		if (mMediaPlayerValid)
		{
			setLooping(repeat);
		}
	}

	public void setPausedModifier(final boolean paused)
	{
		mPaused = paused;

		if (!mMediaPlayerValid)
		{
			return;
		}

		if (mPaused)
		{
			if (mMediaPlayer.isPlaying())
			{
				pause();
			}
		}
		else
		{
			if (!mMediaPlayer.isPlaying())
			{
				start();
				// Setting the rate unpauses, so we have to wait for an unpause
				if (mRate != mActiveRate)
				{
					setRateModifier(mRate);
				}

				// Also Start the Progress Update Handler
				mProgressUpdateHandler.post(mProgressUpdateRunnable);
			}
		}
		setKeepScreenOn(!mPaused);
	}

	// reduces the volume based on stereoPan
	private float calulateRelativeVolume()
	{
		float relativeVolume = (mVolume * (1 - Math.abs(mStereoPan)));
		// only one decimal allowed
		BigDecimal roundRelativeVolume = new BigDecimal(relativeVolume).setScale(1, BigDecimal.ROUND_HALF_UP);
		return roundRelativeVolume.floatValue();
	}

	public void setMutedModifier(final boolean muted)
	{
		mMuted = muted;

		if (!mMediaPlayerValid)
		{
			return;
		}

		if (mMuted)
		{
			setVolume(0, 0);
		}
		else if (mStereoPan < 0)
		{
			// louder on the left channel
			setVolume(mVolume, calulateRelativeVolume());
		}
		else if (mStereoPan > 0)
		{
			// louder on the right channel
			setVolume(calulateRelativeVolume(), mVolume);
		}
		else
		{
			// same volume on both channels
			setVolume(mVolume, mVolume);
		}
	}

	public void setVolumeModifier(final float volume)
	{
		mVolume = volume;
		setMutedModifier(mMuted);
	}

	public void setStereoPan(final float stereoPan)
	{
		mStereoPan = stereoPan;
		setMutedModifier(mMuted);
	}

	public void setProgressUpdateInterval(final float progressUpdateInterval)
	{
		mProgressUpdateInterval = progressUpdateInterval;
	}

	public void setRateModifier(final float rate)
	{
		mRate = rate;

		if (mMediaPlayerValid)
		{
			if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
			{
				if (!mPaused)
				{ // Applying the rate while paused will cause the video to start
					/*
					 * Per https://stackoverflow.com/questions/39442522/setplaybackparams-causes-
					 * illegalstateexception
					 * Some devices throw an IllegalStateException if you set the rate without first
					 * calling reset()
					 * TODO: Call reset() then reinitialize the player
					 */
					try
					{
						mMediaPlayer.setPlaybackParams(mMediaPlayer.getPlaybackParams().setSpeed(rate));
						mActiveRate = rate;
					}
					catch (Exception e)
					{
						Log.e(VideoHippyViewController.CLASS_NAME, "Unable to set rate, unsupported on this device");
					}
				}
			}
			else
			{
				Log.e(VideoHippyViewController.CLASS_NAME, "Setting playback rate is not yet supported on Android versions below 6.0");
			}
		}
	}

	public void setFullscreen(boolean isFullscreen)
	{
		if (isFullscreen == mIsFullscreen)
		{
			return; // Avoid generating events when nothing is changing
		}
		mIsFullscreen = isFullscreen;


		if (!(mAppContext instanceof Activity ))
		{
			return;
		}
        Activity activity =(Activity)mAppContext;
		Window window = activity.getWindow();
		View decorView = window.getDecorView();
		int uiOptions;
		if (mIsFullscreen)
		{
			if (Build.VERSION.SDK_INT >= 19)
			{ // 4.4+
				uiOptions = SYSTEM_UI_FLAG_HIDE_NAVIGATION | SYSTEM_UI_FLAG_IMMERSIVE_STICKY | SYSTEM_UI_FLAG_FULLSCREEN;
			}
			else
			{
				uiOptions = SYSTEM_UI_FLAG_HIDE_NAVIGATION | SYSTEM_UI_FLAG_FULLSCREEN;
			}
			mEventEmitter.receiveUIComponentEvent(getId(), Events.EVENT_FULLSCREEN_WILL_PRESENT.toString(), null);
			decorView.setSystemUiVisibility(uiOptions);
			mEventEmitter.receiveUIComponentEvent(getId(), Events.EVENT_FULLSCREEN_DID_PRESENT.toString(), null);
		}
		else
		{
			uiOptions = View.SYSTEM_UI_FLAG_VISIBLE;
			mEventEmitter.receiveUIComponentEvent(getId(), Events.EVENT_FULLSCREEN_WILL_DISMISS.toString(), null);
			decorView.setSystemUiVisibility(uiOptions);
			mEventEmitter.receiveUIComponentEvent(getId(), Events.EVENT_FULLSCREEN_DID_DISMISS.toString(), null);
		}
	}

	public void applyModifiers(boolean paused)
	{
		setResizeModeModifier(mResizeMode);
		setRepeatModifier(mRepeat);
		setPausedModifier(paused);
		setMutedModifier(mMuted);
		setProgressUpdateInterval(mProgressUpdateInterval);
		setRateModifier(mRate);
	}

	public void setPlayInBackground(final boolean playInBackground)
	{
		mPlayInBackground = playInBackground;
	}

	public void setControls(boolean controls)
	{
		this.mUseNativeControls = controls;
	}
	public void setAutoPlay(boolean autoPlay)
	{
		this.mPaused = !autoPlay;
	}




	@Override
	public void onPrepared(MediaPlayer mp)
	{

		mMediaPlayerValid = true;
		mVideoDuration = mp.getDuration();

		HippyMap naturalSize = new HippyMap();
		naturalSize.pushInt(EVENT_PROP_WIDTH, mp.getVideoWidth());
		naturalSize.pushInt(EVENT_PROP_HEIGHT, mp.getVideoHeight());
		if (mp.getVideoWidth() > mp.getVideoHeight())
			naturalSize.pushString(EVENT_PROP_ORIENTATION, "landscape");
		else
			naturalSize.pushString(EVENT_PROP_ORIENTATION, "portrait");

		HippyMap event = new HippyMap();
		event.pushDouble(EVENT_PROP_DURATION, mVideoDuration / 1000.0);
		event.pushDouble(EVENT_PROP_CURRENT_TIME, mp.getCurrentPosition() / 1000.0);
		event.pushMap(EVENT_PROP_NATURALSIZE, naturalSize);
		// TODO: Actually check if you can.
		event.pushBoolean(EVENT_PROP_FAST_FORWARD, true);
		event.pushBoolean(EVENT_PROP_SLOW_FORWARD, true);
		event.pushBoolean(EVENT_PROP_SLOW_REVERSE, true);
		event.pushBoolean(EVENT_PROP_REVERSE, true);
		event.pushBoolean(EVENT_PROP_FAST_FORWARD, true);
		event.pushBoolean(EVENT_PROP_STEP_BACKWARD, true);
		event.pushBoolean(EVENT_PROP_STEP_FORWARD, true);
		mEventEmitter.receiveUIComponentEvent(getId(), Events.EVENT_LOAD.toString(), event);

		applyModifiers(mPaused);

		if (mUseNativeControls)
		{
			initializeMediaControllerIfNeeded();
			mediaController.setMediaPlayer(this);
			mediaController.setAnchorView(this);

			videoControlHandler.post(new Runnable()
			{
				@Override
				public void run()
				{
					mediaController.setEnabled(true);
					mediaController.show();
				}
			});
		}

		selectTimedMetadataTrack(mp);
	}

	@Override
	public boolean onError(MediaPlayer mp, int what, int extra)
	{

		HippyMap error = new HippyMap();
		error.pushInt(EVENT_PROP_WHAT, what);
		error.pushInt(EVENT_PROP_EXTRA, extra);
		HippyMap event = new HippyMap();
		event.pushMap(EVENT_PROP_ERROR, error);
		mEventEmitter.receiveUIComponentEvent(getId(), Events.EVENT_ERROR.toString(), event);
		return true;
	}

	@Override
	public boolean onInfo(MediaPlayer mp, int what, int extra)
	{
		switch (what)
		{
			case MediaPlayer.MEDIA_INFO_BUFFERING_START:
				mEventEmitter.receiveUIComponentEvent(getId(), Events.EVENT_STALLED.toString(), new HippyMap());
				break;
			case MediaPlayer.MEDIA_INFO_BUFFERING_END:
				mEventEmitter.receiveUIComponentEvent(getId(), Events.EVENT_RESUME.toString(), new HippyMap());
				break;
			case MediaPlayer.MEDIA_INFO_VIDEO_RENDERING_START:
				mEventEmitter.receiveUIComponentEvent(getId(), Events.EVENT_READY_FOR_DISPLAY.toString(), new HippyMap());
				break;

			default:
		}
		return false;
	}

	@Override
	public void onBufferingUpdate(MediaPlayer mp, int percent)
	{
		selectTimedMetadataTrack(mp);
		mVideoBufferedDuration = (int) Math.round((double) (mVideoDuration * percent) / 100.0);
	}

	public void onSeekComplete(MediaPlayer mp)
	{
		HippyMap event = new HippyMap();
		event.pushDouble(EVENT_PROP_CURRENT_TIME, getCurrentPosition() / 1000.0);
		event.pushDouble(EVENT_PROP_SEEK_TIME, mSeekTime / 1000.0);
		mEventEmitter.receiveUIComponentEvent(getId(), Events.EVENT_SEEK.toString(), event);
		mSeekTime = 0;
	}

	@Override
	public void seekTo(int msec)
	{
		if (mMediaPlayerValid)
		{
			mSeekTime = msec;
			super.seekTo(msec);
			if (isCompleted && mVideoDuration != 0 && msec < mVideoDuration)
			{
				isCompleted = false;
			}
		}
	}

	@Override
	public int getBufferPercentage()
	{
		return 0;
	}

	@Override
	public boolean canPause()
	{
		return true;
	}

	@Override
	public boolean canSeekBackward()
	{
		return true;
	}

	@Override
	public boolean canSeekForward()
	{
		return true;
	}

	@Override
	public int getAudioSessionId()
	{
		return 0;
	}

	@Override
	public void onCompletion(MediaPlayer mp)
	{
		isCompleted = true;
		mEventEmitter.receiveUIComponentEvent(getId(), Events.EVENT_END.toString(), null);
		if (!mRepeat)
		{
			setKeepScreenOn(false);
		}
	}

	// This is not fully tested and does not work for all forms of timed metadata
	@TargetApi(23) // 6.0
	public class TimedMetaDataAvailableListener implements MediaPlayer.OnTimedMetaDataAvailableListener
	{
		@SuppressWarnings("CharsetObjectCanBeUsed")
		public void onTimedMetaDataAvailable(MediaPlayer mp, TimedMetaData data)
		{
			HippyMap event = new HippyMap();

			try
			{
				String rawMeta = new String(data.getMetaData(), "UTF-8");
				HippyMap id3 = new HippyMap();

				id3.pushString(EVENT_PROP_METADATA_VALUE, rawMeta.substring(rawMeta.lastIndexOf("\u0003") + 1));
				id3.pushString(EVENT_PROP_METADATA_IDENTIFIER, "id3/TDEN");

				HippyArray metadata = new HippyArray();

				metadata.pushMap(id3);

				event.pushArray(EVENT_PROP_METADATA, metadata);
				event.pushDouble(EVENT_PROP_TARGET, getId());
			}
			catch (UnsupportedEncodingException e)
			{
				e.printStackTrace();
			}

			mEventEmitter.receiveUIComponentEvent(getId(), Events.EVENT_TIMED_METADATA.toString(), event);
		}
	}

	@Override
	protected void onDetachedFromWindow()
	{
		mMediaPlayerValid = false;
		super.onDetachedFromWindow();
		setKeepScreenOn(false);
	}

	@Override
	protected void onAttachedToWindow()
	{
		super.onAttachedToWindow();

		if (mMainVer > 0)
		{
			setSrc(mSrcUriString, mSrcType, mSrcIsNetwork, mSrcIsAsset, mRequestHeaders, mMainVer, mPatchVer);
		}
		else
		{
			setSrc(mSrcUriString, mSrcType, mSrcIsNetwork, mSrcIsAsset, mRequestHeaders);
		}
		setKeepScreenOn(true);
	}

	//    @Override
	//    public void onHostPause() {
	//        if (mMediaPlayerValid && !mPaused && !mPlayInBackground) {
	//            /* Pause the video in background
	//             * Don't update the paused prop, developers should be able to update it on background
	//             *  so that when you return to the app the video is paused
	//             */
	//            mBackgroundPaused = true;
	//            mMediaPlayer.pause();
	//        }
	//    }
	//
	//    @Override
	//    public void onHostResume() {
	//        mBackgroundPaused = false;
	//        if (mMediaPlayerValid && !mPlayInBackground && !mPaused) {
	//            new Handler().post(new Runnable() {
	//                @Override
	//                public void run() {
	//                    // Restore original state
	//                    setPausedModifier(false);
	//                }
	//            });
	//        }
	//    }
	//
	//    @Override
	//    public void onHostDestroy() {
	//    }


	public static Map<String, String> toStringMap(HippyMap readableMap)
	{
		Map<String, String> result = new HashMap<>();
		if (readableMap == null)
			return result;
		Set<String> keySet = readableMap.keySet();
		for (String key : keySet) {
			result.put(key, readableMap.getString(key));
		}
		return result;
	}

	// Select track (so we can use it to listen to timed meta data updates)
	private void selectTimedMetadataTrack(MediaPlayer mp)
	{
		if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M)
		{
			return;
		}
		try
		{ // It's possible this could throw an exception if the framework doesn't support getting track info
			MediaPlayer.TrackInfo[] trackInfo = mp.getTrackInfo();
			for (int i = 0; i < trackInfo.length; ++i)
			{
				if (trackInfo[i].getTrackType() == MediaPlayer.TrackInfo.MEDIA_TRACK_TYPE_TIMEDTEXT)
				{
					mp.selectTrack(i);
					break;
				}
			}
		}
		catch (Exception e)
		{
			LogUtils.d("VideoHippyView", "selectTimedMetadataTrack: " + e.getMessage());
		}
	}
}
