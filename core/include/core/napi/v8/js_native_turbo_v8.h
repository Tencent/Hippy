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

#include <list>

#include "core/napi/js_native_turbo.h"
#include "core/napi/v8/js_native_api_v8.h"
#include "v8/v8.h"

namespace hippy {
namespace napi {

class V8TurboEnv : public TurboEnv {
 public:
  V8TurboEnv(const std::shared_ptr<Ctx> &context);

  virtual ~V8TurboEnv();

  std::shared_ptr<CtxValue> CreateFunction(
      const std::shared_ptr<CtxValue> &name,
      int param_count,
      HostFunctionType func) override;

  std::shared_ptr<CtxValue> CreateObject(
      const std::shared_ptr<HostObject> &host_object) override;

 private:
  struct IHostProxy {
    virtual void Destroy() = 0;
  };

  class HostObjectTracker {
   public:
    void ResetHostObject() {
      TDF_BASE_DLOG(INFO) << "HostObjectTracker ResetHostObject";
      if (!is_reset_) {
        is_reset_ = true;
        if (host_proxy_) {
          host_proxy_->Destroy();
        }
        if (!object_tracker_.IsEmpty()) {
          object_tracker_.Reset();
        }
      }
    }

    HostObjectTracker(V8TurboEnv &env,
                      v8::Local<v8::Object> obj,
                      IHostProxy *host_proxy)
        : host_proxy_(host_proxy) {
      std::shared_ptr<V8Ctx> v8_ctx =
          std::static_pointer_cast<V8Ctx>(env.context_);
      object_tracker_.Reset(v8_ctx->isolate_, obj);
      object_tracker_.SetWeak(this, HostObjectTracker::Destroyed,
                              v8::WeakCallbackType::kParameter);
    }

    ~HostObjectTracker() {
      TDF_BASE_DLOG(INFO) << "~HostObjectTracker";
      assert(is_reset_);
    }

    bool equals(IHostProxy *proxy) { return host_proxy_ == proxy; }

   private:
    v8::Global<v8::Object> object_tracker_;
    std::atomic<bool> is_reset_{false};
    IHostProxy *host_proxy_;

    static void Destroyed(const v8::WeakCallbackInfo<HostObjectTracker> &data) {
      TDF_BASE_DLOG(INFO) << "Destroyed HostObjectTracker in GC.";
      v8::HandleScope handle_scope(data.GetIsolate());
      data.GetParameter()->ResetHostObject();
    }
  };

  class HostObjectProxy : public IHostProxy {
   public:
    HostObjectProxy(V8TurboEnv &v8_turbo_env,
                    const std::shared_ptr<HostObject> &host_object)
        : v8_turbo_env_(v8_turbo_env), host_object_(host_object) {}

    static void Get(v8::Local<v8::Name> name,
                    const v8::PropertyCallbackInfo<v8::Value> &info) {
      v8::Local<v8::External> data =
          v8::Local<v8::External>::Cast(info.This()->GetInternalField(0));
      HostObjectProxy *host_object_proxy =
          reinterpret_cast<HostObjectProxy *>(data->Value());
      TDF_BASE_CHECK(host_object_proxy);

      V8TurboEnv &v8_turbo_env = host_object_proxy->v8_turbo_env_;
      std::shared_ptr<HostObject> host_object = host_object_proxy->host_object_;
      std::shared_ptr<V8CtxValue> name_ptr =
          std::make_shared<V8CtxValue>(info.GetIsolate(), name);

      std::shared_ptr<V8CtxValue> result = std::static_pointer_cast<V8CtxValue>(
          host_object->Get(v8_turbo_env, name_ptr));
      info.GetReturnValue().Set(result->global_value_);
    }

    std::shared_ptr<HostObject> getHostObject() { return host_object_; }

   private:
    friend class HostObjectTracker;

    V8TurboEnv &v8_turbo_env_;
    std::shared_ptr<HostObject> host_object_;

    void Destroy() override { host_object_.reset(); }
  };

  class HostFunctionProxy : public IHostProxy {
   public:
    HostFunctionProxy(V8TurboEnv &v8_turbo_env, HostFunctionType func)
        : func_(std::move(func)), v8_turbo_env_(v8_turbo_env){};

    static void Call(HostFunctionProxy &host_function_proxy,
                     const v8::FunctionCallbackInfo<v8::Value> &callback_info) {
      V8TurboEnv &v8_turbo_env =
          const_cast<V8TurboEnv &>(host_function_proxy.v8_turbo_env_);
      v8::Isolate *isolate = callback_info.GetIsolate();
      TDF_BASE_DLOG(INFO) << "enter call";

      std::vector<std::shared_ptr<CtxValue>> arg_values;
      int arg_size = callback_info.Length();
      for (int i = 0; i < arg_size; i++) {
        arg_values.push_back(
            std::make_shared<V8CtxValue>(isolate, callback_info[i]));
      }

      const std::shared_ptr<CtxValue> &this_val =
          std::make_shared<V8CtxValue>(isolate, callback_info.This());

      std::shared_ptr<CtxValue> result = host_function_proxy.func_(
          v8_turbo_env, this_val, arg_values.data(), arg_size);
      std::shared_ptr<V8CtxValue> v8_result =
          std::static_pointer_cast<V8CtxValue>(result);
      callback_info.GetReturnValue().Set(v8_result->global_value_);
    }

    static void HostFunctionCallback(
        const v8::FunctionCallbackInfo<v8::Value> &info) {
      TDF_BASE_DLOG(INFO) << "enter HostFunctionCallback";
      v8::HandleScope handle_scope(v8::Isolate::GetCurrent());
      v8::Local<v8::External> data = v8::Local<v8::External>::Cast(info.Data());
      HostFunctionProxy *host_function_proxy =
          reinterpret_cast<HostFunctionProxy *>(data->Value());
      host_function_proxy->Call(*host_function_proxy, info);
    }

   private:
    friend class HostObjectTracker;

    HostFunctionType func_;
    V8TurboEnv &v8_turbo_env_;

    void Destroy() override {
      func_ = [](const TurboEnv &env, const std::shared_ptr<CtxValue> &this_val,
                 const std::shared_ptr<CtxValue> *args, size_t count) {
        TDF_BASE_DLOG(INFO) << "enter HostFunctionProxy destroy";
        return env.context_->CreateUndefined();
      };
    }
  };

 public:
  void CreateHostObjectConstructor();

  void AddHostObjectTracker(
      const std::shared_ptr<HostObjectTracker> &host_object_tracker);

  std::list<std::shared_ptr<HostObjectTracker>> host_object_tracker_list_;

  v8::Persistent<v8::Function> host_object_constructor_;

  std::shared_ptr<HostObject> GetHostObject(
      std::shared_ptr<CtxValue> value) override;
};
}  // namespace napi
}  // namespace hippy
