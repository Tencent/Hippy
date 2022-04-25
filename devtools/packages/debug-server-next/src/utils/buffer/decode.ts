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

import { Buffer } from 'buffer';
import { WinstonColor } from '@debug-server-next/@types/enum';
import { Logger } from '@debug-server-next/utils/log';
import { EmitFile, HMRWSData } from './constant';

const logger = new Logger('buffer-decoder', WinstonColor.White);

export const decodeHMRData = (buf: Buffer): HMRWSData => {
  const { offset, emitJSON } = decodeEmitJSON(0, buf);
  const emitList = decodeEmitFiles(offset, buf);
  return {
    ...emitJSON,
    emitList,
  };
};

const decodeEmitFiles = (offset: number, buf: Buffer): EmitFile[] => {
  const fileNum = buf.readUInt8(offset);
  offset += 1;
  const emitList = [];
  for (let i = 0; i < fileNum; i++) {
    const fnameLen = buf.readUInt8(offset);
    offset += 1;
    const name = buf.toString('utf8', offset, (offset += fnameLen));
    const lenOfLen = buf.readUInt8(offset);
    offset += 1;
    const fn = {
      1: 'readUInt8',
      2: 'readUInt16BE',
      4: 'readUInt32BE',
    }[lenOfLen];
    const fileLen = buf[fn](offset);
    offset += lenOfLen;
    const content = buf.slice(offset, (offset += fileLen));
    emitList.push({ name, content });
  }
  return emitList;
};

const decodeEmitJSON = (
  offset = 0,
  buf: Buffer,
): {
  offset: number;
  emitJSON: Omit<HMRWSData, 'emitList'>;
} => {
  const lenOfLen = buf.readUInt8(offset);
  offset += 1;
  const fn = {
    1: 'readUInt8',
    2: 'readUInt16BE',
    4: 'readUInt32BE',
  }[lenOfLen];
  const jsonLen = buf[fn](offset);
  offset += lenOfLen;
  const str = buf.toString('utf8', offset, offset + jsonLen);
  offset += jsonLen;
  try {
    const emitJSON = JSON.parse(str);
    return { emitJSON, offset };
  } catch (e) {
    logger.error('decodeEmitJSON error: %j', (e as any).stack || e);
    throw e;
  }
};
