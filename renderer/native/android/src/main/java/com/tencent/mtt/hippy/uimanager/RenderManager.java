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

import static com.tencent.mtt.hippy.dom.node.NodeProps.TEXT_CLASS_NAME;
import static com.tencent.renderer.NativeRenderer.NODE_ID;
import static com.tencent.renderer.NativeRenderer.NODE_INDEX;
import static com.tencent.renderer.node.RenderNode.FLAG_ALREADY_DELETED;
import static com.tencent.renderer.node.RenderNode.FLAG_UPDATE_TOTAL_PROPS;

import android.content.Context;
import android.util.Pair;
import android.view.View;

import androidx.annotation.NonNull;

import com.openhippy.pool.BasePool.PoolType;
import com.tencent.renderer.NativeRender;
import com.tencent.renderer.NativeRenderContext;
import com.tencent.renderer.NativeRendererManager;
import com.tencent.renderer.Renderer;
import com.tencent.renderer.node.ListItemRenderNode;
import com.tencent.renderer.node.RootRenderNode;
import com.tencent.renderer.node.ScrollViewRenderNode;
import com.tencent.renderer.node.VirtualNode;
import com.tencent.renderer.node.TextRenderNode;
import com.tencent.renderer.node.RenderNode;

import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;

import android.text.TextUtils;

import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.utils.LogUtils;

import java.util.Map;
import java.util.Objects;

public class RenderManager {

    private static final String TAG = "RenderManager";
    private static final int INITIAL_UPDATE_NODE_SIZE = 1 << 9;
    private boolean isBatching = false;
    @NonNull
    private final ControllerManager mControllerManager;
    @NonNull
    private final Map<Integer, LinkedHashSet<RenderNode>> mUIUpdateNodes = new HashMap<>();
    @Nullable
    private final WeakReference<Renderer> mRendererWeakRef;

    public RenderManager(Renderer renderer) {
        mRendererWeakRef = new WeakReference<>(renderer);
        mControllerManager = new ControllerManager(renderer);
    }

    @NonNull
    public ControllerManager getControllerManager() {
        return mControllerManager;
    }

    public void addRootView(View rootView) {
        mControllerManager.addRootView(rootView);
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
        if (isLazy || id == rootId) {
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

    public void onCreateVirtualNode(int rootId, int id, int pid, int index,
            @NonNull Map<String, Object> childInfo) {
        RenderNode parentNode = getRenderNode(rootId, pid);
        if (parentNode instanceof TextRenderNode) {
            ((TextRenderNode) parentNode).onCreateVirtualChild(id, index, childInfo);
        }
    }

    public void onUpdateVirtualNode(int rootId, int id, int pid,
            @Nullable Map<String, Object> diffProps, @Nullable List<Object> delProps) {
        RenderNode parentNode = getRenderNode(rootId, pid);
        if (parentNode instanceof TextRenderNode) {
            ((TextRenderNode) parentNode).onUpdateVirtualChild(id, diffProps, delProps);
        }
    }

    public void onDeleteVirtualNode(int rootId, int id, int pid) {
        RenderNode parentNode = getRenderNode(rootId, pid);
        if (parentNode instanceof TextRenderNode) {
            ((TextRenderNode) parentNode).onDeleteVirtualChild(id);
        }
    }

    public void onMoveVirtualNode(int rootId, int pid, @NonNull List<Object> list) {
        RenderNode parentNode = getRenderNode(rootId, pid);
        if (parentNode instanceof TextRenderNode) {
            ((TextRenderNode) parentNode).onMoveVirtualChild(list);
        }
    }

    public void createNode(int rootId, int id, int pid, int index,
            @NonNull String className, @Nullable Map<String, Object> props) {
        boolean isLazy = mControllerManager.checkLazy(className);
        RootRenderNode rootNode = NativeRendererManager.getRootNode(rootId);
        RenderNode parentNode = getRenderNode(rootId, pid);
        if (rootNode == null || parentNode == null) {
            LogUtils.w(TAG,
                    "appendVirtualChild: rootNode=" + rootNode + " parentNode=" + parentNode);
            return;
        }
        RenderNode node = mControllerManager.createRenderNode(rootId, id, props, className, isLazy);
        if (node == null) {
            LogUtils.w(TAG, "createNode: node == null");
            return;
        }
        // New created node should use total props, therefore set this flag for
        // update node not need to diff props in this batch cycle.
        node.setNodeFlag(FLAG_UPDATE_TOTAL_PROPS);
        rootNode.addRenderNode(node);
        parentNode.addChild(node, index);
        addUpdateNodeIfNeeded(rootId, parentNode);
        addUpdateNodeIfNeeded(rootId, node);
    }

    public void addUpdateNodeIfNeeded(int rootId, RenderNode node) {
        LinkedHashSet<RenderNode> updateNodes = mUIUpdateNodes.get(rootId);
        if (updateNodes == null) {
            updateNodes = new LinkedHashSet<>(INITIAL_UPDATE_NODE_SIZE);
            updateNodes.add(node);
            mUIUpdateNodes.put(rootId, updateNodes);
        } else {
            updateNodes.add(node);
        }
    }

    public void updateLayout(int rootId, int nodeId, int left, int top, int width, int height) {
        RenderNode node = getRenderNode(rootId, nodeId);
        if (node != null) {
            node.updateLayout(left, top, width, height);
            addUpdateNodeIfNeeded(rootId, node);
            if (node.getParent() instanceof ScrollViewRenderNode) {
                // ScrollView doesn't receive updateLayout when its content changes,
                // so we specifically call addUpdateNodeIfNeeded()
                addUpdateNodeIfNeeded(rootId, node.getParent());
            }
        }
    }

    public void updateEventListener(int rootId, int nodeId, @NonNull Map<String, Object> props) {
        RenderNode node = getRenderNode(rootId, nodeId);
        if (node != null) {
            node.updateEventListener(props);
            addUpdateNodeIfNeeded(rootId, node);
        }
    }

    public void updateNode(int rootId, int nodeId, @Nullable Map<String, Object> diffProps,
            @Nullable List<Object> delProps) {
        RenderNode node = getRenderNode(rootId, nodeId);
        if (node != null) {
            node.checkPropsToUpdate(diffProps, delProps);
            if (node.getParent() != null) {
                addUpdateNodeIfNeeded(rootId, node.getParent());
            }
            addUpdateNodeIfNeeded(rootId, node);
        }
    }

    private static class MoveNodeInfo {

        public final int id;
        public final int index;

        public MoveNodeInfo(int id, int index) {
            this.id = id;
            this.index = index;
        }
    }

    public void moveNode(int rootId, int pid, @NonNull List<Object> list) {
        RenderNode parent = getRenderNode(rootId, pid);
        if (parent == null) {
            LogUtils.w(TAG, "moveNode: get parent failed!");
            return;
        }
        List<Pair<RenderNode, Integer>> moveNodes = null;
        List<MoveNodeInfo> infoList = new ArrayList<>();
        for (int i = 0; i < list.size(); i++) {
            try {
                final Map node = (Map) list.get(i);
                final int id = ((Number) Objects.requireNonNull(node.get(NODE_ID))).intValue();
                final int index = ((Number) Objects.requireNonNull(
                        node.get(NODE_INDEX))).intValue();
                infoList.add(new MoveNodeInfo(id, index));
            } catch (Exception e) {
                LogUtils.w(TAG, "moveNode: " + e.getMessage());
            }
        }
        Collections.sort(infoList, new Comparator<MoveNodeInfo>() {
            @Override
            public int compare(MoveNodeInfo n1, MoveNodeInfo n2) {
                return n1.index - n2.index;
            }
        });
        for (int i = 0; i < infoList.size(); i++) {
            try {
                MoveNodeInfo info = infoList.get(i);
                RenderNode child = getRenderNode(rootId, info.id);
                if (child == null) {
                    continue;
                }
                if (child instanceof ListItemRenderNode) {
                    parent.addDeleteChild(child);
                    parent.deleteSubviewIfNeeded();
                    child.setLazy(true);
                    child.setHostView(null);
                } else {
                    if (moveNodes == null) {
                        moveNodes = new ArrayList<>();
                    }
                    moveNodes.add(new Pair<>(child, pid));
                }
                parent.resetChildIndex(child, info.index);
            } catch (Exception e) {
                LogUtils.w(TAG, "moveNode: " + e.getMessage());
            }
        }
        if (moveNodes != null) {
            parent.addMoveNodes(moveNodes);
        }
        addUpdateNodeIfNeeded(rootId, parent);
    }

    public void moveNode(int rootId, int[] ids, int newPid, int oldPid, int insertIndex) {
        RenderNode oldParent = getRenderNode(rootId, oldPid);
        RenderNode newParent = getRenderNode(rootId, newPid);
        if (oldParent == null || newParent == null) {
            LogUtils.w(TAG, "moveNode: oldParent=" + oldParent + ", newParent=" + newParent);
            return;
        }
        List<Pair<RenderNode, Integer>> moveNodes = new ArrayList<>(ids.length);
        for (int i = 0; i < ids.length; i++) {
            RenderNode node = getRenderNode(rootId, ids[i]);
            if (node != null) {
                moveNodes.add(new Pair<>(node, oldPid));
                oldParent.removeChild(node);
                newParent.addChild(node, (i + insertIndex));
            }
        }
        newParent.addMoveNodes(moveNodes);
        addUpdateNodeIfNeeded(rootId, newParent);
    }

    public void updateExtra(int rootId, int nodeId, @Nullable Object object) {
        RenderNode node = getRenderNode(rootId, nodeId);
        if (node != null) {
            node.updateExtra(object);
            // The gesture set by the child nodes of the flattened text node will recreate
            // the host view, so the parent text node must be added to the update list.
            if (node.checkGestureEnable() && node.getHostView() == null && node.getParent() != null) {
                addUpdateNodeIfNeeded(rootId, node.getParent());
            }
            addUpdateNodeIfNeeded(rootId, node);
        }
    }

    public void deleteNode(int rootId, int id) {
        RenderNode node = getRenderNode(rootId, id);
        if (node == null) {
            return;
        }
        if (node.getParent() != null) {
            node.getParent().addDeleteChild(node);
            addUpdateNodeIfNeeded(rootId, node.getParent());
        } else if (TextUtils.equals(NodeProps.ROOT_NODE, node.getClassName())) {
            addUpdateNodeIfNeeded(rootId, node);
        }
        deleteSelfFromParent(rootId, node);
    }

    public void deleteSnapshotNode(int rootId) {
        RootRenderNode rootNode = NativeRendererManager.getRootNode(rootId);
        if (rootNode != null) {
            deleteSelfFromParent(rootId, rootNode);
            rootNode.clear();
        }
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

    public boolean isBatching() {
        return isBatching;
    }

    public void batch(int rootId) {
        LinkedHashSet<RenderNode> updateNodes = mUIUpdateNodes.get(rootId);
        if (updateNodes == null) {
            return;
        }
        isBatching = true;
        // Should create all views at first
        for (RenderNode node : updateNodes) {
            node.batchStart();
            node.prepareHostView(false, PoolType.PRE_CREATE_VIEW);
        }
        // Should do update after all views created
        for (RenderNode node : updateNodes) {
            node.mountHostView();
        }
        // Should do batch complete at end
        for (RenderNode node : updateNodes) {
            node.batchComplete();
        }
        mControllerManager.onBatchEnd(rootId);
        updateNodes.clear();
        isBatching = false;
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
        if (node.getClassName().equals(TEXT_CLASS_NAME)) {
            Renderer renderer = mRendererWeakRef.get();
            if (renderer instanceof NativeRender) {
                ((NativeRender) renderer).deleteVirtualChildNode(rootId, node.getId());
            }
        }
        node.setNodeFlag(FLAG_ALREADY_DELETED);
        node.onDeleted();
    }

    private void removeRenderNode(int rootId, int nodeId) {
        RootRenderNode rootNode = NativeRendererManager.getRootNode(rootId);
        if (rootId == nodeId) {
            NativeRendererManager.removeRootNode(rootId);
            if (rootNode != null) {
                rootNode.clear();
            }
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
        RenderNode node = getRenderNode(rootId, id);
        if (node != null) {
            node.postInvalidateDelayed(delayMilliseconds);
        }
    }
}
