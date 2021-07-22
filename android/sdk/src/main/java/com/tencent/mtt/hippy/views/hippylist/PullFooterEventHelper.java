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

import android.view.View;
import com.tencent.mtt.hippy.uimanager.HippyViewEvent;
import com.tencent.mtt.nxeasy.recyclerview.helper.footer.FooterExposureHelper;
import com.tencent.mtt.nxeasy.recyclerview.helper.footer.IFooterLoadMoreListener;

/**
 * Created  on 2021/1/7.
 * Description
 * 监控footerView的显示状态，并通知前端onEndReached的事件
 */
class PullFooterEventHelper implements IFooterLoadMoreListener {

    public static final String EVENT_ON_END_REACHED = "onLoadMore";
    private final HippyRecyclerView recyclerView;
    private FooterExposureHelper footerExposureHelper;
    private HippyViewEvent onEndReachedEvent;

    PullFooterEventHelper(HippyRecyclerView recyclerView) {
        this.recyclerView = recyclerView;
    }

    public void enableFooter(View itemView) {
        disableFooter();
        footerExposureHelper = new FooterExposureHelper();
        footerExposureHelper.setFooterListener(this);
        footerExposureHelper.setExposureView(itemView);
        recyclerView.addOnScrollListener(footerExposureHelper);
    }

    public void disableFooter() {
        if (footerExposureHelper != null) {
            recyclerView.removeOnScrollListener(footerExposureHelper);
            footerExposureHelper = null;
        }
    }

    protected HippyViewEvent getOnEndReachedEvent() {
        if (onEndReachedEvent == null) {
            onEndReachedEvent = new HippyViewEvent(EVENT_ON_END_REACHED);
        }
        return onEndReachedEvent;
    }

    @Override
    public void onFooterLoadMore() {
        getOnEndReachedEvent().send((View) recyclerView.getParent(), null);
    }
}
