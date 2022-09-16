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
import android.util.Log;

import com.tencent.tdf.TDFEngine;
import com.tencent.tdf.TDFEngineConfig;

import java.util.ArrayList;

import androidx.annotation.NonNull;

public class TDFRenderEngine extends TDFEngine {
    private final ArrayList<ILifecycleListener> mLifecycleListener = new ArrayList<>();

    public TDFRenderEngine(@NonNull Context context, TDFEngineConfig configuration) {
        super(context, configuration);
    }

    @Override
    public void onShellCreated(long shell) {
        super.onShellCreated(shell);
        for (ILifecycleListener listener : mLifecycleListener) {
            listener.onShellCreated(shell);
        }
    }

    @Override
    public void onWillShellDestroy() {
        super.onWillShellDestroy();
        for (ILifecycleListener listener : mLifecycleListener) {
            listener.onWillShellDestroy();
        }
    }

    public void registerLifecycleListener(ILifecycleListener listener) {
        mLifecycleListener.add(listener);
    }

    public void unregisterLifecycleListener(ILifecycleListener listener) {
        mLifecycleListener.remove(listener);
    }

    public interface ILifecycleListener {
        void onShellCreated(long shell);
        void onWillShellDestroy();
    }

}
