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
import { BinaryReader } from '../../serialization/reader/BinaryReader';
import { HippyException } from '../../support/common/HippyException';
import { HippyAny } from '../../support/common/HippyTypes';
import { TextUtils } from '../../support/utils/TextUtils';
import { Deserializer } from '../serialization/Deserializer';


export class HippyModuleUtils {
  public static bytesToArgument(buffer: ArrayBuffer, isV8Serialization: boolean): Array<HippyAny> {
    let result = new Array<HippyAny>();
    if (buffer) {
      try {
        if (isV8Serialization) {
          result = HippyModuleUtils.parseV8SerializeData(buffer);
        } else {
          result = HippyModuleUtils.parseJsonData(buffer);
        }
      } catch (e) {
        throw new HippyException("parse bytesToArgument error");
      }
    }
    return result;
  }

  public static parseV8SerializeData(buffer: ArrayBuffer): Array<HippyAny> {
    const bytes = new Uint8Array(buffer);
    const reader = new BinaryReader(bytes);
    const serializer = new Deserializer(reader, null);
    serializer.reset();
    serializer.readHeader();
    return serializer.readValue() as Array<HippyAny>;
  }

  public static parseJsonData(buffer: ArrayBuffer): Array<HippyAny> {
    const bytes = new Uint8Array(buffer);
    const textDecoder = TextUtils.getUtf8Decoder()
    const str = textDecoder.decodeWithStream(bytes)
    if (!str) {
      return new Array<HippyAny>()
    }
    const paramArray = JSON.parse(str) as Array<HippyAny>;
    return HippyModuleUtils.convertObjectToMap(paramArray as HippyAny) as Array<HippyAny>
  }

  private static convertObjectToMap(value: HippyAny): HippyAny {
    if(value instanceof Array) {
      return (value as Array<HippyAny>).map(item => HippyModuleUtils.convertObjectToMap(item))
    } else if (value instanceof Map) {
      let map = value as Map<string, HippyAny>
      let map2 = new Map<string, HippyAny>()
      map.forEach((v: HippyAny, k: string) => {
        map2.set(k, HippyModuleUtils.convertObjectToMap(v))
      })
      return map2
    } else if (typeof value === 'object' && value !== null) {
      let map: Map<string, HippyAny> = new Map(Object.entries(value))
      let map2 = new Map<string, HippyAny>()
      map.forEach((v: HippyAny, k: string) => {
        map2.set(k, HippyModuleUtils.convertObjectToMap(v))
      })
      return map2
    }
    return value
  }

}
