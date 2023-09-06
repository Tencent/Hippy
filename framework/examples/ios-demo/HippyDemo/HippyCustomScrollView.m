
#import "HippyCustomScrollView.h"
#import <objc/runtime.h>

@class HippyScrollViewAnimator;
@implementation UIScrollView (HippyCustomOffsetAnimation)

static NSString *HippyCustomAnimatorKey = @"QModelOverlayParamsKey";   //定义一个key值

- (void)setAnimator:(HippyScrollViewAnimator *)animator
{
    objc_setAssociatedObject(self, &HippyCustomAnimatorKey, animator, OBJC_ASSOCIATION_RETAIN);
}

- (HippyScrollViewAnimator *)animator
{
    return objc_getAssociatedObject(self, &HippyCustomAnimatorKey);
}

- (void)setContentOffset:(CGPoint)contentOffset
                duration:(NSTimeInterval)duration
              completion:(void(^)(void))block {
    if (!self.animator) {
        self.animator = [[HippyScrollViewAnimator alloc] initWithScrollView:self timingFunction:[HippyScrollTimingFunction new] type:sineInOut];
    }
    __weak __typeof(self) weakSelf = self;
    self.animator.block = ^{
        __strong __typeof(weakSelf) strongSelf = weakSelf;
        dispatch_async(dispatch_get_main_queue(), ^{
            if (strongSelf) {
                strongSelf.animator = nil;
            }
        });
        block();
    };
     
    [self.animator setContentOffset:contentOffset duration:duration];
    block();
}

@end

@implementation HippyScrollTimingFunction
///
/// - Parameters:
///   - t: time
///   - b: begin
///   - c: change
///   - d: duration
- (CGFloat)compute:(CGFloat)t b:(CGFloat)b c:(CGFloat)c d:(CGFloat)d {
    switch (self.type) {
        case linear:
            return c * t / d + b;
        case quadIn:
            t /= d;
            return c * t * t + b;
        case quadOut:
            t /= d;
            return -c * t * (t - 2) + b;
        case quadInOut:
            t /= d / 2;
            if (t < 1) {
                return c / 2 * t * t + b;
            }
            t -= 1;
            return -c / 2 * (t * (t - 2) - 1) + b;
        case cubicIn:
            t /= d;
            return c * t * t * t + b;
        case cubicOut:
            t = t / d - 1;
            return c * (t * t * t + 1) + b;
        case cubicInOut:
            t /= d / 2;
            if (t < 1) {
                return c / 2 * t * t * t + b;
            }
            t -= 2;
            return c / 2 * (t * t * t + 2) + b;
        case quartIn:
            t /= d;
            return c * t * t * t * t + b;
        case quartOut:
            t = t / d - 1;
            return -c * (t * t * t * t - 1) + b;
        case quartInOut:
            t /= d / 2;
            if (t < 1) {
                return c / 2 * t * t * t * t + b;
            }
            t -= 2;
            return -c / 2 * (t * t * t * t - 2) + b;
        case quintIn:
            t /= d;
            return c * t * t * t * t * t + b;
        case quintOut:
            t = t / d - 1;
            return c * ( t * t * t * t * t + 1) + b;
        case quintInOut:
            t /= d / 2;
            if (t < 1) {
                return c / 2 * t * t * t * t * t + b;
            }
            t -= 2;
            return c / 2 * (t * t * t * t * t + 2) + b;
        case sineIn:
            return -c * cos(t / d * (M_PI / 2)) + c + b;
        case sineOut:
            return c * sin(t / d * (M_PI / 2)) + b;
        case sineInOut:
            return -c / 2 * (cos(M_PI * t / d) - 1) + b;
        case expoIn:
            return (t == 0) ? b : c * pow(2, 10 * (t / d - 1)) + b;
        case expoOut:
            return (t == d) ? b + c : c * (-pow(2, -10 * t / d) + 1) + b;
        case expoInOut:
            if (t == 0) {
                return b;
            }
            if (t == d) {
                return b + c;
            }
            t /= d / 2;
            if (t < 1) {
                return c / 2 * pow(2, 10 * (t - 1)) + b;
            }
            t -= 1;
            return c / 2 * (-pow(2, -10 * t) + 2) + b;
        case circleIn:
            t /= d;
            return -c * (sqrt(1 - t * t) - 1) + b;
        case circleOut:
            t = t / d - 1;
            return c * sqrt(1 - t * t) + b;
        case circleInOut:
            t /= d / 2;
            if (t < 1) {
                return -c / 2 * (sqrt(1 - t * t) - 1) + b;
            }
            t -= 2;
            return c / 2 * (sqrt(1 - t * t) + 1) + b;
    }
}

@end

@interface HippyScrollViewAnimator ()

@property (nonatomic, assign) HippyScrollTimingEnum type;
@property (nonatomic, strong) HippyScrollTimingFunction *timingFunction;
@property (nonatomic, assign) NSTimeInterval startTime;
@property (nonatomic, assign) CGPoint startOffset;
@property (nonatomic, assign) CGPoint destinationOffset;
@property (nonatomic, assign) NSTimeInterval duration;
@property (nonatomic, assign) NSTimeInterval runTime;
@property (nonatomic, strong) CADisplayLink *timer;

@end

@implementation HippyScrollViewAnimator

- (instancetype)initWithScrollView:(UIScrollView *)scrollView
                    timingFunction:(HippyScrollTimingFunction *)timingFunction
                              type:(HippyScrollTimingEnum)type {
    if (self = [super init]) {
        self.scrollView = scrollView;
        self.timingFunction = timingFunction;
        self.type = type;
    }
    return self;
}

- (void)setContentOffset:(CGPoint)contentOffset duration:(NSTimeInterval)duration {
    
    if (!self.scrollView) return;
    
    self.startTime          = [[NSDate date] timeIntervalSince1970];
    self.startOffset        = self.scrollView.contentOffset;
    self.destinationOffset  = contentOffset;
    self.duration           = duration;
    self.runTime            = 0;
    
    if (self.duration <= 0) {
        [self.scrollView setContentOffset:contentOffset animated:NO];
        return;
    }
    if (!self.timer) {
        self.timer = [CADisplayLink displayLinkWithTarget:self selector:@selector(animtedScroll)];
        [self.timer addToRunLoop:[NSRunLoop mainRunLoop] forMode:NSRunLoopCommonModes];
    }
}

- (void)animtedScroll {
    
    if (!self.timer) return;
    if (!self.scrollView) return;
    
    self.runTime += self.timer.duration;
    
    if (self.runTime >= self.duration) {
        [self.scrollView setContentOffset:self.destinationOffset animated:NO];
        [self.timer invalidate];
        self.timer = nil;
        self.block();
        return;
    }
    
    CGPoint offset = self.scrollView.contentOffset;
    offset.x = [self.timingFunction compute:self.runTime b:self.startOffset.x c:self.destinationOffset.x - self.startOffset.x d:self.duration];
    offset.y = [self.timingFunction compute:self.runTime b:self.startOffset.y c:self.destinationOffset.y - self.startOffset.y d:self.duration];
    [self.scrollView setContentOffset:offset animated:NO];
}
 
@end
