/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2022 THL A29 Limited, a Tencent company. All rights reserved.
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

package com.tencent.renderer.tdf.embed;

import android.content.Context;
import android.view.View;

import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.renderer.node.RenderNode;
import com.tencent.mtt.hippy.utils.ArgumentUtils;
import com.tencent.renderer.pool.NativeRenderPool;
import com.tencent.tdf.embed.EmbeddedView;
import com.tencent.tdf.embed.EmbeddedViewFactory;

import java.util.Map;

public class TDFEmbeddedViewFactoryImpl extends EmbeddedViewFactory {

    private final String PROPS_KEY = "props";

    private int mRootId;
    private ControllerManager mControllerManager;
    private String mViewType;

    public TDFEmbeddedViewFactoryImpl(int rootId, ControllerManager controllerManager, String viewType) {
        this.mRootId = rootId;
        this.mControllerManager = controllerManager;
        this.mViewType = viewType;
    }

    @Override
    public EmbeddedView create(Context context, int viewId, Map<String, String> propsMap) {
        assert (!mViewType.isEmpty());
        RenderNode node = new RenderNode(mRootId, viewId, mViewType, mControllerManager);
        View view = mControllerManager.createView(node, NativeRenderPool.PoolType.NONE);
        return new TDFEmbeddedViewWrapper(mRootId, mControllerManager, view, viewId, mViewType);
    }

    private Map<String, Object> parsePropsStringToMap(Map<String, String> propsMap) {
        String jsonStr = propsMap.get(PROPS_KEY);
        Map<String, Object> map = ArgumentUtils.parseToMap(jsonStr).getInternalMap();

        for (String key : map.keySet()) {
            Object value = map.get(key);
            if (value != null && value.getClass() == HippyMap.class) {
                map.put(key, ((HippyMap) value).getInternalMap());
            }
        }
        return map;
    }
}
