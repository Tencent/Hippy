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

#import "UIView+AppearEvent.h"
#import "objc/runtime.h"

@implementation UIView (AppearEvent)

- (void)setOnWillAppear:(HippyDirectEventBlock)block {
    objc_setAssociatedObject(self, @selector(onWillAppear), block, OBJC_ASSOCIATION_COPY);
}

- (HippyDirectEventBlock)onWillAppear {
    HippyDirectEventBlock block = objc_getAssociatedObject(self, _cmd);
    return block;
}

- (void)setOnDidAppear:(HippyDirectEventBlock)block {
    objc_setAssociatedObject(self, @selector(onDidAppear), block, OBJC_ASSOCIATION_COPY);
}

- (HippyDirectEventBlock)onDidAppear {
    HippyDirectEventBlock block = objc_getAssociatedObject(self, _cmd);
    return block;
}

- (void)setOnWillDisappear:(HippyDirectEventBlock)block {
    objc_setAssociatedObject(self, @selector(onWillDisappear), block, OBJC_ASSOCIATION_COPY);
}

- (HippyDirectEventBlock)onWillDisappear {
    HippyDirectEventBlock block = objc_getAssociatedObject(self, _cmd);
    return block;
}

- (void)setOnDidDisappear:(HippyDirectEventBlock)block {
    objc_setAssociatedObject(self, @selector(onDidDisappear), block, OBJC_ASSOCIATION_COPY);
}

- (HippyDirectEventBlock)onDidDisappear {
    HippyDirectEventBlock block = objc_getAssociatedObject(self, _cmd);
    return block;
}

- (void)setAppearEventStatus:(AppearEventStatus)appearEventStatus {
    objc_setAssociatedObject(self, @selector(appearEventStatus), @(appearEventStatus), OBJC_ASSOCIATION_COPY);
}

- (AppearEventStatus)appearEventStatus {
    id status = objc_getAssociatedObject(self, _cmd);
    return [status integerValue];
}

- (void)setVisibilityStatus:(ViewVisibilityStatus)visibilityStatus {
    ViewVisibilityStatus status = [self visibilityStatus];
    if (status == visibilityStatus) {
        return;
    }
    if (visibilityStatus == ViewNotVisible) {
        HippyDirectEventBlock didDisappearBlock = [self onDidDisappear];
        if (ViewVisibilityUnknown != status && ViewNotVisible != status && didDisappearBlock) {
            didDisappearBlock(@{});
        }
    } else if (visibilityStatus == ViewHalfVisible) {
        HippyDirectEventBlock willAppearBlock = [self onWillAppear];
        if (ViewHalfVisible != status && ViewCompletelyVisible != status && willAppearBlock) {
            willAppearBlock(@{});
        }
    } else if (visibilityStatus == ViewCompletelyVisible) {
        HippyDirectEventBlock didAppearBlock = [self onDidAppear];
        if (ViewCompletelyVisible != status && didAppearBlock) {
            didAppearBlock(@{});
        }
    }
    objc_setAssociatedObject(self, @selector(visibilityStatus), @(visibilityStatus), OBJC_ASSOCIATION_RETAIN);
}

- (ViewVisibilityStatus)visibilityStatus {
    ViewVisibilityStatus status = [objc_getAssociatedObject(self, _cmd) integerValue];
    return status;
}

- (void)viewAppearEvent {
}

- (void)viewDisappearEvent {
}

- (ViewVisibilityStatus)visibilityStatusInView:(UIView *)view {
    CGRect rect = [self convertRect:self.bounds toView:view];
    if (CGRectContainsRect(view.bounds, rect)) {
        return ViewCompletelyVisible;
    } else if (CGRectIntersectsRect(view.bounds, rect)) {
        return ViewHalfVisible;
    } else {
        return ViewNotVisible;
    }
}

- (void)checkViewsVisibilityStatusAndSendEventIfNeededInView:(UIView *)view {
    ViewVisibilityStatus status = [self visibilityStatusInView:view];
    self.visibilityStatus = status;
    for (UIView *subview in self.subviews) {
        [subview checkViewsVisibilityStatusAndSendEventIfNeededInView:view];
    }
}

@end
