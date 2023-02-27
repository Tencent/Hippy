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

#import "HPAsserts.h"
#import "HPLog.h"

NSString *const HPErrorDomain = @"HPErrorDomain";
NSString *const HPJSStackTraceKey = @"HPJSStackTraceKey";
NSString *const HPJSRawStackTraceKey = @"HPJSRawStackTraceKey";
NSString *const HPFatalExceptionName = @"HPFatalException";
NSString *const HPFatalModuleName = @"HPFatalModuleName";

static NSString *const HPAssertFunctionStack = @"HPAssertFunctionStack";

HPAssertFunction HPCurrentAssertFunction = nil;
HPFatalHandler HPCurrentFatalHandler = nil;
HPExceptionHandler HPCurrentExceptionHandler = nil;

/**
 * returns the topmost stacked assert function for the current thread, which
 * may not be the same as the current value of HPCurrentAssertFunction.
 */
static HPAssertFunction HPGetLocalAssertFunction() {
    NSMutableDictionary *threadDictionary = [NSThread currentThread].threadDictionary;
    NSArray<HPAssertFunction> *functionStack = threadDictionary[HPAssertFunctionStack];
    HPAssertFunction assertFunction = functionStack.lastObject;
    if (assertFunction) {
        return assertFunction;
    }
    return HPCurrentAssertFunction;
}

void _HPAssertFormat(const char *condition, const char *fileName, int lineNumber, const char *function, NSString *format, ...) {
    HPAssertFunction assertFunction = HPGetLocalAssertFunction();
    if (assertFunction) {
        va_list args;
        va_start(args, format);
        NSString *message = [[NSString alloc] initWithFormat:format arguments:args];
        va_end(args);
        assertFunction(@(condition), @(fileName), @(lineNumber), @(function), message);
    }
}

void HPFatal(NSError *error, NSDictionary *__nullable userInfo) {
    NSString *failReason = error.localizedFailureReason;
    if (failReason && failReason.length >= 100) {
        failReason = [[failReason substringToIndex:100] stringByAppendingString:@"(...Description Too Long)"];
    }
    NSString *fatalMessage = nil;
    NSString *moduleDescription = [NSString stringWithFormat:@"Module:%@", error.userInfo[HPFatalModuleName] ?: @"unknown"];
    if (failReason) {
        fatalMessage = [NSString stringWithFormat:@"%@,%@[Reason]: %@", moduleDescription, error.localizedDescription, failReason];
    } else {
        fatalMessage = [NSString stringWithFormat:@"%@,%@", moduleDescription, error.localizedDescription];
    }
    //void HPLogNativeInternal(HPLogLevel, const char *, int, NSDictionary *, NSString *, ...)

    HPLogNativeInternal(HPLogLevelFatal, NULL, 0, userInfo, @"%@", fatalMessage);

    HPFatalHandler fatalHandler = HPGetFatalHandler();
    if (fatalHandler) {
        fatalHandler(error, userInfo);
    } else {
#ifdef HP_DEBUG
        @try {
            NSString *name = [NSString stringWithFormat:@"%@: %@", HPFatalExceptionName, error.localizedDescription];
            NSString *message = HPFormatError(error.localizedDescription, error.userInfo[HPJSStackTraceKey], 75);
            if (failReason) {
                name = [NSString stringWithFormat:@"%@: %@[Reason]: %@", HPFatalExceptionName, error.localizedDescription, failReason];
            }
            [NSException raise:name format:@"%@", message];
        } @catch (NSException *e) {
        }
#endif  //#ifdef DEBUG
    }
}

void HPHandleException(NSException *exception, NSDictionary *userInfo) {
    HPLogNativeInternal(HPLogLevelFatal, NULL, 0, userInfo, @"%@", exception.description);
    HPExceptionHandler exceptionHandler = HPGetExceptionHandler();
    if (exceptionHandler) {
        exceptionHandler(exception);
    }
}

void HPSetAssertFunction(HPAssertFunction assertFunction) {
    HPCurrentAssertFunction = assertFunction;
}

HPAssertFunction HPGetAssertFunction(void) {
    return HPCurrentAssertFunction;
}

void HPAddAssertFunction(HPAssertFunction assertFunction) {
    HPAssertFunction existing = HPCurrentAssertFunction;
    if (existing) {
        HPCurrentAssertFunction = ^(NSString *condition, NSString *fileName, NSNumber *lineNumber, NSString *function, NSString *message) {
            existing(condition, fileName, lineNumber, function, message);
            assertFunction(condition, fileName, lineNumber, function, message);
        };
    } else {
        HPCurrentAssertFunction = assertFunction;
    }
}

void HPPerformBlockWithAssertFunction(void (^block)(void), HPAssertFunction assertFunction) {
    NSMutableDictionary *threadDictionary = [NSThread currentThread].threadDictionary;
    NSMutableArray<HPAssertFunction> *functionStack = threadDictionary[HPAssertFunctionStack];
    if (!functionStack) {
        functionStack = [NSMutableArray new];
        threadDictionary[HPAssertFunctionStack] = functionStack;
    }
    [functionStack addObject:assertFunction];
    block();
    [functionStack removeLastObject];
}

NSString *HPCurrentThreadName(void) {
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

void HPSetFatalHandler(HPFatalHandler fatalhandler) {
    HPCurrentFatalHandler = fatalhandler;
}

HPFatalHandler HPGetFatalHandler(void) {
    return HPCurrentFatalHandler;
}

void HPSetExceptionHandler(HPExceptionHandler exceptionhandler) {
    HPCurrentExceptionHandler = exceptionhandler;
}

HPExceptionHandler HPGetExceptionHandler(void) {
    return HPCurrentExceptionHandler;
}

NSString *HPFormatError(NSString *message, NSArray<HPDriverStackFrame *> *stackTrace, NSUInteger maxMessageLength) {
    if (maxMessageLength > 0 && message.length > maxMessageLength) {
        message = [[message substringToIndex:maxMessageLength] stringByAppendingString:@"..."];
    }

    NSMutableString *prettyStack = [NSMutableString string];
    if (stackTrace) {
        [prettyStack appendString:@", stack:\n"];

        NSRegularExpression *regex = [NSRegularExpression regularExpressionWithPattern:@"^(\\d+\\.js)$"
                                                                               options:NSRegularExpressionCaseInsensitive
                                                                                 error:NULL];
        for (HPDriverStackFrame *frame in stackTrace) {
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
