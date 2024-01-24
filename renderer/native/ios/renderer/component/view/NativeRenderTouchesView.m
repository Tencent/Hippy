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

#import "NativeRenderTouchesView.h"
#import "UIView+DomEvent.h"
#import "UIView+MountEvent.h"
#import "UIView+Hippy.h"
#import "objc/runtime.h"


@implementation NativeRenderTouchesView


- (void)didMoveToSuperview {
    [super didMoveToSuperview];
    if (self.superview) {
        [self viewDidMountEvent];
    }
    else {
        [self viewDidUnmoundEvent];
    }
}


- (void)setPointerEvents:(HippyPointerEvents)pointerEvents {
    _pointerEvents = pointerEvents;
    self.userInteractionEnabled = (pointerEvents != HippyPointerEventsNone);
    if (pointerEvents == HippyPointerEventsBoxNone) {
        self.accessibilityViewIsModal = NO;
    }
}

- (UIView *)hitTest:(CGPoint)point withEvent:(UIEvent *)event {
    BOOL canReceiveTouchEvents = ([self isUserInteractionEnabled] && ![self isHidden]);
    if (!canReceiveTouchEvents) {
        return nil;
    }

    // `hitSubview` is the topmost subview which was hit. The hit point can
    // be outside the bounds of `view` (e.g., if -clipsToBounds is NO).
    UIView *hitSubview = nil;
    BOOL isPointInside = [self pointInside:point withEvent:event];
    BOOL needsHitSubview = !(_pointerEvents == HippyPointerEventsNone || _pointerEvents == HippyPointerEventsBoxOnly);
    if (needsHitSubview && (![self clipsToBounds] || isPointInside)) {
        // The default behaviour of UIKit is that if a view does not contain a point,
        // then no subviews will be returned from hit testing, even if they contain
        // the hit point. By doing hit testing directly on the subviews, we bypass
        // the strict containment policy (i.e., UIKit guarantees that every ancestor
        // of the hit view will return YES from -pointInside:withEvent:). See:
        //  - https://developer.apple.com/library/ios/qa/qa2013/qa1812.html
        for (UIView *subview in [self.subviews reverseObjectEnumerator]) {
            CGPoint convertedPoint = [subview convertPoint:point fromView:self];
            hitSubview = [subview hitTest:convertedPoint withEvent:event];
            if (hitSubview != nil) {
                break;
            }
        }
    }

    UIView *hitView = (isPointInside ? self : nil);

    switch (_pointerEvents) {
        case HippyPointerEventsNone:
            return nil;
        case HippyPointerEventsUnspecified:
            return hitSubview ?: hitView;
        case HippyPointerEventsBoxOnly:
            return hitView;
        case HippyPointerEventsBoxNone:
            return hitSubview;
        default:
            HippyLogError(@"Invalid pointer-events specified %ld on %@", (long)_pointerEvents, self);
            return hitSubview ?: hitView;
    }
}


@end
