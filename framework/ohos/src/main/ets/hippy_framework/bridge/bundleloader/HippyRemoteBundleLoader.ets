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
import { RequestFrom, ResourceDataHolder, UriType } from '../../../vfs/ResourceDataHolder';
import { ProcessorCallbackImpl } from '../../../vfs/VfsManager';
import { NativeCallback } from '../../connector/NativeCallback';
import { HippyBridge } from '../HippyBridge';
import { HippyBundleLoader } from './HippyBundleLoader';
import { HippyFileBundleLoader } from './HippyFileBundleLoader';


export class HippyRemoteBundleLoader implements HippyBundleLoader {
  public static readonly FILE_STR = "file://";
  private mUrl: string;
  private mCanUseCodeCache = false;
  private mCodeCacheTag = '';

  public constructor(
    url: string,
    canUseCodeCache: boolean,
    codeCacheTag: string) {
    this.mUrl = url;
    this.mCanUseCodeCache = canUseCodeCache;
    this.mCodeCacheTag = codeCacheTag;
  }

  public setCodeCache(canUseCodeCache: boolean, codeCacheTag: string) {
    this.mCanUseCodeCache = canUseCodeCache;
    this.mCodeCacheTag = codeCacheTag;
  }

  public load(bridge: HippyBridge, callback: NativeCallback) {
    if (TextUtils.isEmpty(this.mUrl)) {
      return;
    }

    const fileDownloadCb = new ProcessorCallbackImpl()
    fileDownloadCb.onHandleCompleted = () => {
      const uri = HippyFileBundleLoader.FILE_STR + holder.filePath;
      let ret = bridge.runScriptFromUri(uri, this.mCanUseCodeCache, this.mCodeCacheTag, callback);
      LogUtils.d("HippyRemoteBundleLoader", "load: ret" + ret);
    }
    const holder = new ResourceDataHolder(this.mUrl, UriType.FILE, null, null, null, RequestFrom.NATIVE, -1)
    bridge.getHippyEngineContext()?.getGlobalConfigs().getFileAdapter()?.downloadFile(holder, fileDownloadCb);
  }

  public getPath(): string {
    return this.mUrl;
  }

  public getRawPath(): string {
    return this.mUrl;
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
