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
import { NativeRenderProvider } from './NativeRenderProvider'

export class NativeRenderProviderManager {
  private static sProviderMap = new Map<number, NativeRenderProvider>()

  static addRenderProvider(instanceId: number, provider: NativeRenderProvider) {
    NativeRenderProviderManager.sProviderMap.set(instanceId, provider)
  }

  static removeRenderProvider(instanceId: number) {
    NativeRenderProviderManager.sProviderMap.delete(instanceId)
  }

  static getRenderProvider(instanceId: number) {
    return NativeRenderProviderManager.sProviderMap.get(instanceId)
  }
}
