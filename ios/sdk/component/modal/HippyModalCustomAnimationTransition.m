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

#import "HippyModalCustomAnimationTransition.h"

#define DURATION .2f

@implementation HippyModalCustomAnimationTransition

- (NSTimeInterval)transitionDuration:(__unused id <UIViewControllerContextTransitioning>)transitionContext
{
	return DURATION;
}

- (void)animateTransition:(id <UIViewControllerContextTransitioning>)transitionContext
{
	if (self.isPresent) {
		UIView *toView = [transitionContext viewForKey: UITransitionContextToViewKey];
		CGRect frame = toView.frame;
		frame.origin.y = CGRectGetHeight(frame) * .5;
		toView.frame = frame;
		toView.alpha = 0;
		[UIView animateWithDuration: DURATION animations:^{
			CGRect frame = toView.frame;
			frame.origin.y = 0;
			toView.frame = frame;
			toView.alpha = 1.0;
		} completion:^(__unused BOOL finished) {
			[transitionContext completeTransition:YES];
		}];
	}
	else {
		[UIView animateWithDuration: DURATION animations:^{
			UIView *fromView = [transitionContext viewForKey: UITransitionContextFromViewKey];
			CGRect frame = fromView.frame;
			frame.origin.y = CGRectGetHeight(frame) * .5;
			fromView.frame = frame;
			fromView.alpha = 0;
		} completion:^(__unused BOOL finished) {
			[transitionContext completeTransition:YES];
		}];
	}
}

@end
