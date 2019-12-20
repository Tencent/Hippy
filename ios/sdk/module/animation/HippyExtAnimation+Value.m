//
//  HPAnimation+Value.m
//  Hippy
//
//  Created by pennyli on 2018/1/25.
//  Copyright © 2018年 pennyli. All rights reserved.
//

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
