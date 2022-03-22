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

import androidx.recyclerview.widget.EasyRecyclerView;
import androidx.recyclerview.widget.RecyclerView.ViewHolder;

public final class StickyViewFactory implements IHeaderViewFactory {

    private final EasyRecyclerView recyclerView;

    public StickyViewFactory(EasyRecyclerView recyclerView) {
        this.recyclerView = recyclerView;
    }

    /**
     * 根据position的位置，获取到一个实体到ViewHolder
     * 1、先在已经上屏的view中，找到一个ViewHolder
     * 2、第一步没有找到，就重新通过recyclerView去获取一个，这种获取的viewHolder可能是cache里面的，也可能
     * 是新创建的，不用再次进行bindViewHolder的操作
     *
     * @param position 指定要获取到ViewHolder到位置
     * @return 返回对应到ViewHolder，不会返回Null
     */
    public ViewHolder getHeaderForPosition(int position) {
        if (position < 0) {
            return null;
        }
        ViewHolder viewHolder = recyclerView.findViewHolderForAdapterPosition(position);
        if (viewHolder == null) {
            viewHolder = recyclerView.getViewHolderForPosition(position);
        }
        return viewHolder;
    }
}