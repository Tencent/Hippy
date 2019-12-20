//
//  HPModalCustomAnimationTransition.m
//  Hippy
//
//  Created by pennyli on 2018/3/26.
//  Copyright © 2018年 pennyli. All rights reserved.
//

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
