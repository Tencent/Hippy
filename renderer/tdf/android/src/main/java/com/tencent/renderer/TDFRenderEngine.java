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

import android.content.Context;

import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.tdf.TDFEngine;
import com.tencent.tdf.TDFEngineConfig;
import androidx.annotation.NonNull;

public class TDFRenderEngine extends TDFEngine {

    private static final String TAG = "TDFRenderEngine";

    public TDFRenderEngine(@NonNull Context context, TDFEngineConfig configuration) {
        super(context, configuration);
    }

    @Override
    public void onShellCreated(long shell, long pipelineId) {
        super.onShellCreated(shell, pipelineId);
        LogUtils.d(TAG, "onShellCreated: " + shell);
    }

    @Override
    public void onWillShellDestroy() {
        super.onWillShellDestroy();
        LogUtils.d(TAG, "onWillShellDestroy");
    }
}
