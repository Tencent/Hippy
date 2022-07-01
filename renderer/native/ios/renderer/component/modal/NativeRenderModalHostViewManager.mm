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

#import "NativeRenderModalHostViewManager.h"
#import "NativeRenderModalHostViewController.h"
#import "NativeRenderObjectView.h"
#import "NativeRenderUtils.h"
#import "NativeRenderModalTransitioningDelegate.h"

@interface NativeRenderObjectModalHost : NativeRenderObjectView

@end

@implementation NativeRenderObjectModalHost

- (void)setDomManager:(const std::weak_ptr<hippy::DomManager>)domManager {
    [super setDomManager:domManager];
    CGRect frame = { .origin = CGPointZero, .size = NativeRenderScreenSize() };
    [self setLayoutFrame:frame];
}

@end

@implementation NativeRenderModalHostViewManager

NATIVE_RENDER_EXPORT_VIEW_PROPERTY(animationType, NSString)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(transparent, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(darkStatusBarText, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onShow, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onRequestClose, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(supportedOrientations, NSArray)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onOrientationChange, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(primaryKey, NSString)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(hideStatusBar, NSNumber)

- (UIView *)view {
    NativeRenderModalHostView *view = [[NativeRenderModalHostView alloc] init];
    view.delegate = self.transitioningDelegate;
    if (!_hostViews) {
        _hostViews = [NSHashTable weakObjectsHashTable];
    }
    [_hostViews addObject:view];
    return view;
}

- (id<NativeRenderModalHostViewInteractor, UIViewControllerTransitioningDelegate>)transitioningDelegate {
    if (!_transitioningDelegate) {
        _transitioningDelegate = [NativeRenderModalTransitioningDelegate new];
    }
    return _transitioningDelegate;
}

- (NativeRenderObjectView *)nativeRenderObjectView {
    return [NativeRenderObjectModalHost new];
}

@end
