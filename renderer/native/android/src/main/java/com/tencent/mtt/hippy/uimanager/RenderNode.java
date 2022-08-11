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

import static com.tencent.renderer.NativeRenderException.ExceptionCode.REUSE_VIEW_HAS_ABANDONED_NODE_ERR;

import android.text.TextUtils;
import android.util.SparseIntArray;
import android.view.View;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.dom.node.NodeProps;

import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.renderer.NativeRender;
import com.tencent.renderer.NativeRenderException;
import com.tencent.renderer.component.Component;
import com.tencent.renderer.component.ComponentController;
import com.tencent.renderer.component.image.ImageComponent;
import com.tencent.renderer.component.image.ImageComponentController;
import com.tencent.renderer.pool.NativeRenderPool.PoolType;
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
    public static final int FLAG_UPDATE_LAYOUT = 0x00000001;
    public static final int FLAG_UPDATE_EXTRA = 0x00000002;
    public static final int FLAG_UPDATE_EVENT = 0x00000004;
    public static final int FLAG_UPDATE_TOTAL_PROPS = 0x00000008;
    public static final int FLAG_ALREADY_DELETED = 0x00000010;
    public static final int FLAG_ALREADY_UPDATED = 0x00000020;
    public static final int FLAG_LAZY_LOAD = 0x00000040;
    public static final int FLAG_HAS_ATTACHED = 0x00000080;
    private int mNodeFlags = 0;
    private PoolType mPoolInUse = PoolType.NONE;
    protected int mX;
    protected int mY;
    protected int mWidth;
    protected int mHeight;
    protected final int mId;
    protected final int mRootId;
    protected final String mClassName;
    protected final List<RenderNode> mChildren = new ArrayList<>();
    protected final List<RenderNode> mChildrenUnattached = new ArrayList<>();
    protected final ControllerManager mControllerManager;
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
    protected List<RenderNode> mMoveNodes;
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
            @NonNull String className, @NonNull ControllerManager componentManager,
            boolean isLazyLoad) {
        mId = id;
        mClassName = className;
        mRootId = rootId;
        mControllerManager = componentManager;
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
        if (cls == ComponentController.class) {
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

    protected int indexFromParent() {
        if (mParent != null) {
            return mParent.mChildren.indexOf(this);
        }
        return 0;
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

    public boolean removeChild(@Nullable RenderNode node) {
        if (node != null) {
            node.mParent = null;
            return mChildren.remove(node);
        }
        return false;
    }

    public void addChild(@NonNull RenderNode node, int index) {
        index = (index < 0) ? 0 : Math.min(index, mChildren.size());
        mChildren.add(index, node);
        node.mParent = this;
    }

    public void setLazy(boolean isLazy) {
        if (isLazy) {
            setNodeFlag(FLAG_LAZY_LOAD);
        } else {
            resetNodeFlag(FLAG_LAZY_LOAD);
        }
        for (int i = 0; i < getChildCount(); i++) {
            RenderNode child = getChildAt(i);
            if (child != null) {
                child.setLazy(isLazy);
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
        for (int i = 0; i < getChildCount(); i++) {
            RenderNode child = getChildAt(i);
            if (child != null && child.getHostView() == null) {
                child.onHostViewAttachedToWindow();
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
    protected View createView(boolean createNow) {
        deleteSubviewIfNeeded();
        if (shouldCreateView() && !TextUtils.equals(NodeProps.ROOT_NODE, mClassName)
                && mParent != null) {
            if (mPropsToUpdate == null) {
                mPropsToUpdate = getProps();
            }
            // New created view should use total props, therefore set this flag for
            // update node not need to diff props in this batch cycle.
            setNodeFlag(FLAG_UPDATE_TOTAL_PROPS);
            // Do not need to create a view if both self and parent node support flattening
            // and no child nodes.
            if (createNow || !mControllerManager.checkFlatten(mClassName)
                    || !mControllerManager.checkFlatten(mParent.getClassName())
                    || getChildCount() > 0) {
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

    protected void addChildToPendingList(RenderNode renderNode) {
        mChildrenUnattached.add(renderNode);
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
        if (!mChildrenUnattached.isEmpty()) {
            Collections.sort(mChildrenUnattached, new Comparator<RenderNode>() {
                @Override
                public int compare(RenderNode o1, RenderNode o2) {
                    return o1.indexFromParent() < o2.indexFromParent() ? -1 : 0;
                }
            });
            for (int i = 0; i < mChildrenUnattached.size(); i++) {
                RenderNode renderNode = mChildrenUnattached.get(i);
                mControllerManager
                        .addChild(mRootId, mId, renderNode.getId(), renderNode.indexFromParent());
                renderNode.setNodeFlag(FLAG_HAS_ATTACHED);
            }
            mChildrenUnattached.clear();
        }
        if (mMoveNodes != null && !mMoveNodes.isEmpty()) {
            Collections.sort(mMoveNodes, new Comparator<RenderNode>() {
                @Override
                public int compare(RenderNode o1, RenderNode o2) {
                    return o1.indexFromParent() < o2.indexFromParent() ? -1 : 0;
                }
            });
            for (RenderNode moveNode : mMoveNodes) {
                mControllerManager.moveView(mRootId, moveNode.getId(), mId,
                        moveNode.indexFromParent());
            }
            mMoveNodes.clear();
        }
        if (checkNodeFlag(FLAG_UPDATE_LAYOUT) && !TextUtils
                .equals(NodeProps.ROOT_NODE, mClassName)) {
            mControllerManager.updateLayout(mClassName, mRootId, mId, mX, mY, mWidth, mHeight);
            resetNodeFlag(FLAG_UPDATE_LAYOUT);
        }
        if (checkNodeFlag(FLAG_UPDATE_EXTRA)) {
            mControllerManager.updateExtra(mRootId, mId, mClassName, mExtra);
            resetNodeFlag(FLAG_UPDATE_EXTRA);
        }
    }

    public void checkPropsDifference(@NonNull Map<String, Object> newProps) {
        if (mProps != null && !checkNodeFlag(FLAG_UPDATE_TOTAL_PROPS)) {
            mPropsToUpdate = DiffUtils.diffMap(mProps, newProps);
        } else {
            mPropsToUpdate = newProps;
        }
        mProps = newProps;
    }

    public void updateEventListener(@NonNull Map<String, Object> newEvents) {
        mEvents = newEvents;
        setNodeFlag(FLAG_UPDATE_EVENT);
    }

    public void updateLayout(int x, int y, int w, int h) {
        this.mX = x;
        this.mY = y;
        this.mWidth = w;
        this.mHeight = h;
        setNodeFlag(FLAG_UPDATE_LAYOUT);
    }

    public void addMoveNodes(@NonNull List<RenderNode> moveNodes) {
        if (mMoveNodes == null) {
            mMoveNodes = new ArrayList<>();
        }
        mMoveNodes.addAll(moveNodes);
    }

    public void updateExtra(@Nullable Object object) {
        Component component = ensureComponentIfNeeded(ComponentController.class);
        if (component != null && object != null) {
            component.setTextLayout(object);
            setNodeFlag(FLAG_UPDATE_EXTRA);
        }
    }

    public boolean isDeleted() {
        return checkNodeFlag(FLAG_ALREADY_DELETED);
    }

    public boolean isLazyLoad() {
        return checkNodeFlag(FLAG_LAZY_LOAD);
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

    protected void batchStart() {
        if (!isDeleted() && !isLazyLoad()) {
            mControllerManager.onBatchStart(mRootId, mId, mClassName);
        }
    }

    protected void batchComplete() {
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
}
