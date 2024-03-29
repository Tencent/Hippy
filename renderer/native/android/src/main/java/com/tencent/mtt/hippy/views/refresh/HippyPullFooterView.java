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

package com.tencent.mtt.hippy.views.refresh;

import android.content.Context;
import android.view.View;

import androidx.annotation.NonNull;
import com.tencent.mtt.hippy.views.hippylist.HippyRecyclerView;
import com.tencent.mtt.hippy.views.view.HippyViewGroup;

public class HippyPullFooterView extends HippyViewGroup {

    private View mRecyclerView;
    private boolean mStickEnabled = false;

    public HippyPullFooterView(Context context) {
        super(context);
    }

    public void setRecyclerView(@NonNull View recyclerView) {
        mRecyclerView = recyclerView;
    }

    public View getRecyclerView() {
        return mRecyclerView;
    }

    public void setStickEnabled(boolean enabled) {
        mStickEnabled = enabled;
    }

    public boolean getStickEnabled() {
        return mStickEnabled;
    }

    void onDestroy() {
        if (mRecyclerView instanceof HippyRecyclerView
                && ((HippyRecyclerView) mRecyclerView).getAdapter() != null){
            ((HippyRecyclerView) mRecyclerView).getAdapter().onFooterDestroy();
        }
    }
}
