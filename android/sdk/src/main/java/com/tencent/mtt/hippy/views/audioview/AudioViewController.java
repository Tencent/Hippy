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

import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.uimanager.HippyGroupController;

import android.content.Context;
import android.text.TextUtils;
import android.view.View;

@SuppressWarnings("unused")
@HippyController(name = "AudioView")
public class AudioViewController extends HippyGroupController<AudioView>
{
    //AudioView支持的操作
    public static final String	ACATION_PLAY	= "play";
    public static final String	ACATION_PAUSE	= "pause";
    public static final String	ACATION_SEEKTO	= "seek";
    public static final String	ACATION_STOP	= "stop";
    public static final String	ACATION_RELEASE	= "release"; //TODO AudioView准备AudioManager持有，如何释放

    @SuppressWarnings("unused")
    @Override
    protected View createViewImpl(Context context)
    {
        return new AudioView(context);
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = "src", defaultType = HippyControllerProps.STRING)
    public void setUrl(AudioView hippyAudioView, String url)
    {
        hippyAudioView.setAudioPlayUrl(url);
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = "autoPlay", defaultType = HippyControllerProps.BOOLEAN)
    public void setAutoPlay(AudioView hippyAudioView, boolean autoPlay)
    {
        hippyAudioView.setAudioAutoPlay(autoPlay);
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = "onPlayStart", defaultType = "boolean")
    public void setOnPlayStart(AudioView hippyAudioView, boolean change)
    {
        hippyAudioView.setOnPlayStart(change);
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = "onPlayProgress", defaultType = "boolean")
    public void setOnPlayProgress(AudioView hippyAudioView, boolean change)
    {
        hippyAudioView.setOnPlayProgress(change);
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = "onPlayPause", defaultType = "boolean")
    public void setOnPlayPause(AudioView hippyAudioView, boolean change)
    {
        hippyAudioView.setOnPlayPause(change);
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = "onPlayResume", defaultType = "boolean")
    public void setOnPlayResume(AudioView hippyAudioView, boolean change)
    {
        hippyAudioView.setOnPlayResume(change);
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = "onPlayComplete", defaultType = "boolean")
    public void setOnPlayComplete(AudioView hippyAudioView, boolean change)
    {
        hippyAudioView.setOnPlayComplete(change);
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = "setOnPlayError", defaultType = "boolean")
    public void setOnPlayError(AudioView hippyAudioView, boolean change)
    {
        hippyAudioView.setOnPlayError(change);
    }

    @SuppressWarnings("unused")
    @Override
    public void dispatchFunction(final AudioView hippyAudioView, String functionName, final HippyArray var, Promise promise)
    {
        switch (functionName)
        {
            case ACATION_PLAY:
                //如果没有传递audiourl参数，播放当前视频
                if (var.getObject(0) != null && !TextUtils.isEmpty(var.getString(0)))
                {
                    hippyAudioView.setAudioPlayUrl(var.getString(0));
                }
                hippyAudioView.playAudio();
                break;

            case ACATION_PAUSE:
                hippyAudioView.pauseAudio();
                break;
            case ACATION_RELEASE:
                hippyAudioView.releaseAudio();
                break;
            case ACATION_SEEKTO:
                if (var.getObject(0) != null && var.getInt(0) > 0)
                    hippyAudioView.seekTo(var.getInt(0));
                break;
            case ACATION_STOP:
                hippyAudioView.stopAudio();
        }
        super.dispatchFunction(hippyAudioView, functionName, var);
    }


}
