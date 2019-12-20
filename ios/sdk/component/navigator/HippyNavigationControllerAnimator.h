//
//  Created by rainywan
//

#import <UIKit/UIKit.h>

typedef NS_ENUM(NSInteger, HippyNavigatorDirection) {
    HippyNavigatorDirectionTypeRight = 0,
    HippyNavigatorDirectionTypeLeft,
    HippyNavigatorDirectionTypeTop,
    HippyNavigatorDirectionTypeBottom,
};

@interface HippyNavigationControllerAnimator : NSObject <UIViewControllerAnimatedTransitioning>

+ (NSObject <UIViewControllerAnimatedTransitioning> *)animatorWithAction:(UINavigationControllerOperation)action diretion:(HippyNavigatorDirection)direction;
@end
