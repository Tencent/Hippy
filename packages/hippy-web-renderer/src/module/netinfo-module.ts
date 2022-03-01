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
import { HippyWebModule } from '../../base';
import { BaseModule, ModuleContext } from '../../types';
import { dispatchModuleEventToHippy } from '../common';
type NetInfoType = 'NONE' | 'WIFI' | 'CELL' | 'UNKONWN';
type ConnectionType =
  | 'bluetooth'
  | 'cellular'
  | 'ethernet'
  | 'mixed'
  | 'none'
  | 'other'
  | 'unknown'
  | 'wifi'
  | 'wimax';

export class NetInfoModule extends HippyWebModule {

  public get connection() {
    return  window.navigator?.connection;
  }

  public get state() {
    const isConnected = navigator.onLine;
    let networkState: NetInfoType = 'UNKONWN';
    if (!this.connection && !isConnected) {
      networkState = 'NONE';
    }
    if (this.connection) {
      const networkWifi: ConnectionType = 'wifi';
      const networkCell: ConnectionType = 'cellular';
      if (this.connection.type === networkWifi) {
        networkState = 'WIFI';
      }
      if (this.connection.type === networkCell) {
        networkState = 'CELL';
      }
    }
    return networkState;
  }

  public addListener(name: string) {
    if (name === 'change') {
      window.addEventListener('online', this.handleOnlineChange);
      window.addEventListener('offline', this.handleOnlineChange);
    }
  }

  public removeListener(name: string) {
    if (name === 'change') {
      window.removeEventListener('online', this.handleOnlineChange);
      window.removeEventListener('offline', this.handleOnlineChange);
    }
  }


  public initialize() {

  }

  public destroy() {
    this.removeListener('change');
  }

  private handleOnlineChange() {
    dispatchModuleEventToHippy(['networkStatusDidChange', { network_info: this.state }]);
  }
}
