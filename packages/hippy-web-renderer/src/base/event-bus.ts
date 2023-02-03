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

export class HippyWebEventBus {
  subscriptions = Object.create(null);

  subscribe(evt: string, func: Function) {
    if (typeof func !== 'function') {
      throw 'Subscribers must be functions';
    }
    const oldSubscriptions = this.subscriptions[evt] || [];
    oldSubscriptions.push(func);
    this.subscriptions[evt] = oldSubscriptions;
  }
  publish(evt: string, ...args) {
    const subFunctions = this.subscriptions[evt] || [];
    for (let i = 0; i < subFunctions.length; i++) {
      subFunctions[i].apply(null, args);
    }
  }
  unsubscribe(evt, func) {
    const oldSubscriptions = this.subscriptions[evt] || [];
    const newSubscriptions = oldSubscriptions.filter(item => item !== func);
    this.subscriptions[evt] = newSubscriptions;
  }
  cancel(evt: string) {
    delete this.subscriptions[evt];
  }
}
