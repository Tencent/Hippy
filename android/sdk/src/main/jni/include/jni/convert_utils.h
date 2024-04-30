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

#include <jni.h>

#include "core/core.h"
#include "scoped_java_ref.h"

struct JNIArgs {
  JNIArgs(size_t count) : args_(count) {}

  std::vector<jvalue> args_;
  std::vector<std::shared_ptr<JavaRef>> global_refs_;
};

template<typename T>
std::string ToString(T v) {
  std::ostringstream stream;
  stream << v;
  return stream.str();
}

struct MethodInfo {
  std::string signature_;
  jmethodID method_id_ = nullptr;
};

class ConvertUtils {
 public:
  using Ctx = hippy::napi::Ctx;
  using CtxValue = hippy::napi::CtxValue;

  static bool Init();

  static bool Destroy();

  static std::vector<std::string> GetMethodArgTypesFromSignature(
      const std::string &method_signature);

  static std::tuple<bool, std::string, std::shared_ptr<JNIArgs>> ConvertJSIArgsToJNIArgs(
      const std::shared_ptr<Ctx>& ctx,
      const std::string &module_name,
      const std::string &method_name,
      const std::vector<std::string> &method_arg_types,
      const std::vector<std::shared_ptr<CtxValue>> &arg_values);

  static std::tuple<bool, std::string, std::shared_ptr<CtxValue>> ConvertMethodResultToJSValue(
      const std::shared_ptr<Ctx>& ctx,
      const std::shared_ptr<JavaRef> &obj,
      const MethodInfo &method_info,
      const jvalue *args,
      const std::shared_ptr<Scope>& scope);

  static std::tuple<bool, std::string, jobject> ToJObject(const std::shared_ptr<Ctx>& ctx,
                                                          const std::shared_ptr<CtxValue> &value);

  static std::tuple<bool, std::string, jobject> ToHippyMap(
      const std::shared_ptr<Ctx>& ctx,
      const std::shared_ptr<CtxValue> &value);

  static std::tuple<bool, std::string, jobject> ToHippyArray(
      const std::shared_ptr<Ctx>& ctx,
      const std::shared_ptr<CtxValue> &value);

  static std::tuple<bool, std::string, std::shared_ptr<CtxValue>> ToJsValueInArray(
      const std::shared_ptr<Ctx>& ctx,
      jobject array,
      int index);

  static std::tuple<bool, std::string, std::shared_ptr<CtxValue>> ToJsArray(
      const std::shared_ptr<Ctx>& ctx,
      jobject array);

  static std::tuple<bool, std::string, std::shared_ptr<CtxValue>> ToJsMap(
      const std::shared_ptr<Ctx>& ctx,
      jobject map);

  static std::tuple<bool, std::string, bool> HandleBasicType(
      const std::shared_ptr<Ctx>& ctx,
      const std::string &type,
      jvalue &j_args,
      const std::shared_ptr<CtxValue> &value);

  static std::tuple<bool, std::string, bool> HandleObjectType(
      const std::shared_ptr<Ctx>& ctx,
      const std::string &module_name,
      const std::string &method_name,
      const std::string &type,
      jvalue &j_args,
      const std::shared_ptr<CtxValue> &value,
      std::vector<std::shared_ptr<JavaRef>> &global_refs);

  static std::unordered_map<std::string, MethodInfo> GetMethodMap(
      const std::string &method_map_str);

  static std::shared_ptr<CtxValue> ToHostObject(
      const std::shared_ptr<Ctx>& ctx,
      jobject &j_obj,
      std::string name,
      std::shared_ptr<Scope> scope);
};

static jclass hippy_array_clazz;
static jmethodID hippy_array_constructor;
static jmethodID hippy_array_push_object;
// get
static jmethodID hippy_array_size;
static jmethodID hippy_array_get_sig;
static jmethodID hippy_array_get;

static jclass hippy_map_clazz;
static jmethodID hippy_map_constructor;
static jmethodID hippy_map_push_object;
static jmethodID to_hippy_array;

static jclass integer_clazz;
static jclass double_clazz;
static jclass float_clazz;
static jclass long_clazz;
static jclass boolean_clazz;
static jmethodID integer_constructor;
static jmethodID int_value;
static jmethodID double_constructor;
static jmethodID double_value;
static jmethodID float_constructor;
static jmethodID float_value;
static jmethodID long_constructor;
static jmethodID long_value;
static jmethodID boolean_constructor;
static jmethodID boolean_value;

static jclass promise_clazz;
static jmethodID promise_constructor;

constexpr char kInt[] = "I";
constexpr char kDouble[] = "D";
constexpr char kFloat[] = "F";
constexpr char kLong[] = "J";
constexpr char kBoolean[] = "Z";
constexpr char kVoid[] = "V";
constexpr char kIntegerObject[] = "Ljava/lang/Integer;";
constexpr char kDoubleObject[] = "Ljava/lang/Double;";
constexpr char kFloatObject[] = "Ljava/lang/Float;";
constexpr char kLongObject[] = "Ljava/lang/Long;";
constexpr char kBooleanObject[] = "Ljava/lang/Boolean;";
constexpr char kString[] = "Ljava/lang/String;";
constexpr char kHippyArray[] = "Lcom/tencent/mtt/hippy/common/HippyArray;";
constexpr char kHippyMap[] = "Lcom/tencent/mtt/hippy/common/HippyMap;";
constexpr char kPromise[] = "Lcom/tencent/mtt/hippy/modules/Promise;";
constexpr char kUnSupportedType[] = "Lcom/invalid;";
