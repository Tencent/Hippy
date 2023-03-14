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

package com.tencent.mtt.hippy.uimanager;

import static com.tencent.renderer.node.RenderNode.FLAG_ALREADY_DELETED;
import static com.tencent.renderer.node.RenderNode.FLAG_LAZY_LOAD;
import static com.tencent.renderer.node.RenderNode.FLAG_UPDATE_TOTAL_PROPS;

import android.content.Context;
import android.view.View;
import androidx.annotation.NonNull;

import com.tencent.renderer.NativeRenderContext;
import com.tencent.renderer.NativeRendererManager;
import com.tencent.renderer.Renderer;
import com.tencent.renderer.node.RootRenderNode;
import com.tencent.renderer.node.VirtualNode;
import com.tencent.renderer.node.TextRenderNode;
import com.tencent.renderer.pool.NativeRenderPool.PoolType;
import com.tencent.renderer.node.RenderNode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import android.text.TextUtils;

import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.utils.LogUtils;
import java.util.Map;

public class RenderManager {

    private static final String TAG = "RenderManager";
    @NonNull
    private final ControllerManager mControllerManager;
    @NonNull
    private final Map<Integer, List<RenderNode>> mUIUpdateNodes = new HashMap<>();

    public RenderManager(Renderer renderer) {
        mControllerManager = new ControllerManager(renderer);
    }

    @NonNull
    public ControllerManager getControllerManager() {
        return mControllerManager;
    }

    public void addRootView(View rootView) {
        mControllerManager.addRootView(rootView);
    }

    @Nullable
    public View getRootView(int rootId) {
        return mControllerManager.getRootView(rootId);
    }

    public void createRootNode(int id, int rendererId) {
        RootRenderNode node = new RootRenderNode(id, id, rendererId, NodeProps.ROOT_NODE,
                mControllerManager);
        NativeRendererManager.addRootNode(node);
    }

    @Nullable
    public VirtualNode createVirtualNode(int rootId, int id, int pid, int index,
            @NonNull String className, @Nullable Map<String, Object> props) {
        return mControllerManager.createVirtualNode(rootId, id, pid, index, className, props);
    }

    public void destroy() {
        mControllerManager.destroy();
    }

    public void preCreateView(int rootId, int id, int pid, @NonNull String className,
            @Nullable Map<String, Object> props) {
        boolean isLazy = mControllerManager.checkLazy(className);
        if (isLazy) {
            return;
        }
        if (pid != rootId) {
            View view = mControllerManager.getPreView(rootId, pid);
            if (view == null) {
                isLazy = true;
            }
        }
        if (!isLazy) {
            mControllerManager.preCreateView(rootId, id, className, props);
        }
    }

    public void onVirtualNodeUpdated(int rootId, int id, int pid,
            @NonNull Map<String, Object> childInfo) {
        RenderNode parentNode = getRenderNode(rootId, pid);
        if (parentNode instanceof TextRenderNode) {
            ((TextRenderNode) parentNode).onVirtualChildUpdated(id, childInfo);
        }
    }

    public void onVirtualNodeDeleted(int rootId, int id, int pid) {
        RenderNode parentNode = getRenderNode(rootId, pid);
        if (parentNode instanceof TextRenderNode) {
            ((TextRenderNode) parentNode).onVirtualChildDeleted(id);
        }
    }

    public void createNode(int rootId, int id, int pid, int index,
            @NonNull String className, @NonNull Map<String, Object> props) {
        boolean isLazy = mControllerManager.checkLazy(className);
        RootRenderNode rootNode = NativeRendererManager.getRootNode(rootId);
        RenderNode parentNode = getRenderNode(rootId, pid);
        if (rootNode == null || parentNode == null) {
            LogUtils.w(TAG,
                    "appendVirtualChild: rootNode=" + rootNode + " parentNode=" + parentNode);
            return;
        }
        RenderNode node = mControllerManager.createRenderNode(rootId, id, props, className,
                isLazy || parentNode.checkNodeFlag(FLAG_LAZY_LOAD));
        if (node == null) {
            LogUtils.w(TAG, "createNode: node == null");
            return;
        }
        // New created node should use total props, therefore set this flag for
        // update node not need to diff props in this batch cycle.
        node.setNodeFlag(FLAG_UPDATE_TOTAL_PROPS);
        node.setIndex(index);
        rootNode.addRenderNode(node);
        parentNode.addChild(node, index);
        addUpdateNodeIfNeeded(rootId, parentNode);
        addUpdateNodeIfNeeded(rootId, node);
    }

    public void addUpdateNodeIfNeeded(int rootId, RenderNode node) {
        List<RenderNode> updateNodes = mUIUpdateNodes.get(rootId);
        if (updateNodes == null) {
            updateNodes = new ArrayList<>();
            updateNodes.add(node);
            mUIUpdateNodes.put(rootId, updateNodes);
        } else if (!updateNodes.contains(node)) {
            updateNodes.add(node);
        }
    }

    public void updateLayout(int rootId, int nodeId, int left, int top, int width, int height) {
        RenderNode node = getRenderNode(rootId, nodeId);
        if (node != null) {
            node.updateLayout(left, top, width, height);
            addUpdateNodeIfNeeded(rootId, node);
        }
    }

    public void updateEventListener(int rootId, int nodeId, @NonNull Map<String, Object> props) {
        RenderNode node = getRenderNode(rootId, nodeId);
        if (node != null) {
            node.updateEventListener(props);
            addUpdateNodeIfNeeded(rootId, node);
        }
    }

    public void updateNode(int rootId, int nodeId, Map<String, Object> props) {
        RenderNode node = getRenderNode(rootId, nodeId);
        if (node != null) {
            node.checkPropsDifference(props);
            addUpdateNodeIfNeeded(rootId, node);
        }
    }

    public void moveNode(int rootId, int[] ids, int newPid, int oldPid) {
        RenderNode oldParent = getRenderNode(rootId, oldPid);
        RenderNode newParent = getRenderNode(rootId, newPid);
        if (oldParent == null || newParent == null) {
            LogUtils.w(TAG, "moveNode: oldParent=" + oldParent + ", newParent=" + newParent);
            return;
        }
        List<RenderNode> moveNodes = new ArrayList<>();
        for (int i = 0; i < ids.length; i++) {
            RenderNode node = getRenderNode(rootId, ids[i]);
            if (node != null) {
                moveNodes.add(node);
                oldParent.removeChild(node);
                newParent.addChild(node, i);
            }
        }
        newParent.addMoveNodes(moveNodes);
        addUpdateNodeIfNeeded(rootId, newParent);
    }

    public void updateExtra(int rootId, int nodeId, @Nullable Object object) {
        RenderNode node = getRenderNode(rootId, nodeId);
        if (node != null) {
            node.updateExtra(object);
            addUpdateNodeIfNeeded(rootId, node);
        }
    }

    public void deleteNode(int rootId, int id) {
        RenderNode node = getRenderNode(rootId, id);
        if (node == null) {
            return;
        }
        if (node.getParent() != null && mControllerManager.hasView(rootId, id)) {
            node.getParent().addDeleteChild(node);
            addUpdateNodeIfNeeded(rootId, node.getParent());
        } else if (TextUtils.equals(NodeProps.ROOT_NODE, node.getClassName())) {
            addUpdateNodeIfNeeded(rootId, node);
        }
        deleteSelfFromParent(rootId, node);
    }

    public void dispatchUIFunction(int rootId, int nodeId, @NonNull String functionName,
            @NonNull List<Object> params, @Nullable Promise promise) {
        RenderNode node = getRenderNode(rootId, nodeId);
        if (node != null) {
            mControllerManager
                    .dispatchUIFunction(rootId, nodeId, node.getClassName(), functionName, params,
                            promise);
        }
    }

    public void batch(int rootId) {
        List<RenderNode> updateNodes = mUIUpdateNodes.get(rootId);
        if (updateNodes == null) {
            return;
        }
        // Should create all views at first
        for (RenderNode node : updateNodes) {
            node.batchStart();
            node.prepareHostView(false, PoolType.PRE_CREATE_VIEW);
        }
        // Should do update after all views created
        for (RenderNode node : updateNodes) {
            node.mountHostView();
            node.batchComplete();
        }
        mControllerManager.onBatchEnd(rootId);
        updateNodes.clear();
    }

    private void deleteSelfFromParent(int rootId, @Nullable RenderNode node) {
        if (node == null) {
            return;
        }
        int childCount = node.getChildCount();
        for (int i = 0; i < childCount; i++) {
            deleteSelfFromParent(rootId, node.getChildAt(0));
        }
        if (node.getParent() != null) {
            node.getParent().removeChild(node);
        }
        removeRenderNode(rootId, node.getId());
        node.setNodeFlag(FLAG_ALREADY_DELETED);
        node.onDeleted();
    }

    private void removeRenderNode(int rootId, int nodeId) {
        RootRenderNode rootNode = NativeRendererManager.getRootNode(rootId);
        if (rootId == nodeId) {
            NativeRendererManager.removeRootNode(rootId);
        }
        if (rootNode != null) {
            rootNode.removeRenderNode(nodeId);
        }
    }

    @Nullable
    public static RenderNode getRenderNode(@NonNull View view) {
        Context context = view.getContext();
        if (!(context instanceof NativeRenderContext)) {
            return null;
        }
        int rootId = ((NativeRenderContext) context).getRootId();
        return getRenderNode(rootId, view.getId());
    }

    @Nullable
    public static RenderNode getRenderNode(int rootId, int id) {
        RootRenderNode rootNode = NativeRendererManager.getRootNode(rootId);
        if (rootId == id) {
            return rootNode;
        }
        if (rootNode != null) {
            return rootNode.getRenderNode(id);
        }
        return null;
    }

    public boolean checkRegisteredEvent(int rootId, int nodeId, @NonNull String eventName) {
        RenderNode node = getRenderNode(rootId, nodeId);
        if (node != null) {
            return node.checkRegisteredEvent(eventName);
        }
        return false;
    }

    public void postInvalidateDelayed(int rootId, int id, long delayMilliseconds) {
        mControllerManager.postInvalidateDelayed(rootId, id, delayMilliseconds);
    }
}
