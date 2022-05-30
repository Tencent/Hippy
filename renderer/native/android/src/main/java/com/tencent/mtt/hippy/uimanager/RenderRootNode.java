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

import androidx.annotation.NonNull;
import com.tencent.renderer.utils.ChoreographerUtils;
import java.util.Map;
import java.util.Map.Entry;

public class RenderRootNode extends RenderNode {
    private final int mRendererId;

    public RenderRootNode(int id, int rendererId, @NonNull String className,
            @NonNull ControllerManager componentManager) {
        super(id, className, componentManager);
        mRendererId = rendererId;
    }

    public void updateEventListener(@NonNull Map<String, Object> newEvents) {
        for (Entry<String, Object> entry : newEvents.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();
            if (key != null && value instanceof Boolean) {
                handleRootEvent(key, (Boolean) value);
            }
        }
        mEvents = newEvents;
    }

    private void handleRootEvent(@NonNull String event, boolean enable) {
        if (event.equals(ChoreographerUtils.DO_FRAME)) {
            if (enable) {
                ChoreographerUtils.registerDoFrameListener(mRendererId, getId());
            } else {
                ChoreographerUtils.unregisterDoFrameListener(mRendererId, getId());
            }
        }
    }
}
