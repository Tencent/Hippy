/*****************************************************************************
 * @copyright Copyright (C), 1998-2020, Tencent Tech. Co., Ltd.
 * @file     exception_handler.h
 * @brief    
 * @author   skindhu
 * @version  1.0.0
 * @date     2021/8/12
 *****************************************************************************/
#ifndef ANDROID_CORE_INCLUDE_BRIDGE_ANDROID_EXCEPTION_HANDLER_H_
#define ANDROID_CORE_INCLUDE_BRIDGE_ANDROID_EXCEPTION_HANDLER_H_

#pragma once

#include <iostream>
#include <sstream>

#include "runtime.h"

class ExceptionHandler {
 public:
  using unicode_string_view = tdf::base::unicode_string_view;

  ExceptionHandler() = default;
  ~ExceptionHandler() = default;
  static void ReportJsException(const std::shared_ptr<Runtime>& runtime,
                                const unicode_string_view& desc,
                                const unicode_string_view& stack);

  static void HandleUncaughtJsError(v8::Local<v8::Message> message, v8::Local<v8::Value> error);
};

#endif  // ANDROID_CORE_INCLUDE_BRIDGE_ANDROID_EXCEPTION_HANDLER_H_
