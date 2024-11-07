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

#ifndef native_source_code_v8_h
#define native_source_code_v8_h

#include "driver/vm/native_source_code.h"

namespace hippy {
inline namespace driver {

class NativeSourceCodeProviderV8 : public NativeSourceCodeProvider {
public:
  NativeSourceCode GetNativeSourceCode(const std::string& filename) const override;
};

}  // namespace driver
}  // namespace hippy

#endif /* native_source_code_v8_h */
