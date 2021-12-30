/**
 * Copyright (c) 2016-present, Tencent, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the Apache-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "VoltronJSCWrapper.h"
#if TARGET_OS_IPHONE
#import <UIKit/UIKit.h>
#elif TARGET_OS_MAC
#import <Cocoa/Cocoa.h>
#endif
#import <JavaScriptCore/JavaScriptCore.h>
#include <dlfcn.h>


void __attribute__((visibility("hidden"),weak)) VoltronCustomJSCInit(__unused void *handle) {
  return;
}

static void VoltronSetUpSystemLibraryPointers(VoltronJSCWrapper *wrapper)
{
  wrapper->JSStringCreateWithCFString = JSStringCreateWithCFString;
  wrapper->JSStringCreateWithUTF8CString = JSStringCreateWithUTF8CString;
  wrapper->JSStringRelease = JSStringRelease;
  wrapper->JSGlobalContextSetName = JSGlobalContextSetName;
  wrapper->JSObjectSetProperty = JSObjectSetProperty;
  wrapper->JSContextGetGlobalObject = JSContextGetGlobalObject;
  wrapper->JSObjectGetProperty = JSObjectGetProperty;
  wrapper->JSValueMakeFromJSONString = JSValueMakeFromJSONString;
  wrapper->JSObjectCallAsFunction = JSObjectCallAsFunction;
  wrapper->JSValueMakeNull = JSValueMakeNull;
  wrapper->JSValueCreateJSONString = JSValueCreateJSONString;
  wrapper->JSValueIsUndefined = JSValueIsUndefined;
  wrapper->JSValueIsNull = JSValueIsNull;
  wrapper->JSEvaluateScript = JSEvaluateScript;
  wrapper->JSContext = [JSContext class];
  wrapper->JSValue = [JSValue class];
}

VoltronJSCWrapper *VoltronJSCWrapperCreate(BOOL useCustomJSC)
{
    VoltronJSCWrapper *wrapper = (VoltronJSCWrapper *)malloc(sizeof(VoltronJSCWrapper));
    VoltronSetUpSystemLibraryPointers(wrapper);
    return wrapper;
}

void VoltronJSCWrapperRelease(VoltronJSCWrapper *wrapper)
{
  if (wrapper) {
    free(wrapper);
  }
}
