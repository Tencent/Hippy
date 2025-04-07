import { EngineInitParams, HippyRootViewWrapper, EngineListener, ModuleListener, HippyJsException } from 'hippy';
import { HippyAPIProvider } from 'hippy';
import { createHippyEngine } from 'hippy';
import { ModuleLoadParams } from 'hippy';
import { ModuleLoadStatus } from 'hippy';
import { HippyException } from 'hippy';
import { HippyRoot } from 'hippy';
import { EngineInitStatus } from 'hippy';
import { HippyEngine } from 'hippy';
import { HippyJSModuleCreator } from 'hippy/src/main/ets/hippy_framework/modules/HippyModuleManagerImpl';
import { HippyNativeModuleCreator } from 'hippy/src/main/ets/hippy_framework/modules/HippyModuleManagerImpl';
import { HippyLibrary } from 'hippy/src/main/ets/hippy_library/HippyLibrary';
import HippyRenderBaseView from 'hippy/src/main/ets/renderer_native/components/base/HippyRenderBaseView';
import { HRRenderViewCreator } from 'hippy/src/main/ets/renderer_native/components/HippyRenderRegisterMap';
import { HippyValue } from 'hippy/src/main/ets/support/common/HippyTypes';
import { LogUtils } from 'hippy/src/main/ets/support/utils/LogUtils'

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
      loadParams.codeCacheTag = "Demo"
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
  private hippyEngine: HippyEngine | null = null
  private rootViewWrapper: HippyRootViewWrapper = new HippyRootViewWrapper()

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

  build() {
    Column() {
      HippyRoot({
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
