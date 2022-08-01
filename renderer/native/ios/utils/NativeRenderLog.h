/*!
 * iOS SDK
 *
 * Tencent is pleased to support the open source community by making
 * NativeRender available.
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
#import "NativeRenderDefines.h"

#ifndef NATIVE_RENDER_LOG_ENABLED
#ifdef DEBUG
#define NATIVE_RENDER_LOG_ENABLED 1
#else
#define NATIVE_RENDER_LOG_ENABLED 0
#endif
#endif

/**
 * Logging macros. Use these to log information, warnings and errors in your
 * own code.
 */
#define NativeRenderLog(...) _NativeRenderLog(NativeRenderLogLevelInfo, __VA_ARGS__)
#define NativeRenderLogTrace(...) _NativeRenderLog(NativeRenderLogLevelTrace, __VA_ARGS__)
#define NativeRenderLogInfo(...) _NativeRenderLog(NativeRenderLogLevelInfo, __VA_ARGS__)
#define NativeRenderLogWarn(...) _NativeRenderLog(NativeRenderLogLevelWarning, __VA_ARGS__)
#define NativeRenderLogError(...) _NativeRenderLog(NativeRenderLogLevelError, __VA_ARGS__)
#define NativeRenderLogFatal(...) _NativeRenderLog(NativeRenderLogLevelFatal, __VA_ARGS__)

/**
 * An enum representing the severity of the log message.
 */
typedef NS_ENUM(NSInteger, NativeRenderLogLevel) {
    NativeRenderLogLevelTrace = 0,
    NativeRenderLogLevelInfo = 1,
    NativeRenderLogLevelWarning = 2,
    NativeRenderLogLevelError = 3,
    NativeRenderLogLevelFatal = 4
};

/**
 * A block signature to be used for custom logging functions. In most cases you
 * will want to pass these arguments to the NativeRenderFormatLog function in order to
 * generate a string.
 */
typedef void (^NativeRenderLogFunction)(NativeRenderLogLevel level, NSString *fileName,
                                 NSNumber *lineNumber, NSString *message, NSArray<NSDictionary *> *);

typedef void (^NativeRenderLogShowFunction)(NSString *message, NSArray<NSDictionary *> *stacks);

/**
 * A method to generate a string from a collection of log data. To omit any
 * particular data from the log, just pass nil or zero for the argument.
 */
NATIVE_RENDER_EXTERN NSString *NativeRenderFormatLog(NSDate *timestamp, NativeRenderLogLevel level, NSString *fileName, NSNumber *lineNumber, NSString *message);

/**
 * The default logging function used by NativeRenderLogXX.
 */
extern NativeRenderLogFunction NativeRenderDefaultLogFunction;

/**
 * These methods get and set the global logging threshold. This is the level
 * below which logs will be ignored. Default is NativeRenderLogLevelInfo for debug and
 * NativeRenderLogLevelError for production.
 */
NATIVE_RENDER_EXTERN void NativeRenderSetLogThreshold(NativeRenderLogLevel threshold);
NATIVE_RENDER_EXTERN NativeRenderLogLevel NativeRenderGetLogThreshold(void);

/**
 * These methods get and set the global logging function called by the NativeRenderLogXX
 * macros. You can use these to replace the standard behavior with custom log
 * functionality.
 */
NATIVE_RENDER_EXTERN void NativeRenderSetLogFunction(NativeRenderLogFunction logFunction);
NATIVE_RENDER_EXTERN NativeRenderLogFunction NativeRenderGetLogFunction(void);

/**
 * This appends additional code to the existing log function, without replacing
 * the existing functionality. Useful if you just want to forward logs to an
 * extra service without changing the default behavior.
 */
NATIVE_RENDER_EXTERN void NativeRenderAddLogFunction(NativeRenderLogFunction logFunction);

/**
 * This method temporarily overrides the log function while performing the
 * specified block. This is useful for testing purposes (to detect if a given
 * function logs something) or to suppress or override logging temporarily.
 */
NATIVE_RENDER_EXTERN void NativeRenderPerformBlockWithLogFunction(void (^block)(void), NativeRenderLogFunction logFunction);

/**
 * This method adds a conditional prefix to any messages logged within the scope
 * of the passed block. This is useful for adding additional context to log
 * messages. The block will be performed synchronously on the current thread.
 */
NATIVE_RENDER_EXTERN void NativeRenderPerformBlockWithLogPrefix(void (^block)(void), NSString *prefix);

/**
 * Private logging function - ignore this.
 */
#if NATIVE_RENDER_LOG_ENABLED
#define _NativeRenderLog(lvl, ...) NativeRenderLogNativeInternal(lvl, __FILE__, __LINE__, __VA_ARGS__);
#else
#define _NativeRenderLog(lvl, ...) \
    do {                    \
    } while (0)
#endif

NATIVE_RENDER_EXTERN void NativeRenderLogNativeInternal(NativeRenderLogLevel, const char *, int, NSString *, ...) NS_FORMAT_FUNCTION(4, 5);
