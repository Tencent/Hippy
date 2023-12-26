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
import { DevServerCallBack } from './DevServerCallBack';
import { DevServerImpl } from './DevServerImpl';
import { DevServerInterface } from './DevServerInterface';
import { util } from '@kit.ArkTS';
import { HippyJsException } from '../../hippy_framework/common/HippyJsException';

export class DevSupportManager {
  public mDevImp: DevServerInterface
  public mSupportDev: boolean
  private mInstanceUUID = util.generateRandomUUID()

  constructor(configs: HippyGlobalConfigs, debugMode: boolean, serverHost: string,
              bundleName: string, remoteServerUrl: string) {
    this.mDevImp = new DevServerImpl(configs, serverHost, bundleName, remoteServerUrl, debugMode);
    this.mSupportDev = debugMode
  }

  public getDevImp(): DevServerInterface {
    return this.mDevImp;
  }

  public setDevCallback(devCallback: DevServerCallBack) {
    this.mDevImp.setDevServerCallback(devCallback);
  }

  public attachToHost(context: Context, rootId: number) {
    this.mDevImp.attachToHost(context, rootId);
  }

  public detachFromHost(context: Context, rootId: number) {
    this.mDevImp.detachFromHost(context, rootId);
  }

  public createResourceUrl(resName: string): string {
    return this.mDevImp.createResourceUrl(resName);
  }

  public createDebugUrl(host: string): string {
    return this.mDevImp.createDebugUrl(host, "", this.mInstanceUUID);
  }

  public handleException(throwable: HippyJsException) {
    this.mDevImp.handleException(throwable);
  }

  public onLoadResourceFailed(url: string, errorMessage: string) {
    this.mDevImp.onLoadResourceFailed(url, errorMessage);
  }

  public getDevInstanceUUID(): string {
    return this.mInstanceUUID;
  }

  public isSupportDev(): boolean {
    return this.mSupportDev;
  }
}
