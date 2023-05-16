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


#include "port_holder.h"

#include "footstone/logging.h"
#include "callback_manager.h"
#include "data_holder.h"

namespace voltron {
inline namespace ffi {

constexpr char kDefaultRegisterHeader[] = "default";

DartPortHolder::DartPortHolder(dart_post_c_object_type dart_post_c_object,
                                             Dart_Port callback_port) :
                                             dart_post_c_object_(dart_post_c_object),
                                             callback_port_(callback_port) {

}

bool DartPortHolder::PostWorkToDart(const Work *work) {
  if (callback_port_ != 0) {
    const auto workAddress = reinterpret_cast<intptr_t>(work);
    Dart_CObject dart_object;
    dart_object.type = Dart_CObject_kInt64;
    dart_object.value.as_int64 = workAddress;

    const bool result = dart_post_c_object_(callback_port_, &dart_object);
    return result;
  }
  return false;
}

uint32_t DartPortHolder::CreateDartPortHolder(dart_post_c_object_type dart_post_c_object,
                                              Dart_Port callback_port) {
  auto port_holder = std::make_shared<DartPortHolder>(dart_post_c_object, callback_port);
  auto id = InsertObject(port_holder);
  return id;
}

void DartPortHolder::DestroyDartPortHolder(uint32_t ffi_id) {
  EraseObject(ffi_id);
}

std::shared_ptr<DartPortHolder> DartPortHolder::FindPortHolder(uint32_t ffi_id) {
  return std::any_cast<std::shared_ptr<DartPortHolder>>(FindObject(ffi_id));
}

int32_t DartPortHolder::AddCallFunc(const char16_t *register_header, int32_t type, void *func) {
  FOOTSTONE_LOG(INFO) << "start register func header: " << register_header << ", type: " << type << ", func:" << func;
  auto header_str = voltron::C16CharToString(register_header);
  if (header_str == kDefaultRegisterHeader) {
    if (type == static_cast<int>(DefaultRegisterFuncType::kGlobalCallback)) {
      global_callback_func_ = reinterpret_cast<global_callback>(func);
      return true;
    }
    FOOTSTONE_LOG(ERROR) << "register func error header: " << register_header << ", unknown type: " << type;
    return false;
  } else {
    std::shared_ptr<DartFuncRegister> func_register;
    register_map_.Find(header_str, func_register);
    if (!func_register) {
      func_register = CreateCallFuncRegister(header_str);
    }
    return func_register->AddCallFunc(type, func);
  }
}

std::shared_ptr<DartFuncRegister> DartPortHolder::CreateCallFuncRegister(const std::string &register_header) {
  FOOTSTONE_LOG(INFO) << "start func register extension  header: " << register_header;
  auto dart_func_register = std::make_shared<DartFuncRegister>(register_header);
  register_map_.Insert(register_header, dart_func_register);
  return dart_func_register;
}

global_callback DartPortHolder::GetGlobalCallbackFunc() {
  return global_callback_func_;
}

void* DartPortHolder::FindCallFunc(const char* register_header, int32_t type) {
  std::shared_ptr<DartFuncRegister> func_register;
  auto flag = register_map_.Find(register_header, func_register);
  if (!flag) {
    FOOTSTONE_LOG(ERROR) << "find call func register map error,  header: " << register_header;
    return nullptr;
  }

  auto func = func_register->FindCallFunc(type);
  return func;
}

bool DartFuncRegister::AddCallFunc(int32_t type, void *func) {
  register_func_map_.Insert(type, func);
  return true;
}

void* DartFuncRegister::FindCallFunc(int32_t type) {
  void* func;
  bool flag = register_func_map_.Find(
      type,
      func);
  if (!flag) {
    FOOTSTONE_LOG(ERROR) << "find call func error,  header:" << register_header_ <<", type: " << type;
    return nullptr;
  }
  return func;
}

DartFuncRegister::DartFuncRegister(std::string register_header): register_header_(std::move(register_header)) {

}

}
}
