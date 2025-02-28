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

#pragma once

#include <ace/xcomponent/native_interface_xcomponent.h>
#include <js_native_api.h>
#include <js_native_api_types.h>
#include <map>

class BizViewManager {
public:
  BizViewManager();
  ~BizViewManager();
  
  static std::shared_ptr<BizViewManager> GetInstance();
  
  void BindBizNativeView(ArkUI_NodeContentHandle contentHandle, uint32_t view_id);
  void UnbindBizNativeView(uint32_t view_id);
  void OnHippyRootViewReady();

private:
  
  void BuildBizViews();
  
  std::unordered_map<uint32_t, ArkUI_NodeContentHandle> nodeContentMap_;
  std::map<uint32_t, ArkUI_NodeHandle> viewHandleMap_;
};
