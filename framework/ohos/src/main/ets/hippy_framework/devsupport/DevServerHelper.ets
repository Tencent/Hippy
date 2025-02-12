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
import { HippyGlobalConfigs } from '../../hippy_framework/HippyGlobalConfigs';
import { DevRemoteServerData } from './DevRemoteServerData';
import util from '@ohos.util';
import { TextUtils } from '../../support/utils/TextUtils';

export class DevServerHelper {
  private static BUNDLE_URL_FORMAT = "%s://%s/%s?platform=android&dev=%s&hot=%s&minify=%s";
  private static WEBSOCKET_LIVERELOAD_URL_FORMAT = "ws://%s/debugger-live-reload";
  private static DEBUG_URL_PREFIX = "ws://%s/debugger-proxy";
  private static DEBUG_URL_APPEND = "role=android_client&clientId=%s&hash=%s&contextName=%s";
  private static DEFAULT_BUNDLE_SCHEME = "http";
  mRemoteServerData: DevRemoteServerData
  private mGlobalConfigs: HippyGlobalConfigs
  private mServerHost: string = ""

  constructor(configs: HippyGlobalConfigs, serverHost: string, remoteServerUrl: string) {
    this.mGlobalConfigs = configs;
    this.mServerHost = serverHost;
    this.mRemoteServerData = new DevRemoteServerData(remoteServerUrl);
  }

  public createBundleURL(host: string, bundleName: string, devMode: boolean, hmr: boolean,
                         jsMinify: boolean): string {
    if (this.mRemoteServerData.isValid()) {
      // remote debugging in non usb
      return util.format(DevServerHelper.BUNDLE_URL_FORMAT, this.mRemoteServerData.getScheme(), this.mRemoteServerData.getHost(), this.mRemoteServerData.getPath(),
        devMode+'', hmr+'', jsMinify+'');
    }
    return util.format(DevServerHelper.BUNDLE_URL_FORMAT, DevServerHelper.DEFAULT_BUNDLE_SCHEME, host, bundleName, devMode+'', hmr+'', jsMinify+'');
  }

  public createDebugURL(host: string, componentName: string, clientId: string) {
    let debugUrl = DevServerHelper.DEBUG_URL_PREFIX + "?" + DevServerHelper.DEBUG_URL_APPEND;
    if (this.mRemoteServerData.isValid()) {
      // remote debugging in non usb
      if (!TextUtils.isEmpty(this.mRemoteServerData.getWsUrl())) {
        // use the remoteServer ws url first
        debugUrl = this.mRemoteServerData.getWsUrl() + (this.mRemoteServerData.getWsUrl()
          .includes("?") ? "&" : "?") + DevServerHelper.DEBUG_URL_APPEND;
        return util.format(debugUrl, clientId, this.mRemoteServerData.getVersionId(), componentName);
      }
      return util.format(debugUrl, this.mRemoteServerData.getHost(), clientId,
        this.mRemoteServerData.getVersionId(), componentName);
    }
    return util.format(debugUrl, host, clientId, "", componentName);
  }

  public getLiveReloadURL(): string {
    let host = this.mServerHost.split(":");
    let newHost = host[0] + ":38999";
    return util.format(DevServerHelper.WEBSOCKET_LIVERELOAD_URL_FORMAT, newHost);
  }
}
