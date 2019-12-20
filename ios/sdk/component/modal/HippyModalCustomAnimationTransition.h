//
//  HPModalCustomAnimationTransition.h
//  Hippy
//
//  Created by pennyli on 2018/3/26.
//  Copyright © 2018年 pennyli. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface HippyModalCustomAnimationTransition : NSObject <UIViewControllerAnimatedTransitioning>
@property (nonatomic, assign) BOOL isPresent;
@end
