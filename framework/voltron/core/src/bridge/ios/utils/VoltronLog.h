/*!
 * iOS SDK
 *
 * Tencent is pleased to support the open source community by making
 * Voltron available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#import <Foundation/Foundation.h>
#import "VoltronDefines.h"

#ifndef VOLTRONLOG_ENABLED
#ifdef DEBUG
#define VOLTRONLOG_ENABLED 1
#else
#define VOLTRONLOG_ENABLED 0
#endif
#endif

/**
 * Thresholds for logs to display a redbox. You can override these values when debugging
 * in order to tweak the default logging behavior.
 */
#ifndef VOLTRONLOG_REDBOX_LEVEL
#define VOLTRONLOG_REDBOX_LEVEL VoltronLogLevelError
#endif

/**
 * Logging macros. Use these to log information, warnings and errors in your
 * own code.
 */
#define VoltronLog(...) _VoltronLog(VoltronLogLevelInfo, __VA_ARGS__)
#define VoltronLogTrace(...) _VoltronLog(VoltronLogLevelTrace, __VA_ARGS__)
#define VoltronLogInfo(...) _VoltronLog(VoltronLogLevelInfo, __VA_ARGS__)
#define VoltronLogWarn(...) _VoltronLog(VoltronLogLevelWarning, __VA_ARGS__)
#define VoltronLogError(...) _VoltronLog(VoltronLogLevelError, __VA_ARGS__)

/**
 * An enum representing the severity of the log message.
 */
typedef NS_ENUM(NSInteger, VoltronLogLevel) {
  VoltronLogLevelTrace = 0,
  VoltronLogLevelInfo = 1,
  VoltronLogLevelWarning = 2,
  VoltronLogLevelError = 3,
  VoltronLogLevelFatal = 4
};

/**
 * An enum representing the source of a log message.
 */
typedef NS_ENUM(NSInteger, VoltronLogSource) {
  VoltronLogSourceNative = 1,
  VoltronLogSourceJavaScript = 2
};

/**
 * A block signature to be used for custom logging functions. In most cases you
 * will want to pass these arguments to the VoltronFormatLog function in order to
 * generate a string.
 */
typedef void (^VoltronLogFunction)(
  VoltronLogLevel level,
  VoltronLogSource source,
  NSString *fileName,
  NSNumber *lineNumber,
  NSString *message
);

/**
 * A method to generate a string from a collection of log data. To omit any
 * particular data from the log, just pass nil or zero for the argument.
 */
VOLTRON_EXTERN NSString *VoltronFormatLog(
  NSDate *timestamp,
  VoltronLogLevel level,
  NSString *fileName,
  NSNumber *lineNumber,
  NSString *message
);

/**
 * The default logging function used by VoltronLogXX.
 */
extern VoltronLogFunction VoltronDefaultLogFunction;

/**
 * These methods get and set the global logging threshold. This is the level
 * below which logs will be ignored. Default is VoltronLogLevelInfo for debug and
 * VoltronLogLevelError for production.
 */
VOLTRON_EXTERN void VoltronSetLogThreshold(VoltronLogLevel threshold);
VOLTRON_EXTERN VoltronLogLevel VoltronGetLogThreshold(void);

/**
 * These methods get and set the global logging function called by the VoltronLogXX
 * macros. You can use these to replace the standard behavior with custom log
 * functionality.
 */
VOLTRON_EXTERN void VoltronSetLogFunction(VoltronLogFunction logFunction);
VOLTRON_EXTERN VoltronLogFunction VoltronGetLogFunction(void);

/**
 * This appends additional code to the existing log function, without replacing
 * the existing functionality. Useful if you just want to forward logs to an
 * extra service without changing the default behavior.
 */
VOLTRON_EXTERN void VoltronAddLogFunction(VoltronLogFunction logFunction);

/**
 * This method temporarily overrides the log function while performing the
 * specified block. This is useful for testing purposes (to detect if a given
 * function logs something) or to suppress or override logging temporarily.
 */
VOLTRON_EXTERN void VoltronPerformBlockWithLogFunction(void (^block)(void), VoltronLogFunction logFunction);

/**
 * This method adds a conditional prefix to any messages logged within the scope
 * of the passed block. This is useful for adding additional context to log
 * messages. The block will be performed synchronously on the current thread.
 */
VOLTRON_EXTERN void VoltronPerformBlockWithLogPrefix(void (^block)(void), NSString *prefix);

/**
 * Private logging function - ignore this.
 */
#if VOLTRONLOG_ENABLED
#define _VoltronLog(lvl, ...) _VoltronLogNativeInternal(lvl, __FILE__, __LINE__, __VA_ARGS__);
#else
#define _VoltronLog(lvl, ...) do { } while (0)
#endif

VOLTRON_EXTERN void _VoltronLogNativeInternal(VoltronLogLevel, const char *, int, NSString *, ...) NS_FORMAT_FUNCTION(4,5);
VOLTRON_EXTERN void _VoltronLogJavaScriptInternal(VoltronLogLevel, NSString *);
