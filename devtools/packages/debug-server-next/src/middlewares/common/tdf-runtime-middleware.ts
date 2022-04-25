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

import { TdfEvent } from '@hippy/devtools-protocol/dist/types/enum-tdf-mapping';
import { Logger } from '@debug-server-next/utils/log';
import { updateDebugTarget } from '@debug-server-next/utils/debug-target';
import { MiddleWareManager } from '../middleware-context';

const log = new Logger('tdf-runtime-middleware');

export const tdfRuntimeMiddleWareManager: MiddleWareManager = {
  downwardMiddleWareListMap: {
    [TdfEvent.TDFRuntimeUpdateContextInfo]: async ({ clientId, msg }) => {
      const eventRes = msg as Adapter.CDP.EventRes<ProtocolTdf.TDFRuntime.UpdateContextInfoEvent>;
      const { contextName } = eventRes.params;
      try {
        await updateDebugTarget(clientId, { title: contextName });
      } catch (e) {
        log.error('update DebugTarget contextName fail', (e as any).stack);
      }
      return msg;
    },
  },
  upwardMiddleWareListMap: {},
};
