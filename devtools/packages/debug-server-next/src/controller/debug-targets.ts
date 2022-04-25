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

import { config } from '@debug-server-next/config';
import { getIWDPPages, patchIOSTarget } from '@debug-server-next/utils/iwdp';
import { createTargetByIWDPPage } from '@debug-server-next/utils/debug-target';
import { getDBOperator } from '@debug-server-next/db';
import { DebugTarget } from '@debug-server-next/@types/debug-target';
import { DevicePlatform } from '@debug-server-next/@types/enum';
import { updateIWDPAppClient, subscribeByIWDP } from './pub-sub-manager';

export class DebugTargetManager {
  public static debugTargets: DebugTarget[] = [];

  /**
   * find all debugTargets
   *
   * @static
   * @param {string} hash to filter list
   * @param {boolean} [ignoreHash=false] only use in server side, for vue-devtools find current debug ContextName
   * @memberof DebugTargetManager
   */
  public static getDebugTargets = async (hash: string, ignoreHash = false): Promise<DebugTarget[]> => {
    const { iWDPPort } = global.debugAppArgv;
    const { DB } = getDBOperator();
    const db = new DB(config.redis.debugTargetTable);
    let getDebugTargetPromise;
    if (config.isCluster && !ignoreHash) {
      getDebugTargetPromise = hash ? db.find('hash', hash) : Promise.resolve([]);
    } else {
      getDebugTargetPromise = db.getAll();
    }

    const [targets, iOSPages] = await Promise.all([getDebugTargetPromise, getIWDPPages(iWDPPort)]);
    targets.forEach((target, i) => {
      if (target.platform === DevicePlatform.IOS) {
        targets[i] = patchIOSTarget(target, iOSPages);
        updateIWDPAppClient(targets[i]);
      }
    });
    // append H5 pages from IWDP
    const iOSPagesWithFlag = iOSPages as Array<IWDPPage & { shouldRemove?: boolean }>;
    const h5Pages = iOSPagesWithFlag.filter(
      // (iOSPage) => !iOSPage.shouldRemove && iOSPage.device.deviceName !== SIMULATOR_DEVICE_NAME,
      (iOSPage) => !iOSPage.shouldRemove && !iOSPage.title.startsWith('HippyContext: '),
    );
    const h5DebugTargets = h5Pages.map(createTargetByIWDPPage);
    subscribeByIWDP(h5DebugTargets);
    DebugTargetManager.debugTargets = targets.concat(h5DebugTargets);
    return DebugTargetManager.debugTargets;
  };

  /**
   * find debugTarget by clientId
   *
   * @static
   * @param {string} clientId
   * @param {string} hash auth control
   * @param {boolean} [ignoreHash=false] only use in server side, for vue-devtools find current debug ContextName
   * @return {*}
   * @memberof DebugTargetManager
   */
  public static async findDebugTarget(clientId: string, hash: string, ignoreHash = false) {
    const debugTargets = await DebugTargetManager.getDebugTargets(hash, ignoreHash);
    return debugTargets.find((target) => target.clientId === clientId);
  }
}
