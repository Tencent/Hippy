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

import android.view.View;

import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.renderer.node.RenderNode;
import com.tencent.tdf.embed.EmbeddedView;

import java.util.Map;

public class TDFEmbeddedViewWrapper implements EmbeddedView {

    private View mView;
    private int mViewID;
    private ControllerManager mControllerManager;
    private RenderNode mRenderNode;

    public TDFEmbeddedViewWrapper(int rootId, ControllerManager controllerManager, View view, int viewID, String viewType) {
        this.mView = view;
        this.mControllerManager = controllerManager;
        this.mViewID = viewID;
        mRenderNode = new RenderNode(rootId, viewID, viewType, mControllerManager);
    }

    @Override
    public View getView() {
        return mView;
    }

    @Override
    public void dispose() {
    }

    @Override
    public void updateProps(Map<String, String> propsMap) {
        EmbeddedView.super.updateProps(propsMap);
        mControllerManager.updateProps(mRenderNode, TDFEmbeddedViewUtil.parsePropsStringToMap(propsMap),
            null, null, true);
    }
}
