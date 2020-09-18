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

#ifndef HIPPY_BUFFER_H_
#define HIPPY_BUFFER_H_

#include <stdio.h>

#include "third_party/v8/v8.h"

#ifdef __cplusplus
extern "C" {
#endif

typedef struct HippyBuffer {
  void* data;
  uint32_t position;
  uint32_t length;
} HippyBuffer;

HippyBuffer* NewBuffer(void);
void ReleaseBuffer(HippyBuffer* buffer);
void BuildBuffer(v8::Isolate* v8_isolate,
                 v8::Local<v8::Object> object,
                 HippyBuffer* buffer);

#ifdef __cplusplus
}
#endif

#endif  // HIPPY_BUFFER_H_
