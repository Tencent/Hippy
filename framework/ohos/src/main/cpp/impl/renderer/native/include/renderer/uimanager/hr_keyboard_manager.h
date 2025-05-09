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

#include <functional>
#include <string>
#include <unordered_map>

namespace hippy {
inline namespace render {
inline namespace native {

using HRKeyboardCallback = std::function<void(float height)>;

class HRKeyboardManager {
 public:
    static HRKeyboardManager &GetInstance();

    HRKeyboardManager(const HRKeyboardManager &) = delete;
    HRKeyboardManager &operator = (const HRKeyboardManager &) = delete;

    void AddKeyboardListener(std::string &key, const HRKeyboardCallback &callback);

    void RemoveKeyboardListener(std::string &key);

    void NotifyKeyboardHeightChanged(float height);

 private:
    HRKeyboardManager() = default;
    std::unordered_map<std::string, HRKeyboardCallback> keyboard_listeners_;
};

} // namespace native
} // namespace render
} // namespace hippy
