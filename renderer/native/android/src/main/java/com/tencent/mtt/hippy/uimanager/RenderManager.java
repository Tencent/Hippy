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

import static com.tencent.mtt.hippy.uimanager.RenderNode.FLAG_ALREADY_DELETED;
import static com.tencent.mtt.hippy.uimanager.RenderNode.FLAG_LAZY_LOAD;

import androidx.annotation.NonNull;

import com.tencent.link_supplier.proxy.renderer.Renderer;
import com.tencent.renderer.component.text.VirtualNode;
import com.tencent.renderer.utils.ChoreographerUtils;
import java.util.ArrayList;
import java.util.List;

import android.text.TextUtils;
import android.util.SparseArray;
import android.view.ViewGroup;

import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.utils.LogUtils;
import java.util.Map;

public class RenderManager {

    private static final String TAG = "RenderManager";
    private final SparseArray<RenderNode> mNodes = new SparseArray<>();
    private final SparseArray<RenderNode> mRootNodes = new SparseArray<>();
    private final List<RenderNode> mUIUpdateNodes = new ArrayList<>();
    @NonNull
    private final ControllerManager mControllerManager;
    private final int mRendererId;

    public RenderManager(Renderer renderer) {
        mRendererId = renderer.getInstanceId();
        mControllerManager = new ControllerManager(renderer);
    }

    public void init(@Nullable List<Class<?>> controllers) {
        mControllerManager.init(controllers);
    }

    public ControllerManager getControllerManager() {
        return mControllerManager;
    }

    public void addRootView(ViewGroup rootView) {
        mControllerManager.addRootView(rootView);
    }

    public void createRootNode(int id) {
        RenderNode node = new RenderRootNode(id, mRendererId, NodeProps.ROOT_NODE, mControllerManager);
        mRootNodes.put(id, node);
    }

    @Nullable
    public VirtualNode createVirtualNode(int rootId, int id, int pid, int index, @NonNull String className,
            @Nullable Map<String, Object> props) {
        return mControllerManager.createVirtualNode(rootId, id, pid, index, className, props);
    }

    public void destroy() {
        mControllerManager.destroy();
    }

    public void createNode(@NonNull ViewGroup rootView, int id, int pid, int index,
            @NonNull String className, @NonNull Map<String, Object> props) {
        boolean isLazy = mControllerManager.isControllerLazy(className);
        RenderNode parentNode = getRenderNode(pid);
        if (parentNode == null) {
            LogUtils.w(TAG, "createNode: parentNode == null, pid=" + pid);
            return;
        }
        RenderNode node = mControllerManager.createRenderNode(id, props, className,
                rootView, isLazy || parentNode.checkNodeFlag(FLAG_LAZY_LOAD));
        if (node == null) {
            LogUtils.w(TAG, "createNode: node == null");
            return;
        }
        mNodes.put(id, node);
        parentNode.addChild(node, index);
        addUpdateNodeIfNeeded(parentNode);
        addUpdateNodeIfNeeded(node);
    }

    public void addUpdateNodeIfNeeded(RenderNode node) {
        if (!mUIUpdateNodes.contains(node)) {
            mUIUpdateNodes.add(node);
        }
    }

    public void updateLayout(int id, int left, int top, int width, int height) {
        RenderNode node = getRenderNode(id);
        if (node != null) {
            node.updateLayout(left, top, width, height);
            addUpdateNodeIfNeeded(node);
        }
    }

    public void updateEventListener(int id, @NonNull Map<String, Object> props) {
        RenderNode node = getRenderNode(id);
        if (node != null) {
            node.updateEventListener(props);
            addUpdateNodeIfNeeded(node);
        }
    }

    public void updateNode(int id, Map<String, Object> props) {
        RenderNode node = getRenderNode(id);
        if (node != null) {
            node.updateProps(props);
            addUpdateNodeIfNeeded(node);
        }
    }

    public void moveNode(int[] ids, int newPid, int oldPid) {
        RenderNode oldParent = getRenderNode(oldPid);
        RenderNode newParent = getRenderNode(newPid);
        if (oldParent == null || newParent == null) {
            LogUtils.w(TAG, "moveNode: oldParent=" + oldParent + ", newParent=" + newParent);
            return;
        }
        List<RenderNode> moveNodes = new ArrayList<>();
        for (int i = 0; i < ids.length; i++) {
            RenderNode node = getRenderNode(ids[i]);
            if (node != null) {
                moveNodes.add(node);
                oldParent.removeChild(node);
                newParent.addChild(node, i);
            }
        }
        newParent.addMoveNodes(moveNodes);
        addUpdateNodeIfNeeded(newParent);
    }

    public void updateExtra(int id, @Nullable Object object) {
        RenderNode node = getRenderNode(id);
        if (node != null) {
            node.updateExtra(object);
            addUpdateNodeIfNeeded(node);
        }
    }

    public void deleteNode(int id) {
        RenderNode node = getRenderNode(id);
        if (node == null) {
            return;
        }
        if (node.mParent != null && mControllerManager.hasView(id)) {
            node.mParent.addDeleteChild(node);
            addUpdateNodeIfNeeded(node.mParent);
        } else if (TextUtils.equals(NodeProps.ROOT_NODE, node.getClassName())) {
            addUpdateNodeIfNeeded(node);
        }
        deleteSelfFromParent(node);
    }

    public void dispatchUIFunction(int id, @NonNull String functionName,
            @NonNull List<Object> params, @Nullable Promise promise) {
        RenderNode node = getRenderNode(id);
        if (node != null) {
            mControllerManager
                    .dispatchUIFunction(id, node.mClassName, functionName, params, promise);
        }
    }

    public void batch() {
        // Should create all views at first
        for (RenderNode node : mUIUpdateNodes) {
            node.batchStart();
            node.createView();
        }
        // Should do update after all views created
        for (RenderNode node : mUIUpdateNodes) {
            node.updateView();
            node.batchComplete();
        }
        mUIUpdateNodes.clear();
    }

    private void deleteSelfFromParent(@Nullable RenderNode node) {
        if (node == null) {
            return;
        }
        if (node.mParent != null) {
            node.mParent.removeChild(node);
        }
        mNodes.remove(node.getId());
        node.setNodeFlag(FLAG_ALREADY_DELETED);
        int childCount = node.getChildCount();
        for (int i = 0; i < childCount; i++) {
            deleteSelfFromParent(node.getChildAt(i));
        }
    }

    @Nullable
    public RenderNode getRenderNode(int id) {
        RenderNode node = mNodes.get(id);
        if (node == null) {
            node = mRootNodes.get(id);
        }
        return node;
    }

    public boolean checkRegisteredEvent(int rootId, int nodeId, @NonNull String eventName) {
        RenderNode node = getRenderNode(nodeId);
        if (node != null) {
            return node.checkRegisteredEvent(eventName);
        }
        return false;
    }

    public void replaceID(int oldId, int newId) {
        mControllerManager.replaceID(oldId, newId);
    }

    public void postInvalidateDelayed(int id, long delayMilliseconds) {
        mControllerManager.postInvalidateDelayed(id, delayMilliseconds);
    }

    public void measureInWindow(int id, Promise promise) {
        RenderNode node = getRenderNode(id);
        if (node == null) {
            promise.reject("Accessing node that do not exist!");
        } else {
            node.measureInWindow(promise);
        }
    }
}
