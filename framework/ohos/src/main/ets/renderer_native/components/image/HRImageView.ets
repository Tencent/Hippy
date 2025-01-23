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
import { HippyAny,
  HippyRenderCallback, HippyResource } from '../../../support/common/HippyTypes';
import { HRNodeProps } from '../../dom_node/HRNodeProps';
import { NativeRenderContext } from '../../NativeRenderContext';
import { HRConvertUtil } from '../../utils/HRConvertUtil';
import HippyRenderBaseView, { HIPPY_COMPONENT_KEY_PREFIX } from '../base/HippyRenderBaseView';
import { LogUtils } from '../../../support/utils/LogUtils';
import {HRDownloadUtils} from '../../utils/HRDownloadUtils'
import { HREventUtils } from '../../utils/HREventUtils';
import { ImageRequestListener } from './ImageRequestListener';
import { ImageDataSupplier } from './ImageDataSupplier';
import { HashMap } from '@kit.ArkTS';
import { HRValueUtils } from '../../utils/HRValueUtils';
import { HippyResourceLoader } from '../../../hippy_framework/HippyResourceLoader';
import { UrlUtils } from '../../../support/utils/UrlUtils';
import { HRPadding, HRRect } from '../../utils/HRTypes';

interface ImageLoadEvent {
  width: number
  height: number
  componentWidth: number
  componentHeight: number
  loadingStatus: number
  contentWidth: number
  contentHeight: number
  contentOffsetX: number
  contentOffsetY: number
}

enum TintColorBlendMode {
  CLEAR,
  SRC,
  DST,
  SRC_OVER,
  DST_OVER,
  SRC_IN,
  DST_IN,
  SRC_OUT,
  DST_OUT,
  DST_ATOP = 10,
  XOR,
  ADD,
  MULTIPLY,
  SCREEN,
  OVERLAY,
  DARKEN,
  LIGHTEN,
  SRC_ATOP,
}

@Observed
export class HRImageView extends HippyRenderBaseView {
  private static readonly BASE64_IMAGE_PREFIX = "data:image"
  private static readonly RAW_IMAGE_PREFIX = "hpfile://"
  private static readonly ASSETS_PREFIX = "assets://"
  private static readonly INTERNET_IMAGE_PREFIX = "http"
  private readonly TAG = "HRImageView"
  private imageLoader: HRDownloadUtils = new HRDownloadUtils
  tempDir:string = getContext().tempDir

  src: string | PixelMap | Resource
  cssSrc: string | Resource | null = null
  cssAlt: string | Resource | null = null
  cssResizeMode: ImageFit = ImageFit.Fill
  imageRepeat: ImageRepeat = ImageRepeat.NoRepeat
  resizable: ResizableOptions | null = null
  cssTintColor: number[] = [0] // RGBA
  cssColorFilter: ColorFilter = [0]
  draggable: boolean = false
  cssTintColorBlendMode: TintColorBlendMode = TintColorBlendMode.SRC_ATOP
  cssPreTintColorBlendMode: TintColorBlendMode = TintColorBlendMode.SRC_ATOP
  onCompleteCallback: ((event?: ImageLoadEvent) => void) | null = null
  onErrorCallback: ((error: ImageError) => void) | null = null

  // imageSpan props
  spanVerticalAlign: ImageSpanAlignment = ImageSpanAlignment.BOTTOM
  spanObjectFit: ImageFit = ImageFit.Fill

  constructor(ctx: NativeRenderContext) {
    super(ctx)
    LogUtils.d(this.TAG, "constructor")
    this.initCallbacks()
    this.src = ""
  }

  private setResizeMode(pvalue: string) {
    LogUtils.d(this.TAG, "setResizeMode")
    switch (pvalue) {
      case 'contain':
        this.cssResizeMode = ImageFit.Contain
        break;
      case 'cover':
        this.cssResizeMode = ImageFit.Cover
        break;
      case 'center':
        this.cssResizeMode = ImageFit.ScaleDown
        break;
      case 'origin':
        this.cssResizeMode = ImageFit.None
        break;
      case 'repeat':
        this.cssResizeMode = ImageFit.ScaleDown
        this.imageRepeat = ImageRepeat.XY
        break;
      case 'fitXY':
        this.cssResizeMode = ImageFit.Fill
        break;
      default:
        this.cssResizeMode = ImageFit.Fill
        break;
    }
  }

  private setTintColorBlendMode(propValue: HippyAny){
    LogUtils.d(this.TAG,"setTintColorBlendMode")
    this.cssPreTintColorBlendMode = this.cssTintColorBlendMode
    let blendMode = HRValueUtils.getNumber(propValue)
    switch (blendMode){
      case 0:
        this.cssTintColorBlendMode = TintColorBlendMode.CLEAR
      break;
      case 1:
        this.cssTintColorBlendMode = TintColorBlendMode.SRC
        break;
      case 2:
        this.cssTintColorBlendMode = TintColorBlendMode.DST
        break;
      case 3:
        this.cssTintColorBlendMode = TintColorBlendMode.SRC_OVER
        break;
      case 4:
        this.cssTintColorBlendMode = TintColorBlendMode.DST_OVER
        break;
      case 5:
        this.cssTintColorBlendMode = TintColorBlendMode.SRC_IN
        break;
      case 6:
        this.cssTintColorBlendMode = TintColorBlendMode.DST_IN
        break;
      case 7:
        this.cssTintColorBlendMode = TintColorBlendMode.SRC_OUT
        break;
      case 8:
        this.cssTintColorBlendMode = TintColorBlendMode.DST_OUT
        break;
      case 10:
        this.cssTintColorBlendMode = TintColorBlendMode.DST_ATOP
        break;
      case 11:
        this.cssTintColorBlendMode = TintColorBlendMode.XOR
        break;
      case 12:
        this.cssTintColorBlendMode = TintColorBlendMode.ADD
        break;
      case 13:
        this.cssTintColorBlendMode = TintColorBlendMode.MULTIPLY
        break;
      case 14:
        this.cssTintColorBlendMode = TintColorBlendMode.SCREEN
        break;
      case 15:
        this.cssTintColorBlendMode = TintColorBlendMode.OVERLAY
        break;
      case 16:
        this.cssTintColorBlendMode = TintColorBlendMode.DARKEN
        break;
      case 17:
        this.cssTintColorBlendMode = TintColorBlendMode.LIGHTEN
        break
      case 9:
      default:
        this.cssTintColorBlendMode = TintColorBlendMode.SRC_ATOP
        break;
    }
  }

  private setColorFilterMatrix(){
    LogUtils.d(this.TAG,"setColorFilterMatrix")
    if (this.cssTintColor.length != 1) {
      let matrixColor = [0] //RGBA
      matrixColor[0]= Number((this.cssTintColor[0]/0xff).toFixed(2))
      matrixColor[1]= Number((this.cssTintColor[1]/0xff).toFixed(2))
      matrixColor[2]= Number((this.cssTintColor[2]/0xff).toFixed(2))
      matrixColor[3]= Number((this.cssTintColor[3]/0xff).toFixed(2))
      switch (this.cssTintColorBlendMode){
        case TintColorBlendMode.CLEAR:
          this.cssColorFilter = [
            0,  0,  0,  0,  0,
            0,  0,  0,  0,  0,
            0,  0,  0,  0,  0,
            0,  0,  0,  0,  0]
        break
        case TintColorBlendMode.SRC:
          this.cssColorFilter = [
            0,  0,  0,  0,  matrixColor[0],
            0,  0,  0,  0,  matrixColor[1],
            0,  0,  0,  0,  matrixColor[2],
            0,  0,  0,  0,  matrixColor[3]]
          break
        case TintColorBlendMode.DST:
          this.cssColorFilter = [
            1,  0,  0,  0,  0,
            0,  1,  0,  0,  0,
            0,  0,  1,  0,  0,
            0,  0,  0,  1,  0]
          break
        case TintColorBlendMode.SRC_OVER:
          break
        case TintColorBlendMode.DST_OVER:
          break
        case TintColorBlendMode.SRC_IN:
          break
        case TintColorBlendMode.DST_IN:
          break
        case TintColorBlendMode.SRC_OUT:
          break
        case TintColorBlendMode.DST_OUT:
          break
        case TintColorBlendMode.DST_ATOP:
          break
        case TintColorBlendMode.XOR:
          break
        case TintColorBlendMode.MULTIPLY:
          break
        case TintColorBlendMode.SCREEN:
          break
        case TintColorBlendMode.ADD:
          break
        case TintColorBlendMode.OVERLAY:
          break
        case TintColorBlendMode.DARKEN:
          break
        case TintColorBlendMode.LIGHTEN:
          break
        case TintColorBlendMode.SRC_ATOP:
          this.cssColorFilter = [
            1-matrixColor[3], 0, 0, 0, matrixColor[0]*matrixColor[3],
            0, 1-matrixColor[3], 0, 0, matrixColor[1]*matrixColor[3],
            0, 0, 1-matrixColor[3], 0, matrixColor[2]*matrixColor[3],
            0, 0, 0, 1, 0]
          break
        default:
          break
      }
    }
  }

  setProp(propKey: string, propValue: HippyAny | HippyRenderCallback): boolean {
    switch (propKey) {
      case HRNodeProps.WIDTH:
        if (this.isImageSpan()) {
          this.cssWidth = HRValueUtils.getNumber(propValue as HippyAny);
        }
        return true;
      case HRNodeProps.HEIGHT:
        if (this.isImageSpan()) {
          this.cssHeight = HRValueUtils.getNumber(propValue as HippyAny);
        }
        return true;
      case HRNodeProps.VERTICAL_ALIGN:
        if(this.isImageSpan()) {
          let t = HRValueUtils.getString(propValue as HippyAny);
          switch (t) {
            case "top":
              this.spanVerticalAlign = ImageSpanAlignment.TOP;
              break;
            case "middle":
              this.spanVerticalAlign = ImageSpanAlignment.CENTER;
              break;
            case "bottom":
              this.spanVerticalAlign = ImageSpanAlignment.BOTTOM;
              break;
            case "baseline":
              this.spanVerticalAlign = ImageSpanAlignment.BASELINE;
              break;
          }
        }
        return true;
      case 'src':
        {
          this.cssSrc = HRValueUtils.getString(propValue as HippyAny)
          this.fetchImage()
        }
        return true
      case 'resizeMode':
        {
          let pvalue = HRValueUtils.getString(propValue as HippyAny)
          this.setResizeMode(pvalue)
        }
        return true
      case 'defaultSource':
        {
          let cssAlt = HRValueUtils.getString(propValue as HippyAny)
          this.cssAlt = this.convertToLocalPathIfNeeded(cssAlt)
        }
        return true
      case 'tintColor'://ARGB
        {
          let intColor = HRValueUtils.getNumber(propValue as HippyAny)
          this.cssTintColor[0] = (intColor >> 16) & 0xff   //red
          this.cssTintColor[1] = (intColor >> 8) & 0xff    //green
          this.cssTintColor[2] = intColor & 0xff           //blue
          this.cssTintColor[3] = (intColor >> 24) & 0xff   //alpha
          this.setColorFilterMatrix()
        }
        return true
      case 'tintColorBlendMode':
        let blendMode = HRValueUtils.getNumber(propValue as HippyAny)
        this.setTintColorBlendMode(blendMode)
        if (this.cssTintColorBlendMode != this.cssPreTintColorBlendMode) {
          this.setColorFilterMatrix()
        }
        return true
      case 'capInsets':
        let map = HRValueUtils.getMap(propValue as HippyAny)
        if (map) {
          let left = Math.round(HRValueUtils.getNumber(map.get("left")))
          let top = Math.round(HRValueUtils.getNumber(map.get("top")))
          let right = Math.round(HRValueUtils.getNumber(map.get("right")))
          let bottom = Math.round(HRValueUtils.getNumber(map.get("bottom")))
          this.resizable = { slice: { top: top, right: right, bottom: bottom, left: left }}
        } else {
          this.resizable = null
        }
        return true
      case 'draggable':
        let draggable = HRValueUtils.getBoolean(propValue as HippyAny, false)
        this.draggable = draggable;
        return true
      default:
        break
    }
    return super.setProp(propKey, propValue as HippyAny)
  }

  isImageSpan(): boolean {
    if(this.parentView && this.parentView.viewType == "Text") {
      return true;
    }
    return false;
  }

  protected updateRenderViewFrame(frame: HRRect, padding: HRPadding | null): void {
    if(this.isImageSpan()) {
      if(frame.x != 0 || frame.y != 0) { // c 测得span的位置
        this.cssPositionX = frame.x
        this.cssPositionY = frame.y
      }
      return;
    }
    super.updateRenderViewFrame(frame, padding)
  }

  private initCallbacks() {
    if (!this.onCompleteCallback) {
      this.onCompleteCallback = (event) => {
        if (event?.loadingStatus !== 1) {
          return
        }
        // send onLoad event
        HREventUtils.sendComponentEvent(this.ctx, this.tag, HREventUtils.EVENT_IMAGE_ON_LOAD, null)
        let params = new Map<string, HippyAny>()
        params.set("success", 1)
        let imageSize = new Map<string, number>()
        imageSize.set("width", event?.width)
        imageSize.set("height", event?.height)
        params.set("image", imageSize)
        // send onLoadEnd event
        HREventUtils.sendComponentEvent(this.ctx, this.tag, HREventUtils.EVENT_IMAGE_LOAD_END, params as HippyAny)
      }
    }
    if (!this.onErrorCallback) {
      this.onErrorCallback = (error: ImageError) => {
        LogUtils.d(this.TAG, `onErrorCallback, w: ${error.componentWidth}, h: ${error.componentHeight}, msg: ${error.message}`)
        // send onError event
        HREventUtils.sendComponentEvent(this.ctx, this.tag, HREventUtils.EVENT_IMAGE_LOAD_ERROR, null)
        let params = new Map<string, number>()
        params.set("success", 0)
        // send onLoadEnd event
        HREventUtils.sendComponentEvent(this.ctx, this.tag, HREventUtils.EVENT_IMAGE_LOAD_END, params)
      }
    }
  }

  fetchImage() {
    if (!this.cssSrc || typeof this.cssSrc !== 'string') {
      return
    }
    if (this.cssSrc.startsWith(HRImageView.BASE64_IMAGE_PREFIX)) {
      this.src = this.cssSrc
      return
    } else if (this.cssSrc.startsWith(HRImageView.RAW_IMAGE_PREFIX)) {
      this.src = this.convertToLocalPath(this.cssSrc)
      this.src = $rawfile(this.src)
      return
    } else if (UrlUtils.isWebUrl(this.cssSrc)) {
      this.src = this.cssSrc
      return
    }

    // for asset:/xxx
    let src = this.cssSrc
    let listener: ImageRequestListener = {
      onRequestStart: (imageData: ImageDataSupplier) => {},
      onRequestSuccess: (imageData: PixelMap) => {
        this.src = imageData
      },
      onRequestFail: () => {
        // this.src = src
      },
      onRequestProgress: (total: number, loaded: number) => {}
    }
    let imageLoader = this.ctx.getNativeRender()!.getImageLoader()!
    imageLoader.fetchImageAsync(src, listener, new HashMap<string, HippyAny>(), this.cssWidth, this.cssHeight)
  }

  getImage() {
    LogUtils.d(this.TAG,"getImage")
    if (typeof this.cssSrc == 'string') {
      if (this.cssSrc.startsWith(HRImageView.BASE64_IMAGE_PREFIX)) {
        return this.cssSrc
      } else if (this.cssSrc.startsWith(HRImageView.RAW_IMAGE_PREFIX)) {
        this.cssSrc = this.convertToLocalPath(this.cssSrc)
        LogUtils.d(this.TAG, "getImage: cssSrc= " + this.cssSrc)
        return $rawfile(this.cssSrc)
      }
    }
    return this.cssSrc
  }

  convertToLocalPath(uri: string): string {
    // hpfile://./assets/file_banner02.jpg
    if (uri != null && uri.startsWith("hpfile://")) {
      let relativePath = uri.replace("hpfile://./", "");
      let bundlePath = this.ctx.getNativeRender().getBundlePath()
      bundlePath = bundlePath.replace("asset:/", "")
      return bundlePath.substring(0, bundlePath.lastIndexOf("/") + 1) + relativePath
    }
    return uri
  }
}

@Component
export struct HRImage {
  @ObjectLink renderView: HRImageView
  build() {
    Image(this.renderView.src)
      .applyRenderViewBaseAttr(this.renderView)
      .alt(this.renderView.cssAlt)
      .objectFit(this.renderView.cssResizeMode)
      .objectRepeat(this.renderView.imageRepeat)
      .colorFilter(this.renderView.cssColorFilter)
      .resizable(this.renderView.resizable)
      .draggable(this.renderView.draggable)
      .onComplete(this.renderView.onCompleteCallback)
      .onError(this.renderView.onErrorCallback)
  }
}

// base props for all components
@Extend(Image)
function applyRenderViewBaseAttr($$: HippyRenderBaseView) {
  .key(HIPPY_COMPONENT_KEY_PREFIX + $$.tag)
  .backgroundColor($$.cssBackgroundColor)
  .position({x: $$.cssPositionX, y: $$.cssPositionY})
  .size({width:$$.cssWidth, height: $$.cssHeight})
  .opacity($$.cssOpacity)
  .clip($$.cssOverflow)
  .visibility(($$ as HippyRenderBaseView).cssVisibility) // must add as, otherwise the compiler has error
  .zIndex($$.cssZIndex)
  .accessibilityText($$.cssAccessibilityLabel)
  .focusable($$.cssFocusable)
  .border($$.cssBorder)
  .shadow($$.cssShadow)
  .linearGradient($$.cssLinearGradient)
  .backgroundImage($$.cssBackgroundImage)
  .backgroundImageSize($$.cssBackgroundImageSize)
  .backgroundImagePosition($$.cssBackgroundImagePosition)
  .transform($$.cssMatrix)
  .rotate($$.cssRotate)
  .scale($$.cssScale)
  .translate($$.cssTranslate)
  .hitTestBehavior($$.hitTestBehavior)
  .onClick($$.eventClick)
}
