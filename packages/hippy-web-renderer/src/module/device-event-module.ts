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

import { HippyWebModule } from '../base';

export class DeviceEventModule extends HippyWebModule {
  public name = 'DeviceEventModule';
  private listen=false;
  private moduleListener: Array<() => void>=[];

  public invokeDefaultBackPressHandler() {
    setTimeout(() => {
      this.listen = false;
      back();
    }, 0);
  }

  public init() {
    // !!! exit wx window size change problem
    // addCacheHistoryState();
    // listenHistory(this.handleBack.bind(this));
  }

  public setListenBackPress(listen: boolean) {
    if (this.moduleListener.length > 0 && !listen) {
      return;
    }
    this.listen = listen;
  }

  public setModuleListener(listener: () => void) {
    this.moduleListener.push(listener);
    this.listen = true;
  }

  public removeModuleListener(listener) {
    this.moduleListener = this.moduleListener.filter(item => item !== listener);
  }

  private handleBack() {
    if (!this.listen) {
      return false;
    }
    if (this.moduleListener.length > 0) {
      this.moduleListener.reverse()[0]();
      return true;
    } if (this.listen) {
      this.context.sendEvent('hardwareBackPress', null);
      return true;
    }
    return false;
  }
}
// const WAIT_FLAG = 'wait';
const PUPPET_FLAG = 'puppet';

// function addCacheHistoryState() {
//   if (!(history.state && history.state.target === PUPPET_FLAG)) {
//     window.history.pushState({ target: WAIT_FLAG, random: Math.random() }, '', location.href);
//     window.history.pushState({ target: PUPPET_FLAG, random: Math.random() }, '', location.href);
//   }
// }

function back() {
  const backCount = history?.state?.target === PUPPET_FLAG ? -3 : -2;
  history.go(backCount);
}

// function wait() {
//   window.history.pushState({ target: PUPPET_FLAG, random: Math.random() }, '', location.href);
// }

// function listenHistory(onIntercept: () => boolean) {
//   window.addEventListener('popstate', (e) => {
//     if (!(e.state && e?.state?.target === WAIT_FLAG)) {
//       return;
//     }
//     if (onIntercept()) {
//       wait();
//     } else {
//       back();
//     }
//   }, false);
// }
