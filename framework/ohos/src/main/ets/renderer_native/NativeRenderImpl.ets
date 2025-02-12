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
import TextMeasurer from "@ohos.measure"
import {
  CallResultCallback,
  EventListenerCallback,
  HippyLibrary, HippyRenderViewInfo } from '../hippy_library/HippyLibrary'
import { HippyException } from '../support/common/HippyException'
import { HippyExecutor } from '../support/common/HippyExecutor'
import { HippyAny, HippyMap, HippyValue, HippyRenderCallback,
  HippyRecord,
  HippyArray} from '../support/common/HippyTypes'
import { LogUtils } from '../support/utils/LogUtils'
import { VfsManager } from '../vfs/VfsManager'
import {
  buildHippyRenderViewForCApi,
  CallRenderViewMethodParamsForCApi,
  CreateRenderViewParamsForCApi,
  OnChildInsertedParamsForCApi,
  OnChildRemovedParamsForCApi,
  RemoveRenderViewParamsForCApi,
  SetRenderViewFrameParamsForCApi,
  UpdateEventListenerParamsForCApi,
  UpdatePropsParamsForCApi } from './NativeRenderBuilderForCApi'
import { HRRenderViewCreator } from './components/HippyRenderRegisterMap'
import { ImageDecoderAdapter } from './components/image/ImageDecoderAdapter'
import { ImageLoader } from './components/image/ImageLoader'
import { ImageLoaderAdapter } from './components/image/ImageLoaderAdapter'
import { FontAdapter } from './components/richtext/FontAdapter'
import { FrameworkProxy } from './FrameworkProxy'
import { NativeRender } from './NativeRender'
import { NativeRenderContext } from './NativeRenderContext'
import { HRVirtualNode } from './node/HRVirtualNode'
import { HRVirtualNodeManager } from './node/HRVirtualNodeManager'
import { HRManager } from './uimanager/HRManager'
import { HRCreateMutation,
  HRDeleteMutation,
  HRMove2Mutation,
  HRMoveMutation,
  HRMoveNodeInfo,
  HRMutation,
  HRUpdateEventListenerMutation,
  HRUpdateLayoutMutation,
  HRUpdateMutation
} from './uimanager/HRMutation'
import { HippyEndBatchCallback, HRViewManager } from './uimanager/HRViewManager'
import { HRDisplaySyncUtils } from './utils/HRDisplaySyncUtils'
import { HRMeasureResult } from './utils/HRMeasure'
import { HRPosition, HRRect, HRSize } from './utils/HRTypes'
import { HRValueUtils } from './utils/HRValueUtils'
import { BuilderNode, FrameNode } from '@kit.ArkUI'
import HippyRenderBaseView from './components/base/HippyRenderBaseView'
import { HippyRootView } from '.'
import {
  WrappedHippyCustomRenderViewBuilder } from './HippyRenderViewBuilder'
import { HippyRootViewManager } from './HippyRootViewManager'
import { WrappedHippyBizViewBuilder } from './HippyBizViewBuilder'
import { PixelUtil } from "../support/utils/PixelUtil"

export class TextMeasurerConfig {
  textContent: string | null = null
  fontSize: number | null = null
  lineHeight: number | null = null
  fontWeight: number | null = null
  maxWidth: number | null = null
  numberOfLines: number | null = null
  letterSpacing?: number | null = null
}

declare function px2vp(px: number): number

export class NativeRenderImpl implements NativeRender {
  private readonly TAG = "NativeRenderImpl"
  private readonly INVALID_NODE_ID = -1
  private readonly ROOT_VIEW_ID_INCREMENT = 10
  private static sRootIdCounter = 0
  private static sBizViewIdCounter = 0

  private libHippy: HippyLibrary
  private enableArkCApi: boolean

  private instanceId: number = 0

  private customRenderViewCreatorMap: Map<string, HRRenderViewCreator> | null
  private customMeasureRenderViews: Array<string> | null

  private frameworkProxy: FrameworkProxy | null = null
  private imageLoader: ImageLoaderAdapter | null = null

  private renderManager: HRManager

  constructor(libHippy: HippyLibrary, enableArkCApi: boolean,
      customRenderViewCreatorMap: Map<string, HRRenderViewCreator> | null,
      customMeasureRenderViews: Array<string> | null) {
    this.libHippy = libHippy
    this.enableArkCApi = enableArkCApi
    this.customRenderViewCreatorMap = customRenderViewCreatorMap
    this.customMeasureRenderViews = customMeasureRenderViews
    this.renderManager = new HRManager()
  }

  setInstanceId(instanceId: number) {
    this.instanceId = instanceId
  }

  getCustomRenderViewCreatorMap(): Map<string, HRRenderViewCreator> | null {
    return this.customRenderViewCreatorMap
  }

  setFrameworkProxy(proxy: FrameworkProxy) {
    this.frameworkProxy = proxy
  }

  createRootView(pageName: string, pageData: HippyRecord, wrappedCustomRenderViewBuilder: WrappedHippyCustomRenderViewBuilder | null): HippyRootView {
    NativeRenderImpl.sRootIdCounter += this.ROOT_VIEW_ID_INCREMENT
    let rootId = NativeRenderImpl.sRootIdCounter
    let rootView = new HippyRootView(this.instanceId, rootId, this.customRenderViewCreatorMap, this,
      wrappedCustomRenderViewBuilder, pageName, pageData)
    HippyRootViewManager.addRootView(rootId, rootView)
    return rootView
  }

  reloadRootView(rootView: HippyRootView) {
    HippyRootViewManager.addRootView(rootView.getRootId(), rootView)
  }

  destroyRoot(rootId: number): void {
    HippyRootViewManager.removeRootView(rootId)
    if (this.frameworkProxy) {
      this.frameworkProxy.destroyRoot(rootId)
    }

    this.renderManager.destroyViewManager(rootId)
    this.libHippy?.NativeRenderProvider_UnbindNativeRoot(this.instanceId, rootId, 0)
    this.libHippy.NativeRenderProvider_DestroyRoot(this.instanceId, rootId)
  }

  isEnableArkCApi(): boolean {
    return this.enableArkCApi
  }

  // for c-api
  onFirstPaint(): void {
    if (this.frameworkProxy) {
      this.frameworkProxy.onFirstPaint()
    }
  }

  // for c-api
  onFirstContentfulPaint(): void {
    if (this.frameworkProxy) {
      this.frameworkProxy.onFirstContentfulPaint()
    }
  }

  getRenderManager(): HRManager {
    return this.renderManager
  }

  getBundlePath(): string {
    return this.frameworkProxy ? this.frameworkProxy.getBundlePath() : ""
  }

  getImageLoader(): ImageLoaderAdapter | null{
    if (this.imageLoader == null && this.getVfsManager() != null) {
      this.imageLoader = new ImageLoader(this.getVfsManager() as VfsManager)
    }
    return this.imageLoader
  }

  // TODO(eksea)
  // getImageDecoderAdapter(): ImageDecoderAdapter | null {
  //   return this.frameworkProxy ? this.frameworkProxy.getImageDecoderAdapter() : null
  // }

  getVfsManager(): VfsManager | null {
    return this.frameworkProxy ? this.frameworkProxy.getVfsManager() : null
  }

  // TODO(eksea)
  // getFontAdapter(): FontAdapter | null {
  //   return this.frameworkProxy ? this.frameworkProxy.getFontAdapter() : null
  // }

  // TODO(eksea)
  // getBackgroundExecutor(): HippyExecutor | null {
  //   return this.frameworkProxy ? this.frameworkProxy.getBackgroundExecutor() : null
  // }

  getEngineId(): number {
    return this.frameworkProxy ? this.frameworkProxy.getEngineId() : -1
  }

  onSizeChanged(rootId: number, width: number, height: number, oldWidth: number, oldHeight: number): void {
    if (this.frameworkProxy != null) {
      this.frameworkProxy.onSizeChanged(rootId, width, height, oldWidth, oldHeight)
    }
    let w = PixelUtil.vp2dp(width)
    let h = PixelUtil.vp2dp(height)
    this.libHippy?.NativeRenderProvider_UpdateRootSize(this.instanceId, rootId, w, h)
  }

  onSizeChanged2(rootId: number, nodeId: number, width: number, height: number, isSync: boolean): void {
    let w = PixelUtil.vp2dp(width)
    let h = PixelUtil.vp2dp(height)
    this.libHippy?.NativeRenderProvider_UpdateNodeSize(this.instanceId, rootId, nodeId, w, h, isSync)
  }

  updateDimension(width: number, height: number, shouldUseScreenDisplay: boolean, systemUiVisibilityChanged: boolean) {
    if (this.frameworkProxy != null) {
      this.frameworkProxy.updateDimension(width, height, shouldUseScreenDisplay, systemUiVisibilityChanged)
    }
  }

  handleRenderException(exception: HippyException) {
    exception = HippyException.safeBuild(exception)
    LogUtils.e(this.TAG, `handleRenderException: ${exception.message}`)
    if (this.frameworkProxy) {
      this.frameworkProxy.handleNativeException(exception)
    }
  }

  createNode(rootId: number, nodeList: Array<HippyAny>) {
    let viewManager = this.renderManager.getViewManager(rootId)
    let virtualNodeManager = this.renderManager.getVirtualNodeManager(rootId)
    if (!viewManager || !virtualNodeManager) {
      return
    }

    for (let i = 0; i < nodeList.length; i++) {
      let node = nodeList[i] as Map<string, HippyAny>

      let vNode = virtualNodeManager.createVirtualNode(
        rootId,
        node.get('id') as number,
        node.get('pId') as number,
        node.get('index') as number,
        node.get('props') as HippyMap)
      vNode.viewName = node.get('name') as string
      virtualNodeManager.addVirtualNode(node.get('id') as number, vNode)

      let m: HRCreateMutation = new HRCreateMutation()
      m.viewName = node.get('name') as string
      m.tag = node.get('id') as number
      m.parentTag = node.get('pId') as number
      m.index = node.get('index') as number
      m.props = node.get('props') as HippyMap
      viewManager.addMutations(m)

      if (this.customMeasureRenderViews && this.customMeasureRenderViews.findIndex((value) => value === m.viewName) >= 0) {
        viewManager.preCreateRenderView(m.tag, m.viewName)
      }
    }
  }

  updateNode(rootId: number, nodeList: Array<HippyAny>) {
    let viewManager = this.renderManager.getViewManager(rootId)
    let virtualNodeManager = this.renderManager.getVirtualNodeManager(rootId)
    if (!viewManager || !virtualNodeManager) {
      return
    }

    for (let i = 0; i < nodeList.length; i++) {
      let node = nodeList[i] as Map<string, HippyAny>

      let vNode = virtualNodeManager.getVirtualNode(node.get('id') as number)
      if (vNode && vNode.props) {
        (node.get('props') as HippyMap).forEach((value: HippyAny, key: string) => {
          if (vNode && vNode.props && key) {
            if(value) {
              vNode.props.set(key, value)
            } else {
              vNode.props.delete(key)
            }
          }
        })
      }

      let m: HRUpdateMutation = new HRUpdateMutation()
      m.viewName = node.get('name') as string
      m.tag = node.get('id') as number
      m.parentTag = node.get('pId') as number
      m.index = node.get('index') as number
      m.props = node.get('props') as HippyMap
      m.deleteProps = node.get('deleteProps') as Array<string>
      viewManager.addMutations(m)
    }
  }

  moveNode(rootId: number, pid: number, nodeList: Array<HippyAny>) {
    let viewManager = this.renderManager.getViewManager(rootId)
    if (!viewManager) {
      return
    }

    if (nodeList.length == 0) {
      return
    }

    let m: HRMoveMutation = new HRMoveMutation()
    m.parentTag = pid
    m.nodeInfos = new Array<HRMoveNodeInfo>()
    for (let i = 0; i < nodeList.length; i++) {
      let node = nodeList[i] as Map<string, HippyAny>
      let tag = node.get('id') as number
      let index = node.get('index') as number
      let info = new HRMoveNodeInfo(tag, index)
      m.nodeInfos.push(info)
    }
    viewManager.addMutations(m)
  }

  moveNode2(rootId: number, id_array: Array<number>, to_pid: number, from_pid: number, index: number) {
    let viewManager = this.renderManager.getViewManager(rootId)
    if (!viewManager) {
      return
    }

    if (id_array.length == 0) {
      return
    }

    let m: HRMove2Mutation = new HRMove2Mutation()
    m.tagArray = id_array
    m.toParentTag = to_pid
    m.fromParentTag = from_pid
    m.index = index
    viewManager.addMutations(m)
  }

  deleteNode(rootId: number, id_array: Array<number>) {
    let viewManager = this.renderManager.getViewManager(rootId)
    if (!viewManager) {
      return
    }

    for (let i = 0; i < id_array.length; i++) {
      let id = id_array[i]
      let m: HRDeleteMutation = new HRDeleteMutation()
      m.tag = id
      viewManager.addMutations(m)
    }
  }

  updateLayout(rootId: number, nodeList: Array<HippyAny>) {
    let viewManager = this.renderManager.getViewManager(rootId)
    if (!viewManager) {
      return
    }

    for (let i = 0; i < nodeList.length; i++) {
      let node = nodeList[i] as Map<string, HippyAny>
      let m: HRUpdateLayoutMutation = new HRUpdateLayoutMutation()
      m.tag = node.get('id') as number
      m.left = px2vp(node.get('left') as number)
      m.top = px2vp(node.get('top') as number)
      m.width = px2vp(node.get('width') as number)
      m.height = px2vp(node.get('height') as number)
      let paddingLeft = node.get('paddingLeft')
      if (paddingLeft) {
        let paddingTop = node.get('paddingTop')
        let paddingRight = node.get('paddingRight')
        let paddingBottom = node.get('paddingBottom')
        m.paddingLeft = px2vp(paddingLeft as number)
        m.paddingTop = px2vp(paddingTop as number)
        m.paddingRight = px2vp(paddingRight as number)
        m.paddingBottom = px2vp(paddingBottom as number)
      }
      viewManager.addMutations(m)
    }
  }

  endBatch(rootId: number) {
    let viewManager = this.renderManager.getViewManager(rootId)
    if (!viewManager) {
      return
    }

    viewManager.applyMutations()
    viewManager.notifyEndBatchCallbacks()
  }

  updateEventListener(rootId: number, eventList: Array<HippyAny>) {
    let viewManager = this.renderManager.getViewManager(rootId)
    if (!viewManager) {
      return
    }

    for (let i = 0; i < eventList.length; i++) {
      let event = eventList[i] as Map<string, HippyAny>
      if (!(event instanceof Map)) {
        throw new HippyException(this.TAG + ": updateEventListener: invalid event object")
      }
      let nodeId = HRValueUtils.getNumber2(event.get('id'), this.INVALID_NODE_ID)
      let eventProps = HRValueUtils.getMap(event.get('props'))
      if (nodeId < 0 || !eventProps) {
        throw new HippyException(this.TAG + ": updateEventListener: invalid id or props")
      }

      let m: HRUpdateEventListenerMutation = new HRUpdateEventListenerMutation()
      m.tag = nodeId
      m.props = eventProps
      viewManager.addMutations(m)
    }
  }

  checkRegisteredEvent(rootId: number, nodeId: number, eventName: string): boolean {
    let viewManager = this.renderManager.getViewManager(rootId)
    if (!viewManager) {
      return false
    }

    return viewManager.checkRegisteredEvent(nodeId, eventName)
  }

  callUIFunction(rootId: number, nodeId: number, functionName: string, params: Array<HippyAny>, callback: HippyRenderCallback | null) {
    let viewManager = this.renderManager.getViewManager(rootId)
    if (!viewManager) {
      return
    }

    LogUtils.d(this.TAG,  "callUIFunction: rootId " + rootId + ", id " + nodeId + ", functionName " + functionName + ", params" + params)
    viewManager.callViewMethod(nodeId, functionName, params, callback)
  }

  addEndBatchCallback(rootId: number, cb: HippyEndBatchCallback): void {
    let viewManager = this.renderManager.getViewManager(rootId)
    if (!viewManager) {
      return
    }
    viewManager.addEndBatchCallback(cb)
  }

  removeEndBatchCallback(rootId: number, cb: HippyEndBatchCallback): void {
    let viewManager = this.renderManager.getViewManager(rootId)
    if (!viewManager) {
      return
    }
    viewManager.removeEndBatchCallback(cb)
  }

  private textPropsOnly:string[] = ["textAlign","numberOfLines","breakStrategy","ellipsizeMode"];//只有text有，span没有的属性
  private textMarginProps:string[]=["marginLeft","marginRight","marginTop","marginBottom","margin","lineHeight"];//和边框相关的，在最后参与计算
  private spanDropProps:string[]=["backgroundColor",
    "textShadowColor","textShadowOffset","textShadowRadius",
    "borderColor", "borderWidth",
    "verticalAlign","paddingVertical","paddingHorizontal",];//在OH_Drawing里面没有的属性，不知如何处理
  measureAddStartPropsToStream(stream:string[], props:HippyMap) {
    let count=0;
    let tmpStr:string[] = [];
    this.textPropsOnly.forEach((value:string)=>{
      let p = props.get(value);
      if(p) {
        count++;
        tmpStr.push(value);
        tmpStr.push(p.toString());
      }
    })
    stream.push("measure_add_start");
    stream.push(count.toString());
    stream.push(...tmpStr);
  }
  measureAddEndPropsToStream(stream:string[], props:HippyMap) {
    let count=0;
    let tmpStr:string[] = [];
    this.textMarginProps.forEach((value:string)=>{
      let p = props.get(value);
      if(p) {
        count++;
        tmpStr.push(value);
        tmpStr.push(p.toString());
      }
    })
    stream.push("measure_add_end");
    stream.push(count.toString());
    stream.push(...tmpStr);
  }
  measureAddTextPropsToStream(stream:string[], props:HippyMap) {
    let count=0;
    let tmpStr:string[] = [];
    props.forEach((value: HippyAny, key: string) => {
      if (key && value && this.textPropsOnly.indexOf(key)<0 && this.textMarginProps.indexOf(key)<0 && this.spanDropProps.indexOf(key)<0) {
        count++;
        tmpStr.push(key);
        tmpStr.push(value.toString());
      }
    })
    stream.push("measure_add_text");
    stream.push(count.toString());//属性数量
    stream.push(...tmpStr);
  }

  spanPosition(rootId: number, nodeId: number, x: number, y: number) : void {
    let viewManager = this.renderManager.getViewManager(rootId)
    if (!viewManager) {
      return
    }

    let m: HRUpdateLayoutMutation = new HRUpdateLayoutMutation()
    m.tag = nodeId
    m.left = x
    m.top = y
    m.width = 0
    m.height = 0
    viewManager.addMutations(m)
  }

  measure(libHippy:HippyLibrary, instanceId: number, rootId: number, nodeId: number, width: number, widthMode: number, height: number, heightMode: number): bigint {
    let virtualNodeManager = this.renderManager.getVirtualNodeManager(rootId)
    if (!virtualNodeManager) {
      return BigInt(0)
    }

    let ret:bigint = BigInt(0);
    let vNode = virtualNodeManager.getVirtualNode(nodeId)
    if (vNode && vNode.props) {
      let stream:string[]=[];
      this.measureAddStartPropsToStream(stream,vNode.props);
      let vChildren = virtualNodeManager.getVirtualChildrenNode(nodeId);
      if(vChildren.length>0){//测量文文，文图
        LogUtils.d("Measure Text",`measureC : ${vChildren.length}`)
        vChildren.forEach((value:HRVirtualNode)=>{
          if(value.viewName=="Text") {
            if(value.props){
              this.measureAddTextPropsToStream(stream,value.props);
            }
          }
          else if(value.viewName=="Image") {
            if(value.props){
              let imgW=value.props.get("width");
              let imgH=value.props.get("height");
              if(imgW && imgH){
                stream.push("measure_add_image");
                stream.push("2");//属性数量
                stream.push("width");
                stream.push(imgW.toString());
                stream.push("height");
                stream.push(imgH.toString());
              }
            }
            else {
              LogUtils.d("Measure Text","unknow image wh");
            }
          }
        })
      }
      else if(vNode.props.get('text')) {//测量单独的文字
        LogUtils.d("Measure Text",`measureA : ${nodeId},${vNode.props.get('text')}`)
        this.measureAddTextPropsToStream(stream,vNode.props);
      } else {
        LogUtils.d("Measure Text",`measureB : ${nodeId},空`)
        return ret;
      }
      this.measureAddEndPropsToStream(stream, vNode.props);
      /* 创建字符串序列，在native_render_provider_napi.cc的DoMeasureText中解析处理:
measure_add_start <prop数量>            携带只有text有的属性，如textAlign,numberOfLines,breakStrategy,ellipsizeMode
key1               value1
.....
measure_add_text  <prop数量>            携带TextSpan的属性，如fontSize等
key1               value1
.....
measure_add_image <prop数量>            携带ImageSpan的属性，只需宽高，使用OH_Drawing_TypographyHandlerAddPlaceholder添加
width              xxx
height             xxx
measure_add_end   <prop数量>            携带边框类型的属性，和Text测量无关，测量完后增加到整体宽高中，如marginLeft,margin,lineHeight等
key1               value1
...
       * */
      let wh = libHippy.NativeRenderProvider_DoMeasureText(instanceId, stream, width, widthMode, height, heightMode);
      let w = wh[0];
      let h = wh[1];
      w=Math.ceil(w)
      h=Math.ceil(h)
      LogUtils.d("Measure Text",`    new ${w}x${h}`);
      ret = (BigInt(w) << BigInt(32)) | BigInt(h)
    }
    if (vNode && vNode.props) {
      let config: TextMeasurerConfig = new TextMeasurerConfig();
      config.textContent = vNode.props.get('text') as string
      config.fontSize = vNode.props.get('fontSize') as number
      config.lineHeight = vNode.props.get('lineHeight') as number
      config.numberOfLines = 1
      let result = this.measureText(config)
      LogUtils.d("Measure Text",`    old ${result.width}x${result.height}`)
      // 原measure text方法，这里只打印作比较
      //ret = (BigInt(result.width) << BigInt(32)) | BigInt(result.height)
    }
    return ret
  }

  private measureText(config: TextMeasurerConfig): HRSize {
    let textSize = TextMeasurer.measureTextSize({
      textContent: config.textContent as string,
      fontSize: config.fontSize,
      lineHeight: config.lineHeight as number,
      fontWeight: config.fontWeight,
      maxLines: config.numberOfLines,
      letterSpacing: config.letterSpacing
    });

    if (!config.maxWidth || px2vp(textSize.width as number) < config.maxWidth) {
      return new HRSize(Number(textSize.width), Number(textSize.height))
    }

    textSize = TextMeasurer.measureTextSize({
      textContent: config.textContent as string,
      fontSize: config.fontSize,
      lineHeight: config.lineHeight,
      fontWeight: config.fontWeight,
      constraintWidth: config.maxWidth,
      maxLines: config.numberOfLines,
      letterSpacing: config.letterSpacing
    })
    return new HRSize(Number(textSize.width), Number(textSize.height))
  }

  customMeasure(libHippy:HippyLibrary, instanceId: number, rootId: number, nodeId: number, width: number, widthMode: number, height: number, heightMode: number): bigint {
    let viewManager = this.renderManager.getViewManager(rootId)
    if (!viewManager) {
      return BigInt(0)
    }
    let result = viewManager.callCustomMeasure(nodeId, width, widthMode, height, heightMode)
    return (BigInt(result.width) << BigInt(32)) | BigInt(result.height)
  }

  // for c-api
  createRenderViewForCApi(params: CreateRenderViewParamsForCApi): FrameNode | null {
    let viewManager = this.renderManager.getViewManager(params.rootTag)
    if (!viewManager) {
      return null
    }

    if (!AppStorage.has('UIContextForHippy')) {
      LogUtils.e("", "AppStorage has no UIContext.");
      return null
    }

    let context = AppStorage.get<UIContext>('UIContextForHippy');

    let view = viewManager.createRenderViewForCApi(params.tag, params.viewName)
    if (!view) {
      return null
    }

    let builderNode = new BuilderNode<[HippyRenderBaseView]>(context!);
    builderNode.build(wrapBuilder(buildHippyRenderViewForCApi), view);

    let builderNodeManger = this.renderManager.getBuilerNodeManager(params.rootTag)
    builderNodeManger?.addCustomViewBuilderNode(params.tag, builderNode)

    return builderNode.getFrameNode()!;
  }

  // for c-api
  removeRenderViewForCApi(params: RemoveRenderViewParamsForCApi): void {
    let builderNodeManger = this.renderManager.getBuilerNodeManager(params.rootTag)
    builderNodeManger?.removeCustomViewBuilderNode(params.tag)

    let viewManager = this.renderManager.getViewManager(params.rootTag)
    if (!viewManager) {
      return
    }
    viewManager.removeRenderViewForCApi(params.tag)
  }

  // for c-api
  updatePropsForCApi(params: UpdatePropsParamsForCApi): void {
    let viewManager = this.renderManager.getViewManager(params.rootTag)
    if (!viewManager) {
      return
    }
    viewManager.updatePropsForCApi(params.tag, params.props as HippyMap, params.deleteProps)
  }

  // for c-api
  updateEventListenerForCApi(params: UpdateEventListenerParamsForCApi): void {
    let viewManager = this.renderManager.getViewManager(params.rootTag)
    if (!viewManager) {
      return
    }
    viewManager.updateEventListenerForCApi(params.tag, params.props as HippyMap)
  }

  // for c-api
  setRenderViewFrameForCApi(params: SetRenderViewFrameParamsForCApi): void {
    let viewManager = this.renderManager.getViewManager(params.rootTag)
    if (!viewManager) {
      return
    }
    viewManager.setRenderViewFrameForCApi(params.tag, new HRRect(params.left, params.top, params.width, params.height), null)
  }

  // for c-api
  callRenderViewMethodForCApi(params: CallRenderViewMethodParamsForCApi): void {
    let viewManager = this.renderManager.getViewManager(params.rootTag)
    if (!viewManager) {
      return
    }

    viewManager.callRenderViewMethodForCApi(params.tag, params.method, params.params, params.callbackId == 0 ? null : (result: HippyAny) => {
      this.libHippy?.NativeRenderProvider_DoCallbackForCallCustomTsView(this.instanceId, params.rootTag, params.tag, params.callbackId, result)
    })
  }

  // for c-api
  onChildInsertedForCApi(params: OnChildInsertedParamsForCApi): void {
    let viewManager = this.renderManager.getViewManager(params.rootTag)
    if (!viewManager) {
      return
    }
    viewManager.onChildInsertedForCApi(params.tag, params.childTag, params.childViewName, params.childIndex)
  }

  // for c-api
  onChildRemovedForCApi(params: OnChildRemovedParamsForCApi): void {
    let viewManager = this.renderManager.getViewManager(params.rootTag)
    if (!viewManager) {
      return
    }
    viewManager.onChildRemovedForCApi(params.tag, params.childTag, params.childViewName, params.childIndex)
  }

  getRenderView(rootId: number, nodeId: number): HippyRenderBaseView | null {
    let viewManager = this.renderManager.getViewManager(rootId)
    if (!viewManager) {
      return null
    }
    return viewManager.getRenderView(nodeId)
  }

  getViewParent(rootId: number, nodeId: number): HippyRenderViewInfo | null {
    return this.libHippy?.NativeRenderProvider_GetViewParent(this.instanceId, rootId, nodeId)
  }

  getViewChildren(rootId: number, nodeId: number): Array<HippyRenderViewInfo> | null {
    return this.libHippy?.NativeRenderProvider_GetViewChildren(this.instanceId, rootId, nodeId)
  }

  callViewMethod(rootId: number, nodeId: number, method: string, params: HippyArray, callback: CallResultCallback | null): void {
    this.libHippy?.NativeRenderProvider_CallViewMethod(this.instanceId, rootId, nodeId, method, params, callback)
  }

  setViewEventListener(rootId: number, nodeId: number, callback: EventListenerCallback | null): void {
    this.libHippy?.NativeRenderProvider_SetViewEventListener(this.instanceId, rootId, nodeId, callback)
  }

  getViewFrameInRoot(rootId: number, nodeId: number): HRRect | null {
    return this.libHippy?.NativeRenderProvider_GetViewFrameInRoot(this.instanceId, rootId, nodeId)
  }

  addBizViewInRoot(rootId: number, position: HRPosition, viewBuilder: WrappedHippyBizViewBuilder, view: Object): number {
    if (!AppStorage.has('UIContextForHippy')) {
      LogUtils.e("", "AppStorage has no UIContext.");
      return -1
    }

    let context = AppStorage.get<UIContext>('UIContextForHippy');

    let builderNode = new BuilderNode<[Object]>(context!);
    builderNode.build(viewBuilder, view);

    let bizViewId = ++NativeRenderImpl.sBizViewIdCounter;
    let builderNodeManger = this.renderManager.getBuilerNodeManager(rootId);
    builderNodeManger?.addBizViewBuilderNode(bizViewId, builderNode);

    let frameNode = builderNode.getFrameNode();
    if (!frameNode) {
      return -1
    }

    this.libHippy?.NativeRenderProvider_AddBizViewInRoot(this.instanceId, rootId, bizViewId, frameNode, position.x, position.y)
    return bizViewId
  }

  removeBizViewInRoot(rootId: number, bizViewId: number): void {
    this.libHippy?.NativeRenderProvider_RemoveBizViewInRoot(this.instanceId, rootId, bizViewId)

    let builderNodeManger = this.renderManager.getBuilerNodeManager(rootId);
    builderNodeManger?.removeBizViewBuilderNode(bizViewId);
  }

}


