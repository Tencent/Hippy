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

#ifndef CORE_NAPI_JS_NATIVE_API_H_
#define CORE_NAPI_JS_NATIVE_API_H_

#include <stdbool.h>
#include <stddef.h>
#include <string>

#include "core/napi/js-native-api-types.h"

namespace hippy {
namespace napi {

void napi_set_last_error(napi_context context, napi_status error);
napi_status napi_get_last_error(napi_context context);
std::string napi_str_error(napi_context context, napi_status error);

napi_vm napi_create_vm();
void napi_vm_release(napi_vm vm);
napi_context napi_create_context(napi_vm vm);
void napi_context_release(napi_vm vm, napi_context context);

void* napi_get_vm_data(napi_vm vm);
void* napi_get_platfrom(napi_vm vm);
void  napi_enter_context(napi_context context);
void  napi_exit_context(napi_context context);

void napi_register_uncaught_exception_callback(napi_vm vm);

void napi_add_module_class(napi_context context,
                           const ModuleClassMap& modules);
void napi_register_global_module(napi_context context,
                                 const ModuleClassMap& modules);
napi_value napi_get_internal_binding(napi_context context);
bool napi_register_global_in_js(napi_context context);

napi_value napi_evaluate_javascript(napi_context context,
                                    const uint8_t* javascript_data,
                                    size_t javascript_length,
                                    const char* filename = nullptr);

// Create Value

napi_value napi_create_number(napi_context context, double number);
napi_value napi_create_boolean(napi_context context, bool b);
napi_value napi_create_string(napi_context context, const char* string);
napi_value napi_create_undefined(napi_context context);
napi_value napi_create_null(napi_context context);
napi_value napi_create_object(napi_context context, const char* json);
napi_value napi_create_array(napi_context context,
                             size_t count,
                             napi_value value[]);

// Get From Value

bool napi_get_value_number(napi_context context,
                           napi_value value,
                           double* result);
bool napi_get_value_number(napi_context context,
                           napi_value value,
                           int32_t* result);
bool napi_get_value_boolean(napi_context context,
                            napi_value value,
                            bool* result);
bool napi_get_value_string(napi_context context,
                           napi_value value,
                           std::string* result);
bool napi_get_value_json(napi_context context,
                         napi_value value,
                         std::string* result);

// Array Helpers

bool napi_is_array(napi_context context, napi_value value);
uint32_t napi_get_array_length(napi_context context, napi_value value);
napi_value napi_copy_array_element(napi_context context,
                                   napi_value value,
                                   uint32_t index);

// Object Helpers

bool napi_has_named_property(napi_context context,
                             napi_value value,
                             const char* utf8name);
napi_value napi_copy_named_property(napi_context context,
                                    napi_value value,
                                    const char* utf8name);
// Function Helpers

bool napi_is_function(napi_context context, napi_value value);
std::string napi_copy_function_name(napi_context context, napi_value function);
napi_value napi_call_function(napi_context context,
                              napi_value function,
                              size_t argument_count = 0,
                              const napi_value argumets[] = nullptr);

}  // namespace napi
}  // namespace hippy

#endif  // CORE_NAPI_JS_NATIVE_API_H_
