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

#include "jni/convert_utils.h"

#include <memory>
#include <tuple>

#include "core/napi/v8/js_native_turbo_v8.h"
#include "jni/java_turbo_module.h"

using namespace hippy::napi;
using unicode_string_view = tdf::base::unicode_string_view;
using StringViewUtils = hippy::base::StringViewUtils;

bool IsBasicNumberType(const std::string &type) {
  return type == kint || type == kdouble || type == kfloat || type == klong;
}

bool IsNumberObject(const std::string &type) {
  return type == kInteger || type == kDouble || type == kFloat || type == kLong;
}

/**
 * -int/long/float/double/boolean
 * -IsNullOrUndefined()
 * -IsNumber()
 * -IsString()
 * -IsBoolean()
 * IsArray()
 * IsMap()
 *
 * @param scope
 * @param method_name
 * @param method_arg_types
 * @param arg_values
 * @return
 */

std::tuple<bool, std::string, std::shared_ptr<JNIArgs>> ConvertUtils::ConvertJSIArgsToJNIArgs(
    TurboEnv &turbo_env,
    const std::string &module_name,
    const std::string &method_name,
    const std::vector<std::string> &method_arg_types,
    const std::vector<std::shared_ptr<CtxValue>> &arg_values) {
  std::shared_ptr<Ctx> ctx = turbo_env.context_;
  std::shared_ptr<V8Ctx> context = std::static_pointer_cast<V8Ctx>(ctx);

  int actual_arg_count = arg_values.size();
  std::shared_ptr<JNIArgs> jni_args =
      std::make_shared<JNIArgs>(actual_arg_count);
  auto &global_refs = jni_args->global_refs_;

  for (int i = 0; i < actual_arg_count; i++) {
    std::string type = method_arg_types.at(i);

    jvalue *j_args = &jni_args->args_[i];
    std::shared_ptr<CtxValue> value = arg_values.at(i);

    // basic type
    auto base_tuple = HandleBasicType(turbo_env, type, *j_args, value);
    if (!std::get<0>(base_tuple)) {
      return std::make_tuple(false, std::get<1>(base_tuple),
          static_cast<std::shared_ptr<JNIArgs>>(nullptr));
    }
    if (std::get<2>(base_tuple)) {
      continue;
    }

    // unSupport Object type
    if (kUnSupportedType == type) {
      return std::make_tuple(false, "Unsupported type: " + type,
                             static_cast<std::shared_ptr<JNIArgs>>(nullptr));
    }

    // NullOrUndefined
    if (context->IsNullOrUndefined(value)) {
      j_args->l = nullptr;
      continue;
    }

    // Object
    auto obj_tuple = HandleObjectType(turbo_env, module_name, method_name, type, *j_args,
                                      value, global_refs);
    if (!std::get<0>(obj_tuple)) {
      return std::make_tuple(false, std::get<1>(obj_tuple),
          static_cast<std::shared_ptr<JNIArgs>>(nullptr));
    }
  }

  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  if (JNIEnvironment::ClearJEnvException(env)) {
    return std::make_tuple(false, "JNI Exception occurred when convertJSIArgsToJNIArgs ",
                           static_cast<std::shared_ptr<JNIArgs>>(nullptr));
  }

  return std::make_tuple(true, "", jni_args);
}

std::tuple<bool, std::string, bool> ConvertUtils::HandleBasicType(TurboEnv &turbo_env,
                                                                  const std::string &type,
                                                                  jvalue &j_args,
                                                                  const std::shared_ptr<CtxValue> &value) {
  std::shared_ptr<Ctx> ctx = turbo_env.context_;
  std::shared_ptr<V8Ctx> context = std::static_pointer_cast<V8Ctx>(ctx);

  // number
  if (IsBasicNumberType(type)) {
    double num;
    if (!context->GetValueNumber(value, &num)) {
      return std::make_tuple(false, "Must be int/long/float/double.", false);
    }

    if (type == kint) {  // int
      j_args.i = num;
    } else if (type == kdouble) {  // double
      j_args.d = num;
    } else if (type == kfloat) {  // float
      j_args.f = num;
    } else if (type == klong) {  // long
      j_args.j = num;
    }
    return std::make_tuple(true, "", true);
  }

  // boolean
  if (type == "Z") {
    bool b;
    if (!context->GetValueBoolean(value, &b)) {
      return std::make_tuple(false, "Must be boolean.", false);
    }

    j_args.z = b;
    return std::make_tuple(true, "", true);
  }

  return std::make_tuple(true, "", false);
}

std::tuple<bool, std::string, bool>
ConvertUtils::HandleObjectType(TurboEnv &turbo_env,
                               const std::string &module_name,
                               const std::string &method_name,
                               const std::string &type,
                               jvalue &j_args,
                               const std::shared_ptr<CtxValue> &value,
                               std::vector<jobject> &global_refs) {
  std::shared_ptr<Ctx> ctx = turbo_env.context_;
  std::shared_ptr<V8Ctx> context = std::static_pointer_cast<V8Ctx>(ctx);

  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();

  auto make_global = [&global_refs, env](jobject obj) -> jobject {
    jobject global_obj = env->NewGlobalRef(obj);
    global_refs.push_back(global_obj);
    env->DeleteLocalRef(obj);
    return global_obj;
  };

  // Promise
  if (type == kPromise) {
    unicode_string_view str_view;
    std::string str;
    if (turbo_env.context_->GetValueString(value, &str_view)) {
      str = StringViewUtils::ToU8StdStr(str_view);
    } else {
      return std::make_tuple(false, "Must be String.", false);
    }

    TDF_BASE_DLOG(INFO) << "Promise callId " << str.c_str();

    jstring module_name_str = env->NewStringUTF(module_name.c_str());
    jstring method_name_str = env->NewStringUTF(method_name.c_str());
    jstring call_id_str = env->NewStringUTF(str.c_str());
    jobject tmp = env->NewObject(promise_clazz, promise_constructor, static_cast<jobject>(nullptr),
                                 module_name_str, method_name_str, call_id_str);
    env->DeleteLocalRef(module_name_str);
    env->DeleteLocalRef(method_name_str);
    env->DeleteLocalRef(call_id_str);
    j_args.l = make_global(tmp);
    return std::make_tuple(true, "", true);
  }

  // HippyArray
  if (type == kHippyArray) {
    if (!context->IsArray(value)) {
      return std::make_tuple(false, "Must be Array.", false);
    }
    auto to_array_tuple = ToHippyArray(turbo_env, value);
    if (!std::get<0>(to_array_tuple)) {
      return std::make_tuple(false, std::get<1>(to_array_tuple), false);
    }
    j_args.l = make_global(std::get<2>(to_array_tuple));
    return std::make_tuple(true, "", true);
  }

  // HippyMap
  if (type == kHippyMap) {
    if (!context->IsMap(value)) {
      return std::make_tuple(false, "Must be Map.", false);
    }
    auto to_map_tuple = ToHippyMap(turbo_env, value);
    if (!std::get<0>(to_map_tuple)) {
      return std::make_tuple(false, std::get<1>(to_map_tuple), false);
    }
    j_args.l = make_global(std::get<2>(to_map_tuple));
    return std::make_tuple(true, "", true);
  }

  // Boolean
  if (type == kBoolean) {
    bool b;
    if (!context->GetValueBoolean(value, &b)) {
      return std::make_tuple(false, "Must be Boolean.", false);
    }
    j_args.l =
        make_global(env->NewObject(boolean_clazz, boolean_constructor, b));
    return std::make_tuple(true, "", true);
  }

  // String
  if (type == kString) {
    unicode_string_view str_view;
    std::string str;
    if (turbo_env.context_->GetValueString(value, &str_view)) {
      str = StringViewUtils::ToU8StdStr(str_view);
    } else {
      return std::make_tuple(false, "Must be String.", false);
    }

    j_args.l = make_global(env->NewStringUTF(str.c_str()));
    return std::make_tuple(true, "", true);
  }

  // Number Object
  if (IsNumberObject(type)) {
    double num;
    if (!context->GetValueNumber(value, &num)) {
      return std::make_tuple(true, "Integer/Double/Float/Long.", false);
    }

    if (type == kInteger) {  // Integer
      j_args.l = make_global(
          env->NewObject(integer_clazz, integer_constructor, (int) num));
    } else if (type == kDouble) {  // Double
      j_args.l =
          make_global(env->NewObject(double_clazz, double_constructor, num));
    } else if (type == kFloat) {  // Float
      j_args.l = make_global(
          env->NewObject(float_clazz, float_constructor, (float) num));
    } else if (type == kLong) {  // Long
      j_args.l = make_global(
          env->NewObject(long_clazz, long_constructor, (int64_t) num));
    } else {
      return std::make_tuple(false, "", false);
    }
    return std::make_tuple(true, "", true);
  }

  std::shared_ptr<HostObject> host_object = turbo_env.GetHostObject(value);
  if (host_object) {
    std::shared_ptr<JavaTurboModule> j_turbo_module =
        std::static_pointer_cast<JavaTurboModule>(host_object);
    j_args.l = j_turbo_module->impl_->GetObj();
    return std::make_tuple(true, "", true);
  }
  return std::make_tuple(false, "", false);
}

std::tuple<bool, std::string, jobject> ConvertUtils::ToHippyMap(TurboEnv &turbo_env,
                                                                const std::shared_ptr<CtxValue> &value) {
  std::shared_ptr<Ctx> ctx = turbo_env.context_;
  std::shared_ptr<V8Ctx> context = std::static_pointer_cast<V8Ctx>(ctx);

  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  jobject obj = env->NewObject(hippy_map_clazz, hippy_map_constructor);
  std::shared_ptr<CtxValue> array = context->ConvertMapToArray(value);

  int array_len = context->GetArrayLength(array);
  for (int i = 0; i < array_len; i = i + 2) {
    // key
    std::shared_ptr<CtxValue> key = context->CopyArrayElement(array, i);
    unicode_string_view str_view;
    std::string key_str;
    if (turbo_env.context_->GetValueString(key, &str_view)) {
      key_str = StringViewUtils::ToU8StdStr(str_view);
    } else {
      return std::make_tuple(false, "Key must be String in Map.", static_cast<jobject>(nullptr));
    }

    jobject key_j_obj = env->NewStringUTF(key_str.c_str());
    TDF_BASE_DLOG(INFO) << "key " << key_str.c_str();

    // value
    std::shared_ptr<CtxValue> item = context->CopyArrayElement(array, i + 1);
    auto to_jobject_tuple = ToJObject(turbo_env, item);
    if (!std::get<0>(to_jobject_tuple)) {
      return std::make_tuple(false, std::get<1>(to_jobject_tuple), static_cast<jobject>(nullptr));
    }
    jobject value_j_obj = std::get<2>(to_jobject_tuple);
    env->CallVoidMethod(obj, hippy_map_push_object, key_j_obj, value_j_obj);

    env->DeleteLocalRef(key_j_obj);
    env->DeleteLocalRef(value_j_obj);
  }
  return std::make_tuple(true, "", obj);
}

std::tuple<bool, std::string, jobject> ConvertUtils::ToHippyArray(TurboEnv &turbo_env,
                                                                  const std::shared_ptr<CtxValue> &value) {
  std::shared_ptr<Ctx> ctx = turbo_env.context_;
  std::shared_ptr<V8Ctx> context = std::static_pointer_cast<V8Ctx>(ctx);
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  jobject obj = env->NewObject(hippy_array_clazz, hippy_array_constructor);
  int array_len = context->GetArrayLength(value);
  for (int i = 0; i < array_len; i++) {
    std::shared_ptr<CtxValue> item = context->CopyArrayElement(value, i);
    auto to_jobject_tuple = ToJObject(turbo_env, item);
    if (!std::get<0>(to_jobject_tuple)) {
      return to_jobject_tuple;
    }
    jobject j_obj = std::get<2>(to_jobject_tuple);
    env->CallVoidMethod(obj, hippy_array_push_object, j_obj);
    env->DeleteLocalRef(j_obj);
  }
  return std::make_tuple(true, "", obj);
}

std::tuple<bool, std::string, jobject> ConvertUtils::ToJObject(TurboEnv &turbo_env,
                                                               const std::shared_ptr<CtxValue> &value) {
  double num;
  bool b;
  std::string str;
  jobject result;

  std::shared_ptr<Ctx> ctx = turbo_env.context_;
  std::shared_ptr<V8Ctx> context = std::static_pointer_cast<V8Ctx>(ctx);
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  unicode_string_view str_view;

  if (context->GetValueNumber(value, &num)) {
    result = env->NewObject(double_clazz, double_constructor, num);
  } else if (context->GetValueString(value, &str_view)) {
    str = StringViewUtils::ToU8StdStr(str_view);
    result = env->NewStringUTF(str.c_str());
  } else if (context->GetValueBoolean(value, &b)) {
    result = env->NewObject(boolean_clazz, boolean_constructor, b);
  } else if (context->IsArray(value)) {
    auto array_tuple = ToHippyArray(turbo_env, value);
    if (!std::get<0>(array_tuple)) {
      return array_tuple;
    }
    result = std::get<2>(array_tuple);
  } else if (context->IsMap(value)) {
    auto map_tuple = ToHippyMap(turbo_env, value);
    if (!std::get<0>(map_tuple)) {
      return map_tuple;
    }
    result = std::get<2>(map_tuple);
  } else if (context->IsNullOrUndefined(value)) {
    result = nullptr;
  } else {
    return std::make_tuple(false, "UnSupported Type in HippyArray or HippyMap.",
                           static_cast<jobject>(nullptr));
  }
  return std::make_tuple(true, "", result);
}

std::unordered_map<std::string, MethodInfo> ConvertUtils::GetMethodMap(
    const std::string &method_map_str) {
  std::unordered_map<std::string, MethodInfo> method_map;
  if (method_map_str.empty()) {
    return method_map;
  }

  TDF_BASE_DLOG(INFO) << "initMethodMap origin string" << method_map_str.c_str();

  bool is_name = true;
  std::string method_name;
  std::string method_sig;

  for (auto it = method_map_str.begin(); it != method_map_str.end(); it += 1) {
    if (is_name) {
      for (; it != method_map_str.end(); it += 1) {
        if (*it == '=') {
          is_name = false;
          break;
        }

        if (*it == '{' || *it == ' ') {
          continue;
        }

        method_name += *it;
      }
    } else {
      for (; it != method_map_str.end(); it += 1) {
        if (*it == ',' || *it == '}') {
          is_name = true;
          MethodInfo method_info;
          method_info.signature_ = method_sig;
          method_map[method_name] = method_info;
          TDF_BASE_DLOG(INFO) << "initMethodMap " << method_name.c_str() << "=" <<
                              method_sig.c_str();
          method_name.clear();
          method_sig.clear();
          break;
        }

        method_sig += *it;
      }
    }
  }

  return method_map;
}

std::vector<std::string> ConvertUtils::GetMethodArgTypesFromSignature(
    const std::string &method_signature) {
  std::vector<std::string> method_args;

  for (auto it = method_signature.begin(); it != method_signature.end();
       it += 1) {
    if (*it == '(') {
      continue;
    }

    if (*it == ')') {
      break;
    }

    std::string type;

    if (*it == '[') {
      type += *it;
      it += 1;
    }

    if (*it == 'L') {
      for (; it != method_signature.end(); it += 1) {
        type += *it;

        if (*it == ';') {
          break;
        }
      }
    } else {
      type += *it;
    }

    method_args.push_back(type);
  }

  return method_args;
}

void ConvertUtils::ThrowException(const std::shared_ptr<Ctx> &ctx,
                                  const std::string &info) {
  std::shared_ptr<V8Ctx> v8_ctx = std::static_pointer_cast<V8Ctx>(ctx);
  v8::HandleScope handle_scope(v8_ctx->isolate_);
  v8::Local<v8::Context> context =
      v8_ctx->context_persistent_.Get(v8_ctx->isolate_);
  v8::Context::Scope context_scope(context);

  TDF_BASE_LOG(ERROR) << info.c_str();
  v8_ctx->isolate_->ThrowException(
      v8::String::NewFromUtf8(v8_ctx->isolate_, info.c_str()).ToLocalChecked());
}

std::shared_ptr<CtxValue> ConvertUtils::ToHostObject(TurboEnv &turbo_env,
                                                     jobject &j_obj,
                                                     std::string name) {
  if (!j_obj) {
    return turbo_env.context_->CreateNull();
  }
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  std::shared_ptr<JavaRef> ret = std::make_shared<JavaRef>(env, j_obj);
  std::shared_ptr<JavaTurboModule> host_obj =
      std::make_shared<JavaTurboModule>(name, ret);
  return turbo_env.CreateObject(host_obj);
}

std::tuple<bool, std::string, std::shared_ptr<CtxValue>> ConvertUtils::ConvertMethodResultToJSValue(
    TurboEnv &turbo_env,
    const jobject &obj,
    const MethodInfo &method_info,
    const jvalue *args) {
  std::shared_ptr<Ctx> ctx = turbo_env.context_;
  std::shared_ptr<CtxValue> ret = ctx->CreateUndefined();
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  std::string return_type = method_info.signature_.substr(
      method_info.signature_.find_last_of(')') + 1);
  if (klong == return_type) {
    jlong result = env->CallLongMethodA(obj, method_info.method_id_, args);
    ret = ctx->CreateNumber(result);
  } else if (kint == return_type) {
    jint result = env->CallIntMethodA(obj, method_info.method_id_, args);
    ret = ctx->CreateNumber(result);
  } else if (kfloat == return_type) {
    jfloat result = env->CallFloatMethodA(obj, method_info.method_id_, args);
    ret = ctx->CreateNumber(result);
  } else if (kdouble == return_type) {
    jdouble result = env->CallDoubleMethodA(obj, method_info.method_id_, args);
    ret = ctx->CreateNumber(result);
  } else if (kString == return_type) {
    auto result_str =
        (jstring) env->CallObjectMethodA(obj, method_info.method_id_, args);
    if (!result_str) {
      ret = ctx->CreateNull();
    } else {
      unicode_string_view str_view = JniUtils::ToStrView(env, result_str);
      env->DeleteLocalRef(result_str);
      ret = ctx->CreateString(str_view);
    }
  } else if (kboolean == return_type) {
    auto result =
        (jboolean) env->CallBooleanMethodA(obj, method_info.method_id_, args);
    ret = ctx->CreateBoolean(result);
  } else if (kvoid == return_type) {
    env->CallVoidMethodA(obj, method_info.method_id_, args);
  } else if (kHippyArray == return_type) {
    auto array = env->CallObjectMethodA(obj, method_info.method_id_, args);
    auto tuple = ToJsArray(turbo_env, array);
    if (!std::get<0>(tuple)) {
      return tuple;
    }
    ret = std::get<2>(tuple);
    env->DeleteLocalRef(array);
  } else if (kHippyMap == return_type) {
    auto map = env->CallObjectMethodA(obj, method_info.method_id_, args);
    auto tuple = ToJsMap(turbo_env, map);
    if (!std::get<0>(tuple)) {
      return tuple;
    }
    ret = std::get<2>(tuple);
    env->DeleteLocalRef(map);
  } else {
    auto ret_obj = env->CallObjectMethodA(obj, method_info.method_id_, args);
    ret = ToHostObject(turbo_env, ret_obj, method_info.signature_);
    env->DeleteLocalRef(ret_obj);
  }
  return std::make_tuple(true, "", ret);
}

std::tuple<bool,
           std::string,
           std::shared_ptr<CtxValue>> ConvertUtils::ToJsValueInArray(TurboEnv &turbo_env,
                                                                     jobject array,
                                                                     int index) {
  std::shared_ptr<Ctx> ctx = turbo_env.context_;
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  std::shared_ptr<CtxValue> result = ctx->CreateNull();
  auto sig = (jstring) env->CallObjectMethod(array, hippy_array_get_sig, index);
  if (!sig) {
    return std::make_tuple(true, "", result);
  }

  unicode_string_view str_view = JniUtils::ToStrView(env, sig);
  std::string signature = StringViewUtils::ToU8StdStr(str_view);
  env->DeleteLocalRef(sig);
  TDF_BASE_DLOG(INFO) << "toJsValueInArray " << signature.c_str();

  if (kUnSupportedType == signature) {
    return std::make_tuple(false, "toJsValueInArray error",
                           static_cast<std::shared_ptr<CtxValue>>(nullptr));
  }

  auto obj = env->CallObjectMethod(array, hippy_array_get, index);

  if (IsNumberObject(signature)) {
    jdouble d = env->CallDoubleMethod(reinterpret_cast<jclass>(obj), double_value);
    result = ctx->CreateNumber(d);
  } else if (kString == signature) {
    unicode_string_view obj_str_view = JniUtils::ToStrView(env, reinterpret_cast<jstring>(obj));
    result = ctx->CreateString(obj_str_view);
  } else if (kBoolean == signature) {
    jboolean b = env->CallBooleanMethod(reinterpret_cast<jclass>(obj), boolean_value);
    result = ctx->CreateBoolean(b);
  } else if (kHippyArray == signature) {
    auto tuple = ToJsArray(turbo_env, obj);
    if (!std::get<0>(tuple)) {
      return tuple;
    }
    result = std::get<2>(tuple);
  } else if (kHippyMap == signature) {
    auto tuple = ToJsMap(turbo_env, obj);
    if (!std::get<0>(tuple)) {
      return tuple;
    }
    result = std::get<2>(tuple);
  } else if (!obj) {
    result = turbo_env.context_->CreateNull();
  } else {
    return std::make_tuple(false, "UnSupported Type in HippyArray or HippyMap",
                           static_cast<std::shared_ptr<CtxValue>>(nullptr));
  }

  env->DeleteLocalRef(obj);
  return std::make_tuple(true, "", result);
}

std::tuple<bool, std::string, std::shared_ptr<CtxValue>>
ConvertUtils::ToJsArray(TurboEnv &turbo_env, jobject array) {
  std::shared_ptr<Ctx> ctx = turbo_env.context_;
  if (!array) {
    return std::make_tuple(true, "", ctx->CreateNull());
  }
  std::shared_ptr<V8Ctx> v8_ctx = std::static_pointer_cast<V8Ctx>(ctx);
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  int size = env->CallIntMethod(array, hippy_array_size);

  if (size <= 0) {
    return std::make_tuple(true, "", ctx->CreateNull());
  }

  std::shared_ptr<CtxValue> value[size];
  for (int i = 0; i < size; i++) {
    auto value_tuple = ToJsValueInArray(turbo_env, array, i);
    if (!std::get<0>(value_tuple)) {
      return value_tuple;
    }
    value[i] = std::get<2>(value_tuple);
  }
  return std::make_tuple(true, "", ctx->CreateArray(size, value));
}

std::tuple<bool, std::string, std::shared_ptr<CtxValue>> ConvertUtils::ToJsMap(TurboEnv &turbo_env,
                                                                               jobject map) {
  std::shared_ptr<Ctx> ctx = turbo_env.context_;
  if (!map) {
    return std::make_tuple(true, "", ctx->CreateNull());
  }
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();

  jobject array = env->CallObjectMethod(map, to_hippy_array);
  if (!array) {
    return std::make_tuple(true, "", ctx->CreateNull());
  }

  int size = env->CallIntMethod(array, hippy_array_size);
  if (size <= 0) {
    return std::make_tuple(true, "", ctx->CreateNull());
  }

  std::shared_ptr<V8Ctx> v8_ctx = std::static_pointer_cast<V8Ctx>(ctx);
  std::shared_ptr<CtxValue> value[size];
  for (int i = 0; i < size; i++) {
    auto value_tuple = ToJsValueInArray(turbo_env, array, i);
    if (!std::get<0>(value_tuple)) {
      return value_tuple;
    }
    value[i] = std::get<2>(value_tuple);
  }
  return std::make_tuple(true, "", v8_ctx->CreateMap(size, value));
}

bool ConvertUtils::Init() {
  TDF_BASE_DLOG(INFO) << "enter init";

  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  jclass hippy_array_clazz_local =
      env->FindClass("com/tencent/mtt/hippy/common/HippyArray");
  hippy_array_clazz = (jclass) env->NewGlobalRef(hippy_array_clazz_local);
  hippy_array_constructor =
      env->GetMethodID(hippy_array_clazz, "<init>", "()V");
  hippy_array_push_object = env->GetMethodID(hippy_array_clazz, "pushObject",
                                             "(Ljava/lang/Object;)V");
  hippy_array_size = env->GetMethodID(hippy_array_clazz, "size", "()I");
  hippy_array_get =
      env->GetMethodID(hippy_array_clazz, "get", "(I)Ljava/lang/Object;");
  hippy_array_get_sig = env->GetMethodID(hippy_array_clazz, "getSignature",
                                         "(I)Ljava/lang/String;");
  env->DeleteLocalRef(hippy_array_clazz_local);

  jclass hippy_map_clazz_local =
      env->FindClass("com/tencent/mtt/hippy/common/HippyMap");
  hippy_map_clazz = (jclass) env->NewGlobalRef(hippy_map_clazz_local);
  hippy_map_constructor = env->GetMethodID(hippy_map_clazz, "<init>", "()V");
  hippy_map_push_object = env->GetMethodID(
      hippy_map_clazz, "pushObject", "(Ljava/lang/String;Ljava/lang/Object;)V");
  to_hippy_array =
      env->GetMethodID(hippy_map_clazz, "toHippyArray",
                       "()Lcom/tencent/mtt/hippy/common/HippyArray;");
  env->DeleteLocalRef(hippy_map_clazz_local);

  jclass integer_clazz_local = env->FindClass("java/lang/Integer");
  integer_clazz = (jclass) env->NewGlobalRef(integer_clazz_local);
  integer_constructor = env->GetMethodID(integer_clazz, "<init>", "(I)V");
  env->DeleteLocalRef(integer_clazz_local);

  jclass double_clazz_local = env->FindClass("java/lang/Double");
  double_clazz = (jclass) env->NewGlobalRef(double_clazz_local);
  double_constructor = env->GetMethodID(double_clazz, "<init>", "(D)V");
  double_value = env->GetMethodID(double_clazz, "doubleValue", "()D");
  env->DeleteLocalRef(double_clazz_local);

  jclass float_clazz_local = env->FindClass("java/lang/Float");
  float_clazz = (jclass) env->NewGlobalRef(float_clazz_local);
  float_constructor = env->GetMethodID(float_clazz, "<init>", "(F)V");
  env->DeleteLocalRef(float_clazz_local);

  jclass long_clazz_local = env->FindClass("java/lang/Long");
  long_clazz = (jclass) env->NewGlobalRef(long_clazz_local);
  long_constructor = env->GetMethodID(long_clazz, "<init>", "(J)V");
  env->DeleteLocalRef(long_clazz_local);

  jclass boolean_clazz_local = env->FindClass("java/lang/Boolean");
  boolean_clazz = (jclass) (env->NewGlobalRef(boolean_clazz_local));
  boolean_constructor = env->GetMethodID(boolean_clazz, "<init>", "(Z)V");
  boolean_value = env->GetMethodID(boolean_clazz, "booleanValue", "()Z");
  env->DeleteLocalRef(boolean_clazz_local);

  jclass promise_clazz_local =
      env->FindClass("com/tencent/mtt/hippy/modules/PromiseImpl");
  promise_clazz = (jclass) (env->NewGlobalRef(promise_clazz_local));
  promise_constructor =
      env->GetMethodID(promise_clazz, "<init>",
                       "(Lcom/tencent/mtt/hippy/HippyEngineContext;Ljava/lang/"
                       "String;Ljava/lang/String;Ljava/lang/String;)V");
  env->DeleteLocalRef(promise_clazz_local);
  return true;
}

bool ConvertUtils::Destroy() {
  TDF_BASE_DLOG(INFO) << "enter destroy";
  hippy_array_constructor = nullptr;
  hippy_array_push_object = nullptr;
  hippy_array_get_sig = nullptr;
  hippy_array_get = nullptr;
  hippy_array_size = nullptr;

  hippy_map_push_object = nullptr;
  to_hippy_array = nullptr;

  integer_constructor = nullptr;
  double_constructor = nullptr;
  double_value = nullptr;
  float_constructor = nullptr;
  long_constructor = nullptr;
  boolean_constructor = nullptr;
  boolean_value = nullptr;

  promise_constructor = nullptr;

  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  env->DeleteGlobalRef(hippy_array_clazz);
  env->DeleteGlobalRef(hippy_map_clazz);
  env->DeleteGlobalRef(integer_clazz);
  env->DeleteGlobalRef(double_clazz);
  env->DeleteGlobalRef(float_clazz);
  env->DeleteGlobalRef(long_clazz);
  env->DeleteGlobalRef(boolean_clazz);
  env->DeleteGlobalRef(promise_clazz);
  return true;
}
