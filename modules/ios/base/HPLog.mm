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

#import "HPLog.h"
#import "HippyBridge.h"
#import "HippyRedBox.h"
#include <string>
#include <mutex>

#pragma mark NativeLog Methods

static NSString *const HPLogFunctionStack = @"HPLogFunctionStack";

const char *HPLogLevels[] = {
    "trace",
    "info",
    "warn",
    "error",
    "fatal",
};

#if HP_DEBUG
HPLogLevel HPDefaultLogThreshold = HPLogLevelTrace;
#else
HPLogLevel HPDefaultLogThreshold = HPLogLevelError;
#endif

static HPLogFunction HPCurrentLogFunction;
static HPLogLevel HPCurrentLogThreshold = HPDefaultLogThreshold;
static HPLogShowFunction HPLogShowFunc;

HPLogLevel HPGetLogThreshold() {
    return HPCurrentLogThreshold;
}

void HPSetLogThreshold(HPLogLevel threshold) {
    HPCurrentLogThreshold = threshold;
}

HPLogFunction HPDefaultLogFunction
    = ^(HPLogLevel level, NSString *fileName, NSNumber *lineNumber,
        NSString *message, NSArray<NSDictionary *> *stack, NSDictionary *userInfo) {
          NSString *log = HPFormatLog([NSDate date], level, fileName, lineNumber, message);
          fprintf(stderr, "%s\n", log.UTF8String);
          fflush(stderr);
      };

void HPSetLogFunction(HPLogFunction logFunction) {
    HPCurrentLogFunction = logFunction;
}

HPLogFunction HPGetLogFunction() {
    if (!HPCurrentLogFunction) {
        HPCurrentLogFunction = HPDefaultLogFunction;
    }
    return HPCurrentLogFunction;
}

void HPAddLogFunction(HPLogFunction logFunction) {
    HPLogFunction existing = HPGetLogFunction();
    if (existing) {
        HPSetLogFunction(^(HPLogLevel level, NSString *fileName, NSNumber *lineNumber, NSString *message, NSArray<NSDictionary *> *stack, NSDictionary *userInfo) {
            existing(level, fileName, lineNumber, message, stack, userInfo);
            logFunction(level, fileName, lineNumber, message, stack, userInfo);
        });
    } else {
        HPSetLogFunction(logFunction);
    }
}

void HPPerformBlockWithLogFunction(void (^block)(void), HPLogFunction logFunction) {
    NSMutableDictionary *threadDictionary = [NSThread currentThread].threadDictionary;
    NSMutableArray<HPLogFunction> *functionStack = threadDictionary[HPLogFunctionStack];
    if (!functionStack) {
        functionStack = [NSMutableArray new];
        threadDictionary[HPLogFunctionStack] = functionStack;
    }
    [functionStack addObject:logFunction];
    block();
    [functionStack removeLastObject];
}

void HPPerformBlockWithLogPrefix(void (^block)(void), NSString *prefix) {
    HPLogFunction logFunction = HPGetLogFunction();
    if (logFunction) {
        HPPerformBlockWithLogFunction(
            block, ^(HPLogLevel level, NSString *fileName, NSNumber *lineNumber, NSString *message, NSArray<NSDictionary *> *stack, NSDictionary *userInfo) {
                logFunction(level, fileName, lineNumber, [prefix stringByAppendingString:message], stack, userInfo);
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

NSString *HPFormatLog(NSDate *timestamp, HPLogLevel level, NSString *fileName, NSNumber *lineNumber, NSString *message) {
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
        [log appendFormat:@"[%s]", HPLogLevels[level]];
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

void HPLogNativeInternal(HPLogLevel level, const char *fileName, int lineNumber, NSDictionary *userInfo, NSString *format, ...) {
    HPLogFunction logFunction = HPGetLogFunction();
    BOOL log = HP_DEBUG || (logFunction != nil);
    if (log && level >= HPGetLogThreshold()) {
        // Get message
        va_list args;
        va_start(args, format);
        NSString *message = [[NSString alloc] initWithFormat:format arguments:args];
        va_end(args);
        NSArray<NSDictionary *> *callStacks = nil;
#if HP_DEBUG
        if (level >= HPLOG_REDBOX_LEVEL) {
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
            
            dispatch_async(dispatch_get_main_queue(), ^{
                // red box is thread safe, but by deferring to main queue we avoid a startup
                // race condition that causes the module to be accessed before it has loaded
                [[HippyBridge currentBridge].redBox showErrorMessage:message withStack:stack];
            });
        }
#endif
        // Call log function
        if (logFunction) {
            logFunction(level, fileName ? @(fileName) : nil, lineNumber > 0 ? @(lineNumber) : nil, message, callStacks, userInfo);
        }
    }
}
