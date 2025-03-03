/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import { EngineInitParams,
  HippyJSModuleCreator,
  HippyLibrary,
  HippyNativeModuleCreator, HippyRootViewWrapper,
  HippyValue,
  HRRenderViewCreator } from 'hippy';
import { HippyAPIProvider } from 'hippy';
import { createHippyEngine } from 'hippy';
import { ModuleLoadParams } from 'hippy';
import { ModuleLoadStatus } from 'hippy';
import { EngineInitStatus } from 'hippy';
import { HippyEngine } from 'hippy';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { BizComponent } from './BizView';
import HippyRenderBaseView
  from 'hippy/src/main/ets/renderer_native/components/base/HippyRenderBaseView';
import demoNapi from 'libdemo.so';

export class ExampleAPIProvider implements HippyAPIProvider {
  getCustomNativeModuleCreatorMap(): Map<string, HippyNativeModuleCreator> | null {
    return null
  }

  getCustomJavaScriptModuleCreatorMap(): Map<string, HippyJSModuleCreator> | null {
    return null
  }

  getCustomRenderViewCreatorMap(): Map<string, HRRenderViewCreator> | null {
    return null
  }

  getCustomMeasureRenderViews(): Array<string> | null {
    return null
  }

  getCustomMappingRenderViewMap(): Map<string, string> | null {
    return null
  }

  getCustomFontPathMap(): Map<string, string> | null {
    return null
  }
}

@Builder
function buildCustomRenderView($$: HippyRenderBaseView) {
}

@Entry
@Component
struct Index {
  @State message: string = 'C接入Hippy根组件';
  @StorageLink('libHippy') private libHippy: HippyLibrary | null = null
  @StorageLink('abilityContext') private abilityContext: Context | null = null
  @State exception: string = ""
  private hippyEngine: HippyEngine | null = null
  private rootViewWrapper: HippyRootViewWrapper = new HippyRootViewWrapper()

  aboutToAppear(): void {
    let params = new EngineInitParams(this.libHippy!, this.abilityContext!, this.getUIContext())
    params.providers = new Array(new ExampleAPIProvider())
    params.coreJSAssetsPath = "vue2/vendor.ohos.js"
    params.enableArkCApi = true
    this.hippyEngine = createHippyEngine(params)
    this.hippyEngine.initEngine((statusCode: EngineInitStatus, msg: string) => {
      if (statusCode == EngineInitStatus.STATUS_OK) {
        let loadParams = new ModuleLoadParams(
          'vue2/index.ohos.js',
          '',
          '',
          '',
          null,
          null,
          null,
        )
        loadParams.componentName = "Demo"
        loadParams.codeCacheTag = "Demo"
        loadParams.jsParams = new Map<string, HippyValue>()
        loadParams.jsParams.set(
          "msgFromNative",
          "Hi js developer, I come from ohos native code!"
        )
        loadParams.wrappedCustomRenderViewBuilder = wrapBuilder(buildCustomRenderView)
        let rootView = this.hippyEngine?.loadModule(
          loadParams,
          (statusCode: ModuleLoadStatus, msg: string) => {

          })
        if (rootView) {
          this.rootViewWrapper.setRootView(rootView)
        }
        demoNapi.Demo_OnHippyRootViewReady();
      }
    })
  }

  build() {
    Column() {
      Text(this.message)
        .fontSize(16)
      BizComponent()
        .width(300)
        .height(400)
        .border({width: 1, color: Color.Black})
    }
    .width('100%')
  }
}
