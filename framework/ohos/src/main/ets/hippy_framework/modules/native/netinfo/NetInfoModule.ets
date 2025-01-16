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

import { HippyNativeModule } from '../../../../support/annotation/HippyNativeModule'
import { HippyEngineContext } from '../../../HippyEngineContext'
import { HippyNativeModuleBase } from '../HippyNativeModuleBase'
import { connection } from '@kit.NetworkKit'
import { LogUtils } from '../../../../support/utils/LogUtils'
import { HippyAny } from '../../../../support/common/HippyTypes'
import { HippyModulePromise } from '../../HippyModulePromise'

const NETINFO_MODULE_TAG = "NetInfoModule"

@HippyNativeModule({ name: "NetInfo" })
export class NetInfoModule extends HippyNativeModuleBase {
  public static readonly NAME = 'NetInfo'
  private static CONNECTION_TYPE_NONE = "NONE";
  private static CONNECTION_TYPE_UNKNOWN = "UNKNOWN";
  private netConnection: connection.NetConnection
  private mNoNetworkPermission = false;

  constructor(ctx: HippyEngineContext) {
    super(ctx)
    this.netConnection = connection.createNetConnection()
  }

  public getCurrentConnectionType(): string {
    try {
      let netHandle = connection.getDefaultNetSync();
      let netCapabilities = connection.getNetCapabilitiesSync(netHandle);
      LogUtils.i(NETINFO_MODULE_TAG, "currentConnectionType: " + netCapabilities.bearerTypes);
      if (netCapabilities == null || netCapabilities.bearerTypes == null) {
        return NetInfoModule.CONNECTION_TYPE_NONE
      } else {
        return this.getBareTypeValue(netCapabilities.bearerTypes[0])
      }
    } catch (e) {
      LogUtils.d(NETINFO_MODULE_TAG, "currentConnectionType error: " + e.message);
      return NetInfoModule.CONNECTION_TYPE_UNKNOWN;
    }
  }

  public destroy() {
    this.unregisterConnect();
  }

  public handleAddListener(name: string) {
    this.registerReceiver();
  }

  public handleRemoveListener(name: string) {
    this.unregisterReceiver();
  }

  public call(method: string, params: Array<HippyAny>, callback: HippyModulePromise): HippyAny {
    switch (method) {
      case 'getCurrentConnectivity': {
        this.getCurrentConnectivity(callback)
        break;
      }
      case 'addListener': {
        this.handleAddListener(params[0] as string)
        break;
      }
      case 'removeListener': {
        this.handleRemoveListener(params[0] as string)
        break;
      }
      default:
        super.call(method, params, callback)
    }
    return null;
  }

  private getBareTypeValue(num: number): string {
    if (num == 0) {
      return 'BEARER_CELLULAR';
    } else if (num == 1) {
      return 'BEARER_WIFI';
    } else if (num == 3) {
      return 'BEARER_ETHERNET';
    } else {
      return NetInfoModule.CONNECTION_TYPE_UNKNOWN;
    }
  }

  private getCurrentConnectivity(promise: HippyModulePromise) {
    if (this.mNoNetworkPermission) {
      let map = new Map<string, string>();
      map.set("network_info", "no netWork permission");
      promise.resolve(map);
      return
    }
    let type = this.getCurrentConnectionType()
    let map = new Map<string, string>();
    map.set("network_info", type);
    promise.resolve(map);
  }

  private unregisterConnect() {
    // 使用unregister接口取消订阅
    try {
      this.netConnection.unregister((error) => {
        LogUtils.e(NETINFO_MODULE_TAG, "unregisterConnect: " + JSON.stringify(error))
      })
    } catch (e) {
      LogUtils.d("NetInfoModule", "unregisterConnect: " + e.getMessage());
    }
  }

  private registerReceiver() {
    try {
      this.netConnection.register((error) => {
        LogUtils.d(NETINFO_MODULE_TAG, "registerReceiver: " + JSON.stringify(error))
      })
    } catch (e) {
      LogUtils.e("NetInfoModule", "registerReceiver: " + e.getMessage());
    }
  }

  private unregisterReceiver() {
    try {
      this.netConnection.unregister((error) => {
        LogUtils.e(NETINFO_MODULE_TAG, "unregisterReceiver: " + JSON.stringify(error))
      })
    } catch (e) {
      LogUtils.d("NetInfoModule", "unregisterReceiver: " + e.getMessage());
    }
  }
}
