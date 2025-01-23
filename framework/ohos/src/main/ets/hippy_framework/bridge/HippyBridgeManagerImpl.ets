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
import { BinaryWriter } from '../../serialization/writer/BinaryWriter';
import { HippyAny,
  HippyArray,
  HippyMap, HippyValue } from '../../support/common/HippyTypes';
import { ArgumentUtils } from '../../support/utils/ArgumentUtils';
import { DimensionsUtil } from '../../support/utils/DimensionsUtil';
import { I18nUtil } from '../../support/utils/I18nUtil';
import { LogUtils } from '../../support/utils/LogUtils';
import { TimeMonitor } from '../../support/utils/TimeMonitor';
import { HippyThirdPartyAdapter } from '../adapter/thirdparty/HippyThirdPartyAdapter';
import { HippyJsException } from '../common/HippyJsException';
import { JsDriver } from '../connector/JsDriver';
import { NativeCallback } from '../connector/NativeCallback';
import { ModuleLoadStatus, V8InitParams } from '../HippyEngine';
import { HippyEngineContext } from '../HippyEngineContext';
import { TurboModuleManager } from '../modules/turbo/TurboModuleManager';
import { Serializer } from '../serialization/Serializer';
import { HippyBundleLoader } from './bundleloader/HippyBundleLoader';
import { BridgeCallback } from './HippyBridge';
import { HippyBridgeImpl } from './HippyBridgeImpl';
import { HippyBridgeManager } from './HippyBridgeManager';
import { HippyCallNativeParams } from './HippyCallNativeParams';
import { util } from '@kit.ArkTS';

export enum BridgeState {
  UNINITIALIZED = 0,
  INITIALIZED = 1,
  DESTROYED = 2,
}

export class HippyBridgeManagerImpl implements HippyBridgeManager, BridgeCallback {
  // Bridge Status
  public static MSG_CODE_INIT_BRIDGE = 10;
  public static MSG_CODE_RUN_BUNDLE = 11;
  public static MSG_CODE_CALL_FUNCTION = 12;
  public static MSG_CODE_DESTROY_BRIDGE = 13;
  public static MSG_CODE_ON_BRIDGE_DESTROYED = 14;
  // Instance Status
  public static FUNCTION_ACTION_LOAD_INSTANCE = 1;
  public static FUNCTION_ACTION_RESUME_INSTANCE = 2;
  public static FUNCTION_ACTION_PAUSE_INSTANCE = 3;
  public static FUNCTION_ACTION_DESTROY_INSTANCE = 4;
  public static FUNCTION_ACTION_CALLBACK = 5;
  public static FUNCTION_ACTION_CALL_JS_MODULE = 6;
  public static FUNCTION_ACTION_ON_WEBSOCKET_MESSAGE = 7;
  // Bridge Type
  public static BRIDGE_TYPE_SINGLE_THREAD = 2;
  public static BRIDGE_TYPE_NORMAL = 1;
  // Destroy Type
  public static DESTROY_CLOSE = 0;
  public static DESTROY_RELOAD = 1;
  public mContext: HippyEngineContext;
  public mCoreBundleLoader: HippyBundleLoader | null;
  public mEnableV8Serialization: boolean;
  public mIsDevModule: boolean;
  public mDebugServerHost: string;
  public mGroupId: number;
  public mThirdPartyAdapter: HippyThirdPartyAdapter | null;
  public mV8InitParams: V8InitParams | null;
  public mJsDriver: JsDriver;
  public mHippyBridge: HippyBridgeImpl;
  public mBridgeState: BridgeState = BridgeState.UNINITIALIZED;
  public libHippy: HippyLibrary;

  public constructor(
    context: HippyEngineContext,
    libHippy: HippyLibrary,
    coreBundleLoader: HippyBundleLoader | null,
    enableV8Serialization: boolean,
    isDevModule: boolean,
    debugServerHost: string,
    groupId: number,
    thirdPartyAdapter: HippyThirdPartyAdapter | null,
    v8InitParams: V8InitParams | null,
    jsDriver: JsDriver) {

    this.mContext = context;
    this.libHippy = libHippy;
    this.mCoreBundleLoader = coreBundleLoader;
    this.mGroupId = groupId;
    this.mThirdPartyAdapter = thirdPartyAdapter;
    this.mEnableV8Serialization = enableV8Serialization;
    this.mIsDevModule = isDevModule;
    this.mDebugServerHost = debugServerHost;
    this.mJsDriver = jsDriver;
    this.mV8InitParams = v8InitParams;
    this.mHippyBridge = new HippyBridgeImpl(
      context,
      this,
      enableV8Serialization,
      isDevModule,
      debugServerHost,
      v8InitParams,
      jsDriver);
  }

  resumeInstance(id: number): void {
    let map = new Map<string, HippyAny>()
    map.set("id", id)
    const buffer = this.getSerializerBuffer(map);
    this.mHippyBridge.callFunction(HippyBridgeManagerImpl.FUNCTION_ACTION_RESUME_INSTANCE, this.callFunctionCallback, buffer);
  }

  pauseInstance(id: number): void {
    let map = new Map<string, HippyAny>()
    map.set("id", id)
    const buffer = this.getSerializerBuffer(map);
    this.mHippyBridge.callFunction(HippyBridgeManagerImpl.FUNCTION_ACTION_PAUSE_INSTANCE, this.callFunctionCallback, buffer);
  }

  destroyInstance(id: number): void {
    let map = new Map<string, HippyAny>()
    map.set("id", id)
    const buffer = this.getSerializerBufferBinary(map);
    this.mHippyBridge.callFunction(HippyBridgeManagerImpl.FUNCTION_ACTION_DESTROY_INSTANCE, this.callFunctionCallback, buffer);
  }

  loadInstance(name: string, id: number, params: HippyMap) {
    // add first paint perf log
    const timeMonitor = this.mContext.getMonitor()
    timeMonitor.beginGroup(TimeMonitor.MONITOR_GROUP_PAINT);
    timeMonitor.addPoint(TimeMonitor.MONITOR_GROUP_PAINT, TimeMonitor.MONITOR_POINT_FIRST_PAINT);

    let map = new Map<string, HippyAny>()
    map.set("name", name)
    map.set("id", id)
    map.set("params", params)

    const buffer = this.getSerializerBufferBinary(map);
    this.mHippyBridge.callFunction(HippyBridgeManagerImpl.FUNCTION_ACTION_LOAD_INSTANCE, this.callFunctionCallBack, buffer)
  }

  callFunctionCallBack = (result: number, reason: string) => {
    LogUtils.i('hippy', 'hippy callFunctionCallBack, result: ' + result + ', reason: ' + reason)
  }

  getSerializerBuffer(params: Map<string, HippyAny>): Uint8Array {
    if (this.mEnableV8Serialization) {
      return this.getSerializerBufferBinary(params);
    } else {
      return this.getSerializerBufferJson(params);
    }
  }

  getSerializerBufferJson(params: Map<string, HippyAny>): Uint8Array {
    let str = JSON.stringify(ArgumentUtils.mapToRecord(params))
    let encoder = new util.TextEncoder("utf-8")
    let uint8Array = encoder.encodeInto(str)
    return uint8Array
  }

  getSerializerBufferBinary(params: Map<string, HippyAny>): Uint8Array {
    let binaryWriter = new BinaryWriter()
    let serializer = new Serializer(binaryWriter)
    serializer.writeHeader()
    serializer.writeValue(params)
    let buffer = binaryWriter.chunked()
    return buffer;
  }

  execPromiseCallback(params: Map<string, HippyAny>): void {
    if (this.mBridgeState == BridgeState.INITIALIZED) {
      const buffer = this.getSerializerBuffer(params);
      this.mHippyBridge.callFunction(HippyBridgeManagerImpl.FUNCTION_ACTION_CALLBACK, this.callFunctionCallback, buffer);
    }
  }

  public onBridgeDestroyed(isReload: boolean) {
    this.mContext.onBridgeDestroyed(isReload);
  }

  public callFunctionCallback = (result: number, reason: string) => {
    LogUtils.i('hippy', 'hippy callFunctionCallback, result: ' + result + ', reason: ' + reason);
  }

  destroyBridge(isReload: boolean): void {
    this.mHippyBridge.destroy((result: number, reason: string) => {
      LogUtils.i('hippy', 'hippy destroyBridge, result: ' + result + ', reason: ' + reason);
      this.onBridgeDestroyed(isReload);
    }, isReload);
    this.destroy();
  }

  destroy(): void {
    this.mBridgeState = BridgeState.DESTROYED;
  }

  callJavaScriptModule(moduleName: string, methodName: string, params: HippyAny): void {
    if (this.mBridgeState == BridgeState.INITIALIZED) {
      let map = new Map<string, HippyAny>()
      map.set("moduleName", moduleName)
      map.set("methodName", methodName)
      map.set("params", params)

      const buffer = this.getSerializerBuffer(map);
      this.mHippyBridge.callFunction(HippyBridgeManagerImpl.FUNCTION_ACTION_CALL_JS_MODULE, this.callJavaScriptModuleCallback, buffer);
    }
  }

  public callJavaScriptModuleCallback = (result: number, reason: string) => {
    LogUtils.i('hippy', 'hippy callJavaScriptModuleCallback, result: ' + result + ', reason: ' + reason)
  }

  getThirdPartyAdapter(): HippyThirdPartyAdapter | null {
    return this.mThirdPartyAdapter;
  }

  callNatives(moduleName: string, moduleFunc: string, callId: string, params: ArrayBuffer): void {
    if (this.mContext != null) {
      const moduleManager = this.mContext.getModuleManager();
      if (moduleManager != null) {
        LogUtils.i('hippy', 'HippyBridgeManagerImpl callNatives params, '
          + moduleName + ' - '
          + moduleFunc + ' - '
          + callId + ' - '
          + params);
        const callNativeParams = new HippyCallNativeParams(moduleName, moduleFunc, callId, params);
        moduleManager.callNatives(callNativeParams);
      }
    }
  }

  reportException(message: string, stackTrace: string): void {
    if (this.mContext != null) {
      this.mContext.handleException(new HippyJsException(message, stackTrace));
    }
  }

  async initBridge(initBridgeCallback: NativeCallback, isReload: boolean): Promise<void> {
    this.mHippyBridge.initJSBridge(
      await this.getGlobalConfigsString(),
      (result: number, reason: string) => {
        this.initJSBridgeCallback(result, reason, initBridgeCallback);
      },
      this.mGroupId,
      isReload
    );
  }

  initJSBridgeCallback(result: number, reason: string, initBridgeCallback: NativeCallback): void {
    LogUtils.i('hippy', 'jsDriver initialize callback, instanceId: %{public}d' + this.mJsDriver.instanceId);
    if (result != 0) {
      LogUtils.e('hippy', 'jsDriver initialize error, result: ' + result + ', reason: ' + reason);
    }

    if (this.mContext != null) {
      this.mContext.reloadRootView();
    }
    if (this.enableTurbo()) {
      const mTurboModuleManager = new TurboModuleManager(this.mContext, this.libHippy);
      mTurboModuleManager.install(this.mHippyBridge.getV8RuntimeId());
    }
    // if (mThirdPartyAdapter != null) {
    //   mThirdPartyAdapter.onRuntimeInit(runtimeId);
    // }
    if (this.mCoreBundleLoader != null) {
      const timeMonitor = this.mContext.getMonitor();
      // add load vendor js perf log
      timeMonitor.addPoint(TimeMonitor.MONITOR_GROUP_INIT_ENGINE, TimeMonitor.MONITOR_POINT_LOAD_VENDOR_JS);
      this.mCoreBundleLoader.load(this.mHippyBridge, (result: number, reason: string) => {
          this.loadVendorJSCallback(result, reason, initBridgeCallback);
      });
    } else {
      this.mBridgeState = BridgeState.INITIALIZED;
      initBridgeCallback(1, '');
    }
  }

  public loadVendorJSCallback = (result: number, reason: string, initBridgeCallback: NativeCallback) => {
    if (this.mBridgeState == BridgeState.DESTROYED) {
      return;
    }
    if (result == 0) {
      this.mBridgeState = BridgeState.INITIALIZED;
    } else {
      throw new Error("load coreJsBundle failed, check your core jsBundle:" + reason);
    }
    const timeMonitor = this.mContext.getMonitor();
    // end init engine perf
    timeMonitor.endGroup(TimeMonitor.MONITOR_GROUP_INIT_ENGINE);
    initBridgeCallback(result, reason);
  }

  runBundle(id: number, loader: HippyBundleLoader): void {
    // add load main js perf log
    const timeMonitor = this.mContext.getMonitor();
    timeMonitor.beginGroup(TimeMonitor.MONITOR_GROUP_RUN_BUNDLE);
    timeMonitor.addPoint(TimeMonitor.MONITOR_GROUP_RUN_BUNDLE, TimeMonitor.MONITOR_POINT_LOAD_MAIN_JS);
    loader.load(this.mHippyBridge, (result: number, reason: string) => {
      this.runBundleCallback(result, reason);
    });
  }

  runBundleCallback = (result: number, reason: string) => {
    LogUtils.i('hippy', 'hippy bundleLoaderCallback, result: ' + result + ', reason: ' + reason)
    if (this.mContext) {
      if (result === 0) {
        this.mContext.onLoadModuleCompleted(ModuleLoadStatus.STATUS_OK, 'load module success')
      } else {
        this.mContext.onLoadModuleCompleted(ModuleLoadStatus.STATUS_ERR_RUN_BUNDLE, 'load module error. loader.load failed. check the file!!')
      }
      const timeMonitor = this.mContext.getMonitor();
      timeMonitor.endGroup(TimeMonitor.MONITOR_GROUP_RUN_BUNDLE);
      timeMonitor.beginGroup(TimeMonitor.MONITOR_GROUP_PAINT);
      timeMonitor.addPoint(TimeMonitor.MONITOR_GROUP_PAINT, TimeMonitor.MONITOR_POINT_FIRST_PAINT);
    }
  }

  async getGlobalConfigsString(): Promise<string> {
    let context = this.mContext.getGlobalConfigs().getContext();
    if (context == null) return ""
    let globalParams = new Map<string, HippyAny>()
    let dimensionMap = await DimensionsUtil.getDimensions(-1, -1, context, true);
    if (this.mContext.getGlobalConfigs() != null
      && this.mContext.getGlobalConfigs().getDeviceAdapter() != null) {
      this.mContext.getGlobalConfigs()
        .getDeviceAdapter()?.reviseDimensionIfNeed(context, dimensionMap, false,
        false);
    }
    DimensionsUtil.convertDimensionsToDp(dimensionMap);
    globalParams.set("Dimensions", dimensionMap)

    let packageName = ""
    let versionName = ""
    let pageUrl = ""
    let nightMode = false
    let extraDataMap = new Map<string, HippyValue>()

    let platformParams = new Map<string, HippyAny>()
    platformParams.set("OS", "ohos")
    platformParams.set("PackageName", (packageName == null) ? "" : packageName)
    platformParams.set("VersionName", (versionName == null) ? "" : versionName)
    platformParams.set("APILevel", 0)
    platformParams.set("NightMode", nightMode)
    platformParams.set("SDKVersion", "")

    let localization = new Map<string, HippyValue>()
    localization.set("language", I18nUtil.getLanguage())
    localization.set("country", I18nUtil.getCountry())
    localization.set("direction", I18nUtil.getLayoutDirection())
    platformParams.set("Localization", localization)

    globalParams.set("Platform", platformParams)

    let host = new Map<string, HippyAny>()
    host.set("url", (pageUrl == null) ? "" : pageUrl)
    host.set("appName", (packageName == null) ? "" : packageName)
    host.set("appVersion", (versionName == null) ? "" : versionName)
    host.set("nightMode", nightMode)
    host.set("extra", extraDataMap)
    globalParams.set("HostConfig", host)

    return JSON.stringify(ArgumentUtils.mapToRecord(globalParams));
  }

  private enableTurbo(): boolean {
    return this.mContext.getGlobalConfigs() != null && this.mContext.getGlobalConfigs().enableTurbo();
  }
}
