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
import resmgr from "@ohos.resourceManager";
import {
  BackPressHandler,
  EngineInitParams,
  EngineInitStatus,
  EngineListener,
  HippyEngine,
  HippyModuleDestroyCallback,
  ModuleListener,
  ModuleLoadParams,
  ModuleLoadStatus,
  V8InitParams
} from './HippyEngine';
import { DomManager } from './connector/DomManager';
import { FrameworkProxy } from '../renderer_native/FrameworkProxy';
import { NativeRenderer } from './connector/NativeRenderer';
import { VfsManager } from '../vfs/VfsManager';
import { NativeRenderProvider } from '../renderer_native/NativeRenderProvider';
import { HippyLibrary } from '../hippy_library/HippyLibrary';
import { HippyException } from '../support/common/HippyException';
import { HippyAPIProvider } from './bridge/HippyAPIProvider';
import { HRRenderViewCreator } from '../renderer_native/components/HippyRenderRegisterMap';
import { HippyGlobalConfigs } from './HippyGlobalConfigs';
import { TimeMonitor } from '../support/utils/TimeMonitor';
import { TextUtils } from '../support/utils/TextUtils';
import { HippyAssetBundleLoader } from './bridge/bundleloader/HippyAssetBundleLoader';
import { HippyBundleLoader } from './bridge/bundleloader/HippyBundleLoader';
import { HippyFileBundleLoader } from './bridge/bundleloader/HippyFileBundleLoader';
import { HippyThirdPartyAdapter } from './adapter/thirdparty/HippyThirdPartyAdapter';
import { HippyEngineContext } from './HippyEngineContext'
import { HippyEngineContextImpl } from './HippyEngineContextImpl';
import { LogUtils } from '../support/utils/LogUtils';
import { HippyAny, HippyMap, HippyValue } from '../support/common/HippyTypes';
import { DeviceEventModule } from './modules/native/deviceevent/DeviceEventModule';
import { HippyRemoteBundleLoader } from './bridge/bundleloader/HippyRemoteBundleLoader';
import { EventDispatcher } from './modules/javascript/EventDispatcher';
import { HippyRootView } from '../renderer_native/HippyRootView';
import { WrappedHippyCustomRenderViewBuilder } from '../renderer_native/HippyRenderViewBuilder';
import { DevtoolsManager } from './devsupport/DevtoolsManager';
import { DevSupportManager } from './devsupport/DevSupportManager';
import { DevServerCallBack } from './devsupport/DevServerCallBack';
import { HippyJsException } from './common/HippyJsException';
import { DimensionsUtil } from '../support/utils/DimensionsUtil';
import { PixelUtil } from "../support/utils/PixelUtil";
import systemDateTime from '@ohos.systemDateTime';
import { HippyEngineLifecycleEventListener } from "./HippyEngineLifecycleEventListener";
import { Dimensions } from "./modules/javascript/Dimensions";
import { window } from "@kit.ArkUI";
import { HippyWindowInfo } from "./HippyWindowInfo";

export class HippyEngineManagerImpl implements HippyEngine, FrameworkProxy, DevServerCallBack {
  private static sEngineIdCounter = 0

  private mGroupId: number = -1;
  private mEngineId: number = 0;

  private libHippy: HippyLibrary
  private resourceManager: resmgr.ResourceManager | null = null
  private providers: Array<HippyAPIProvider> | null = null
  private params: EngineInitParams;
  public nativeRenderProvider: NativeRenderProvider | null = null
  public nativeRenderer: NativeRenderer | null = null
  public mGlobalConfigs: HippyGlobalConfigs
  public mCoreBundleLoader: HippyBundleLoader | null = null;
  public mDebugMode: boolean;
  public mServerBundleName: string;
  public enableV8Serialization: boolean;
  public mRemoteServerUrl: string;
  public mInitStartTime: number = 0;
  public mMonitor: TimeMonitor;
  public mServerHost: string;
  public mThirdPartyAdapter: HippyThirdPartyAdapter | null;
  public v8InitParams: V8InitParams | null;
  public nativeParams: HippyMap | null = null;
  public mEngineContext: HippyEngineContextImpl | null = null;
  private mDevtoolsManager: DevtoolsManager | null = null;
  private mDevSupportManager: DevSupportManager | null = null;

  private destroyModuleCallback: Function | null = null;
  private rootView: HippyRootView | null = null;
  private moduleLoadParams: ModuleLoadParams | null = null;

  private mEventListeners = new Array<EngineListener>();
  private mModuleListener: ModuleListener | null = null;

  private mEnvCallbackId: number = -1

  private mWindowInfo: HippyWindowInfo | null = null;

  constructor(params: EngineInitParams) {
    HippyEngineManagerImpl.sEngineIdCounter += 1;
    this.mEngineId = HippyEngineManagerImpl.sEngineIdCounter;
    this.params = params;
    this.libHippy = params.libHippy
    this.providers = params.providers
    this.mGlobalConfigs = new HippyGlobalConfigs(params)
    this.mDebugMode = params.debugMode;
    this.mServerBundleName = params.debugMode ? params.debugBundleName : "";
    this.enableV8Serialization = params.enableV8Serialization;
    this.mServerHost = params.debugServerHost;
    this.mRemoteServerUrl = params.remoteServerUrl;
    this.mGroupId = params.groupId;
    this.mThirdPartyAdapter = params.thirdPartyAdapter;
    this.v8InitParams = params.v8InitParams;
    this.mMonitor = new TimeMonitor();
    if (!params.context) {
      return
    }
    this.resourceManager = params.context.resourceManager
    // create core bundle loader
    let coreBundleLoader: HippyBundleLoader | null = null;
    if (!TextUtils.isEmpty(params.coreJSAssetsPath)) {
      coreBundleLoader = new HippyAssetBundleLoader(params.context, params.coreJSAssetsPath,
        !TextUtils.isEmpty(params.codeCacheTag), params.codeCacheTag);
    } else if (!TextUtils.isEmpty(params.coreJSFilePath)) {
      coreBundleLoader = new HippyFileBundleLoader(params.coreJSFilePath,
        !TextUtils.isEmpty(params.codeCacheTag), params.codeCacheTag);
    }
    this.mCoreBundleLoader = coreBundleLoader;

    this.checkFontWeightScale();
    this.checkWindowInfo();
  }

  setUIContext(uiContext: UIContext | null): void {
    this.params.setUIContext(uiContext)
    this.checkFontWeightScale();
  }

  checkFontWeightScale(): void {
    if (!this.params.uiContext) {
      return;
    }
    // 获取系统设置“字体大小和界面缩放”里的字体粗细值
    this.params.uiContext?.runScopedTask(() => {
      Environment.envProp('fontWeightScale', '1.0');
    })
    const weightScale: SubscribedAbstractProperty<string> = AppStorage.prop('fontWeightScale');
    if (!weightScale) {
      return;
    }
    let weightScaleValue = Number(weightScale.get());
    PixelUtil.setFontWeightScale(weightScaleValue, this.params.libHippy);
    // 关闭监听系统参数变化，这个监听最好App层面做。
    /*
    let environmentCallback: EnvironmentCallback = {
      onConfigurationUpdated(newConfig) {
        if (newConfig.fontWeightScale && newConfig.fontWeightScale != PixelUtil.getFontWeightScale()) {
          PixelUtil.setFontWeightScale(newConfig.fontWeightScale, this.params.libHippy);
        }
      },
      onMemoryLevel(level) {
        LogUtils.e('hippy', `onMemoryLevel level: ${level}`)
      }
    }
    try {
      this.mEnvCallbackId = this.params.context.getApplicationContext().on('environment', environmentCallback);
    } catch (err) {
      let code = (err as BusinessError).code;
      let message = (err as BusinessError).message;
      LogUtils.e('hippy', `failed to register applicationContext. Code is ${code}, message is ${message}`);
    }
    //*/
  }

  checkWindowInfo(): void {
    window.getLastWindow(getContext(this)).then((data) => {
      try {
        if (!this.mWindowInfo) {
          this.mWindowInfo = new HippyWindowInfo(data, this.libHippy);
        }
      } catch (e) {
        LogUtils.e('hippy', `getLastWindow error:${e}`)
      }
    });
  }

  onInitDevError(e: HippyJsException): void {
  }

  onDebugReLoad(): void {
    if (this.rootView) {
      this.destroyModule(this.rootView.getRootId(), ()=> {
        this.mEngineContext?.destroyBridge(true);
      });
    }
  }

  onBackPressed(handler: BackPressHandler): boolean {
    if (this.mEngineContext != null
      && this.mEngineContext.getModuleManager().getNativeModule(DeviceEventModule.NAME, false)
        != null) {
      let nativeModule = this.mEngineContext.getModuleManager().getNativeModule(DeviceEventModule.NAME, false)
      if (nativeModule instanceof DeviceEventModule) {
        return nativeModule.onBackPressed(handler);
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  getHippyEngineContext(): HippyEngineContext | null {
    return this.mEngineContext
  }

  public initDevModule() {
    if (this.params.debugMode) {
      this.mDevSupportManager = new DevSupportManager(
        this.mGlobalConfigs,
        this.params.debugMode,
        this.params.debugServerHost,
        this.params.debugBundleName,
        this.params.remoteServerUrl);
      let url = this.mDevSupportManager.createResourceUrl(this.mServerBundleName);
      this.mCoreBundleLoader = new HippyRemoteBundleLoader(url as string, false, "");
      // Inject Devtools Callback
      this.mDevSupportManager.setDevCallback(this);
    }
  }

  public reloadEngineCallback = () => {
    if(this.mDebugMode) {
      this.startEngine(true);
    }
  }

  public startEngine(onReLoad = false) {
    // add init engine perf
    this.mMonitor.beginGroup(TimeMonitor.MONITOR_GROUP_INIT_ENGINE);
    this.mMonitor.addPoint(TimeMonitor.MONITOR_GROUP_INIT_ENGINE, TimeMonitor.MONITOR_POINT_INIT_NATIVE_ENGINE);
    // init HippyEngineContext
    let domMgr: DomManager | null = null;
    if (onReLoad && this.mDebugMode && this.mEngineContext != null) {
        this.mEngineContext.destroy(true);
        domMgr = this.mEngineContext.getDomManager();
    }
    this.mEngineContext = new HippyEngineContextImpl(
      this.params,
      domMgr,
      this.mGlobalConfigs,
      this.mInitStartTime,
      this.mMonitor,
      this.mCoreBundleLoader,
      this.mDevSupportManager,
      this.reloadEngineCallback,
    );
    if (onReLoad && this.mDebugMode && this.rootView) {
      this.mEngineContext?.setRootView(this.rootView);
    }
    this.nativeRenderProvider = this.mEngineContext.getNativeRenderProvider()
    if (this.nativeRenderProvider) {
      this.nativeRenderProvider.getNativeRenderImpl().setFrameworkProxy(this);
    }

    let customRenderViewCreatorMap: Map<string, HRRenderViewCreator> | null = null
    if (this.providers) {
      customRenderViewCreatorMap = new Map()
      for (let provider of this.providers) {
        let map = provider.getCustomRenderViewCreatorMap()
        if (map) {
          map.forEach((value, key) => {
            customRenderViewCreatorMap?.set(key, value)
          })
        }
      }
    }

    if (!this.params.integrateJSEngine) {
      this.notifyEngineInitialized(EngineInitStatus.STATUS_OK, "")
      return
    }

    // initBridge && load vendor js bundle
    this.mEngineContext.getBridgeManager()?.initBridge((result: number, reason: string) => {
      // Some async params needed by c-api renderer are put here.
      let nativeRenderer = (this.getHippyEngineContext() as HippyEngineContextImpl).nativeRenderer
      nativeRenderer?.initRendererParams(px2vp(DimensionsUtil.STATUS_BAR_HEIGHT))

      this.initBridgeCallback(result, reason, onReLoad)
    }, onReLoad);
  }

  initBridgeCallback = (result: number, reason: string, isReload = false) => {
    const jsDriver = this.mEngineContext?.getJsDriver();
    if (!jsDriver) {
      return
    }
    LogUtils.i('hippy', 'jsDriver runScriptFromUri callback, instanceId: %{public}d' + jsDriver.instanceId);
    if (result != 0) {
      return;
    }

    if (isReload) {
      this.loadJsModule();
      return;
    }

    this.notifyEngineInitialized(EngineInitStatus.STATUS_OK, "");
  }

  public sendEvent(event: string, params: HippyAny): void {
    if (this.mEngineContext != null && this.mEngineContext.getModuleManager() != null) {
      const eventModule = this.mEngineContext.getModuleManager().getJavaScriptModule(EventDispatcher.MODULE_NAME);
      if (eventModule != null) {
        (eventModule as EventDispatcher).receiveNativeEvent(event, params);
      }
    }
  }

  getGroupId(): number {
    return this.mGroupId;
  }

  getEngineId(): number {
    return this.mEngineId;
  }

  getEngineInitParams(): EngineInitParams {
    return this.params;
  }

  public initEngine(listener: EngineListener): void {
    this.mInitStartTime = systemDateTime.getTime();
    this.mEventListeners.push(listener);
    this.initDevModule();
    this.startEngine();
  }

  notifyEngineInitialized(statusCode: EngineInitStatus, msg: string) {
    // TODO: preload

    this.mGlobalConfigs.getEngineMonitorAdapter()?.onEngineInitialized(statusCode);
    for (let listener of this.mEventListeners) {
      listener.onInitialized(statusCode, msg);
    }
    this.mEventListeners.splice(0, this.mEventListeners.length);
  }

  loadModule(loadParams: ModuleLoadParams): HippyRootView | null {
    return this.loadModuleWithListener(loadParams, null);
  }

  loadModuleWithListener(loadParams: ModuleLoadParams, listener: ModuleListener | null): HippyRootView | null {
    this.mModuleListener = listener;
    const jsDriver = this.mEngineContext?.getJsDriver();
    if (!jsDriver || !this.getVfsManager() || !this.resourceManager) {
      return null;
    }
    if (!this.mDebugMode) {
      let coreBundleLoader: HippyBundleLoader | null = null;
      if (!TextUtils.isEmpty(loadParams.jsAssetsPath)) {
        coreBundleLoader = new HippyAssetBundleLoader(this.mGlobalConfigs.getContext()!, loadParams.jsAssetsPath, !TextUtils.isEmpty(loadParams.codeCacheTag), loadParams.codeCacheTag);
      } else if (!TextUtils.isEmpty(loadParams.jsFilePath)) {
        coreBundleLoader = new HippyFileBundleLoader(loadParams.jsFilePath, !TextUtils.isEmpty(loadParams.codeCacheTag), loadParams.codeCacheTag);
      }
      this.mCoreBundleLoader = coreBundleLoader;
    }
    this.rootView = this.mEngineContext!.createRootView(loadParams);
    this.moduleLoadParams = loadParams;
    this.mEngineContext?.setRootView(this.rootView);
    this.mEngineContext?.setLoadModuleListener(this.mModuleListener);
    this.mEngineContext?.setComponentName(loadParams.componentName);
    this.loadJsModule();
    return this.rootView;
  }

  notifyModuleLoaded(statusCode: ModuleLoadStatus, msg: string): void {
    this.mModuleListener?.onLoadCompleted(statusCode, msg);
  }

  destroyModule(rootId: number, destroyModuleCallback: HippyModuleDestroyCallback): void {
    this.destroyModuleCallback = destroyModuleCallback;
    if (this.params.debugMode && this.mDevSupportManager && this.rootView) {
      this.mDevSupportManager.detachFromHost(this.params.context, this.rootView.getRootId());
    }
    if (this.mEngineContext != null && this.mEngineContext.getBridgeManager() != null) {
      this.mEngineContext.getBridgeManager()?.destroyInstance(rootId);
    }
    if (this.destroyModuleCallback) {
      this.destroyModuleCallback(true);
    }
  }

  destroyEngine(): void {
    if (this.mEngineContext != null) {
      this.mEngineContext.destroyBridge(false);
    }
    this.mWindowInfo?.onDestroy();
    /*
    let applicationContext = this.params.context.getApplicationContext();
    applicationContext.off('environment', this.mEnvCallbackId);
    */
  }

  preloadModule(loader: HippyBundleLoader): void {
    if (this.mEngineContext != null && this.mEngineContext.getBridgeManager() != null) {
      this.mEngineContext.getBridgeManager()?.runBundle(-1, loader);
    }
  }

  onDestroyEngine(): void {
    if (this.mEngineContext != null) {
      this.mEngineContext.destroy(false);
    }
    this.mModuleListener = null;
  }

  destroyRoot(rootId: number): void {
    this.mEngineContext!.destroyRoot(rootId)
  }

  getVfsManager(): VfsManager {
    return this.mEngineContext!.getVfsManager();
  }

  getBundlePath(): string {
    if (this.mCoreBundleLoader) {
      return this.mCoreBundleLoader.getPath()
    }
    return ""
  }

  onFirstPaint() {
    this.mEngineContext?.getMonitor().addPoint(TimeMonitor.MONITOR_GROUP_PAINT, TimeMonitor.MONITOR_POINT_FIRST_CONTENTFUL_PAINT);
    this.mGlobalConfigs?.getEngineMonitorAdapter()?.onFirstPaintCompleted(this.mEngineContext?.getComponentName() ?? '');
    this.mModuleListener?.onFirstViewAdded();
  };

  onFirstContentfulPaint() {
    this.mEngineContext?.getMonitor().endGroup(TimeMonitor.MONITOR_GROUP_PAINT);
    this.mGlobalConfigs.getEngineMonitorAdapter()?.onFirstContentfulPaintCompleted(this.mEngineContext?.getComponentName() ?? '');
    this.mModuleListener?.onFirstContentfulPaint();
  }


  handleNativeException(exception: HippyException): void {
    this.mGlobalConfigs.getExceptionHandler()?.handleNativeException(exception, true);
  }

  async updateDimension(width: number, height: number): Promise<void> {
    if (!this.mEngineContext) {
      return;
    }
    let context = this.mEngineContext.getGlobalConfigs().getContext();
    if (!context) {
      return;
    }
    let dimensionMap = await DimensionsUtil.getDimensions(width, height, context);
    let dimensionW: number = 0;
    let dimensionH: number = 0;
    if (dimensionMap) {
      let windowMap = dimensionMap.get("windowPhysicalPixels") as Map<string, HippyValue>;
      if (windowMap) {
        dimensionW = windowMap.get("width") as number;
        dimensionH = windowMap.get("height") as number;
      }
      LogUtils.i('hippy', "updateDimension: " + dimensionMap);
    }
    if (height < 0 || dimensionW == dimensionH) {
      let deviceAdapter = this.mEngineContext.getGlobalConfigs().getDeviceAdapter();
      deviceAdapter?.reviseDimensionIfNeed(context, dimensionMap);
    }
    DimensionsUtil.convertDimensionsToDp(dimensionMap);
    let manager = this.mEngineContext.getModuleManager();
    if (manager) {
      let eventModule = manager.getJavaScriptModule(Dimensions.MODULE_NAME);
      if (eventModule) {
        (eventModule as Dimensions).set(dimensionMap);
      }
    }
  }

  onSizeChanged(rootId: number, w: number, h: number, ow: number, oh: number): void {
    if (this.mEngineContext) {
      let manager = this.mEngineContext.getModuleManager();
      if (manager) {
        let eventModule = manager.getJavaScriptModule(EventDispatcher.MODULE_NAME);
        if (eventModule) {
          let map = new Map<string, number>()
          map.set('width', PixelUtil.vp2dp(w))
          map.set('height', PixelUtil.vp2dp(h))
          map.set('oldWidth', PixelUtil.vp2dp(ow))
          map.set('oldHeight', PixelUtil.vp2dp(oh));
          (eventModule as EventDispatcher).receiveNativeEvent("onSizeChanged", map);
        }
      }
    }
  }

  loadJsModule() {
    if (!this.mEngineContext) {
      LogUtils.e('hippy', 'load module error. mEngineContext=null');
      this.notifyModuleLoaded(ModuleLoadStatus.STATUS_VARIABLE_NULL, 'load module error. mEngineContext=null');
      return;
    }

    if (this.params.debugMode && this.mDevSupportManager && this.rootView) {
      this.mDevSupportManager.attachToHost(this.params.context, this.rootView.getRootId());
    }

    if (!this.params.debugMode) {
      if (this.mCoreBundleLoader != null) {
        let bundlePath = this.mCoreBundleLoader.getPath()
        this.mEngineContext?.nativeRenderer?.setBundlePath(bundlePath)
        // load main js bundle
        this.mEngineContext?.getBridgeManager()?.runBundle(0, this.mCoreBundleLoader);
      } else {
        LogUtils.e('hippy', 'load module error. jsBundleLoader==null');
        this.notifyModuleLoaded(ModuleLoadStatus.STATUS_VARIABLE_NULL, "load module error. jsBundleLoader==null");
        return;
      }
    }
    if (this.moduleLoadParams) {
      this.mEngineContext.getBridgeManager()?.loadInstance(this.moduleLoadParams.componentName || '', this.rootView?.getRootId() || 0, this.moduleLoadParams.jsParams);
    }

    if (this.params.debugMode) {
      this.notifyModuleLoaded(ModuleLoadStatus.STATUS_OK, 'load module in debugMode');
    }
  }

  public getNativeRenderProvider(): NativeRenderProvider | null {
    return this.nativeRenderProvider
  }

  onEngineResume(): void {
    PixelUtil.updateDensity(this.libHippy)
    this.mEngineContext?.mEngineLifecycleEventListeners?.forEach((value: HippyEngineLifecycleEventListener) => {
      value.onEngineResume();
    });
    this.mEngineContext?.onInstanceResume();
  }

  onEnginePause(): void {
    this.mEngineContext?.mEngineLifecycleEventListeners?.forEach((value: HippyEngineLifecycleEventListener) => {
      value.onEnginePause();
    });
    this.mEngineContext?.onInstancePause();
  }

  setCustomWrappedRenderViewBuilderForCInterface(customWrappedRenderViewBuilder: WrappedHippyCustomRenderViewBuilder | null): void {
    this.nativeRenderProvider?.getNativeRenderImpl().setCustomWrappedRenderViewBuilderForCInterface(customWrappedRenderViewBuilder)
  }

}
