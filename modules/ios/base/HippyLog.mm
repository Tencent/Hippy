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

#import "HippyLog.h"
#import "HippyBridge.h"
#import "HippyRedBox.h"
#include "footstone/logging.h"

#pragma mark NativeLog Methods

static NSString *const HippyLogFunctionStack = @"HippyLogFunctionStack";

const char *HippyLogLevels[] = {
    "trace",
    "info",
    "warn",
    "error",
    "fatal",
};

#if HIPPY_DEBUG
HippyLogLevel HPDefaultLogThreshold = HippyLogLevelTrace;
#else
HippyLogLevel HPDefaultLogThreshold = HippyLogLevelInfo;
#endif

static HippyLogFunction HPCurrentLogFunction;
static HippyLogLevel HPCurrentLogThreshold = HPDefaultLogThreshold;

HippyLogLevel HippyGetLogThreshold() {
    return HPCurrentLogThreshold;
}

void HippySetLogThreshold(HippyLogLevel threshold) {
    HPCurrentLogThreshold = threshold;
}

HippyLogFunction HippyDefaultLogFunction = ^(HippyLogLevel level, __unused HippyLogSource source,
    NSString *fileName, NSNumber *lineNumber, NSString *message) {
    NSString *log = HippyFormatLog([NSDate date], level, fileName, lineNumber, message);
    fprintf(stderr, "%s\n", log.UTF8String);
    fflush(stderr);
};

void HippySetLogFunction(HippyLogFunction logFunction) {
    HPCurrentLogFunction = logFunction;
}

HippyLogFunction HippyGetLogFunction() {
    if (!HPCurrentLogFunction) {
        HPCurrentLogFunction = HippyDefaultLogFunction;
    }
    return HPCurrentLogFunction;
}

void HippyAddLogFunction(HippyLogFunction logFunction) {
    HippyLogFunction existing = HippyGetLogFunction();
    if (existing) {
        HippySetLogFunction(^(HippyLogLevel level, HippyLogSource source, NSString *fileName, NSNumber *lineNumber, NSString *message) {
            existing(level, source, fileName, lineNumber, message);
            logFunction(level, source, fileName, lineNumber, message);
        });
    } else {
        HippySetLogFunction(logFunction);
    }
}

/**
 * returns the topmost stacked log function for the current thread, which
 * may not be the same as the current value of HippyCurrentLogFunction.
 */
static HippyLogFunction HippyGetLocalLogFunction() {
    NSMutableDictionary *threadDictionary = [NSThread currentThread].threadDictionary;
    NSArray<HippyLogFunction> *functionStack = threadDictionary[HippyLogFunctionStack];
    HippyLogFunction logFunction = functionStack.lastObject;
    if (logFunction) {
        return logFunction;
    }
    return HippyGetLogFunction();
}

void HippyPerformBlockWithLogFunction(void (^block)(void), HippyLogFunction logFunction) {
    NSMutableDictionary *threadDictionary = [NSThread currentThread].threadDictionary;
    NSMutableArray<HippyLogFunction> *functionStack = threadDictionary[HippyLogFunctionStack];
    if (!functionStack) {
        functionStack = [NSMutableArray new];
        threadDictionary[HippyLogFunctionStack] = functionStack;
    }
    [functionStack addObject:logFunction];
    block();
    [functionStack removeLastObject];
}

void HippyPerformBlockWithLogPrefix(void (^block)(void), NSString *prefix) {
    HippyLogFunction logFunction = HippyGetLocalLogFunction();
    if (logFunction) {
        HippyPerformBlockWithLogFunction(block,
                                         ^(HippyLogLevel level, HippyLogSource source,
                                           NSString *fileName, NSNumber *lineNumber, NSString *message) {
            logFunction(level, source, fileName, lineNumber, [prefix stringByAppendingString:message]);
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

NSString *HippyFormatLog(NSDate *timestamp, HippyLogLevel level, NSString *fileName, NSNumber *lineNumber, NSString *message) {
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
        [log appendFormat:@"[%s]", HippyLogLevels[level]];
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

void HippyLogNativeInternal(HippyLogLevel level, const char *fileName, int lineNumber, NSString *format, ...) {
    HippyLogFunction logFunction = HippyGetLocalLogFunction();
    BOOL log = HIPPY_DEBUG || (logFunction != nil);
    if (log && level >= HippyGetLogThreshold()) {
        // Get message
        va_list args;
        va_start(args, format);
        NSString *message = [[NSString alloc] initWithFormat:format arguments:args];
        va_end(args);
        
        // Call log function
        if (logFunction) {
            logFunction(level, HippyLogSourceNative, fileName ? @(fileName) : nil, lineNumber > 0 ? @(lineNumber) : nil, message);
        }
        
#if HIPPY_DEBUG
        if (level >= HIPPYLOG_REDBOX_LEVEL) {
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
            dispatch_async(dispatch_get_main_queue(), ^{
                // red box is thread safe, but by deferring to main queue we avoid a startup
                // race condition that causes the module to be accessed before it has loaded
                [((HippyBridge *)[HippyBridge currentBridge]).redBox showErrorMessage:message withStack:stack];
            });
        }
#endif
    }
}
