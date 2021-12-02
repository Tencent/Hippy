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

#import "VoltronLog.h"

#include <asl.h>
#import "VoltronDefines.h"

static NSString *const VoltronLogFunctionStack = @"VoltronLogFunctionStack";

const char *VoltronLogLevels[] = {
  "trace",
  "info",
  "warn",
  "error",
  "fatal",
};

#if VOLTRONDEBUG
VoltronLogLevel VoltronDefaultLogThreshold = VoltronLogLevelTrace;
#else
VoltronLogLevel VoltronDefaultLogThreshold = VoltronLogLevelError;
#endif

static VoltronLogFunction VoltronCurrentLogFunction;
static VoltronLogLevel VoltronCurrentLogThreshold = VoltronDefaultLogThreshold;

VoltronLogLevel VoltronGetLogThreshold()
{
  return VoltronCurrentLogThreshold;
}

void VoltronSetLogThreshold(VoltronLogLevel threshold) {
  VoltronCurrentLogThreshold = threshold;
}

VoltronLogFunction VoltronDefaultLogFunction = ^(
  VoltronLogLevel level,
  __unused VoltronLogSource source,
  NSString *fileName,
  NSNumber *lineNumber,
  NSString *message
)
{
  NSString *log = VoltronFormatLog([NSDate date], level, fileName, lineNumber, message);
  fprintf(stderr, "%s\n", log.UTF8String);
  fflush(stderr);

  int aslLevel;
  switch(level) {
    case VoltronLogLevelTrace:
      aslLevel = ASL_LEVEL_DEBUG;
      break;
    case VoltronLogLevelInfo:
      aslLevel = ASL_LEVEL_NOTICE;
      break;
    case VoltronLogLevelWarning:
      aslLevel = ASL_LEVEL_WARNING;
      break;
    case VoltronLogLevelError:
      aslLevel = ASL_LEVEL_ERR;
      break;
    case VoltronLogLevelFatal:
      aslLevel = ASL_LEVEL_CRIT;
      break;
  }
  asl_log(NULL, NULL, aslLevel, "%s", message.UTF8String);
};

void VoltronSetLogFunction(VoltronLogFunction logFunction)
{
  VoltronCurrentLogFunction = logFunction;
}

VoltronLogFunction VoltronGetLogFunction()
{
  if (!VoltronCurrentLogFunction) {
    VoltronCurrentLogFunction = VoltronDefaultLogFunction;
  }
  return VoltronCurrentLogFunction;
}

void VoltronAddLogFunction(VoltronLogFunction logFunction)
{
  VoltronLogFunction existing = VoltronGetLogFunction();
  if (existing) {
    VoltronSetLogFunction(^(VoltronLogLevel level, VoltronLogSource source, NSString *fileName, NSNumber *lineNumber, NSString *message) {
      existing(level, source, fileName, lineNumber, message);
      logFunction(level, source, fileName, lineNumber, message);
    });
  } else {
    VoltronSetLogFunction(logFunction);
  }
}

/**
 * returns the topmost stacked log function for the current thread, which
 * may not be the same as the current value of VoltronCurrentLogFunction.
 */
static VoltronLogFunction VoltronGetLocalLogFunction()
{
  NSMutableDictionary *threadDictionary = [NSThread currentThread].threadDictionary;
  NSArray<VoltronLogFunction> *functionStack = threadDictionary[VoltronLogFunctionStack];
  VoltronLogFunction logFunction = functionStack.lastObject;
  if (logFunction) {
    return logFunction;
  }
  return VoltronGetLogFunction();
}

void VoltronPerformBlockWithLogFunction(void (^block)(void), VoltronLogFunction logFunction)
{
  NSMutableDictionary *threadDictionary = [NSThread currentThread].threadDictionary;
  NSMutableArray<VoltronLogFunction> *functionStack = threadDictionary[VoltronLogFunctionStack];
  if (!functionStack) {
    functionStack = [NSMutableArray new];
    threadDictionary[VoltronLogFunctionStack] = functionStack;
  }
  [functionStack addObject:logFunction];
  block();
  [functionStack removeLastObject];
}

void VoltronPerformBlockWithLogPrefix(void (^block)(void), NSString *prefix)
{
  VoltronLogFunction logFunction = VoltronGetLocalLogFunction();
  if (logFunction) {
    VoltronPerformBlockWithLogFunction(block, ^(VoltronLogLevel level, VoltronLogSource source,
                                            NSString *fileName, NSNumber *lineNumber,
                                            NSString *message) {
      logFunction(level, source, fileName, lineNumber, [prefix stringByAppendingString:message]);
    });
  }
}

NSString *VoltronFormatLog(
  NSDate *timestamp,
  VoltronLogLevel level,
  NSString *fileName,
  NSNumber *lineNumber,
  NSString *message
)
{
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
    [log appendFormat:@"[%s]", VoltronLogLevels[level]];
  }

//  [log appendFormat:@"[tid:%@]", VoltronCurrentThreadName()];

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

void _VoltronLogNativeInternal(VoltronLogLevel level, const char *fileName, int lineNumber, NSString *format, ...)
{
  VoltronLogFunction logFunction = VoltronGetLocalLogFunction();
  BOOL log = VOLTRON_DEBUG || (logFunction != nil);
  if (log && level >= VoltronGetLogThreshold()) {
    // Get message
    va_list args;
    va_start(args, format);
    NSString *message = [[NSString alloc] initWithFormat:format arguments:args];
    va_end(args);

    // Call log function
    if (logFunction) {
      logFunction(level, VoltronLogSourceNative, fileName ? @(fileName) : nil, lineNumber > 0 ? @(lineNumber) : nil, message);
    }

  }
}

void _VoltronLogJavaScriptInternal(VoltronLogLevel level, NSString *message)
{
  VoltronLogFunction logFunction = VoltronGetLocalLogFunction();
  BOOL log = VOLTRON_DEBUG || (logFunction != nil);
  if (log && level >= VoltronGetLogThreshold()) {
    if (logFunction) {
      logFunction(level, VoltronLogSourceJavaScript, nil, nil, message);
    }
  }
}
