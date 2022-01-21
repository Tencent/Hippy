/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  EVENT_CHILD_NODE_WILL_REMOVE,
  EVENT_NODE_WILL_REMOVE,
  NODE_ID,
} from '../node-def';

export function UIManagerModuleDeleteNode(_rootViewId: string, data: Array<any>) {
  if (!data || data.length < 1) {
    return;
  }
  for (let i = 1; i < data.length; i++) {
    const deleteItemList = data[i];
    processDeleteElements(deleteItemList);
  }
}
function processDeleteElements(elementList: Array<any>) {
  for (let i = 0; i < elementList.length; i++) {
    const deleteItem = elementList[i];
    deleteElementById(deleteItem[NODE_ID]);
  }
}
async function deleteElementById(id: number) {
  const deleteNode = window.document.getElementById(String(id));
  if (deleteNode) {
    await deleteNode[EVENT_NODE_WILL_REMOVE]?.();
    if (deleteNode.parentNode) {
      await deleteNode.parentNode[EVENT_CHILD_NODE_WILL_REMOVE]?.();
      deleteNode.parentNode.removeChild(deleteNode);
    }
  }
}
