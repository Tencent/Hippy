/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2022 THL A29 Limited, a Tencent company. All rights reserved.
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

package com.tencent.renderer;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.util.Log;

import com.tencent.tdf.TDFEngine;
import com.tencent.tdf.TDFEngineConfig;
import com.tencent.tdf.filepicker.FilePickerDelegate;
import com.tencent.tdf.view.TDFViewWrapper;

@SuppressLint("ViewConstructor")
public class TDFHippyRootView extends TDFViewWrapper {
    IEngineCallback mEngineCallback;

    public TDFHippyRootView(Activity attachActivity) {
        super(attachActivity);
    }

    public void setEngineCallback(IEngineCallback engineCallback) {
        mEngineCallback = engineCallback;
    }

    @Override
    public TDFEngine createEngine() {
        TDFEngineConfig tdfEngineConfig = new TDFEngineConfig();
        tdfEngineConfig.setViewMode(TDFEngineConfig.TDFViewMode.TextureView);
        TDFRenderEngine engine = new TDFRenderEngine(getActivity(), tdfEngineConfig);
        if (mEngineCallback != null) {
            mEngineCallback.onCreated(engine);
        }
        return engine;
    }

    /**
     * Notify TDF Render
     */
    public interface IEngineCallback {
        void onCreated(TDFRenderEngine engine);
    }
}
