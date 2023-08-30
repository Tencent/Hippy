/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2023 THL A29 Limited, a Tencent company. All rights reserved.
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

package com.openhippy.connector;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import java.util.List;
import java.util.Map;

public interface RenderConnector extends Connector {

    String NATIVE_RENDERER = "NativeRenderer";
    String TDF_RENDERER = "TDFRenderer";

    void destroyRoot(int rootId);

    void onRuntimeInitialized(int rootId);

    void recordSnapshot(int rootId, @NonNull Object callback);

    View replaySnapshot(@NonNull Context context, @NonNull byte[] buffer);

    View replaySnapshot(@NonNull Context context, @NonNull Map<String, Object> snapshotMap);

    void removeSnapshotView();

    void setFrameworkProxy(@NonNull Object proxy);

    View createRootView(@NonNull Context context);

    void onResume();

    void onPause();

    void init(@Nullable List<Class<?>> controllers, @Nullable ViewGroup rootView);

    void addControllers(@NonNull List<Class<?>> controllers);

    void attachToDom(@NonNull Connector domConnector);

}
