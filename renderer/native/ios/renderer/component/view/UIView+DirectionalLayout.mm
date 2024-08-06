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

#import "UIView+DirectionalLayout.h"
#import "UIView+Hippy.h"
#import "HippyI18nUtils.h"

#include <objc/runtime.h>

#include "dom/layout_node.h"

@implementation UIView (DirectionalLayout)

- (void)setLayoutDirection:(hippy::Direction)direction {
    objc_setAssociatedObject(self, @selector(layoutDirection), @((int)direction), OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    self.confirmedLayoutDirection = direction;
}

- (hippy::Direction)layoutDirection {
    NSNumber *number = objc_getAssociatedObject(self, _cmd);
    return (hippy::Direction)[number intValue];
}

- (void)setConfirmedLayoutDirection:(hippy::Direction)confirmedDirection {
    objc_setAssociatedObject(self, @selector(confirmedLayoutDirection), @((int)confirmedDirection), OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (hippy::Direction)confirmedLayoutDirection {
    NSNumber *number = objc_getAssociatedObject(self, _cmd);
    return (hippy::Direction)[number intValue];
}

- (BOOL)isLayoutSubviewsRTL {
    BOOL layoutRTL = hippy::Direction::RTL == self.confirmedLayoutDirection;
    return layoutRTL;
}

- (void)checkLayoutDirection:(NSMutableSet<UIView *> *)viewsSet direction:(hippy::Direction *)direction{
    if (hippy::Direction::Inherit == self.confirmedLayoutDirection) {
        [viewsSet addObject:self];
        [(UIView *)[self parent] checkLayoutDirection:viewsSet direction:direction];
    }
    else if (direction) {
        *direction = self.confirmedLayoutDirection;
    }
}

- (void)superviewLayoutDirectionChangedTo:(hippy::Direction)direction {
    if (hippy::Direction::Inherit == self.layoutDirection) {
        self.confirmedLayoutDirection = [self superview].confirmedLayoutDirection;
        for (UIView *subview in self.hippySubviews) {
            [subview superviewLayoutDirectionChangedTo:self.confirmedLayoutDirection];
        }
    }
}

- (void)applyLayoutDirectionFromParent:(hippy::Direction)direction {
    for (UIView *subview in self.subviews) {
        [subview applyLayoutDirectionFromParent:direction];
    }
    self.confirmedLayoutDirection = direction;
}

@end
