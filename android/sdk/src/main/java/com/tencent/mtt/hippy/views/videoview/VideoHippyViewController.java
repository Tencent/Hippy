package com.tencent.mtt.hippy.views.videoview;

import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.uimanager.HippyViewController;

import android.content.Context;
import android.view.View;

@SuppressWarnings({"deprecation","unused"})
@HippyController(name = VideoHippyViewController.CLASS_NAME)
public class VideoHippyViewController extends HippyViewController<VideoHippyView> {

    public static final String	CLASS_NAME						= "VideoView";
    public static final String PROP_SRC = "src";
    public static final String PROP_SRC_URI = "uri";
    public static final String PROP_SRC_TYPE = "type";
    public static final String PROP_SRC_HEADERS = "requestHeaders";
    public static final String PROP_SRC_IS_NETWORK = "isNetwork";
    public static final String PROP_SRC_MAINVER = "mainVer";
    public static final String PROP_SRC_PATCHVER = "patchVer";
    public static final String PROP_SRC_IS_ASSET = "isAsset";
    public static final String PROP_RESIZE_MODE = "resizeMode";
    public static final String PROP_REPEAT = "loop";
    public static final String PROP_PAUSED = "paused";
    public static final String PROP_AUTOPLAY = "autoPlay";
    public static final String PROP_MUTED = "muted";
    public static final String PROP_VOLUME = "volume";
    public static final String PROP_STEREO_PAN = "stereoPan";
    public static final String PROP_PROGRESS_UPDATE_INTERVAL = "progressUpdateInterval";
    public static final String PROP_SEEK = "seek";
    public static final String PROP_RATE = "rate";
    public static final String PROP_FULLSCREEN = "fullscreen";
    public static final String PROP_PLAY_IN_BACKGROUND = "playInBackground";
    public static final String PROP_CONTROLS = "controls";



    public static final String OP_PLAY = "play";
    public static final String OP_PAUSE = "pause";
    public static final String OP_RELEASE = "release";
    public static final String OP_STOP = "resume";
    public static final String OP_SEEKTO = "seek";
    public static final String OP_RESET ="reset";
    @Override
    protected View createViewImpl(Context context, HippyMap iniProps)
    {

        return new VideoHippyView(context);
    }

    @Override
    protected View createViewImpl(Context context)
    {
        return null;
    }
    @HippyControllerProps(name = PROP_SRC)
    public void setSrc(final VideoHippyView videoView,  String source) {
        int mainVer = 0;
        int patchVer = 0;
        videoView.setSrc(
                source,
                "mp4",
                true,
                false,
                new HippyMap(),
                mainVer,
                patchVer
        );
    }

    @HippyControllerProps(name = PROP_RESIZE_MODE)
    public void setResizeMode(final VideoHippyView videoView, final String resizeModeOrdinalString) {
        videoView.setResizeModeModifier(ScalableType.values()[Integer.parseInt(resizeModeOrdinalString)]);
    }

    @HippyControllerProps(name = PROP_REPEAT,defaultType = HippyControllerProps.BOOLEAN)
    public void setRepeat(final VideoHippyView videoView, final boolean repeat) {
        videoView.setRepeatModifier(repeat);
    }

    @HippyControllerProps(name = PROP_PAUSED,defaultType = HippyControllerProps.BOOLEAN)
    public void setPaused(final VideoHippyView videoView, final boolean paused) {
        videoView.setPausedModifier(paused);
    }

    @HippyControllerProps(name = PROP_MUTED,defaultType = HippyControllerProps.BOOLEAN)
    public void setMuted(final VideoHippyView videoView, final boolean muted) {
        videoView.setMutedModifier(muted);
    }

    @HippyControllerProps(name = PROP_VOLUME,defaultType = HippyControllerProps.NUMBER,defaultNumber = 1.0f)
    public void setVolume(final VideoHippyView videoView, final float volume) {
        videoView.setVolumeModifier(volume);
    }

    @HippyControllerProps(name = PROP_STEREO_PAN)
    public void setStereoPan(final VideoHippyView videoView, final float stereoPan) {
        videoView.setStereoPan(stereoPan);
    }

    @HippyControllerProps(name = PROP_PROGRESS_UPDATE_INTERVAL,defaultType = HippyControllerProps.NUMBER, defaultNumber = 250.0f)
    public void setProgressUpdateInterval(final VideoHippyView videoView, final float progressUpdateInterval) {
        videoView.setProgressUpdateInterval(progressUpdateInterval);
    }

    @HippyControllerProps(name = PROP_SEEK)
    public void setSeek(final VideoHippyView videoView, final float seek) {
        videoView.seekTo(Math.round(seek * 1000.0f));
    }

    @HippyControllerProps(name = PROP_RATE,defaultType = HippyControllerProps.NUMBER,defaultNumber = 0.0f)
    public void setRate(final VideoHippyView videoView, final float rate) {
        videoView.setRateModifier(rate);
    }

    @HippyControllerProps(name = PROP_FULLSCREEN,defaultType = HippyControllerProps.BOOLEAN)
    public void setFullscreen(final VideoHippyView videoView, final boolean fullscreen) {
        videoView.setFullscreen(fullscreen);
    }

    @HippyControllerProps(name = PROP_PLAY_IN_BACKGROUND,defaultType = HippyControllerProps.BOOLEAN)
    public void setPlayInBackground(final VideoHippyView videoView, final boolean playInBackground) {
        videoView.setPlayInBackground(playInBackground);
    }

    @HippyControllerProps(name = PROP_AUTOPLAY,defaultType = HippyControllerProps.BOOLEAN)
    public void setAutoPlay(final VideoHippyView videoView, final boolean autoPlay) {
         videoView.setAutoPlay(autoPlay);
    }
    @Override
    public void dispatchFunction(final  VideoHippyView view, String functionName, HippyArray var, Promise promise)
    {
        switch (functionName)
        {
            case OP_PLAY:
                view.applyModifiers(false);
                break;
            case OP_PAUSE:
                view.pause();
                break;
            case OP_STOP:
                view.stop();
                break;
            case OP_RELEASE:
                view.release();
                break;
            case OP_SEEKTO:
                view.seekTo(var.getInt(0));
                break;
            case OP_RESET:
                view.reset();
                break;
        }
    }

}

