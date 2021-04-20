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

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyInstanceContext;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.javascriptmodules.EventDispatcher;
import com.tencent.mtt.hippy.uimanager.HippyViewBase;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.views.view.HippyViewGroup;

import android.content.Context;
import android.text.TextUtils;

public class AudioView extends HippyViewGroup implements AudioPlayManager.AudioManagerListener,HippyViewBase
{
    private AudioPlayManager	mAudioPlayerManager;
    private int					mUniqPlayId;
    private boolean				mOnPlayStartCallBack	= false;
    private boolean				mOnPlayProgressCallBack	= false;
    private boolean				mOnPlayResumeCallBack	= false;
    private boolean				mOnPlayPauseCallBack	= false;
    private boolean				mOnPlayCompleteCallBack		= false;
    private boolean				mOnPlayErrorCallBack		= false;
    private String				mCurrentPlayAudio		= "";


    final HippyEngineContext mHippyContext;



    public AudioView(Context context)
    {
        super(context);
        mAudioPlayerManager = AudioPlayManager.getInstance();
        mUniqPlayId = AudioPlayManager.globalUiqPlayId();
        mHippyContext = ((HippyInstanceContext) context).getEngineContext();
    }



    //播放地址
    public void setAudioPlayUrl(String sAudioUrl) {
        mCurrentPlayAudio = sAudioUrl;
        mAudioPlayerManager.setAudioPlayUrl(mUniqPlayId, sAudioUrl, this); //TODO 这个view被mAudioPlayerManager持有了
    }
    //自动播放
    public void setAudioAutoPlay(boolean autoPlay) {
        if (autoPlay && !TextUtils.isEmpty(mCurrentPlayAudio)) {
            mAudioPlayerManager.playAudio(mUniqPlayId);
        }
    }
    //播放
    public void playAudio() {
        mAudioPlayerManager.playAudio(mUniqPlayId);
    }
    //seekTo
    public void seekTo(int seekToPos) {
        mAudioPlayerManager.seekTo(mUniqPlayId,seekToPos);
    }
    //pause
    public void pauseAudio() {
        mAudioPlayerManager.pauseAudio(mUniqPlayId);
    }

    public void stopAudio() {
        mAudioPlayerManager.stopAudio(mUniqPlayId);
    }

    public void releaseAudio() {
        mAudioPlayerManager.releaseAudio(mUniqPlayId);
    }
    //播放状态回调
    public void setOnPlayStart(boolean onPlayStartCallBack)
    {
        mOnPlayStartCallBack = onPlayStartCallBack;
    }

    public void setOnPlayPause(boolean onPlayPauseCallBack)
    {
        mOnPlayPauseCallBack = onPlayPauseCallBack;
    }

    public void setOnPlayResume(boolean onPlayResumeCallBack)
    {
        mOnPlayResumeCallBack = onPlayResumeCallBack;
    }

    public void setOnPlayProgress(boolean onPlayProgressCallBack)
    {
        mOnPlayProgressCallBack = onPlayProgressCallBack;
    }

    public void setOnPlayComplete(boolean onPlayCompleteCallBack)
    {
        mOnPlayCompleteCallBack = onPlayCompleteCallBack;
    }
    public void setOnPlayError(boolean onPlayErrorCallBack)
    {
        mOnPlayErrorCallBack = onPlayErrorCallBack;
    }



    @Override
    public void onPlayStart(String playAudioUrl)
    {
        if(mOnPlayStartCallBack)
        {
            HippyMap hippyMap = new HippyMap();
            hippyMap.pushString("currentSrc",playAudioUrl);
            hippyMap.pushInt("size", 0 ); //TODO not specific yet
            hippyMap.pushInt("current", mAudioPlayerManager.currentPlayAudioPosition() );
            hippyMap.pushInt("length",mAudioPlayerManager.currentPlayAudioDuration());

            mHippyContext.getModuleManager().getJavaScriptModule(EventDispatcher.class).receiveUIComponentEvent(getId(),
                    "onPlaying", hippyMap);
        }
    }

    @Override
    public void onPlayPause(String playAudioUrl)
    {
        if(mOnPlayPauseCallBack)
        {
            HippyMap hippyMap = new HippyMap();
            hippyMap.pushString("currentSrc",playAudioUrl);
            hippyMap.pushInt("size", 0 ); //TODO not specific yet
            hippyMap.pushInt("current", mAudioPlayerManager.currentPlayAudioPosition() );
            hippyMap.pushInt("length",mAudioPlayerManager.currentPlayAudioDuration());
            mHippyContext.getModuleManager().getJavaScriptModule(EventDispatcher.class).receiveUIComponentEvent(getId(),
                    "onPause", hippyMap);
        }
    }

    @Override
    public void onPlayResume(String playAudioUrl)
    {
        if(mOnPlayResumeCallBack)
        {
            HippyMap hippyMap = new HippyMap();
            hippyMap.pushString("currentSrc",playAudioUrl);
            hippyMap.pushInt("size", 0 ); //TODO not specific yet
            hippyMap.pushInt("current", mAudioPlayerManager.currentPlayAudioPosition() );
            hippyMap.pushInt("length",mAudioPlayerManager.currentPlayAudioDuration());
            mHippyContext.getModuleManager().getJavaScriptModule(EventDispatcher.class).receiveUIComponentEvent(getId(),
                    "onPlaying", hippyMap);
        }
    }

    @Override
    public void onPlayError(String playAudioUrl,int what, int extra)
    {
        if(mOnPlayErrorCallBack)
        {
            HippyMap hippyMap = new HippyMap();
            hippyMap.pushString("currentSrc",playAudioUrl);
            hippyMap.pushInt("what",what);
            hippyMap.pushInt("extra",extra);
            mHippyContext.getModuleManager().getJavaScriptModule(EventDispatcher.class).receiveUIComponentEvent(getId(),
                    "onError", hippyMap);
        }
    }

    @Override
    public void onPlayComplete(String playAudioUrl)
    {
        if(mOnPlayCompleteCallBack)
        {
            HippyMap hippyMap = new HippyMap();
            hippyMap.pushString("playAudioUrl",playAudioUrl);
            mHippyContext.getModuleManager().getJavaScriptModule(EventDispatcher.class).receiveUIComponentEvent(getId(),
                    "onEnded", hippyMap);
        }
    }

    @Override
    public void onPlayBuffering(String playAudioUrl) {
        LogUtils.d("AudioView", "onPlayBuffering");
    }

    @Override
    public void onPlayProgress(String playAudioUrl,int currentPlayTimeMs, int audioPlayTotalTimeMs)
    {
        if(mOnPlayProgressCallBack)
        {
            HippyMap hippyMap = new HippyMap();
            hippyMap.pushInt("playTimeMs",currentPlayTimeMs);
            hippyMap.pushInt("current", currentPlayTimeMs );
            hippyMap.pushInt("length",audioPlayTotalTimeMs);
            mHippyContext.getModuleManager().getJavaScriptModule(EventDispatcher.class).receiveUIComponentEvent(getId(),
                    "onProgress", hippyMap);
        }
    }
}
