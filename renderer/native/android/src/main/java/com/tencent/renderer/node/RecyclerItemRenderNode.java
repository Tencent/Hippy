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

import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import java.util.Map;

public class RecyclerItemRenderNode extends ListItemRenderNode {

    public RecyclerItemRenderNode(int rootId, int id, @Nullable Map<String, Object> props,
            String className, ControllerManager componentManager, boolean isLazyLoad) {
        super(rootId, id, props, className, componentManager, isLazyLoad);
    }

    @Override
    public void updateLayout(int x, int y, int w, int h) {
        View renderView = mControllerManager.findView(mRootId, mId);
        y = renderView != null ? renderView.getTop() : 0;
        super.updateLayout(x, y, w, h);
        mY = y;
    }
}
