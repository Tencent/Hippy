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
import matrix4 from '@ohos.matrix4'

export class HRPosition {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
}

export class HRSize {
  width: number
  height: number

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
  }
}

export class HRRect {
  x: number
  y: number
  width: number
  height: number

  static zero = new HRRect(0, 0, 0, 0)

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }
}

export class HRPadding {
  paddingLeft: number
  paddingTop: number
  paddingRight: number
  paddingBottom: number

  constructor(left: number, top: number, right: number, bottom: number) {
    this.paddingLeft = left
    this.paddingTop = top
    this.paddingRight = right
    this.paddingBottom = bottom
  }
}

export class HRTransform {
  anchor: Position | null = null
  rotate: RotateOptions | null = null
  scale: ScaleOptions | null = null
  translate: TranslateOptions | null = null
  matrix: matrix4.Matrix4Transit | null = null
}
