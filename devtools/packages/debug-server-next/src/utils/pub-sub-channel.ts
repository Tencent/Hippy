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

const downwardSpliter = '_down_';
const upwardSpliter = '_up_';
const internalSpliter = '_internal_';
const defaultExtensionName = 'default';

export const createDownwardChannel = (clientId: string, extensionName?: string) =>
  createChannel(clientId, extensionName, downwardSpliter);

export const createUpwardChannel = (clientId: string, extensionName?: string) =>
  createChannel(clientId, extensionName, upwardSpliter);

export const createInternalChannel = (clientId: string, extensionName?: string) =>
  createChannel(clientId, extensionName, internalSpliter);

export const upwardChannelToDownwardChannel = (upwardChannelId: string) =>
  upwardChannelId.replace(upwardSpliter, downwardSpliter);

export const createHMRChannel = (hash: string) => `HMR-${hash}`;

export const createVueDevtoolsChannel = (clientId: string) => createChannel(clientId, 'vue-devtools', '_');

const createChannel = (clientId: string, extensionName?: string, spliter?: string) =>
  `${clientId}${spliter}${extensionName || defaultExtensionName}`;
