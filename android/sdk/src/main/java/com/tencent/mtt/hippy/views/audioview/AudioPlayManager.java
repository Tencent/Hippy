package com.tencent.mtt.hippy.views.audioview;

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

import com.tencent.mtt.hippy.utils.ContextHolder;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.views.view.HippyViewGroup;

import android.content.Context;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Handler;
import android.os.HandlerThread;
import android.text.TextUtils;
import android.util.SparseArray;
import android.view.SurfaceHolder;

import java.lang.ref.WeakReference;

/**
 * @Description: TODO
 * @author: robinsli
 * @date: 2019/6/11 11:18
 * @version: V1.0
 */
public class AudioPlayManager
{
    private static final String					TAG						= "AudioPlayManager";
    private MediaPlayer							mSysMediaPlayer;													//系统播放器
    private String								mCurrentPlayUrl;													//当前播放音频的url
    private int									mCurrentPlayID;														//当前播放的ID
    private SparseArray<AudioManagerListener>	mPlayCallbackListener	= new SparseArray();						//支持多个audio播放，但是如何释放
    private SparseArray<String>					mAudioPlayUrlList		= new SparseArray();
    private SparseArray<Integer>				mAudioPlayPositionList	= new SparseArray();
    private HandlerThread						mHandlerThread			= new HandlerThread("HippyAudioPlayThread");
    private Handler								mHandler;
    private Runnable							mRunnable;
    public static final long					PROGRESS_UPDATE_TIME	= 1000L;									//更新播放进度的时间间隔
    public static final int						AUDIO_STREAM_TYPE		= 3;
    public static final int						PALY_START_POS			= 0;
    public static int							gUniqPlayId				= 0;

    public static int globalUiqPlayId()
    {
        return ++gUniqPlayId;
    }

    private static AudioPlayManager sInstance = null;

    public static AudioPlayManager getInstance()
    {
        if (sInstance == null)
            sInstance = new AudioPlayManager();
        return sInstance;
    }

    public interface AudioManagerListener
    {
        void onPlayStart(String playAudioUrl); //视频开始播放的回调

        void onPlayPause(String playAudioUrl); // 暂停

        void onPlayResume(String playAudioUrl);//继续播放

        void onPlayError(String playAudioUrl, int what, int extra); //播放失败

        void onPlayComplete(String playAudioUrl); //播放完成

        void onPlayBuffering(String playAudioUrl); //音频在缓冲中

        void onPlayProgress(String playAudioUrl, int currentPlayTimeMs, int audioPlayTotalTimeMs);
    };


    public AudioPlayManager()
    {
        /**
         * 初始化音頻播放器
         */
        mSysMediaPlayer = new MediaPlayer();
        mSysMediaPlayer.setAudioStreamType(AUDIO_STREAM_TYPE);
        mSysMediaPlayer.setOnBufferingUpdateListener(new MediaPlayer.OnBufferingUpdateListener()
        {
            public void onBufferingUpdate(MediaPlayer mediaPlayer, int percent)
            {
                if (percent == 100)
                    return;
                AudioManagerListener currentPlayCallback = mPlayCallbackListener.get(mCurrentPlayID);
                if (currentPlayCallback != null)
                {
                    currentPlayCallback.onPlayBuffering(mCurrentPlayUrl);
                }
            }
        });
        mSysMediaPlayer.setOnPreparedListener(new MediaPlayer.OnPreparedListener()
        {
            public void onPrepared(MediaPlayer mediaPlayer)
            {
                int currentPlayPostioin = mAudioPlayPositionList.get(mCurrentPlayID, PALY_START_POS);
                AudioManagerListener currentPlayCallback = mPlayCallbackListener.get(mCurrentPlayID);
                mSysMediaPlayer.seekTo(currentPlayPostioin);
                mSysMediaPlayer.start();
                if (currentPlayCallback != null)
                {
                    if (currentPlayPostioin == PALY_START_POS)
                    {
                        currentPlayCallback.onPlayStart(mCurrentPlayUrl);
                    }
                    else
                    {
                        currentPlayCallback.onPlayResume(mCurrentPlayUrl);
                    }
                }
                fireProgressChange();
            }
        });
        //系統播放器，播放失敗的回調
        mSysMediaPlayer.setOnErrorListener(new MediaPlayer.OnErrorListener()
        {
            public boolean onError(MediaPlayer mediaPlayer, int what, int extra)
            {
                AudioManagerListener currentPlayCallback = mPlayCallbackListener.get(mCurrentPlayID);
                if (currentPlayCallback != null)
                {
                    currentPlayCallback.onPlayError(mCurrentPlayUrl, what, extra);
                }
                return false;
            }
        });
        //系統播放器，播放完成的回調。
        mSysMediaPlayer.setOnCompletionListener(new MediaPlayer.OnCompletionListener()
        {
            public void onCompletion(MediaPlayer mp)
            {
                mAudioPlayPositionList.put(mCurrentPlayID, PALY_START_POS); //播放完成，下一次播放的位置位0
                AudioManagerListener currentPlayCallback = mPlayCallbackListener.get(mCurrentPlayID);
                if (currentPlayCallback != null)
                {
                    currentPlayCallback.onPlayComplete(mCurrentPlayUrl);
                }
            }
        });
        mHandlerThread.start();
        mHandler = new Handler(mHandlerThread.getLooper());
        mRunnable = new Runnable()
        {
            public void run()
            {
                AudioManagerListener listener = mPlayCallbackListener.get(mCurrentPlayID);
                if (listener != null && mSysMediaPlayer.isPlaying())
                {
                    listener.onPlayProgress(mCurrentPlayUrl, mSysMediaPlayer.getCurrentPosition(), mSysMediaPlayer.getDuration());
                    mHandler.postDelayed(this, PROGRESS_UPDATE_TIME);
                }

            }
        };
    }

    /**
     * nUiqId ---AudioView的标识ID
     * sAudioUrl ---要播放的url
     * playCallback --- 要金监听的播放回调。
     *
     * 返回 true成功
     */
    public boolean setAudioPlayUrl(int nUiqId, String sAudioUrl, AudioManagerListener playCallback)
    {
        if (TextUtils.isEmpty(sAudioUrl)) //参数检查
        {
            return false;
        }


        mAudioPlayUrlList.put(nUiqId, sAudioUrl);//记录播放的url


        if (playCallback != null) //记录播放的回调
        {
            mPlayCallbackListener.put(nUiqId, playCallback);
        }
        return true;

    }

    public boolean seekTo(int nUniqId, int seekToPos)
    {
        //获取播放地址
        String sAudioUrl = mAudioPlayUrlList.get(nUniqId);
        if (TextUtils.isEmpty(sAudioUrl))
            return false;

        if (mCurrentPlayID == nUniqId && sAudioUrl.equals(mCurrentPlayUrl)) //如果请求播放的音频和当前播放的音频是一样的
        {
            mSysMediaPlayer.seekTo(seekToPos);
        }
        return true;
    }

    /**
     * 播放音频
     */
    public boolean playAudio(int nUniqId)
    {
        try
        {
            //获取播放地址
            String sAudioUrl = mAudioPlayUrlList.get(nUniqId);
            if (TextUtils.isEmpty(sAudioUrl))
                return false;
            AudioManagerListener currentPlayCallback = null;

            if (mCurrentPlayID == nUniqId && sAudioUrl.equals(mCurrentPlayUrl)) //如果请求播放的音频和当前播放的音频是一样的
            {
                if (!mSysMediaPlayer.isPlaying())
                {
                    mSysMediaPlayer.start(); //开始播放
                    currentPlayCallback = mPlayCallbackListener.get(mCurrentPlayID); //准备回调
                    if (currentPlayCallback != null)
                    {
                        if (mAudioPlayPositionList.get(mCurrentPlayID, PALY_START_POS) == PALY_START_POS)
                        {
                            currentPlayCallback.onPlayStart(mCurrentPlayUrl); //从头开始播放
                        }
                        else
                        {
                            currentPlayCallback.onPlayResume(mCurrentPlayUrl);//继续播放
                        }
                    }

                    fireProgressChange();
                }

            }
            else//如果请求播放的音频和当前播放的音频是不一样的
            {
                if (mSysMediaPlayer.isPlaying()) //播放器正在播放，暂停
                {
                    mSysMediaPlayer.pause();
                    mAudioPlayPositionList.put(mCurrentPlayID, mSysMediaPlayer.getCurrentPosition());
                    currentPlayCallback = mPlayCallbackListener.get(mCurrentPlayID);
                    if (currentPlayCallback != null)
                    {
                        currentPlayCallback.onPlayPause(mCurrentPlayUrl);
                    }
                }

                //准备播放
                mCurrentPlayID = nUniqId;
                mCurrentPlayUrl = sAudioUrl;
                mSysMediaPlayer.reset();
                mSysMediaPlayer.setDataSource(mCurrentPlayUrl);
                mSysMediaPlayer.prepareAsync();
                mSysMediaPlayer.setDisplay(null);
            }
        }
        catch (Exception exception)
        {
            mSysMediaPlayer.reset();
            mCurrentPlayUrl = null;
            mCurrentPlayID = -1;
            LogUtils.d(TAG, "play audio exception" + exception.getMessage());
            return false;
        }
        return true;
    }

    /**
     * 释放音频播放
     */
    public boolean releaseAudio(int nUniqId)
    {
        String sAudioUrl = mAudioPlayUrlList.get(nUniqId);

        if (!TextUtils.isEmpty(mCurrentPlayUrl)  && mCurrentPlayUrl.equals(sAudioUrl) && nUniqId == mCurrentPlayID )
        {
            mSysMediaPlayer.stop();
            mSysMediaPlayer.reset();
            mCurrentPlayID = -1;
            mCurrentPlayUrl ="";
        }
        mAudioPlayUrlList.delete(nUniqId);
        mPlayCallbackListener.delete(nUniqId);
        mAudioPlayPositionList.delete(nUniqId);

        return true;
    }

    /**
     * 暂停音频播放
     */
    public boolean pauseAudio(int nUniqId)
    {
        String sAudioUrl = mAudioPlayUrlList.get(nUniqId);
        if (TextUtils.isEmpty(mCurrentPlayUrl) || !mCurrentPlayUrl.equals(sAudioUrl) || nUniqId != mCurrentPlayID || !mSysMediaPlayer.isPlaying())
            return false;
        mSysMediaPlayer.pause();
        mAudioPlayPositionList.put(mCurrentPlayID, mSysMediaPlayer.getCurrentPosition());
        AudioManagerListener currentPlayCallback = mPlayCallbackListener.get(mCurrentPlayID);
        if (currentPlayCallback != null)
        {
            currentPlayCallback.onPlayPause(mCurrentPlayUrl);
        }
        return true;
    }

    /**
     * 暂停音频播放
     */
    public boolean stopAudio(int nUniqId)
    {
        String sAudioUrl = mAudioPlayUrlList.get(nUniqId);
        if (TextUtils.isEmpty(mCurrentPlayUrl) || !mCurrentPlayUrl.equals(sAudioUrl) || nUniqId != mCurrentPlayID || !mSysMediaPlayer.isPlaying())
            return false;
        mSysMediaPlayer.stop();
        mAudioPlayPositionList.put(mCurrentPlayID, mSysMediaPlayer.getCurrentPosition());
        AudioManagerListener currentPlayCallback = mPlayCallbackListener.get(mCurrentPlayID);
        if (currentPlayCallback != null)
        {
            currentPlayCallback.onPlayPause(mCurrentPlayUrl);
        }
        return true;
    }

    public int currentPlayAudioPosition()
    {
        return mSysMediaPlayer.getCurrentPosition();
    }

    public int currentPlayAudioDuration()
    {
        return mSysMediaPlayer.getDuration();
    }


    public void release()
    {
        if (mSysMediaPlayer != null)
        {
            mSysMediaPlayer.stop();
            mSysMediaPlayer.reset();
            mSysMediaPlayer.release();
            mSysMediaPlayer = null;
            mPlayCallbackListener.clear();
            mAudioPlayUrlList.clear();
            mAudioPlayPositionList.clear();
            mCurrentPlayUrl = null;
            mCurrentPlayID = -1;
            mHandler.removeCallbacks(mRunnable);
        }

    }

    private void fireProgressChange()
    {
        mHandler.post(mRunnable);
    }

    /**
     * 获取声音播放焦点
     */
    public static int requestAudioFocus()
    {
        return requestAudioFocus(null);
    }

    public interface OnAudioStateChange
    {
        public void onChange(int state);
    }

    private static Object		afChangeListener;
    private static AudioManager	audioManager				= (AudioManager) ContextHolder.getAppContext().getSystemService(Context.AUDIO_SERVICE);
    private static int			AUDIOFOCUS_LOSS_TRANSIENT	= -2;

    public static int requestAudioFocus(OnAudioStateChange onAudioStateChange)
    {
        int result = 0;
        final WeakReference<OnAudioStateChange> reference = new WeakReference<OnAudioStateChange>(onAudioStateChange);
        try
        {
            // 创建监听器
            afChangeListener = new AudioManager.OnAudioFocusChangeListener()
            {
                public void onAudioFocusChange(int focusChange)
                {
                    if (focusChange == AUDIOFOCUS_LOSS_TRANSIENT)
                    {
                        audioManager.abandonAudioFocus((AudioManager.OnAudioFocusChangeListener) afChangeListener);
                        // 停止播放
                    }
                    else if (focusChange == AudioManager.AUDIOFOCUS_GAIN)
                    {
                        // 恢复播放
                    }
                    else if (focusChange == AudioManager.AUDIOFOCUS_LOSS)
                    {
                        audioManager.abandonAudioFocus((AudioManager.OnAudioFocusChangeListener) afChangeListener);
                        // 停止播放
                    }
                    if (reference != null)
                    {
                        OnAudioStateChange callback = reference.get();
                        if (callback != null)
                        {
                            callback.onChange(focusChange);
                        }

                    }
                }
            };
            // 请求播放的音频焦点
            result = audioManager.requestAudioFocus((AudioManager.OnAudioFocusChangeListener) afChangeListener,
                    // 指定所使用的音频流
                    AudioManager.STREAM_MUSIC,
                    // 请求长时间的音频焦点
                    AudioManager.AUDIOFOCUS_GAIN);
        }
        catch (Throwable e)
        {
            //			QZLog.e(QZLog.TO_DEVICE_TAG, "AudioHelper requestAudioFocus: " + e.getMessage(), e);
        }

        return result;
    }

    /**
     * 释放声音播放焦点
     *
     */
    public static void abandonAudioFocus()
    {
        try
        {
            if (audioManager != null)
            {
                audioManager.abandonAudioFocus((AudioManager.OnAudioFocusChangeListener) afChangeListener);
            }
        }
        catch (Throwable e)
        {
        }
    }

}
