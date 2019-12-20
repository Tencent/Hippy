/**
 * Copyright (c) 2016-present, Tencent, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the Apache-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "HippyJSCWrapper.h"

#import <UIKit/UIKit.h>
#import <JavaScriptCore/JavaScriptCore.h>

#import "HippyLog.h"

#include <dlfcn.h>


void __attribute__((visibility("hidden"),weak)) HippyCustomJSCInit(__unused void *handle) {
  return;
}

static void HippySetUpSystemLibraryPointers(HippyJSCWrapper *wrapper)
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

HippyJSCWrapper *HippyJSCWrapperCreate(BOOL useCustomJSC)
{
    HippyJSCWrapper *wrapper = (HippyJSCWrapper *)malloc(sizeof(HippyJSCWrapper));
    HippySetUpSystemLibraryPointers(wrapper);
    return wrapper;
}

void HippyJSCWrapperRelease(HippyJSCWrapper *wrapper)
{
  if (wrapper) {
    free(wrapper);
  }
}
