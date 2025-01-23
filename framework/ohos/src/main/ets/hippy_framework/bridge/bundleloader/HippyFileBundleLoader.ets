/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { LogUtils } from '../../../support/utils/LogUtils';
import { TextUtils } from '../../../support/utils/TextUtils';
import { NativeCallback } from '../../connector/NativeCallback';
import { HippyBridge, URI_SCHEME_FILE } from '../HippyBridge';
import { HippyBundleLoader } from './HippyBundleLoader';


export class HippyFileBundleLoader implements HippyBundleLoader {
  public static readonly FILE_STR = "file://";
  private mFilePath: string;
  private mCanUseCodeCache = false;
  private mCodeCacheTag = '';

  public constructor(
    filePath: string,
    canUseCodeCache: boolean,
    codeCacheTag: string) {
    this.mFilePath = filePath;
    this.mCanUseCodeCache = canUseCodeCache;
    this.mCodeCacheTag = codeCacheTag;
  }


  public setCodeCache(canUseCodeCache: boolean, codeCacheTag: string) {
    this.mCanUseCodeCache = canUseCodeCache;
    this.mCodeCacheTag = codeCacheTag;
  }

  public load(bridge: HippyBridge, callback: NativeCallback) {
    if (TextUtils.isEmpty(this.mFilePath)) {
      return;
    }

    const uri: string =
        (!this.mFilePath.startsWith(URI_SCHEME_FILE)) ? (URI_SCHEME_FILE + this.mFilePath) : this.mFilePath;
    const ret = bridge.runScriptFromUri(uri, this.mCanUseCodeCache, this.mCodeCacheTag, callback);
    LogUtils.d("HippyFileBundleLoader", "load: ret" + ret);
  }

  public getPath(): string {
    if (this.mFilePath != null && !this.mFilePath.startsWith(HippyFileBundleLoader.FILE_STR)) {
      return HippyFileBundleLoader.FILE_STR + this.mFilePath;
    } else {
      return this.mFilePath;
    }
  }

  public getRawPath(): string {
    return this.mFilePath;
  }

  public getBundleUniKey(): string {
    return this.getPath();
  }

  public canUseCodeCache(): boolean {
    return this.mCanUseCodeCache;
  }

  public getCodeCacheTag(): string {
    return this.mCodeCacheTag;
  }
}
