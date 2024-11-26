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

#include "jni/jni_env.h"
#include "jni/jni_utils.h"
#include "jni/java_turbo_module.h"

using namespace hippy::napi;
using unicode_string_view = tdf::base::unicode_string_view;
using StringViewUtils = hippy::base::StringViewUtils;

bool IsBasicNumberType(const std::string &type) {
  return type == kInt || type == kDouble || type == kFloat || type == kLong;
}

bool IsNumberObject(const std::string &type) {
  return type == kIntegerObject || type == kDoubleObject || type == kFloatObject || type == kLongObject;
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
    const std::shared_ptr<Ctx>& ctx,
    const std::string &module_name,
    const std::string &method_name,
    const std::vector<std::string> &method_arg_types,
    const std::vector<std::shared_ptr<CtxValue>> &arg_values) {
  std::shared_ptr<V8Ctx> context = std::static_pointer_cast<V8Ctx>(ctx);

  auto actual_arg_count = arg_values.size();
  std::shared_ptr<JNIArgs> jni_args = std::make_shared<JNIArgs>(actual_arg_count);
  auto &global_refs = jni_args->global_refs_;

  for (size_t i = 0; i < actual_arg_count; i++) {
    std::string type = method_arg_types.at(i);

    jvalue *j_args = &jni_args->args_[i];
    std::shared_ptr<CtxValue> value = arg_values.at(i);

    // basic type
    auto base_tuple = HandleBasicType(ctx, type, *j_args, value);
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
    auto obj_tuple = HandleObjectType(ctx, module_name, method_name, type, *j_args,
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

std::tuple<bool, std::string, bool> ConvertUtils::HandleBasicType(const std::shared_ptr<Ctx>& ctx,
                                                                  const std::string &type,
                                                                  jvalue &j_args,
                                                                  const std::shared_ptr<CtxValue> &value) {
  auto context = std::static_pointer_cast<V8Ctx>(ctx);

  // number
  if (IsBasicNumberType(type)) {
    if (type == kInt) {
      int32_t num;
      if (!context->GetValueNumber(value, &num)) {
        return std::make_tuple(false, "value must be int", false);
      }

      j_args.i = num;
    } else {
      double num;
      if (!context->GetValueNumber(value, &num)) {
        return std::make_tuple(false, "value must be long/float/double", false);
      }

      if (type == kDouble) {  // double
        j_args.d = num;
      } else if (type == kFloat) {  // float
        j_args.f = static_cast<jfloat>(num);
      } else if (type == kLong) {  // long
        if (!hippy::base::numeric_cast<double, jlong>(num, j_args.j)) {
          return std::make_tuple(false, "value out of jlong boundary", false);
        }
      }
    }

    return std::make_tuple(true, "", true);
  }

  // boolean
  if (type == "Z") {
    bool b;
    if (!context->GetValueBoolean(value, &b)) {
      return std::make_tuple(false, "value must be boolean", false);
    }

    j_args.z = b;
    return std::make_tuple(true, "", true);
  }

  return std::make_tuple(true, "", false);
}

std::tuple<bool, std::string, bool>
ConvertUtils::HandleObjectType(const std::shared_ptr<Ctx>& ctx,
                               const std::string &module_name,
                               const std::string &method_name,
                               const std::string &type,
                               jvalue &j_args,
                               const std::shared_ptr<CtxValue> &value,
                               std::vector<std::shared_ptr<JavaRef>> &global_refs) {
  auto v8_ctx = std::static_pointer_cast<V8Ctx>(ctx);

  JNIEnv *j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();

  // Promise
  if (type == kPromise) {
    unicode_string_view str_view;
    std::string str;
    if (v8_ctx->GetValueString(value, &str_view)) {
      str = StringViewUtils::ToU8StdStr(str_view);
    } else {
      return std::make_tuple(false, "value must be string", false);
    }

    TDF_BASE_DLOG(INFO) << "Promise callId " << str.c_str();
    jstring module_name_str = j_env->NewStringUTF(module_name.c_str());
    jstring method_name_str = j_env->NewStringUTF(method_name.c_str());
    jstring call_id_str = j_env->NewStringUTF(str.c_str());
    jobject j_obj = j_env->NewObject(promise_clazz, promise_constructor, static_cast<jobject>(nullptr),
                                   module_name_str, method_name_str, call_id_str);
    j_env->DeleteLocalRef(module_name_str);
    j_env->DeleteLocalRef(method_name_str);
    j_env->DeleteLocalRef(call_id_str);
    auto ref = std::make_shared<JavaRef>(j_env, j_obj);
    j_env->DeleteLocalRef(j_obj);
    global_refs.push_back(ref);
    j_args.l = ref->GetObj();
    return std::make_tuple(true, "", true);
  }

  // HippyArray
  if (type == kHippyArray) {
    if (!ctx->IsArray(value)) {
      return std::make_tuple(false, "value must be array", false);
    }
    auto to_array_tuple = ToHippyArray(ctx, value);
    if (!std::get<0>(to_array_tuple)) {
      return std::make_tuple(false, std::get<1>(to_array_tuple), false);
    }
    auto j_obj = std::get<2>(to_array_tuple);
    auto ref = std::make_shared<JavaRef>(j_env, j_obj);
    j_env->DeleteLocalRef(j_obj);
    global_refs.push_back(ref);
    j_args.l = ref->GetObj();
    return std::make_tuple(true, "", true);
  }

  // HippyMap
  if (type == kHippyMap) {
    if (!ctx->IsMap(value)) {
      return std::make_tuple(false, "value must be map", false);
    }
    auto to_map_tuple = ToHippyMap(ctx, value);
    if (!std::get<0>(to_map_tuple)) {
      return std::make_tuple(false, std::get<1>(to_map_tuple), false);
    }
    auto j_obj = std::get<2>(to_map_tuple);
    auto ref = std::make_shared<JavaRef>(j_env, j_obj);
    j_env->DeleteLocalRef(j_obj);
    global_refs.push_back(ref);
    j_args.l = ref->GetObj();
    return std::make_tuple(true, "", true);
  }

  // Boolean
  if (type == kBooleanObject) {
    bool b;
    if (!ctx->GetValueBoolean(value, &b)) {
      return std::make_tuple(false, "value must be boolean", false);
    }
    auto j_obj = j_env->NewObject(boolean_clazz, boolean_constructor, b);
    auto ref = std::make_shared<JavaRef>(j_env, j_obj);
    j_env->DeleteLocalRef(j_obj);
    global_refs.push_back(ref);
    j_args.l = ref->GetObj();
    return std::make_tuple(true, "", true);
  }

  // String
  if (type == kString) {
    unicode_string_view str_view;
    std::string str;
    if (ctx->GetValueString(value, &str_view)) {
      str = StringViewUtils::ToU8StdStr(str_view);
    } else {
      return std::make_tuple(false, "value must be string", false);
    }
    auto j_obj = j_env->NewStringUTF(str.c_str());
    auto ref = std::make_shared<JavaRef>(j_env, j_obj);
    j_env->DeleteLocalRef(j_obj);
    global_refs.push_back(ref);
    j_args.l = ref->GetObj();
    return std::make_tuple(true, "", true);
  }

  // Number Object
  if (IsNumberObject(type)) {
    if (type == kIntegerObject) {
      int32_t num;
      if (!ctx->GetValueNumber(value, &num)) {
        return std::make_tuple(true, "value must be int", false);
      }
      auto j_obj = j_env->NewObject(
          integer_clazz, integer_constructor, num);
      auto ref = std::make_shared<JavaRef>(j_env, j_obj);
      j_env->DeleteLocalRef(j_obj);
      global_refs.push_back(ref);
      j_args.l = ref->GetObj();
    } else {
      double num;
      if (!ctx->GetValueNumber(value, &num)) {
        return std::make_tuple(true, "value must be long/float/double", false);
      }

      if (type == kDoubleObject) {
        auto j_obj = j_env->NewObject(
            double_clazz, double_constructor, num);
        auto ref = std::make_shared<JavaRef>(j_env, j_obj);
        j_env->DeleteLocalRef(j_obj);
        global_refs.push_back(ref);
        j_args.l = ref->GetObj();
      } else if (type == kFloatObject) {
        auto j_obj = j_env->NewObject(
            float_clazz, float_constructor, static_cast<float>(num));
        auto ref = std::make_shared<JavaRef>(j_env, j_obj);
        j_env->DeleteLocalRef(j_obj);
        global_refs.push_back(ref);
        j_args.l = ref->GetObj();
      } else if (type == kLongObject) {
        jlong jlong_value;
        if (!hippy::base::numeric_cast<double, jlong>(num, jlong_value)) {
          return std::make_tuple(true, "value out of jlong boundary", false);
        }
        auto j_obj = j_env->NewObject(
            long_clazz, long_constructor, jlong_value);
        auto ref = std::make_shared<JavaRef>(j_env, j_obj);
        j_env->DeleteLocalRef(j_obj);
        global_refs.push_back(ref);
        j_args.l = ref->GetObj();
      } else {
        return std::make_tuple(false, "", false);
      }
    }
    return std::make_tuple(true, "", true);
  }

  auto host_object = reinterpret_cast<JavaTurboModule*>(v8_ctx->GetExternal(value));
  if (host_object) {
    j_args.l = host_object->impl_->GetObj();
    return std::make_tuple(true, "", true);
  }
  return std::make_tuple(false, "", false);
}

std::tuple<bool, std::string, jobject> ConvertUtils::ToHippyMap(const std::shared_ptr<Ctx>& ctx,
                                                                const std::shared_ptr<CtxValue> &value) {
  std::shared_ptr<V8Ctx> v8_ctx = std::static_pointer_cast<V8Ctx>(ctx);

  JNIEnv *j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  jobject obj = j_env->NewObject(hippy_map_clazz, hippy_map_constructor);
  std::shared_ptr<CtxValue> array = v8_ctx->ConvertMapToArray(value);

  auto array_len = v8_ctx->GetArrayLength(array);
  for (uint32_t i = 0; i < array_len; i = i + 2) {
    // key
    std::shared_ptr<CtxValue> key = v8_ctx->CopyArrayElement(array, i);
    unicode_string_view str_view;
    std::string key_str;
    if (ctx->GetValueString(key, &str_view)) {
      key_str = StringViewUtils::ToU8StdStr(str_view);
    } else {
      return std::make_tuple(false, "key must be string in map", static_cast<jobject>(nullptr));
    }

    jobject key_j_obj = j_env->NewStringUTF(key_str.c_str());
    TDF_BASE_DLOG(INFO) << "key " << key_str.c_str();

    // value
    std::shared_ptr<CtxValue> item = v8_ctx->CopyArrayElement(array, i + 1);
    auto to_jobject_tuple = ToJObject(ctx, item);
    if (!std::get<0>(to_jobject_tuple)) {
      j_env->DeleteLocalRef(key_j_obj);
      return std::make_tuple(false, std::get<1>(to_jobject_tuple), static_cast<jobject>(nullptr));
    }
    jobject value_j_obj = std::get<2>(to_jobject_tuple);
    j_env->CallVoidMethod(obj, hippy_map_push_object, key_j_obj, value_j_obj);
    JNIEnvironment::ClearJEnvException(j_env);
    j_env->DeleteLocalRef(key_j_obj);
    j_env->DeleteLocalRef(value_j_obj);
  }
  return std::make_tuple(true, "", obj);
}

std::tuple<bool, std::string, jobject> ConvertUtils::ToHippyArray(const std::shared_ptr<Ctx>& ctx,
                                                                  const std::shared_ptr<CtxValue> &value) {
  std::shared_ptr<V8Ctx> v8_ctx = std::static_pointer_cast<V8Ctx>(ctx);
  JNIEnv *j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  jobject obj = j_env->NewObject(hippy_array_clazz, hippy_array_constructor);
  auto array_len = v8_ctx->GetArrayLength(value);
  for (uint32_t i = 0; i < array_len; i++) {
    std::shared_ptr<CtxValue> item = v8_ctx->CopyArrayElement(value, i);
    auto to_jobject_tuple = ToJObject(ctx, item);
    if (!std::get<0>(to_jobject_tuple)) {
      return to_jobject_tuple;
    }
    jobject j_obj = std::get<2>(to_jobject_tuple);
    j_env->CallVoidMethod(obj, hippy_array_push_object, j_obj);
    JNIEnvironment::ClearJEnvException(j_env);
    j_env->DeleteLocalRef(j_obj);
  }
  return std::make_tuple(true, "", obj);
}

std::tuple<bool, std::string, jobject> ConvertUtils::ToJObject(const std::shared_ptr<Ctx>& ctx,
                                                               const std::shared_ptr<CtxValue> &value) {
  double num;
  bool b;
  std::string str;
  jobject result;

  std::shared_ptr<V8Ctx> v8_ctx = std::static_pointer_cast<V8Ctx>(ctx);
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  unicode_string_view str_view;

  if (ctx->GetValueNumber(value, &num)) {
    result = env->NewObject(double_clazz, double_constructor, num);
  } else if (ctx->GetValueString(value, &str_view)) {
    str = StringViewUtils::ToU8StdStr(str_view);
    result = env->NewStringUTF(str.c_str());
  } else if (ctx->GetValueBoolean(value, &b)) {
    result = env->NewObject(boolean_clazz, boolean_constructor, b);
  } else if (ctx->IsArray(value)) {
    auto array_tuple = ToHippyArray(ctx, value);
    if (!std::get<0>(array_tuple)) {
      return array_tuple;
    }
    result = std::get<2>(array_tuple);
  } else if (ctx->IsMap(value)) {
    auto map_tuple = ToHippyMap(ctx, value);
    if (!std::get<0>(map_tuple)) {
      return map_tuple;
    }
    result = std::get<2>(map_tuple);
  } else if (ctx->IsNullOrUndefined(value)) {
    result = nullptr;
  } else {
    return std::make_tuple(false, "unsupported type in HippyArray or HippyMap",
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

std::shared_ptr<CtxValue> ConvertUtils::ToHostObject(const std::shared_ptr<Ctx>& ctx,
                                                     jobject &j_obj,
                                                     std::string name,
                                                     std::shared_ptr<Scope> scope) {
  if (!j_obj) {
    return ctx->CreateNull();
  }
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  std::shared_ptr<JavaRef> ret = std::make_shared<JavaRef>(env, j_obj);
  auto host_obj = std::make_shared<JavaTurboModule>(name, ret, ctx);
  auto instance = ctx->NewInstance(host_obj->constructor, 0, nullptr, host_obj.get());
  scope->SetTurboInstance(name, instance);
  scope->SetTurboHostObject(name, host_obj);
  return instance;
}

std::tuple<bool, std::string, std::shared_ptr<CtxValue>> ConvertUtils::ConvertMethodResultToJSValue(
    const std::shared_ptr<Ctx>& ctx,
    const std::shared_ptr<JavaRef>& obj,
    const MethodInfo& method_info,
    const jvalue* args,
    const std::shared_ptr<Scope>& scope) {
  auto ret = ctx->CreateUndefined();
  JNIEnv *j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  std::string return_type = method_info.signature_.substr(
      method_info.signature_.find_last_of(')') + 1);
  if (kLong == return_type) {
    auto result = j_env->CallLongMethodA(obj->GetObj(), method_info.method_id_, args);
    ret = ctx->CreateNumber(hippy::base::checked_numeric_cast<jlong, double>(result));
  } else if (kInt == return_type) {
    jint result = j_env->CallIntMethodA(obj->GetObj(), method_info.method_id_, args);
    ret = ctx->CreateNumber(result);
  } else if (kFloat == return_type) {
    jfloat result = j_env->CallFloatMethodA(obj->GetObj(), method_info.method_id_, args);
    ret = ctx->CreateNumber(result);
  } else if (kDouble == return_type) {
    jdouble result = j_env->CallDoubleMethodA(obj->GetObj(), method_info.method_id_, args);
    ret = ctx->CreateNumber(result);
  } else if (kString == return_type) {
    auto result_str =
        (jstring) j_env->CallObjectMethodA(obj->GetObj(), method_info.method_id_, args);
    JNIEnvironment::ClearJEnvException(j_env);
    if (!result_str) {
      ret = ctx->CreateNull();
    } else {
      unicode_string_view str_view = JniUtils::ToStrView(j_env, result_str);
      j_env->DeleteLocalRef(result_str);
      ret = ctx->CreateString(str_view);
    }
  } else if (kBoolean == return_type) {
    auto result =
        (jboolean) j_env->CallBooleanMethodA(obj->GetObj(), method_info.method_id_, args);
    JNIEnvironment::ClearJEnvException(j_env);
    ret = ctx->CreateBoolean(result);
  } else if (kVoid == return_type) {
    j_env->CallVoidMethodA(obj->GetObj(), method_info.method_id_, args);
    JNIEnvironment::ClearJEnvException(j_env);
  } else if (kHippyArray == return_type) {
    auto array = j_env->CallObjectMethodA(obj->GetObj(), method_info.method_id_, args);
    JNIEnvironment::ClearJEnvException(j_env);
    auto tuple = ToJsArray(ctx, array);
    if (!std::get<0>(tuple)) {
      return tuple;
    }
    ret = std::get<2>(tuple);
    j_env->DeleteLocalRef(array);
  } else if (kHippyMap == return_type) {
    auto map = j_env->CallObjectMethodA(obj->GetObj(), method_info.method_id_, args);
    JNIEnvironment::ClearJEnvException(j_env);
    auto tuple = ToJsMap(ctx, map);
    if (!std::get<0>(tuple)) {
      return tuple;
    }
    ret = std::get<2>(tuple);
    j_env->DeleteLocalRef(map);
  } else {
    auto ret_obj = j_env->CallObjectMethodA(obj->GetObj(), method_info.method_id_, args);
    JNIEnvironment::ClearJEnvException(j_env);
    ret = ToHostObject(ctx, ret_obj, method_info.signature_, scope);
    j_env->DeleteLocalRef(ret_obj);
  }
  return std::make_tuple(true, "", ret);
}

std::tuple<bool,
           std::string,
           std::shared_ptr<CtxValue>> ConvertUtils::ToJsValueInArray(const std::shared_ptr<Ctx>& ctx,
                                                                     jobject array,
                                                                     int index) {
  JNIEnv *j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  std::shared_ptr<CtxValue> result = ctx->CreateNull();
  auto sig = (jstring) j_env->CallObjectMethod(array, hippy_array_get_sig, index);
  if (!sig) {
    return std::make_tuple(true, "", result);
  }

  unicode_string_view str_view = JniUtils::ToStrView(j_env, sig);
  std::string signature = StringViewUtils::ToU8StdStr(str_view);
  j_env->DeleteLocalRef(sig);
  TDF_BASE_DLOG(INFO) << "toJsValueInArray " << signature.c_str();

  if (kUnSupportedType == signature) {
    return std::make_tuple(false, "toJsValueInArray error",
                           static_cast<std::shared_ptr<CtxValue>>(nullptr));
  }

  auto obj = j_env->CallObjectMethod(array, hippy_array_get, index);

  if (IsNumberObject(signature)) {
    jdouble d = 0;
    if (kIntegerObject == signature) {
      d = j_env->CallIntMethod(reinterpret_cast<jclass>(obj), int_value);
    } else if (kDoubleObject == signature) {
      d = j_env->CallDoubleMethod(reinterpret_cast<jclass>(obj), double_value);
    } else if (kFloatObject == signature) {
      d = j_env->CallFloatMethod(reinterpret_cast<jclass>(obj), float_value);
    } else if (kLongObject == signature) {
      d = static_cast<jdouble>(j_env->CallLongMethod(reinterpret_cast<jclass>(obj),
                                                   long_value));
    }
    result = ctx->CreateNumber(d);
  } else if (kString == signature) {
    unicode_string_view obj_str_view = JniUtils::ToStrView(j_env, reinterpret_cast<jstring>(obj));
    result = ctx->CreateString(obj_str_view);
  } else if (kBooleanObject == signature) {
    jboolean b = j_env->CallBooleanMethod(reinterpret_cast<jclass>(obj), boolean_value);
    result = ctx->CreateBoolean(b);
  } else if (kHippyArray == signature) {
    auto tuple = ToJsArray(ctx, obj);
    if (!std::get<0>(tuple)) {
      return tuple;
    }
    result = std::get<2>(tuple);
  } else if (kHippyMap == signature) {
    auto tuple = ToJsMap(ctx, obj);
    if (!std::get<0>(tuple)) {
      return tuple;
    }
    result = std::get<2>(tuple);
  } else if (!obj) {
    result = ctx->CreateNull();
  } else {
    j_env->DeleteLocalRef(obj);
    return std::make_tuple(false, "UnSupported Type in HippyArray or HippyMap",
                           static_cast<std::shared_ptr<CtxValue>>(nullptr));
  }

  j_env->DeleteLocalRef(obj);
  return std::make_tuple(true, "", result);
}

std::tuple<bool, std::string, std::shared_ptr<CtxValue>>
ConvertUtils::ToJsArray(const std::shared_ptr<Ctx>& ctx, jobject array) {
  if (!array) {
    return std::make_tuple(true, "", ctx->CreateNull());
  }
  std::shared_ptr<V8Ctx> v8_ctx = std::static_pointer_cast<V8Ctx>(ctx);
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  auto size = env->CallIntMethod(array, hippy_array_size);

  if (size <= 0) {
    return std::make_tuple(true, "", ctx->CreateNull());
  }

  std::shared_ptr<CtxValue> value[size];
  for (int i = 0; i < size; i++) {
    auto value_tuple = ToJsValueInArray(ctx, array, i);
    if (!std::get<0>(value_tuple)) {
      return value_tuple;
    }
    value[i] = std::get<2>(value_tuple);
  }
  return std::make_tuple(true, "", ctx->CreateArray(static_cast<size_t>(size), value));
}

std::tuple<bool, std::string, std::shared_ptr<CtxValue>> ConvertUtils::ToJsMap(const std::shared_ptr<Ctx>& ctx,
                                                                               jobject map) {
  if (!map) {
    return std::make_tuple(true, "", ctx->CreateNull());
  }
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();

  jobject array = env->CallObjectMethod(map, to_hippy_array);
  if (!array) {
    return std::make_tuple(true, "", ctx->CreateNull());
  }

  auto size = env->CallIntMethod(array, hippy_array_size);
  if (size <= 0) {
    return std::make_tuple(true, "", ctx->CreateNull());
  }

  std::shared_ptr<V8Ctx> v8_ctx = std::static_pointer_cast<V8Ctx>(ctx);
  std::shared_ptr<CtxValue> value[size];
  for (auto i = 0; i < size; i++) {
    auto value_tuple = ToJsValueInArray(ctx, array, i);
    if (!std::get<0>(value_tuple)) {
      return value_tuple;
    }
    value[i] = std::get<2>(value_tuple);
  }
  std::map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>> param;
  for (auto i = 0; i < size; i += 2) {
    param[value[i]] = value[i + 1];
  }
  env->DeleteLocalRef(array);
  return std::make_tuple(true, "", v8_ctx->CreateMap(param));
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
  int_value = env->GetMethodID(integer_clazz, "intValue", "()I");
  env->DeleteLocalRef(integer_clazz_local);

  jclass double_clazz_local = env->FindClass("java/lang/Double");
  double_clazz = (jclass) env->NewGlobalRef(double_clazz_local);
  double_constructor = env->GetMethodID(double_clazz, "<init>", "(D)V");
  double_value = env->GetMethodID(double_clazz, "doubleValue", "()D");
  env->DeleteLocalRef(double_clazz_local);

  jclass float_clazz_local = env->FindClass("java/lang/Float");
  float_clazz = (jclass) env->NewGlobalRef(float_clazz_local);
  float_constructor = env->GetMethodID(float_clazz, "<init>", "(F)V");
  float_value = env->GetMethodID(float_clazz, "floatValue", "()F");
  env->DeleteLocalRef(float_clazz_local);

  jclass long_clazz_local = env->FindClass("java/lang/Long");
  long_clazz = (jclass) env->NewGlobalRef(long_clazz_local);
  long_constructor = env->GetMethodID(long_clazz, "<init>", "(J)V");
  long_value = env->GetMethodID(long_clazz, "longValue", "()J");
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
  int_value = nullptr;
  double_constructor = nullptr;
  double_value = nullptr;
  float_constructor = nullptr;
  float_value = nullptr;
  long_constructor = nullptr;
  long_value = nullptr;
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
