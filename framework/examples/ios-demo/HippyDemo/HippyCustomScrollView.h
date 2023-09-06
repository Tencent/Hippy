
#import <UIKit/UIKit.h>

typedef enum
{
    linear = 0,
    quadIn,
    quadOut,
    quadInOut,
    cubicIn,
    cubicOut,
    cubicInOut,
    quartIn,
    quartOut,
    quartInOut,
    quintIn,
    quintOut,
    quintInOut,
    sineIn,
    sineOut,
    sineInOut,
    expoIn,
    expoOut,
    expoInOut,
    circleIn,
    circleOut,
    circleInOut
} HippyScrollTimingEnum;

NS_ASSUME_NONNULL_BEGIN

@class HippyScrollTimingFunction;
@interface UIScrollView (HippyCustomOffsetAnimation)

- (void)setContentOffset:(CGPoint)contentOffset
                duration:(NSTimeInterval)duration 
              completion:(void(^)(void))block;

@end

@interface HippyScrollTimingFunction : NSObject

@property (nonatomic,assign) HippyScrollTimingEnum type;

@end

@interface HippyScrollViewAnimator : NSObject

@property (nonatomic, weak) UIScrollView *scrollView;
@property (nonatomic, copy) void(^block)(void);

- (void)setContentOffset:(CGPoint)contentOffset duration:(NSTimeInterval)duration;
- (instancetype)initWithScrollView:(UIScrollView *)scrollView
                    timingFunction:(HippyScrollTimingFunction *)timingFunction
                              type:(HippyScrollTimingEnum)type;

@end

NS_ASSUME_NONNULL_END
