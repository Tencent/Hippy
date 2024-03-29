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

import static com.tencent.renderer.NativeRenderer.SCREEN_SNAPSHOT_ROOT_ID;

import android.content.Context;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.tencent.renderer.node.RenderNode;
import com.tencent.renderer.node.RootRenderNode;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

public class NativeRendererManager {

    private static final ConcurrentHashMap<Integer, NativeRender> sNativeRendererMap = new ConcurrentHashMap<>();
    private static final ConcurrentHashMap<Integer, RootRenderNode> sRootNodeMap = new ConcurrentHashMap<>();

    public static void addNativeRendererInstance(Integer instanceId, @NonNull NativeRender nativeRenderer) {
        sNativeRendererMap.put(instanceId, nativeRenderer);
    }

    public static void removeNativeRendererInstance(Integer instanceId) {
        sNativeRendererMap.remove(instanceId);
    }

    @Nullable
    public static NativeRender getNativeRenderer(Integer instanceId) {
        return sNativeRendererMap.get(instanceId);
    }

    @Nullable
    public static NativeRender getNativeRenderer(@Nullable Context context) {
        if (context instanceof NativeRenderContext) {
            final int instanceId = ((NativeRenderContext) context).getInstanceId();
            return getNativeRenderer(instanceId);
        }
        return null;
    }

    public static int getRootId(@Nullable Context context) {
        if (context instanceof NativeRenderContext) {
            return ((NativeRenderContext) context).getRootId();
        }
        return 0;
    }

    public static void addRootNode(@NonNull RootRenderNode node) {
        sRootNodeMap.put(node.getId(), node);
    }

    public static void removeSnapshotRootNode() {
        RootRenderNode root = getRootNode(SCREEN_SNAPSHOT_ROOT_ID);
        if (root != null) {
            root.clear();
            removeRootNode(SCREEN_SNAPSHOT_ROOT_ID);
        }
    }

    public static void removeRootNode(Integer rootId) {
        sRootNodeMap.remove(rootId);
    }

    @Nullable
    public static RootRenderNode getRootNode(Integer rootId) {
        return sRootNodeMap.get(rootId);
    }

    @NonNull
    public static Set<Integer> getRoots() {
        return sRootNodeMap.keySet();
    }
}
