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

#include "bridge/bridge_define.h"
#include "footstone/logging.h"
#include "port_holder.h"

constexpr char kVoltronCoreRegisterHeader[] = "voltron_core";

call_native GetCallNativeFunc(uint32_t ffi_id) {
  auto port_holder = voltron::DartPortHolder::FindPortHolder(ffi_id);
  if (!port_holder) {
    FOOTSTONE_DLOG(ERROR) << "get call native func error, ffi port holder not found, ensure ffi module init";
    return nullptr;
  }

  auto func = port_holder->FindCallFunc(kVoltronCoreRegisterHeader, FFIRegisterFuncType::kCallNative);
  if (!func) {
    FOOTSTONE_DLOG(ERROR) << "get call native func error, func not found, ensure func has register";
    return nullptr;
  }
  return reinterpret_cast<call_native>(func);
}

report_json_exception GetReportJsonExceptionFunc(uint32_t ffi_id) {
  auto port_holder = voltron::DartPortHolder::FindPortHolder(ffi_id);
  if (!port_holder) {
    FOOTSTONE_DLOG(ERROR) << "get report json func error, ffi port holder not found, ensure ffi module init";
    return nullptr;
  }

  auto func = port_holder->FindCallFunc(kVoltronCoreRegisterHeader, FFIRegisterFuncType::kReportJsonException);
  if (!func) {
    FOOTSTONE_DLOG(ERROR) << "get report json func error, func not found, ensure func has register";
    return nullptr;
  }
  return reinterpret_cast<report_json_exception>(func);
}

report_js_exception GetReportJsExceptionFunc(uint32_t ffi_id) {
  auto port_holder = voltron::DartPortHolder::FindPortHolder(ffi_id);
  if (!port_holder) {
    FOOTSTONE_DLOG(ERROR) << "get report js func error, ffi port holder not found, ensure ffi module init";
    return nullptr;
  }

  auto func = port_holder->FindCallFunc(kVoltronCoreRegisterHeader, FFIRegisterFuncType::kReportJsException);
  if (!func) {
    FOOTSTONE_DLOG(ERROR) << "get report js func error, func not found, ensure func has register";
    return nullptr;
  }
  return reinterpret_cast<report_js_exception>(func);
}

destroy_function GetDestroyFunc(uint32_t ffi_id) {
  auto port_holder = voltron::DartPortHolder::FindPortHolder(ffi_id);
  if (!port_holder) {
    FOOTSTONE_DLOG(ERROR) << "get destroy func error, ffi port holder not found, ensure ffi module init";
    return nullptr;
  }

  auto func = port_holder->FindCallFunc(kVoltronCoreRegisterHeader, FFIRegisterFuncType::kDestroy);
  if (!func) {
    FOOTSTONE_DLOG(ERROR) << "get destroy func error, func not found, ensure func has register";
    return nullptr;
  }
  return reinterpret_cast<destroy_function>(func);
}
