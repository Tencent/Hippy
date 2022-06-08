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

import android.view.View;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.common.HippyMap;

/**
 * Created  on 2021/4/25.
 * Description
 */
public class RecyclerItemRenderNode extends ListItemRenderNode {

    public RecyclerItemRenderNode(int mId, HippyMap mPropsToUpdate, String className, HippyRootView mRootView,
            ControllerManager componentManager, boolean isLazyLoad) {
        super(mId, mPropsToUpdate, className, mRootView, componentManager, isLazyLoad);
    }

    /**
     * y值是前端传入的，前端没有复用的概念，所有y是整个list长度的y值，并不是recyclerView的排版的y。
     * 真正意义上面的y是排版到屏幕范围以内的y，也是子view相对于recyclerView的起始位置的y，也就是子view的top
     * 系统的recyclerView在刷新list前，layoutManager会调用anchorInfo.assignFromView，取第一个view计算当前的
     * anchorInfo，如果整个地方把y值修改了，导致anchorInfo会取不对.
     * 这里保证updateLayout不要改变已经挂在到RecyclerView的view的top
     */
    @Override
    public void updateLayout(int x, int y, int w, int h) {
        View renderView = mComponentManager.mControllerRegistry.getView(mId);
        y = renderView != null ? renderView.getTop() : 0;
        super.updateLayout(x, y, w, h);
        mY = y;
    }
}
