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

import { DevicePlatform, AppClientType } from './enum';

export interface DebugTarget {
  // bundle version hash id, only relate to compile machine id and process.cwd()
  hash?: string;
  // unique by bundleName, should keep immutable when reload
  clientId: string;
  iWDPWsUrl?: string;
  devtoolsFrontendUrl: string;
  faviconUrl?: string;
  thumbnailUrl: string;
  title: string;
  url: string;
  description: string;
  webSocketDebuggerUrl: string;
  platform: DevicePlatform;
  appClientTypeList: AppClientType[];
  type: string;
  ts: number;
  deviceName: string;
  deviceId?: string;
  deviceOSVersion?: string;
  // DebugTarget reference num, every time create with same clientId will increase
  // every time clean will decrease, and will remove this record when ref === 0
  // To be compatible with iOS reload scene, the new ws will firstly connect, then the old will close
  // so we could keep the old DebugTarget.
  ref: number;
}
