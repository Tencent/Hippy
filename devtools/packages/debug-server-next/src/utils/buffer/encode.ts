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
import { EmitFile, HMRWSData } from './constant';

export const encodeHMRData = (data: HMRWSData) => {
  const { emitList = [], ...emitJSON } = data;
  emitJSON.performance = {
    pcToServer: Date.now(),
  };
  const fileBuffer = encodeEmitFiles(emitList);
  const jsonBuffer = encodeEmitJSON(emitJSON);
  return Buffer.concat([jsonBuffer, fileBuffer]);
};

const encodeEmitFiles = (emitList: EmitFile[] = []) => {
  const fileNumLen = 1;
  const headBuf = Buffer.alloc(fileNumLen);
  headBuf.writeUInt8(emitList.length);

  const fileBuffers = emitList.map(genFileBufferWithLen);
  return Buffer.concat([headBuf, ...fileBuffers]);
};

const encodeEmitJSON = (data: unknown) => {
  const dataStr = JSON.stringify(data);
  const dataBuf = Buffer.from(dataStr);
  return genBufferWithLen(dataBuf);
};

function genFileBufferWithLen({ name, content }: EmitFile): Buffer {
  const nameBuf = Buffer.from(name);
  const len = 1 + nameBuf.length;
  const headBuf = Buffer.alloc(len);
  let offset = 0;
  headBuf.writeUInt8(nameBuf.length, offset);
  offset += 1;
  nameBuf.copy(headBuf, offset, 0);
  const fileBufferWithLen = genBufferWithLen(content);
  return Buffer.concat([headBuf, fileBufferWithLen]);
}

function getLenOfLen(len: number) {
  let lenOfLen = 1;
  if (len > 0xffff) lenOfLen = 4;
  else if (len > 0xff) lenOfLen = 2;
  return lenOfLen;
}

function genBufferWithLen(buf: Buffer): Buffer {
  const len = buf.length;
  const lenOfLen = getLenOfLen(len);
  const headBuf = Buffer.alloc(1 + lenOfLen);
  let offset = 0;
  headBuf.writeUInt8(lenOfLen, offset);
  const fn = {
    1: 'writeUInt8',
    2: 'writeUInt16BE',
    4: 'writeUInt32BE',
  }[lenOfLen];
  headBuf[fn](len, (offset += 1));
  return Buffer.concat([headBuf, buf]);
}
