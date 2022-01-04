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

import static com.tencent.renderer.NativeRenderException.ExceptionCode.INVALID_NODE_DATA_ERR;

import androidx.annotation.NonNull;
import com.tencent.renderer.NativeRenderException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import android.text.TextUtils;
import android.util.SparseArray;
import android.view.ViewGroup;

import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.DomNode;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.renderer.NativeRender;

@SuppressWarnings({"deprecation", "unused"})
public class RenderManager {

    private static final String TAG = "RenderManager";
    final SparseArray<RenderNode> mNodes = new SparseArray<>();

    final SparseArray<Boolean> mPreIsLazy = new SparseArray<>();

    final ArrayList<RenderNode> mUIUpdateNodes = new ArrayList<>();
    final ArrayList<RenderNode> mNullUIUpdateNodes = new ArrayList<>();

    final ControllerManager mControllerManager;

    public RenderManager(NativeRender nativeRenderer, @Nullable List<Class> controllers) {
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
        getControllerManager().destroy();
    }

    public void createNode(ViewGroup rootView, int id, int pid, int index,
            String className, HashMap<String, Object> props) {
        HippyMap localProps = new HippyMap(props);
        boolean isLazy = mControllerManager.isControllerLazy(className);
        RenderNode parentNode = mNodes.get(pid);
        if (parentNode == null) {
            throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                    TAG + ": createNode: parentNode==null, id=" + id + ", pid=" + pid);
        }

        RenderNode node = mControllerManager.createRenderNode(id, localProps, className,
                rootView, isLazy || parentNode.mIsLazyLoad);
        mNodes.put(id, node);
        mPreIsLazy.remove(id);
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

    public void updateEventListener(int id, @NonNull HashMap<String, Object> props) {
        RenderNode node = mNodes.get(id);
        if (node != null) {
            node.updateEventListener(props);
            addUpdateNodeIfNeeded(node);
        }
    }

    public void updateNode(int id, HashMap<String, Object> props) {
        RenderNode node = mNodes.get(id);
        if (node != null) {
            HippyMap localProps = new HippyMap(props);
            node.updateNode(localProps);
            addUpdateNodeIfNeeded(node);
        }
    }

    public void moveNode(ArrayList<Integer> moveIds, int pId, int id) {

        RenderNode parentNode = mNodes.get(pId);
        RenderNode newParent = mNodes.get(id);
        List<RenderNode> arrayList = new ArrayList<>();

        for (int i = 0; i < moveIds.size(); i++) {
            RenderNode renderNode = mNodes.get(moveIds.get(i));
            arrayList.add(renderNode);
            parentNode.removeChild(renderNode);
            newParent.addChild(renderNode, i);
        }
        parentNode.move(arrayList, id);
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
        RenderNode uiNode = mNodes.get(id);
        uiNode.setDelete(true);

        if (uiNode.mParent != null && mControllerManager.hasView(id)) {
            uiNode.mParent.addDeleteId(id, uiNode);
            addUpdateNodeIfNeeded(uiNode.mParent);
        } else if (TextUtils.equals(NodeProps.ROOT_NODE, uiNode.getClassName())) {
            addUpdateNodeIfNeeded(uiNode);
        }
        deleteSelfFromParent(uiNode);

    }

    public void dispatchUIFunction(int id, String functionName, HippyArray var, Promise promise) {
        RenderNode renderNode = mNodes.get(id);
        if (renderNode != null) {
            renderNode.dispatchUIFunction(functionName, var, promise);
            addNullUINodeIfNeeded(renderNode);
        } else {
            LogUtils.d("RenderManager", "dispatchUIFunction Node Null");
        }

    }

    public void nonUIBatchEnd() {
        LogUtils.d("RenderManager", "do nonUIBatchEnd size " + mUIUpdateNodes.size());
        for (int i = 0; i < mUIUpdateNodes.size(); i++) {
            mUIUpdateNodes.get(i).createView();
        }
        for (int i = 0; i < mUIUpdateNodes.size(); i++) {
            RenderNode uiNode = mUIUpdateNodes.get(i);
            uiNode.update();
        }

        mUIUpdateNodes.clear();
    }

    public void batch() {
        LogUtils.d("RenderManager", "do batch size " + mUIUpdateNodes.size());
        for (int i = 0; i < mUIUpdateNodes.size(); i++) {
            mUIUpdateNodes.get(i).createView();
        }

        for (int i = 0; i < mUIUpdateNodes.size(); i++) {
            RenderNode uiNode = mUIUpdateNodes.get(i);
            uiNode.update();
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
            mNullUIUpdateNodes.get(i).update();
        }

        mNullUIUpdateNodes.clear();
    }

    private void deleteSelfFromParent(RenderNode uiNode) {

        LogUtils.d("RenderManager",
                "delete RenderNode " + uiNode.mId + " class " + uiNode.mClassName);
        if (uiNode.mParent != null) {
            uiNode.mParent.removeChild(uiNode);
        }

        mNodes.remove(uiNode.mId);

        int childCount = uiNode.getChildCount();
        for (int i = 0; i < childCount; i++) {
            deleteSelfFromParent(uiNode.getChildAt(0));
        }
    }

    public DomNode createStyleNode(String className, boolean isVirtual, int id, int rootId) {
        DomNode domNode = mControllerManager.createStyleNode(className, isVirtual, rootId);
        domNode.setViewClassName(className);
        domNode.setId(id);
        return domNode;
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


    public void measureInWindow(int id, Promise promise) {
        RenderNode renderNode = mNodes.get(id);
        if (renderNode == null) {
            promise.reject("this view is null");
        } else {
            renderNode.measureInWindow(promise);

            addNullUINodeIfNeeded(renderNode);
        }

    }

    public void createPreView(ViewGroup hippyRootView, int id, int pid, int mIndex,
            String className, HippyMap newProps) {

        boolean isLazy = mControllerManager.isControllerLazy(className);

        RenderNode parentNode = mNodes.get(pid);
        if (parentNode != null) {
            isLazy = isLazy || parentNode.mIsLazyLoad;
        } else {
            isLazy = isLazy || mPreIsLazy.get(pid);
        }
        mPreIsLazy.put(id, isLazy);

        if (!isLazy) {
            mControllerManager.createPreView(hippyRootView, id, className, newProps);
        }
    }
}
