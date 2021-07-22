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
package com.tencent.mtt.hippy.views.hippylist;

import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.uimanager.ListItemRenderNode;
import com.tencent.mtt.hippy.uimanager.ListViewRenderNode;
import com.tencent.mtt.hippy.uimanager.RenderNode;

/**
 * HippyList一些公用的方法
 */
public class HippyListUtils {

    private HippyListUtils() {

    }

    public static boolean isLinearLayoutVertical(RecyclerView recyclerView) {
        if (isLinearLayout(recyclerView)) {
            return ((LinearLayoutManager) recyclerView.getLayoutManager()).getOrientation()
                    == LinearLayoutManager.VERTICAL;
        }
        return false;
    }

    public static boolean isLinearLayout(RecyclerView recyclerView) {
        return recyclerView.getLayoutManager() instanceof LinearLayoutManager;
    }

    /**
     * 凡是ListItemRenderNode的createView都是在ListView的onCreateView的时候创建
     * 这里将父节点下面的所有ListItemRenderNode设置懒加载，避免listItemView提前在这里创建
     * 否则会导致HippyListView无法createItemView
     */
    public static void setListItemNodeLazy(RenderNode parentNode) {
        for (int i = 0; i < parentNode.getChildCount(); i++) {
            RenderNode childNode = parentNode.getChildAt(i);
            if (childNode instanceof ListItemRenderNode) {
                childNode.setLazy(true);
            } else {
                setListItemNodeLazy(childNode);
            }
        }
    }

    /**
     * 解决mFixedContentIndex不生效的问题，场景是viewPagerItem被摧毁了，再次滑动回来的场景。
     * ViewPagerItem的Node调用了updateViewRecursive，如果下面有HippyListView的节点，HippyListView的节点会触发
     * HippyListView的排版，但是此时的排版不会走bachComplete，导致HippyListView的setListData不会调用
     * 这样就无法实现mFixedContentIndex的生效，所以这里需要补一下setListData
     */
    public static void updateListView(HippyEngineContext hippyContext, RenderNode parentNode) {
        for (int i = 0; i < parentNode.getChildCount(); i++) {
            RenderNode childNode = parentNode.getChildAt(i);
            if (childNode instanceof ListViewRenderNode) {
                hippyContext.getRenderManager().getControllerManager()
                        .onBatchComplete(childNode.getClassName(), childNode.getId());
                break;
            } else {
                updateListView(hippyContext, childNode);
            }
        }
    }
}
