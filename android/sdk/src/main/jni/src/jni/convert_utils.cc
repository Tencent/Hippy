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

void ThrowConvertTypeException(const int64_t &index, const std::string &info) {
  std::string exception_info = std::string("ConvertTypeException: ")
                                   .append("argument index = ")
                                   .append(ToString(index))
                                   .append(", ")
                                   .append(info);
  throw std::runtime_error(exception_info);
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
std::shared_ptr<JNIArgs> ConvertUtils::ConvertJSIArgsToJNIArgs(
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
    try {
      std::string type = method_arg_types.at(i);

      jvalue *j_args = &jni_args->args_[i];
      std::shared_ptr<CtxValue> value = arg_values.at(i);

      // basic type
      if (HandleBasicType(turbo_env, type, *j_args, value)) {
        continue;
      }

      // unSupport Object type
      if (kUnSupportedType == type) {
        throw std::runtime_error(
            std::string("Unsupported type: ").append(type).c_str());
      }

      // NullOrUndefined
      if (context->IsNullOrUndefined(value)) {
        j_args->l = nullptr;
        continue;
      }

      // Object
      HandleObjectType(turbo_env, module_name, method_name, type, *j_args,
                       value, global_refs);
    } catch (std::runtime_error &error) {
      ThrowConvertTypeException(i, error.what());
    }
  }

  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  if (JNIEnvironment::ClearJEnvException(env)) {
    throw std::runtime_error(
        "JNI Exception occurred when convertJSIArgsToJNIArgs");
  }

  return jni_args;
}

bool ConvertUtils::HandleBasicType(TurboEnv &turbo_env,
                                   const std::string &type,
                                   jvalue &j_args,
                                   const std::shared_ptr<CtxValue> &value) {
  std::shared_ptr<Ctx> ctx = turbo_env.context_;
  std::shared_ptr<V8Ctx> context = std::static_pointer_cast<V8Ctx>(ctx);

  // number
  if (IsBasicNumberType(type)) {
    double num;
    if (!context->GetValueNumber(value, &num)) {
      throw std::runtime_error("Must be int/long/float/double.");
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
    return true;
  }

  // boolean
  if (type == "Z") {
    bool b;
    if (!context->GetValueBoolean(value, &b)) {
      throw std::runtime_error("Must be boolean.");
    }

    j_args.z = b;
    return true;
  }

  return false;
}

bool ConvertUtils::HandleObjectType(TurboEnv &turbo_env,
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
      throw std::runtime_error("Must be String.");
    }

    TDF_BASE_DLOG(INFO) << "Promise callId %s", str.c_str();

    jstring module_name_str = env->NewStringUTF(module_name.c_str());
    jstring method_name_str = env->NewStringUTF(method_name.c_str());
    jstring call_id_str = env->NewStringUTF(str.c_str());
    jobject tmp = env->NewObject(promise_clazz, promise_constructor, static_cast<jobject>(nullptr),
                                 module_name_str, method_name_str, call_id_str);
    env->DeleteLocalRef(module_name_str);
    env->DeleteLocalRef(method_name_str);
    env->DeleteLocalRef(call_id_str);
    j_args.l = make_global(tmp);
    return true;
  }

  // HippyArray
  if (type == kHippyArray) {
    if (!context->IsArray(value)) {
      throw std::runtime_error("Must be Array.");
    }
    j_args.l = make_global(ToHippyArray(turbo_env, value));
    return true;
  }

  // HippyMap
  if (type == kHippyMap) {
    if (!context->IsMap(value)) {
      throw std::runtime_error("Must be Map.");
    }

    j_args.l = make_global(ToHippyMap(turbo_env, value));
    return true;
  }

  // Boolean
  if (type == kBoolean) {
    bool b;
    if (!context->GetValueBoolean(value, &b)) {
      throw std::runtime_error("Must be Boolean.");
    }
    j_args.l =
        make_global(env->NewObject(boolean_clazz, boolean_constructor, b));
    return true;
  }

  // String
  if (type == kString) {
    unicode_string_view str_view;
    std::string str;
    if (turbo_env.context_->GetValueString(value, &str_view)) {
      str = StringViewUtils::ToU8StdStr(str_view);
    } else {
      throw std::runtime_error("Must be String.");
    }

    j_args.l = make_global(env->NewStringUTF(str.c_str()));
    return true;
  }

  // Number Object
  if (IsNumberObject(type)) {
    double num;
    if (!context->GetValueNumber(value, &num)) {
      throw std::runtime_error("Integer/Double/Float/Long.");
    }

    if (type == kInteger) {  // Integer
      j_args.l = make_global(
          env->NewObject(integer_clazz, integer_constructor, (int)num));
    } else if (type == kDouble) {  // Double
      j_args.l =
          make_global(env->NewObject(double_clazz, double_constructor, num));
    } else if (type == kFloat) {  // Float
      j_args.l = make_global(
          env->NewObject(float_clazz, float_constructor, (float)num));
    } else if (type == kLong) {  // Long
      j_args.l = make_global(
          env->NewObject(long_clazz, long_constructor, (int64_t)num));
    } else {
      return false;
    }
    return true;
  }

  std::shared_ptr<HostObject> host_object = turbo_env.GetHostObject(value);
  if (host_object) {
    std::shared_ptr<JavaTurboModule> j_turbo_module =
        std::static_pointer_cast<JavaTurboModule>(host_object);
    j_args.l = j_turbo_module->impl_->GetObj();
    return true;
  }
  return false;
}

jobject ConvertUtils::ToHippyMap(TurboEnv &turbo_env,
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
      throw std::runtime_error("Key must be String in Map.");
    }

    jobject key_j_obj = env->NewStringUTF(key_str.c_str());
    TDF_BASE_DLOG(INFO) << "key %s", key_str.c_str();

    // value
    std::shared_ptr<CtxValue> item = context->CopyArrayElement(array, i + 1);
    jobject value_j_obj = ToJObject(turbo_env, item);
    env->CallVoidMethod(obj, hippy_map_push_object, key_j_obj, value_j_obj);

    env->DeleteLocalRef(key_j_obj);
    env->DeleteLocalRef(value_j_obj);
  }
  return obj;
}

jobject ConvertUtils::ToHippyArray(TurboEnv &turbo_env,
                                   const std::shared_ptr<CtxValue> &value) {
  std::shared_ptr<Ctx> ctx = turbo_env.context_;
  std::shared_ptr<V8Ctx> context = std::static_pointer_cast<V8Ctx>(ctx);
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  jobject obj = env->NewObject(hippy_array_clazz, hippy_array_constructor);
  int array_len = context->GetArrayLength(value);
  for (int i = 0; i < array_len; i++) {
    std::shared_ptr<CtxValue> item = context->CopyArrayElement(value, i);
    jobject j_obj = ToJObject(turbo_env, item);
    env->CallVoidMethod(obj, hippy_array_push_object, j_obj);
    env->DeleteLocalRef(j_obj);
  }
  return obj;
}

jobject ConvertUtils::ToJObject(TurboEnv &turbo_env,
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
    result = ToHippyArray(turbo_env, value);
  } else if (context->IsMap(value)) {
    result = ToHippyMap(turbo_env, value);
  } else if (context->IsNullOrUndefined(value)) {
    result = nullptr;
  } else {
    throw std::runtime_error("UnSupported Type in HippyArray or HippyMap.");
  }
  return result;
}

std::unordered_map<std::string, MethodInfo> ConvertUtils::GetMethodMap(
    const std::string &method_map_str) {
  std::unordered_map<std::string, MethodInfo> method_map;
  if (method_map_str.empty()) {
    return method_map;
  }

  TDF_BASE_DLOG(INFO) << "initMethodMap origin string %s",
      method_map_str.c_str();

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
          TDF_BASE_DLOG(INFO) << "initMethodMap %s=%s", method_name.c_str(),
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

std::shared_ptr<CtxValue> ConvertUtils::ConvertMethodResultToJSValue(
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
        (jstring)env->CallObjectMethodA(obj, method_info.method_id_, args);
    if (!result_str) {
      ret = ctx->CreateNull();
    } else {
      unicode_string_view str_view = JniUtils::ToStrView(env, result_str);
      env->DeleteLocalRef(result_str);
      ret = ctx->CreateString(str_view);
    }
  } else if (kboolean == return_type) {
    auto result =
        (jboolean)env->CallBooleanMethodA(obj, method_info.method_id_, args);
    ret = ctx->CreateBoolean(result);
  } else if (kvoid == return_type) {
    env->CallVoidMethodA(obj, method_info.method_id_, args);
  } else if (kHippyArray == return_type) {
    auto array = env->CallObjectMethodA(obj, method_info.method_id_, args);
    ret = ToJsArray(turbo_env, array);
    env->DeleteLocalRef(array);
  } else if (kHippyMap == return_type) {
    auto map = env->CallObjectMethodA(obj, method_info.method_id_, args);
    ret = ToJsMap(turbo_env, map);
    env->DeleteLocalRef(map);
  } else {
    auto ret_obj = env->CallObjectMethodA(obj, method_info.method_id_, args);
    ret = ToHostObject(turbo_env, ret_obj, method_info.signature_);
    env->DeleteLocalRef(ret_obj);
  }
  return ret;
}

std::shared_ptr<CtxValue> ConvertUtils::ToJsValueInArray(TurboEnv &turbo_env,
                                                         jobject array,
                                                         int index) {
  std::shared_ptr<Ctx> ctx = turbo_env.context_;
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  std::shared_ptr<CtxValue> result = ctx->CreateNull();
  auto sig = (jstring)env->CallObjectMethod(array, hippy_array_get_sig, index);
  if (!sig) {
    return result;
  }

  unicode_string_view str_view = JniUtils::ToStrView(env, sig);
  std::string signature = StringViewUtils::ToU8StdStr(str_view);
  env->DeleteLocalRef(sig);
  TDF_BASE_DLOG(INFO) << "toJsValueInArray %s", signature.c_str();

  if (kUnSupportedType == signature) {
    std::string info =
        std::string(kUnSupportedType).append(" when toJsValueInArray");
    throw std::runtime_error(info);
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
    result = ToJsArray(turbo_env, obj);
  } else if (kHippyMap == signature) {
    result = ToJsMap(turbo_env, obj);
  } else if (!obj) {
    result = turbo_env.context_->CreateNull();
  } else {
    throw std::runtime_error("UnSupported Type in HippyArray or HippyMap");
  }

  env->DeleteLocalRef(obj);
  return result;
}

std::shared_ptr<CtxValue> ConvertUtils::ToJsArray(TurboEnv &turbo_env,
                                                  jobject array) {
  std::shared_ptr<Ctx> ctx = turbo_env.context_;
  if (!array) {
    return ctx->CreateNull();
  }
  std::shared_ptr<V8Ctx> v8_ctx = std::static_pointer_cast<V8Ctx>(ctx);
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  int size = env->CallIntMethod(array, hippy_array_size);

  if (size <= 0) {
    return ctx->CreateNull();
  }

  std::shared_ptr<CtxValue> value[size];
  for (int i = 0; i < size; i++) {
    value[i] = ToJsValueInArray(turbo_env, array, i);
  }
  return ctx->CreateArray(size, value);
}

std::shared_ptr<CtxValue> ConvertUtils::ToJsMap(TurboEnv &turbo_env,
                                                jobject map) {
  std::shared_ptr<Ctx> ctx = turbo_env.context_;
  if (!map) {
    return ctx->CreateNull();
  }
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();

  jobject array = env->CallObjectMethod(map, to_hippy_array);
  if (!array) {
    return ctx->CreateNull();
  }

  int size = env->CallIntMethod(array, hippy_array_size);
  if (size <= 0) {
    return ctx->CreateNull();
  }

  std::shared_ptr<V8Ctx> v8_ctx = std::static_pointer_cast<V8Ctx>(ctx);
  std::shared_ptr<CtxValue> value[size];
  for (int i = 0; i < size; i++) {
    value[i] = ToJsValueInArray(turbo_env, array, i);
  }
  return v8_ctx->CreateMap(size, value);
}

bool ConvertUtils::Init() {
  TDF_BASE_DLOG(INFO) << "enter init";

  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  jclass hippy_array_clazz_local =
      env->FindClass("com/tencent/mtt/hippy/common/HippyArray");
  hippy_array_clazz = (jclass)env->NewGlobalRef(hippy_array_clazz_local);
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
  hippy_map_clazz = (jclass)env->NewGlobalRef(hippy_map_clazz_local);
  hippy_map_constructor = env->GetMethodID(hippy_map_clazz, "<init>", "()V");
  hippy_map_push_object = env->GetMethodID(
      hippy_map_clazz, "pushObject", "(Ljava/lang/String;Ljava/lang/Object;)V");
  to_hippy_array =
      env->GetMethodID(hippy_map_clazz, "toHippyArray",
                       "()Lcom/tencent/mtt/hippy/common/HippyArray;");
  env->DeleteLocalRef(hippy_map_clazz_local);

  jclass integer_clazz_local = env->FindClass("java/lang/Integer");
  integer_clazz = (jclass)env->NewGlobalRef(integer_clazz_local);
  integer_constructor = env->GetMethodID(integer_clazz, "<init>", "(I)V");
  env->DeleteLocalRef(integer_clazz_local);

  jclass double_clazz_local = env->FindClass("java/lang/Double");
  double_clazz = (jclass)env->NewGlobalRef(double_clazz_local);
  double_constructor = env->GetMethodID(double_clazz, "<init>", "(D)V");
  double_value = env->GetMethodID(double_clazz, "doubleValue", "()D");
  env->DeleteLocalRef(double_clazz_local);

  jclass float_clazz_local = env->FindClass("java/lang/Float");
  float_clazz = (jclass)env->NewGlobalRef(float_clazz_local);
  float_constructor = env->GetMethodID(float_clazz, "<init>", "(F)V");
  env->DeleteLocalRef(float_clazz_local);

  jclass long_clazz_local = env->FindClass("java/lang/Long");
  long_clazz = (jclass)env->NewGlobalRef(long_clazz_local);
  long_constructor = env->GetMethodID(long_clazz, "<init>", "(J)V");
  env->DeleteLocalRef(long_clazz_local);

  jclass boolean_clazz_local = env->FindClass("java/lang/Boolean");
  boolean_clazz = (jclass)(env->NewGlobalRef(boolean_clazz_local));
  boolean_constructor = env->GetMethodID(boolean_clazz, "<init>", "(Z)V");
  boolean_value = env->GetMethodID(boolean_clazz, "booleanValue", "()Z");
  env->DeleteLocalRef(boolean_clazz_local);

  jclass promise_clazz_local =
      env->FindClass("com/tencent/mtt/hippy/modules/PromiseImpl");
  promise_clazz = (jclass)(env->NewGlobalRef(promise_clazz_local));
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
