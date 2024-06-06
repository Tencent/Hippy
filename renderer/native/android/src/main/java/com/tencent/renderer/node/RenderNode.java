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

import static com.tencent.renderer.NativeRenderException.ExceptionCode.REUSE_VIEW_HAS_ABANDONED_NODE_ERR;

import android.text.TextUtils;
import android.util.Pair;
import android.util.SparseIntArray;
import android.view.View;

import android.view.ViewGroup;
import android.view.ViewParent;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.openhippy.pool.BasePool.PoolType;
import com.tencent.mtt.hippy.dom.node.NodeProps;

import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.mtt.hippy.uimanager.RenderManager;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.views.view.HippyViewGroupController;
import com.tencent.renderer.NativeRender;
import com.tencent.renderer.NativeRenderException;
import com.tencent.renderer.component.Component;
import com.tencent.renderer.component.ComponentController;
import com.tencent.renderer.component.image.ImageComponent;
import com.tencent.renderer.component.image.ImageComponentController;
import com.tencent.renderer.component.text.TextComponentController;
import com.tencent.renderer.utils.DiffUtils;

import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class RenderNode {

    private static final String TAG = "RenderNode";
    /**
     * Mark the layout information of the node to be updated.
     */
    public static final int FLAG_UPDATE_LAYOUT = 0x00000001;
    /**
     * Mark has new extra props of the text node, such as {@link android.text.Layout}
     */
    public static final int FLAG_UPDATE_EXTRA = 0x00000002;
    /**
     * Mark there are new events registered of the node.
     */
    public static final int FLAG_UPDATE_EVENT = 0x00000004;
    /**
     * Mark node need to update node attributes.
     */
    public static final int FLAG_UPDATE_TOTAL_PROPS = 0x00000008;
    /**
     * Mark node has been deleted.
     */
    public static final int FLAG_ALREADY_DELETED = 0x00000010;
    /**
     * Mark node attributes has been updated.
     */
    public static final int FLAG_ALREADY_UPDATED = 0x00000020;
    /**
     * Mark node lazy create host view, such as recycle view item sub views.
     */
    public static final int FLAG_LAZY_LOAD = 0x00000040;
    /**
     * Mark node has attach to host view.
     */
    public static final int FLAG_HAS_ATTACHED = 0x00000080;
    /**
     * Mark should update children drawing order.
     */
    public static final int FLAG_UPDATE_DRAWING_ORDER = 0x00000100;
    /**
     * Mark node has lazy parent node, which means there is an ancestor node has flag {@link #FLAG_LAZY_LOAD}.
     */
    public static final int FLAG_PARENT_LAZY_LOAD = 0x00000200;
    private int mNodeFlags = 0;
    private PoolType mPoolInUse = PoolType.NONE;
    protected int mX;
    protected int mY;
    protected int mWidth;
    protected int mHeight;
    protected final int mId;
    protected final int mRootId;
    protected final String mClassName;
    protected final ArrayList<RenderNode> mChildren = new ArrayList<>();
    protected final ArrayList<RenderNode> mChildrenUnattached = new ArrayList<>();
    protected final ControllerManager mControllerManager;
    @Nullable
    protected ArrayList<RenderNode> mDrawingOrder;
    @Nullable
    protected Map<String, Object> mProps;
    @Nullable
    protected Map<String, Object> mPropsToUpdate;
    @Nullable
    protected Map<String, Object> mEvents;
    @Nullable
    protected RenderNode mParent;
    @Nullable
    protected Object mExtra;
    @Nullable
    protected List<Pair<RenderNode, Integer>> mMoveNodes;
    @Nullable
    protected SparseIntArray mDeletedChildren;
    @Nullable
    protected Component mComponent;
    @Nullable
    protected WeakReference<View> mHostViewRef;

    public RenderNode(int rootId, int id, @NonNull String className,
            @NonNull ControllerManager controllerManager) {
        mId = id;
        mRootId = rootId;
        mClassName = className;
        mControllerManager = controllerManager;
    }

    public RenderNode(int rootId, int id, @Nullable Map<String, Object> props,
            @NonNull String className, @NonNull ControllerManager controllerManager,
            boolean isLazyLoad) {
        mId = id;
        mClassName = className;
        mRootId = rootId;
        mControllerManager = controllerManager;
        mProps = props;
        mPropsToUpdate = null;
        if (isLazyLoad) {
            setNodeFlag(FLAG_LAZY_LOAD);
        }
    }

    public int getRootId() {
        return mRootId;
    }

    public int getId() {
        return mId;
    }

    public int getZIndex() {
        return mComponent != null ? mComponent.getZIndex() : 0;
    }

    @NonNull
    public ArrayList<RenderNode> getDrawingOrder() {
        return mDrawingOrder == null ? mChildren : mDrawingOrder;
    }

    @Nullable
    public Component getComponent() {
        return mComponent;
    }

    @NonNull
    public NativeRender getNativeRender() {
        return mControllerManager.getNativeRender();
    }

    @Nullable
    public Component ensureComponentIfNeeded(Class<?> cls) {
        if (cls == ComponentController.class || cls == TextComponentController.class) {
            if (mComponent == null) {
                mComponent = new Component(this);
            }
        } else if (cls == ImageComponentController.class) {
            if (mComponent == null) {
                mComponent = new ImageComponent(this);
            } else if (!(mComponent instanceof ImageComponent)) {
                mComponent = new ImageComponent(this, mComponent);
            }
        }
        return mComponent;
    }

    @Nullable
    public RenderNode getParent() {
        return mParent;
    }

    @Nullable
    public Object getExtra() {
        return mExtra;
    }

    @Nullable
    public Map<String, Object> getProps() {
        return mProps;
    }

    public boolean containProperty(@NonNull String key) {
        return (mProps != null) ? mProps.containsKey(key) : false;
    }

    @Nullable
    public Map<String, Object> getEvents() {
        return mEvents;
    }

    @NonNull
    public String getClassName() {
        return mClassName;
    }

    public int getX() {
        return mX;
    }

    public int getY() {
        return mY;
    }

    public int getWidth() {
        return mWidth;
    }

    public int getHeight() {
        return mHeight;
    }

    public int getChildDrawingOrder(@NonNull RenderNode child) {
        return (mDrawingOrder != null) ? mDrawingOrder.indexOf(child) : mChildren.indexOf(child);
    }

    public int indexFromParent() {
        return (mParent != null) ? mParent.mChildren.indexOf(this) : 0;
    }

    public int indexOfDrawingOrder() {
        return (mParent != null) ? mParent.getChildDrawingOrder(this) : 0;
    }

    protected boolean isRoot() {
        return false;
    }

    public void removeChild(int index) {
        try {
            removeChild(mChildren.get(index));
        } catch (IndexOutOfBoundsException e) {
            e.printStackTrace();
        }
    }

    public void resetChildIndex(RenderNode child, int index) {
        if (mChildren.contains(child)) {
            removeChild(child);
            addChild(child, index);
        }
    }

    public boolean removeChild(@Nullable RenderNode node) {
        if (node != null) {
            node.mParent = null;
            if (mDrawingOrder != null) {
                mDrawingOrder.remove(node);
            }
            return mChildren.remove(node);
        }
        return false;
    }

    public void addChild(@NonNull RenderNode node) {
        addChild(node, mChildren.size());
    }

    public void addChild(@NonNull RenderNode node, int index) {
        index = (index < 0) ? 0 : Math.min(index, mChildren.size());
        mChildren.add(index, node);
        node.mParent = this;
        node.onParentLazyChanged(isLazyLoad());
        // If has set z index in the child nodes, the rendering order needs to be rearranged
        // after adding nodes
        if (mDrawingOrder != null) {
            setNodeFlag(FLAG_UPDATE_DRAWING_ORDER);
        }
    }

    public void setLazy(boolean isLazy) {
        if (isLazy == checkNodeFlag(FLAG_LAZY_LOAD)) {
            return;
        }
        boolean oldLazy = isLazyLoad();
        if (isLazy) {
            setNodeFlag(FLAG_LAZY_LOAD);
        } else {
            resetNodeFlag(FLAG_LAZY_LOAD);
        }
        notifyLazyChanged(oldLazy, isLazyLoad());
    }

    public void onParentLazyChanged(boolean isLazy) {
        if (isLazy == checkNodeFlag(FLAG_PARENT_LAZY_LOAD)) {
            return;
        }
        boolean oldLazy = isLazyLoad();
        if (isLazy) {
            setNodeFlag(FLAG_PARENT_LAZY_LOAD);
        } else {
            resetNodeFlag(FLAG_PARENT_LAZY_LOAD);
        }
        notifyLazyChanged(oldLazy, isLazyLoad());
    }

    private void notifyLazyChanged(boolean oldLazy, boolean newLazy) {
        if (oldLazy != newLazy) {
            for (int i = 0; i < getChildCount(); i++) {
                RenderNode child = getChildAt(i);
                if (child != null) {
                    child.onParentLazyChanged(newLazy);
                }
            }
        }
    }

    public void addDeleteChild(@NonNull RenderNode node) {
        if (node.hasView()) {
            if (mDeletedChildren == null) {
                mDeletedChildren = new SparseIntArray();
            }
            int index = mChildren.indexOf(node);
            if (index >= 0) {
                mDeletedChildren.put(node.getId(), mChildren.indexOf(node));
            }
        }
    }

    @Nullable
    public RenderNode getChildAt(int index) {
        try {
            return mChildren.get(index);
        } catch (IndexOutOfBoundsException e) {
            e.printStackTrace();
            return null;
        }
    }

    public int getChildCount() {
        return mChildren.size();
    }

    public void deleteSubviewIfNeeded() {
        if (mClassName.equals(NodeProps.ROOT_NODE) && checkNodeFlag(FLAG_ALREADY_DELETED)) {
            mControllerManager.deleteRootView(mId);
            return;
        }
        if (mDeletedChildren == null) {
            return;
        }
        for (int i = 0; i < mDeletedChildren.size(); i++) {
            mControllerManager
                    .deleteChild(mRootId, mId, mDeletedChildren.keyAt(i), false);
        }
        mDeletedChildren.clear();
    }

    public void setHostView(@Nullable View view) {
        if (view == null) {
            mHostViewRef = null;
        } else {
            View current = getHostView();
            if (current != view) {
                mHostViewRef = new WeakReference<>(view);
            }
        }
    }

    @Nullable
    public View getHostView() {
        return (mHostViewRef != null) ? mHostViewRef.get() : null;
    }

    public void onHostViewAttachedToWindow() {
        LogUtils.d(TAG, "onHostViewAttachedToWindow: id " + mId + ", class name " + mClassName);
        for (int i = 0; i < getChildCount(); i++) {
            RenderNode child = getChildAt(i);
            if (child != null && child.getHostView() == null) {
                Component component = child.getComponent();
                if (component != null) {
                    component.onHostViewAttachedToWindow();
                }
            }
        }
        if (mComponent != null) {
            mComponent.onHostViewAttachedToWindow();
        }
    }

    public void onHostViewRemoved() {
        for (int i = 0; i < getChildCount(); i++) {
            RenderNode child = getChildAt(i);
            if (child != null && child.getHostView() == null) {
                child.onHostViewRemoved();
            }
        }
        setHostView(null);
        if (mComponent != null) {
            mComponent.onHostViewRemoved();
        }
    }

    protected void checkHostViewReused() throws NativeRenderException {
        View view = getHostView();
        if (view == null) {
            return;
        }
        final int oldId = view.getId();
        if (oldId == mId) {
            return;
        }
        mControllerManager.replaceId(mRootId, view, mId, false);
        RenderNode fromNode = RenderManager.getRenderNode(mRootId, oldId);
        if (fromNode == null || fromNode.isDeleted()) {
            throw new NativeRenderException(REUSE_VIEW_HAS_ABANDONED_NODE_ERR,
                    "Reuse view has invalid node id=" + oldId);
        }
        Map<String, Object> diffProps = checkPropsShouldReset(fromNode);
        mControllerManager.updateProps(this, null, null, diffProps, true);
    }

    @Nullable
    public View prepareHostView(boolean skipComponentProps, PoolType poolType) {
        if (isLazyLoad()) {
            if (!skipComponentProps) {
                // component props may changed here,
                // reset FLAG_ALREADY_UPDATED to pass check in {@link #prepareHostViewRecursive} later.
                resetNodeFlag(FLAG_ALREADY_UPDATED);
            }
            return null;
        }
        mPoolInUse = poolType;
        createView(false);
        updateProps(skipComponentProps);
        if (poolType == PoolType.RECYCLE_VIEW) {
            try {
                checkHostViewReused();
            } catch (NativeRenderException e) {
                mControllerManager.getNativeRender().handleRenderException(e);
            }
        }
        mPoolInUse = PoolType.NONE;
        return getHostView();
    }

    @Nullable
    public View createView(boolean createNow) {
        deleteSubviewIfNeeded();
        if (shouldCreateView() && !TextUtils.equals(NodeProps.ROOT_NODE, mClassName)
                && mParent != null) {
            if (mPropsToUpdate == null) {
                mPropsToUpdate = getProps();
            }
            // Do not need to create a view if both self and parent node support flattening
            // and no child nodes.
            // TODO: Resolve the issue of flattened view node add child
            // Add child nodes to flattened view nodes, in some scenes may have issues with the
            // page not being able to refresh. Therefore, temporarily turn off flattening the
            // regular view node.
            if (createNow || !mControllerManager.checkFlatten(mClassName)
                    || !mParent.getClassName().equals(HippyViewGroupController.CLASS_NAME)
                    || getChildCount() > 0 || checkGestureEnable()) {
                mParent.addChildToPendingList(this);
                View view = mControllerManager.createView(this, mPoolInUse);
                setHostView(view);
                return view;
            }
        }
        return null;
    }

    @Nullable
    public View prepareHostViewRecursive() {
        boolean skipComponentProps = checkNodeFlag(FLAG_ALREADY_UPDATED);
        mPropsToUpdate = getProps();
        setNodeFlag(FLAG_UPDATE_LAYOUT | FLAG_UPDATE_EVENT);
        View view = prepareHostView(skipComponentProps, PoolType.RECYCLE_VIEW);
        for (RenderNode renderNode : mChildren) {
            renderNode.prepareHostViewRecursive();
        }
        return view;
    }

    public void mountHostViewRecursive() {
        mountHostView();
        for (RenderNode renderNode : mChildren) {
            renderNode.mountHostViewRecursive();
        }
        // Due to the delayed loading of list view items and their child elements, non first screen elements
        // may need to manually call batch complete when created, such as nested view pagers within list view items
        if (shouldNotifyNonBatchingChange()) {
            batchComplete();
        }
    }

    public boolean shouldSticky() {
        return false;
    }

    @Nullable
    protected Map<String, Object> checkPropsShouldReset(@NonNull RenderNode fromNode) {
        Map<String, Object> total = null;
        Map<String, Object> resetProps = DiffUtils.findResetProps(fromNode.getProps(), mProps);
        Map<String, Object> resetEvents = DiffUtils.findResetProps(fromNode.getEvents(), mEvents);
        try {
            if (resetProps != null) {
                total = new HashMap<>(resetProps);
            }
            if (resetEvents != null) {
                if (total == null) {
                    total = new HashMap<>(resetEvents);
                } else {
                    total.putAll(resetEvents);
                }
            }
        } catch (Exception e) {
            LogUtils.w(TAG, "checkNonExistentProps: " + e.getMessage());
        }
        return total;
    }

    public void updateProps(boolean skipComponentProps) {
        Map<String, Object> events = null;
        if (mEvents != null && checkNodeFlag(FLAG_UPDATE_EVENT)) {
            events = mEvents;
            resetNodeFlag(FLAG_UPDATE_EVENT);
        }
        mControllerManager.updateProps(this, mPropsToUpdate, events, null, skipComponentProps);
        mPropsToUpdate = null;
        resetNodeFlag(FLAG_UPDATE_TOTAL_PROPS);
    }

    private boolean shouldCreateView() {
        return !isDeleted() && !isLazyLoad() && !hasView();
    }

    private boolean hasView() {
        return mControllerManager.hasView(mRootId, mId);
    }

    protected void addChildToPendingList(RenderNode child) {
        if (!mChildrenUnattached.contains(child)) {
            mChildrenUnattached.add(child);
        }
    }

    public boolean checkNodeFlag(int flag) {
        return (mNodeFlags & flag) == flag;
    }

    public void resetNodeFlag(int flag) {
        mNodeFlags &= ~flag;
    }

    public void setNodeFlag(int flag) {
        mNodeFlags |= flag;
    }

    public void mountHostView() {
        // Before mounting child views, if there is a change in the Z index of the child nodes,
        // it is necessary to reorder the child nodes to ensure the correct mounting order.
        updateDrawingOrderIfNeeded();
        if (!mChildrenUnattached.isEmpty()) {
            Collections.sort(mChildrenUnattached, new Comparator<RenderNode>() {
                @Override
                public int compare(RenderNode n1, RenderNode n2) {
                    return n1.getZIndex() - n2.getZIndex();
                }
            });
            for (int i = 0; i < mChildrenUnattached.size(); i++) {
                RenderNode node = mChildrenUnattached.get(i);
                mControllerManager.addChild(mRootId, mId, node);
                node.setNodeFlag(FLAG_HAS_ATTACHED);
            }
            mChildrenUnattached.clear();
        }
        if (mMoveNodes != null && !mMoveNodes.isEmpty()) {
            Collections.sort(mMoveNodes, new Comparator<Pair<RenderNode, Integer>>() {
                @Override
                public int compare(Pair<RenderNode, Integer> o1, Pair<RenderNode, Integer> o2) {
                    return o1.first.indexFromParent() - o2.first.indexFromParent();
                }
            });
            for (Pair<RenderNode, Integer> pair : mMoveNodes) {
                mControllerManager.moveView(mRootId, pair.first.getId(), pair.second, mId,
                        getChildDrawingOrder(pair.first));
            }
            mMoveNodes.clear();
        }
        if (checkNodeFlag(FLAG_UPDATE_LAYOUT) && !TextUtils
                .equals(NodeProps.ROOT_NODE, mClassName)) {
            mControllerManager.updateLayout(mClassName, mRootId, mId, mX, mY, mWidth, mHeight);
            resetNodeFlag(FLAG_UPDATE_LAYOUT);
        }
        if (checkNodeFlag(FLAG_UPDATE_EXTRA) && getHostView() != null) {
            mControllerManager.updateExtra(mRootId, mId, mClassName, mExtra);
            resetNodeFlag(FLAG_UPDATE_EXTRA);
        }
    }

    public static void resetProps(@NonNull Map<String, Object> props,
            @Nullable Map<String, Object> diffProps,
            @Nullable List<Object> delProps) {
        try {
            if (diffProps != null) {
                props.putAll(diffProps);
            }
            if (delProps != null) {
                for (Object key : delProps) {
                    props.remove(key.toString());
                }
            }
        } catch (Exception e) {
            LogUtils.e(TAG, "updateProps error：" + e.getMessage());
        }
    }

    public void checkPropsToUpdate(@Nullable Map<String, Object> diffProps,
            @Nullable List<Object> delProps) {
        if (mProps == null) {
            mProps = new HashMap<>();
        }
        resetProps(mProps, diffProps, delProps);
        if (!checkNodeFlag(FLAG_UPDATE_TOTAL_PROPS)) {
            if (mPropsToUpdate == null) {
                mPropsToUpdate = diffProps;
            } else {
                if (diffProps != null) {
                    mPropsToUpdate.putAll(diffProps);
                }
            }
            if (delProps != null) {
                if (mPropsToUpdate == null) {
                    mPropsToUpdate = new HashMap<>();
                }
                for (Object key : delProps) {
                    mPropsToUpdate.put(key.toString(), null);
                }
            }
        } else {
            mPropsToUpdate = mProps;
        }
    }

    public void updateEventListener(@NonNull Map<String, Object> newEvents) {
        mEvents = newEvents;
        setNodeFlag(FLAG_UPDATE_EVENT);
    }

    public void updateLayout(int x, int y, int w, int h) {
        mX = x;
        mY = y;
        mWidth = w;
        mHeight = h;
        setNodeFlag(FLAG_UPDATE_LAYOUT);
    }

    public void addMoveNodes(@NonNull List<Pair<RenderNode, Integer>> moveNodes) {
        if (mMoveNodes == null) {
            mMoveNodes = new ArrayList<>();
        }
        mMoveNodes.addAll(moveNodes);
        setNodeFlag(FLAG_UPDATE_DRAWING_ORDER);
    }

    public void updateExtra(@Nullable Object object) {
        Component component = ensureComponentIfNeeded(ComponentController.class);
        if (component != null && object != null) {
            component.setTextLayout(object);
            setNodeFlag(FLAG_UPDATE_EXTRA);
        }
        mExtra = object;
    }

    public boolean isDeleted() {
        return checkNodeFlag(FLAG_ALREADY_DELETED);
    }

    public boolean isLazyLoad() {
        return checkNodeFlag(FLAG_LAZY_LOAD) || checkNodeFlag(FLAG_PARENT_LAZY_LOAD);
    }

    public boolean checkRegisteredEvent(@NonNull String eventName) {
        if (mEvents != null && mEvents.containsKey(eventName)) {
            Object value = mEvents.get(eventName);
            if (value instanceof Boolean) {
                return (boolean) value;
            }
        }
        return false;
    }

    public void onDeleted() {
        if (mComponent != null) {
            mComponent.clear();
        }
    }

    public void requireUpdateDrawingOrder(@NonNull RenderNode child) {
        setNodeFlag(FLAG_UPDATE_DRAWING_ORDER);
        addChildToPendingList(child);
    }

    public void onZIndexChanged() {
        if (mParent != null) {
            View hostView = getHostView();
            if (hostView != null) {
                ViewParent parent = hostView.getParent();
                if (parent != null) {
                    ((ViewGroup) parent).removeView(hostView);
                }
            }
            mParent.requireUpdateDrawingOrder(this);
        }
    }

    public void updateDrawingOrderIfNeeded() {
        if (checkNodeFlag(FLAG_UPDATE_DRAWING_ORDER)) {
            mDrawingOrder = (ArrayList<RenderNode>) mChildren.clone();
            Collections.sort(mDrawingOrder, new Comparator<RenderNode>() {
                @Override
                public int compare(RenderNode n1, RenderNode n2) {
                    return n1.getZIndex() - n2.getZIndex();
                }
            });
            resetNodeFlag(FLAG_UPDATE_DRAWING_ORDER);
        }
    }

    public boolean isBatching() {
        RenderManager renderManager = mControllerManager.getRenderManager();
        return renderManager != null && renderManager.isBatching();
    }

    public void batchStart() {
        if (!isDeleted() && !isLazyLoad()) {
            mControllerManager.onBatchStart(mRootId, mId, mClassName);
        }
    }

    protected boolean shouldNotifyNonBatchingChange() {
        return false;
    }

    public void batchComplete() {
        if (!isDeleted() && !isLazyLoad()) {
            mControllerManager.onBatchComplete(mRootId, mId, mClassName);
            if (mHostViewRef == null || mHostViewRef.get() == null) {
                invalidate();
            }
        }
    }

    @Nullable
    private View findNearestHostView() {
        View view = mControllerManager.findView(mRootId, mId);
        if (view == null && mParent != null) {
            view = mControllerManager.findView(mParent.getRootId(), mParent.getId());
        }
        return view;
    }

    public void postInvalidateDelayed(long delayMilliseconds) {
        View view = findNearestHostView();
        if (view != null) {
            view.postInvalidateDelayed(delayMilliseconds);
        }
    }

    public void invalidate() {
        View view = findNearestHostView();
        if (view != null) {
            view.invalidate();
        }
    }

    public boolean checkGestureEnable() {
        return mComponent != null && mComponent.getGestureEnable();
    }
}
