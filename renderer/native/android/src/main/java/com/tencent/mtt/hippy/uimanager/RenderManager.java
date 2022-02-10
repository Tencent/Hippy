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
import static com.tencent.renderer.NativeRenderException.ExceptionCode.INVALID_NODE_DATA_ERR;

import androidx.annotation.NonNull;
import com.tencent.renderer.NativeRenderException;

import java.util.ArrayList;
import java.util.List;

import android.text.TextUtils;
import android.util.SparseArray;
import android.view.ViewGroup;

import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.renderer.NativeRender;
import java.util.Map;

public class RenderManager {

    private static final String TAG = "RenderManager";
    final SparseArray<RenderNode> mNodes = new SparseArray<>();
    final ArrayList<RenderNode> mUIUpdateNodes = new ArrayList<>();
    final ArrayList<RenderNode> mNullUIUpdateNodes = new ArrayList<>();

    final ControllerManager mControllerManager;

    public RenderManager(NativeRender nativeRenderer, @Nullable List<Class<?>> controllers) {
        mControllerManager = new ControllerManager(nativeRenderer, controllers);
    }

    public ControllerManager getControllerManager() {
        return mControllerManager;
    }

    public void addRootView(ViewGroup rootView) {
        mControllerManager.addRootView(rootView);
    }

    public void createRootNode(int id) {
        RenderNode uiNode = new RenderNode(id, NodeProps.ROOT_NODE, mControllerManager);
        mNodes.put(id, uiNode);
    }

    public void destroy() {
        mControllerManager.destroy();
    }

    public void createNode(ViewGroup rootView, int id, int pid, int index,
            @NonNull String className, @NonNull Map<String, Object> props) {
        boolean isLazy = mControllerManager.isControllerLazy(className);
        RenderNode parentNode = mNodes.get(pid);
        if (parentNode == null) {
            throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                    TAG + ": createNode: parentNode==null, id=" + id + ", pid=" + pid);
        }
        RenderNode node = mControllerManager.createRenderNode(id, props, className,
                rootView, isLazy || parentNode.checkNodeFlag(FLAG_LAZY_LOAD));
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

    void addNullUINodeIfNeeded(RenderNode node) {
        if (!mNullUIUpdateNodes.contains(node)) {
            mNullUIUpdateNodes.add(node);
        }
    }

    public void updateLayout(int id, int left, int top, int width, int height) {
        RenderNode node = mNodes.get(id);
        if (node != null) {
            node.updateLayout(left, top, width, height);
            addUpdateNodeIfNeeded(node);
        }
    }

    public void updateEventListener(int id, @NonNull Map<String, Object> props) {
        RenderNode node = mNodes.get(id);
        if (node != null) {
            node.updateEventListener(props);
            addUpdateNodeIfNeeded(node);
        }
    }

    public void updateNode(int id, Map<String, Object> props) {
        RenderNode node = mNodes.get(id);
        if (node != null) {
            node.updateProps(props);
            addUpdateNodeIfNeeded(node);
        }
    }

    public void moveNode(ArrayList<Integer> moveIds, int oldPid, int newPid) {
        RenderNode oldParent = mNodes.get(oldPid);
        RenderNode newParent = mNodes.get(newPid);
        List<RenderNode> moveNodes = new ArrayList<>();
        for (int i = 0; i < moveIds.size(); i++) {
            RenderNode node = mNodes.get(moveIds.get(i));
            moveNodes.add(node);
            oldParent.removeChild(node);
            newParent.addChild(node, i);
        }
        newParent.addMoveNodes(moveNodes);
        addUpdateNodeIfNeeded(newParent);
    }

    public void updateExtra(int id, Object object) {
        RenderNode node = mNodes.get(id);
        if (node != null) {
            node.updateExtra(object);
            addUpdateNodeIfNeeded(node);
        }
    }

    public void deleteNode(int id) {
        RenderNode node = mNodes.get(id);
        if (node == null) {
            return;
        }
        if (node.mParent != null && mControllerManager.hasView(id)) {
            node.mParent.deleteView(node);
            addUpdateNodeIfNeeded(node.mParent);
        } else if (TextUtils.equals(NodeProps.ROOT_NODE, node.getClassName())) {
            node.deleteView(null);
        }
        deleteSelfFromParent(node);
    }

    public void dispatchUIFunction(int id, @NonNull String functionName,
            @NonNull List<Object> params, @Nullable Promise promise) {
        RenderNode node = mNodes.get(id);
        if (node != null) {
            mControllerManager
                    .dispatchUIFunction(id, node.mClassName, functionName, params, promise);
        }
    }

    public void batch() {
        LogUtils.d("RenderManager", "do batch size " + mUIUpdateNodes.size());
        for (int i = 0; i < mUIUpdateNodes.size(); i++) {
            mUIUpdateNodes.get(i).createView();
        }

        for (int i = 0; i < mUIUpdateNodes.size(); i++) {
            RenderNode uiNode = mUIUpdateNodes.get(i);
            uiNode.updateView();
        }

        for (int i = 0; i < mUIUpdateNodes.size(); i++) {
            RenderNode uiNode = mUIUpdateNodes.get(i);
            uiNode.batchComplete();
        }

        mUIUpdateNodes.clear();
        // measureInWindow and dispatch ui function
        for (int i = 0; i < mNullUIUpdateNodes.size(); i++) {
            mNullUIUpdateNodes.get(i).createView();
        }
        for (int i = 0; i < mNullUIUpdateNodes.size(); i++) {
            mNullUIUpdateNodes.get(i).updateView();
        }

        mNullUIUpdateNodes.clear();
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

    public RenderNode getRenderNode(int id) {
        try {
            return mNodes.get(id);
        } catch (Exception e) {
            return null;
        }
    }

    public void replaceID(int oldId, int newId) {
        mControllerManager.replaceID(oldId, newId);
    }

    public void postInvalidateDelayed(int id, long delayMilliseconds) {
        mControllerManager.postInvalidateDelayed(id, delayMilliseconds);
    }

    public void measureInWindow(int id, Promise promise) {
        RenderNode renderNode = mNodes.get(id);
        if (renderNode == null) {
            promise.reject("this view is null");
        } else {
            renderNode.measureInWindow(promise);

            addNullUINodeIfNeeded(renderNode);
        }

    }
}
