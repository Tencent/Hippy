/*****************************************************************************
 * @copyright Copyright (C), 1998-2020, Tencent Tech. Co., Ltd.
 * @file     serializer.h
 * @brief    
 * @author   skindhu
 * @version  1.0.0
 * @date     2021/8/13
 *****************************************************************************/
#ifndef ANDROID_CORE_INCLUDE_BRIDGE_ANDROID_SERIALIZER_H_
#define ANDROID_CORE_INCLUDE_BRIDGE_ANDROID_SERIALIZER_H_


#pragma once

#include <string>

#include "v8/v8.h"

class Serializer : public v8::ValueSerializer::Delegate {
 public:
  Serializer(v8::Isolate* isolate,
             v8::Local<v8::Context> context,
             std::string& reused_buffer);
  ~Serializer();

  Serializer(const Serializer&) = delete;
  Serializer& operator=(const Serializer&) = delete;

  v8::Maybe<bool> WriteValue(v8::Local<v8::Value> value);
  void WriteHeader();
  std::pair<uint8_t*, size_t> Release();

 protected:
  void ThrowDataCloneError(v8::Local<v8::String> message) override;
  void* ReallocateBufferMemory(void* old_buffer,
                               size_t size,
                               size_t* actual_size) override;
  void FreeBufferMemory(void* buffer) override;

 private:
  v8::Isolate* isolate_;
  v8::Global<v8::Context> context_global_;
  v8::ValueSerializer serializer_;
  std::string& reused_buffer_;
};

#endif  // ANDROID_CORE_INCLUDE_BRIDGE_ANDROID_SERIALIZER_H_
