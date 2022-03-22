#import "HippySmartViewPagerViewManager.h"
#import "HippySmartViewPagerView.h"

@implementation HippySmartViewPagerViewManager

HIPPY_EXPORT_VIEW_PROPERTY(scrollEventThrottle, NSTimeInterval)
HIPPY_EXPORT_VIEW_PROPERTY(initialListReady, HippyDirectEventBlock);
HIPPY_EXPORT_VIEW_PROPERTY(onScrollBeginDrag, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onScroll, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onScrollEndDrag, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onMomentumScrollBegin, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onMomentumScrollEnd, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onRowWillDisplay, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(preloadItemNumber, NSUInteger)
HIPPY_EXPORT_VIEW_PROPERTY(initialContentOffset, CGFloat)

HIPPY_EXPORT_VIEW_PROPERTY(pageGap, CGFloat)
HIPPY_EXPORT_VIEW_PROPERTY(previousMargin, CGFloat)
HIPPY_EXPORT_VIEW_PROPERTY(nextMargin, CGFloat)
HIPPY_EXPORT_VIEW_PROPERTY(autoplayTimeInterval, CGFloat)
//HIPPY_EXPORT_VIEW_PROPERTY(circular, BOOL)
//HIPPY_EXPORT_VIEW_PROPERTY(autoplay, BOOL)

- (UIView *)view {
    return [[HippySmartViewPagerView alloc] init];
}

- (HippyShadowView *)shadowView {
    return [[HippyShadowView alloc] init];
}

//// clang-format off
//HIPPY_EXPORT_METHOD(scrollToIndex:(nonnull NSNumber *)hippyTag
//                                    xIndex:(__unused NSNumber *)xIndex
//                                    yIndex:(__unused NSNumber *)yIndex
//                                    animation:(nonnull NSNumber *)animation) {
//    [self.renderContext addUIBlock:
//     ^(__unused id<HippyRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry){
//         HippyBaseListView *view = (HippyBaseListView *)viewRegistry[hippyTag];
//         if (view == nil) return ;
//         if (![view isKindOfClass:[HippyBaseListView class]]) {
//             HippyLogError(@"Invalid view returned from registry, expecting HippyBaseListView, got: %@", view);
//         }
//         [view scrollToIndex: yIndex.integerValue animated: [animation boolValue]];
//     }];
//}
//// clang-format on
//
//// clang-format off
//HIPPY_EXPORT_METHOD(scrollToContentOffset:(nonnull NSNumber *)hippyTag
//                                    x:(nonnull NSNumber *)x
//                                    y:(nonnull NSNumber *)y
//                                    animation:(nonnull NSNumber *)animation) {
//    [self.renderContext addUIBlock:
//     ^(__unused id<HippyRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry){
//         HippyBaseListView *view = (HippyBaseListView *)viewRegistry[hippyTag];
//         if (view == nil) return ;
//         if (![view isKindOfClass:[HippyBaseListView class]]) {
//             HippyLogError(@"Invalid view returned from registry, expecting HippyBaseListView, got: %@", view);
//         }
//         [view scrollToContentOffset:CGPointMake([x floatValue], [y floatValue]) animated: [animation boolValue]];
//     }];
//}
//// clang-format on

@end

