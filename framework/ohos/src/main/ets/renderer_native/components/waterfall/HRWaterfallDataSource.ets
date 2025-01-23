/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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
import { HippyObservedArray } from '../..';
import HippyRenderBaseView from '../base/HippyRenderBaseView';
import { HRWaterfallItemView } from './HRWaterfallItemView';

export class HRWaterfallDataSource implements IDataSource {
  private listeners: DataChangeListener[] = [];
  private items: HippyObservedArray<HippyRenderBaseView> = []
  private count: number = 0

  headNotFlowItemCount: number = 0
  footNotFlowItemCount: number = 0

  constructor(items: HippyObservedArray<HippyRenderBaseView>) {
    this.items = items
    this.count = items.length
    this.updateItemsAndCount()
  }

  private updateItemsAndCount() {
    // pullHeader and banner
    this.headNotFlowItemCount = 0
    let i = 0
    for (i = 0; i < this.items.length; i++) {
      if (this.items[i] instanceof HRWaterfallItemView) {
        break
      }
      ++this.headNotFlowItemCount
    }

    // pullFooter
    this.footNotFlowItemCount = 0
    for (let j = this.items.length - 1; j >= i; j--) {
      if (this.items[j] instanceof HRWaterfallItemView) {
        break
      }
      ++this.footNotFlowItemCount
    }

    this.count -= this.headNotFlowItemCount
    this.count -= this.footNotFlowItemCount
  }

  public getData(index: number): HippyRenderBaseView {
    // skip pullHeader and banner
    return this.items[this.headNotFlowItemCount + index]
  }

  public totalCount(): number {
    return this.count
  }

  registerDataChangeListener(listener: DataChangeListener): void {
    if (this.listeners.indexOf(listener) < 0) {
      this.listeners.push(listener);
    }
  }

  unregisterDataChangeListener(listener: DataChangeListener): void {
    const pos = this.listeners.indexOf(listener);
    if (pos >= 0) {
      this.listeners.splice(pos, 1);
    }
  }

  notifyReload() {
    this.count = this.items.length
    this.updateItemsAndCount()
    this.listeners.forEach(listener => {
      listener.onDataReloaded();
    })
  }
}
