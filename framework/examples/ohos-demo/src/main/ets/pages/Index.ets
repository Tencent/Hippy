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
struct Index {
  @State page_management_icon: Resource = $r('app.media.page_management_2x')
  @State page_setting_icon: Resource = $r('app.media.setting_2x')

  onBackPress(): boolean | void {
    router.clear() //avoid back to PageManagement
  }

  build() {
    Column() {
      Text("DEMO")
        .height(54)
        .fontColor(Color.Black)
        .margin({ top: 20 })
        .fontWeight(500)
        .fontSize(17)

      Row() {
        Image($r('app.media.logo_1x'))
          .width(50)
          .height('100%')
        Image($r('app.media.hippy_2x'))
          .width(135)
          .height(29)
          .margin({ left: 12 })
      }
      .height(50)
      .margin({ top: 164 })

      Text("This is Hippy DEMO")
        .margin({ top: 10 })
        .fontColor('#1E304A')
        .fontWeight(500)
        .fontSize(17)

      Text("Ver：3.0.0")
        .margin({ top: 10 })
        .fontColor('#A1ACBD')
        .fontWeight(400)
        .fontSize(14)

      Text($r('app.string.hippy_desc'))
        .width(262)//.margin({left:72, top:74})
        .margin({ top: 74 })
        .fontColor('#A1ACBD')
        .fontWeight(400)
        .fontSize(14)
        .lineHeight(35)

      Blank()
      Row() {
        Column() {
          Image($r('app.media.start_prompt_2x'))
            .width(136)
            .height(36)
        }
        .width('50%')
      }
      .width('100%')

      Row() {
        Column() {
          Image(this.page_management_icon)
            .width(19)
            .height(21)
            .margin({ top: 8 })

          Text('Page Manage')
            .fontColor('#4A5970')
            .fontWeight(400)
            .fontSize(11)
            .margin({ top: 2 })
        }
        .height(52)
        .width('50%')
        .onTouch((event?: TouchEvent) => {
          if (event) {
            if (event.type === TouchType.Down) {
              this.page_management_icon = $r('app.media.page_management_pressed_2x')
            } else if (event.type === TouchType.Up || event.type === TouchType.Cancel) {
              this.page_management_icon = $r('app.media.page_management_2x')
            }
          }
        })
        .onClick(() => {
          router.pushUrl({
            url: 'pages/PageManagement',
            params: {}
          }, router.RouterMode.Single)
        })

        Column() {
          Image(this.page_setting_icon)
            .width(19)
            .height(21)
            .margin({ top: 8 })

          Text('Setting')
            .margin({ top: 2 })
            .fontColor('#4A5970')
            .fontWeight(400)
            .fontSize(11)
        }
        .height(52)
        .width('50%')
        .onTouch((event?: TouchEvent) => {
          if (event) {
            if (event.type === TouchType.Down) {
              this.page_setting_icon = $r('app.media.setting_pressed_2x')
            } else if (event.type === TouchType.Up || event.type === TouchType.Cancel) {
              this.page_setting_icon = $r('app.media.setting_2x')
            }
          }
        })
        .onClick(() => {
          router.pushUrl({
            url: 'pages/PageSetting',
            params: {}
          })
        })
      }
      .width('100%')
      .backgroundColor(Color.White)
    }
    .width('100%')
    .height('100%')
    .backgroundColor($r('app.color.home_background'))
    .align(Alignment.Center)
    .expandSafeArea()
  }
}
