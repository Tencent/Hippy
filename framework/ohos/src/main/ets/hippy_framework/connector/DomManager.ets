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
import { HippyLibrary } from '../../hippy_library/HippyLibrary';

export class DomManager {
  private libHippy: HippyLibrary
  public instanceId: number = 0

  constructor(libHippy: HippyLibrary, domManagerConcurrentNum: number) {
    this.libHippy = libHippy
    this.instanceId = this.createDomManager(domManagerConcurrentNum);
  }

  destroy() {
    this.destroyDomManager(this.instanceId);
  }

  attachToRenderer(
    renderId: number
  ) {
    this.libHippy?.DomManager_SetRenderManager(this.instanceId, renderId)
  }

  createDomManager(domManagerConcurrentNum: number): number {
    return this.libHippy?.DomManager_CreateDomManager(domManagerConcurrentNum)
  }

  destroyDomManager(
    domManagerId: number,
  ) {
    this.libHippy?.DomManager_DestroyDomManager(domManagerId)
  }

  createRootNode(
    rootId: number,
    density: number
  ) {
    this.libHippy?.DomManager_CreateRoot(rootId, density)
  }

  destroyRootNode(
    rootId: number,
  ) {
    this.libHippy?.DomManager_ReleaseRootResources(rootId)
    this.libHippy?.DomManager_DestroyRoot(rootId)
  }

  releaseRootResources(
    rootId: number,
  ) {
    this.libHippy?.DomManager_ReleaseRootResources(rootId)
  }

  attachToRoot(
    rootId: number
  ) {
    this.libHippy?.DomManager_SetDomManager(rootId, this.instanceId)
  }

  getDomManagerId(): number {
    return this.instanceId;
  }
}
