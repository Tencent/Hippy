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

#import <JavaScriptCore/JavaScriptCore.h>

#import "VoltronDefines.h"

typedef JSStringRef (*JSStringCreateWithCFStringFuncType)(CFStringRef);
typedef JSStringRef (*JSStringCreateWithUTF8CStringFuncType)(const char *);
typedef void (*JSStringReleaseFuncType)(JSStringRef);
typedef void (*JSGlobalContextSetNameFuncType)(JSGlobalContextRef, JSStringRef);
typedef void (*JSObjectSetPropertyFuncType)(JSContextRef, JSObjectRef, JSStringRef, JSValueRef, JSPropertyAttributes, JSValueRef *);
typedef JSObjectRef (*JSContextGetGlobalObjectFuncType)(JSContextRef);
typedef JSValueRef (*JSObjectGetPropertyFuncType)(JSContextRef, JSObjectRef, JSStringRef, JSValueRef *);
typedef JSValueRef (*JSValueMakeFromJSONStringFuncType)(JSContextRef, JSStringRef);
typedef JSValueRef (*JSObjectCallAsFunctionFuncType)(JSContextRef, JSObjectRef, JSObjectRef, size_t, const JSValueRef *, JSValueRef *);
typedef JSValueRef (*JSValueMakeNullFuncType)(JSContextRef);
typedef JSStringRef (*JSValueCreateJSONStringFuncType)(JSContextRef, JSValueRef, unsigned, JSValueRef *);
typedef bool (*JSValueIsUndefinedFuncType)(JSContextRef, JSValueRef);
typedef bool (*JSValueIsNullFuncType)(JSContextRef, JSValueRef);
typedef JSValueRef (*JSEvaluateScriptFuncType)(JSContextRef, JSStringRef, JSObjectRef, JSStringRef, int, JSValueRef *);

typedef struct VoltronJSCWrapper {
  JSStringCreateWithCFStringFuncType JSStringCreateWithCFString;
  JSStringCreateWithUTF8CStringFuncType JSStringCreateWithUTF8CString;
  JSStringReleaseFuncType JSStringRelease;
  JSGlobalContextSetNameFuncType JSGlobalContextSetName;
  JSObjectSetPropertyFuncType JSObjectSetProperty;
  JSContextGetGlobalObjectFuncType JSContextGetGlobalObject;
  JSObjectGetPropertyFuncType JSObjectGetProperty;
  JSValueMakeFromJSONStringFuncType JSValueMakeFromJSONString;
  JSObjectCallAsFunctionFuncType JSObjectCallAsFunction;
  JSValueMakeNullFuncType JSValueMakeNull;
  JSValueCreateJSONStringFuncType JSValueCreateJSONString;
  JSValueIsUndefinedFuncType JSValueIsUndefined;
  JSValueIsNullFuncType JSValueIsNull;
  JSEvaluateScriptFuncType JSEvaluateScript;
  Class JSContext;
  Class JSValue;
} VoltronJSCWrapper;

VOLTRON_EXTERN VoltronJSCWrapper *VoltronJSCWrapperCreate(BOOL useCustomJSC);
VOLTRON_EXTERN void VoltronJSCWrapperRelease(VoltronJSCWrapper *wrapper);

/**
 * Link time overridable initialization function to execute custom
 * initialization code when loading custom JSC.
 *
 * By default it does nothing.
 *
 * @param handle to the dlopen'd JSC library.
 */
void __attribute__((visibility("hidden"))) VoltronCustomJSCInit(void *handle);
