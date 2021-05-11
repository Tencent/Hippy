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
package com.tencent.mtt.nxeasy.recyclerview.helper.skikcy;

import androidx.recyclerview.widget.RecyclerView.ViewHolder;
import android.view.View;

public interface IHeaderAttachListener {

    /**
     * header被摘下来，需要对header进行还原或者回收对处理
     *
     * @param aboundHeader HeaderView对应的Holder
     * @param currentHeaderView headerView的实体内容
     */
    void onHeaderDetached(ViewHolder aboundHeader, View currentHeaderView);

}
