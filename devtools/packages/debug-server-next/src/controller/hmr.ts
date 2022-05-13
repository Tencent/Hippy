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
import WebSocket from 'ws';
import {
  WinstonColor,
  WSCode,
  StaticFileStorage,
  ReportEvent,
  HMRReportExt2,
  HMRSyncType,
} from '@debug-server-next/@types/enum';
import { HMRWsParams, getBaseFolderOfPublicPath } from '@debug-server-next/utils/url';
import { Logger } from '@debug-server-next/utils/log';
import { createHMRChannel } from '@debug-server-next/utils/pub-sub-channel';
import { getDBOperator } from '@debug-server-next/db';
import { config } from '@debug-server-next/config';
import { decodeHMRData } from '@debug-server-next/utils/buffer';
import { cosUpload, deleteObjects } from '@debug-server-next/utils/cos';
import { aegis } from '@debug-server-next/utils/aegis';

const log = new Logger('hmr-controller', WinstonColor.Blue);
const hmrCloseEvent = 'HMR_SERVER_CLOSED';

/**
 * Pub/Sub HMR msg to client side
 */
export const onHMRClientConnection = async (ws: WebSocket, wsUrlParams: HMRWsParams) => {
  const { hash } = wsUrlParams;
  log.verbose('HMR client connected, hash: %s', hash);
  const { Subscriber, DB } = getDBOperator();
  const bundle = await new DB(config.redis.bundleTable).get(hash);
  if (!bundle) {
    const reason = 'Hippy dev server not started, not support HMR!';
    ws.close(WSCode.InvalidRequestParams, reason);
    return log.warn(reason);
  }
  aegis.reportEvent({
    name: ReportEvent.RemoteHMR,
    ext1: hash,
    ext2: HMRReportExt2.Client,
  });

  const subscriber = new Subscriber(createHMRChannel(hash));
  const hmrHandler = (msg) => {
    if (msg === hmrCloseEvent) {
      subscriber.unsubscribe(hmrHandler);
      subscriber.disconnect();
      const reason = 'Hippy dev server closed, stop HMR!';
      ws.close(WSCode.HMRServerClosed, reason);
      log.warn(reason);
    } else {
      log.verbose('receive HMR msg from redis: %s', msg);
      const msgObj = JSON.parse(msg.toString());
      if (msgObj.performance) {
        msgObj.performance.serverToApp = Date.now();
      }
      ws.send(JSON.stringify(msgObj));
    }
  };
  subscriber.subscribe(hmrHandler);

  ws.on('close', (code, reason) => {
    log.warn('HMR client ws closed, code: %s, reason: %s', code, reason);
    subscriber.unsubscribe(hmrHandler);
    subscriber.disconnect();
  });
  ws.on('error', (e) => log.error('HMR client ws error: %s', e.stack || e));
};

/**
 * Pub/Sub HMR msg to server side
 */
export const onHMRServerConnection = (ws: WebSocket, wsUrlParams: HMRWsParams) => {
  const { hash } = wsUrlParams;
  log.verbose('HMR server connected, hash: %s', hash);
  const { Publisher, DB } = getDBOperator();
  const model = new DB(config.redis.bundleTable);
  model.upsert(hash, { hash });
  const publisher = new Publisher(createHMRChannel(hash));
  aegis.reportEvent({
    name: ReportEvent.RemoteHMR,
    ext1: hash,
    ext2: HMRReportExt2.Server,
  });
  // store all synced dist file, and clean when HMR server disconnect
  const distFiles: Set<string> = new Set();

  ws.on('message', async (msg: Buffer) => {
    try {
      const serverReceive = Date.now();
      const { emitList, publicPath, ...emitJSON } = decodeHMRData(msg);
      if (emitJSON.performance) {
        const { hadSyncBundleResource } = emitJSON;
        const { pcToServer } = emitJSON.performance;
        const hmrSize = `${Math.ceil(msg.length / 1024)}KB`;
        const reportData = {
          name: ReportEvent.HMRPCToServer,
          duration: serverReceive - pcToServer,
          ext1: hmrSize,
          ext2: '',
        };
        if ('hadSyncBundleResource' in emitJSON)
          reportData.ext2 = hadSyncBundleResource ? HMRSyncType.Patch : HMRSyncType.FirstTime;
        aegis.reportTime(reportData);
      }

      const folder = getBaseFolderOfPublicPath(publicPath);
      emitList.forEach((file) => {
        distFiles.add(path.join(folder, file.name));
      });
      if (emitList?.length) {
        await saveHMRFiles(folder, emitList);
      }

      const msgStr = JSON.stringify(emitJSON);
      log.verbose('receive HMR msg from PC: %s', msgStr);
      setTimeout(() => {
        if (emitJSON.messages?.length) publisher.publish(msgStr);
      }, 1000);
    } catch (e) {
      log.error('decodeHMRData failed: ', (e as any)?.stack || e);
    }
  });

  ws.on('close', async (code, reason) => {
    log.warn('HMR server ws closed, code: %s, reason: %s', code, reason);
    publisher.publish(hmrCloseEvent);
    process.nextTick(() => {
      publisher.disconnect();
    });
    model.delete(hash);
    cleanHMRFiles(Array.from(distFiles));
  });
  ws.on('error', (e) => log.error('HMR server ws error: %s', e.stack || e));
};

type TransFerFile = {
  // include folder structure
  name: string;
  content: Buffer;
};

async function saveHMRFiles(folder: string, emitList: TransFerFile[]) {
  return Promise.all(
    emitList.map(async ({ name, content }) => {
      const saveFn = {
        [StaticFileStorage.COS]: saveHMRFileToCOS,
        [StaticFileStorage.Local]: saveHMRFileToLocal,
      }[config.staticFileStorage];
      return saveFn(folder, name, content);
    }),
  );
}

async function saveHMRFileToLocal(folder: string, name: string, content: Buffer) {
  const fullFname = path.resolve(config.hmrStaticPath, folder, name);
  const cacheFolder = path.dirname(fullFname);
  await fs.promises.mkdir(cacheFolder, { recursive: true });
  return fs.promises.writeFile(fullFname, content);
}

async function saveHMRFileToCOS(folder: string, name: string, content: Buffer) {
  const key = path.join(folder, name);
  return cosUpload(key, content);
}

async function cleanHMRFiles(files: string[]) {
  try {
    if (files.length === 0) return;
    log.warn('clean cached static resources! \n %j', files);
    if (config.staticFileStorage === StaticFileStorage.COS) {
      await deleteObjects(files);
    } else {
      await Promise.all(
        files.map((file) => {
          const fullFname = path.join(config.hmrStaticPath, file);
          return fs.promises.rm(fullFname, { force: true, recursive: true });
        }),
      );
    }
  } catch (e) {
    log.error('clean cached static resources failed! %j', (e as Error).stack || e);
  }
}
