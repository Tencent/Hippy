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
import { HippyLibrary } from '../hippy_library/HippyLibrary';
import { NativeRenderContext } from '../renderer_native/NativeRenderContext';
import { NativeRenderProvider } from '../renderer_native/NativeRenderProvider';
import { HippyAny, HippyMap } from '../support/common/HippyTypes';
import { DefaultDeviceAdapter } from './adapter/device/DefaultDeviceAdapter';
import { HippyDeviceAdapter } from './adapter/device/HippyDeviceAdapter';
import { DefaultExceptionHandler } from './adapter/exception/DefaultExceptionHandler';
import { HippyExceptionHandlerAdapter } from './adapter/exception/HippyExceptionHandlerAdapter';
import { DefaultExecutorSupplierAdapter } from './adapter/executor/DefaultExecutorSupplierAdapter';
import { HippyExecutorSupplierAdapter } from './adapter/executor/HippyExecutorSupplierAdapter';
import { DefaultFontAdapter } from './adapter/font/DefaultFontAdapter';
import { DefaultHttpAdapter } from './adapter/http/DefaultHttpAdapter';
import { HippyHttpAdapter } from './adapter/http/HippyHttpAdapter';
import { DefaultLogAdapter } from './adapter/log/DefaultLogAdapter';
import { HippyLogAdapter } from './adapter/log/HippyLogAdapter';
import { DefaultEngineMonitorAdapter } from './adapter/monitor/DefaultEngineMonitorAdapter';
import { HippyEngineMonitorAdapter } from './adapter/monitor/HippyEngineMonitorAdapter';
import { DefaultSoLoaderAdapter } from './adapter/soloader/DefaultSoLoaderAdapter';
import { HippySoLoaderAdapter } from './adapter/soloader/HippySoLoaderAdapter';
import { DefaultStorageAdapter } from './adapter/storage/DefaultStorageAdapter';
import { HippyStorageAdapter } from './adapter/storage/HippyStorageAdapter';
import { PreferencesStorageAdapter } from './adapter/storage/PreferencesStorageAdapter';
import { HippyThirdPartyAdapter } from './adapter/thirdparty/HippyThirdPartyAdapter';
import { HippyBundleLoader } from './bridge/bundleloader/HippyBundleLoader';
import { HippyAPIProvider } from './bridge/HippyAPIProvider';
import { HippyEngineManagerImpl } from './HippyEngineManagerImpl';
import { HippyEngineContext } from './HippyEngineContext'
import { HippyFileAdapter } from './adapter/file/HippyFileAdapter';
import { FileRequestAdapter } from './adapter/file/FileRequestAdapter';
import { LogUtils } from '../support/utils/LogUtils';
import { HippyRootView } from '../renderer_native';
import { WrappedHippyCustomRenderViewBuilder } from '../renderer_native/HippyRenderViewBuilder';
import { HippyFontAdapter } from './adapter/font/HippyFontAdapter';
import { HippyJsException } from './common/HippyJsException';

export interface HippyEngine {
  initEngine(listener: EngineListener): void

  loadModule(loadParams: ModuleLoadParams): HippyRootView | null
  loadModuleWithListener(loadParams: ModuleLoadParams, listener: ModuleListener | null): HippyRootView | null

  destroyModule(rootId: number, destroyCallback: HippyModuleDestroyCallback): void

  destroyEngine(): void

  getNativeRenderProvider(): NativeRenderProvider | null

  onBackPressed(handler: BackPressHandler): boolean

  getHippyEngineContext(): HippyEngineContext | null

  sendEvent(event: string, params: HippyAny): void;

  onEngineResume(): void;

  onEnginePause(): void;
}

export function createHippyEngine(params: EngineInitParams): HippyEngine {
  params.check()
  LogUtils.enableDebugLog(params.enableLog)
  params.libHippy?.Setting_SetFlags(params.enableUpdateAnimLog);
  return new HippyEngineManagerImpl(params)
}

export type HippyModuleDestroyCallback = (result: boolean) => void

export class V8InitParams {
  public initialHeapSize: number = 0;
  public maximumHeapSize: number = 0;
}

export enum EngineState {
  UNINIT = 0,
  INITING = 1,
  ONRESTART = 2,
  INITERRORED = 3,
  INITED = 4,
  DESTROYED = 5,
}


export class EngineInitParams {
  libHippy: HippyLibrary
  // 必须 宿主（Hippy的使用者）的UIAbilityContext
  public context: Context;
  // 必须 宿主（Hippy的使用者）的UIContext，当CApi创建自定义ts组件或WebView组件时需要
  // 1 默认使用CApi，enableArkCApi开关控制；WebView的支持类似自定义ts组件;
  // 2 需要外部设置，是因为外部可在创建HippyRoot组件前提前创建view，这时候Hippy内部没创建过ts组件拿不到；
  public uiContext: UIContext | null;
  // 可选参数 true:资源文件来自rawfile目录; false:资源文件来自resfile目录
  public isLoadFromRawfile: boolean = true;
  // 可选参数 资源文件来自resfile目录时，资源文件所在模块的名字，比如某个hsp模块
  public resModuleName: string = "entry";
  // 可选参数 核心的jsbundle的assets路径（assets路径和文件路径二选一，优先使用assets路径），debugMode = false时有效
  public coreJSAssetsPath: string = '';
  // 可选参数 核心的jsbundle的文件路径（assets路径和文件路径二选一，优先使用assets路径）,debugMode = false时有效
  public coreJSFilePath: string = '';
  // 可选参数 指定需要预加载的业务模块bundle assets路径
  public jsPreloadAssetsPath: HippyBundleLoader | null = null;
  // 可选参数 指定需要预加载的业务模块bundle 文件路径
  public jsPreloadFilePath: HippyBundleLoader | null = null;
  public debugMode = false;
  // 可选参数 是否开启调试模式，默认为false，不开启
  // 可选参数 Hippy Server的jsbundle名字，默认为"index.bundle"。debugMode = true时有效
  public debugBundleName = "index.bundle";
  // 可选参数 Hippy Server的Host。默认为"localhost:38989"。debugMode = true时有效
  public debugServerHost = "localhost:38989";
  // optional args, Hippy Server url using remote debug in no usb (if not empty will replace debugServerHost and debugBundleName). debugMode = true take effect
  public remoteServerUrl = "";
  // 可选参数 自定义的，用来提供Native modules、JavaScript modules、View controllers的管理器。1个或多个
  public providers: Array<HippyAPIProvider> | null = null;
  // public processors: Array<Processor> | null = null;
  // Optional  is use V8 serialization or json
  public enableV8Serialization = false;
  // 可选参数 是否打印引擎的完整的log。默认为false
  public enableLog = false;
  // 可选参数 是否打印更新动画的log。默认为true
  public enableUpdateAnimLog = true;
  // 可选参数 code cache的名字，如果设置为空，则不启用code cache，默认为 ""
  public codeCacheTag = "";
  //可选参数 接收RuntimeId
  public thirdPartyAdapter: HippyThirdPartyAdapter | null = null;
  // 可选参数 接收异常
  public exceptionHandler: HippyExceptionHandlerAdapter | null = null;
  // 可选参数 设置相关
  public preferencesStorageAdapter: PreferencesStorageAdapter | null = null;
  // 可选参数 Http request adapter
  public httpAdapter: HippyHttpAdapter | null = null;
  // 可选参数 file request adapter
  public fileAdapter: HippyFileAdapter | null = null;
  // 可选参数 Storage adapter 设置相关
  public storageAdapter: HippyStorageAdapter | null = null;
  // 可选参数 Executor Supplier adapter
  public executorSupplier: HippyExecutorSupplierAdapter | null = null;
  // 可选参数 Engine Monitor adapter
  public engineMonitor: HippyEngineMonitorAdapter | null = null;
  // 可选参数 font adapter
  public fontAdapter: HippyFontAdapter | null = null;
  // 可选参数 so加载位置
  public soLoader: HippySoLoaderAdapter | null = null;
  // 可选参数 device adapter
  public deviceAdapter: HippyDeviceAdapter | null = null;
  // 设置Hippy引擎的组，同一组的HippyEngine，会共享C层的v8 引擎实例。 默认值为-1（无效组，即不属于任何group组）
  public groupId = -1;
  // 可选参数 日志输出
  public logAdapter: HippyLogAdapter | null = null;
  public v8InitParams: V8InitParams | null = null;
  public enableTurbo = false;
  public enableArkCApi: boolean = true;
  // 可选参数 是否集成JS引擎功能
  public integrateJSEngine: boolean = true;
  // 可选参数 domManager并行数量，即dom多线程的数量，默认只有1个dom线程
  public domManagerConcurrentNum: number = 1;

  constructor(
    libHippy: HippyLibrary,
    context: Context,
    uiContext: UIContext | null
  ) {
    this.libHippy = libHippy
    this.context = context
    this.uiContext = uiContext
    if (uiContext) {
      AppStorage.setOrCreate<UIContext>('UIContextForHippy', uiContext)
    }
  }

  check() {
    if (this.httpAdapter === null) {
      this.httpAdapter = new DefaultHttpAdapter()
    }
    if (this.fontAdapter === null) {
      this.fontAdapter = new DefaultFontAdapter()
    }
    if (this.storageAdapter === null) {
      this.storageAdapter = new DefaultStorageAdapter(this.context)
    }
    if (this.soLoader === null) {
      this.soLoader = new DefaultSoLoaderAdapter()
    }
    if (this.exceptionHandler === null) {
      this.exceptionHandler = new DefaultExceptionHandler()
    }
    if (this.executorSupplier === null) {
      this.executorSupplier = new DefaultExecutorSupplierAdapter()
    }
    if (this.deviceAdapter === null) {
      this.deviceAdapter = new DefaultDeviceAdapter()
    }
    if (this.logAdapter === null) {
      this.logAdapter = new DefaultLogAdapter()
    }
    if (this.engineMonitor === null) {
      this.engineMonitor = new DefaultEngineMonitorAdapter()
    }
    if (this.preferencesStorageAdapter === null) {
      this.preferencesStorageAdapter = new PreferencesStorageAdapter(this.context)
    }
    if (this.fileAdapter === null) {
      this.fileAdapter = new FileRequestAdapter(this.context);
    }
  }
}

export enum HippyLayoutEngineType {
  Default = 0,
  Taitank = 1,
  Yoga = 2
}

// Hippy 业务模块jsbundle加载时的参数设置
export class ModuleLoadParams {
  // 必须参数
  // public context: Context;
  /**
   * 必须参数 业务模块jsbundle中定义的组件名称。componentName对应的是js文件中的"appName"，比如： var hippy = new Hippy({
   * appName: "Demo", entryPage: App });
   */
  public componentName: string;
  // 可选参数 二选一设置 自己开发的业务模块的jsbundle的assets路径（assets路径和文件路径二选一，优先使用assets路径）
  public jsAssetsPath: string;
  // 可选参数 二选一设置 自己开发的业务模块的文件路径（assets路径和文件路径二选一，优先使用assets路径）
  public jsFilePath: string;
  // 可选参数 传递给前端的rootview：比如：Hippy.entryPage: class App extends Component
  public jsParams: HippyMap | null = null;
  // 可选参数 目前只有一个用处：映射："CustomViewCreator" <==> 宿主自定义的一个HippyCustomViewCreator(这个creator还得通过ModuleParams.Builder.setCustomViewCreator来指定才行)
  public nativeParams: HippyMap | null = null;
  // 可选参数 Bundle加载器，老式用法，不建议使用（若一定要使用，则会覆盖jsAssetsPath，jsFilePath的值）。参见jsAssetsPath，jsFilePath
  // 可选参数 code cache的名字，如果设置为空，则不启用code cache，默认为 ""
  public codeCacheTag = "";
  public bundleLoader: HippyBundleLoader | null = null;

  public wrappedCustomRenderViewBuilder: WrappedHippyCustomRenderViewBuilder | null = null;

  public layoutEngineType: HippyLayoutEngineType = HippyLayoutEngineType.Default

  public constructor(
    jsAssetsPath = '',
    jsFilePath = '',
    componentName = '',
    codeCacheTag = '',
    jsParams: HippyMap | null,
    nativeParams: HippyMap | null,
    bundleLoader: HippyBundleLoader | null,
  ) {
    this.jsAssetsPath = jsAssetsPath;
    this.jsFilePath = jsFilePath;
    this.componentName = componentName;
    this.jsParams = jsParams;
    this.nativeParams = nativeParams;
    this.codeCacheTag = codeCacheTag;
    this.bundleLoader = bundleLoader;
  }
}

export interface BackPressHandler {
  handleBackPress(): void
}

export enum EngineInitStatus {
  STATUS_OK = 0,                // 加载正常
  STATUS_ERR_BRIDGE = -101,     // 初始化过程，initBridge错误
  STATUS_ERR_DEVSERVER = -102,  // 初始化过程，devServer错误
  STATUS_WRONG_STATE = -103,    // 状态错误。调用init函数时，引擎不在未初始化的状态
  STATUS_INIT_EXCEPTION = -104, // 初始化过程，抛出了未知的异常，详情需要查看传回的Throwable
}

export enum ModuleLoadStatus {
  STATUS_OK = 0,                // 加载正常
  STATUS_ENGINE_UNINIT = -201,  // 引擎未完成初始化就加载JSBundle
  STATUS_VARIABLE_NULL = -202,  // check变量(bundleUniKey, loader, rootView)引用为空
  STATUS_ERR_RUN_BUNDLE = -203, // 业务JSBundle执行错误
  STATUS_REPEAT_LOAD = -204,    // 重复加载同一JSBundle
}

export interface EngineListener {
  /**
   * callback after initialization
   *
   * @param statusCode status code from initializing procedure
   * @param msg Message from initializing procedure
   */
  onInitialized(statusCode: EngineInitStatus, msg: string): void;
}

export interface ModuleListener {

  onLoadCompleted(statusCode: ModuleLoadStatus, msg: string): void;

  onJsException(exception: HippyJsException): boolean;

  onFirstViewAdded(): void;

  onFirstContentfulPaint(): void;
}
