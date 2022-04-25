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

import { DevicePlatform, DebugTunnel } from '@debug-server-next/@types/enum';
import { customDomains } from '@debug-server-next/@types/constants';
import { appClientManager } from './app-client-manager';
import { IWDPAppClient } from './iwdp-app-client';
import { TunnelAppClient } from './tunnel-app-client';
import { WSAppClient } from './ws-app-client';

export const initAppClient = () => {
  const { tunnel } = global.debugAppArgv;
  const DefaultCtor = tunnel === DebugTunnel.WS ? WSAppClient : TunnelAppClient;
  appClientManager.addAndroidAppClientOption({
    useAllDomain: true,
    Ctor: DefaultCtor,
    platform: DevicePlatform.Android,
  });
  appClientManager.addIOSAppClientOption({
    useAllDomain: false,
    acceptDomains: customDomains,
    Ctor: DefaultCtor,
    platform: DevicePlatform.IOS,
  });
  appClientManager.addIOSAppClientOption({
    useAllDomain: false,
    ignoreDomains: customDomains,
    Ctor: IWDPAppClient,
    platform: DevicePlatform.IOS,
  });
};
