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

#import "HippyJSStackFrame.h"
#import "HippyLog.h"
#import "HippyUtils.h"

static NSRegularExpression *HippyJSStackFrameRegex() {
    static dispatch_once_t onceToken;
    static NSRegularExpression *_regex;
    dispatch_once(&onceToken, ^{
        NSError *regexError;
        _regex = [NSRegularExpression regularExpressionWithPattern:@"^([^@]+)@(.*):(\\d+):(\\d+)$" options:0 error:&regexError];
        if (regexError) {
            HippyLogError(@"Failed to build regex: %@", [regexError localizedDescription]);
        }
    });
    return _regex;
}

@implementation HippyJSStackFrame

- (instancetype)initWithMethodName:(NSString *)methodName file:(NSString *)file lineNumber:(NSInteger)lineNumber column:(NSInteger)column {
    if (self = [super init]) {
        _methodName = methodName;
        _file = file;
        _lineNumber = lineNumber;
        _column = column;
    }
    return self;
}

- (NSDictionary *)toDictionary {
    return @{
        @"methodName": HippyNullIfNil(self.methodName),
        @"file": HippyNullIfNil(self.file),
        @"lineNumber": @(self.lineNumber),
        @"column": @(self.column)
    };
}

+ (instancetype)stackFrameWithLine:(NSString *)line {
    NSTextCheckingResult *match = [HippyJSStackFrameRegex() firstMatchInString:line options:0 range:NSMakeRange(0, line.length)];
    if (!match) {
        return nil;
    }

    NSString *methodName = [line substringWithRange:[match rangeAtIndex:1]];
    NSString *file = [line substringWithRange:[match rangeAtIndex:2]];
    NSString *lineNumber = [line substringWithRange:[match rangeAtIndex:3]];
    NSString *column = [line substringWithRange:[match rangeAtIndex:4]];

    return [[self alloc] initWithMethodName:methodName file:file lineNumber:[lineNumber integerValue] column:[column integerValue]];
}

+ (instancetype)stackFrameWithDictionary:(NSDictionary *)dict {
    return [[self alloc] initWithMethodName:dict[@"methodName"] file:dict[@"file"] lineNumber:[dict[@"lineNumber"] integerValue]
                                     column:[dict[@"column"] integerValue]];
}

+ (NSArray<HippyJSStackFrame *> *)stackFramesWithLines:(NSString *)lines {
    NSMutableArray *stack = [NSMutableArray new];
    for (NSString *line in [lines componentsSeparatedByString:@"\n"]) {
        HippyJSStackFrame *frame = [self stackFrameWithLine:line];
        if (frame) {
            [stack addObject:frame];
        }
    }
    return stack;
}

+ (NSArray<HippyJSStackFrame *> *)stackFramesWithDictionaries:(NSArray<NSDictionary *> *)dicts {
    NSMutableArray *stack = [NSMutableArray new];
    for (NSDictionary *dict in dicts) {
        HippyJSStackFrame *frame = [self stackFrameWithDictionary:dict];
        if (frame) {
            [stack addObject:frame];
        }
    }
    return stack;
}

@end
