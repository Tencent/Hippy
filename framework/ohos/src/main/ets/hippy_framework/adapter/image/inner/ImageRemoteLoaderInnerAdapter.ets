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
import { HippyLibrary } from "../../../../hippy_library/HippyLibrary";
import { HippyImageRemoteLoaderAdapter, HippyImageRemoteLoaderListener } from "../HippyImageRemoteLoaderAdapter";

class ImageRemoteLoaderInnerListener implements HippyImageRemoteLoaderListener {
  private libHippy: HippyLibrary;
  private renderId: number;
  private rootId: number;
  private nodeId: number;

  constructor(libHippy: HippyLibrary, renderId: number, rootId: number, nodeId: number) {
    this.libHippy = libHippy;
    this.renderId = renderId;
    this.rootId = rootId;
    this.nodeId = nodeId;
  }

  onRequestSuccess(localPath: string): void {
    this.libHippy.NativeRenderProvider_DoCallbackForFetchLocalPathAsync(this.renderId, this.rootId, this.nodeId, true, localPath);
  }

  onRequestFail(): void {
    this.libHippy.NativeRenderProvider_DoCallbackForFetchLocalPathAsync(this.renderId, this.rootId, this.nodeId, false, "");
  }
}

export class ImageRemoteLoaderInnerAdapter {
  private libHippy: HippyLibrary;
  private renderId: number;
  private adapter: HippyImageRemoteLoaderAdapter;

  constructor(libHippy: HippyLibrary, renderId: number, adapter: HippyImageRemoteLoaderAdapter) {
    this.libHippy = libHippy;
    this.renderId = renderId;
    this.adapter = adapter;
  }

  fetchLocalPathAsync(rootId: number, nodeId: number, url: string): void {
    this.adapter.fetchLocalPathAsync(url, new ImageRemoteLoaderInnerListener(this.libHippy, this.renderId, rootId, nodeId));
  }
}
