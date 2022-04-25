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

import fs from 'fs';
import path from 'path';
import { TdfCommand } from '@hippy/devtools-protocol/dist/types/enum-tdf-mapping';
import { config } from '@debug-server-next/config';
import { Logger } from '@debug-server-next/utils/log';
import { MiddleWareManager } from '../middleware-context';

const log = new Logger('tdf-heap-middleware');

/**
 * TODO save heap data to local, doesn't support remote debug
 */
export const tdfHeapMiddleWareManager: MiddleWareManager = {
  downwardMiddleWareListMap: {
    [TdfCommand.TDFMemoryGetHeapMeta]: async ({ msg, sendToDevtools }) => {
      try {
        const commandRes = msg as Adapter.CDP.CommandRes<ProtocolTdf.TDFMemory.GetHeapMetaResponse>;
        const { cachePath } = config;
        const fpath = path.join(cachePath, `${commandRes.id}.json`);
        await fs.promises.writeFile(fpath, JSON.stringify(commandRes));
        return sendToDevtools(commandRes);
      } catch (e) {
        log.error('write heap failed! %s', (e as Error)?.stack);
        return Promise.reject(e);
      }
    },
  },
  upwardMiddleWareListMap: {
    [TdfCommand.TDFMemoryFetchHeapCache]: async ({ msg, sendToDevtools }) => {
      try {
        const req = msg as Adapter.CDP.Req<ProtocolTdf.TDFMemory.FetchHeapCacheRequest>;
        const { cachePath } = config;
        const fpath = path.join(cachePath, `${req.params.id}.json`);
        const cacheMsgStr = await fs.promises.readFile(fpath, 'utf8');
        const cacheMsg: Adapter.CDP.CommandRes = JSON.parse(cacheMsgStr);
        return sendToDevtools({
          id: req.id,
          method: req.method,
          result: cacheMsg.result,
        });
      } catch (e) {
        log.error('write heap failed! %s', (e as Error)?.stack);
        return Promise.reject(e);
      }
    },
  },
};
