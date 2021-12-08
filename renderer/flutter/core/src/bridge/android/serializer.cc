/*****************************************************************************
 * @copyright Copyright (C), 1998-2020, Tencent Tech. Co., Ltd.
 * @file     serializer.cc
 * @brief
 * @author   skindhu
 * @version  1.0.0
 * @date     2021/8/13
 *****************************************************************************/
#include "serializer.h"


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

void* Serializer::ReallocateBufferMemory(void* old_buffer,
                                         size_t size,
                                         size_t* actual_size) {
  if (reused_buffer_.length() < size) {
    reused_buffer_.resize(std::max(reused_buffer_.capacity() * 2, size));
  }
  *actual_size = reused_buffer_.length();
  return static_cast<void*>(&reused_buffer_[0]);
}

void Serializer::FreeBufferMemory(void* buffer) {
  if (reused_buffer_.length() > kMaxReusedBuffersSize) {
    reused_buffer_.resize(0);
    reused_buffer_.shrink_to_fit();
  }
}
