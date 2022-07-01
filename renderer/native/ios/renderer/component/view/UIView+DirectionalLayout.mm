/*!
 * iOS SDK
 *
 * Tencent is pleased to support the open source community by making
 * NativeRender available.
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
#import "objc/runtime.h"
#import "NativeRenderI18nUtils.h"
#import "UIView+NativeRender.h"

@implementation UIView (DirectionalLayout)

- (void)setLayoutDirection:(HPDirection)direction {
    objc_setAssociatedObject(self, @selector(layoutDirection), @(direction), OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    self.confirmedLayoutDirection = direction;
}

- (HPDirection)layoutDirection {
    NSNumber *number = objc_getAssociatedObject(self, _cmd);
    return (HPDirection)[number intValue];
}

- (void)setConfirmedLayoutDirection:(HPDirection)confirmedDirection {
    objc_setAssociatedObject(self, @selector(confirmedLayoutDirection), @(confirmedDirection), OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (HPDirection)confirmedLayoutDirection {
    NSNumber *number = objc_getAssociatedObject(self, _cmd);
    return (HPDirection)[number intValue];
}

- (BOOL)isLayoutSubviewsRTL {
    BOOL layoutRTL = DirectionRTL == self.confirmedLayoutDirection;
    return layoutRTL;
}

- (void)checkLayoutDirection:(NSMutableSet<UIView *> *)viewsSet direction:(HPDirection *)direction{
    if (DirectionInherit == self.confirmedLayoutDirection) {
        [viewsSet addObject:self];
        [[self hippySuperview] checkLayoutDirection:viewsSet direction:direction];
    }
    else if (direction) {
        *direction = self.confirmedLayoutDirection;
    }
}

- (void)superviewLayoutDirectionChangedTo:(HPDirection)direction {
    if (DirectionInherit == self.layoutDirection) {
        self.confirmedLayoutDirection = [self superview].confirmedLayoutDirection;
        for (UIView *subview in self.hippySubviews) {
            [subview superviewLayoutDirectionChangedTo:self.confirmedLayoutDirection];
        }
    }
}

- (void)applyLayoutDirectionFromParent:(HPDirection)direction {
    for (UIView *subview in self.subviews) {
        [subview applyLayoutDirectionFromParent:direction];
    }
    self.confirmedLayoutDirection = direction;
}

@end
