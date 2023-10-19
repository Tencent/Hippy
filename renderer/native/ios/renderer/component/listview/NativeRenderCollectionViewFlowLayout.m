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

#import "NativeRenderCollectionViewFlowLayout.h"

@interface NativeRenderCollectionViewFlowLayoutRTLStack () {
    NSMutableArray<NSNumber *> *_stack;
}

@end

@implementation NativeRenderCollectionViewFlowLayoutRTLStack

+ (NativeRenderCollectionViewFlowLayoutRTLStack *)sharedInstance {
    static dispatch_once_t onceToken;
    static NativeRenderCollectionViewFlowLayoutRTLStack *stack = nil;
    dispatch_once(&onceToken, ^{
        stack = [[NativeRenderCollectionViewFlowLayoutRTLStack alloc] init];
    });
    return stack;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        _stack = [NSMutableArray arrayWithCapacity:8];
    }
    return self;
}

- (NativeRenderCollectionViewFlowLayoutRTLStack *)copy {
    return self;
}

- (void)pushRTLConfig:(BOOL)isRTL {
    [_stack addObject:@(isRTL)];
}

- (BOOL)popRTLConfig {
    NSNumber *value = [_stack firstObject];
    if (value) {
        [_stack removeObject:value];
    }
    return [value boolValue];
}

@end

@implementation NativeRenderCollectionViewFlowLayout

- (BOOL)flipsHorizontallyInOppositeLayoutDirection {
    _layoutDirectionRTL = [[NativeRenderCollectionViewFlowLayoutRTLStack sharedInstance] popRTLConfig];
    return _layoutDirectionRTL;
}

- (UIUserInterfaceLayoutDirection)developmentLayoutDirection {
    return _layoutDirectionRTL ? UIUserInterfaceLayoutDirectionRightToLeft : UIUserInterfaceLayoutDirectionLeftToRight;
}

@end
