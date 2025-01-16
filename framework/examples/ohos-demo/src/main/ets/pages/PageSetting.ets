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
import { router } from '@kit.ArkUI'

@Entry
@Component
struct PageSetting {
  @State pageitems:number[] = []

  build() {
    Column() {
      Row() {
        RelativeContainer() {
          Row() {
            Image($r('app.media.back_2x'))
              .width(9)
              .height(17)
              .margin({ left: 10})
          }
          .width(55)
          .height(54)
          .onClick(() => {
            router.back()
          })
          .id('btn_back')
          .justifyContent(FlexAlign.Center)

          Text("Setting")
            .fontColor(Color.Black)
            .fontWeight(500)
            .fontSize(17)
            .id('title')
            .alignRules({ middle: { anchor: "__container__", align: HorizontalAlign.Center},
              center: { anchor: "__container__", align: VerticalAlign.Center}})
        }
      }
      .height(54)
      .backgroundColor(Color.White)
      .width('100%')

      Column() {
        Image($r('app.media.page_setting_building_2x'))
          .width(248)
          .height(210)
          .margin({top:233})

        Text($r('app.string.page_setting_building_title'))
          .fontColor('#7B889C')
          .fontWeight(400)
          .fontSize(16)

      }.width('100%')
    }
    .width('100%')
    .height('100%')
    .backgroundColor($r('app.color.home_background'))
    //.expandSafeArea()
  }
}
