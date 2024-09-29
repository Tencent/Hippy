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
import { HippyCallBack } from '../types';
type NetInfoType = 'NONE' | 'WIFI' | 'CELL' | 'UNKONWN';


export class NetInfoModule extends HippyWebModule {
  public name = 'NetInfo';

  constructor(context) {
    super(context);
    this.handleOnlineChange = this.handleOnlineChange.bind(this);
  }

  public get state() {
    const isConnected = navigator.onLine;
    let networkState: NetInfoType = 'WIFI';
    if (!isConnected) {
      networkState = 'NONE';
    }

    return networkState;
  }

  public getCurrentConnectivity(callBack: HippyCallBack) {
    callBack.resolve({ network_info: this.state });
  }

  public addListener(name: string) {
    if (name === 'networkStatusDidChange') {
      window.addEventListener('online', this.handleOnlineChange);
      window.addEventListener('offline', this.handleOnlineChange);
    }
  }

  public removeListener(name: string) {
    if (name === 'networkStatusDidChange') {
      window.removeEventListener('online', this.handleOnlineChange);
      window.removeEventListener('offline', this.handleOnlineChange);
    }
  }

  public destroy() {
    this.removeListener('change');
  }

  private handleOnlineChange() {
    this.context.sendEvent('networkStatusDidChange', { network_info: this.state });
  }
}
