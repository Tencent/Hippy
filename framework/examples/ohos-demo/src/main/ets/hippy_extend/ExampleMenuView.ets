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
import { NativeRender } from 'hippy/src/main/ets/renderer_native/NativeRender'

@Observed
export class ExampleMenuView {
  nativeRender: NativeRender | null = null
  rootId: number = 0
  viewId: number = 0
}

@Component
export struct ExampleMenuComponent {
  @ObjectLink renderView: ExampleMenuView

  build() {
    Stack() {
      Text("This is a menu component.")
    }
    .width('100%')
    .height(50)
    .backgroundColor(0xffa0ffa0)
    .onClick((event: ClickEvent) => {
      let nativeRender = this.renderView.nativeRender
      if (nativeRender) {
        let rootId = this.renderView.rootId
        let viewId = this.renderView.viewId
        nativeRender.removeBizViewInRoot(rootId, viewId)
      }
    })
  }
}

@Builder
export function buildExampleMenuView($$: Object) {
  ExampleMenuComponent({ renderView: $$ as ExampleMenuView})
}
