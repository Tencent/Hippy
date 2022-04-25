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

import { ChromeCommand, ChromeEvent, TdfCommand } from '@hippy/devtools-protocol/dist/types';
import { getDBOperator } from '@debug-server-next/db';
import { createUpwardChannel, createDownwardChannel } from '@debug-server-next/utils/pub-sub-channel';
import { DebugTarget } from '@debug-server-next/@types/debug-target';
import { createCDPPerformance } from '@debug-server-next/utils/aegis';
import { GlobalId } from './global-id';

const reloadCommandId = new GlobalId(-10000, -1);
const reloadCommand = [
  {
    id: reloadCommandId.create(),
    method: ChromeCommand.NetworkEnable,
    params: {
      maxPostDataSize: 65536,
    },
  },
  {
    id: reloadCommandId.create(),
    method: ChromeCommand.NetworkSetAttachDebugStack,
    params: {
      enabled: true,
    },
  },
  {
    id: reloadCommandId.create(),
    method: ChromeCommand.PageEnable,
    params: {},
  },
  {
    id: reloadCommandId.create(),
    method: ChromeCommand.PageGetResourceTree,
    params: {},
  },
  {
    id: reloadCommandId.create(),
    method: ChromeCommand.RuntimeEnable,
    params: {},
  },
  {
    id: reloadCommandId.create(),
    method: ChromeCommand.DOMEnable,
    params: {},
  },
  {
    id: reloadCommandId.create(),
    method: ChromeCommand.CSSEnable,
    params: {},
  },
  {
    id: reloadCommandId.create(),
    method: ChromeCommand.DebuggerEnable,
    params: {
      maxScriptsCacheSize: 10000000,
    },
  },
  {
    id: reloadCommandId.create(),
    method: ChromeCommand.DebuggerSetPauseOnExceptions,
    params: {
      state: 'none',
    },
  },
  {
    id: reloadCommandId.create(),
    method: ChromeCommand.DebuggerSetAsyncCallStackDepth,
    params: {
      state: 'none',
    },
  },
  {
    id: reloadCommandId.create(),
    method: ChromeCommand.ProfilerEnable,
    params: {},
  },
  {
    id: reloadCommandId.create(),
    method: ChromeCommand.LogEnable,
    params: {},
  },
  {
    id: reloadCommandId.create(),
    method: ChromeCommand.LogStartViolationsReport,
    params: {
      config: [
        {
          name: 'longTask',
          threshold: 200,
        },
        {
          name: 'longLayout',
          threshold: 30,
        },
        {
          name: 'blockedEvent',
          threshold: 100,
        },
        {
          name: 'blockedParser',
          threshold: -1,
        },
        {
          name: 'handler',
          threshold: 150,
        },
        {
          name: 'recurringHandler',
          threshold: 50,
        },
        {
          name: 'discouragedAPIUse',
          threshold: -1,
        },
      ],
    },
  },
  {
    id: reloadCommandId.create(),
    method: ChromeCommand.InspectorEnable,
    params: {},
  },
  {
    id: reloadCommandId.create(),
    method: ChromeCommand.TargetSetAutoAttach,
    params: {
      autoAttach: true,
      waitForDebuggerOnStart: true,
      flatten: true,
    },
  },
  {
    id: reloadCommandId.create(),
    method: ChromeCommand.TargetSetDiscoverTargets,
    params: {
      discover: true,
    },
  },
  {
    id: reloadCommandId.create(),
    method: ChromeCommand.RuntimeGetIsolateId,
    params: {},
  },
  {
    id: reloadCommandId.create(),
    method: ChromeCommand.DebuggerSetBlackboxPatterns,
    params: {
      patterns: [],
    },
  },
  {
    id: reloadCommandId.create(),
    method: ChromeCommand.PageStartScreencast,
    params: {
      format: 'jpeg',
      quality: 60,
      maxWidth: 1522,
      maxHeight: 1682,
    },
  },
  {
    id: reloadCommandId.create(),
    method: ChromeCommand.RuntimeRunIfWaitingForDebugger,
    params: {},
  },
  {
    id: reloadCommandId.create(),
    method: ChromeCommand.DOMGetDocument,
    params: {},
  },
];

const reloadEvent = [
  {
    method: ChromeEvent.DOMDocumentUpdated,
    params: {},
  },
];

const mockCmdId = -100000;
export const resumeCommands = [
  {
    id: mockCmdId,
    method: TdfCommand.TDFRuntimeResume,
    params: {},
    performance: createCDPPerformance(),
  },
  {
    id: mockCmdId - 1,
    method: ChromeCommand.DebuggerDisable,
    params: {},
    performance: createCDPPerformance(),
  },
  {
    id: mockCmdId - 2,
    method: ChromeCommand.RuntimeDisable,
    params: {},
    performance: createCDPPerformance(),
  },
];

export const publishReloadCommand = (debugTarget: DebugTarget) => {
  setTimeout(() => {
    const { clientId } = debugTarget;
    const upwardChannelId = createUpwardChannel(clientId);
    const downwardChannelId = createDownwardChannel(clientId);
    const { Publisher } = getDBOperator();
    const publisher = new Publisher(upwardChannelId);
    const downPublisher = new Publisher(downwardChannelId);
    reloadCommand.forEach((command) => {
      publisher.publish(JSON.stringify(command));
    });
    reloadEvent.forEach((event) => {
      downPublisher.publish(JSON.stringify(event));
    });
  }, 2000);
};

export const publishRes = (clientId: string, res: Adapter.CDP.Res) => {
  const downwardChannelId = createDownwardChannel(clientId);
  const { Publisher } = getDBOperator();
  const downPublisher = new Publisher(downwardChannelId);
  downPublisher.publish(JSON.stringify(res));
};
