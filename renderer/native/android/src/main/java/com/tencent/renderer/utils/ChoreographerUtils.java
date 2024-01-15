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

package com.tencent.renderer.utils;

import android.view.Choreographer;
import androidx.annotation.MainThread;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map.Entry;

public class ChoreographerUtils {

    public static final String DO_FRAME = "frameUpdate";
    private static boolean sEnablePostFrame = false;
    private static HashMap<Integer, ArrayList<Integer>> sListeners = null;

    private static void handleDoFrameCallback() {
        for (Entry<Integer, ArrayList<Integer>> entry : sListeners.entrySet()) {
            Integer rendererId = entry.getKey();
            ArrayList<Integer> rootList = entry.getValue();
            if (rootList == null) {
                continue;
            }
            for (Integer rootId : rootList) {
                EventUtils.sendRootEvent(rendererId, rootId, DO_FRAME, null);
            }
        }
    }

    private static void doPostFrame() {
        Choreographer.FrameCallback frameCallback = frameTimeNanos -> {
            if (sEnablePostFrame) {
                handleDoFrameCallback();
                doPostFrame();
            }
        };
        Choreographer.getInstance().postFrameCallback(frameCallback);
    }

    /**
     * Register frame callback listener, should call in ui thread.
     *
     * @param rendererId renderer id
     * @param rootId root node id
     */
    @MainThread
    public static void registerDoFrameListener(Integer rendererId, Integer rootId) {
        if (sListeners == null) {
            sListeners = new HashMap<>();
        }
        ArrayList<Integer> roots = sListeners.get(rendererId);
        if (roots == null) {
            roots = new ArrayList<>();
            roots.add(rootId);
            sListeners.put(rendererId, roots);
        } else {
            roots.add(rootId);
        }
        if (!sEnablePostFrame) {
            doPostFrame();
            sEnablePostFrame = true;
        }
    }

    /**
     * Unregister frame callback listener, should call in ui thread.
     *
     * @param rendererId renderer id
     * @param rootId root node id
     */
    @MainThread
    public static void unregisterDoFrameListener(Integer rendererId, Integer rootId) {
        if (sListeners == null) {
            return;
        }
        ArrayList<Integer> roots = sListeners.get(rendererId);
        if (roots != null) {
            roots.remove(rootId);
            if (roots.isEmpty()) {
                sListeners.remove(rendererId);
            }
        } else {
            sListeners.remove(rendererId);
        }
        if (sListeners.isEmpty()) {
            sEnablePostFrame = false;
        }
    }
}
