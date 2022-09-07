/*
 *
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

#include "dom/dom_event.h"
#include "driver/scope.h"

namespace hippy {
inline namespace driver {
inline namespace module {

class DomEventWrapper {
 public:
  static void Set(std::shared_ptr<DomEvent> dom_event) { dom_event_ = dom_event; }
  static std::shared_ptr<DomEvent> Get() { return dom_event_; }
  static void Release() { dom_event_ = nullptr; }

 private:
  static std::shared_ptr<DomEvent> dom_event_;
};

std::shared_ptr<hippy::napi::InstanceDefine<DomEvent>> MakeEventInstanceDefine(
    const std::weak_ptr<Scope>& weak_scope);

} // namespace module
} // namespace driver
} // namespace hippy
