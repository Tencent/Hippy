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
import util from '@ohos.util';

export class TextUtils {
  private static sIsoDecoder: util.TextDecoder | null = null
  private static sUtf16Decoder: util.TextDecoder | null = null
  private static sUtf8Decoder: util.TextDecoder | null = null

  static getIsoDecoder(): util.TextDecoder {
    if (!TextUtils.sIsoDecoder) {
      TextUtils.sIsoDecoder = util.TextDecoder.create("iso-8859-1")
    }
    return TextUtils.sIsoDecoder
  }

  static getUtf16Decoder(): util.TextDecoder {
    if (!TextUtils.sUtf16Decoder) {
      TextUtils.sUtf16Decoder = util.TextDecoder.create("utf-16le")
    }
    return TextUtils.sUtf16Decoder
  }

  static getUtf8Decoder(): util.TextDecoder {
    if (!TextUtils.sUtf8Decoder) {
      TextUtils.sUtf8Decoder = util.TextDecoder.create("utf-8")
    }
    return TextUtils.sUtf8Decoder
  }

  static isEmpty(value: string | null | undefined) {
    if (value === undefined || value == "" || value?.length == 0)
      return true;
    return false;
  }

  static equals(source: string, value: string | null | undefined) {
    if (value === source)
      return true;
    return false;
  }
}
