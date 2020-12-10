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

#include "core/napi/jsc/js-native-api-jsc.h"

#include <iostream>
#include <mutex>  // NOLINT(build/c++11)
#include <string>

#include "core/base/logging.h"
#include "core/engine-impl.h"
#include "core/napi/callback-info.h"
#include "core/napi/js-native-api.h"
#include "core/napi/jsc/js-native-jsc-helper.h"

namespace hippy {
namespace napi {

class ContextManager {
 public:
  ContextManager() = default;
  ~ContextManager() = default;

 public:
  static ContextManager* instance() {
    static std::once_flag flag;
    static ContextManager* _in;

    std::call_once(flag, [] { _in = new ContextManager(); });

    return _in;
  }

  napi_context__* get_context(JSContextRef ctx) {
    std::lock_guard<std::mutex> lock(m_mutex);

    size_t count = context_list.size();
    for (size_t i = 0; i < count; i++) {
      napi_context__* context = context_list[i];
      if (context->context_ == JSContextGetGlobalContext(ctx)) {
        return context;
      }
    }

    return nullptr;
  }

  JsCallback get_callback(napi_context context,
                          const std::string& className,
                          const std::string& functionName) {
    std::lock_guard<std::mutex> lock(m_mutex);

    for (const auto& cls : context->modules) {
      const std::string& class_name = cls.first;
      if (className.find(class_name) != std::string::npos) {
        for (const auto& fn : cls.second) {
          const std::string& function_name = fn.first;
          if (functionName.find(function_name) != std::string::npos) {
            return fn.second;
          }
        }
        return nullptr;
      }
    }
    return nullptr;
  }

  void add_context(napi_context__* context) {
    std::lock_guard<std::mutex> lock(m_mutex);

    context_list.push_back(context);
  }

  void remove_context(napi_context context) {
    std::lock_guard<std::mutex> lock(m_mutex);

    auto item =
        std::find(std::begin(context_list), std::end(context_list), context);
    if (item != context_list.end()) {
      context_list.erase(item);
    }
  }

 private:
  std::vector<napi_context__*> context_list;
  std::mutex m_mutex;
};

JSValueRef JS_Function_Callback(JSContextRef ctx,
                                JSObjectRef function,
                                JSObjectRef thisObject,
                                size_t argumentCount,
                                const JSValueRef arguments[],
                                JSValueRef* exception) {
  napi_context__* context = ContextManager::instance()->get_context(ctx);
  if (!context) {
    return JSValueMakeUndefined(ctx);
  }

  JSStringRef object_js_string = JSValueToStringCopy(ctx, thisObject, nullptr);
  std::string object_name = js_string_to_utf8(object_js_string);
  size_t pos = object_name.find_first_of("object");
  size_t n = strlen("object");
  object_name.replace(pos, n, "");

  JSStringRef function_js_string = JSValueToStringCopy(ctx, function, nullptr);
  std::string function_name = js_string_to_utf8(function_js_string);
  pos = function_name.find_first_of("function");
  n = strlen("function");
  function_name.replace(pos, n, "");

  JsCallback func = ContextManager::instance()->get_callback(
      context, object_name, function_name);
  if (!func) {
    return JSValueMakeUndefined(ctx);
  }

  std::shared_ptr<Environment> env = EngineImpl::instance()->GetEnvWithContext(context).lock();
  if (!env) {
      return JSValueMakeUndefined(ctx);
  }
  CallbackInfo info(env);
  for (size_t i = 0; i < argumentCount; i++) {
    info.AddValue(std::make_shared<napi_value__>(context, arguments[i]));
  }
  func(info);

  napi_value js_exception = info.GetExceptionValue()->Get();
  if (js_exception) {
    *exception = js_exception->value_;
    return JSValueMakeUndefined(ctx);
  }

  napi_value ret_value = info.GetReturnValue()->Get();
  if (ret_value == nullptr) {
    return JSValueMakeUndefined(ctx);
  }

  JSValueRef valueRef = ret_value->value_;
  return valueRef;
}

void napi_set_last_error(napi_context context, napi_status error) {
  HIPPY_DCHECK(context);

  context->error = error;
}

napi_status napi_get_last_error(napi_context context) {
  HIPPY_DCHECK(context);

  return context->error;
}

std::string napi_str_error(napi_context context, napi_status error) {
  return "";
}

napi_vm napi_create_vm() {
  napi_vm vm = new napi_vm__();
  return vm;
}

void napi_vm_release(napi_vm vm) {
  delete vm;
}

void* napi_get_vm_data(napi_vm vm) {
  return (void*)vm->vm;
}

void* napi_get_context_data(napi_context context) {
  return (void*)context->context_;
}

void  napi_enter_context(napi_context context) {}
void  napi_exit_context(napi_context context) {}

void* napi_get_platfrom(napi_vm vm) {
  return nullptr;
}

void napi_throw_exception(const napi_context context, const char* value) {}

void napi_throw_exception(const napi_context context, napi_value value) {}
void napi_register_uncaught_exception_callback(napi_vm vm) {}

napi_context napi_create_context(napi_vm vm) {
  if (vm == nullptr) {
    return nullptr;
  }

  napi_context__* context = new napi_context__(vm->vm);
  ContextManager::instance()->add_context(context);

  return context;
}

void napi_context_release(napi_vm vm, napi_context context) {
  ContextManager::instance()->remove_context(context);

  delete context;
}

void napi_add_module_class(napi_context context,
                           const ModuleClassMap& modules) {
  HIPPY_DCHECK(context);
  context->modules.insert(modules.begin(), modules.end());
}

JSValueRef getInternalBinding(JSContextRef ctx,
                              JSObjectRef function,
                              JSObjectRef thisObject,
                              size_t argumentCount,
                              const JSValueRef arguments[],
                              JSValueRef* exception) {
  if (argumentCount <= 0) {
    return JSValueMakeNull(ctx);
  }

  napi_context__* context = ContextManager::instance()->get_context(ctx);
  if (!context) {
    return JSValueMakeNull(ctx);
  }

  JSValueRef valueRef = arguments[0];
  if (!JSValueIsString(ctx, valueRef)) {
    return JSValueMakeNull(ctx);
  }

  JSStringRef stringRef = JSValueToStringCopy(ctx, valueRef, nullptr);
  std::string moduel_name = js_string_to_utf8(stringRef);
  auto module_class = context->modules.find(moduel_name);
  if (module_class == context->modules.end()) {
    return JSValueMakeNull(ctx);
  }

  const std::string& className = module_class->first;
  size_t count = module_class->second.size();
  JSStaticFunction* staticFunctions = new JSStaticFunction[count + 1];
  size_t index = 0;
  for (const auto& fn : module_class->second) {
    JSStaticFunction function = {};
    const std::string& functionName = fn.first;
    function.name = functionName.c_str();
    function.callAsFunction = JS_Function_Callback;
    function.attributes =
        kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete;
    staticFunctions[index++] = function;
  }
  staticFunctions[count] = {0, 0, 0};

  JSStaticValue staticValues[] = {0, 0, 0, 0};

  JSClassDefinition classDefinition = kJSClassDefinitionEmpty;
  classDefinition.className = className.c_str();
  classDefinition.staticFunctions = staticFunctions;
  classDefinition.staticValues = staticValues;
  classDefinition.attributes = kJSClassAttributeNone;
  classDefinition.callAsConstructor = nullptr;
  JSClassRef classRef = JSClassCreate(&classDefinition);
  JSObjectRef object = JSObjectMake(context->context_, classRef, nullptr);
  return object;
}

napi_value napi_get_internal_binding(napi_context context) {
  HIPPY_DCHECK(context);

  JSObjectRef functionObject = JSObjectMakeFunctionWithCallback(
      context->context_, NULL, getInternalBinding);
  napi_value retValue = std::make_shared<napi_value__>(context, functionObject);
  return retValue;
}

void napi_register_global_module(napi_context context,
                                 const ModuleClassMap& modules) {
  HIPPY_DCHECK(context);

  for (const auto& cls : modules) {
    const std::string& className = cls.first;
    size_t count = cls.second.size();
    JSStaticFunction* staticFunctions = new JSStaticFunction[count + 1];
    size_t index = 0;

    for (const auto& fn : cls.second) {
      const std::string& functionName = fn.first;
      JSStaticFunction function = {};
      function.name = functionName.c_str();
      function.callAsFunction = JS_Function_Callback;
      function.attributes =
          kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete;
      staticFunctions[index++] = function;
    }

    staticFunctions[count] = {0, 0, 0};

    JSStaticValue staticValues[] = {0, 0, 0, 0};

    JSClassDefinition classDefinition = kJSClassDefinitionEmpty;
    classDefinition.className = className.c_str();
    classDefinition.staticFunctions = staticFunctions;
    classDefinition.staticValues = staticValues;
    classDefinition.attributes = kJSClassAttributeNone;
    classDefinition.callAsConstructor = nullptr;
    JSClassRef classRef = JSClassCreate(&classDefinition);
    JSObjectRef object = JSObjectMake(context->context_, classRef, nullptr);

    JSStringRef stringRef = JSStringCreateWithUTF8CString(className.c_str());
    JSObjectSetProperty(context->context_, JSContextGetGlobalObject(context->context_), stringRef,
                        object, kJSPropertyAttributeNone, nullptr);
    JSStringRelease(stringRef);
  }
}

bool napi_register_global_in_js(napi_context context) {
  HIPPY_DCHECK(context);

  JSGlobalContextRef ctx = context->context_;

  JSValueRef jsError = NULL;
  JSStringRef name = JSStringCreateWithUTF8CString("global");
  JSObjectSetProperty(ctx, JSContextGetGlobalObject(context->context_), name, JSContextGetGlobalObject(context->context_),
                      kJSPropertyAttributeNone, &jsError);
  JSStringRelease(name);

  exception_description(context->context_, jsError);

  if (jsError) {
    return false;
  } else {
    return true;
  }
}

napi_value napi_evaluate_javascript(napi_context context,
                                    const uint8_t* javascript_data,
                                    size_t javascript_length,
                                    const char* filename) {
  HIPPY_DCHECK(context);

  if (!javascript_data || !javascript_length) {
    return nullptr;
  }

  JSGlobalContextRef ctx = context->context_;
  const char* javascript = reinterpret_cast<const char*>(javascript_data);
  JSStringRef jsString = JSStringCreateWithUTF8CString(javascript);
  JSValueRef exception = nullptr;

  JSStringRef filenameRef = nullptr;
  if (filename && strlen(filename) > 0) {
    filenameRef = JSStringCreateWithUTF8CString(filename);
  }
  JSValueRef value =
      JSEvaluateScript(ctx, jsString, nullptr, filenameRef, 1, &exception);
  if (filenameRef) {
    JSStringRelease(filenameRef);
  }
  JSStringRelease(jsString);

  exception_description(context->context_, exception);

  if (!value) {
    return nullptr;
  }

  return std::make_shared<napi_value__>(context, value);
}

}  // namespace napi
}  // namespace hippy
