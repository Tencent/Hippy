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
import matrix4 from '@ohos.matrix4';
import { HippyAny,
  HippyArray,
  HippyMap,
  HippyRecord,
  HippyRenderCallback,
  HippyValue } from '../../../support/common/HippyTypes';
import { LogUtils } from '../../../support/utils/LogUtils';
import { HRNodeProps } from '../../dom_node/HRNodeProps';
import { NativeRenderContext } from '../../NativeRenderContext';
import { HRGestureDispatcher } from '../../uimanager/HRGestureDispatcher';
import { HRConvertUtil } from '../../utils/HRConvertUtil';
import { HRPadding, HRRect } from '../../utils/HRTypes';
import { HRValueUtils } from '../../utils/HRValueUtils';

export const HIPPY_COMPONENT_KEY_PREFIX = "HippyKey"

@Observed
export class HippyObservedArray<T> extends Array<T> {
}

export default abstract class HippyRenderBaseView {
  ctx: NativeRenderContext
  tag: number = -1
  viewType: string = ""
  children: HippyObservedArray<HippyRenderBaseView> = new HippyObservedArray()
  parentView: HippyRenderBaseView | null = null

  cssBackgroundColor: number | null = null
  cssVisibility: Visibility| null = null
  cssOpacity: number | null = null
  cssPositionX: number = 0
  cssPositionY: number = 0
  cssWidth: number = 0
  cssHeight: number = 0
  cssOverflow: boolean | null = null
  cssZIndex: number | null = null
  cssAccessibilityLabel: string | null = null
  cssFocusable: boolean | null = null
  cssBorder: BorderOptions | undefined = undefined
  cssShadow: ShadowOptions | undefined = undefined
  cssShadowColor: number = 0
  cssShadowOpacity: number | undefined = undefined
  cssLinearGradient: LinearGradient | null = null
  cssBackgroundImage: ResourceStr | null = null
  cssBackgroundImagePosition: Position | null = null
  cssBackgroundImageSize: ImageSize | null = null
  cssRotate: RotateOptions | null = null
  cssScale: ScaleOptions | null = null
  cssTranslate: TranslateOptions | null = null
  cssMatrix: matrix4.Matrix4Transit | null = null
  hitTestBehavior: HitTestMode = HitTestMode.Default
  flagInterceptPullUp: boolean = false
  eventClick: ((event: ClickEvent) => void) | null = null
  eventLongPress: ((event: GestureEvent | null) => void) | null = null
  eventPressIn: ((event: GestureEvent | null) => void) | null = null
  eventPressOut: ((event: GestureEvent | null) => void) | null = null
  eventTouchDown: ((event: TouchEvent) => void) | null = null
  eventTouchUp: ((event: TouchEvent) => void) | null = null
  eventTouchMove: ((event: TouchEvent) => void) | null = null
  eventTouchCancel: ((event: TouchEvent) => void) | null = null
  eventAttachedToWindow: (() => void) | null = null
  eventDetachedFromWindow: (() => void) | null = null

  events: Map<string, HippyAny> | null = null

  // used for intercept pull up
  hasHandledPullUp: boolean = false
  savedTouchDownPositionX: number = 0
  savedTouchDownPositionY: number = 0
  savedHitTestBehavior: HitTestMode = HitTestMode.Default

  constructor(ctx: NativeRenderContext) {
    this.ctx = ctx
  }

  protected handleGestureBySelf(): boolean {
    return false
  }

  setProp(propKey: string, propValue: HippyAny): boolean {
    switch (propKey) {
      case HRNodeProps.VISIBILITY:
        this.cssVisibility = HRValueUtils.getString(propValue) != HRNodeProps.HIDDEN ? Visibility.Visible : Visibility.Hidden
        break
      case HRNodeProps.BACKGROUND_COLOR:
        let value = HRValueUtils.getNumber(propValue)
        this.cssBackgroundColor = value ? value : Color.Transparent
        break
      case HRNodeProps.OPACITY:
        this.cssOpacity = HRValueUtils.getNumber2(propValue, 1.0)
        break
      case HRNodeProps.TRANSFORM:
        this.setTransformProp(propKey, propValue)
        break
      case HRNodeProps.OVERFLOW:
        this.cssOverflow = HRValueUtils.getString(propValue) != HRNodeProps.HIDDEN ? false : true
        break
      case HRNodeProps.Z_INDEX:
        this.cssZIndex = HRValueUtils.getNumber(propValue)
        break
      case HRNodeProps.PROP_ACCESSIBILITY_LABEL:
        this.cssAccessibilityLabel = HRValueUtils.getString(propValue)
        break
      case HRNodeProps.FOCUSABLE:
        this.cssFocusable = HRValueUtils.getBoolean(propValue, false)
        break
      case HRNodeProps.REQUEST_FOCUS:
        focusControl.requestFocus(HIPPY_COMPONENT_KEY_PREFIX + this.tag)
        break
      case HRNodeProps.LINEAR_GRADIENT:
        this.setLinearGradientProp(propKey, propValue)
        break
      default:
        {
          let handled = this.setBackgroundImageProp(propKey, propValue)
          if (!handled) {
            handled = this.setBorderProp(propKey, propValue)
          }
          if (!handled) {
            handled = this.setShadowProp(propKey, propValue)
          }
          if (!handled) {
            this.setEventProp(propKey, propValue)
          }
        }
        break
    }
    return true
  }

  updateEventListener(newEvents: HippyMap) {
    this.events = newEvents
  }

  checkRegisteredEvent(eventName: string): boolean {
    if (this.events && this.events.has(eventName)) {
      let value = this.events.get(eventName)
      if (typeof value == 'boolean') {
        return value
      }
    }
    return false
  }

  private setTransformProp(propKey: string, propValue: HippyAny): boolean {
    let transform = HRConvertUtil.toTransform(propValue as HippyArray)
    if (transform) {
      this.cssScale = transform.scale
      this.cssTranslate = transform.translate
      this.cssRotate = transform.rotate
      this.cssMatrix = transform.matrix
    }
    return true
  }

  private setLinearGradientProp(propKey: string, propValue: HippyAny): boolean {
    let m = HRValueUtils.getMap(propValue)
    if (!m) {
      return false
    }

    let angle = HRValueUtils.getString((m as Map<string, HippyAny>).get('angle') as HippyAny)
    let colorStopList = HRValueUtils.getArray((m as Map<string, HippyAny>).get('colorStopList') as HippyArray)
    if (!angle || angle.length == 0 || !colorStopList || colorStopList.length == 0) {
      return false
    }

    let size = colorStopList.length
    let colorsArray = new Array<[ResourceColor, number]>()
    for (let i = 0; i < size; i++) {
      let colorStop = HRValueUtils.getMap(colorStopList[i])
      if (!colorStop) {
        continue
      }
      let color = HRValueUtils.getNumber(colorStop.get('color') as HippyAny)
      // change color to transparent when color is 0x00000000
      if (color == 0) {
          color = Color.Transparent
      }
      let ratio = 0.0
      if (colorStop.get('ratio')) {
        ratio = HRValueUtils.getNumber(colorStop.get('ratio') as HippyAny)
      } else if (i == size - 1) {
        ratio = 1.0
      }
      colorsArray.push([color, ratio])
    }

    switch (angle) {
      case 'totopright':
        this.cssLinearGradient = { direction: GradientDirection.RightTop, colors: colorsArray }
        break
      case 'tobottomright':
        this.cssLinearGradient = { direction: GradientDirection.RightBottom, colors: colorsArray }
        break
      case 'tobottomleft':
        this.cssLinearGradient = { direction: GradientDirection.LeftBottom, colors: colorsArray }
        break
      case 'totopleft':
        this.cssLinearGradient = { direction: GradientDirection.LeftTop, colors: colorsArray }
        break
      default: {
        let value = Math.trunc(HRValueUtils.getNumber(angle)) % 360
        this.cssLinearGradient = { angle: value, colors: colorsArray }
      }
        break
    }
    return true
  }

  private setBackgroundImageProp(propKey: string, propValue: HippyAny): boolean {
    switch (propKey) {
      case HRNodeProps.BACKGROUND_IMAGE:
        if (typeof propValue == 'string') {
          this.cssBackgroundImage = this.convertToLocalPathIfNeeded(propValue)
        }
        break
      case HRNodeProps.BACKGROUND_POSITION_X:
        if (!this.cssBackgroundImagePosition) {
          this.cssBackgroundImagePosition = { x: 0, y: 0}
        }
        this.cssBackgroundImagePosition.x = HRValueUtils.getNumber(propValue)
        break
      case HRNodeProps.BACKGROUND_POSITION_Y:
        if (!this.cssBackgroundImagePosition) {
          this.cssBackgroundImagePosition = { x: 0, y: 0}
        }
        this.cssBackgroundImagePosition.y = HRValueUtils.getNumber(propValue)
        break
      case HRNodeProps.BACKGROUND_SIZE:
        this.cssBackgroundImageSize = HRConvertUtil.toImageSize(propValue)
        break
      default:
        return false
    }
    return true
  }

  protected convertToLocalPathIfNeeded(uri: string): ResourceStr {
    // hpfile://./assets/defaultSource.jpg
    if (uri != null) {
      if (uri.startsWith("hpfile://")) {
        let relativePath = uri.replace("hpfile://./", "");
        let bundlePath = this.ctx.getNativeRender().getBundlePath()
        bundlePath = bundlePath.replace("asset:/", "")
        uri = bundlePath.substring(0, bundlePath.lastIndexOf("/") + 1) + relativePath
        return $rawfile(uri)
      } else if (uri.startsWith("asset:/")) {
        uri = uri.replace("asset:/", "")
        return $rawfile(uri)
      }
    }
    return uri
  }

  private setBorderProp(propKey: string, propValue: HippyAny): boolean {
    switch (propKey) {
      case HRNodeProps.BORDER_RADIUS: {
        this.checkAndBuildCssBorderRadius();
        let value: number = HRValueUtils.getNumber(propValue);
        (this.cssBorder?.radius as BorderRadiuses).topLeft = value;
        (this.cssBorder?.radius as BorderRadiuses).topRight = value;
        (this.cssBorder?.radius as BorderRadiuses).bottomRight = value;
        (this.cssBorder?.radius as BorderRadiuses).bottomLeft = value;
      }
        break
      case HRNodeProps.BORDER_TOP_LEFT_RADIUS:
        this.checkAndBuildCssBorderRadius();
        (this.cssBorder?.radius as BorderRadiuses).topLeft = HRValueUtils.getNumber(propValue)
        break
      case HRNodeProps.BORDER_TOP_RIGHT_RADIUS:
        this.checkAndBuildCssBorderRadius();
        (this.cssBorder?.radius as BorderRadiuses).topRight = HRValueUtils.getNumber(propValue)
        break
      case HRNodeProps.BORDER_BOTTOM_RIGHT_RADIUS:
        this.checkAndBuildCssBorderRadius();
        (this.cssBorder?.radius as BorderRadiuses).bottomRight = HRValueUtils.getNumber(propValue)
        break
      case HRNodeProps.BORDER_BOTTOM_LEFT_RADIUS:
        this.checkAndBuildCssBorderRadius();
        (this.cssBorder?.radius as BorderRadiuses).bottomLeft = HRValueUtils.getNumber(propValue)
        break
      case HRNodeProps.BORDER_WIDTH: {
        this.checkAndBuildCssBorderWidth();
        let value: number = HRValueUtils.getNumber(propValue);
        (this.cssBorder?.width as EdgeWidths).top = value;
        (this.cssBorder?.width as EdgeWidths).right = value;
        (this.cssBorder?.width as EdgeWidths).bottom = value;
        (this.cssBorder?.width as EdgeWidths).left = value;
      }
        break
      case HRNodeProps.BORDER_TOP_WIDTH:
        this.checkAndBuildCssBorderWidth();
        (this.cssBorder?.width as EdgeWidths).top = HRValueUtils.getNumber(propValue)
        break
      case HRNodeProps.BORDER_RIGHT_WIDTH:
        this.checkAndBuildCssBorderWidth();
        (this.cssBorder?.width as EdgeWidths).right = HRValueUtils.getNumber(propValue)
        break
      case HRNodeProps.BORDER_BOTTOM_WIDTH:
        this.checkAndBuildCssBorderWidth();
        (this.cssBorder?.width as EdgeWidths).bottom = HRValueUtils.getNumber(propValue)
        break
      case HRNodeProps.BORDER_LEFT_WIDTH:
        this.checkAndBuildCssBorderWidth();
        (this.cssBorder?.width as EdgeWidths).left = HRValueUtils.getNumber(propValue)
        break
      case HRNodeProps.BORDER_STYLE: {
        this.checkAndBuildCssBorderStyle();
        let value = HRConvertUtil.toBorderStyle(HRValueUtils.getString(propValue));
        (this.cssBorder?.style as EdgeStyles).top = value;
        (this.cssBorder?.style as EdgeStyles).right = value;
        (this.cssBorder?.style as EdgeStyles).bottom = value;
        (this.cssBorder?.style as EdgeStyles).left = value;
      }
        break
      case HRNodeProps.BORDER_TOP_STYLE:
        this.checkAndBuildCssBorderStyle();
        (this.cssBorder?.style as EdgeStyles).top = HRConvertUtil.toBorderStyle(HRValueUtils.getString(propValue));
        break
      case HRNodeProps.BORDER_RIGHT_STYLE:
        this.checkAndBuildCssBorderStyle();
        (this.cssBorder?.style as EdgeStyles).right = HRConvertUtil.toBorderStyle(HRValueUtils.getString(propValue));
        break
      case HRNodeProps.BORDER_BOTTOM_STYLE:
        this.checkAndBuildCssBorderStyle();
        (this.cssBorder?.style as EdgeStyles).bottom = HRConvertUtil.toBorderStyle(HRValueUtils.getString(propValue));
        break
      case HRNodeProps.BORDER_LEFT_STYLE:
        this.checkAndBuildCssBorderStyle();
        (this.cssBorder?.style as EdgeStyles).left = HRConvertUtil.toBorderStyle(HRValueUtils.getString(propValue));
        break
      case HRNodeProps.BORDER_COLOR: {
        this.checkAndBuildCssBorderColor();
        let value: number = HRValueUtils.getNumber(propValue);
        (this.cssBorder?.color as EdgeColors).top = value;
        (this.cssBorder?.color as EdgeColors).right = value;
        (this.cssBorder?.color as EdgeColors).bottom = value;
        (this.cssBorder?.color as EdgeColors).left = value;
      }
        break
      case HRNodeProps.BORDER_TOP_COLOR:
        this.checkAndBuildCssBorderColor();
        (this.cssBorder?.color as EdgeColors).top = HRValueUtils.getNumber(propValue);
        break
      case HRNodeProps.BORDER_RIGHT_COLOR:
        this.checkAndBuildCssBorderColor();
        (this.cssBorder?.color as EdgeColors).right = HRValueUtils.getNumber(propValue);
        break
      case HRNodeProps.BORDER_BOTTOM_COLOR:
        this.checkAndBuildCssBorderColor();
        (this.cssBorder?.color as EdgeColors).bottom = HRValueUtils.getNumber(propValue);
        break
      case HRNodeProps.BORDER_LEFT_COLOR:
        this.checkAndBuildCssBorderColor();
        (this.cssBorder?.color as EdgeColors).left = HRValueUtils.getNumber(propValue);
        break
      default:
        return false
    }
    return true
  }

  private checkAndBuildCssBorder() {
    this.cssBorder = {
      width: this.cssBorder?.width,
      color: this.cssBorder?.color,
      radius: this.cssBorder?.radius,
      style: this.cssBorder?.style
    }
  }

  private checkAndBuildCssBorderWidth() {
    this.checkAndBuildCssBorder();
    let cssBorder = this.cssBorder as BorderOptions
    if (!cssBorder.width) {
      cssBorder.width = {top: undefined, right: undefined, bottom: undefined, left: undefined}
    }
  }

  private checkAndBuildCssBorderColor() {
    this.checkAndBuildCssBorder();
    let cssBorder = this.cssBorder as BorderOptions
    if (!cssBorder.color) {
      cssBorder.color = {top: undefined, right: undefined, bottom: undefined, left: undefined}
    }
  }

  private checkAndBuildCssBorderRadius() {
    this.checkAndBuildCssBorder();
    let cssBorder = this.cssBorder as BorderOptions
    if (!cssBorder.radius) {
      cssBorder.radius = {topLeft: undefined, topRight: undefined, bottomLeft:undefined, bottomRight: undefined}
    }
  }

  private checkAndBuildCssBorderStyle() {
    this.checkAndBuildCssBorder();
    let cssBorder = this.cssBorder as BorderOptions
    if (!cssBorder.style) {
      cssBorder.style = {top: undefined, right: undefined, bottom: undefined, left: undefined}
    }
  }

  private setShadowProp(propKey: string, propValue: HippyAny): boolean {
    switch (propKey) {
      case HRNodeProps.SHADOW_OFFSET: {
        this.checkAndBuildCssShadow();
        let m = HRValueUtils.getMap(propValue);
        let x = m ? (m as HippyMap).get('x') : 0;
        let y = m ? (m as HippyMap).get('y') : 0;
        (this.cssShadow as ShadowOptions).offsetX = vp2px(HRValueUtils.getNumber(x as HippyAny));
        (this.cssShadow as ShadowOptions).offsetY = vp2px(HRValueUtils.getNumber(y as HippyAny));
      }
        break
      case HRNodeProps.SHADOW_OFFSET_X:
        this.checkAndBuildCssShadow();
        (this.cssShadow as ShadowOptions).offsetX = vp2px(HRValueUtils.getNumber(propValue));
        break
      case HRNodeProps.SHADOW_OFFSET_Y:
        this.checkAndBuildCssShadow();
        (this.cssShadow as ShadowOptions).offsetY = vp2px(HRValueUtils.getNumber(propValue));
        break
      case HRNodeProps.SHADOW_OPACITY:
        this.checkAndBuildCssShadow();
        this.cssShadowOpacity = HRValueUtils.getNumber(propValue); // 0-1.0
        (this.cssShadow as ShadowOptions).color = HRConvertUtil.toColorWithNumberAndOpacity(this.cssShadowColor, this.cssShadowOpacity);
        break
      case HRNodeProps.SHADOW_RADIUS:
        this.checkAndBuildCssShadow();
        (this.cssShadow as ShadowOptions).radius = vp2px(HRValueUtils.getNumber(propValue));
        break
      case HRNodeProps.SHADOW_COLOR:
        this.checkAndBuildCssShadow();
        this.cssShadowColor = HRValueUtils.getNumber(propValue);
        if (this.cssShadowOpacity == undefined) {
          (this.cssShadow as ShadowOptions).color = HRConvertUtil.toColorWithNumber(this.cssShadowColor);
        } else {
          (this.cssShadow as ShadowOptions).color = HRConvertUtil.toColorWithNumberAndOpacity(this.cssShadowColor, this.cssShadowOpacity);
        }
        break
      case HRNodeProps.SHADOW_SPREAD:
        // ohos not support
        break
      default:
        return false
    }
    return true
  }

  private checkAndBuildCssShadow() {
    if(!this.cssShadow) {
      this.cssShadow = {radius: 0, type: ShadowType.COLOR, color: undefined, offsetX: undefined, offsetY: undefined}
    }
  }

  private setEventProp(propKey: string, propValue: HippyAny): boolean {
    switch (propKey) {
      case HRNodeProps.ON_CLICK:
        if (typeof propValue == 'boolean') {
          this.setClickable(propValue)
        }
        break
      case HRNodeProps.ON_LONG_CLICK:
        if (typeof propValue == 'boolean') {
          this.setLongClickable(propValue)
        }
        break
      case HRNodeProps.ON_PRESS_IN:
        if (typeof propValue == 'boolean') {
          this.setPressIn(propValue)
        }
        break
      case HRNodeProps.ON_PRESS_OUT:
        if (typeof propValue == 'boolean') {
          this.setPressOut(propValue)
        }
        break
      case HRNodeProps.ON_TOUCH_DOWN:
        if (typeof propValue == 'boolean') {
          this.setTouchDownHandle(propValue)
        }
        break
      case HRNodeProps.ON_TOUCH_MOVE:
        if (typeof propValue == 'boolean') {
          this.setTouchMoveHandle(propValue)
        }
        break
      case HRNodeProps.ON_TOUCH_END:
        if (typeof propValue == 'boolean') {
          this.setTouchEndHandle(propValue)
        }
        break
      case HRNodeProps.ON_TOUCH_CANCEL:
        if (typeof propValue == 'boolean') {
          this.setTouchCancelHandle(propValue)
        }
        break
      case HRNodeProps.ON_INTERCEPT_TOUCH_EVENT:
        if (typeof propValue == 'boolean') {
          this.setInterceptTouch(propValue)
        }
        break
      case HRNodeProps.ON_INTERCEPT_PULL_UP_EVENT:
        if (typeof propValue == 'boolean') {
          this.setInterceptPullUp(propValue)
        }
        break
      case HRNodeProps.ON_ATTACHED_TO_WINDOW:
        if (typeof propValue == 'boolean') {
          this.setAttachedToWindowHandle(propValue)
        }
        break
      case HRNodeProps.ON_DETACHED_FROM_WINDOW:
        if (typeof propValue == 'boolean') {
          this.setDetachedFromWindowHandle(propValue)
        }
        break
      default:
        return false
    }
    return true
  }

  private setClickable(flag: boolean) {
    if (this.handleGestureBySelf()) {
      return
    }
    if (flag) {
      this.eventClick = (event) => {
        HRGestureDispatcher.handleClickEvent(this.ctx, this.tag, HRNodeProps.ON_CLICK)
      }
    } else {
      this.eventClick = null
    }
  }

  private setLongClickable(flag: boolean) {
    if (this.handleGestureBySelf()) {
      return
    }
    if (flag) {
      this.eventLongPress = (event) => {
        HRGestureDispatcher.handleClickEvent(this.ctx, this.tag, HRNodeProps.ON_LONG_CLICK)
      }
    } else {
      this.eventLongPress = null
    }
  }

  private setPressIn(flag: boolean) {
    if (this.handleGestureBySelf()) {
      return
    }
    if (flag) {
      this.eventPressIn = (event) => {
        HRGestureDispatcher.handleClickEvent(this.ctx, this.tag, HRNodeProps.ON_PRESS_IN)
      }
    } else {
      this.eventPressIn = null
    }
  }

  private setPressOut(flag: boolean) {
    if (this.handleGestureBySelf()) {
      return
    }
    if (flag) {
      this.eventPressOut = (event) => {
        HRGestureDispatcher.handleClickEvent(this.ctx, this.tag, HRNodeProps.ON_PRESS_OUT)
      }
    } else {
      this.eventPressOut = null
    }
  }

  private setTouchDownHandle(flag: boolean) {
    if (this.handleGestureBySelf()) {
      return
    }
    if (flag) {
      this.eventTouchDown = (event) => {
        let touch = event.touches[0]
        HRGestureDispatcher.handleTouchEvent(this.ctx, this.tag, touch.windowX, touch.windowY, HRNodeProps.ON_TOUCH_DOWN)
      }
    } else {
      this.eventTouchDown = null
    }
  }

  private setTouchMoveHandle(flag: boolean) {
    if (this.handleGestureBySelf()) {
      return
    }
    if (flag) {
      this.eventTouchMove = (event) => {
        let touch = event.touches[0]
        HRGestureDispatcher.handleTouchEvent(this.ctx, this.tag, touch.windowX, touch.windowY, HRNodeProps.ON_TOUCH_MOVE)
      }
    } else {
      this.eventTouchMove = null
    }
  }

  private setTouchEndHandle(flag: boolean) {
    if (this.handleGestureBySelf()) {
      return
    }
    if (flag) {
      this.eventTouchUp = (event) => {
        let touch = event.touches[0]
        HRGestureDispatcher.handleTouchEvent(this.ctx, this.tag, touch.windowX, touch.windowY, HRNodeProps.ON_TOUCH_END)
      }
    } else {
      this.eventTouchUp = null
    }
  }

  private setTouchCancelHandle(flag: boolean) {
    if (this.handleGestureBySelf()) {
      return
    }
    if (flag) {
      this.eventTouchCancel = (event) => {
        let touch = event.touches[0]
        HRGestureDispatcher.handleTouchEvent(this.ctx, this.tag, touch.windowX, touch.windowY, HRNodeProps.ON_TOUCH_CANCEL)
      }
    } else {
      this.eventTouchCancel = null
    }
  }

  private setInterceptTouch(flag: boolean) {
    if (this.handleGestureBySelf()) {
      return
    }
    this.hitTestBehavior = flag ? HitTestMode.Block : HitTestMode.Default
  }

  private setInterceptPullUp(flag: boolean) {
    if (this.handleGestureBySelf()) {
      return
    }
    this.flagInterceptPullUp = flag
  }

  handleInterceptPullUp(event: TouchEvent) {
    switch (event.type) {
      case TouchType.Down: {
        let touch = event.touches[0]
        this.savedTouchDownPositionX = touch.x
        this.savedTouchDownPositionY = touch.y
        this.savedHitTestBehavior = this.hitTestBehavior
        this.hasHandledPullUp = false
      }
        break
      case TouchType.Move: {
        if (this.hasHandledPullUp) {
          return
        }
        let touch = event.touches[0]
        let dx = touch.x - this.savedTouchDownPositionX
        let dy = touch.y - this.savedTouchDownPositionY
        if (dy < 0 && Math.abs(dx) < Math.abs(dy) && Math.abs(dy) > px2vp(16)) {
          this.hasHandledPullUp = true
          this.hitTestBehavior = HitTestMode.Block
        }
      }
        break
      case TouchType.Up:
      case TouchType.Cancel: {
        this.hasHandledPullUp = false
        this.hitTestBehavior = this.savedHitTestBehavior
      }
        break
    }
  }

  private setAttachedToWindowHandle(flag: boolean) {
    if (flag) {
      this.eventAttachedToWindow = () => {
        HRGestureDispatcher.handleAttachedToWindow(this.ctx, this.tag)
      }
    } else {
      this.eventAttachedToWindow = null
    }
  }

  private setDetachedFromWindowHandle(flag: boolean) {
    if (flag) {
      this.eventDetachedFromWindow = () => {
        HRGestureDispatcher.handleDetachedFromWindow(this.ctx, this.tag)
      }
    } else {
      this.eventDetachedFromWindow = null
    }
  }

  call(method: string, params: Array<HippyAny>, callback: HippyRenderCallback | null): void {

  }

  onChildInserted(childTag: number, childViewName: string, childIndex: number): void {

  }

  onChildRemoved(childTag: number, childViewName: string, childIndex: number): void {

  }

  onDestroy(): void {

  }

  addSubRenderView(subView: HippyRenderBaseView, index: number): void {
    if (index < 0 || index > this.children.length) {
      index = this.children.length
    }
    subView.parentView = this
    this.children.splice(index, 0, subView)
  }

  removeSubView(subView: HippyRenderBaseView) {
    let index = this.children.indexOf(subView)
    if (index >= 0 && index < this.children.length) {
      this.children.splice(index, 1)
    }
  }

  removeFromParentView(): void {
    if (this.parentView) {
      this.parentView.removeSubView(this)
      this.parentView = null
    }
  }

  protected updateRenderViewFrame(frame: HRRect, padding: HRPadding | null): void {
    this.cssPositionX = frame.x
    this.cssPositionY = frame.y
    this.cssWidth = frame.width
    this.cssHeight = frame.height
  }

  setRenderViewFrame(frame: HRRect, padding: HRPadding | null): void {
    this.updateRenderViewFrame(frame, padding)
  }

}
