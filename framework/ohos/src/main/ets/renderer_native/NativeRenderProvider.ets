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
import { BinaryReader } from '../serialization/reader/BinaryReader'
import { NativeRenderImpl } from './NativeRenderImpl';
import { NativeRenderDeserializer } from './serialization/NativeRenderDeserializer'
import { BinaryWriter } from '../serialization/writer/BinaryWriter';
import { NativeRenderSerializer } from './serialization/NativeRenderSerializer';
import { NativeRenderProviderManager } from './NativeRenderProviderManager';
import { HREventType } from './utils/HREventUtils';
import { LogUtils } from '../support/utils/LogUtils';
import { HippyLibrary } from '../hippy_library/HippyLibrary';
import { HippyAny, HippyMap, HippyResource, HippyValue } from '../support/common/HippyTypes';
import { HRRenderViewCreator } from './components/HippyRenderRegisterMap';
import {
  CallRenderViewMethodParamsForCApi,
  CreateRenderViewParamsForCApi,
  OnChildInsertedParamsForCApi,
  OnChildRemovedParamsForCApi,
  RemoveRenderViewParamsForCApi,
  SetRenderViewFrameParamsForCApi,
  UpdateEventListenerParamsForCApi,
  UpdatePropsParamsForCApi} from './NativeRenderBuilderForCApi';
import { componentSnapshot, componentUtils, display, FrameNode } from '@kit.ArkUI';
import { image } from '@kit.ImageKit';
import { util } from '@kit.ArkTS';

interface HippyResult {
  screenShot?: string;
  width?: bigint;
  height?: bigint;
  screenScale?: number;
}

export class NativeRenderProvider {
  private readonly TAG = "NativeRenderProvider"
  private readonly EVENT_PREFIX = "on"

  private libHippy: HippyLibrary
  private renderImpl: NativeRenderImpl
  private instanceId: number = 0
  private hippyResult: HippyResult = {
    screenShot: '',
    width: BigInt(0),
    height: BigInt(0),
    screenScale: 0
  };

  constructor(libHippy: HippyLibrary, enableArkCApi: boolean,
      customRenderViewCreatorMap: Map<string, HRRenderViewCreator> | null,
      customMeasureRenderViews: Array<string> | null) {
    this.libHippy = libHippy
    this.renderImpl = new NativeRenderImpl(libHippy, enableArkCApi, customRenderViewCreatorMap, customMeasureRenderViews)
  }

  setInstanceId(instanceId: number) {
    this.instanceId = instanceId
    this.renderImpl.setInstanceId(instanceId)
    NativeRenderProviderManager.addRenderProvider(instanceId, this)
  }

  getInstanceId(): number {
    return this.instanceId
  }

  getNativeRenderImpl(): NativeRenderImpl {
    return this.renderImpl
  }

  destroy() {
    NativeRenderProviderManager.removeRenderProvider(this.instanceId)
  }

  bytesToArgument(buffer: ArrayBuffer): Array<HippyAny> {
    let binaryReader = new BinaryReader(new Uint8Array(buffer))
    let deserializer = new NativeRenderDeserializer(binaryReader, null)
    deserializer.readHeader()
    let paramsObj = deserializer.readValue() as Array<HippyAny>

    // debug code
    // deserializer.printValue(paramsObj, '', '')

    return (paramsObj instanceof Array) ? paramsObj : new Array<HippyAny>()
  }

  argumentToBytes(params: HippyAny): ArrayBuffer {
    let binaryWriter = new BinaryWriter()
    let serializer = new NativeRenderSerializer(binaryWriter)
    serializer.writeHeader()
    serializer.writeValue(params)
    return binaryWriter.chunked().buffer
  }

  createNode(rootId: number, buffer: ArrayBuffer) {
    try {
      let nodeList = this.bytesToArgument(buffer)
      this.renderImpl.createNode(rootId, nodeList)
    } catch (e) {
      this.renderImpl.handleRenderException(e)
    }
  }

  updateNode(rootId: number, buffer: ArrayBuffer) {
    try {
      let nodeList = this.bytesToArgument(buffer)
      this.renderImpl.updateNode(rootId, nodeList)
    } catch (e) {
      this.renderImpl.handleRenderException(e)
    }
  }

  moveNode(rootId: number, pid: number, buffer: ArrayBuffer) {
    try {
      let nodeList = this.bytesToArgument(buffer)
      this.renderImpl.moveNode(rootId, pid, nodeList)
    } catch (e) {
      this.renderImpl.handleRenderException(e)
    }
  }

  moveNode2(rootId: number, id_array: Array<number>, to_pid: number, from_pid: number, index: number) {
    try {
      this.renderImpl.moveNode2(rootId, id_array, to_pid, from_pid, index)
    } catch (e) {
      this.renderImpl.handleRenderException(e)
    }
  }

  deleteNode(rootId: number, id_array: Array<number>) {
    try {
      this.renderImpl.deleteNode(rootId, id_array)
    } catch (e) {
      this.renderImpl.handleRenderException(e)
    }
  }

  updateLayout(rootId: number, buffer: ArrayBuffer) {
    try {
      let nodeList = this.bytesToArgument(buffer)
      this.renderImpl.updateLayout(rootId, nodeList)
    } catch (e) {
      this.renderImpl.handleRenderException(e)
    }
  }

  endBatch(rootId: number) {
    try {
      this.renderImpl.endBatch(rootId)
    } catch (e) {
      this.renderImpl.handleRenderException(e)
    }
  }

  updateEventListener(rootId: number, buffer: ArrayBuffer) {
    try {
      let eventList = this.bytesToArgument(buffer)
      this.renderImpl.updateEventListener(rootId, eventList)
    } catch (e) {
      this.renderImpl.handleRenderException(e)
    }
  }

  callUIFunction(rootId: number, nodeId: number, callbackId: number, functionName: string, buffer: ArrayBuffer) {
    try {
      let params = this.bytesToArgument(buffer)
      // If callbackId equal to 0 mean this call does not need to callback.
      this.renderImpl.callUIFunction(rootId, nodeId, functionName, params, (callbackId == 0) ? null : (result: HippyAny) => {
        this.doCallBack(1, callbackId, functionName, rootId, nodeId, result)
      })
    } catch (e) {
      this.renderImpl.handleRenderException(e)
    }
  }

  measure(rootId: number, nodeId: number, width: number, widthMode: number, height: number, heightMode: number): bigint {
    return this.renderImpl.measure(this.libHippy, this.instanceId, rootId, nodeId, width, widthMode, height, heightMode)
  }

  customMeasure(rootId: number, nodeId: number, width: number, widthMode: number, height: number, heightMode: number): bigint {
    return this.renderImpl.customMeasure(this.libHippy, this.instanceId, rootId, nodeId, width, widthMode, height, heightMode)
  }

  spanPosition(rootId: number, nodeId: number, x: number, y: number): void {
    this.renderImpl.spanPosition(rootId, nodeId, x, y);
  }

  dispatchEvent(rootId: number, nodeId: number, eventName: string, params: HippyAny, useCapture: boolean, useBubble: boolean, eventType: HREventType) {
    // Because the native(C++) DOM use lowercase names, convert to lowercase here
    let lowerCaseEventName = eventName.toLowerCase()
    // Compatible with events prefixed with on in old version
    if (lowerCaseEventName.startsWith(this.EVENT_PREFIX)) {
        lowerCaseEventName = lowerCaseEventName.substring(this.EVENT_PREFIX.length)
    }

    if (eventType != HREventType.GESTURE && !this.renderImpl.checkRegisteredEvent(rootId, nodeId, lowerCaseEventName)) {
        return;
    }
    LogUtils.d(this.TAG, "dispatchEvent: id " + nodeId + ", eventName " + eventName
               + ", eventType " + eventType + ", params " + params)

    let buffer: ArrayBuffer | null = null
    if (params != null) {
      try {
        buffer = this.argumentToBytes(params)
      } catch (e) {
        this.renderImpl.handleRenderException(e)
      }
    }
    this.libHippy?.NativeRenderProvider_OnReceivedEvent(this.instanceId, rootId, nodeId, lowerCaseEventName, buffer, useCapture, useBubble)
  }

  doCallBack(result: number, callbackId: number, functionName: string, rootId: number, nodeId: number, params: HippyAny) {
    let buffer: ArrayBuffer | null = null
    if (params != null) {
      try {
        buffer = this.argumentToBytes(params)
      } catch (e) {
        this.renderImpl.handleRenderException(e)
      }
    }
    this.libHippy?.NativeRenderProvider_DoCallBack(this.instanceId, result, functionName, rootId, nodeId, callbackId, buffer)
  }

  setScreenShot(hippyResult: HippyResult) {
    this.hippyResult = hippyResult;
  }

  getScreenShot() {
    return this.hippyResult;
  }

  // for devtools
  getComponentSnapshot(componentId: string, callback: Function): object {
    const scale = 0.6;
    componentSnapshot.get("HippyId" + componentId).then((pixmap: PixelMap) => {
      pixmap.scaleSync(scale, scale);
      const info = pixmap.getImageInfoSync();
      const imagePackageApi: image.ImagePacker = image.createImagePacker()
      let packOpts: image.PackingOption = {
        format: 'image/png',
        quality: 100,
      }
      imagePackageApi.packing(pixmap, packOpts).then((readBuffer) => {
        let base64Helper = new util.Base64Helper();
        let uint8Arr = new Uint8Array(readBuffer);
        let pixelStr = base64Helper.encodeToStringSync(uint8Arr);
        LogUtils.d(this.TAG, "pixelStr::" + pixelStr);
        let hippyResult: HippyResult = {};
        hippyResult.screenShot = pixelStr;
        hippyResult.width = BigInt(info.size.width);
        hippyResult.height = BigInt(info.size.height);
        hippyResult.screenScale = scale;
        this.setScreenShot(hippyResult);
        imagePackageApi.release();
        pixmap.release();
      });
    });
    return this.getScreenShot();
  }

  getLocationOnScreen(componentId: string): object {
    interface HippyResult {
      xOnScreen?: number;
      yOnScreen?: number;
      viewWidth?: number;
      viewHeight?: number;
    }
    let info = componentUtils.getRectangleById("HippyId" + componentId);
    let hippyResult: HippyResult = {};
    hippyResult.xOnScreen = info.screenOffset.x;
    hippyResult.yOnScreen = info.screenOffset.y;
    hippyResult.viewWidth = info.size.width;
    hippyResult.viewHeight = info.size.height;
    return hippyResult as object;
  }

  // for c-api
  onFirstPaint(): void {
    return this.renderImpl.onFirstPaint();
  }

  // for c-api
  onFirstContentfulPaint(): void {
    return this.renderImpl.onFirstContentfulPaint();
  }

  // for c-api
  createRenderViewForCApi(params: CreateRenderViewParamsForCApi): FrameNode | null {
    return this.renderImpl.createRenderViewForCApi(params)
  }

  // for c-api
  removeRenderViewForCApi(params: RemoveRenderViewParamsForCApi): void {
    return this.renderImpl.removeRenderViewForCApi(params)
  }

  // for c-api
  updatePropsForCApi(params: UpdatePropsParamsForCApi): void {
    let binaryReader = new BinaryReader(new Uint8Array(params.props as ArrayBuffer))
    let deserializer = new NativeRenderDeserializer(binaryReader, null)
    deserializer.readHeader()
    let propsObj = deserializer.readValue() as HippyMap
    params.props = (propsObj instanceof Map) ? propsObj : new Map()
    this.renderImpl.updatePropsForCApi(params)
  }

  // for c-api
  updateEventListenerForCApi(params: UpdateEventListenerParamsForCApi): void {
    let binaryReader = new BinaryReader(new Uint8Array(params.props as ArrayBuffer))
    let deserializer = new NativeRenderDeserializer(binaryReader, null)
    deserializer.readHeader()
    let propsObj = deserializer.readValue() as HippyMap
    params.props = (propsObj instanceof Map) ? propsObj : new Map()
    this.renderImpl.updateEventListenerForCApi(params)
  }

  // for c-api
  setRenderViewFrameForCApi(params: SetRenderViewFrameParamsForCApi): void {
    this.renderImpl.setRenderViewFrameForCApi(params)
  }

  // for c-api
  callRenderViewMethodForCApi(params: CallRenderViewMethodParamsForCApi): void {
    this.renderImpl.callRenderViewMethodForCApi(params)
  }

  // for c-api
  onChildInsertedForCApi(params: OnChildInsertedParamsForCApi): void {
    this.renderImpl.onChildInsertedForCApi(params)
  }

  // for c-api
  onChildRemovedForCApi(params: OnChildRemovedParamsForCApi): void {
    this.renderImpl.onChildRemovedForCApi(params)
  }

}
