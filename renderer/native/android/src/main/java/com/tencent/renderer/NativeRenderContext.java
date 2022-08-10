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
import android.content.ContextWrapper;
import android.view.ViewGroup;
import java.util.List;

public final class NativeRenderContext extends ContextWrapper {

    private int mInstanceId;
    private final int mRootId;

    public NativeRenderContext(Context context, int instanceId, int rootId) {
        super(context);
        mInstanceId = instanceId;
        mRootId = rootId;
    }

    public int getInstanceId() {
        return mInstanceId;
    }

    public int getRootId() {
        return mRootId;
    }

    /**
     * Set renderer instance id, use default access permission, use for reset root view context
     * the instance id should not change by user,
     *
     * @param instanceId renderer instance id
     * @see com.tencent.renderer.NativeRenderer#init(List, ViewGroup)
     */
    void setInstanceId(int instanceId) {
        mInstanceId = instanceId;
    }
}
