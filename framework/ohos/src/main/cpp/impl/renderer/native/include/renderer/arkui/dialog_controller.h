/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2024 THL A29 Limited, a Tencent company.
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

#pragma once

#include <arkui/native_dialog.h>
#include <memory>
#include <string>
#include "footstone/logging.h"

namespace hippy {
inline namespace render {
inline namespace native {

class DialogController {
public:
  DialogController();
  ~DialogController();
 
  void SetContent(ArkUI_NodeHandle content);
  void RemoveContent();
  void SetContentAlignment(int32_t alignment, float offsetX, float offsetY);
  void ResetContentAlignment();
  void SetModalMode(bool isModal);
  void SetAutoCancel(bool autoCancel);
  void SetMask(uint32_t maskColor, const ArkUI_Rect* maskRect);
  void SetBackgroundColor(uint32_t backgroundColor);
  void SetCornerRadius(float topLeft, float topRight, float bottomLeft, float bottomRight); 
  void SetGridColumnCount(int32_t gridCount);
  void EnableCustomStyle(bool enableCustomStyle);
  void EnableCustomAnimation(bool enableCustomAnimation);
  void RegisterOnWillDismiss(ArkUI_OnWillDismissEvent eventHandler);
  void Show();
  void Close(); 
private:
  void MaybeThrow(int32_t status) {
    if (status != 0) {
      auto message = std::string("DialogNode operation failed with status: ") + std::to_string(status);
      FOOTSTONE_LOG(ERROR) << message;
      throw std::runtime_error(std::move(message));
    }
  }
  ArkUI_NativeDialogHandle dialogHandle = nullptr;
};

} // namespace native
} // namespace render
} // namespace hippy
