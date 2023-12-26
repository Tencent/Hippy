/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
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
import display from '@ohos.display'
import window from '@ohos.window'
import matrix4 from '@ohos.matrix4'
import { HippyMap,
  HippyAny,
  HippyArray, HippyValue } from '../../support/common/HippyTypes'
import { HRSize, HRTransform } from './HRTypes'
import { HRValueUtils } from './HRValueUtils'
import { LogUtils } from '../../support/utils/LogUtils'

export class HRConvertUtil {
  static toBorderStyle(cssString: string): BorderStyle | undefined {
    if (cssString == 'solid') {
      return BorderStyle.Solid
    } else if (cssString == 'dotted') {
      return BorderStyle.Dotted
    } else if (cssString == 'dashed') {
      return BorderStyle.Dashed
    }
    return undefined
  }

  public static toDegrees(value: HippyValue): number {
    let ret = 0.0
    let inRadians = true
    if (typeof value == 'string') {
      let sub: string = value
      if (value.endsWith("deg")) {
        inRadians = false
        sub = value.substring(0, value.length - 3)
      } else if (value.endsWith("rad")) {
        sub = value.substring(0, value.length - 3)
      }
      ret = parseFloat(sub)
    } else if (typeof value == 'number') {
      ret = value
    }
    return inRadians ? (180 / Math.PI * ret): ret
  }

  public static toTransform(transformArray: HippyArray): HRTransform | null {
    let arr = HRValueUtils.getArray(transformArray)
    if (!arr) {
      return null
    }

    let transform = new HRTransform()
    for (let i = 0, size = transformArray.length; i < size; i++) {
      let transformObj = HRValueUtils.getMap(transformArray[i])
      if (!transformObj || (transformObj as HippyMap).size == 0) {
        continue
      }
      transformObj.forEach((value: HippyAny, key: string) => {
        if ("matrix" == key && value instanceof Array) {
          if (value.length < 16) {
            return
          }
          let m = new Array<number>(16)
          for (let k = 0; k < 16; k++) {
            if (typeof (value as HippyArray)[k] == 'number') {
              m[k] = (value as HippyArray)[k] as number
            } else {
              return
            }
          }
          transform.matrix = matrix4.init([
            m[0], m[1], m[2], m[3],
            m[4], m[5], m[6], m[7],
            m[8], m[9], m[10], m[11],
            m[12], m[13], m[14], m[15]
          ])
        } else if ("perspective" == key && typeof value == 'number') {
          if (!transform.rotate) {
            transform.rotate = { angle: 0 }
          }
          transform.rotate.perspective = value
        } else if ("rotateX" == key) {
          if (!transform.rotate) {
            transform.rotate = { angle: 0 }
          }
          transform.rotate.x = 1
          transform.rotate.y = 0
          transform.rotate.z = 0
          transform.rotate.angle = HRConvertUtil.toDegrees(value as HippyValue)
        } else if ("rotateY" == key) {
          if (!transform.rotate) {
            transform.rotate = { angle: 0 }
          }
          transform.rotate.x = 0
          transform.rotate.y = 1
          transform.rotate.z = 0
          transform.rotate.angle = HRConvertUtil.toDegrees(value as HippyValue)
        } else if ("rotate" == key || "rotateZ" == key) {
          if (!transform.rotate) {
            transform.rotate = { angle: 0 }
          }
          transform.rotate.x = 0
          transform.rotate.y = 0
          transform.rotate.z = 1
          transform.rotate.angle = HRConvertUtil.toDegrees(value as HippyValue)
        } else if ("scale" == key && typeof value == 'number') {
          if (!transform.scale) {
            transform.scale = {}
          }
          transform.scale.x = value
          transform.scale.y = value
        } else if ("scaleX" == key && typeof value == 'number') {
          if (!transform.scale) {
            transform.scale = {}
          }
          transform.scale.x = value
        } else if ("scaleY" == key && typeof value == 'number') {
          if (!transform.scale) {
            transform.scale = {}
          }
          transform.scale.y = value
        } else if ("translate" == key && value instanceof Array) {
          if (!transform.translate) {
            transform.translate = {}
          }
          let x = 0, y = 0, z = 0
          if (value.length > 0) {
            let tranX = (value as HippyArray)[0]
            if (typeof tranX == 'number') {
              x = tranX
            }
          }
          if (value.length > 1) {
            let tranY = (value as HippyArray)[1]
            if (typeof tranY == 'number') {
              y = tranY
            }
          }
          if (value.length > 2) {
            let tranZ = (value as HippyArray)[2]
            if (typeof tranZ == 'number') {
              z = tranZ
            }
          }
          transform.translate.x = x
          transform.translate.y = y
          transform.translate.z = z
        } else if ("translateX" == key && typeof value == 'number') {
          if (!transform.translate) {
            transform.translate = {}
          }
          transform.translate.x = value
          transform.translate.y = 0
        } else if ("translateY" == key && typeof value == 'number') {
          if (!transform.translate) {
            transform.translate = {}
          }
          transform.translate.x = 0
          transform.translate.y = value
        } else if ("skewX" == key) {
        } else if ("skewY" == key) {
        } else {
          LogUtils.e('toTransform', `unsupported transform type: ${key}`)
        }
      })
    }
    return transform
  }

  public static toImageSize(cssString: HippyAny): ImageSize {
    if (typeof cssString == 'string') {
      switch (cssString) {
        case "contain":
          return ImageSize.Contain
        case "cover":
          return ImageSize.Cover
        case "center":
          break
        case "origin":
          break
        case "repeat":
          break
        case "fitXY":
          return ImageSize.FILL
        default:
          break
      }
    }
    return ImageSize.Auto
  }

  public static toTextDecorationType(cssString: string): TextDecorationType {
    if (cssString == "underline") {
      return TextDecorationType.Underline
    }
    if (cssString == "line-through") {
      return TextDecorationType.LineThrough
    }
    return TextDecorationType.None
  }

  public static toFontStyle(cssString: string): FontStyle {
    if (cssString == "normal") {
      return FontStyle.Normal
    }
    if (cssString == "italic") {
      return FontStyle.Italic
    }
    return FontStyle.Normal
  }

  public static toTextAlign(cssString: string): Alignment {
    if (cssString == "left") {
      return Alignment.Start
    }
    if (cssString == "center") {
      return Alignment.Center
    }
    if (cssString == "right") {
      return Alignment.End
    }
    return Alignment.Start
  }

  public static toImageFit(cssString: string): ImageFit {
    if (cssString == 'contain') {
      return ImageFit.Contain
    }
    if (cssString == 'stretch') {
      return ImageFit.Fill
    }
    return ImageFit.Cover
  }

  public static toColor(colorString: string): string {
    const rgba = parseInt(colorString)
    return HRConvertUtil.toColorWithNumber(rgba)
  }

  public static toColorWithNumber(rgba: number): string {
    const a = ((rgba >> 24) & 0xFF) / 255.0;
    const r = ((rgba >> 16) & 0xFF);
    const g = ((rgba >> 8) & 0xFF);
    const b = ((rgba) & 0xFF);
    return `rgba(${r},${g},${b},${a})`
  }

  public static toColorWithNumberAndOpacity(rgba: number, opacity: number): string {
    let rgbValue = rgba & 0xFFFFFF
    let opacityValue = (Math.trunc(opacity * 255.0) & 0xFF) << 24
    return HRConvertUtil.toColorWithNumber(rgbValue + opacityValue)
  }

  public static screenSize(): HRSize {
    let width = 0
    let height = 0

    try {
      const displayRes = display.getDefaultDisplaySync()
      width = displayRes.width
      height = displayRes.height
    } catch (e) {
    }
    return new HRSize(px2vp(width) , px2vp(height))
  }

  public static statusBarHeight(avoidArea: window.AvoidArea | null) {
    let defaultHeight = 20
    if (avoidArea) {
      let height = px2vp(avoidArea.topRect.height)
      return height ? height : defaultHeight
    }
    return defaultHeight
  }

}
