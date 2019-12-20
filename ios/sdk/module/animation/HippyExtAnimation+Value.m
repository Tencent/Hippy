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

#import "HippyExtAnimation+Value.h"
#import <objc/runtime.h>

@implementation HippyExtAnimation (Value)

- (void)setFromValue:(id)fromValue
{
	objc_setAssociatedObject(self, @selector(fromValue), fromValue, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (id)fromValue
{
	return objc_getAssociatedObject(self, _cmd);
}

- (void)setToValue:(id)toValue
{
	objc_setAssociatedObject(self, @selector(toValue), toValue, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (id)toValue
{
	return objc_getAssociatedObject(self, _cmd);
}

- (void)setByValue:(id)byValue {
    objc_setAssociatedObject(self, @selector(byValue), byValue, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (id)byValue {
    return objc_getAssociatedObject(self, _cmd);
}

- (void)calcValueWithCenter:(__unused CGPoint)center forProp:(NSString *)prop
{
    double byValue = self.startValue - self.endValue;
	if ([prop isEqualToString: @"top"]) {
//        self.fromValue = @(center.y);
//        self.toValue = @(center.y - (self.startValue - self.endValue));
        self.byValue = @(-byValue);
	} else if ([prop isEqualToString: @"left"]) {
//        self.fromValue = @(center.x);
//        self.toValue = @(center.x - (self.startValue - self.endValue));
        self.byValue = @(-byValue);
	} else if ([prop isEqualToString: @"right"]) {
//        self.fromValue = @(center.x);
//        self.toValue = @(center.x + (self.startValue - self.endValue));
        self.byValue = @(byValue);
	} else if ([prop isEqualToString: @"bottom"]) {
//        self.fromValue = @(center.y);
//        self.toValue = @(center.y + (self.startValue - self.endValue));
        self.byValue = @(byValue);
	}
}
@end
