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
import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.uimanager.ControllerRegistry;
import com.tencent.mtt.hippy.views.view.HippyViewGroupController;

@HippyController(name = "RefreshWrapperItemView")
public class RefreshWrapperItemController extends HippyViewGroupController {
    @Override
    protected View createViewImpl(Context context) {
        return new RefreshWrapperItemView(context);
    }

    @Override
    public void updateLayout(int id, int x, int y, int width, int height, ControllerRegistry componentHolder)
    {
        y = y -height;
        super.updateLayout(id, x, y, width, height, componentHolder);
    }
}
