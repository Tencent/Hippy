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

import { BaseModule, ModuleContext } from '../../types';

export class DeviceEventModule implements BaseModule {
  public static moduleName = 'DeviceEventModule'
  private context!: ModuleContext;
  private listen=false;
  public constructor(context: ModuleContext) {
    this.context = context;
  }

  public setListenBackPress(callBackId: number, listen: boolean) {
    this.listen = listen;
  }

  public invokeDefaultBackPressHandler() {
    if (history.state && history.state.target === 'MeanSure') {
      back();
    }
  }

  public initialize() {
    addCacheHistoryState();
    listenHistory(this.handleBack);
  }

  public destroy() {

  }

  private handleBack() {
    return this.listen;
  }
}

function jumpUrl(url) {
  window.history.pushState({ target: 'Final' }, '', location.href);
  location.href = url;
}

function addCacheHistoryState() {
  if (!(history.state && history.state.target === 'Final')) {
    window.history.pushState({ target: 'MeanSure', random: Math.random() }, '', location.href);
    window.history.pushState({ target: 'Final', random: Math.random() }, '', location.href);
  }
}

function back() {
  const backCount = history.state.target === 'Final' ? -3 : -2;
  history.go(backCount);
}

function wait() {
  history.forward();
}

function listenHistory(onIntercept: () => boolean) {
  window.addEventListener('popstate', (e) => {
    if (!(e.state && e.state.target === 'MeanSure') || !onIntercept()) {
      back();
      return;
    }
    wait();
  }, false);
}
