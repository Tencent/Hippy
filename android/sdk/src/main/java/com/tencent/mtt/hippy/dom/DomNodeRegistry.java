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

package com.tencent.mtt.hippy.dom;

import android.util.SparseArray;
import android.util.SparseBooleanArray;

import com.tencent.mtt.hippy.dom.node.DomNode;

public class DomNodeRegistry
{
	private final SparseArray<DomNode>	mNodeTags;
	private final SparseBooleanArray	mRootTags;

	public DomNodeRegistry()
	{
		mNodeTags = new SparseArray<>();
		mRootTags = new SparseBooleanArray();
	}

    public synchronized void removeNode(int tag) {
        mNodeTags.remove(tag);
    }
    public synchronized  void addRootNode(DomNode node)
    {
        int tag =  node.getId();
        mNodeTags.put(tag,node);
        mRootTags.put(tag,true);
    }
    public synchronized void removeRootNode(int tag) {
        mNodeTags.remove(tag);
        mRootTags.delete(tag);
    }

    public synchronized void addNode(DomNode node) {
        mNodeTags.put(node.getId(), node);
    }

    public synchronized DomNode getNode(int tag) {
        return mNodeTags.get(tag);
    }

    @SuppressWarnings("unused")
    public synchronized boolean isRootNode(int tag) {
        return mRootTags.get(tag);
    }

    public synchronized int getRootNodeCount() {
        return mRootTags.size();
    }

    public synchronized int getRootTag(int index) {
        return mRootTags.keyAt(index);
    }

    public synchronized void clear() {
        mNodeTags.clear();
        mRootTags.clear();
    }
}
