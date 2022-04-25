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

import { AppClientType, DevicePlatform } from '@debug-server-next/@types/enum';
import { AppClient, AppClientOption } from './app-client';

/**
 * manage enabled AppClient list of different framework
 */
class AppClientManager {
  private androidAppClientOptionList: AppClientFullOptionOmicCtx[] = [];
  private iOSAppClientOptionList: AppClientFullOptionOmicCtx[] = [];

  public addAndroidAppClientOption(appClientOption: AppClientFullOptionOmicCtx) {
    this.androidAppClientOptionList.push(appClientOption);
  }

  public getAppClientOptions(platform: DevicePlatform) {
    if (platform === DevicePlatform.Android) return this.androidAppClientOptionList;
    if (platform === DevicePlatform.IOS) return this.iOSAppClientOptionList;
  }

  public addIOSAppClientOption(appClientOption: AppClientFullOptionOmicCtx) {
    this.iOSAppClientOptionList.push(appClientOption);
  }

  public clear() {
    this.androidAppClientOptionList = [];
    this.iOSAppClientOptionList = [];
  }

  public shouldUseAppClientType(platform: DevicePlatform, type: AppClientType): boolean {
    const options: AppClientFullOptionOmicCtx[] = this.getAppClientOptions(platform);
    return Boolean(options.find((item) => item.Ctor.name === type));
  }
}

export const appClientManager = new AppClientManager();

export type AppClientFullOption = AppClientOption & {
  Ctor: new (id: string, option: AppClientOption) => AppClient;
};

export type AppClientFullOptionOmicCtx = Omit<AppClientFullOption, 'urlParsedContext'>;

export type FrameworkConfig = {
  useAllDomain: boolean;
  ignoreDomains: string[];
  acceptDomains: string[];
  platform: DevicePlatform;
  Ctor: AppClient;
};
