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
import Url from '@ohos.url';
import { util } from '@kit.ArkTS';
import { TextUtils } from '../../support/utils/TextUtils';
import { LogUtils } from '../../support/utils/LogUtils';

export class DevRemoteServerData {
  private static KEY_DEBUG_URL = "debugUrl";
  private host = ""; // host:port address
  private scheme = ""; // protocol http or https
  private path = "";
  private versionId = "";
  private wsUrl = ""; // ws debug url if remoteDebugUrl with

  constructor(remoteServerUrl: string) {
    this.parseUrl(remoteServerUrl)
  }

  public isValid(): boolean {
    return !TextUtils.isEmpty(this.host) && !TextUtils.isEmpty(this.versionId);
  }

  public getHost(): string {
    return this.host;
  }

  public getVersionId(): string {
    return this.versionId;
  }

  public getPath(): string {
    return this.path;
  }

  public getScheme(): string {
    return this.scheme;
  }

  public getWsUrl(): string {
    return this.wsUrl;
  }

  private parseUrl(remoteServerUrl: string) {
    if (TextUtils.isEmpty(remoteServerUrl)) {
      return;
    }
    let url = Url.URL.parseURL(remoteServerUrl)
    this.scheme = url.protocol;
    this.host = url.hostname;
    this.path = url.pathname;
    let port = url.port;
    if (Number.parseInt(port) > 0) {
      this.host = this.host + ":" + port;
    }
    this.wsUrl = this.parseQueryDebugUrl(url.params);
    if (this.path.startsWith("/")) {
      this.path = this.path.substring(1); // remove first character /
    }
    let index = this.path.indexOf("/");
    if (index >= 0) {
      this.versionId = this.path.substring(0, index);
    } else {
      this.versionId = util.generateRandomUUID();
    }
    LogUtils.i("Hippy DevRemoteServerData", util.format("parseUrl host:%s, versionId:%s", this.host, this.versionId));

  }

  private parseQueryDebugUrl(params: Url.URLParams): string {
    if (params == null) {
      return "";
    }
    let pair: Iterable<Object[]> = params.entries();
    let arrayValue = Array.from(pair);
    if (arrayValue.length > 0) {
      for (let pair of arrayValue) { // Show keyName/valueName pairs
        console.log(pair[0] + ', ' + pair[1]);
        if (DevRemoteServerData.KEY_DEBUG_URL == pair[0]) {
          return JSON.stringify(pair[1])
        }
      }
    }
    return "";
  }
}


