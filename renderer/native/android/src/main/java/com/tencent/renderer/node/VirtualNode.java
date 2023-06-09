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

import java.util.ArrayList;
import java.util.List;

public abstract class VirtualNode {

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
    protected List<String> mGestureTypes;

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

    public void addGesture(String event) {
        if (mGestureTypes == null) {
            mGestureTypes = new ArrayList<>();
        }
        mGestureTypes.add(event);
    }

    public void removeGesture(String event) {
        if (mGestureTypes != null) {
            mGestureTypes.remove(event);
        }
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
        if (mChildren.contains(child)) {
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
