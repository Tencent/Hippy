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

#import "HippyNavigationControllerAnimator.h"

const NSTimeInterval kTrainsitionDurationDefault = 0.4;

const CGPoint leftPageOrigin = { -1, 0 };
const CGPoint rightPageOrigin = { 1, 0 };
const CGPoint topPageOrigin = { 0, -1 };
const CGPoint bottomPageOrigin = { 0, 1 };

@interface HippyNavigationControllerAnimator ()
@property (assign, nonatomic) NativeRenderNavigatorDirection direction;
@property (assign, nonatomic) UINavigationControllerOperation action;

@end

@implementation HippyNavigationControllerAnimator

+ (NSObject<UIViewControllerAnimatedTransitioning> *)animatorWithAction:(UINavigationControllerOperation)action
                                                               diretion:(NativeRenderNavigatorDirection)direction {
    if (action == UINavigationControllerOperationNone) {
        return nil;
    }
    HippyNavigationControllerAnimator *animator = [HippyNavigationControllerAnimator new];
    animator.action = action;
    animator.direction = direction;
    return animator;
}

- (NSTimeInterval)transitionDuration:(id<UIViewControllerContextTransitioning>)transitionContext {
    return kTrainsitionDurationDefault;
}

- (void)animateTransition:(id<UIViewControllerContextTransitioning>)transitionContext {
    UIViewController *toViewController = [transitionContext viewControllerForKey:UITransitionContextToViewControllerKey];
    UIViewController *fromViewController = [transitionContext viewControllerForKey:UITransitionContextFromViewControllerKey];

    if (self.action == UINavigationControllerOperationPush) {
        [[transitionContext containerView] addSubview:fromViewController.view];
        [[transitionContext containerView] addSubview:toViewController.view];

        toViewController.view.frame = [self pageFrameWithDirection:self.direction];
        [UIView animateWithDuration:[self transitionDuration:transitionContext] animations:^{
            toViewController.view.frame = [UIScreen mainScreen].bounds;
        } completion:^(BOOL finished) {
            [transitionContext completeTransition:![transitionContext transitionWasCancelled]];
        }];
    } else if (self.action == UINavigationControllerOperationPop) {
        [[transitionContext containerView] addSubview:toViewController.view];
        [[transitionContext containerView] addSubview:fromViewController.view];

        fromViewController.view.frame = [UIScreen mainScreen].bounds;
        [UIView animateWithDuration:[self transitionDuration:transitionContext] animations:^{
            fromViewController.view.frame = [self pageFrameWithDirection:self.direction];
            ;
        } completion:^(BOOL finished) {
            [transitionContext completeTransition:![transitionContext transitionWasCancelled]];
        }];
    }
}

- (CGRect)pageFrameWithDirection:(NativeRenderNavigatorDirection)direction {
    CGPoint pageOrigin = CGPointZero;
    switch (direction) {
        case NativeRenderNavigatorDirectionTypeLeft:
            pageOrigin.x = leftPageOrigin.x;
            pageOrigin.y = leftPageOrigin.y;
            break;
        case NativeRenderNavigatorDirectionTypeTop:
            pageOrigin.x = topPageOrigin.x;
            pageOrigin.y = topPageOrigin.y;
            break;
        case NativeRenderNavigatorDirectionTypeBottom:
            pageOrigin.x = bottomPageOrigin.x;
            pageOrigin.y = bottomPageOrigin.y;
            break;
        case NativeRenderNavigatorDirectionTypeRight:
        default:
            pageOrigin.x = rightPageOrigin.x;
            pageOrigin.y = rightPageOrigin.y;
            break;
    }
    CGRect kScreen = [UIScreen mainScreen].bounds;
    CGFloat kScreenWidth = kScreen.size.width;
    CGFloat kScreenHeight = kScreen.size.height;
    pageOrigin.x *= kScreenWidth;
    pageOrigin.y *= kScreenHeight;
    CGRect pageFrame = { pageOrigin, kScreen.size };
    return pageFrame;
}

@end
