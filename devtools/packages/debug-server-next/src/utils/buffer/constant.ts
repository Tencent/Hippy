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

import { HMREvent } from '@debug-server-next/@types/enum';

export enum HMREventMap {
  Hot = 1,
  LiveReload,
  Invalid,
  Hash,
  Logging,
  Overlay,
  Reconnect,
  Progress,
  Ok,
  Warnings,
  Errors,
  Error,
  Close,
  ProgressUpdate,
  StillOk,
  ContentChanged,
  StaticChanged,
  TransferFile,
}

export type EmitFile = {
  name: string;
  content: Buffer;
};

export type HMRMessage = {
  type: HMREvent;
  data: unknown;
  params: unknown;
};

export type HMRWSData = {
  emitList: EmitFile[];
  messages: HMRMessage[];
  publicPath: string;
  performance?: {
    pcToServer?: number;
    serverReceive?: number;
    serverToApp?: number;
    appReceive?: number;
  };
  hadSyncBundleResource?: boolean;
};
