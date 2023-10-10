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

#import "HippyRootView.h"
#import "HippyAsserts.h"
#import "HippyView.h"
#import "UIView+Hippy.h"
#import "NativeRenderDefines.h"

#include <objc/runtime.h>

NSNumber *AllocRootViewTag(void) {
    static NSString * const token = @"allocateRootTag";
    @synchronized (token) {
        static NSUInteger rootTag = 0;
        return @(rootTag += 10);
    }
}

@interface HippyRootView () {
    BOOL _contentHasAppeared;
}

@property (readwrite, nonatomic, assign) CGSize intrinsicSize;

@end

@implementation HippyRootView

- (UIViewController *)hippyViewController {
    return _hippyViewController?:[super hippyViewController];
}

- (void)insertHippySubview:(UIView *)subview atIndex:(NSInteger)atIndex {
    [super insertHippySubview:subview atIndex:atIndex];
    if (!_contentHasAppeared) {
        _contentHasAppeared = YES;
        [self contentDidAppear];
        [[NSNotificationCenter defaultCenter] postNotificationName:kRootViewDidAddContent object:nil userInfo:@{
            kRootViewKey: self
        }];
    }
}

- (NSNumber *)hippyTag {
    HippyAssertMainQueue();
    if (!super.hippyTag) {
        self.hippyTag = AllocRootViewTag();
    }
    return super.hippyTag;
}

- (void)contentDidAppear {
}

- (void)dealloc
{
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    HippyLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyRootView dealloc %p", self);
}

@end
