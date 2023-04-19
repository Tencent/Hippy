/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2023 THL A29 Limited, a Tencent company.
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

#include "dart_port.h"
#include "common_header.h"
#include "standard_message_codec.h"
#include "footstone/persistent_object_map.h"
#include "footstone/check.h"

namespace voltron {
inline namespace ffi {

using RegisterFuncMap = footstone::utils::PersistentObjectMap<int32_t, void*>;

class DartFuncRegister {
 public:
  bool AddCallFunc(int32_t type, void *func);
  void* FindCallFunc(int32_t type);
  DartFuncRegister(std::string  register_header);
  ~DartFuncRegister() = default;

 private:
  RegisterFuncMap register_func_map_;
  std::string register_header_;
};

using RegisterMap = footstone::utils::PersistentObjectMap<std::string,
                                                              std::shared_ptr<DartFuncRegister>>;
class DartPortHolder {
 public:
  static uint32_t CreateDartPortHolder(
      dart_post_c_object_type dart_post_c_object,
      Dart_Port callback_port);
  static void DestroyDartPortHolder(uint32_t ffi_id);
  static std::shared_ptr<DartPortHolder> FindPortHolder(uint32_t ffi_id);
  global_callback GetGlobalCallbackFunc();
  bool PostWorkToDart(const Work *work);
  int32_t AddCallFunc(const char16_t *register_header, int32_t type, void *func);
  void *FindCallFunc(const char *register_header, int32_t type);

  ~DartPortHolder() = default;
  DartPortHolder(dart_post_c_object_type dart_post_c_object, Dart_Port callback_port);
 private:
  std::shared_ptr<DartFuncRegister> CreateCallFuncRegister(const std::string &register_header);
 private:
  dart_post_c_object_type dart_post_c_object_ = nullptr;
  Dart_Port callback_port_ = 0;
  global_callback global_callback_func_ = nullptr;
  RegisterMap register_map_;
};

}
}
