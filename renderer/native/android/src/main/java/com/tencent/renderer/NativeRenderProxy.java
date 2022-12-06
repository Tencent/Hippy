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

import android.content.Context;
import android.view.View;
import androidx.annotation.NonNull;
import com.tencent.mtt.hippy.common.Callback;
import java.util.Map;

public interface NativeRenderProxy extends RenderProxy {

    /**
     * Notify renderer the root view instance delete by framework.
     */
    void destroyRoot(int rootId);

    /**
     * Notify renderer the js bridger has been initialized.
     */
    void onRuntimeInitialized(int rootId);

    /**
     * Notify renderer to record node tree snapshot.
     */
    void recordSnapshot(int rootId, @NonNull final Callback<byte[]> callback);

    /**
     * Notify renderer to replay node tree snapshot.
     */
    View replaySnapshot(@NonNull Context context, @NonNull byte[] buffer);

    View replaySnapshot(@NonNull Context context, @NonNull Map<String, Object> snapshotMap);
}
