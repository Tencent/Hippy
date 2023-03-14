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

#include "core/vm/v8/v8_vm.h"

#include "v8/libplatform/libplatform.h"

#include "core/base/string_view_utils.h"
#include "core/napi/v8/v8_ctx.h"
#include "core/napi/v8/v8_ctx_value.h"
#include "core/vm/v8/snapshot_collector.h"

using unicode_string_view = tdf::base::unicode_string_view;
using Ctx = hippy::napi::Ctx;
using V8Ctx = hippy::napi::V8Ctx;
using CtxValue = hippy::napi::CtxValue;


namespace hippy {
namespace vm {

static std::unique_ptr<v8::Platform> platform = nullptr;
static std::mutex mutex;

void InitializePlatform() {
  std::lock_guard<std::mutex> lock(mutex);
  if (platform != nullptr) {
#if defined(V8_X5_LITE) && defined(THREAD_LOCAL_PLATFORM)
    TDF_BASE_DLOG(INFO) << "InitializePlatform";
      v8::V8::InitializePlatform(platform.get());
#endif
  } else {
    TDF_BASE_DLOG(INFO) << "NewDefaultPlatform";
    platform = v8::platform::NewDefaultPlatform();

#if defined(V8_X5_LITE)
    v8::V8::InitializePlatform(platform.get(), true);
#else
    v8::V8::InitializePlatform(platform.get());
#endif
    TDF_BASE_DLOG(INFO) << "Initialize";
    v8::V8::Initialize();
  }
}

V8VM::V8VM(const std::shared_ptr<V8VMInitParam>& param): VM(param) {
  TDF_BASE_DLOG(INFO) << "V8VM begin";
  InitializePlatform();
  create_params_.array_buffer_allocator = v8::ArrayBuffer::Allocator::NewDefaultAllocator();
  if (param && param->initial_heap_size_in_bytes > 0 && param->maximum_heap_size_in_bytes) {
    create_params_.constraints.ConfigureDefaultsFromHeapSize(param->initial_heap_size_in_bytes,
                                                             param->maximum_heap_size_in_bytes);
  }
  auto type = V8VMInitParam::V8VMSnapshotType::kNoSnapshot;
  if (param) {
    type = param->type;
  }
  TDF_BASE_LOG(INFO) << "param->type = " << static_cast<int>(type);
  switch (type) {
    case V8VMInitParam::V8VMSnapshotType::kNoSnapshot: {
      isolate_ = v8::Isolate::New(create_params_);
      isolate_->Enter();
      isolate_->SetCaptureStackTraceForUncaughtExceptions(true);
      if (param && param->near_heap_limit_callback) {
        isolate_->AddNearHeapLimitCallback(param->near_heap_limit_callback,
                                           param->near_heap_limit_callback_data);
      }
      break;
    }
    case V8VMInitParam::V8VMSnapshotType::kCreateSnapshot: {
      TDF_BASE_UNREACHABLE();
    }
    case V8VMInitParam::V8VMSnapshotType::kUseSnapshot: {
      TDF_BASE_LOG(INFO) << "kUseSnapshot";
      snapshot_data_ = std::move(param->snapshot_data);
      create_params_.snapshot_blob = &snapshot_data_.startup_data;
      create_params_.external_references = external_references.data();
      isolate_ = v8::Isolate::New(create_params_);
      isolate_->Enter();
      if (param && param->near_heap_limit_callback) {
        isolate_->AddNearHeapLimitCallback(param->near_heap_limit_callback,
                                           param->near_heap_limit_callback_data);
      }
      break;
    }
    default:
      TDF_BASE_UNREACHABLE();
  }

  TDF_BASE_DLOG(INFO) << "V8VM end";
}

V8VM::~V8VM() {
  TDF_BASE_LOG(INFO) << "~V8VM";
  isolate_->Exit();
  isolate_->Dispose();

  delete create_params_.array_buffer_allocator;
}

void V8VM::PlatformDestroy() {
  platform = nullptr;

  v8::V8::Dispose();
#if (V8_MAJOR_VERSION == 9 && V8_MINOR_VERSION == 8 && \
     V8_BUILD_NUMBER >= 124) ||                        \
    (V8_MAJOR_VERSION == 9 && V8_MINOR_VERSION > 8) || (V8_MAJOR_VERSION > 9)
  v8::V8::DisposePlatform();
#else
  v8::V8::ShutdownPlatform();
#endif
}

std::shared_ptr<Ctx> V8VM::CreateContext() {
  TDF_BASE_DLOG(INFO) << "CreateContext";
  return std::make_shared<V8Ctx>(isolate_);
}

V8SnapshotVM::V8SnapshotVM() : VM(nullptr) {
  InitializePlatform();

  create_params_.array_buffer_allocator = v8::ArrayBuffer::Allocator::NewDefaultAllocator();
  TDF_BASE_LOG(INFO) << "external_references.size = " << external_references.size();
  snapshot_creator_ = std::make_shared<v8::SnapshotCreator>(external_references.data());
  isolate_ = snapshot_creator_->GetIsolate();

  TDF_BASE_DLOG(INFO) << "V8SnapshotVM end";
}

V8SnapshotVM::~V8SnapshotVM() {
  delete create_params_.array_buffer_allocator;
}

std::shared_ptr<Ctx> V8SnapshotVM::CreateContext() {
  TDF_BASE_DLOG(INFO) << "CreateContext";
  return std::make_shared<V8Ctx>(isolate_);
}

unicode_string_view V8VM::ToStringView(v8::Isolate* isolate, v8::Local<v8::String> str) {
  TDF_BASE_DCHECK(!str.IsEmpty());
  v8::String* v8_string = v8::String::Cast(*str);
  auto len = hippy::base::checked_numeric_cast<int, size_t>(v8_string->Length());
  if (v8_string->IsOneByte()) {
    std::string one_byte_string;
    one_byte_string.resize(len);
    v8_string->WriteOneByte(isolate,
                            reinterpret_cast<uint8_t*>(&one_byte_string[0]));
    return unicode_string_view(one_byte_string);
  }
  std::u16string two_byte_string;
  two_byte_string.resize(len);
  v8_string->Write(isolate, reinterpret_cast<uint16_t*>(&two_byte_string[0]));
  return unicode_string_view(two_byte_string);
}

v8::Local<v8::String> V8VM::CreateV8String(v8::Isolate* isolate, const unicode_string_view& str_view) {
  unicode_string_view::Encoding encoding = str_view.encoding();
  switch (encoding) {
    case unicode_string_view::Encoding::Latin1: {
      const std::string& one_byte_str = str_view.latin1_value();
      return v8::String::NewFromOneByte(
          isolate,
          reinterpret_cast<const uint8_t*>(one_byte_str.c_str()),
          v8::NewStringType::kNormal)
          .ToLocalChecked();
    }
    case unicode_string_view::Encoding::Utf8: {
      const unicode_string_view::u8string& utf8_str = str_view.utf8_value();
      return v8::String::NewFromUtf8(
          isolate, reinterpret_cast<const char*>(utf8_str.c_str()),
          v8::NewStringType::kNormal)
          .ToLocalChecked();
    }
    case unicode_string_view::Encoding::Utf16: {
      const std::u16string& two_byte_str = str_view.utf16_value();
      return v8::String::NewFromTwoByte(
          isolate,
          reinterpret_cast<const uint16_t*>(two_byte_str.c_str()),
          v8::NewStringType::kNormal)
          .ToLocalChecked();
    }
    default:
      break;
  }
  TDF_BASE_UNREACHABLE();
}

std::shared_ptr<VM> CreateVM(const std::shared_ptr<VMInitParam>& param) {
  return std::make_shared<V8VM>(std::static_pointer_cast<V8VMInitParam>(param));
}

}
}
