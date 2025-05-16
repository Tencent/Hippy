/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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
import { BinaryWriter } from '../../serialization/writer/BinaryWriter';
import { HippyAny } from '../../support/common/HippyTypes';
import { ArgumentUtils } from '../../support/utils/ArgumentUtils';
import { util } from '@kit.ArkTS';
import { Serializer } from '../serialization/Serializer';


export class HippyBridgeUtils {
  public static getSerializerBuffer(params: Map<string, HippyAny>, isV8Serialization: boolean): Uint8Array {
    if (isV8Serialization) {
      return HippyBridgeUtils.getSerializerBufferBinary(params);
    } else {
      return HippyBridgeUtils.getSerializerBufferJson(params);
    }
  }

  public static getSerializerBufferJson(params: Map<string, HippyAny>): Uint8Array {
    let str = JSON.stringify(ArgumentUtils.mapToRecord(params))
    let encoder = new util.TextEncoder("utf-8")
    let uint8Array = encoder.encodeInto(str)
    return uint8Array
  }

  public static getSerializerBufferBinary(params: Map<string, HippyAny>): Uint8Array {
    let binaryWriter = new BinaryWriter()
    let serializer = new Serializer(binaryWriter)
    serializer.writeHeader()
    serializer.writeValue(params)
    let buffer = binaryWriter.chunked()
    return buffer;
  }

}
