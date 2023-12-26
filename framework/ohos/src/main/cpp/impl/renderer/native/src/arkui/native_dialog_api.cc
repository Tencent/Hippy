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

#include "renderer/arkui/native_dialog_api.h"

namespace hippy {
inline namespace render {
inline namespace native {

ArkUI_NativeDialogAPI_1 *NativeDialogApi::GetInstance() {
  static ArkUI_NativeDialogAPI_1 *api_ = nullptr;
  if (api_ == nullptr) {
    api_ = reinterpret_cast<ArkUI_NativeDialogAPI_1 *>(
      OH_ArkUI_QueryModuleInterfaceByName(ARKUI_NATIVE_DIALOG, "ArkUI_NativeDialogAPI_1"));
  }
  return api_;
}

} // namespace native
} // namespace render
} // namespace hippy
