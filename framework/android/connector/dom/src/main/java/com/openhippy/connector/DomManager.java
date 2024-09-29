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

package com.openhippy.connector;

import android.view.View;
import androidx.annotation.NonNull;
import android.os.Process;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@SuppressWarnings("JavaJniMissingFunction")
public class DomManager implements Connector {

    private final int mInstanceId;
    private final int mGroupId;
    private static final Map<Integer, List<Integer>> sDomManagerGroup = new HashMap<>();

    public DomManager(int groupId) {
        int shareDomId = DomManager.getDomIdFromGroup(groupId);
        mInstanceId = createDomManager(groupId, shareDomId);
        mGroupId = groupId;
        addDomManagerToGroup();
    }

    @Override
    public void destroy() {
        destroyDomManager(mInstanceId);
        removeDomManagerFromGroup();
    }

    @Override
    public int getInstanceId() {
        return mInstanceId;
    }

    public static int getDomIdFromGroup(int groupId) {
        List<Integer> group = sDomManagerGroup.get(groupId);
        if (group == null || group.isEmpty()) {
            return -1;
        }
        return group.get(0);
    }

    private void removeDomManagerFromGroup() {
        List<Integer> group = sDomManagerGroup.get(mGroupId);
        if (group != null) {
            try {
                group.remove(Integer.valueOf(mInstanceId));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    private void addDomManagerToGroup() {
        if (mGroupId < 0) {
            return;
        }
        List<Integer> group = sDomManagerGroup.get(mGroupId);
        if (group == null) {
            group = new ArrayList<>();
            group.add(mInstanceId);
            sDomManagerGroup.put(mGroupId, group);
        } else {
            group.add(mInstanceId);
        }
    }

    public void attachToRenderer(@NonNull Connector rendererConnector) {
        onAttachToRenderer(mInstanceId, rendererConnector.getInstanceId());
    }

    public void createRoot(@NonNull View root, float density) {
        createRootNode(root.getId(), density);
    }

    public void destroyRoot(int rootId) {
        destroyRootNode(rootId);
    }

    public void releaseRoot(int rootId) { releaseRootResources(rootId); }

    public void attachToRoot(View root) {
        setDomManager(root.getId(), mInstanceId);
    }

    public void setThreadPrority() {
        int tid = Process.myTid();
        Process.setThreadPriority(tid, Thread.MAX_PRIORITY);
    }

    /**
     * Attach to renderer with specified id.
     *
     * @param rendererId the unique id of renderer
     */
    private native void onAttachToRenderer(int domId, int rendererId);

    /**
     * Create native (C++) dom manager instance.
     *
     * @return the unique id of native (C++) dom manager
     */
    private native int createDomManager(int groupId, int shareDomId);

    /**
     * Release native (C++) dom manager instance.
     *
     * @param domManagerId the unique id of native (C++) dom manager
     */
    private native void destroyDomManager(int domManagerId);

    private native void createRootNode(int rootId, float density);

    private native void destroyRootNode(int rootId);

    private native void releaseRootResources(int rootId);

    private native void setDomManager(int rootId, int domManagerId);

}
