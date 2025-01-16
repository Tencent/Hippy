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
import { componentSnapshot, router } from '@kit.ArkUI'
import {  HippyEngine, HippyException, HippyRoot } from 'hippy'
import { HippyLibrary } from 'hippy/src/main/ets/hippy_library/HippyLibrary'
import HippyRenderBaseView
  from 'hippy/src/main/ets/renderer_native/components/base/HippyRenderBaseView'
import { ExampleComponentA,
  ExampleViewA } from '../hippy_extend/ExampleViewA'
import { DriverMode, HippyInfo } from './PageConfiguration'
import { image } from '@kit.ImageKit'
import {
  ExampleComponentB,
  ExampleViewB } from '../hippy_extend/ExampleViewB'
import { LogUtils } from 'hippy/src/main/ets/support/utils/LogUtils'

//dimens.xml
const page_index_item_margin:number = 16
const page_item_default_width:number = 164
const page_item_default_height:number = 239
const page_item_add_image_width:number = 38
const page_item_add_image_height:number = 38
const page_item_attribute_prompt_height:number = 23

@Entry
@Component
struct PageManagement {
  @StorageLink('pageManagementItems') pageitems:HippyInfo[] = [] //AppStorage.get('pageManagementItems') as InitParams[]
  @StorageLink('showIndex') showIndex:number = -1

  getDriverDisplayTips(param:HippyInfo):string {
    let tips = ''
    switch (param.driver) {
      case DriverMode.JS_REACT:
       tips =  'React'
        break;
      case DriverMode.JS_VUE_2:
        tips =  'Vue2.0'
        break;
      case DriverMode.JS_VUE_3:
        tips =  'Vue3.0'
        break;
      case DriverMode.VL:
        tips =  'VL'
        break;
    }

    if (param.isDebugMode) {
      tips += " + debug"
    }

    return tips
  }

  onBackPress(): boolean | void {
    if (this.showIndex == -1) {
      router.pushUrl({url:'/'}, router.RouterMode.Single)
    }

    return true
  }

  onPageShow(): void {
    for (let params of this.pageitems) {
      params.hippyEngine?.onEngineResume()
    }
  }

  onPageHide(): void {
    for (let params of this.pageitems) {
      params.hippyEngine?.onEnginePause()
    }
  }

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
            if (this.showIndex == -1) {
              router.pushUrl({url:'/'}, router.RouterMode.Single)
              //router.back()
            } else {
              componentSnapshot.get('HippyFrame',(error: Error, pixmap: image.PixelMap) => {
                if (error) {
                  this.showIndex = -1
                  return
                }

                for (let i = 0; i < this.pageitems.length; i++) {
                  let item  = this.pageitems[i]
                  if (item.createTime === this.showIndex) {
                    item.snapShot = pixmap
                    break
                  }
                }

                this.showIndex = -1
              })
            }
          })
          .id('btn_back')
          .justifyContent(FlexAlign.Center)

          Text(this.showIndex === -1 ? "Page Management" : "Demo")
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

        //getPageIndexItemWidth ===> margin | grid | margin | grid margin
        Grid() {
          //generateBitmapFromView <====> .ets
          ForEach(this.pageitems, (item: HippyInfo, index: number) => {
            GridItem() { //TODO: no android:elevation="3dp"
              Column() {
                Row() {
                  //this.showIndex === -1 just force render the snapshot
                  Image(this.showIndex === -1 ? item.snapShot:$r('app.media.add_page_2x'))// .width(page_item_add_image_width)
                    // .height(page_item_add_image_height)
                    .objectFit(ImageFit.Contain)
                }
                .width('100%')
                .height('calc(100% - 23vp)') //page_item_attribute_prompt_height
                .backgroundColor(Color.White)
                .justifyContent(FlexAlign.Center)
                .onClick(() => {
                  this.showIndex = item.createTime
                })

                Row() {
                  Row() {
                    Image($r('app.media.delete_page_2x'))
                      .width(24)
                      .height(24)
                    //.margin({ top: 2, right: 3 }) //container's width 30,height 28 calc margin
                  }
                  .width(30)
                  .height(28)
                  .onClick(() => {
                    let item  = this.pageitems[index];
                    // hippyEngine 销毁实例
                    LogUtils.i('hippy demo', 'destroyModule');
                    let rootView = item.rootViewWrapper!.getRootView()
                    if (rootView) {
                      item.hippyEngine?.destroyModule(rootView.getRootId(), () => {
                        LogUtils.i('hippy demo', 'destroyModule success');
                        item.hippyEngine?.destroyEngine();
                        LogUtils.i('hippy demo', 'destroyEngine success');
                      });
                    }
                    this.pageitems?.splice(index, 1)
                  })
                }
                .width('100%')
                .position({ x: 0, y: 0 })
                .justifyContent(FlexAlign.End)

                Row() {
                  Image($r('app.media.page_item_tips_4x'))
                    .width(12)
                    .height(12)

                  Text(this.getDriverDisplayTips(item))
                    .margin({ left: 4 })
                    .fontColor('#4A5970')
                    .fontWeight(400)
                    .fontSize(12)
                }
                .height(17)
                .margin({ top: 6 })
              }
            }
            .width('100%')
            .aspectRatio(page_item_default_width / page_item_default_height)
          }, (item: HippyInfo, index: number) => {
            let time = (new Date()).getTime() //force render when itemlist changing
            return `PageManagementItem_${index}_${time}`
          })

          //add page item
          GridItem() { //TODO: no android:elevation="3dp"
            Column() {
              Row() {
                Image($r('app.media.add_page_2x'))
                  .width(page_item_add_image_width)
                  .height(page_item_add_image_height)
                  .onClick(() => {
                    router.pushUrl({
                      url: 'pages/PageConfiguration',
                      params: {}
                    })
                  })
              }
              .width('100%')
              .height('calc(100% - 23vp)') //page_item_attribute_prompt_height
              .backgroundColor(Color.White)
              .justifyContent(FlexAlign.Center)

              //.shadow(ShadowStyle.OUTER_DEFAULT_SM)

              Row() {
                Image($r('app.media.page_item_add_4x'))
                  .width(12)
                  .height(12)

                Text($r('app.string.page_add_item_tips_text'))
                  .margin({ left: 4 })
                  .fontColor('#4A5970')
                  .fontWeight(400)
                  .fontSize(12)
              }
              .height(17)
              .margin({ top: 6 })
            }
          }
          .width('100%')
          .aspectRatio(page_item_default_width / page_item_default_height)
        }
        .columnsTemplate('1fr 1fr')
        .columnsGap(page_index_item_margin)
        .rowsGap(page_index_item_margin)
        //TODO:marginTop is not same as android
        .margin({
          left: page_index_item_margin,
          right: page_index_item_margin,
          top: page_index_item_margin
        })
      .visibility(this.showIndex == -1 ? Visibility.Visible:Visibility.None)

      Column() {
        ForEach(this.pageitems, (item: HippyInfo, index:number) => {
          HippyFrame({ itemInfo: item, hippyEngine: item.hippyEngine })
            .visibility(item.createTime === this.showIndex ? Visibility.Visible:Visibility.None)
        }, (item: HippyInfo, index: number) => {
          return `HippyFrame_${item.createTime}`
        })
      }
      .height('calc(100% - 54vp)')
      .id('HippyFrame')
    }
    .width('100%')
    .height('100%')
    .backgroundColor($r('app.color.home_background'))
    .expandSafeArea([SafeAreaType.KEYBOARD])
  }
}

@Component
struct HippyFrame {
  @StorageLink('pageManagementItems') pageitems:HippyInfo[]  = [] //AppStorage.get('pageManagementItems') as InitParams[]
  itemInfo:HippyInfo | null = null

  @StorageLink('libHippy') private libHippy: HippyLibrary | null = null
  @StorageLink('abilityContext') private abilityContext: Context | null = null
  @State exception: string = ""
  hippyEngine: HippyEngine | null = null

  build() {
    Column() {
      HippyRoot({
        hippyEngine: this.hippyEngine,
        rootViewWrapper: this.itemInfo?.rootViewWrapper,
        onRenderException: (exception: HippyException) => {
          this.exception = `${exception.message}\n${exception.stack}`
        },
      })
        .layoutWeight(1)
    }.width('100%')
    .height('100%')
  }
}
