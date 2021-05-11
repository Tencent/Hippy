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

public class NodePositionHelper {

    private int nodeOffset = 0;

    public NodePositionHelper() {

    }

    /**
     * 如果前面加了NativeHeader，nodeOffset就加1
     */
    public void increaseOffset() {
        this.nodeOffset++;
    }

    /**
     * @return 当前render节点的偏移
     */
    public int getNodeOffset() {
        return nodeOffset;
    }

    /**
     * @param adapterPosition 是节点在adapter的位置，adapter上面可能不都是renderNode
     * @return 返回adapterPosition对应前端的列表的node节点位置，减去前面的NativeHeader的位置
     */
    public int getRenderNodePosition(int adapterPosition) {
        return adapterPosition - nodeOffset;
    }

    /**
     * 如果去掉nativeHeader，就减1
     */
    public void decreaseOffset() {
        nodeOffset--;
    }
}
