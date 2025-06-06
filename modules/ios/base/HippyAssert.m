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

#import "HippyAssert.h"
#import "HippyLog.h"

NSString *const HippyErrorDomain = @"HippyErrorDomain";
NSString *const HippyJSStackTraceKey = @"HippyJSStackTraceKey";
NSString *const HippyJSRawStackTraceKey = @"HippyJSRawStackTraceKey";
NSString *const HippyFatalExceptionName = @"HippyFatalException";
NSString *const HippyFatalModuleName = @"HippyFatalModuleName";

static NSString *const HippyAssertFunctionStack = @"HippyAssertFunctionStack";

HippyAssertFunction HippyCurrentAssertFunction = nil;
HippyFatalHandler HippyCurrentFatalHandler = nil;
HippyExceptionHandler HippyCurrentExceptionHandler = nil;


NSException *_HippyNotImplementedException(SEL, Class);
NSException *_HippyNotImplementedException(SEL cmd, Class cls) {
    NSString *msg = [NSString stringWithFormat:@"%s is not implemented "
                     "for the class %@",
                     sel_getName(cmd), cls];
    return [NSException exceptionWithName:@"HippyNotDesignatedInitializerException" reason:msg userInfo:nil];
}

/**
 * returns the topmost stacked assert function for the current thread, which
 * may not be the same as the current value of HippyCurrentAssertFunction.
 */
static HippyAssertFunction HippyGetLocalAssertFunction(void) {
    NSMutableDictionary *threadDictionary = [NSThread currentThread].threadDictionary;
    NSArray<HippyAssertFunction> *functionStack = threadDictionary[HippyAssertFunctionStack];
    HippyAssertFunction assertFunction = functionStack.lastObject;
    if (assertFunction) {
        return assertFunction;
    }
    return HippyCurrentAssertFunction;
}

void _HippyAssertFormat(const char *condition, const char *fileName, int lineNumber, const char *function, NSString *format, ...) {
    HippyAssertFunction assertFunction = HippyGetLocalAssertFunction();
    if (assertFunction) {
        va_list args;
        va_start(args, format);
        NSString *message = [[NSString alloc] initWithFormat:format arguments:args];
        va_end(args);
        assertFunction(@(condition), @(fileName), @(lineNumber), @(function), message);
    }
}

void HippyFatal(NSError *error) {
    NSString *failReason = error.localizedFailureReason;
    if (failReason && failReason.length >= 100) {
        failReason = [[failReason substringToIndex:100] stringByAppendingString:@"(...Description Too Long)"];
    }
    NSString *fatalMessage = nil;
    NSString *moduleDescription = [NSString stringWithFormat:@"Module:%@", error.userInfo[HippyFatalModuleName] ?: @"unknown"];
    if (failReason) {
        fatalMessage = [NSString stringWithFormat:@"%@,%@[Reason]: %@", moduleDescription, error.localizedDescription, failReason];
    } else {
        fatalMessage = [NSString stringWithFormat:@"%@,%@", moduleDescription, error.localizedDescription];
    }
    
    HippyLogNativeInternal(HippyLogLevelFatal, NULL, 0, @"%@", fatalMessage);
    HippyFatalHandler fatalHandler = HippyGetFatalHandler();
    if (fatalHandler) {
        fatalHandler(error);
    }
}

void HippyHandleException(NSException *exception) {
    HippyLogNativeInternal(HippyLogLevelFatal, NULL, 0, @"%@", exception.description);
    HippyExceptionHandler exceptionHandler = HippyGetExceptionHandler();
    if (exceptionHandler) {
        exceptionHandler(exception);
    }
}

void HippySetAssertFunction(HippyAssertFunction assertFunction) {
    HippyCurrentAssertFunction = assertFunction;
}

HippyAssertFunction HippyGetAssertFunction(void) {
    return HippyCurrentAssertFunction;
}

void HippyAddAssertFunction(HippyAssertFunction assertFunction) {
    HippyAssertFunction existing = HippyCurrentAssertFunction;
    if (existing) {
        HippyCurrentAssertFunction = ^(NSString *condition, NSString *fileName, NSNumber *lineNumber, NSString *function, NSString *message) {
            existing(condition, fileName, lineNumber, function, message);
            assertFunction(condition, fileName, lineNumber, function, message);
        };
    } else {
        HippyCurrentAssertFunction = assertFunction;
    }
}

void HippyPerformBlockWithAssertFunction(void (^block)(void), HippyAssertFunction assertFunction) {
    NSMutableDictionary *threadDictionary = [NSThread currentThread].threadDictionary;
    NSMutableArray<HippyAssertFunction> *functionStack = threadDictionary[HippyAssertFunctionStack];
    if (!functionStack) {
        functionStack = [NSMutableArray new];
        threadDictionary[HippyAssertFunctionStack] = functionStack;
    }
    [functionStack addObject:assertFunction];
    block();
    [functionStack removeLastObject];
}

NSString *HippyCurrentThreadName(void) {
    NSThread *thread = [NSThread currentThread];
    NSString *threadName = [NSThread isMainThread] || thread.isMainThread ? @"main" : thread.name;
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

void HippySetFatalHandler(HippyFatalHandler fatalhandler) {
    HippyCurrentFatalHandler = fatalhandler;
}

HippyFatalHandler HippyGetFatalHandler(void) {
    return HippyCurrentFatalHandler;
}

void HippySetExceptionHandler(HippyExceptionHandler exceptionhandler) {
    HippyCurrentExceptionHandler = exceptionhandler;
}

HippyExceptionHandler HippyGetExceptionHandler(void) {
    return HippyCurrentExceptionHandler;
}

NSString *HippyFormatError(NSString *message, NSArray<HippyJSStackFrame *> *stackTrace, NSUInteger maxMessageLength) {
    if (maxMessageLength > 0 && message.length > maxMessageLength) {
        message = [[message substringToIndex:maxMessageLength] stringByAppendingString:@"..."];
    }

    NSMutableString *prettyStack = [NSMutableString string];
    if (stackTrace) {
        [prettyStack appendString:@", stack:\n"];

        NSRegularExpression *regex = [NSRegularExpression regularExpressionWithPattern:@"^(\\d+\\.js)$"
                                                                               options:NSRegularExpressionCaseInsensitive
                                                                                 error:NULL];
        for (HippyJSStackFrame *frame in stackTrace) {
            NSString *fileName = frame.file;
            if (fileName && [regex numberOfMatchesInString:fileName options:0 range:NSMakeRange(0, [fileName length])]) {
                fileName = [fileName stringByAppendingString:@":"];
            } else {
                fileName = @"";
            }
            [prettyStack appendFormat:@"%@@%@%ld:%ld\n", frame.methodName, fileName, (long)frame.lineNumber, (long)frame.column];
        }
    }

    return [NSString stringWithFormat:@"%@%@", message, prettyStack];
}
