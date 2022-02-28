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
package com.tencent.renderer.component.text;

import android.text.Spannable;
import android.text.SpannableStringBuilder;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public abstract class VirtualNode {

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

    public VirtualNode(int id, int pid, int index) {
        mId = id;
        mPid = pid;
        mIndex = index;
    }

    public int getId() {
        return mId;
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

    public void markDirty() {
        if (mParent != null) {
            mParent.markDirty();
        }
        mDirty = true;
    }

    public void removeChild(@NonNull VirtualNode child) {
        if (mChildren == null) {
            return;
        }
        mChildren.remove(child);
    }

    public void addChildAt(@NonNull VirtualNode child, int index) {
        if (child.mParent != null) {
            return;
        }
        if (mChildren == null) {
            mChildren = new ArrayList<>(4);
        }
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

        private final int mStart;
        private final int mEnd;
        private final Object mWhat;

        @SuppressWarnings("unused")
        SpanOperation(int start, int end, Object what) {
            mStart = start;
            mEnd = end;
            mWhat = what;
        }

        public void execute(SpannableStringBuilder builder) {
            int spanFlags = Spannable.SPAN_EXCLUSIVE_INCLUSIVE;
            if (mStart == 0) {
                spanFlags = Spannable.SPAN_INCLUSIVE_INCLUSIVE;
            }
            builder.setSpan(mWhat, mStart, mEnd, spanFlags);
        }
    }
}
