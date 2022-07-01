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

#import "NativeRenderLog.h"
#include <asl.h>
#include <string>
#include <mutex>
#include "logging.h"

#pragma mark TDFLog Binding
using LogSeverity = footstone::LogSeverity;
static NativeRenderLogLevel logSeverityToLogLevel(LogSeverity severity) {
    NativeRenderLogLevel level = NativeRenderLogLevelInfo;
    switch (severity) {
        case LogSeverity::TDF_LOG_WARNING:
            level = NativeRenderLogLevelWarning;
            break;
        case LogSeverity::TDF_LOG_ERROR:
            level = NativeRenderLogLevelError;
            break;
        case LogSeverity::TDF_LOG_FATAL:
            level = NativeRenderLogLevelFatal;
            break;
        default:
            break;
    }
    return level;
}

static BOOL GetFileNameAndLineNumberFromLogMessage(NSString *message, NSString **fileName, int *lineNumber) {
    //[INFO:cubic_bezier_animation.cc(146)] animation exec_time_ = 514, delay = 500, duration = 1000
    NSUInteger locationOfColon = [message rangeOfString:@":"].location;
    if (NSNotFound == locationOfColon) {
        return NO;
    }
    NSUInteger locationOfLeftBracket = [message rangeOfString:@"("].location;
    if (NSNotFound == locationOfLeftBracket) {
        return NO;
    }
    if (locationOfLeftBracket <= locationOfColon) {
        return NO;
    }
    NSString *name = [message substringWithRange:NSMakeRange(locationOfColon + 1, locationOfLeftBracket - locationOfColon - 1)];
    *fileName = [name copy];
    NSUInteger locationOfRightBracket = [message rangeOfString:@")"].location;
    if (NSNotFound == locationOfRightBracket || locationOfRightBracket <= locationOfLeftBracket) {
        return YES;
    }
    NSString *number = [message substringWithRange:NSMakeRange(locationOfLeftBracket + 1, locationOfRightBracket - locationOfLeftBracket - 1)];
    *lineNumber = [number intValue];
    return YES;
}

static void registerTDFLogHandler() {
    static std::once_flag flag;
    std::call_once(flag, [](){
        std::function<void (const std::ostringstream &, LogSeverity)> logFunction = [](const std::ostringstream &stream, LogSeverity serverity) {
            @autoreleasepool {
                std::string string = stream.str();
                if (string.length()) {
                    NSString *message = [NSString stringWithUTF8String:string.c_str()];
                    NSString *fileName = nil;
                    int lineNumber = 0;
                    if (GetFileNameAndLineNumberFromLogMessage(message, &fileName, &lineNumber)) {
                        NativeRenderLogNativeInternal(logSeverityToLogLevel(serverity), [fileName UTF8String], lineNumber, @"%@", message);
                    }
                }
            }
        };
        footstone::LogMessage::InitializeDelegate(logFunction);
    });
}

#pragma mark NativeLog Methods

static NSString *const NativeRenderLogFunctionStack = @"NativeRenderLogFunctionStack";

const char *NativeRenderLogLevels[] = {
    "trace",
    "info",
    "warn",
    "error",
    "fatal",
};

#if NATIVE_RENDER_DEBUG
NativeRenderLogLevel NativeRenderDefaultLogThreshold = NativeRenderLogLevelTrace;
#else
NativeRenderLogLevel NativeRenderDefaultLogThreshold = NativeRenderLogLevelError;
#endif

static NativeRenderLogFunction NativeRenderCurrentLogFunction;
static NativeRenderLogLevel NativeRenderCurrentLogThreshold = NativeRenderDefaultLogThreshold;
static NativeRenderLogShowFunction NativeRenderLogShowFunc;

NativeRenderLogLevel NativeRenderGetLogThreshold() {
    return NativeRenderCurrentLogThreshold;
}

void NativeRenderSetLogThreshold(NativeRenderLogLevel threshold) {
    NativeRenderCurrentLogThreshold = threshold;
}

NativeRenderLogFunction NativeRenderDefaultLogFunction
    = ^(NativeRenderLogLevel level, NSString *fileName, NSNumber *lineNumber,
        NSString *message, NSArray<NSDictionary *> *stack) {
          NSString *log = NativeRenderFormatLog([NSDate date], level, fileName, lineNumber, message);
          fprintf(stderr, "%s\n", log.UTF8String);
          fflush(stderr);
      };

void NativeRenderSetLogFunction(NativeRenderLogFunction logFunction) {
    registerTDFLogHandler();
    NativeRenderCurrentLogFunction = logFunction;
}

NativeRenderLogFunction NativeRenderGetLogFunction() {
    if (!NativeRenderCurrentLogFunction) {
        NativeRenderCurrentLogFunction = NativeRenderDefaultLogFunction;
    }
    return NativeRenderCurrentLogFunction;
}

void NativeRenderAddLogFunction(NativeRenderLogFunction logFunction) {
    NativeRenderLogFunction existing = NativeRenderGetLogFunction();
    if (existing) {
        NativeRenderSetLogFunction(^(NativeRenderLogLevel level, NSString *fileName, NSNumber *lineNumber, NSString *message, NSArray<NSDictionary *> *stack) {
            existing(level, fileName, lineNumber, message, stack);
            logFunction(level, fileName, lineNumber, message, stack);
        });
    } else {
        NativeRenderSetLogFunction(logFunction);
    }
}

void NativeRenderPerformBlockWithLogFunction(void (^block)(void), NativeRenderLogFunction logFunction) {
    NSMutableDictionary *threadDictionary = [NSThread currentThread].threadDictionary;
    NSMutableArray<NativeRenderLogFunction> *functionStack = threadDictionary[NativeRenderLogFunctionStack];
    if (!functionStack) {
        functionStack = [NSMutableArray new];
        threadDictionary[NativeRenderLogFunctionStack] = functionStack;
    }
    [functionStack addObject:logFunction];
    block();
    [functionStack removeLastObject];
}

void NativeRenderPerformBlockWithLogPrefix(void (^block)(void), NSString *prefix) {
    NativeRenderLogFunction logFunction = NativeRenderGetLogFunction();
    if (logFunction) {
        NativeRenderPerformBlockWithLogFunction(
            block, ^(NativeRenderLogLevel level, NSString *fileName, NSNumber *lineNumber, NSString *message, NSArray<NSDictionary *> *stack) {
                logFunction(level, fileName, lineNumber, [prefix stringByAppendingString:message], stack);
            });
    }
}

static NSString *currentThreadName(void) {
    NSThread *thread = [NSThread currentThread];
    NSString *threadName = [NSThread isMainThread] ? @"main" : thread.name;
    if (threadName.length == 0) {
        const char *label = dispatch_queue_get_label(DISPATCH_CURRENT_QUEUE_LABEL);
        if (label && strlen(label) > 0) {
            threadName = @(label);
        } else {
            threadName = [NSString stringWithFormat:@"%p", thread];
        }
    }
    return threadName;
}

NSString *NativeRenderFormatLog(NSDate *timestamp, NativeRenderLogLevel level, NSString *fileName, NSNumber *lineNumber, NSString *message) {
    NSMutableString *log = [NSMutableString new];
    if (timestamp) {
        static NSDateFormatter *formatter;
        static dispatch_once_t onceToken;
        dispatch_once(&onceToken, ^{
            formatter = [NSDateFormatter new];
            formatter.dateFormat = formatter.dateFormat = @"yyyy-MM-dd HH:mm:ss.SSS ";
        });
        [log appendString:[formatter stringFromDate:timestamp]];
    }
    if (level) {
        [log appendFormat:@"[%s]", NativeRenderLogLevels[level]];
    }

    [log appendFormat:@"[tid:%@]", currentThreadName()];

    if (fileName) {
        fileName = fileName.lastPathComponent;
        if (lineNumber) {
            [log appendFormat:@"[%@:%@]", fileName, lineNumber];
        } else {
            [log appendFormat:@"[%@]", fileName];
        }
    }
    if (message) {
        [log appendString:@" "];
        [log appendString:message];
    }
    return log;
}

void NativeRenderLogNativeInternal(NativeRenderLogLevel level, const char *fileName, int lineNumber, NSString *format, ...) {
    NativeRenderLogFunction logFunction = NativeRenderGetLogFunction();
    BOOL log = NATIVE_RENDER_DEBUG || (logFunction != nil);
    if (log && level >= NativeRenderGetLogThreshold()) {
        // Get message
        va_list args;
        va_start(args, format);
        NSString *message = [[NSString alloc] initWithFormat:format arguments:args];
        va_end(args);
        NSArray<NSDictionary *> *callStacks = nil;
#if NATIVE_RENDER_DEBUG
        if (level >= NativeRenderLogLevelError) {
            NSArray<NSString *> *stackSymbols = [NSThread callStackSymbols];
            NSMutableArray<NSDictionary *> *stack = [NSMutableArray arrayWithCapacity:(stackSymbols.count - 1)];
            [stackSymbols enumerateObjectsUsingBlock:^(NSString *frameSymbols, NSUInteger idx, __unused BOOL *stop) {
                if (idx > 0) {  // don't include the current frame
                    NSString *address = [[frameSymbols componentsSeparatedByString:@"0x"][1] componentsSeparatedByString:@" "][0];
                    NSRange addressRange = [frameSymbols rangeOfString:address];
                    NSString *methodName = [frameSymbols substringFromIndex:(addressRange.location + addressRange.length + 1)];
                    if (idx == 1 && fileName) {
                        NSString *file = [@(fileName) componentsSeparatedByString:@"/"].lastObject;
                        [stack addObject:@{@"methodName": methodName, @"file": file, @"lineNumber": @(lineNumber)}];
                    } else {
                        [stack addObject:@ { @"methodName": methodName }];
                    }
                }
            }];
            callStacks = [stack copy];
        }
#endif
        // Call log function
        if (logFunction) {
            logFunction(level, fileName ? @(fileName) : nil, lineNumber > 0 ? @(lineNumber) : nil, message, callStacks);
        }
    }
}
