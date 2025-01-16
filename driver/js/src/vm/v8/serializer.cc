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

#include "driver/vm/v8/serializer.h"

const int kMaxReusedBuffersSize = 128 * 1024;  // 128k

Serializer::Serializer(v8::Isolate* isolate,
                       v8::Local<v8::Context> context,
                       std::string& reused_buffer)
    : isolate_(isolate),
      context_global_(isolate_, context),
      serializer_(isolate, this),
      reused_buffer_(reused_buffer) {}

Serializer::~Serializer() {
  context_global_.Reset();
}

v8::Maybe<bool> Serializer::WriteValue(v8::Local<v8::Value> value) {
  return serializer_.WriteValue(context_global_.Get(isolate_), value);
}

void Serializer::WriteHeader() {
  return serializer_.WriteHeader();
}

std::pair<uint8_t*, size_t> Serializer::Release() {
  return serializer_.Release();
}

void Serializer::ThrowDataCloneError(v8::Local<v8::String> message) {
  v8::HandleScope handle_scope(isolate_);
  isolate_->ThrowException(v8::Exception::Error(message));
}

void* Serializer::ReallocateBufferMemory(__attribute__((unused)) void* old_buffer,
                                         size_t size,
                                         size_t* actual_size) {
  if (reused_buffer_.length() < size) {
    reused_buffer_.resize(std::max(reused_buffer_.capacity() * 2, size));
  }
  *actual_size = reused_buffer_.length();
  return static_cast<void*>(&reused_buffer_[0]);
}

void Serializer::FreeBufferMemory(__attribute__((unused)) void* buffer) {
  if (reused_buffer_.length() > kMaxReusedBuffersSize) {
    reused_buffer_.resize(0);
    reused_buffer_.shrink_to_fit();
  }
}
