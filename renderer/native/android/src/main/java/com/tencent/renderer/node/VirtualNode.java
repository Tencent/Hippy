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

import android.text.Spannable;
import android.text.SpannableStringBuilder;
import android.text.style.ImageSpan;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;

public abstract class VirtualNode {

    public static final String V_ALIGN_TOP = "top";
    public static final String V_ALIGN_MIDDLE = "middle";
    public static final String V_ALIGN_BASELINE = "baseline";
    public static final String V_ALIGN_BOTTOM = "bottom";
    protected final int mRootId;
    protected final int mId;
    protected final int mPid;
    protected final int mIndex;
    protected boolean mDirty = true;
    @Nullable
    protected List<VirtualNode> mChildren;
    @Nullable
    protected VirtualNode mParent;
    @Nullable
    protected List<String> mEventTypes;
    @Nullable
    protected String mVerticalAlign;
    protected float mOpacity = 1f;

    public static final HashSet<String> GESTURE_EVENTS = new HashSet<String>() {{
        add(NodeProps.ON_LONG_CLICK);
        add(NodeProps.ON_CLICK);
        add(NodeProps.ON_PRESS_IN);
        add(NodeProps.ON_PRESS_OUT);
        add(NodeProps.ON_TOUCH_DOWN);
        add(NodeProps.ON_TOUCH_MOVE);
        add(NodeProps.ON_TOUCH_END);
        add(NodeProps.ON_TOUCH_CANCEL);
    }};

    public VirtualNode(int rootId, int id, int pid, int index) {
        mRootId = rootId;
        mId = id;
        mPid = pid;
        mIndex = index;
    }

    public int getId() {
        return mId;
    }

    public int getRootId() {
        return mRootId;
    }

    public int getAncestorId() {
        VirtualNode parent = mParent;
        int id = mId;
        while (parent != null) {
            id = parent.getId();
            parent = parent.mParent;
        }
        return id;
    }

    protected abstract void createSpanOperation(List<SpanOperation> ops,
            SpannableStringBuilder builder, boolean useChild);

    public void addEventType(String event) {
        if (mEventTypes == null) {
            mEventTypes = new ArrayList<>();
        }
        mEventTypes.add(event);
    }

    public void removeEventType(String event) {
        if (mEventTypes != null) {
            mEventTypes.remove(event);
        }
    }

    public boolean hasEventType(String event) {
        return mEventTypes != null && mEventTypes.contains(event);
    }

    public boolean containGestureEvent() {
        if (mEventTypes != null) {
            for (String event : mEventTypes) {
                if (GESTURE_EVENTS.contains(event)) {
                    return true;
                }
            }
        }
        return false;
    }

    public boolean isDirty() {
        return mDirty;
    }

    public void markDirty() {
        if (mParent != null) {
            mParent.markDirty();
        }
        mDirty = true;
    }

    public void resetChildIndex(@NonNull VirtualNode child, int index) {
        if (mChildren != null && mChildren.contains(child)) {
            removeChild(child);
            addChildAt(child, index);
        }
    }

    public void removeChild(@NonNull VirtualNode child) {
        if (mChildren != null) {
            mChildren.remove(child);
            child.mParent = null;
        }
    }

    public void addChildAt(@NonNull VirtualNode child, int index) {
        if (child.mParent != null) {
            return;
        }
        if (mChildren == null) {
            mChildren = new ArrayList<>(4);
        }
        index = (index < 0) ? 0 : Math.min(index, mChildren.size());
        mChildren.add(index, child);
        child.mParent = this;
    }

    @Nullable
    public VirtualNode getChildAt(int index) {
        if (mChildren == null) {
            return null;
        }
        return mChildren.get(index);
    }

    public int getChildCount() {
        if (mChildren == null) {
            return 0;
        }
        return mChildren.size();
    }

    public void setVerticalAlign(String align) {
        if (Objects.equals(mVerticalAlign, align)) {
            return;
        }
        switch (align) {
            case HippyControllerProps.DEFAULT:
                // reset to default
                mVerticalAlign = null;
                break;
            case V_ALIGN_TOP:
            case V_ALIGN_MIDDLE:
            case V_ALIGN_BASELINE:
            case V_ALIGN_BOTTOM:
                mVerticalAlign = align;
                break;
            default:
                mVerticalAlign = V_ALIGN_BASELINE;
                break;
        }
        markDirty();
    }

    @Nullable
    public String getVerticalAlign() {
        if (mVerticalAlign != null) {
            return mVerticalAlign;
        }
        if (mParent != null) {
            return mParent.getVerticalAlign();
        }
        return null;
    }

    public void setOpacity(float opacity) {
        opacity = Math.min(Math.max(0, opacity), 1);
        if (opacity != mOpacity) {
            mOpacity = opacity;
            markDirty();
        }
    }

    public float getFinalOpacity() {
        return mParent == null ? mOpacity : mParent.getFinalOpacity() * mOpacity;
    }

    protected static class SpanOperation {

        public static final int PRIORITY_DEFAULT = 1;
        public static final int PRIORITY_LOWEST = 0;
        private final int mStart;
        private final int mEnd;
        private final Object mWhat;
        private final int mPriority;

        @SuppressWarnings("unused")
        SpanOperation(int start, int end, Object what) {
            this(start, end, what, PRIORITY_DEFAULT);
        }

        SpanOperation(int start, int end, Object what, int priority) {
            mStart = start;
            mEnd = end;
            mWhat = what;
            mPriority = priority;
        }

        public Object getSpan() {
            return mWhat;
        }

        public void execute(SpannableStringBuilder builder) {
            int spanFlags;
            if (mWhat instanceof ImageSpan) {
                spanFlags = Spannable.SPAN_EXCLUSIVE_EXCLUSIVE;
            } else if (mStart == 0) {
                spanFlags = Spannable.SPAN_INCLUSIVE_INCLUSIVE;
            } else {
                spanFlags = Spannable.SPAN_EXCLUSIVE_INCLUSIVE;
            }
            spanFlags |= (mPriority << Spannable.SPAN_PRIORITY_SHIFT) & Spannable.SPAN_PRIORITY;
            builder.setSpan(mWhat, mStart, mEnd, spanFlags);
        }
    }
}
