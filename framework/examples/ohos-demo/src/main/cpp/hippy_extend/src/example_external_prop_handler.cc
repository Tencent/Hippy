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

#include <hippy.h>
#include <hr_any_data.h>
#include <string>
#include <hilog/log.h>

#define LOG_DOMAIN 0x0020  // 自定义domain值（16进制）
#define LOG_TAG "MyApp"    // 自定义TAG字符串

#ifdef __cplusplus
extern "C" {
#endif

bool ExampleRenderViewOnSetProp(void *arkui_handle, const char *propKey, HRAnyData propValue) {
  // 下面是示例代码：
  std::string value;
  if (HRAnyDataIsString(propValue)) {
    value = HRAnyDataGetString(propValue);
  } else if (HRAnyDataIsInt(propValue)) {
    int32_t t = 0;
    HRAnyDataGetInt(propValue, &t);
    value = std::to_string(t);
  } else if (HRAnyDataIsUint(propValue)) {
    uint32_t t = 0;
    HRAnyDataGetUint(propValue, &t);
    value = std::to_string(t);
  } else if (HRAnyDataIsDouble(propValue)) {
    double t = 0;
    HRAnyDataGetDouble(propValue, &t);
    value = std::to_string(t);
  } else if (HRAnyDataIsBool(propValue)) {
    bool t = false;
    HRAnyDataGetBool(propValue, &t);
    value = std::to_string(t);
  } else if (HRAnyDataIsArray(propValue)) {
    int arraySize = 0;
    HRAnyDataGetArraySize(propValue, &arraySize);
    value = "size:" + std::to_string(arraySize);
    if (arraySize > 0) {
      HRAnyData elementValue = nullptr;
      HRAnyDataGetArrayElement(propValue, &elementValue, 0);
      bool isStr = HRAnyDataIsString(elementValue);
      value += ",[0:";
      value += std::to_string(isStr);
      value += ",...]";
    }
  }
  OH_LOG_INFO(LOG_APP, "hippy demo, on set prop, key: %{public}s, value: %{public}s", propKey, value.c_str());
  return true;
}

#ifdef __cplusplus
}
#endif

// 这里使用了全局函数的调用来注册prop handler，如果断点这里不执行，请检查对应so是否加载了
auto RegisterHippyRenderViewPropHandlerOnLoad = []() {
  HRRenderViewSetExternalPropHandler(ExampleRenderViewOnSetProp, nullptr);
  return 0;
}();
