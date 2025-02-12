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
import { JsDriver } from '../hippy_framework/connector/JsDriver';
import { NativeCallback } from '../hippy_framework/connector/NativeCallback';
import { NativeRenderProvider } from '../renderer_native/NativeRenderProvider';
import { HippyAny, HippyArray, HippyMap } from '../support/common/HippyTypes';
import { FetchResourceCallback } from '../vfs/FetchResourceCallback';
import { ResourceDataHolder } from '../vfs/ResourceDataHolder';
import { VfsManager } from '../vfs/VfsManager';
import { FrameNode } from '@kit.ArkUI';
import { TurboModuleManager } from '../hippy_framework/modules/turbo/TurboModuleManager';
import { NodeContent } from '@ohos.arkui.node';
import { HRPosition, HRRect } from '../renderer_native/utils/HRTypes';

export interface HippyRenderViewInfo {
  tag: number
  viewName: string
}

export type CallResultCallback = (result: HippyAny) => void
export type EventListenerCallback = (event: string, params: object) => void

export interface HippyLibrary {
  Devtools_OnCreateDevtools(dataDir: string, wsUrl: string): number;
  Devtools_OnDestroyDevtools(devtoolsId: number, isReload: boolean): void;
  Devtools_OnBindDevtools(devtoolsId: number, driverId: number, domId: number, renderId: number): void;
  Devtools_OnAttachToRoot(devtoolsId: number, rootId: number): void;

  DomManager_SetRenderManager(instanceId: number, renderId: number): void;
  DomManager_CreateDomManager(domManagerNum: number): number;
  DomManager_DestroyDomManager(domManagerId: number): void;
  DomManager_CreateRoot(rootId: number, density: number): void;
  DomManager_DestroyRoot(rootId: number): void;
  DomManager_ReleaseRootResources(rootId: number): void;
  DomManager_SetDomManager(rootId: number, instanceId: number): void;

  JsDriver_CreateJsDriver(
    jsDriver: JsDriver,
    globalConfig: string,
    useLowMemoryMode: boolean,
    enableV8Serialization: boolean,
    isDevModule: boolean,
    callback: NativeCallback,
    groupId: number,
    domManagerId: number,
    v8ParamArray: Array<number> | null,
    vfsId: number,
    devtoolsId: number,
    isReload: boolean
  ): number;
  JsDriver_DestroyJsDriver(instanceId: number, useLowMemoryMode: boolean, isReload: boolean, callback: NativeCallback): void;
  JsDriver_LoadInstance(instanceId: number, buffer: ArrayBuffer): void;
  JsDriver_UnloadInstance(instanceId: number,buffer: ArrayBuffer): void;
  JsDriver_RunScriptFromUri(
    instanceId: number,
    uri: string,
    isRawfile: boolean,
    assetManager: resmgr.ResourceManager,
    resModuleName: string,
    canUseCodeCache: boolean,
    codeCacheDir: string,
    vfsId: number,
    callback: NativeCallback
  ): boolean;
  JsDriver_SetRootNode(instanceId: number, rootId: number): void;
  JsDriver_OnNativeInitEnd(instanceId: number, startTime: number, endTime: number): void;
  JsDriver_OnFirstFrameEnd(instanceId: number, rootId: number, time: number): void;
  JsDriver_OnResourceLoadEnd(
    instanceId: number,
    uri: string,
    startTime: number,
    endTime: number,
    retCode: number,
    errorMsg: string): void;
  JsDriver_CallFunction(instanceId: number, action: string, callback: NativeCallback, buffer: ArrayBuffer): void;

  NativeRenderer_CreateNativeRenderManager(enableArkCApi: boolean, renderProvider: NativeRenderProvider,
    customRenderViews: Array<string> | null, customMeasureRenderViews: Array<string> | null, mappingRenderViews: Array<string> | null,
    bundlePath: string, density: number, densityScale: number, fontSizeScale: number, isRawfile: boolean, resModuleName: string): number;
  NativeRenderer_DestroyNativeRenderManager(instanceId: number): void;
  NativeRenderer_SetBundlePath(instanceId: number, bundlePath: string): void;
  NativeRenderer_InitRendererParams(statusBarHeight: number): void;
  NativeRenderer_RegisterFontPaths(instanceId: number, fontFamilyAndPaths: Array<string>): void;

  NativeRenderProvider_UpdateRootSize(instanceId: number, rootId: number, width: number, height: number): void;
  NativeRenderProvider_UpdateNodeSize(instanceId: number, rootId: number, nodeId: number, width: number, height: number, isSync: boolean): void;
  NativeRenderProvider_OnReceivedEvent(instanceId: number, rootId: number, nodeId: number, eventName: string, buffer: ArrayBuffer | null, useCapture: boolean, useBubble: boolean): void;
  NativeRenderProvider_DoCallBack(instanceId: number, result: number, functionName: string, rootId: number, nodeId: number, callbackId: number, buffer: ArrayBuffer | null): void;
  NativeRenderProvider_DoMeasureText(instanceId: number, props:string[] | null, width: number, widthMode: number, height: number, heightMode: number): number[];

  NativeRenderProvider_BindNativeRoot(content: NodeContent, instanceId: number, rootId: number, nodeId: number): void;
  NativeRenderProvider_UnbindNativeRoot(instanceId: number, rootId: number, nodeId: number): void;
  NativeRenderProvider_DestroyRoot(instanceId: number, rootId: number): void;
  NativeRenderProvider_DoCallbackForCallCustomTsView(instanceId: number, rootId: number, nodeId: number, callbackId: number, result: HippyAny): void;
  NativeRenderProvider_GetViewParent(instanceId: number, rootId: number, nodeId: number): HippyRenderViewInfo | null;
  NativeRenderProvider_GetViewChildren(instanceId: number, rootId: number, nodeId: number): Array<HippyRenderViewInfo> | null;
  NativeRenderProvider_CallViewMethod(instanceId: number, rootId: number, nodeId: number, method: string, params: HippyArray, callback: CallResultCallback | null): void;
  NativeRenderProvider_SetViewEventListener(instanceId: number, rootId: number, nodeId: number, callback: EventListenerCallback | null): void
  NativeRenderProvider_GetViewFrameInRoot(instanceId: number, rootId: number, nodeId: number): HRRect | null
  NativeRenderProvider_AddBizViewInRoot(instanceId: number, rootId: number, biz_view_id: number, frameNode: FrameNode, x: number, y: number): void
  NativeRenderProvider_RemoveBizViewInRoot(instanceId: number, rootId: number, biz_view_id: number): void

  VfsManager_CreateVfs(vfsDelegate: VfsManager): number;
  VfsManager_DestroyVfs(instanceId: number): void;
  VfsManager_OnJniDelegateCallback(holder: ResourceDataHolder): void;
  VfsManager_OnJniDelegateInvokeProgress(callbackId: number, total: number, loaded: number): void;
  VfsManager_OnJniDelegateInvokeAsync(id: number, holder: ResourceDataHolder, callback: FetchResourceCallback): void;
  VfsManager_OnJniDelegateInvokeSync(id: number, holder: ResourceDataHolder): void;

  TurboModuleManager_Install(turbo: TurboModuleManager, v8RuntimeId: number): void;

  Setting_SetFlags(enableUpdateAnimLog: boolean): void;
  Setting_SetDensity(density: number): void;
  Setting_SetDensityScale(densityScale: number): void;
  Setting_SetFontSizeScale(fontSizeScale: number): void;
}
