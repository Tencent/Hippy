//
//  UIImageView+Hippy.m
//  Hippy
//
//  Created by jesonwang on 2018/7/6.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "UIImageView+React.h"
#import <objc/runtime.h>
#import "UIView+React.h"
#define HippyEventMethod(name, value, type) \
- (void)set##name:(type)value \
{ \
objc_setAssociatedObject(self, @selector(value), value, OBJC_ASSOCIATION_COPY_NONATOMIC);\
} \
- (type)value \
{ \
return objc_getAssociatedObject(self, _cmd); \
}

@implementation UIImageView (Hippy)

HippyEventMethod(OnClick, onClick, HippyDirectEventBlock)
HippyEventMethod(OnPressIn, onPressIn, HippyDirectEventBlock)
HippyEventMethod(OnPressOut, onPressOut, HippyDirectEventBlock)
HippyEventMethod(OnLongClick, onLongClick, HippyDirectEventBlock)

HippyEventMethod(OnTouchDown, onTouchDown, HippyDirectEventBlock)
HippyEventMethod(OnTouchMove, onTouchMove, HippyDirectEventBlock)
HippyEventMethod(OnTouchCancel, onTouchCancel, HippyDirectEventBlock)
HippyEventMethod(OnTouchEnd, onTouchEnd, HippyDirectEventBlock)
HippyEventMethod(OnAttachedToWindow, onAttachedToWindow, HippyDirectEventBlock)
HippyEventMethod(OnDetachedFromWindow, onDetachedFromWindow, HippyDirectEventBlock)

@end
