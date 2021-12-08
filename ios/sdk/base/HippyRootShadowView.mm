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

#import "HippyRootShadowView.h"
#import "HippyUtils.h"
#include "Hippy.h"
#import "HippyI18nUtils.h"

@implementation HippyRootShadowView

/**
 * Init the HippyRootShadowView with RTL status.
 * Returns a RTL CSS layout if isRTL is true (Default is LTR CSS layout).
 */
- (instancetype)init {
    self = [super init];
    if (self) {
    }
    return self;
}

//- (void)setFrame:(CGRect)frame {
//    if (!CGRectEqualToRect(self.frame, frame)) {
//        [super setFrame:frame];
//        self.hasNewLayout = YES;
//    }
//}

- (void)applySizeConstraints {
    switch (_sizeFlexibility) {
        case HippyRootViewSizeFlexibilityNone:
            break;
        case HippyRootViewSizeFlexibilityWidth:
//            HPNodeStyleSetWidth(self.nodeRef, NAN);
            break;
        case HippyRootViewSizeFlexibilityHeight:
//            HPNodeStyleSetHeight(self.nodeRef, NAN);
            break;
        case HippyRootViewSizeFlexibilityWidthAndHeight:
//            HPNodeStyleSetWidth(self.nodeRef, NAN);
//            HPNodeStyleSetHeight(self.nodeRef, NAN);
            break;
    }
}

- (NSSet<HippyShadowView *> *)collectShadowViewsHaveNewLayoutResultsForRootShadowView {
    [self applySizeConstraints];
    
//    NSWritingDirection direction = [[HippyI18nUtils sharedInstance] writingDirectionForCurrentAppLanguage];
//    HPDirection nodeDirection = (NSWritingDirectionRightToLeft == direction) ? DirectionRTL : DirectionLTR;
//    HPNodeDoLayout(self.nodeRef, NAN, NAN, nodeDirection);
    self.hasNewLayout = YES;
    NSMutableSet<HippyShadowView *> *shadowViewsHaveNewLayoutResults = [NSMutableSet setWithCapacity:256];
//    [self applyLayoutNode:self.nodeRef viewsWithNewFrame:viewsWithNewFrame absolutePosition:CGPointZero];
    [self collectShadowViewsHaveNewLayoutResults:shadowViewsHaveNewLayoutResults];
    return shadowViewsHaveNewLayoutResults;
}

@end
