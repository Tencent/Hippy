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

#import "HippyLogging.h"
#include <string>
#include <mutex>
#include "logging.h"

static BOOL getFileNameAndLineNumberFromLogMessage(NSString *message, NSString **fileName, int *lineNumber) {
    //[VERBOSE0:worker_task_runner.cc(84)] WorkerThread create
    static NSString *prefixString = @"[VERBOSE0:";
    @try {
        if ([message hasPrefix:prefixString] && fileName && lineNumber) {
            NSUInteger messageLength = [message length];
            NSUInteger fileNameStartLocation = [prefixString length];
            NSUInteger firstParenthesisPosition = [message rangeOfString:@"(" options:(0) range:NSMakeRange(fileNameStartLocation, messageLength - fileNameStartLocation)].location;
            NSUInteger secondParenthesisPosition = [message rangeOfString:@")" options:(0) range:NSMakeRange(fileNameStartLocation, messageLength - fileNameStartLocation)].location;
            NSString *name = [message substringWithRange:NSMakeRange(fileNameStartLocation, firstParenthesisPosition - fileNameStartLocation)];
            NSString *line = [message substringWithRange:NSMakeRange(firstParenthesisPosition + 1, secondParenthesisPosition - firstParenthesisPosition - 1)];
            *fileName = [name copy];
            *lineNumber = [line intValue];
            return YES;
        }
    } @catch (NSException *exception) {
        return NO;
    }
    return NO;
}

static void registerTDFLogHandler() {
    static std::once_flag flag;
    std::call_once(flag, [](){
        std::function<void (const std::ostringstream &, tdf::base::LogSeverity)> logFunction = [](const std::ostringstream &stream, tdf::base::LogSeverity serverity) {
            std::string string = stream.str();
            if (string.length()) {
                NSString *message = [NSString stringWithUTF8String:string.c_str()];
                NSString *fileName = nil;
                int lineNumber = 0;
                if (getFileNameAndLineNumberFromLogMessage(message, &fileName, &lineNumber)) {
                    _HippyLogNativeInternal(HippyLogLevelInfo, [fileName UTF8String], lineNumber, @"%@", message);
                }
            }
        };
        tdf::base::LogMessage::SetDelegate(logFunction);
    });
}

void HippySetLogMessageFunction(HippyLogFunction logFunction) {
    HippySetLogFunction(logFunction);
    registerTDFLogHandler();
}
