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

#include "common_header.h"
#include "standard_message_codec.h"

#if defined(_WIN32)
#  define EXTERN_C extern "C" __declspec(dllexport)
#else
#  define EXTERN_C extern "C" __attribute__((visibility("default"))) __attribute__((used))
#endif

typedef int64_t Dart_Port;
typedef std::function<void()> Work;

typedef enum {
  Dart_TypedData_kByteData = 0,
  Dart_TypedData_kInt8,
  Dart_TypedData_kUint8,
  Dart_TypedData_kUint8Clamped,
  Dart_TypedData_kInt16,
  Dart_TypedData_kUint16,
  Dart_TypedData_kInt32,
  Dart_TypedData_kUint32,
  Dart_TypedData_kInt64,
  Dart_TypedData_kUint64,
  Dart_TypedData_kFloat32,
  Dart_TypedData_kFloat64,
  Dart_TypedData_kFloat32x4,
  Dart_TypedData_kInvalid
} Dart_TypedData_Type;

typedef struct _Dart_WeakPersistentHandle *Dart_WeakPersistentHandle;

typedef void
(*Dart_WeakPersistentHandleFinalizer)(void *isolate_callback_data, Dart_WeakPersistentHandle handle,
                                      void *peer);

// dart_native_api.h
typedef enum {
  Dart_CObject_kNull = 0,
  Dart_CObject_kBool,
  Dart_CObject_kInt32,
  Dart_CObject_kInt64,
  Dart_CObject_kDouble,
  Dart_CObject_kString,
  Dart_CObject_kArray,
  Dart_CObject_kTypedData,
  Dart_CObject_kExternalTypedData,
  Dart_CObject_kSendPort,
  Dart_CObject_kCapability,
  Dart_CObject_kUnsupported,
  Dart_CObject_kNumberOfTypes
} Dart_CObject_Type;

typedef struct _Dart_CObject {
  Dart_CObject_Type type;
  union {
    bool as_bool;
    int32_t as_int32;
    int64_t as_int64;
    double as_double;
    char *as_string;
    struct {
      Dart_Port id;
      Dart_Port origin_id;
    } as_send_port;
    struct {
      int64_t id;
    } as_capability;
    struct {
      intptr_t length;
      struct _Dart_CObject **values;
    } as_array;
    struct {
      Dart_TypedData_Type type;
      intptr_t length;
      uint8_t *values;
    } as_typed_data;
    struct {
      Dart_TypedData_Type type;
      intptr_t length;
      uint8_t *data;
      void *peer;
      Dart_WeakPersistentHandleFinalizer callback;
    } as_external_typed_data;
  } value;
} Dart_CObject;

typedef bool (*dart_post_c_object_type)(Dart_Port port_id, Dart_CObject *message);

#ifdef __cplusplus
extern "C" {
#endif
void VoltronRegisterDartPostCObject(dart_post_c_object_type dart_post_c_object, int64_t port);

EXTERN_C void VoltronExecuteCallback(Work *work_ptr);

bool PostWorkToDart(const Work *work);

bool CallGlobalCallback(int32_t callback_id, int64_t value);

bool CallGlobalCallbackWithValue(int32_t callback_id, const voltron::EncodableValue& value);
#ifdef __cplusplus
}
#endif
