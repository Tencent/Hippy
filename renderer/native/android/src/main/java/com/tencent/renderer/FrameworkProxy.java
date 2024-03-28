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

package com.tencent.renderer;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.common.BaseEngineContext;
import com.tencent.mtt.hippy.common.LogAdapter;
import com.tencent.renderer.component.image.ImageDecoderAdapter;
import com.tencent.renderer.component.text.FontAdapter;
import com.tencent.vfs.VfsManager;
import java.util.concurrent.Executor;

public interface FrameworkProxy {

    @Nullable
    ImageDecoderAdapter getImageDecoderAdapter();

    @Nullable
    FontAdapter getFontAdapter();

    @Nullable
    LogAdapter getLogAdapter();

    @NonNull
    VfsManager getVfsManager();

    @Nullable
    Executor getBackgroundExecutor();

    @Nullable
    Object getCustomViewCreator();

    @Nullable
    String getBundlePath();

    @NonNull
    BaseEngineContext getEngineContext();

    int getEngineId();

    void onFirstPaint();

    void onFirstContentfulPaint();

    void handleNativeException(Exception exception);

    void updateDimension(int width, int height, boolean shouldUseScreenDisplay,
            boolean systemUiVisibilityChanged);

    void onSizeChanged(int rootId, int w, int h, int ow, int oh);
}
