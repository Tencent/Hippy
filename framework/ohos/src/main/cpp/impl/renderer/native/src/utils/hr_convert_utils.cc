/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#include "renderer/utils/hr_convert_utils.h"
#include "footstone/logging.h"

namespace hippy {
inline namespace render {
inline namespace native {

ArkUI_BorderStyle HRConvertUtils::BorderStyleToArk(std::string &str) {
  if (str == "solid") {
    return ArkUI_BorderStyle::ARKUI_BORDER_STYLE_SOLID;
  } else if (str == "dotted") {
    return ArkUI_BorderStyle::ARKUI_BORDER_STYLE_DOTTED;
  } else if (str == "dashed") {
    return ArkUI_BorderStyle::ARKUI_BORDER_STYLE_DASHED;
  }
  return ArkUI_BorderStyle::ARKUI_BORDER_STYLE_SOLID;
}

ArkUI_ImageSize HRConvertUtils::BackgroundImageSizeToArk(std::string &str) {
  if (str == "contain") {
    return ARKUI_IMAGE_SIZE_CONTAIN;
  } else if (str == "cover") {
    return ARKUI_IMAGE_SIZE_COVER;;
  } else if (str == "fitXY") {
    // no fill type
  }
  return ARKUI_IMAGE_SIZE_AUTO;
}

float HRConvertUtils::ToDegrees(const HippyValue &value) {
  float ret = 0;
  bool inRadians = true;
  if (value.IsString()) {
    std::string str = value.ToStringChecked();
    std::string sub = str;
    if (str.length() >= 3 && str.compare(str.length() - 3, 3, "deg") == 0) {
      inRadians = false;
      sub = str.substr(0, str.length() - 3);
    } else if (str.length() >= 3 && str.compare(0, 3, "rad") == 0) {
      sub = str.substr(0, str.length() - 3);
    }
    ret = std::stof(sub);
  } else if (value.IsNumber()) {
    ret = static_cast<float>(value.ToDoubleChecked());
  }
  return inRadians ? static_cast<float>(180 / M_PI * ret) : ret;
}

bool HRConvertUtils::TransformToArk(HippyValueArrayType &valueArray, HRTransform &transform) {
  for (uint32_t i = 0; i < valueArray.size(); i++) {
    HippyValueObjectType transformObj;
    if (!valueArray[i].ToObject(transformObj) || transformObj.size() == 0) {
      continue;
    }
    
    for (auto it : transformObj) {
      if (it.first == "matrix") {
        HippyValueArrayType value;
        if (!it.second.IsArray() || !it.second.ToArray(value) || value.size() < 16) {
          continue;
        }
        HRMatrix matrix;
        float *m = matrix.m.data();
        uint32_t k = 0;
        for (k = 0; k < 16; k++) {
          double t = 0;
          if (value[k].ToDouble(t)) {
            m[k] = static_cast<float>(t);
          } else {
            break;
          }
        }
        if (k < 16) {
          continue;
        }
        transform.matrix = matrix;
      } else if (it.first == "perspective") {
        double value = 0;
        if (!it.second.ToDouble(value)) {
          continue;
        }
        HRRotate rotate;
        rotate.perspective = static_cast<float>(value);
        transform.rotate = rotate;
      } else if (it.first == "rotateX") {
        HRRotate rotate;
        rotate.x = 1;
        rotate.angle = ToDegrees(it.second);
        transform.rotate = rotate;
      } else if (it.first == "rotateY") {
        HRRotate rotate;
        rotate.y = 1;
        rotate.angle = ToDegrees(it.second);
        transform.rotate = rotate;
      } else if (it.first == "rotate" || it.first == "rotateZ") {
        HRRotate rotate;
        rotate.z = 1;
        rotate.angle = ToDegrees(it.second);
        transform.rotate = rotate;
      } else if (it.first == "scale") {
        double value = 0;
        if (!it.second.ToDouble(value)) {
          continue;
        }
        HRScale scale;
        scale.x = static_cast<float>(value);
        scale.y = static_cast<float>(value);
        transform.scale = scale;
      } else if (it.first == "scaleX") {
        double value = 0;
        if (!it.second.ToDouble(value)) {
          continue;
        }
        if (transform.scale) {
          transform.scale->x = static_cast<float>(value);
        } else {
          HRScale scale;
          scale.x = static_cast<float>(value);
          transform.scale = scale;
        }                      
      } else if (it.first == "scaleY") {
        double value = 0;
        if (!it.second.ToDouble(value)) {
          continue;
        }
        if (transform.scale) {
          transform.scale->y = static_cast<float>(value);
        } else {
          HRScale scale;
          scale.y = static_cast<float>(value);
          transform.scale = scale;
        }
      } else if (it.first == "translate") {
        HippyValueArrayType array;
        if (!it.second.IsArray() || !it.second.ToArray(array)) {
          continue;
        }
        HRTranslate translate;
        if (array.size() > 0) {
          double value = 0;
          if (array[0].ToDouble(value)) {
            translate.x = static_cast<float>(value);
          }
        }
        if (array.size() > 1) {
          double value = 0;
          if (array[1].ToDouble(value)) {
            translate.y = static_cast<float>(value);
          }
        }
        if (array.size() > 2) {
          double value = 0;
          if (array[2].ToDouble(value)) {
            translate.z = static_cast<float>(value);
          }
        }
        transform.translate = translate;
      } else if (it.first == "translateX") {
        double value = 0;
        if (!it.second.ToDouble(value)) {
          continue;
        }
        if (transform.translate) {
          transform.translate->x = static_cast<float>(value);
        } else {
          HRTranslate translate;
          translate.x = static_cast<float>(value);
          transform.translate = translate;
        }
      } else if (it.first == "translateY") {
        double value = 0;
        if (!it.second.ToDouble(value)) {
          continue;
        }
        if (transform.translate) {
          transform.translate->y = static_cast<float>(value);
        } else {
          HRTranslate translate;
          translate.y = static_cast<float>(value);
          transform.translate = translate;          
        }
      } else if (it.first == "skewX") {
      } else if (it.first == "skewY") {
      } else {
        FOOTSTONE_DLOG(INFO) << "toTransform unsupported transform type: " << it.first;
      }
    }
  }
  return true;
}

} // namespace native
} // namespace render
} // namespace hippy
