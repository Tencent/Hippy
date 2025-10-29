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
/*
 * 该Demo展示了自定义HippyRoot的使用，即CustomHippyRoot的使用。
 * CustomHippyRoot不同于HippyRoot，CustomHippyRoot实现了Root组件刷新页面内容的能力。
 * 实现原理：CustomHippyRoot监听了hippyEngine和rootView的改变，从而知道何时使用新hippyEngine重新绑定新的TS rootView和C rootView。
 * 业务使用方法：
 * 1 复制CustomHippyRoot代码到业务里；
 * 2 使用CustomHippyRoot，参考该文件onClick里代码，先对老页面resetRootView，并销毁module、engine，再创建新页面的engine、module，并对新页面setRootView。
 */
import { EngineInitParams, HippyRootViewWrapper, EngineListener, ModuleListener, HippyJsException } from 'hippy';
import { HippyAPIProvider } from 'hippy';
import { createHippyEngine } from 'hippy';
import { ModuleLoadParams } from 'hippy';
import { ModuleLoadStatus } from 'hippy';
import { HippyException } from 'hippy';
import { EngineInitStatus } from 'hippy';
import { HippyEngine } from 'hippy';
import { HippyJSModuleCreator } from 'hippy/src/main/ets/hippy_framework/modules/HippyModuleManagerImpl';
import { HippyNativeModuleCreator } from 'hippy/src/main/ets/hippy_framework/modules/HippyModuleManagerImpl';
import { HippyLibrary } from 'hippy/src/main/ets/hippy_library/HippyLibrary';
import HippyRenderBaseView from 'hippy/src/main/ets/renderer_native/components/base/HippyRenderBaseView';
import { HRRenderViewCreator } from 'hippy/src/main/ets/renderer_native/components/HippyRenderRegisterMap';
import { HippyValue } from 'hippy/src/main/ets/support/common/HippyTypes';
import { LogUtils } from 'hippy/src/main/ets/support/utils/LogUtils'
import { CustomHippyRoot } from './CustomHippyRoot';

export class ExampleAPIProvider extends HippyAPIProvider {
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

}

class DefaultEngineListener implements EngineListener {
  private hippyEngine: HippyEngine
  private rootViewWrapper: HippyRootViewWrapper

  constructor(hippyEngine: HippyEngine, rootViewWrapper: HippyRootViewWrapper) {
    this.hippyEngine = hippyEngine
    this.rootViewWrapper = rootViewWrapper
  }

  onInitialized(statusCode: EngineInitStatus, msg: string): void {
    LogUtils.i('hippy demo', 'initEngine status: ' + statusCode + ' msg:' + msg);
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
      loadParams.codeCacheTag = "Demo1"
      loadParams.jsParams = new Map<string, HippyValue>()
      loadParams.jsParams.set(
        "msgFromNative",
        "Hi js developer, I come from ohos native code!"
      )
      loadParams.wrappedCustomRenderViewBuilder = wrapBuilder(buildCustomRenderView)
      let moduleListener = new DefaultModuleListener()
      let rootView = this.hippyEngine.loadModuleWithListener(loadParams, moduleListener)
      if (rootView) {
        this.rootViewWrapper.setRootView(rootView)
      }
    }
  }
}

class DefaultModuleListener implements ModuleListener {
  onLoadCompleted(statusCode: ModuleLoadStatus, msg: string): void {
    LogUtils.i('hippy demo', 'loadModule status: ' + statusCode + ' msg:' + msg);
  }

  onJsException(exception: HippyJsException): boolean {
    LogUtils.e('hippy demo', 'loadModule onJsException: ' + exception);
    return true;
  }

  onFirstViewAdded(): void {

  }

  onFirstContentfulPaint(): void {

  }
}

class DefaultEngineListener2 implements EngineListener {
  private hippyEngine: HippyEngine
  private rootViewWrapper: HippyRootViewWrapper
  private nextId: number

  constructor(hippyEngine: HippyEngine, rootViewWrapper: HippyRootViewWrapper, nextId: number) {
    this.hippyEngine = hippyEngine
    this.rootViewWrapper = rootViewWrapper
    this.nextId = nextId
  }

  onInitialized(statusCode: EngineInitStatus, msg: string): void {
    LogUtils.i('hippy demo', 'initEngine status: ' + statusCode + ' msg:' + msg);
    if (statusCode == EngineInitStatus.STATUS_OK) {
      let loadParams = new ModuleLoadParams(
        this.nextId % 2 == 1 ? "react/index.ohos.js" : "vue2/index.ohos.js",
        '',
        '',
        '',
        null,
        null,
        null,
      )
      loadParams.componentName = "Demo"
      loadParams.codeCacheTag = "Demo2"
      loadParams.jsParams = new Map<string, HippyValue>()
      loadParams.jsParams.set(
        "msgFromNative",
        "Hi js developer, I come from ohos native code!"
      )
      loadParams.wrappedCustomRenderViewBuilder = wrapBuilder(buildCustomRenderView)
      let moduleListener = new DefaultModuleListener2()
      let rootView = this.hippyEngine.loadModuleWithListener(loadParams, moduleListener)
      if (rootView) {
        this.rootViewWrapper.setRootView(rootView)
      }
    }
  }
}

class DefaultModuleListener2 implements ModuleListener {
  onLoadCompleted(statusCode: ModuleLoadStatus, msg: string): void {
    LogUtils.i('hippy demo', 'loadModule status: ' + statusCode + ' msg:' + msg);
  }

  onJsException(exception: HippyJsException): boolean {
    LogUtils.e('hippy demo', 'loadModule onJsException: ' + exception);
    return true;
  }

  onFirstViewAdded(): void {

  }

  onFirstContentfulPaint(): void {

  }
}

@Builder
function buildCustomRenderView($$: HippyRenderBaseView) {
}

@Entry
@Component
struct Index {
  @State message: string = 'Hello World';
  @StorageLink('libHippy') private libHippy: HippyLibrary | null = null
  @StorageLink('abilityContext') private abilityContext: Context | null = null
  @State exception: string = ""
  @State hippyEngine: HippyEngine | null = null
  private rootViewWrapper: HippyRootViewWrapper = new HippyRootViewWrapper()
  private nextId: number = 0

  aboutToAppear(): void {
    let params = new EngineInitParams(this.libHippy!, this.abilityContext!, this.getUIContext())
    params.providers = new Array(new ExampleAPIProvider())
    params.coreJSAssetsPath = "vue2/vendor.ohos.js"
    params.enableArkCApi = true
    this.hippyEngine = createHippyEngine(params)
    let engineListener = new DefaultEngineListener(this.hippyEngine, this.rootViewWrapper)
    this.hippyEngine.initEngine(engineListener)
  }

  onPageShow(): void {
    this.hippyEngine?.onEngineResume()
  }

  onPageHide(): void {
    this.hippyEngine?.onEnginePause()
  }

  loadNextPage(): void {
    ++this.nextId
    let params = new EngineInitParams(this.libHippy!, this.abilityContext!, this.getUIContext())
    params.providers = new Array(new ExampleAPIProvider())
    params.coreJSAssetsPath = this.nextId % 2 == 1 ? "react/vendor.ohos.js" : "vue2/vendor.ohos.js"
    params.enableArkCApi = true
    this.hippyEngine = createHippyEngine(params)
    let engineListener = new DefaultEngineListener2(this.hippyEngine, this.rootViewWrapper, this.nextId)
    this.hippyEngine.initEngine(engineListener)
  }

  build() {
    Column() {
      Button('刷新到下一个页面')
        .size({width: '100%', height: 40})
        .backgroundColor(Color.Orange)
        .onClick((event: ClickEvent) => {
          let rootView = this.rootViewWrapper?.getRootView()
          if (rootView) {
            this.rootViewWrapper?.resetRootView()
            this.hippyEngine?.destroyModule(rootView.getRootId(), () => {
              this.hippyEngine?.destroyEngine()
              this.loadNextPage()
            });
          } else {
            this.loadNextPage()
          }
        })
      Stack()
        .size({width: '100%', height: 10})
      CustomHippyRoot({
        hippyEngine: this.hippyEngine,
        rootViewWrapper: this.rootViewWrapper,
        onRenderException: (exception: HippyException) => {
          this.exception = `${exception.message}\n${exception.stack}`
        },
      })
        .layoutWeight(1)
      if (this.exception) {
        Text(this.exception)
      }
    }
    .width('100%')
    .height('100%')
    .expandSafeArea([SafeAreaType.KEYBOARD])
  }
}
