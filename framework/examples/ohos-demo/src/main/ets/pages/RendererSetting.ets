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
import { promptAction, router } from '@kit.ArkUI'
import { DriverMode, RenderMode } from './PageConfiguration'

@CustomDialog
export struct RendererSetting {
  private controller?: CustomDialogController
  @Consume renderMode:RenderMode

  build() {
    Column() {
      Text($r('app.string.renderer_native'))
        .fontColor("#4A5970")
        .fontWeight(500)
        .fontSize(16)
        .backgroundColor(Color.White)
        .width('100%')
        .height(64)
        .margin({ bottom: 1 })
        .textAlign(TextAlign.Center)
        .onClick(()=>{
          this.controller?.close()
        })

        Text($r('app.string.renderer_tdf_core'))
          .fontColor("#d6d6d1")
          .fontWeight(500)
          .fontSize(16)
          .backgroundColor(Color.White)
          .width('100%')
          .height(64)
          .margin({ bottom: 1 })
          .textAlign(TextAlign.Center)
          .onClick(()=>{
            promptAction.showToast({message:$r('app.string.setting_not_available')})
          })

        Text($r('app.string.renderer_flutter'))
          .fontColor("#d6d6d1")
          .fontWeight(500)
          .fontSize(16)
          .backgroundColor(Color.White)
          .width('100%')
          .height(64)
          .textAlign(TextAlign.Center)
          .onClick(()=>{
            promptAction.showToast({message:$r('app.string.setting_not_available')})
          })
    }
    .width('95%')
    //.backgroundColor(Color.White)
  }
}
