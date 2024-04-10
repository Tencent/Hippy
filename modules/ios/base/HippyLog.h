/*!
 * iOS SDK
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
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
# if defined(__OBJC__)

#import <Foundation/Foundation.h>
#import "HippyDefines.h"

/**
 * Thresholds for logs to display a redbox. You can override these values when debugging
 * in order to tweak the default logging behavior.
 */
#ifndef HIPPYLOG_REDBOX_LEVEL
#define HIPPYLOG_REDBOX_LEVEL HippyLogLevelError
#endif

/**
 * Logging macros. Use these to log information, warnings and errors in your
 * own code.
 */
#define HippyLog(...) _HippyLog(HippyLogLevelInfo, __VA_ARGS__)
#define HippyLogTrace(...) _HippyLog(HippyLogLevelTrace, __VA_ARGS__)
#define HippyLogInfo(...) _HippyLog(HippyLogLevelInfo, __VA_ARGS__)
#define HippyLogWarn(...) _HippyLog(HippyLogLevelWarning, __VA_ARGS__)
#define HippyLogError(...) _HippyLog(HippyLogLevelError, __VA_ARGS__)
#define HippyLogFatal(...) _HippyLog(HippyLogLevelFatal, __VA_ARGS__)

/**
 * An enum representing the severity of the log message.
 */
typedef NS_ENUM(NSInteger, HippyLogLevel) {
    HippyLogLevelTrace = 0,
    HippyLogLevelInfo = 1,
    HippyLogLevelWarning = 2,
    HippyLogLevelError = 3,
    HippyLogLevelFatal = 4
};

/**
 * An enum representing the source of a log message.
 */
typedef NS_ENUM(NSInteger, HippyLogSource) { HippyLogSourceNative = 1, HippyLogSourceJavaScript = 2 };

/**
 * A block signature to be used for custom logging functions. In most cases you
 * will want to pass these arguments to the HippyFormatLog function in order to
 * generate a string.
 */
typedef void (^HippyLogFunction)(HippyLogLevel level, HippyLogSource source, NSString *fileName, NSNumber *lineNumber, NSString *message);

/**
 * A method to generate a string from a collection of log data. To omit any
 * particular data from the log, just pass nil or zero for the argument.
 */
HIPPY_EXTERN NSString *HippyFormatLog(NSDate *timestamp, HippyLogLevel level, NSString *fileName, NSNumber *lineNumber, NSString *message);

/**
 * The default logging function used by HippyLogXX.
 */
extern HippyLogFunction HippyDefaultLogFunction;

/**
 * These methods get and set the global logging threshold. This is the level
 * below which logs will be ignored. Default is HippyLogLevelInfo for debug and
 * HippyLogLevelError for production.
 */
HIPPY_EXTERN void HippySetLogThreshold(HippyLogLevel threshold);
HIPPY_EXTERN HippyLogLevel HippyGetLogThreshold(void);

/**
 * These methods get and set the global logging function called by the HippyLogXX
 * macros. You can use these to replace the standard behavior with custom log
 * functionality.
 */
HIPPY_EXTERN void HippySetLogFunction(HippyLogFunction logFunction);
HIPPY_EXTERN HippyLogFunction HippyGetLogFunction(void);

/**
 * This appends additional code to the existing log function, without replacing
 * the existing functionality. Useful if you just want to forward logs to an
 * extra service without changing the default behavior.
 */
HIPPY_EXTERN void HippyAddLogFunction(HippyLogFunction logFunction);

/**
 * This method temporarily overrides the log function while performing the
 * specified block. This is useful for testing purposes (to detect if a given
 * function logs something) or to suppress or override logging temporarily.
 */
HIPPY_EXTERN void HippyPerformBlockWithLogFunction(void (^block)(void), HippyLogFunction logFunction);

/**
 * This method adds a conditional prefix to any messages logged within the scope
 * of the passed block. This is useful for adding additional context to log
 * messages. The block will be performed synchronously on the current thread.
 */
HIPPY_EXTERN void HippyPerformBlockWithLogPrefix(void (^block)(void), NSString *prefix);

/**
 * Private logging function - ignore this.
 */
#define _HippyLog(lvl, ...) HippyLogNativeInternal(lvl, __FILE__, __LINE__, __VA_ARGS__);

HIPPY_EXTERN void HippyLogNativeInternal(HippyLogLevel, const char *, int, NSString *, ...) NS_FORMAT_FUNCTION(4, 5);


#if HIPPY_DEBUG

/*
 * A handler that displays a red screen when an exception occurs
 */
typedef void (^HippyRedBoxFunction)(NSString *errMsg, NSMutableArray<NSDictionary *> *stacks);

/*
 * Set a handler that displays a red screen when an exception occurs
 */
HIPPY_EXTERN void HippySetRedBoxFunction(HippyRedBoxFunction redBoxFunction);

#endif /* HIPPY_DEBUG */

#endif // defined(__OBJC__)
