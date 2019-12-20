/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "HippyLog.h"

#include <asl.h>

#import "HippyAssert.h"
#import "HippyBridge.h"
#import "HippyBridge+Private.h"
#import "HippyDefines.h"
#import "HippyRedBox.h"
#import "HippyUtils.h"

static NSString *const HippyLogFunctionStack = @"HippyLogFunctionStack";

const char *HippyLogLevels[] = {
  "trace",
  "info",
  "warn",
  "error",
  "fatal",
};

#if HIPPY_DEBUG
HippyLogLevel HippyDefaultLogThreshold = HippyLogLevelTrace;
#else
HippyLogLevel HippyDefaultLogThreshold = HippyLogLevelError;
#endif

static HippyLogFunction HippyCurrentLogFunction;
static HippyLogLevel HippyCurrentLogThreshold = HippyDefaultLogThreshold;

HippyLogLevel HippyGetLogThreshold()
{
  return HippyCurrentLogThreshold;
}

void HippySetLogThreshold(HippyLogLevel threshold) {
  HippyCurrentLogThreshold = threshold;
}

HippyLogFunction HippyDefaultLogFunction = ^(
  HippyLogLevel level,
  __unused HippyLogSource source,
  NSString *fileName,
  NSNumber *lineNumber,
  NSString *message
)
{
  NSString *log = HippyFormatLog([NSDate date], level, fileName, lineNumber, message);
  fprintf(stderr, "%s\n", log.UTF8String);
  fflush(stderr);

  int aslLevel;
  switch(level) {
    case HippyLogLevelTrace:
      aslLevel = ASL_LEVEL_DEBUG;
      break;
    case HippyLogLevelInfo:
      aslLevel = ASL_LEVEL_NOTICE;
      break;
    case HippyLogLevelWarning:
      aslLevel = ASL_LEVEL_WARNING;
      break;
    case HippyLogLevelError:
      aslLevel = ASL_LEVEL_ERR;
      break;
    case HippyLogLevelFatal:
      aslLevel = ASL_LEVEL_CRIT;
      break;
  }
  asl_log(NULL, NULL, aslLevel, "%s", message.UTF8String);
};

void HippySetLogFunction(HippyLogFunction logFunction)
{
  HippyCurrentLogFunction = logFunction;
}

HippyLogFunction HippyGetLogFunction()
{
  if (!HippyCurrentLogFunction) {
    HippyCurrentLogFunction = HippyDefaultLogFunction;
  }
  return HippyCurrentLogFunction;
}

void HippyAddLogFunction(HippyLogFunction logFunction)
{
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
static HippyLogFunction HippyGetLocalLogFunction()
{
  NSMutableDictionary *threadDictionary = [NSThread currentThread].threadDictionary;
  NSArray<HippyLogFunction> *functionStack = threadDictionary[HippyLogFunctionStack];
  HippyLogFunction logFunction = functionStack.lastObject;
  if (logFunction) {
    return logFunction;
  }
  return HippyGetLogFunction();
}

void HippyPerformBlockWithLogFunction(void (^block)(void), HippyLogFunction logFunction)
{
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

void HippyPerformBlockWithLogPrefix(void (^block)(void), NSString *prefix)
{
  HippyLogFunction logFunction = HippyGetLocalLogFunction();
  if (logFunction) {
    HippyPerformBlockWithLogFunction(block, ^(HippyLogLevel level, HippyLogSource source,
                                            NSString *fileName, NSNumber *lineNumber,
                                            NSString *message) {
      logFunction(level, source, fileName, lineNumber, [prefix stringByAppendingString:message]);
    });
  }
}

NSString *HippyFormatLog(
  NSDate *timestamp,
  HippyLogLevel level,
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
    [log appendFormat:@"[%s]", HippyLogLevels[level]];
  }

  [log appendFormat:@"[tid:%@]", HippyCurrentThreadName()];

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

void _HippyLogNativeInternal(HippyLogLevel level, const char *fileName, int lineNumber, NSString *format, ...)
{
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

    // Log to red box in debug mode.
    if ([UIApplication sharedApplication] && level >= HippyLOG_REDBOX_LEVEL) {
      NSArray<NSString *> *stackSymbols = [NSThread callStackSymbols];
      NSMutableArray<NSDictionary *> *stack =
        [NSMutableArray arrayWithCapacity:(stackSymbols.count - 1)];
      [stackSymbols enumerateObjectsUsingBlock:^(NSString *frameSymbols, NSUInteger idx, __unused BOOL *stop) {
        if (idx > 0) { // don't include the current frame
          NSString *address = [[frameSymbols componentsSeparatedByString:@"0x"][1] componentsSeparatedByString:@" "][0];
          NSRange addressRange = [frameSymbols rangeOfString:address];
          NSString *methodName = [frameSymbols substringFromIndex:(addressRange.location + addressRange.length + 1)];
          if (idx == 1 && fileName) {
            NSString *file = [@(fileName) componentsSeparatedByString:@"/"].lastObject;
            [stack addObject:@{@"methodName": methodName, @"file": file, @"lineNumber": @(lineNumber)}];
          } else {
            [stack addObject:@{@"methodName": methodName}];
          }
        }
      }];
      dispatch_async(dispatch_get_main_queue(), ^{
        // red box is thread safe, but by deferring to main queue we avoid a startup
        // race condition that causes the module to be accessed before it has loaded
        [[HippyBridge currentBridge].redBox showErrorMessage:message withStack:stack];
      });
    }

    if (!HippyRunningInTestEnvironment()) {
      // Log to JS executor
      [[HippyBridge currentBridge] logMessage:message level:level ? @(HippyLogLevels[level]) : @"info"];
    }

#endif

  }
}

void _HippyLogJavaScriptInternal(HippyLogLevel level, NSString *message)
{
  HippyLogFunction logFunction = HippyGetLocalLogFunction();
  BOOL log = HIPPY_DEBUG || (logFunction != nil);
  if (log && level >= HippyGetLogThreshold()) {
    if (logFunction) {
      logFunction(level, HippyLogSourceJavaScript, nil, nil, message);
    }
  }
}
