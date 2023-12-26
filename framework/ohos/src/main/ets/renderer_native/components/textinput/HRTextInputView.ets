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

import {
  HippyAny,
  HippyMap,
  HippyRenderCallback,
  HippyValue
} from '../../../support/common/HippyTypes';
import { NativeRenderContext } from '../../NativeRenderContext';
import HippyRenderBaseView, { HippyObservedArray,
  HIPPY_COMPONENT_KEY_PREFIX } from '../base/HippyRenderBaseView';
import { LogUtils } from '../../../support/utils/LogUtils';
import { HREventUtils } from '../../utils/HREventUtils';
import { HRValueUtils } from '../../utils/HRValueUtils';
import { HRNodeProps } from '../../dom_node/HRNodeProps';
import { Callback } from '@ohos.base';
import window from '@ohos.window';
import { HRPadding, HRRect } from '../../utils/HRTypes';

type LocalFontWeight = number | FontWeight

@Observed
export class HRTextInputView extends HippyRenderBaseView {
  cssPadding: Padding = { top: 0, right: 0, bottom: 0, left: 0 }
  public caretColor: ResourceColor = Color.Transparent
  public color: ResourceColor = Color.Black
  public fontFamily: string = 'HarmonyOS Sans'
  public fontSize: number = 18
  public fontStyle: FontStyle = FontStyle.Normal
  public fontWeight: LocalFontWeight = FontWeight.Normal
  public maxLength: number = 0xFFFFFFFF
  public multiline: boolean = false
  public textAlign: TextAlign = TextAlign.Start
  public textAlignVertical: Alignment = Alignment.Center
  public value: string = ''
  public keyboardType: InputType = InputType.Normal
  public returnKeyType: EnterKeyType = EnterKeyType.Done
  public placeholder: string = ''
  public placeholderTextColor: ResourceColor = Color.Gray
  public maxLines: number = 10000000
  public uiCtx: UIContext | null = null

  isListenChangeText: boolean = false
  isListenSelectionChange: boolean = false
  isListenEndEditing: boolean = false
  isListenFocus: boolean = false
  isListenBlur: boolean = false
  isListenKeyboardWillShow: boolean = false
  isListenKeyboardWillHide: boolean = false
  isListenContentSizeChange: boolean = false

  focus: boolean = false
  previousContentWidth: number = 0
  previousContentHeight: number = 0

  controller: TextInputController = new TextInputController()
  textAreaController: TextAreaController = new TextAreaController()

  constructor(ctx: NativeRenderContext) {
    super(ctx)
    this.cssBackgroundColor = Color.Transparent
    this.cssBorder = { radius: 0 }
  }

  setProp(propKey: string, propValue: HippyAny): boolean {
    LogUtils.d("HRTextInput", `propKey:${propKey}, propValue:${propValue}`)
    if (propKey === 'caret-color') {
      this.caretColor = HRValueUtils.getNumber(propValue as HippyAny)
      return true
    } else if (propKey === 'color') {
      this.color = HRValueUtils.getNumber(propValue as HippyAny)
      return true
    } else if (propKey === 'defaultValue') {
      this.value = HRValueUtils.getString(propValue as HippyAny)
      return true
    } else if (propKey === 'fontFamily') {
      this.fontFamily = HRValueUtils.getString(propValue as HippyAny)
      return true
    } else if (propKey === 'fontSize') {
      this.fontSize = HRValueUtils.getNumber2(propValue as HippyAny, HRNodeProps.FONT_SIZE_SP)
      return true
    } else if (propKey === 'fontStyle') {
      let fontStyle = HRValueUtils.getString(propValue as HippyAny)
      if (fontStyle === 'italic') {
        this.fontStyle = FontStyle.Italic
      }
      return true
    } else if (propKey === 'fontWeight') {
      this.setFontWeight(propValue)
      return true
    } else if (propKey === 'maxLength') {
      this.maxLength = HRValueUtils.getNumber(propValue as HippyAny)
      return true
    } else if (propKey === 'multiline') {
      this.multiline = HRValueUtils.getBoolean(propValue as HippyAny, true)
      if (this.multiline) {
        this.textAlignVertical = Alignment.Top
      }
      return true
    } else if (propKey === 'textAlign') {
      this.setTextAlign(propValue)
      return true
    } else if (propKey === 'textAlignVertical') {
      this.setTextAlignVertical(propValue)
      return true
    } else if (propKey === 'placeholder') {
      this.placeholder = HRValueUtils.getString(propValue as HippyAny)
      return true
    } else if (propKey === 'placeholderTextColor') {
      this.placeholderTextColor = HRValueUtils.getNumber(propValue as HippyAny)
      return true
    } else if (propKey === 'numberOfLines') {
      this.maxLines = HRValueUtils.getNumber(propValue as HippyAny)
      return true
    } else if (propKey === 'keyboardType') {
      this.setKeyBoardType(propValue)
      return true
    } else if (propKey === 'returnKeyType') {
      this.setEntryKeyType(propValue)
      return true
    } else if (propKey === 'value') {
      this.value = HRValueUtils.getString(propValue as HippyAny)
      return true
    } else if (propKey === 'changetext') {
      this.isListenChangeText = HRValueUtils.getBoolean(propValue as HippyAny, false)
      return true
    } else if (propKey === 'selectionchange') {
      this.isListenSelectionChange = HRValueUtils.getBoolean(propValue as HippyAny, false)
      return true
    } else if (propKey === 'endediting') {
      this.isListenEndEditing = HRValueUtils.getBoolean(propValue as HippyAny, false)
      return true
    } else if (propKey === 'focus') {
      this.isListenFocus = HRValueUtils.getBoolean(propValue as HippyAny, false)
      return true
    } else if (propKey === 'blur') {
      this.isListenBlur = HRValueUtils.getBoolean(propValue as HippyAny, false)
      return true
    } else if (propKey === 'keyboardwillshow') {
      this.isListenKeyboardWillShow = HRValueUtils.getBoolean(propValue as HippyAny, false)
      return true
    } else if (propKey === 'keyboardwillhide') {
      this.isListenKeyboardWillHide = HRValueUtils.getBoolean(propValue as HippyAny, false)
      return true
    } else if (propKey === 'contentSizeChange') {
      this.isListenContentSizeChange = HRValueUtils.getBoolean(propValue as HippyAny, false)
      return true
    }

    return super.setProp(propKey, propValue)
  }

  setFontWeight(propValue: HippyAny) {
    let value = HRValueUtils.getString(propValue as HippyAny)

    if (value === '' || value === 'normal') {
      this.fontWeight = FontWeight.Normal
    } else if (value === 'bold') {
      this.fontWeight = FontWeight.Bold
    } else {
      let weight = Number(value) || 0
      if (weight != 0) {
        this.fontWeight = weight
      } else {
        this.fontWeight = FontWeight.Normal
      }
    }
  }

  setTextAlign(propValue: HippyAny) {
    let value = HRValueUtils.getString(propValue as HippyAny)

    //no Gravity.NO_GRAVITY like android
    this.textAlign = TextAlign.Start
    if (value === 'center') {
      this.textAlign = TextAlign.Center
    } else if (value === 'right') {
      this.textAlign = TextAlign.End
    }
  }

  setTextAlignVertical(propValue: HippyAny) {
    let value = HRValueUtils.getString(propValue as HippyAny)

    // no Gravity.NO_GRAVITY like android
    this.textAlignVertical = Alignment.Center
    if (value === 'top') {
      this.textAlignVertical = Alignment.Top
    } else if (value === 'bottom') {
      this.textAlignVertical = Alignment.Bottom
    }
  }

  setKeyBoardType(propValue: HippyAny) {
    this.keyboardType = InputType.Normal

    let type = HRValueUtils.getString(propValue as HippyAny)
    LogUtils.d('HRTextInput', "keyboardType:" + propValue)
    if (type === "numeric") {
      this.keyboardType = InputType.Number
    } else if (type === "password") {
      this.keyboardType = InputType.Password
    } else if (type === "email") {
      this.keyboardType = InputType.Email
    } else if (type === "phone-pad") {
      this.keyboardType = InputType.PhoneNumber
    }
  }

  setEntryKeyType(propValue:HippyAny) {
    this.returnKeyType = EnterKeyType.Done

    let type = HRValueUtils.getString(propValue as HippyAny)
    LogUtils.d('HRTextInput', "returnKeyType:" + type)
    if (type === "go") {
      this.returnKeyType = EnterKeyType.Go
    } else if (type === "next") {
      this.returnKeyType = EnterKeyType.Next
    } else if (type === "search") {
      this.returnKeyType = EnterKeyType.Search
    } else if (type === "send") {
      this.returnKeyType = EnterKeyType.Send
    } else if (type === "previous") {
      this.returnKeyType = EnterKeyType.PREVIOUS
    }
  }

  call(method: string, params: Array<HippyAny>, callback: HippyRenderCallback | null): void {
    LogUtils.d('HRTextInput', `call:${method}, paras:${params}`)
    let result: HippyAny = null
    if (method === "getValue" && callback) {
      result = new Map<string, HippyValue>() as HippyMap;
      result.set("text", this.value);
      callback(result)
    } else if (method === "isFocused" && callback) {
      result = new Map<string, HippyValue>() as HippyMap;
      result.set("value", this.focus);
      callback(result)
    } else if (method === "focusTextInput") {
      this.focusTextInput(params)
    } else if (method === "blurTextInput") {
      this.blurTextInput(params)
    } else if (method === "clear") {
      this.setText(null)
    } else if (method === "hideInputMethod") {
      this.hideInputMethod(params)
    } else if (method === "setValue") {
      this.setText(params)
    }
  }

  setText(params: Array<HippyAny> | null) {
    if (params) {
      if (typeof params[0] != 'string') {
        return
      }

      this.value = params[0]

      let len = params[0].length
      let pos = (params.length < 2) ? len : HRValueUtils.getNumber2(params[1], len)
      this.controller.setTextSelection(pos, pos)
    } else {
      this.value = ''
    }
  }

  focusTextInput(params: Array<HippyAny>) {
    this.uiCtx?.runScopedTask(() => {
      let rtn = focusControl.requestFocus(HIPPY_COMPONENT_KEY_PREFIX + this.tag)
      LogUtils.d('HRTextInput', `focusTextInput key:${HIPPY_COMPONENT_KEY_PREFIX + this.tag}, rtn:${rtn}`)
    })
  }

  blurTextInput(params: Array<HippyAny>) {
    this.controller.stopEditing()
  }

  hideInputMethod(params: Array<HippyAny>) {
    this.controller.stopEditing()
  }

  protected updateRenderViewFrame(frame: HRRect, padding: HRPadding | null): void {
    super.updateRenderViewFrame(frame, padding)
    if (padding) {
      this.cssPadding = { top: padding.paddingTop, right: padding.paddingRight, bottom: padding.paddingBottom, left: padding.paddingLeft }
    }
  }

}

@Component
export struct HRTextInput {
  private readonly TAG = "HRTextInput";
  @ObjectLink renderView: HRTextInputView
  @ObjectLink children: HippyObservedArray<HippyRenderBaseView>

  windowPromise?: Promise<window.Window> = undefined
  keyboardListener: Callback<number> = (height) => {
    if (height > 0) {
      let keyboardHeightMap = new Map<string, HippyValue>()
      keyboardHeightMap.set("keyboardHeight", Math.round(px2vp(height)))
      HREventUtils.sendComponentEvent(this.renderView.ctx, this.renderView.tag, "keyboardWillShow", keyboardHeightMap)
    } else {
      HREventUtils.sendComponentEvent(this.renderView.ctx, this.renderView.tag, "keyboardWillHide", null)
    }
  }

  onEventChange(value: string) {
    LogUtils.d(this.TAG, `onchange:${value}`)
    if (this.renderView.value === value) {
      return
    }

    this.renderView.value = value

    if (this.renderView.isListenChangeText) {
      let params = new Map<string, HippyValue>() as HippyMap;
      params.set("text", value);
      HREventUtils.sendComponentEvent(this.renderView.ctx, this.renderView.tag, "changetext", params);
    }

    if (this.renderView.isListenContentSizeChange) {
      let controller = this.renderView.multiline ? this.renderView.textAreaController : this.renderView.controller
      let contentRect = controller.getTextContentRect()
      if (contentRect.width != this.renderView.previousContentWidth || contentRect.height != this.renderView.previousContentHeight) {
        this.renderView.previousContentWidth = contentRect.width
        this.renderView.previousContentHeight = contentRect.height
        let contentSize = new Map<string, HippyValue>()
        contentSize.set("width", contentRect.width)
        contentSize.set("height", contentRect.height)
        let eventData = new Map<string, HippyAny>()
        eventData.set("contentSize", contentSize)
        HREventUtils.sendComponentEvent(this.renderView.ctx, this.renderView.tag, "onContentSizeChange", eventData as HippyAny)
      }
    }
  }

  onEventTextSelectionChange(start:number, end:number) {
    if (!this.renderView.isListenSelectionChange) {
      return
    }

    let selection = new Map<string, HippyValue>() as HippyMap;
    selection.set("start", start);
    selection.set("end", end);

    let params = new Map<string, HippyAny>();
    params.set("selection", selection);
    HREventUtils.sendComponentEvent(this.renderView.ctx, this.renderView.tag, "selectionchange", params as HippyMap);
    LogUtils.d(this.TAG, `onTextSelectionChange start:${start}, end:${end}, paras:${params}`)
  }

  onEventFocus() {
    LogUtils.d(this.TAG, "onFocus")
    this.renderView.focus = true

    if (!this.renderView.isListenFocus) {
      return
    }

    let params = new Map<string, HippyValue>() as HippyMap;
    params.set("text", this.renderView.value);
    HREventUtils.sendComponentEvent(this.renderView.ctx, this.renderView.tag, "focus", params);
  }

  onEventBlur() {
    LogUtils.d(this.TAG, "onBlur")
    this.renderView.focus = false

    if (!this.renderView.isListenBlur) {
      return
    }

    let params = new Map<string, HippyValue>() as HippyMap;
    params.set("text", this.renderView.value);
    HREventUtils.sendComponentEvent(this.renderView.ctx, this.renderView.tag, "blur", params);
  }

  onEventEndEditing(entryKey: EnterKeyType) {
    LogUtils.d(this.TAG, `submit:${this.renderView.value}, keyType:${entryKey}`)

    if (!this.renderView.isListenEndEditing) {
      return
    }

    let params = new Map<string, HippyValue>() as HippyMap;
    params.set("text", this.renderView.value);
    HREventUtils.sendComponentEvent(this.renderView.ctx, this.renderView.tag, "endediting", params);

    params.set("actionCode", entryKey as number)
    switch (entryKey) {
      case EnterKeyType.Go:
        params.set("actionName", "go")
        break
      case EnterKeyType.Next:
        params.set("actionName", "next")
        break
      case EnterKeyType.PREVIOUS:
        params.set("actionName", "previous")
        break
      case EnterKeyType.Search:
        params.set("actionName", "search")
        break
      case EnterKeyType.Send:
        params.set("actionName", "send")
        break
      case EnterKeyType.Done:
        params.set("actionName", "done")
        break
      default:
        params.set("actionName", "done")
        break
    }
    HREventUtils.sendComponentEvent(this.renderView.ctx, this.renderView.tag, "onEditorAction", params);
  }

  aboutToAppear(): void {
    this.renderView.uiCtx = this.getUIContext()

    if (this.renderView.isListenKeyboardWillShow || this.renderView.isListenKeyboardWillHide) {
      this.windowPromise = window.getLastWindow(getContext(this)).then((data) => {
        data.on('keyboardHeightChange', this.keyboardListener)
        return data
      })
    }
  }

  aboutToDisappear(): void {
    if (this.windowPromise) {
      this.windowPromise.then((data) => {
        data.off('keyboardHeightChange', this.keyboardListener)
      });
      this.windowPromise = undefined
    }
  }

  build() {
   if (this.renderView.multiline) {
      TextArea({
        text: this.renderView.value,
        placeholder: this.renderView.placeholder,
        controller: this.renderView.textAreaController
      })
        .applyTextAreaRenderViewBaseAttr(this.renderView)
        .padding(this.renderView.cssPadding)
        .placeholderColor(this.renderView.placeholderTextColor)
        .enterKeyType(this.renderView.returnKeyType)
        .fontColor(this.renderView.color)
        .caretColor(this.renderView.caretColor)
        .fontFamily(this.renderView.fontFamily)
        .fontSize(this.renderView.fontSize)
        .fontStyle(this.renderView.fontStyle)
        .fontWeight(this.renderView.fontWeight)
        .maxLength(this.renderView.maxLength)
        .textAlign(this.renderView.textAlign)
        .align(this.renderView.textAlignVertical)
        .maxLines(this.renderView.maxLines)
        .onChange((value: string) => {
          this.onEventChange(value)
        })
        .onTextSelectionChange((start: number, end: number) => {
          this.onEventTextSelectionChange(start, end)
        })
        .onFocus(() => {
          this.onEventFocus()
        })
        .onBlur(() => {
          this.onEventBlur()
        })
        .onSubmit((entryKey: EnterKeyType) => {
          this.onEventEndEditing(entryKey)
        })
    } else {
      TextInput({
        text: this.renderView.value,
        placeholder: this.renderView.placeholder,
        controller: this.renderView.controller
      })
        .applyRenderViewBaseAttr(this.renderView)
        .padding(this.renderView.cssPadding)
        .showPasswordIcon(false)
        .type(this.renderView.keyboardType)
        .placeholderColor(this.renderView.placeholderTextColor)
        .enterKeyType(this.renderView.returnKeyType)
        .fontColor(this.renderView.color)
        .caretColor(this.renderView.caretColor)
        .fontFamily(this.renderView.fontFamily)
        .fontSize(this.renderView.fontSize)
        .fontStyle(this.renderView.fontStyle)
        .fontWeight(this.renderView.fontWeight)
        .maxLength(this.renderView.maxLength)
        .textAlign(this.renderView.textAlign)
        .align(this.renderView.textAlignVertical)
        .onChange((value: string) => {
          this.onEventChange(value)
        })
        .onTextSelectionChange((start: number, end: number) => {
          this.onEventTextSelectionChange(start, end)
        })
        .onFocus(() => {
          this.onEventFocus()
        })
        .onBlur(() => {
          this.onEventBlur()
        })
        .onSubmit((entryKey: EnterKeyType, event: SubmitEvent) => {
          this.onEventEndEditing(entryKey)
        })
    }
  }
}

// base props for all components
@Extend(TextInput)
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

// base props for all components
@Extend(TextArea)
function applyTextAreaRenderViewBaseAttr($$: HippyRenderBaseView) {
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
