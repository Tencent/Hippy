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

#import "HippyExceptionModule.h"
#import "HippyLog.h"
#import "HippyAssert.h"

@implementation HippyExceptionModule

HIPPY_EXPORT_MODULE(ExceptionModule)

HIPPY_EXPORT_METHOD(handleException:(NSString *)title detail:(NSString *)detail timeInterval:(nonnull NSNumber *)timeInterval resolver:(__unused HippyPromiseResolveBlock)resolve rejecter:(__unused HippyPromiseRejectBlock)reject) {
	
	NSArray *stack = [detail componentsSeparatedByString: @"\n"];
	NSMutableArray *formatStacks = [[NSMutableArray alloc] initWithCapacity: stack.count];
	for(NSString *record in stack) {
		NSArray *components = [record componentsSeparatedByString: @"@"];
		if (components.count == 2) {
			NSString *method = @"unknow";
			NSString *file = @"unknow";
			NSString *line = @"-1";
			NSString *column = @"-1";
			
			method = [components firstObject];
			NSString *elsp = [components lastObject];
			NSArray *elsps = [elsp componentsSeparatedByString: @":"];
			if (elsps.count == 4) {
				file = [NSString stringWithFormat: @"%@:%@", elsps[0], elsps[1]];
				line = elsps[2];
				column = [elsps lastObject];
			}
			[formatStacks addObject: @{@"methodName": method, @"file": file, @"lineNumber": line, @"column": column}];
		}
	}
	NSDictionary *errorInfo = @{
															NSLocalizedDescriptionKey:title?:@"unknown",
                                                            NSLocalizedFailureReasonErrorKey: detail?:@"unkonwn",
															HippyJSStackTraceKey:formatStacks,
															@"HippyTimeIntervalKey":timeInterval ?:@(0),
														};

  NSError *error = [NSError errorWithDomain:HippyErrorDomain code:1 userInfo:errorInfo];
    HippyFatal(error);
}

@end
