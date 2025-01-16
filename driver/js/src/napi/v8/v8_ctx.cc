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

#include "driver/napi/v8/v8_ctx.h"

#include "driver/base/js_value_wrapper.h"
#include "driver/napi/v8/v8_ctx_value.h"
#include "driver/napi/v8/v8_class_definition.h"
#include "driver/napi/v8/v8_try_catch.h"
#include "driver/napi/callback_info.h"
#include "driver/vm/v8/v8_vm.h"
#include "driver/vm/v8/serializer.h"
#include "driver/vm/native_source_code.h"
#include "footstone/check.h"
#include "footstone/string_view.h"
#include "footstone/string_view_utils.h"

namespace hippy {
inline namespace driver {
inline namespace napi {

using string_view = footstone::string_view;
using StringViewUtils = footstone::StringViewUtils;
using V8VM = hippy::vm::V8VM;
using CallbackInfo = hippy::CallbackInfo;

constexpr static int kExternalIndex = 0;
constexpr static int kNewInstanceExternalIndex = 1;
constexpr static int kScopeWrapperIndex = 5;
constexpr static int kExternalDataMapIndex = 6;
//constexpr char kProtoKey[] = "__proto__";

void InvokePropertyCallback(v8::Local<v8::Name> property,
                            const v8::PropertyCallbackInfo<v8::Value>& info) {
  auto isolate = info.GetIsolate();
  v8::HandleScope handle_scope(isolate);
  auto context = isolate->GetCurrentContext();
  v8::Context::Scope context_scope(context);

  CallbackInfo cb_info;
  cb_info.SetSlot(context->GetAlignedPointerFromEmbedderData(kScopeWrapperIndex));
  cb_info.SetReceiver(std::make_shared<V8CtxValue>(isolate, info.This()));
  auto name = std::make_shared<V8CtxValue>(isolate, property);
  cb_info.AddValue(name);
  auto data = info.Data().As<v8::External>();
  FOOTSTONE_CHECK(!data.IsEmpty());
  auto* func_wrapper = reinterpret_cast<FunctionWrapper*>(data->Value());
  FOOTSTONE_CHECK(func_wrapper && func_wrapper->callback);
  (func_wrapper->callback)(cb_info, func_wrapper->data);
  auto exception = std::static_pointer_cast<V8CtxValue>(cb_info.GetExceptionValue()->Get());
  if (exception) {
    const auto& global_value = exception->global_value_;
    auto handle_value = v8::Local<v8::Value>::New(isolate, global_value);
    isolate->ThrowException(handle_value);
    info.GetReturnValue().SetUndefined();
    return;
  }

  auto ret_value = std::static_pointer_cast<V8CtxValue>(cb_info.GetReturnValue()->Get());
  if (!ret_value) {
    info.GetReturnValue().SetUndefined();
    return;
  }

  info.GetReturnValue().Set(ret_value->global_value_);
}

static void InvokeJsCallback(const v8::FunctionCallbackInfo<v8::Value>& info) {
  auto isolate = info.GetIsolate();
  v8::HandleScope handle_scope(isolate);
  auto context = isolate->GetCurrentContext();
  v8::Context::Scope context_scope(context);

  CallbackInfo cb_info;
  cb_info.SetSlot(context->GetAlignedPointerFromEmbedderData(kScopeWrapperIndex));
  auto thiz = info.This();
  auto holder = info.Holder();
  auto count = holder->InternalFieldCount();
  if (count > 0) {
    auto internal_data = holder->GetInternalField(kExternalIndex).As<v8::External>();
    cb_info.SetData(internal_data->Value());
  }
  if (info.IsConstructCall()) {
    auto new_instance_external = context->GetAlignedPointerFromEmbedderData(kNewInstanceExternalIndex);
    if (new_instance_external) {
      cb_info.SetData(new_instance_external);
    }
  }
  cb_info.SetReceiver(std::make_shared<V8CtxValue>(isolate, thiz));
  for (int i = 0; i < info.Length(); i++) {
    cb_info.AddValue(std::make_shared<V8CtxValue>(isolate, info[i]));
  }
  auto data = info.Data().As<v8::External>();
  FOOTSTONE_CHECK(!data.IsEmpty());
  auto function_wrapper = reinterpret_cast<FunctionWrapper*>(data->Value());
  auto js_cb = function_wrapper->callback;
  auto external_data = function_wrapper->data;
//  auto external_data_map = reinterpret_cast<std::unordered_map<void*, void*>*>(context->GetAlignedPointerFromEmbedderData(kExternalDataMapIndex));
//  void* external_data = nullptr;
//  auto it = external_data_map->find(js_cb_address);
//  if ( it != external_data_map->end()) {
//    external_data = it->second;
//  }
  js_cb(cb_info, external_data);
  auto exception = std::static_pointer_cast<V8CtxValue>(cb_info.GetExceptionValue()->Get());
  if (exception) {
    const auto& global_value = exception->global_value_;
    auto handle_value = v8::Local<v8::Value>::New(isolate, global_value);
    isolate->ThrowException(handle_value);
    info.GetReturnValue().SetUndefined();
    return;
  }

  auto ret_value = std::static_pointer_cast<V8CtxValue>(cb_info.GetReturnValue()->Get());
  if (!ret_value) {
    info.GetReturnValue().SetUndefined();
    return;
  }
  if (info.IsConstructCall()) {
    auto internal_data = cb_info.GetData();
    if (internal_data) {
      holder->SetInternalField(kExternalIndex, v8::External::New(isolate, internal_data));
      auto prototype = thiz->GetPrototype();
      if (!prototype.IsEmpty()) {
        auto prototype_object = v8::Local<v8::Object>::Cast(prototype);
        if (prototype_object->InternalFieldCount() > 0) {
          prototype_object->SetInternalField(kExternalIndex, v8::External::New(isolate, internal_data));
        }
      }
    }
  }
  info.GetReturnValue().Set(ret_value->global_value_);
}

V8Ctx::V8Ctx(v8::Isolate* isolate) : isolate_(isolate) {
    v8::HandleScope handle_scope(isolate);
    v8::Local<v8::ObjectTemplate> global = v8::ObjectTemplate::New(isolate);
    v8::Local<v8::Context> context = v8::Context::New(isolate, nullptr, global);
    v8::Context::Scope contextScope(context);

    context->SetAlignedPointerInEmbedderData(kExternalDataMapIndex, reinterpret_cast<void*>(&func_external_data_map_));

    global_persistent_.Reset(isolate, global);
    context_persistent_.Reset(isolate, context);
}

v8::Local<v8::FunctionTemplate> V8Ctx::CreateTemplate(const std::unique_ptr<FunctionWrapper>& wrapper) {
  // func_external_data_map_[reinterpret_cast<void*>(wrapper->cb)] = wrapper->data;
  // wrapper->cb is a function pointer which can be obtained at compile time
  return v8::FunctionTemplate::New(isolate_, InvokeJsCallback,
                                   v8::External::New(isolate_,
                                                     reinterpret_cast<void*>(wrapper.get())));


}

std::shared_ptr<CtxValue> V8Ctx::CreateFunction(const std::unique_ptr<FunctionWrapper>& wrapper) {
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  auto function_template = CreateTemplate(wrapper);
  return std::make_shared<V8CtxValue>(isolate_,
                                      function_template->GetFunction(context).ToLocalChecked());
}

class ExternalOneByteStringResourceImpl
    : public v8::String::ExternalOneByteStringResource {
 public:
  ExternalOneByteStringResourceImpl(const uint8_t* data, size_t length)
      : data_(data), length_(length) {}

  explicit ExternalOneByteStringResourceImpl(const std::string&& data)
      : data_(nullptr), str_data_(data) {
    length_ = str_data_.length();
  }

  ~ExternalOneByteStringResourceImpl() override = default;
  ExternalOneByteStringResourceImpl(const ExternalOneByteStringResourceImpl&) = delete;
  const ExternalOneByteStringResourceImpl& operator=(const ExternalOneByteStringResourceImpl&) = delete;

  const char* data() const override {
    if (data_) {
      return reinterpret_cast<const char*>(data_);
    } else {
      return str_data_.c_str();
    }
  }
  size_t length() const override { return length_; }

 private:
  const uint8_t* data_;
  std::string str_data_;
  size_t length_;
};

class ExternalStringResourceImpl : public v8::String::ExternalStringResource {
 public:
  ExternalStringResourceImpl(const uint16_t* data, size_t length)
      : data_(data), length_(length) {}

  explicit ExternalStringResourceImpl(const std::string&& data)
      : data_(nullptr), str_data_(data) {
    length_ = str_data_.length();
  }

  ~ExternalStringResourceImpl() override = default;
  ExternalStringResourceImpl(const ExternalStringResourceImpl&) = delete;
  const ExternalStringResourceImpl& operator=(const ExternalStringResourceImpl&) = delete;

  const uint16_t* data() const override {
    if (data_) {
      return data_;
    } else {
      return reinterpret_cast<const uint16_t*>(str_data_.c_str());
    }
  }

  size_t length() const override { return length_ / 2; }

 private:
  const uint16_t* data_;
  const std::string str_data_;
  size_t length_;
};

void V8Ctx::SetExternalData(void* address) {
  SetAlignedPointerInEmbedderData(kScopeWrapperIndex, reinterpret_cast<intptr_t>(address));
}

std::shared_ptr<ClassDefinition> V8Ctx::GetClassDefinition(const string_view& name) {
  FOOTSTONE_DCHECK(template_map_.find(name) != template_map_.end());
  return template_map_[name];
}

void V8Ctx::SetAlignedPointerInEmbedderData(int index, intptr_t address) {
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  context->SetAlignedPointerInEmbedderData(index,
                                           reinterpret_cast<void*>(address));
}

std::string V8Ctx::GetSerializationBuffer(const std::shared_ptr<CtxValue>& value,
                                          std::string& reused_buffer) {
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value = std::static_pointer_cast<V8CtxValue>(value);
  v8::Local<v8::Value> handle_value = v8::Local<v8::Value>::New(isolate_, ctx_value->global_value_);

  Serializer serializer(isolate_, context, reused_buffer);
  serializer.WriteHeader();
  serializer.WriteValue(handle_value);
  std::pair<uint8_t*, size_t> pair = serializer.Release();
  return {reinterpret_cast<const char*>(pair.first), pair.second};
}

std::shared_ptr<CtxValue> V8Ctx::GetGlobalObject() {
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  return std::make_shared<V8CtxValue>(isolate_, context->Global());
}

std::shared_ptr<CtxValue> V8Ctx::GetProperty(
    const std::shared_ptr<CtxValue>& object,
    const string_view& name) {
  FOOTSTONE_CHECK(object);
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  auto key = V8VM::CreateV8String(isolate_, context, name);
  return GetProperty(object, std::make_shared<V8CtxValue>(isolate_, key));
}

std::shared_ptr<CtxValue> V8Ctx::GetProperty(
    const std::shared_ptr<CtxValue>& object,
    std::shared_ptr<CtxValue> key) {
  FOOTSTONE_CHECK(object && key);
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  auto v8_object = std::static_pointer_cast<V8CtxValue>(object);
  auto v8_object_handle = v8::Local<v8::Value>::New(isolate_, v8_object->global_value_);

  auto v8_key = std::static_pointer_cast<V8CtxValue>(key);
  auto v8_key_handle = v8::Local<v8::Value>::New(isolate_, v8_key->global_value_);

  auto value = v8::Local<v8::Object>::Cast(v8_object_handle)->Get(context, v8_key_handle).ToLocalChecked();
  return std::make_shared<V8CtxValue>(isolate_, value);
}

std::shared_ptr<CtxValue> V8Ctx::RunScript(const string_view& str_view,
                                           const string_view& file_name) {
  return RunScript(str_view, file_name, false, nullptr, true);
}

std::shared_ptr<CtxValue> V8Ctx::RunScript(const string_view& str_view,
                                           const string_view& file_name,
                                           bool is_use_code_cache,
                                           string_view* cache,
                                           bool is_copy) {
  FOOTSTONE_LOG(INFO) << "V8Ctx::RunScript file_name = " << file_name
                      << ", is_use_code_cache = " << is_use_code_cache
                      << ", cache = " << cache << ", is_copy = " << is_copy;
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  v8::MaybeLocal<v8::String> source;

  string_view::Encoding encoding = str_view.encoding();
  switch (encoding) {
    case string_view::Encoding::Latin1: {
      const std::string& str = str_view.latin1_value();
      if (is_copy) {
        source = v8::String::NewFromOneByte(
            isolate_,
            reinterpret_cast<const uint8_t*>(str.c_str()),
            v8::NewStringType::kInternalized,
            footstone::checked_numeric_cast<size_t, int>(str.length()));
      } else {
        auto* one_byte =
            new ExternalOneByteStringResourceImpl(
                reinterpret_cast<const uint8_t*>(str.c_str()), str.length());
        source = v8::String::NewExternalOneByte(isolate_, one_byte);
      }
      break;
    }
    case string_view::Encoding::Utf16: {
      const std::u16string& str = str_view.utf16_value();
      if (is_copy) {
        source = v8::String::NewFromTwoByte(
            isolate_,
            reinterpret_cast<const uint16_t*>(str.c_str()),
            v8::NewStringType::kNormal,
            footstone::checked_numeric_cast<size_t, int>(str.length()));
      } else {
        auto* two_byte = new ExternalStringResourceImpl(
            reinterpret_cast<const uint16_t*>(str.c_str()), str.length());
        source = v8::String::NewExternalTwoByte(isolate_, two_byte);
      }
      break;
    }
    case string_view::Encoding::Utf32: {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
      const std::u32string& str = str_view.utf32_value();
      std::wstring_convert<std::codecvt_utf8<char32_t>, char32_t> convert;
      std::string bytes = convert.to_bytes(str);
      std::u16string two_byte(reinterpret_cast<const char16_t*>(bytes.c_str()),
                              bytes.length() / sizeof(char16_t));
      source = v8::String::NewFromTwoByte(
          isolate_, reinterpret_cast<const uint16_t*>(str.c_str()),
          v8::NewStringType::kNormal, footstone::checked_numeric_cast<size_t, int>(str.length()));
#pragma clang diagnostic pop
      break;
    }
    case string_view::Encoding::Utf8: {
      const string_view::u8string& str = str_view.utf8_value();
      source = v8::String::NewFromUtf8(
          isolate_, reinterpret_cast<const char*>(str.c_str()),
          v8::NewStringType::kNormal);
      break;
    }
    default: {
      FOOTSTONE_UNREACHABLE();
    }
  }

  if (source.IsEmpty()) {
    FOOTSTONE_DLOG(WARNING) << "v8_source empty, file_name = " << file_name;
    return nullptr;
  }

  return InternalRunScript(context, source.ToLocalChecked(), file_name, is_use_code_cache, cache);
}

void V8Ctx::SetDefaultContext(const std::shared_ptr<v8::SnapshotCreator>& creator) {
  FOOTSTONE_CHECK(creator);
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  creator->SetDefaultContext(context);
}

std::shared_ptr<CtxValue> V8Ctx::InternalRunScript(
    v8::Local<v8::Context> context,
    v8::Local<v8::String> source,
    const string_view& file_name,
    bool is_use_code_cache,
    string_view* cache) {
  v8::Local<v8::String> v8_file_name = V8VM::CreateV8String(isolate_, context, file_name);
#if (V8_MAJOR_VERSION == 8 && V8_MINOR_VERSION == 9 && \
     V8_BUILD_NUMBER >= 45) || \
    (V8_MAJOR_VERSION == 8 && V8_MINOR_VERSION > 9) || (V8_MAJOR_VERSION > 8)
  v8::ScriptOrigin origin(isolate_, v8_file_name);
#else
  v8::ScriptOrigin origin(v8_file_name);
#endif
  v8::MaybeLocal<v8::Script> script;
  if (is_use_code_cache && cache && !StringViewUtils::IsEmpty(*cache)) {
    string_view::Encoding encoding = cache->encoding();
    if (encoding == string_view::Encoding::Utf8) {
      const string_view::u8string& str = cache->utf8_value();
      auto* cached_data =
          new v8::ScriptCompiler::CachedData(
              str.c_str(), footstone::checked_numeric_cast<size_t, int>(str.length()),
              v8::ScriptCompiler::CachedData::BufferNotOwned);
      v8::ScriptCompiler::Source script_source(source, origin, cached_data);
      script = v8::ScriptCompiler::Compile(
          context, &script_source, v8::ScriptCompiler::kConsumeCodeCache);
    } else {
      FOOTSTONE_UNREACHABLE();
    }
  } else {
    if (is_use_code_cache && cache) {
      v8::ScriptCompiler::Source script_source(source, origin);
      script = v8::ScriptCompiler::Compile(context, &script_source);
      if (script.IsEmpty()) {
        return nullptr;
      }
      const v8::ScriptCompiler::CachedData* cached_data =
          v8::ScriptCompiler::CreateCodeCache(
              script.ToLocalChecked()->GetUnboundScript());
      *cache = string_view(cached_data->data,
                                   footstone::checked_numeric_cast<int,
                                                                     size_t>(cached_data->length));
    } else {
      script = v8::Script::Compile(context, source, &origin);
    }
  }

  if (script.IsEmpty()) {
    return nullptr;
  }

  v8::MaybeLocal<v8::Value> v8_maybe_value = script.ToLocalChecked()->Run(context);
  if (v8_maybe_value.IsEmpty()) {
    return nullptr;
  }
  v8::Local<v8::Value> v8_value = v8_maybe_value.ToLocalChecked();
  return std::make_shared<V8CtxValue>(isolate_, v8_value);
}

void V8Ctx::ThrowException(const std::shared_ptr<CtxValue>& exception) {
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  auto ctx_value = std::static_pointer_cast<V8CtxValue>(exception);
  auto handle_value = v8::Local<v8::Value>::New(isolate_, ctx_value->global_value_);
  isolate_->ThrowException(handle_value);
}

void V8Ctx::ThrowException(const string_view& exception) {
  ThrowException(CreateException(exception));
}

std::shared_ptr<CtxValue> V8Ctx::CallFunction(
    const std::shared_ptr<CtxValue>& function,
    const std::shared_ptr<CtxValue>& receiver,
    size_t argument_count,
    const std::shared_ptr<CtxValue> arguments[]) {
  if (!function) {
    FOOTSTONE_LOG(ERROR) << "function is nullptr";
    return nullptr;
  }

  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope contextScope(context);
  if (context.IsEmpty() || context->Global().IsEmpty()) {
    FOOTSTONE_LOG(ERROR) << "CallFunction context error";
    return nullptr;
  }

  auto ctx_value = std::static_pointer_cast<V8CtxValue>(function);
  auto handle_value = v8::Local<v8::Value>::New(isolate_, ctx_value->global_value_);
  if (!handle_value->IsFunction()) {
    FOOTSTONE_LOG(WARNING) << "CallFunction handle_value is not a function";
    return nullptr;
  }

  auto v8_fn = v8::Function::Cast(*handle_value);
  v8::Local<v8::Value> args[argument_count];
  for (size_t i = 0; i < argument_count; i++) {
    auto argument = std::static_pointer_cast<V8CtxValue>(arguments[i]);
    if (argument) {
      args[i] = v8::Local<v8::Value>::New(isolate_, argument->global_value_);
    } else {
      FOOTSTONE_LOG(WARNING) << "CallFunction argument error, i = " << i;
      return nullptr;
    }
  }

  auto receiver_object = std::static_pointer_cast<V8CtxValue>(receiver);
  auto handle_object = v8::Local<v8::Value>::New(isolate_, receiver_object->global_value_);
  v8::MaybeLocal<v8::Value> maybe_result = v8_fn->Call(
      context, handle_object, static_cast<int>(argument_count), args);

  if (maybe_result.IsEmpty()) {
    FOOTSTONE_DLOG(INFO) << "maybe_result is empty";
    return nullptr;
  }
  return std::make_shared<V8CtxValue>(isolate_, maybe_result.ToLocalChecked());
}

std::shared_ptr<CtxValue> V8Ctx::CreateNumber(double number) {
  v8::HandleScope isolate_scope(isolate_);

  auto v8_number = v8::Number::New(isolate_, number);
  if (v8_number.IsEmpty()) {
    return nullptr;
  }
  return std::make_shared<V8CtxValue>(isolate_, v8_number);
}

std::shared_ptr<CtxValue> V8Ctx::CreateBoolean(bool b) {
  v8::HandleScope isolate_scope(isolate_);

  auto v8_boolean = v8::Boolean::New(isolate_, b);
  if (v8_boolean.IsEmpty()) {
    return nullptr;
  }
  return std::make_shared<V8CtxValue>(isolate_, v8_boolean);
}

std::shared_ptr<CtxValue> V8Ctx::CreateString(
    const string_view& str_view) {
  if (str_view.encoding() == string_view::Encoding::Unknown) {
    return nullptr;
  }
  v8::HandleScope isolate_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  auto v8_string = V8VM::CreateV8String(isolate_, context, str_view);
  return std::make_shared<V8CtxValue>(isolate_, v8_string);
}

std::shared_ptr<CtxValue> V8Ctx::CreateUndefined() {
  v8::HandleScope isolate_scope(isolate_);

  auto undefined = v8::Undefined(isolate_);
  if (undefined.IsEmpty()) {
    return nullptr;
  }
  return std::make_shared<V8CtxValue>(isolate_, undefined);
}

std::shared_ptr<CtxValue> V8Ctx::CreateNull() {
  v8::HandleScope isolate_scope(isolate_);

  auto v8_null = v8::Null(isolate_);
  if (v8_null.IsEmpty()) {
    return nullptr;
  }
  return std::make_shared<V8CtxValue>(isolate_, v8_null);
}

std::shared_ptr<CtxValue> V8Ctx::CreateObject(const std::unordered_map<
    string_view,
    std::shared_ptr<CtxValue>>& object) {
  std::unordered_map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>> obj;
  for (const auto& it: object) {
    auto key = CreateString(it.first);
    obj[key] = it.second;
  }
  return CreateObject(obj);
}

std::shared_ptr<CtxValue> V8Ctx::CreateObject(const std::unordered_map<
    std::shared_ptr<CtxValue>,
    std::shared_ptr<CtxValue>>& object) {
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  v8::Local<v8::Object> obj = v8::Object::New(isolate_);
  for (const auto& it: object) {
    auto key_ctx_value = std::static_pointer_cast<V8CtxValue>(it.first);
    auto key_handle_value = v8::Local<v8::Value>::New(isolate_, key_ctx_value->global_value_);
    auto value_ctx_value = std::static_pointer_cast<V8CtxValue>(it.second);
    auto value_handle_value = v8::Local<v8::Value>::New(isolate_, value_ctx_value->global_value_);
    obj->Set(context, key_handle_value, value_handle_value).ToChecked();
  }
  return std::make_shared<V8CtxValue>(isolate_, obj);
}

std::shared_ptr<CtxValue> V8Ctx::CreateArray(
    size_t count,
    std::shared_ptr<CtxValue> value[]) {
  int array_size;
  if (!footstone::numeric_cast<size_t, int>(count, array_size)) {
    FOOTSTONE_LOG(ERROR) << "array length out of boundary";
    return nullptr;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  v8::Local<v8::Array> array = v8::Array::New(isolate_, array_size);
  for (auto i = 0; i < array_size; i++) {
    v8::Local<v8::Value> handle_value;
    std::shared_ptr<V8CtxValue> ctx_value = std::static_pointer_cast<V8CtxValue>(value[i]);
    if (ctx_value) {
      handle_value = v8::Local<v8::Value>::New(isolate_, ctx_value->global_value_);
    } else {
      FOOTSTONE_LOG(ERROR) << "array item error";
      return nullptr;
    }
    if (!array->Set(context, static_cast<uint32_t >(i), handle_value).FromMaybe(false)) {
      FOOTSTONE_LOG(ERROR) << "set array item failed";
      return nullptr;
    }
  }
  return std::make_shared<V8CtxValue>(isolate_, array);
}

std::shared_ptr<CtxValue> V8Ctx::CreateMap(const std::map<
    std::shared_ptr<CtxValue>,
    std::shared_ptr<CtxValue>>& map) {

  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  v8::Local<v8::Map> js_map = v8::Map::New(isolate_);
  for (auto& it: map) {
    auto key_ctx_value = std::static_pointer_cast<V8CtxValue>(it.first);
    auto key_handle_value = v8::Local<v8::Value>::New(isolate_, key_ctx_value->global_value_);
    auto value_ctx_value = std::static_pointer_cast<V8CtxValue>(it.second);
    auto value_handle_value = v8::Local<v8::Value>::New(isolate_, value_ctx_value->global_value_);
    js_map->Set(context, key_handle_value, value_handle_value).ToLocalChecked();
  }
  return std::make_shared<V8CtxValue>(isolate_, js_map);
}

std::shared_ptr<CtxValue> V8Ctx::CreateException(const string_view& msg) {
  FOOTSTONE_DLOG(INFO) << "V8Ctx::CreateException msg = " << msg;
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  auto error = v8::Exception::Error(V8VM::CreateV8String(isolate_, context, msg));
  if (error.IsEmpty()) {
    FOOTSTONE_LOG(INFO) << "error is empty";
    return nullptr;
  }
  return std::make_shared<V8CtxValue>(isolate_, error);
}

#if V8_MAJOR_VERSION >= 9
static void ArrayBufferDataDeleter(void* data, size_t length, void* deleter_data) {
  free(data);
}
#endif //V8_MAJOR_VERSION >= 9

std::shared_ptr<CtxValue> V8Ctx::CreateByteBuffer(void* buffer, size_t length) {
  if (!buffer) {
    return nullptr;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
#if V8_MAJOR_VERSION < 9
  v8::Local<v8::ArrayBuffer> array_buffer = v8::ArrayBuffer::New(isolate_, buffer, length, v8::ArrayBufferCreationMode::kInternalized);
#else
  auto backingStore = v8::ArrayBuffer::NewBackingStore(buffer, length, ArrayBufferDataDeleter,
                                                       nullptr);
  v8::Local<v8::ArrayBuffer> array_buffer = v8::ArrayBuffer::New(isolate_, std::move(backingStore));
#endif //V8_MAJOR_VERSION >= 9

  if (array_buffer.IsEmpty()) {
    FOOTSTONE_LOG(ERROR) << "array_buffer is empty";
    return nullptr;
  }
  return std::make_shared<V8CtxValue>(isolate_, array_buffer);
}

bool V8Ctx::GetValueNumber(const std::shared_ptr<CtxValue>& value, double* result) {
  if (!value || !result) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  auto ctx_value = std::static_pointer_cast<V8CtxValue>(value);
  auto handle_value = v8::Local<v8::Value>::New(isolate_, ctx_value->global_value_);

  if (handle_value.IsEmpty() || !handle_value->IsNumber()) {
    return false;
  }

  auto number = handle_value->ToNumber(context).ToLocalChecked();
  if (number.IsEmpty()) {
    return false;
  }

  *result = number->Value();
  return true;
}

bool V8Ctx::GetValueNumber(const std::shared_ptr<CtxValue>& value, int32_t* result) {
  if (!value || !result) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(isolate_, global_value);

  if (handle_value.IsEmpty() || !handle_value->IsInt32()) {
    return false;
  }

  v8::Local<v8::Int32> number = handle_value->ToInt32(context).ToLocalChecked();
  *result = number->Value();
  return true;
}

bool V8Ctx::GetValueBoolean(const std::shared_ptr<CtxValue>& value, bool* result) {
  if (!value || !result) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(isolate_, global_value);

  if (handle_value.IsEmpty() ||
      (!handle_value->IsBoolean() && !handle_value->IsBooleanObject())) {
    return false;
  }

  v8::Local<v8::Boolean> boolean = handle_value->ToBoolean(isolate_);
  *result = boolean->Value();
  return true;
}

bool V8Ctx::GetValueString(const std::shared_ptr<CtxValue>& value,
                           string_view* result) {
  if (!value || !result) {
    return false;
  }
  auto ctx_value = std::static_pointer_cast<V8CtxValue>(value);
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  auto handle_value = v8::Local<v8::Value>::New(isolate_, global_value);
  if (handle_value.IsEmpty()) {
    return false;
  }

  if (handle_value->IsString() || handle_value->IsStringObject()) {
    *result = V8VM::ToStringView(isolate_, context, handle_value->ToString(context).ToLocalChecked());
    return true;
  }
  return false;
}

bool V8Ctx::GetValueJson(const std::shared_ptr<CtxValue>& value,
                         string_view* result) {
  if (!value || !result) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(isolate_, global_value);
  if (handle_value.IsEmpty() || !handle_value->IsObject()) {
    return false;
  }

  v8::MaybeLocal<v8::String> v8_maybe_string =
      v8::JSON::Stringify(context, handle_value);
  if (v8_maybe_string.IsEmpty()) {
    return false;
  }

  auto v8_string = v8_maybe_string.ToLocalChecked();
  *result = V8VM::ToStringView(isolate_, context, v8_string);
  return true;
}

bool V8Ctx::GetEntriesFromObject(const std::shared_ptr<CtxValue>& value,
                                 std::unordered_map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>>& map) {
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);

  auto ctx_value = std::static_pointer_cast<V8CtxValue>(value);
  auto handle_value = v8::Local<v8::Value>::New(isolate_, ctx_value->global_value_);
  auto handle_object = v8::Local<v8::Object>::Cast(handle_value);

  auto property_names = handle_object->GetPropertyNames(context);
  if (property_names.IsEmpty()) {
    return false;
  }
  auto names = property_names.ToLocalChecked();
  for (uint32_t i = 0; i < names->Length(); ++i) {
    auto maybe_key = names->Get(context, i);
    FOOTSTONE_DCHECK(!maybe_key.IsEmpty());
    if (maybe_key.IsEmpty()) {
      continue;
    }
    auto key = maybe_key.ToLocalChecked();
    auto maybe_value= handle_object->Get(context, key);
    FOOTSTONE_DCHECK(!maybe_value.IsEmpty());
    if (maybe_value.IsEmpty()) {
      continue;
    }
    map[std::make_shared<V8CtxValue>(isolate_, maybe_key.ToLocalChecked())] = std::make_shared<V8CtxValue>(
        isolate_, maybe_value.ToLocalChecked());
  }
  return true;
}

bool V8Ctx::GetEntriesFromMap(const std::shared_ptr<CtxValue>& value,
                              std::unordered_map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>>& map) {
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);

  auto ctx_value = std::static_pointer_cast<V8CtxValue>(value);
  auto handle_value = v8::Local<v8::Value>::New(isolate_, ctx_value->global_value_);
  auto handle_object = v8::Local<v8::Map>::Cast(handle_value);

  auto handle_array = handle_object->AsArray();
  std::shared_ptr<CtxValue> map_key;
  std::shared_ptr<CtxValue> map_value;
  for (uint32_t i = 0; i < handle_array->Length(); ++i) {
    if (i % 2 == 0) {
      map_key = std::make_shared<V8CtxValue>(isolate_, handle_array->Get(context, i).ToLocalChecked());
    } else {
      map[map_key] = std::make_shared<V8CtxValue>(isolate_, handle_array->Get(context, i).ToLocalChecked());
    }
  }
  return true;
}

bool V8Ctx::IsMap(const std::shared_ptr<CtxValue>& value) {
  if (!value) {
    return false;
  }

  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  auto ctx_value = std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& persistent_value = ctx_value->global_value_;
  auto handle_value = v8::Local<v8::Value>::New(isolate_, persistent_value);

  if (handle_value.IsEmpty()) {
    return false;
  }
  return handle_value->IsMap();
}

bool V8Ctx::IsNull(const std::shared_ptr<CtxValue>& value) {
  if (!value) {
    return false;
  }

  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  auto ctx_value = std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& persistent_value = ctx_value->global_value_;
  auto handle_value = v8::Local<v8::Value>::New(isolate_, persistent_value);
  if (handle_value.IsEmpty()) {
    return false;
  }
  return handle_value->IsNull();
}

bool V8Ctx::IsUndefined(const std::shared_ptr<CtxValue>& value) {
  if (!value) {
    return false;
  }

  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  auto ctx_value = std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& persistent_value = ctx_value->global_value_;
  auto handle_value = v8::Local<v8::Value>::New(isolate_, persistent_value);
  if (handle_value.IsEmpty()) {
    return false;
  }
  return handle_value->IsUndefined();
}

bool V8Ctx::IsNullOrUndefined(const std::shared_ptr<CtxValue>& value) {
  if (!value) {
    return true;
  }

  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  auto ctx_value = std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& persistent_value = ctx_value->global_value_;
  auto handle_value = v8::Local<v8::Value>::New(isolate_, persistent_value);
  if (handle_value.IsEmpty()) {
    return false;
  }
  return handle_value->IsNullOrUndefined();
}

// Array Helpers

bool V8Ctx::IsArray(const std::shared_ptr<CtxValue>& value) {
  if (!value) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(isolate_, global_value);

  if (handle_value.IsEmpty()) {
    return false;
  }
  return handle_value->IsArray();
}

uint32_t V8Ctx::GetArrayLength(const std::shared_ptr<CtxValue>& value) {
  if (value == nullptr) {
    return 0;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(isolate_, global_value);

  if (handle_value.IsEmpty()) {
    return 0;
  }

  if (handle_value->IsArray()) {
    v8::Array* array = v8::Array::Cast(*handle_value);
    return array->Length();
  }

  return 0;
}

std::shared_ptr<CtxValue> V8Ctx::CopyArrayElement(
    const std::shared_ptr<CtxValue>& value,
    uint32_t index) {
  if (!value) {
    return nullptr;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value = v8::Local<v8::Value>::New(isolate_, global_value);

  if (handle_value.IsEmpty()) {
    return nullptr;
  }

  if (handle_value->IsArray()) {
    v8::Array* array = v8::Array::Cast(*handle_value);
    v8::Local<v8::Value> ret = array->Get(context, index).ToLocalChecked();
    if (ret.IsEmpty()) {
      return nullptr;
    }

    return std::make_shared<V8CtxValue>(isolate_, ret);
  }
  return nullptr;
}

// Map Helpers
size_t V8Ctx::GetMapLength(std::shared_ptr<CtxValue>& value) {
  if (value == nullptr) {
    return 0;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& persistent_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(isolate_, persistent_value);

  if (handle_value.IsEmpty()) {
    return 0;
  }

  if (handle_value->IsMap()) {
    v8::Map* map = v8::Map::Cast(*handle_value);
    return map->Size();
  }

  return 0;
}

std::shared_ptr<CtxValue> V8Ctx::ConvertMapToArray(
    const std::shared_ptr<CtxValue>& value) {
  if (value == nullptr) {
    return nullptr;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& persistent_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(isolate_, persistent_value);

  if (handle_value.IsEmpty()) {
    return nullptr;
  }

  if (handle_value->IsMap()) {
    v8::Map* map = v8::Map::Cast(*handle_value);
    v8::Local<v8::Array> array = map->AsArray();
    return std::make_shared<V8CtxValue>(isolate_, array);
  }

  return nullptr;
}

// Object Helpers

bool V8Ctx::HasNamedProperty(const std::shared_ptr<CtxValue>& value,
                             const string_view& name) {
  if (!value || StringViewUtils::IsEmpty(name)) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  auto ctx_value = std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  auto handle_value = v8::Local<v8::Value>::New(isolate_, global_value);

  if (handle_value.IsEmpty()) {
    return false;
  }

  if (handle_value->IsMap()) {
    v8::Map* map = v8::Map::Cast(*handle_value);
    auto key = V8VM::CreateV8String(isolate_, context, name);
    if (key.IsEmpty()) {
      return false;
    }

    v8::Maybe<bool> ret = map->Has(context, key);
    return ret.ToChecked();
  }
  return false;
}

std::shared_ptr<CtxValue> V8Ctx::CopyNamedProperty(
    const std::shared_ptr<CtxValue>& value,
    const string_view& name) {
  if (!value || StringViewUtils::IsEmpty(name)) {
    return nullptr;
  }
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  auto ctx_value = std::static_pointer_cast<V8CtxValue>(value);
  const auto& global_value = ctx_value->global_value_;
  auto handle_value = v8::Local<v8::Value>::New(isolate_, global_value);

  if (handle_value.IsEmpty()) {
    return nullptr;
  }

  if (handle_value->IsMap()) {
    auto map = v8::Map::Cast(*handle_value);
    if (!map) {
      return nullptr;
    }
    auto key = V8VM::CreateV8String(isolate_, context, name);
    if (key.IsEmpty()) {
      return nullptr;
    }

    return std::make_shared<V8CtxValue>(isolate_, map->Get(context, key).ToLocalChecked());
  }

  return nullptr;
}

std::shared_ptr<CtxValue> V8Ctx::GetPropertyNames(const std::shared_ptr<CtxValue>& value) {
  if (!value) {
    return nullptr;
  }
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  auto ctx_value = std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  auto handle_value = v8::Local<v8::Value>::New(isolate_, global_value);
  auto object = handle_value->ToObject(context);
  if (object.IsEmpty()) {
    return nullptr;
  }
  auto props = object.ToLocalChecked()->GetPropertyNames(context);
  if (props.IsEmpty()) {
    return nullptr;
  }
  return std::make_shared<V8CtxValue>(isolate_, props.ToLocalChecked());
}


std::shared_ptr<CtxValue> V8Ctx::GetOwnPropertyNames(const std::shared_ptr<CtxValue>& value) {
  if (!value) {
    return nullptr;
  }
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  auto ctx_value = std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  auto handle_value = v8::Local<v8::Value>::New(isolate_, global_value);
  auto object = handle_value->ToObject(context);
  if (object.IsEmpty()) {
    return nullptr;
  }
  auto props = object.ToLocalChecked()->GetOwnPropertyNames(context);
  if (props.IsEmpty()) {
    return nullptr;
  }
  return std::make_shared<V8CtxValue>(isolate_, props.ToLocalChecked());
}

bool V8Ctx::IsBoolean(const std::shared_ptr<CtxValue>& value) {
  if (!value) {
    return false;
  }
  auto ctx_value = std::static_pointer_cast<V8CtxValue>(value);
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  const auto& global_value = ctx_value->global_value_;
  auto handle_value = v8::Local<v8::Value>::New(isolate_, global_value);
  return handle_value->IsBoolean();
}

bool V8Ctx::IsNumber(const std::shared_ptr<CtxValue>& value) {
  if (!value) {
    return false;
  }
  auto ctx_value = std::static_pointer_cast<V8CtxValue>(value);
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  const auto& global_value = ctx_value->global_value_;
  auto handle_value = v8::Local<v8::Value>::New(isolate_, global_value);
  return handle_value->IsNumber();
}

bool V8Ctx::IsString(const std::shared_ptr<CtxValue>& value) {
  if (!value) {
    return false;
  }
  auto ctx_value = std::static_pointer_cast<V8CtxValue>(value);
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  const auto& global_value = ctx_value->global_value_;
  auto handle_value = v8::Local<v8::Value>::New(isolate_, global_value);
  return handle_value->IsString();
}

bool V8Ctx::IsFunction(const std::shared_ptr<CtxValue>& value) {
  if (!value) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value = std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value = v8::Local<v8::Value>::New(isolate_, global_value);

  if (handle_value.IsEmpty()) {
    return false;
  }

  return handle_value->IsFunction();
}

bool V8Ctx::IsObject(const std::shared_ptr<CtxValue>& value) {
  if (!value) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value = std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value = v8::Local<v8::Value>::New(isolate_, global_value);

  if (handle_value.IsEmpty()) {
    return false;
  }

  return handle_value->IsObject();
}

string_view V8Ctx::CopyFunctionName(const std::shared_ptr<CtxValue>& function) {
  if (!function) {
    return {};
  }
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  auto ctx_value = std::static_pointer_cast<V8CtxValue>(function);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  auto handle_value = v8::Local<v8::Value>::New(isolate_, global_value);

  string_view result;
  if (handle_value->IsFunction()) {
    auto v8_str = handle_value->ToString(context).ToLocalChecked();
    result = V8VM::ToStringView(isolate_, context, v8_str);
  }

  return result;
}

bool V8Ctx::SetProperty(std::shared_ptr<CtxValue> object,
                        std::shared_ptr<CtxValue> key,
                        std::shared_ptr<CtxValue> value) {
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  auto v8_object = std::static_pointer_cast<V8CtxValue>(object);
  auto handle_v8_object = v8::Local<v8::Value>::New(isolate_, v8_object->global_value_);
  auto v8_key = std::static_pointer_cast<V8CtxValue>(key);
  auto handle_v8_key = v8::Local<v8::Value>::New(isolate_, v8_key->global_value_);
  auto v8_value = std::static_pointer_cast<V8CtxValue>(value);
  auto handle_v8_value = v8::Local<v8::Value>::New(isolate_, v8_value->global_value_);

  auto handle_object = v8::Local<v8::Object>::Cast(handle_v8_object);
  return handle_object->Set(context, handle_v8_key, handle_v8_value).FromMaybe(false);
}

bool V8Ctx::SetProperty(std::shared_ptr<CtxValue> object,
                        std::shared_ptr<CtxValue> key,
                        std::shared_ptr<CtxValue> value,
                        const PropertyAttribute& attr) {
  if (!IsString(key)) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  auto v8_object = std::static_pointer_cast<V8CtxValue>(object);
  auto handle_v8_object = v8::Local<v8::Value>::New(isolate_, v8_object->global_value_);
  auto v8_key = std::static_pointer_cast<V8CtxValue>(key);
  auto handle_v8_key = v8::Local<v8::Value>::New(isolate_, v8_key->global_value_);
  auto v8_value = std::static_pointer_cast<V8CtxValue>(value);
  auto handle_v8_value = v8::Local<v8::Value>::New(isolate_, v8_value->global_value_);

  auto handle_object = v8::Local<v8::Object>::Cast(handle_v8_object);
  auto v8_attr = v8::PropertyAttribute(attr);
  return handle_object->DefineOwnProperty(context,
                                          handle_v8_key->ToString(context).ToLocalChecked(),
                                          handle_v8_value, v8_attr).FromMaybe(false);
}

std::shared_ptr<CtxValue> V8Ctx::CreateObject() {
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  auto object = v8::Object::New(isolate_);
  return std::make_shared<V8CtxValue>(isolate_, object);
}

std::shared_ptr<CtxValue> V8Ctx::NewInstance(const std::shared_ptr<CtxValue>& cls,
                                             int argc, std::shared_ptr<CtxValue> argv[],
                                             void* external) {
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  auto v8_cls = std::static_pointer_cast<V8CtxValue>(cls);
  auto cls_handle_value = v8::Local<v8::Value>::New(isolate_, v8_cls->global_value_);
  auto function = v8::Local<v8::Function>::Cast(cls_handle_value);
  v8::Local<v8::Object> instance;
  if (argc > 0 && argv) {
    v8::Local<v8::Value> v8_argv[argc];
    for (auto i = 0; i < argc; ++i) {
      auto v8_value = std::static_pointer_cast<V8CtxValue>(argv[i]);
      v8_argv[i] = v8::Local<v8::Value>::New(isolate_, v8_value->global_value_);
    }
    instance = function->NewInstance(context, argc, v8_argv).ToLocalChecked();
  } else {
    instance = function->NewInstance(context).ToLocalChecked();
  }
  if (external) {
    auto external_value = v8::External::New(isolate_, external);
    instance->SetInternalField(kExternalIndex, external_value);
  }
  return std::make_shared<V8CtxValue>(isolate_, instance);
}

void* V8Ctx::GetObjectExternalData(const std::shared_ptr<CtxValue>& object) {
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  auto v8_object = std::static_pointer_cast<V8CtxValue>(object);
  auto handle_value = v8::Local<v8::Value>::New(isolate_, v8_object->global_value_);
  auto handle_object = v8::Local<v8::Object>::Cast(handle_value);
  return handle_object->GetInternalField(kExternalIndex).As<v8::External>()->Value();
}

std::shared_ptr<CtxValue> V8Ctx::DefineProxy(const std::unique_ptr<FunctionWrapper>& constructor_wrapper) {
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  auto func_tpl = v8::FunctionTemplate::New(isolate_);
  auto obj_tpl = func_tpl->InstanceTemplate();
  obj_tpl->SetHandler(v8::NamedPropertyHandlerConfiguration(InvokePropertyCallback,
                                                            nullptr,
                                                            nullptr,
                                                            nullptr,
                                                            nullptr,
                                                            v8::External::New(isolate_,
                                                                              reinterpret_cast<void*>(constructor_wrapper.get()))));
  obj_tpl->SetInternalFieldCount(1);
  return std::make_shared<V8CtxValue>(isolate_, func_tpl->GetFunction(context).ToLocalChecked());
}

std::shared_ptr<CtxValue> V8Ctx::DefineClass(const string_view& name,
                                             const std::shared_ptr<ClassDefinition>& parent,
                                             const std::unique_ptr<FunctionWrapper>& constructor_wrapper,
                                             size_t property_count,
                                             std::shared_ptr<PropertyDescriptor> properties[]) {
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  auto tpl = CreateTemplate(constructor_wrapper);
  if (parent) {
    auto parent_template = std::static_pointer_cast<V8ClassDefinition>(parent);
    auto parent_template_handle = v8::Local<v8::FunctionTemplate>::New(
        isolate_,parent_template->GetTemplate());
    tpl->Inherit(parent_template_handle);
  }
  auto prototype_template = tpl->PrototypeTemplate();
  tpl->InstanceTemplate()->SetInternalFieldCount(1);
  tpl->SetClassName(V8VM::CreateV8String(isolate_, context, name));
  for (size_t i = 0; i < property_count; i++) {
    const auto& prop_desc = properties[i];
    auto v8_attr = v8::PropertyAttribute(prop_desc->attr);
    auto prop_name = std::static_pointer_cast<V8CtxValue>(prop_desc->name);
    auto property_name = v8::Local<v8::Value>::New(isolate_, prop_name->global_value_);
    auto v8_prop_name = v8::Local<v8::Name>::Cast(property_name);
    if (prop_desc->getter || prop_desc->setter) {
      v8::Local<v8::FunctionTemplate> getter_tpl;
      v8::Local<v8::FunctionTemplate> setter_tpl;
      if (prop_desc->getter) {
        getter_tpl = CreateTemplate(prop_desc->getter);
      }
      if (prop_desc->setter) {
        setter_tpl = CreateTemplate(prop_desc->setter);
      }
      prototype_template->SetAccessorProperty(
          v8_prop_name,
          getter_tpl,
          setter_tpl,
          v8_attr,
          v8::AccessControl::DEFAULT);
    } else if (prop_desc->method) {
      auto method = CreateTemplate(prop_desc->method);
      prototype_template->Set(v8_prop_name, method, v8_attr);
    } else {
      auto v8_ctx = std::static_pointer_cast<V8CtxValue>(prop_desc->value);
      auto handle_value = v8::Local<v8::Value>::New(isolate_, v8_ctx->global_value_);
      prototype_template->Set(v8_prop_name, handle_value, v8_attr);
    }
  }
  // todo(polly) static_property

  template_map_[name] = std::make_shared<V8ClassDefinition>(isolate_, tpl);

  return std::make_shared<V8CtxValue>(isolate_, tpl->GetFunction(context).ToLocalChecked());
}

bool V8Ctx::Equals(const std::shared_ptr<CtxValue>& lhs, const std::shared_ptr<CtxValue>& rhs) {
  FOOTSTONE_DCHECK(lhs != nullptr && rhs != nullptr);
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_lhs = std::static_pointer_cast<V8CtxValue>(lhs);
  std::shared_ptr<V8CtxValue> ctx_rhs = std::static_pointer_cast<V8CtxValue>(rhs);

  const v8::Global<v8::Value>& global_lhs = ctx_lhs->global_value_;
  FOOTSTONE_DCHECK(!global_lhs.IsEmpty());
  v8::Local<v8::Value> local_lhs = v8::Local<v8::Value>::New(isolate_, global_lhs);

  const v8::Global<v8::Value>& global_rhs = ctx_rhs->global_value_;
  FOOTSTONE_DCHECK(!global_rhs.IsEmpty());
  v8::Local<v8::Value> local_rhs = v8::Local<v8::Value>::New(isolate_, global_rhs);

  FOOTSTONE_DCHECK(!local_lhs.IsEmpty());

  v8::Maybe<bool> maybe = local_lhs->Equals(context, local_rhs);
  if(maybe.IsNothing()) {
    return false;
  }
  return maybe.FromJust();
}

bool V8Ctx::IsByteBuffer(const std::shared_ptr<CtxValue>& value) {
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& persistent_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(isolate_, persistent_value);
  if (handle_value.IsEmpty()) {
    return false;
  }
  return handle_value->IsArrayBuffer();
}

bool V8Ctx::GetByteBuffer(const std::shared_ptr<CtxValue>& value,
                          void** out_data,
                          size_t& out_length,
                          uint32_t& out_type) {
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  auto ctx_value = std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& persistent_value = ctx_value->global_value_;
  auto handle_value = v8::Local<v8::Value>::New(isolate_, persistent_value);
  if (handle_value.IsEmpty()) {
    return false;
  }
  if (!handle_value->IsArrayBuffer()) {
    return false;
  }
  v8::Local<v8::ArrayBuffer> array_buffer = v8::Local<v8::ArrayBuffer>::Cast(handle_value);
#if V8_MAJOR_VERSION < 9
  *out_data = array_buffer->GetContents().Data();
  out_length = array_buffer->ByteLength();
#else
  *out_data = array_buffer->GetBackingStore()->Data();
  out_length = array_buffer->ByteLength();
#endif //V8_MAJOR_VERSION < 9
  return true;
}

void  V8Ctx::SetWeak(std::shared_ptr<CtxValue> value,
                     const std::unique_ptr<WeakCallbackWrapper>& wrapper) {
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  auto ctx_value = std::static_pointer_cast<V8CtxValue>(value);
  auto handle_value = v8::Local<v8::Value>::New(isolate_, ctx_value->global_value_);
  auto handle_object = v8::Local<v8::Object>::Cast(handle_value);
  v8::Global<v8::Value> weak(isolate_, handle_object);
  weak.SetWeak(reinterpret_cast<void*>(wrapper.get()), [](const v8::WeakCallbackInfo<void>& info) {
    info.SetSecondPassCallback([](const v8::WeakCallbackInfo<void>& info) {
      auto wrapper = reinterpret_cast<WeakCallbackWrapper*>(info.GetParameter());
      auto internal = info.GetInternalField(kExternalIndex);
      wrapper->callback(wrapper->data, internal);
    });
  }, v8::WeakCallbackType::kParameter);
}

}  // namespace napi
}  // namespace driver
}  // namespace hippy
