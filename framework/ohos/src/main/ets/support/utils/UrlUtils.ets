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

export class UrlUtils {
  public static PREFIX_BASE64_DATA: string = "data:";
  public static PREFIX_BASE64: string = ";base64,";

  public static isWebUrl(url: string) : boolean {
    const regex = new RegExp('^https?:\/\/.+', 'i');
    return regex.test(url);
  }

  public static isBase64Url(url: string) : boolean {
    return url.length > 0 && url.startsWith(UrlUtils.PREFIX_BASE64_DATA) && url.indexOf(UrlUtils.PREFIX_BASE64) >= 0;
  }
}
