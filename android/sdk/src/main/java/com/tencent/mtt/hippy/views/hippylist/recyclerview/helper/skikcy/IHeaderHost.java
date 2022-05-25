/* Tencent is pleased to support the open source community by making easy-recyclerview-helper available.
 * Copyright (C) 2020 THL A29 Limited, a Tencent company. All rights reserved.
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
package com.tencent.mtt.hippy.views.hippylist.recyclerview.helper.skikcy;

import android.view.View;
import android.view.ViewTreeObserver.OnGlobalLayoutListener;
import android.widget.FrameLayout.LayoutParams;

/**
 * Created by on 2021/1/12.
 * Description
 * HeaderView的宿主，用于HeaderView的挂载，监听挂载的回调
 */
public interface IHeaderHost {

    void attachHeader(View headerView, LayoutParams layoutParams);

    void addOnLayoutListener(OnGlobalLayoutListener listener);

    void removeOnLayoutListener(OnGlobalLayoutListener listener);
}
