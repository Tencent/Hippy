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
import { LogUtils } from '../../../support/utils/LogUtils';
import HippyRenderBaseView from '../base/HippyRenderBaseView';

export class HRListDataSource implements IDataSource {
  private listeners: DataChangeListener[] = [];
  private items: HippyObservedArray<HippyRenderBaseView> = []
  private count: number = 0

  constructor(items: HippyObservedArray<HippyRenderBaseView>) {
    this.items = items
    this.count = items.length
    LogUtils.d('HRList', `total:${items.length}, count:${this.count}`)
  }

  public getData(index: number): HippyRenderBaseView {
    return this.items[index]
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
    this.listeners.forEach(listener => {
      listener.onDataReloaded();
    })
  }
}
