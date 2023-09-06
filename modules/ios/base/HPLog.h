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

#import <Foundation/Foundation.h>

#import "MacroDefines.h"

#ifndef HP_LOG_ENABLED
#ifdef DEBUG
#define HP_LOG_ENABLED 1
#else
#define HP_LOG_ENABLED 0
#endif  //#ifdef DEBUG
#endif  //#ifndef HP_LOG_ENABLED

/**
 * Thresholds for logs to display a redbox. You can override these values when debugging
 * in order to tweak the default logging behavior.
 */
#ifndef HPLOG_REDBOX_LEVEL
#define HPLOG_REDBOX_LEVEL HPLogLevelError
#endif

/**
 * Logging macros. Use these to log information, warnings and errors in your
 * own code.
 */
#define HPLog(...) _HPLog(HPLogLevelInfo, __VA_ARGS__)
#define HPLogTrace(...) _HPLog(HPLogLevelTrace, __VA_ARGS__)
#define HPLogInfo(...) _HPLog(HPLogLevelInfo, __VA_ARGS__)
#define HPLogWarn(...) _HPLog(HPLogLevelWarning, __VA_ARGS__)
#define HPLogError(...) _HPLog(HPLogLevelError, __VA_ARGS__)
#define HPLogFatal(...) _HPLog(HPLogLevelFatal, __VA_ARGS__)

/**
 * An enum representing the severity of the log message.
 */
typedef NS_ENUM(NSInteger, HPLogLevel) {
    HPLogLevelTrace = 0,
    HPLogLevelInfo = 1,
    HPLogLevelWarning = 2,
    HPLogLevelError = 3,
    HPLogLevelFatal = 4
};

/**
 * A block signature to be used for custom logging functions. In most cases you
 * will want to pass these arguments to the HPFormatLog function in order to
 * generate a string.
 */
typedef void (^HPLogFunction)(HPLogLevel level, NSString *fileName,
                              NSNumber *lineNumber, NSString *message,
                              NSArray<NSDictionary *> *, NSDictionary *userInfo);

typedef void (^HPLogShowFunction)(NSString *message, NSArray<NSDictionary *> *stacks);

/**
 * A method to generate a string from a collection of log data. To omit any
 * particular data from the log, just pass nil or zero for the argument.
 */
HP_EXTERN NSString *HPFormatLog(NSDate *timestamp, HPLogLevel level, NSString *fileName, NSNumber *lineNumber, NSString *message);

/**
 * The default logging function used by HPLogXX.
 */
extern HPLogFunction HPDefaultLogFunction;

/**
 * These methods get and set the global logging threshold. This is the level
 * below which logs will be ignored. Default is HPLogLevelInfo for debug and
 * HPLogLevelError for production.
 */
HP_EXTERN void HPSetLogThreshold(HPLogLevel threshold);
HP_EXTERN HPLogLevel HPGetLogThreshold(void);

/**
 * These methods get and set the global logging function called by the HPLogXX
 * macros. You can use these to replace the standard behavior with custom log
 * functionality.
 */
HP_EXTERN void HPSetLogFunction(HPLogFunction logFunction);
HP_EXTERN HPLogFunction HPGetLogFunction(void);

/**
 * This appends additional code to the existing log function, without replacing
 * the existing functionality. Useful if you just want to forward logs to an
 * extra service without changing the default behavior.
 */
HP_EXTERN void HPAddLogFunction(HPLogFunction logFunction);

/**
 * This method temporarily overrides the log function while performing the
 * specified block. This is useful for testing purposes (to detect if a given
 * function logs something) or to suppress or override logging temporarily.
 */
HP_EXTERN void HPPerformBlockWithLogFunction(void (^block)(void), HPLogFunction logFunction);

/**
 * This method adds a conditional prefix to any messages logged within the scope
 * of the passed block. This is useful for adding additional context to log
 * messages. The block will be performed synchronously on the current thread.
 */
HP_EXTERN void HPPerformBlockWithLogPrefix(void (^block)(void), NSString *prefix);

/**
 * Private logging function - ignore this.
 */
#if HP_LOG_ENABLED
#define _HPLog(lvl, ...) HPLogNativeInternal(lvl, __FILE__, __LINE__, nil, __VA_ARGS__);
#else
#define _HPLog(lvl, ...) \
    do {                    \
    } while (0)
#endif

HP_EXTERN void HPLogNativeInternal(HPLogLevel, const char *, int, NSDictionary *, NSString *, ...) NS_FORMAT_FUNCTION(5, 6);

