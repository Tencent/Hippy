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

package com.tencent.devtools;

public class DevtoolsManager {

    private final boolean mDebugMode;
    private int mId;

    public int getId() {
        return mId;
    }

    public DevtoolsManager(boolean debugMode) {
        mDebugMode = debugMode;
    }

    public void create(int workerManagerId, String dataDir, String wsUrl) {
        if (mDebugMode) {
            mId = onCreateDevtools(workerManagerId, dataDir, wsUrl);
        }
    }

    public void destroy(boolean isReload) {
        if (mDebugMode) {
            onDestroyDevtools(getId(), isReload);
        }
    }

    /**
     * create devtools jni
     */
    @SuppressWarnings("JavaJniMissingFunction")
    private native int onCreateDevtools(int workerManagerId, String dataDir, String wsUrl);

    /**
     * destroy devtools jni
     */
    @SuppressWarnings("JavaJniMissingFunction")
    private native void onDestroyDevtools(int devtoolsId, boolean isReload);
}
