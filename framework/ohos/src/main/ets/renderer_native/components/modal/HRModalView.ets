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
import { NativeRenderContext } from '../../NativeRenderContext'
import { HREventUtils } from '../../utils/HREventUtils'
import HippyRenderBaseView, { HippyObservedArray,
  HIPPY_COMPONENT_KEY_PREFIX } from '../base/HippyRenderBaseView'
import { LogUtils } from '../../../support/utils/LogUtils'
import { HippyAny, HippyRenderCallback } from '../../../support/common/HippyTypes';
import { HRValueUtils } from '../../utils/HRValueUtils';
import { HRPadding, HRRect } from '../../utils/HRTypes'
import { buildHippyRenderView } from '../../HippyRenderViewBuilder'

const TAG: string = "HRModal";
const DURATION = 200

@Observed
export class HRModalView extends HippyRenderBaseView {
  static readonly VIEW_NAME = "HRModalView"
  visible: boolean = false
  secondLayouted: boolean = false

  transparent: boolean = true
  animationType: TransitionEffect = TransitionEffect.OPACITY.animation({ duration: DURATION})
  darkStatusBarText: boolean = false

  constructor(ctx: NativeRenderContext) {
    super(ctx)
    this.cssVisibility = Visibility.Hidden
  }
  setProp(propKey: string, propValue: HippyAny | HippyRenderCallback): boolean {
    LogUtils.d(TAG, `modalview propkey: ${propKey}, value: ${propValue}`)
    switch (propKey) {
      case "transparent":
        this.transparent = HRValueUtils.getBoolean(propValue as HippyAny, true);
        return true
      case "animationType":
        let type = HRValueUtils.getString(propValue as string)
        if (type === 'slide') {
          this.animationType = TransitionEffect.move(TransitionEdge.BOTTOM).animation({ duration: DURATION, curve:Curve.Ease})
        } else if (type === 'fade') {
          this.animationType = TransitionEffect.OPACITY.animation({ duration: DURATION})
        } else if (type === 'slide_fade') {
          this.animationType = TransitionEffect.OPACITY.animation({ duration: DURATION}).combine(TransitionEffect.move(TransitionEdge.BOTTOM))
        }
        return true
      case "darkStatusBarText":
        this.darkStatusBarText = HRValueUtils.getBoolean(propValue as HippyAny, false);
        return true
      default:
        break
    }
    return super.setProp(propKey, propValue as HippyAny)
  }

  protected updateRenderViewFrame(frame: HRRect, padding: HRPadding | null): void {
    super.updateRenderViewFrame(frame, padding)
    if (this.secondLayouted) {
      this.cssVisibility = Visibility.Visible
    }
  }

}

@CustomDialog
struct HippyDialog {
  controller: CustomDialogController
  @ObjectLink renderView: HRModalView
  @ObjectLink children: HippyObservedArray<HippyRenderBaseView>

  build() {
    if (this.renderView.visible) {
      Stack() {
        ForEach(this.children, (item: HippyRenderBaseView) => {
          buildHippyRenderView(item, null)
        }, (item: HippyRenderBaseView) => item.tag + '')
      }
      .applyRenderViewBaseAttr(this.renderView)
      .backgroundColor(this.renderView.transparent ? Color.Transparent : this.renderView.cssBackgroundColor)
      .transition(this.renderView.animationType)
      .size({width: '100%', height: '100%'})
      .expandSafeArea([SafeAreaType.SYSTEM])
      .onAreaChange((oldValue: Area, newValue: Area) => {
        if (this.renderView.children.length == 0) {
          LogUtils.e(TAG, "onAreaChange, children length is 0")
          return
        }
        this.renderView.secondLayouted = true
        let nodeId = this.renderView.children[0].tag
        let rootId = this.renderView.ctx.getRootId()
        this.renderView.ctx.getNativeRender().onSizeChanged2(rootId, nodeId, newValue.width as number, newValue.height as number, false)
      })
    }
  }
}

@Component
export struct HRModal {
  @ObjectLink renderView: HRModalView
  @ObjectLink children: HippyObservedArray<HippyRenderBaseView>
  private dialogController: CustomDialogController = {} as CustomDialogController

  handleCancel(): void {
    LogUtils.d(TAG, `handleCancel EVENT_MODAL_REQUEST_CLOSE`)
    HREventUtils.sendComponentEvent(this.renderView.ctx, this.renderView.tag, HREventUtils.EVENT_MODAL_REQUEST_CLOSE, null)
  }

  aboutToAppear() {
    this.dialogController = new CustomDialogController({
      builder: HippyDialog({
        renderView: this.renderView,
        children: this.children,
      }),
      autoCancel: true,
      customStyle: true,
      alignment: DialogAlignment.TopStart,
      openAnimation: { duration: 0, onFinish: ()=>{
        this.renderView.visible = true
      }},
      closeAnimation: { duration: 0 },
      cancel: this.handleCancel,
      maskColor:Color.Transparent
    });
    this.dialogController.open();
    HREventUtils.sendComponentEvent(this.renderView.ctx, this.renderView.tag, HREventUtils.EVENT_MODAL_SHOW, null)
  }

  aboutToDisappear() {
    this.renderView.visible = false
    LogUtils.d(TAG, `aboutToDisappear`)
    setTimeout(()=> {
      this.dialogController.close()
    }, DURATION)
  }

  build() {

  }
}

// base props for all components
// but backgroundColor / position / size is not set here
@Extend(Stack)
function applyRenderViewBaseAttr($$: HippyRenderBaseView) {
  .key(HIPPY_COMPONENT_KEY_PREFIX + $$.tag)
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
