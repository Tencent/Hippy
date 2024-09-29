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

package com.tencent.renderer.node;

import android.util.SparseArray;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.renderer.utils.ChoreographerUtils;
import java.util.Map;
import java.util.Map.Entry;
import java.util.concurrent.ConcurrentHashMap;

public class RootRenderNode extends RenderNode {

    private final int mRendererId;
    private final SparseArray<RenderNode> mNodes = new SparseArray<>(80);
    private final ConcurrentHashMap<Integer, VirtualNode> mVirtualNodes = new ConcurrentHashMap<>(40);

    public RootRenderNode(int rootId, int id, int rendererId, @NonNull String className,
            @NonNull ControllerManager controllerManager) {
        super(rootId, id, className, controllerManager);
        mRendererId = rendererId;
    }

    protected boolean isRoot() {
        return true;
    }

    public void addRenderNode(@NonNull RenderNode node) {
        mNodes.put(node.getId(), node);
    }

    @Nullable
    public RenderNode getRenderNode(int id) {
        return mNodes.get(id);
    }

    public void removeRenderNode(int id) {
        mNodes.delete(id);
    }

    public void clear() {
        mNodes.clear();
        mVirtualNodes.clear();
    }

    @Nullable
    public VirtualNode getVirtualNode(int id) {
        return mVirtualNodes.get(id);
    }

    public void addVirtualNode(@NonNull VirtualNode node) {
        mVirtualNodes.put(node.getId(), node);
    }

    public void removeVirtualNode(int id) {
        mVirtualNodes.remove(id);
    }

    @Override
    public void updateEventListener(@NonNull Map<String, Object> newEvents) {
        for (Entry<String, Object> entry : newEvents.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();
            if (key != null && value instanceof Boolean) {
                // Need to check and register for animation events
                handleRootEvent(key, (Boolean) value);
            }
        }
        mEvents = newEvents;
    }

    private void handleRootEvent(@NonNull String event, boolean enable) {
        if (event.equals(ChoreographerUtils.DO_FRAME.toLowerCase())) {
            if (enable) {
                ChoreographerUtils.registerDoFrameListener(mRendererId, getId());
            } else {
                ChoreographerUtils.unregisterDoFrameListener(mRendererId, getId());
            }
        }
    }
}
