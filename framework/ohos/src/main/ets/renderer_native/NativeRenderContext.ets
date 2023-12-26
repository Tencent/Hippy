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
import { HRRenderViewCreator } from './components/HippyRenderRegisterMap'
import { WrappedHippyCustomRenderViewBuilder } from './HippyRenderViewBuilder'
import { NativeRender } from './NativeRender'

export class NativeRenderContext {
  private rootId: number
  private instanceId: number
  private customRenderViewCreatorMap: Map<string, HRRenderViewCreator> | null
  private nativeRender: NativeRender
  public wrappedCustomRenderViewBuilder: WrappedHippyCustomRenderViewBuilder | null

  constructor(instanceId: number, rootId: number,
      customRenderViewCreatorMap: Map<string, HRRenderViewCreator> | null,
      nativeRender: NativeRender,
      wrappedCustomRenderViewBuilder: WrappedHippyCustomRenderViewBuilder | null) {
    this.instanceId = instanceId
    this.rootId = rootId
    this.customRenderViewCreatorMap = customRenderViewCreatorMap
    this.nativeRender = nativeRender
    this.wrappedCustomRenderViewBuilder = wrappedCustomRenderViewBuilder
  }

  getInstanceId() {
    return this.instanceId
  }

  getRootId() {
    return this.rootId
  }

  getCustomRenderViewCreatorMap(): Map<string, HRRenderViewCreator> | null {
    return this.customRenderViewCreatorMap
  }

  getNativeRender(): NativeRender {
    return this.nativeRender
  }
}
