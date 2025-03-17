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
import { HippyAPIProvider } from 'hippy'
import {
  HippyJSModuleCreator,
  HippyNativeModuleCreator } from 'hippy/src/main/ets/hippy_framework/modules/HippyModuleManagerImpl'
import { HippyNativeModuleBase } from 'hippy/src/main/ets/hippy_framework/modules/native'
import HippyRenderBaseView
  from 'hippy/src/main/ets/renderer_native/components/base/HippyRenderBaseView'
import {
  HRRenderViewCreator
} from 'hippy/src/main/ets/renderer_native/components/HippyRenderRegisterMap'
import { ExampleComponentA, ExampleViewA } from './ExampleViewA'
import { ExampleComponentB, ExampleViewB } from './ExampleViewB'
import { ExampleNativeModule } from './ExampleNativeModule'
import { ExampleNativeTurboModule } from './ExampleNativeTurboModule'

export class ExampleAPIProvider implements HippyAPIProvider {
  getCustomNativeModuleCreatorMap(): Map<string, HippyNativeModuleCreator> | null {
    let registerMap: Map<string, HippyNativeModuleCreator> = new Map()
    registerMap.set(ExampleNativeModule.NAME, (ctx): HippyNativeModuleBase => new ExampleNativeModule(ctx))
    registerMap.set(ExampleNativeTurboModule.NAME, (ctx): HippyNativeModuleBase => new ExampleNativeTurboModule(ctx))
    return registerMap;
  }

  getCustomJavaScriptModuleCreatorMap(): Map<string, HippyJSModuleCreator> | null {
    return null
  }

  getCustomRenderViewCreatorMap(): Map<string, HRRenderViewCreator> | null {
    let registerMap: Map<string, HRRenderViewCreator> = new Map()
    registerMap.set("ExampleViewA", (ctx): HippyRenderBaseView => new ExampleViewA(ctx))
    registerMap.set("ExampleViewB", (ctx): HippyRenderBaseView => new ExampleViewB(ctx))
    return registerMap
  }

  getCustomMeasureRenderViews(): Array<string> | null {
    return ["ExampleViewB"]
  }

  getCustomMappingRenderViewMap(): Map<string, string> | null {
    return null
  }

}


@Builder
export function buildCustomRenderView($$: HippyRenderBaseView) {
  if ($$ instanceof ExampleViewA) {
    ExampleComponentA({ renderView: $$ as ExampleViewA, children: $$.children })
  } else if ($$ instanceof ExampleViewB) {
    ExampleComponentB({ renderView: $$ as ExampleViewB, children: $$.children })
  }
}
