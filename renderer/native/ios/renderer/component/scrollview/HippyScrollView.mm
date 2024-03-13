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

#import <UIKit/UIKit.h>
#import "HippyScrollView.h"
#import "UIView+Hippy.h"
#import "UIView+MountEvent.h"
#import "UIView+DirectionalLayout.h"

@implementation HippyCustomScrollView

- (instancetype)initWithFrame:(CGRect)frame {
    if ((self = [super initWithFrame:frame])) {
        [self.panGestureRecognizer addTarget:self action:@selector(handleCustomPan:)];
        if (@available(iOS 11.0, *)) {
            self.contentInsetAdjustmentBehavior = UIScrollViewContentInsetAdjustmentNever;
        } else {
            // Fallback on earlier versions
        }
    }
    return self;
}

- (void)setTransform:(CGAffineTransform)transform {
    [super setTransform:transform];
}

- (UIView *)contentView {
    return ((HippyScrollView *)self.superview).contentView;
}

/**
 * @return Whether or not the scroll view interaction should be blocked because
 * JS was found to be the responder.
 */
- (BOOL)_shouldDisableScrollInteraction {
    // Since this may be called on every pan, we need to make sure to only climb
    // the hierarchy on rare occasions.
    // FIXME: 此处存在破窗，待修复
    UIView *JSResponder = nil;
    if (JSResponder && JSResponder != self.superview) {
        BOOL superviewHasResponder = [self isDescendantOfView:JSResponder];
        return superviewHasResponder;
    }
    return NO;
}

- (void)handleCustomPan:(__unused UIPanGestureRecognizer *)sender {
    if ([self _shouldDisableScrollInteraction]) {
        self.panGestureRecognizer.enabled = NO;
        self.panGestureRecognizer.enabled = YES;
        // TODO: If mid bounce, animate the scroll view to a non-bounced position
        // while disabling (but only if `stopScrollInteractionIfJSHasResponder` was
        // called *during* a `pan`. Currently, it will just snap into place which
        // is not so bad either.
        // Another approach:
        // self.scrollEnabled = NO;
        // self.scrollEnabled = YES;
    }
}

- (void)scrollRectToVisible:(CGRect)rect animated:(BOOL)animated {
    // Limiting scroll area to an area where we actually have content.
    CGSize contentSize = self.contentSize;
    UIEdgeInsets contentInset = self.contentInset;
    CGSize fullSize = CGSizeMake(contentSize.width + contentInset.left + contentInset.right,
                                 contentSize.height + contentInset.top + contentInset.bottom);
    
    rect = CGRectIntersection((CGRect){CGPointZero, fullSize}, rect);
    if (CGRectIsNull(rect)) {
        return;
    }
    
    [super scrollRectToVisible:rect animated:animated];
}

/**
 * Returning `YES` cancels touches for the "inner" `view` and causes a scroll.
 * Returning `NO` causes touches to be directed to that inner view and prevents
 * the scroll view from scrolling.
 *
 * `YES` -> Allows scrolling.
 * `NO` -> Doesn't allow scrolling.
 *
 * By default this returns NO for all views that are UIControls and YES for
 * everything else. What that does is allows scroll views to scroll even when a
 * touch started inside of a `UIControl` (`UIButton` etc). For Hippy scroll
 * views, we want the default to be the same behavior as `UIControl`s so we
 * return `YES` by default. But there's one case where we want to block the
 * scrolling no matter what: When JS believes it has its own responder lock on
 * a view that is *above* the scroll view in the hierarchy. So we abuse this
 * `touchesShouldCancelInContentView` API in order to stop the scroll view from
 * scrolling in this case.
 *
 * We are not aware of *any* other solution to the problem because alternative
 * approaches require that we disable the scrollview *before* touches begin or
 * move. This approach (`touchesShouldCancelInContentView`) works even if the
 * JS responder is set after touches start/move because
 * `touchesShouldCancelInContentView` is called as soon as the scroll view has
 * been touched and dragged *just* far enough to decide to begin the "drag"
 * movement of the scroll interaction. Returning `NO`, will cause the drag
 * operation to fail.
 *
 * `touchesShouldCancelInContentView` will stop the *initialization* of a
 * scroll pan gesture and most of the time this is sufficient. On rare
 * occasion, the scroll gesture would have already initialized right before JS
 * notifies native of the JS responder being set. In order to recover from that
 * timing issue we have a fallback that kills any ongoing pan gesture that
 * occurs when native is notified of a JS responder.
 *
 * Note: Explicitly returning `YES`, instead of relying on the default fixes
 * (at least) one bug where if you have a UIControl inside a UIScrollView and
 * tap on the UIControl and then start dragging (to scroll), it won't scroll.
 * Chat with andras for more details.
 *
 * In order to have this called, you must have delaysContentTouches set to NO
 * (which is the not the `UIKit` default).
 */
- (BOOL)touchesShouldCancelInContentView:(__unused UIView *)view {
    // UIKit default returns YES if view isn't a UIControl
    // According to the above explanation, we explicitly returning `YES` when need scroll.
    return ![self _shouldDisableScrollInteraction];
}

static inline BOOL CGPointIsNull(CGPoint point) {
    return (isnan(point.x) || isnan(point.y));
}

/*
 * Automatically centers the content such that if the content is smaller than the
 * ScrollView, we force it to be centered, but when you zoom or the content otherwise
 * becomes larger than the ScrollView, there is no padding around the content but it
 * can still fill the whole view.
 */
- (void)setContentOffset:(CGPoint)contentOffset {
    UIView *contentView = [self contentView];
    if (contentView && _centerContent) {
        CGSize subviewSize = contentView.frame.size;
        CGSize scrollViewSize = self.bounds.size;
        if (subviewSize.width <= scrollViewSize.width) {
            contentOffset.x = -(scrollViewSize.width - subviewSize.width) / 2.0;
        }
        if (subviewSize.height <= scrollViewSize.height) {
            contentOffset.y = -(scrollViewSize.height - subviewSize.height) / 2.0;
        }
    }
    NSAssert(!CGPointIsNull(contentOffset), @"contentoffset can't be null, check call stack symbols!!!");
    if (CGPointIsNull(contentOffset)) {
        return;
    }
    super.contentOffset = contentOffset;
}

@end

@interface HippyScrollView () {
    HippyCustomScrollView *_scrollView;
    UIView *_contentView;
    NSTimeInterval _lastScrollDispatchTime;
    BOOL _allowNextScrollNoMatterWhat;
    CGRect _lastClippedToRect;
    NSHashTable *_scrollListeners;
    //set by user, not by self
    CGSize _contentSize;
    // The last non-zero value of translationAlongAxis from scrollViewWillEndDragging.
    // Tells if user was scrolling forward or backward and is used to determine a correct
    // snap index when the user stops scrolling with a tap on the scroll view.
    CGFloat _lastNonZeroTranslationAlongAxis;
    NSMutableDictionary *_contentOffsetCache;
    BOOL _didSetContentOffset;
    int _recordedScrollIndicatorSwitchValue[2]; // default -1
}

@end

@implementation HippyScrollView

- (instancetype)initWithFrame:(CGRect)frame {
    if ((self = [super initWithFrame:frame])) {
        _contentSize = CGSizeZero;
        _lastClippedToRect = CGRectNull;

        _scrollEventThrottle = 0.0;
        _lastScrollDispatchTime = 0;
        _recordedScrollIndicatorSwitchValue[0] = -1;
        _recordedScrollIndicatorSwitchValue[1] = -1;

        _scrollListeners = [NSHashTable weakObjectsHashTable];
        _contentOffsetCache = [NSMutableDictionary dictionaryWithCapacity:32];
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(didReceiveMemoryWarning) name:UIApplicationDidReceiveMemoryWarningNotification object:nil];
        _scrollView = [self loadScrollView];
        [self addSubview:_scrollView];
        [self applyLayoutDirectionIfNeeded];
    }
    return self;
}

- (HippyCustomScrollView *)loadScrollView {
    HippyCustomScrollView *scrollview = [[HippyCustomScrollView alloc] initWithFrame:CGRectZero];
    scrollview.delegate = self;
    scrollview.delaysContentTouches = NO;
    return scrollview;
}

- (void)didReceiveMemoryWarning {
    [_contentOffsetCache removeAllObjects];
}

- (void)invalidate {
    [_scrollListeners removeAllObjects];
}

- (void)insertHippySubview:(UIView *)view atIndex:(NSInteger)atIndex {
    if (view == _contentView && 0 == atIndex) {
        return;
    }
    NSAssert(0 == atIndex, @"HippyScrollView only contain one subview at index 0");
    if (_contentView) {
        [self removeHippySubview:_contentView];
    }
    _contentView = view;
    [_contentView addObserver:self forKeyPath:@"frame" options:NSKeyValueObservingOptionNew context:nil];
    _scrollView.contentSize = _contentView.frame.size;
    [view onAttachedToWindow];
    [_scrollView addSubview:view];
    view.parent = self;
    if (_didSetContentOffset) {
        _didSetContentOffset = NO;
        return;
    }
    /**
     * reset its contentOffset when subviews are ready
     */
    NSString *offsetString = [_contentOffsetCache objectForKey:self.hippyTag];
    if (offsetString) {
        CGPoint point = CGPointFromString(offsetString);
        if (CGRectContainsPoint(_contentView.frame, point)) {
            self.scrollView.contentOffset = point;
        }
    }
    else {
        self.scrollView.contentOffset = CGPointZero;
    }
}

- (NSArray<UIView *> *)subcomponents {
    return _contentView ? [NSMutableArray arrayWithObject:_contentView] : nil;
}

- (void)observeValueForKeyPath:(NSString *)keyPath
                      ofObject:(id)object
                        change:(__unused NSDictionary<NSKeyValueChangeKey, id> *)change
                       context:(__unused void *)context {
    if ([keyPath isEqualToString:@"frame"]) {
        if (object == _contentView) {
            [self hippyBridgeDidFinishTransaction];
        }
    }
}

- (void)removeHippySubview:(UIView *)subview {
    [super removeHippySubview:subview];
    NSAssert(_contentView == subview, @"Attempted to remove non-existent subview");
    [_contentView removeObserver:self forKeyPath:@"frame"];
    _contentView.parent = nil;
    _contentView = nil;
}

- (void)didUpdateHippySubviews
{
    // Do nothing, as subviews are managed by `insertHippySubview:atIndex:`
}

- (BOOL)centerContent {
    return _scrollView.centerContent;
}

- (void)setCenterContent:(BOOL)centerContent {
    _scrollView.centerContent = centerContent;
}

- (void)setClipsToBounds:(BOOL)clipsToBounds {
    super.clipsToBounds = clipsToBounds;
    _scrollView.clipsToBounds = clipsToBounds;
}

- (UIEdgeInsets)contentInset {
    return _scrollView.contentInset;
}

- (void)dealloc {
    _scrollView.delegate = nil;
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationDidReceiveMemoryWarningNotification object:nil];
    if (_contentView) {
        [_contentView removeObserver:self forKeyPath:@"frame"];
        _contentView = nil;
    }
}

- (void)layoutSubviews {
    [super layoutSubviews];
    NSAssert(self.subviews.count == 1, @"we should only have exactly one subview");
    NSAssert([self.subviews lastObject] == _scrollView, @"our only subview should be a scrollview");

    if (_scrollView.pagingEnabled) {
        //下面计算index,currIndex的计算需要使用scrollview原contentSize除以原frame
        CGRect originFrame = CGRectEqualToRect(CGRectZero, _scrollView.frame) ? self.bounds : _scrollView.frame;
        _scrollView.frame = self.bounds;
        if (CGRectGetWidth(originFrame) > 0) {
            NSInteger currIndex = _scrollView.contentOffset.x / CGRectGetWidth(originFrame);
            // 解决HippyScrollView横竖屏切换时 didScrollView没有回调onScroll的问题
            _allowNextScrollNoMatterWhat = YES;
            _scrollView.contentOffset = CGPointMake(currIndex * CGRectGetWidth(_scrollView.frame), 0);
        }
    } else {
        //横竖屏切换后如果仍然保持原有的contentOffset可能会造成offset超过contentsize，需要先做个计算避免此情况
        CGPoint originalOffset = _scrollView.contentOffset;
        _scrollView.frame = self.bounds;
        CGRect frame = self.bounds;
        CGSize contentSize = _scrollView.contentSize;
        if (originalOffset.x + frame.size.width > contentSize.width) {
            CGFloat temp = contentSize.width - frame.size.width;
            originalOffset.x = MAX(0, temp);
        }
        if (originalOffset.y + frame.size.height > contentSize.height) {
            CGFloat temp = contentSize.height - frame.size.height;
            originalOffset.y = MAX(0, temp);
        }

        _scrollView.contentOffset = originalOffset;
    }
}

- (void)setContentSize:(CGSize)contentSize {
    _contentSize = contentSize;
    _scrollView.contentSize = contentSize;
}

- (void)scrollToOffset:(CGPoint)offset {
    [self scrollToOffset:offset animated:YES];
}

- (void)scrollToOffset:(CGPoint)offset animated:(BOOL)animated {
    if (!CGPointEqualToPoint(_scrollView.contentOffset, offset)) {
        // Ensure at least one scroll event will fire
        _allowNextScrollNoMatterWhat = YES;

        [self setTargetOffset:offset];
        [_scrollView setContentOffset:offset animated:animated];
    }
}

- (void)zoomToRect:(CGRect)rect animated:(BOOL)animated {
    [_scrollView zoomToRect:rect animated:animated];
}

#pragma mark - ScrollView delegate

- (void)addScrollListener:(NSObject<UIScrollViewDelegate> *)scrollListener {
    [_scrollListeners addObject:scrollListener];
}

- (void)removeScrollListener:(NSObject<UIScrollViewDelegate> *)scrollListener {
    [_scrollListeners removeObject:scrollListener];
}

- (UIScrollView *)realScrollView {
    return _scrollView;
}

- (NSHashTable *)scrollListeners {
    return _scrollListeners;
}

- (NSDictionary *)scrollEventBody {
    NSDictionary *body = @{
        @"contentOffset": @ { @"x": @(_scrollView.contentOffset.x), @"y": @(_scrollView.contentOffset.y) },
        @"contentInset": @ {
            @"top": @(_scrollView.contentInset.top),
            @"left": @(_scrollView.contentInset.left),
            @"bottom": @(_scrollView.contentInset.bottom),
            @"right": @(_scrollView.contentInset.right)
        },
        @"contentSize": @ { @"width": @(_scrollView.contentSize.width), @"height": @(_scrollView.contentSize.height) },
        @"layoutMeasurement": @ { @"width": @(_scrollView.frame.size.width), @"height": @(_scrollView.frame.size.height) },
        @"zoomScale": @(_scrollView.zoomScale ?: 1),
    };

    return body;
}

- (void)scrollViewDidScroll:(UIScrollView *)scrollView {
    NSTimeInterval now = CACurrentMediaTime();
    NSTimeInterval ti = now - _lastScrollDispatchTime;
    BOOL flag = (_scrollEventThrottle > 0 && _scrollEventThrottle < ti);
    if (_allowNextScrollNoMatterWhat || flag) {
        if (self.onScroll) {
            self.onScroll([self scrollEventBody]);
        }
        _lastScrollDispatchTime = now;
        _allowNextScrollNoMatterWhat = NO;
    }
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollListeners) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidScroll:)]) {
            [scrollViewListener scrollViewDidScroll:scrollView];
        }
    }
}

- (void)scrollViewWillBeginDragging:(UIScrollView *)scrollView {
    _allowNextScrollNoMatterWhat = YES;  // Ensure next scroll event is recorded, regardless of throttle
    if (self.onScrollBeginDrag) {
        self.onScrollBeginDrag([self scrollEventBody]);
    }
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollListeners) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewWillBeginDragging:)]) {
            [scrollViewListener scrollViewWillBeginDragging:scrollView];
        }
    }
}

- (void)scrollViewWillEndDragging:(UIScrollView *)scrollView withVelocity:(CGPoint)velocity targetContentOffset:(inout CGPoint *)targetContentOffset {
    // snapToInterval
    // An alternative to enablePaging which allows setting custom stopping intervals,
    // smaller than a full page size. Often seen in apps which feature horizonally
    // scrolling items. snapToInterval does not enforce scrolling one interval at a time
    // but guarantees that the scroll will stop at an interval point.
    if (self.snapToInterval) {
        CGFloat snapToIntervalF = (CGFloat)self.snapToInterval;

        // Find which axis to snap
        BOOL isHorizontal = (scrollView.contentSize.width > self.frame.size.width);

        // What is the current offset?
        CGFloat targetContentOffsetAlongAxis = isHorizontal ? targetContentOffset->x : targetContentOffset->y;

        // Which direction is the scroll travelling?
        CGPoint translation = [scrollView.panGestureRecognizer translationInView:scrollView];
        CGFloat translationAlongAxis = isHorizontal ? translation.x : translation.y;

        // Offset based on desired alignment
        CGFloat frameLength = isHorizontal ? self.frame.size.width : self.frame.size.height;
        CGFloat alignmentOffset = 0.0f;
        if ([self.snapToAlignment isEqualToString:@"center"]) {
            alignmentOffset = (frameLength * 0.5f) + (snapToIntervalF * 0.5f);
        } else if ([self.snapToAlignment isEqualToString:@"end"]) {
            alignmentOffset = frameLength;
        }

        // Pick snap point based on direction and proximity
        NSInteger snapIndex = floor((targetContentOffsetAlongAxis + alignmentOffset) / snapToIntervalF);
        BOOL isScrollingForward = translationAlongAxis < 0;
        BOOL wasScrollingForward = translationAlongAxis == 0 && _lastNonZeroTranslationAlongAxis < 0;
        if (isScrollingForward || wasScrollingForward) {
            snapIndex = snapIndex + 1;
        }
        if (translationAlongAxis != 0) {
            _lastNonZeroTranslationAlongAxis = translationAlongAxis;
        }
        CGFloat newTargetContentOffset = (snapIndex * snapToIntervalF) - alignmentOffset;

        // Set new targetContentOffset
        if (isHorizontal) {
            targetContentOffset->x = newTargetContentOffset;
        } else {
            targetContentOffset->y = newTargetContentOffset;
        }
    }

    if (self.onScrollEndDrag) {
        NSDictionary *userData = @{
            @"velocity": @ { @"x": @(velocity.x), @"y": @(velocity.y) },
            @"targetContentOffset": @ { @"x": @(targetContentOffset->x), @"y": @(targetContentOffset->y) }
        };
        NSMutableDictionary *mutableBody = [NSMutableDictionary dictionaryWithDictionary:[self scrollEventBody]];
        [mutableBody addEntriesFromDictionary:userData];
        self.onScrollEndDrag(mutableBody);
    }
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollListeners) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewWillEndDragging:withVelocity:targetContentOffset:)]) {
            [scrollViewListener scrollViewWillEndDragging:scrollView withVelocity:velocity targetContentOffset:targetContentOffset];
        }
    }
}

- (void)scrollViewDidEndDragging:(UIScrollView *)scrollView willDecelerate:(BOOL)decelerate {
    if (!decelerate) {
        // Fire a final scroll event
        _allowNextScrollNoMatterWhat = YES;
        [self scrollViewDidScroll:scrollView];
    }
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollListeners) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidEndDragging:willDecelerate:)]) {
            [scrollViewListener scrollViewDidEndDragging:scrollView willDecelerate:decelerate];
        }
    }
}

- (void)scrollViewWillBeginZooming:(UIScrollView *)scrollView withView:(UIView *)view {
    if (self.onScrollBeginDrag) {
        self.onScrollBeginDrag([self scrollEventBody]);
    }
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollListeners) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewWillBeginZooming:withView:)]) {
            [scrollViewListener scrollViewWillBeginZooming:scrollView withView:view];
        }
    }
}

- (void)scrollViewDidZoom:(UIScrollView *)scrollView {
    if (self.onScroll) {
        self.onScroll([self scrollEventBody]);
    }
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollListeners) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidZoom:)]) {
            [scrollViewListener scrollViewDidZoom:scrollView];
        }
    }
}

- (void)scrollViewDidEndZooming:(UIScrollView *)scrollView withView:(UIView *)view atScale:(CGFloat)scale {
    if (self.onScrollEndDrag) {
        self.onScrollEndDrag([self scrollEventBody]);
    }
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollListeners) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidEndZooming:withView:atScale:)]) {
            [scrollViewListener scrollViewDidEndZooming:scrollView withView:view atScale:scale];
        }
    }
}

- (void)scrollViewWillBeginDecelerating:(UIScrollView *)scrollView {
    if (self.onMomentumScrollBegin) {
        self.onMomentumScrollBegin([self scrollEventBody]);
    }
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollListeners) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewWillBeginDecelerating:)]) {
            [scrollViewListener scrollViewWillBeginDecelerating:scrollView];
        }
    }
}

- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView {
    // Fire a final scroll event
    _allowNextScrollNoMatterWhat = YES;
    [self scrollViewDidScroll:scrollView];

    if (self.onMomentumScrollEnd) {
        self.onMomentumScrollEnd([self scrollEventBody]);
    }
    // Fire the end deceleration event
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollListeners) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidEndDecelerating:)]) {
            [scrollViewListener scrollViewDidEndDecelerating:scrollView];
        }
    }
}

- (void)scrollViewDidEndScrollingAnimation:(UIScrollView *)scrollView {
    // Fire a final scroll event
    _allowNextScrollNoMatterWhat = YES;
    [self scrollViewDidScroll:scrollView];

    NSDictionary *event = [self scrollEventBody];

    if (self.onMomentumScrollEnd) {
        self.onMomentumScrollEnd(event);
    }

    if (self.onScrollAnimationEnd) {
        self.onScrollAnimationEnd(event);
    }
    // Fire the end deceleration event
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollListeners) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidEndScrollingAnimation:)]) {
            [scrollViewListener scrollViewDidEndScrollingAnimation:scrollView];
        }
    }
}

- (BOOL)scrollViewShouldScrollToTop:(UIScrollView *)scrollView {
    for (NSObject<UIScrollViewDelegate> *scrollListener in _scrollListeners) {
        if ([scrollListener respondsToSelector:@selector(scrollViewShouldScrollToTop:)] && ![scrollListener scrollViewShouldScrollToTop:scrollView]) {
            return NO;
        }
    }
    return YES;
}

- (UIView *)viewForZoomingInScrollView:(__unused UIScrollView *)scrollView {
    return _contentView;
}

- (void)didMoveToSuperview {
    [super didMoveToSuperview];
}

#pragma mark - Setters
/**
 * we need to cache scroll view's contentOffset.
 * if scroll view is reused in list view cell, we can save its contentOffset in every cells,
 * and set right contentOffset for each cell.
 * resetting hippyTag meas scroll view is in reusing.
 */
- (void)setHippyTag:(NSNumber *)componentTag {
    if (![self.hippyTag isEqualToNumber:componentTag]) {
        if (self.hippyTag) {
            NSString *offsetString = NSStringFromCGPoint(self.scrollView.contentOffset);
            [_contentOffsetCache setObject:offsetString forKey:self.hippyTag];
        }
        [super setHippyTag:componentTag];
    }
}

- (void)setHorizontal:(BOOL)horizontal {
    _horizontal = horizontal;
    [self applyLayoutDirectionIfNeeded];
}

- (CGPoint)calculateOffsetForContentSize:(CGSize)newContentSize {
    CGPoint oldOffset = _scrollView.contentOffset;
    CGSize size = self.frame.size;
    CGPoint candidateOffset = CGPointMake(MAX(newContentSize.width - size.width, 0), MAX(newContentSize.height - size.height, 0));
    CGPoint newOffset = CGPointMake(MIN(oldOffset.x, candidateOffset.x),
                                    MIN(oldOffset.y, candidateOffset.y));
    return newOffset;
}

/**
 * Once you set the `contentSize`, to a nonzero value, it is assumed to be
 * managed by you, and we'll never automatically compute the size for you,
 * unless you manually reset it back to {0, 0}
 */
- (CGSize)contentSize {
    if (CGSizeEqualToSize(_contentSize, CGSizeZero)) {
        return _contentView.frame.size;
    }
    else {
        return _contentSize;
    }
}

- (void)hippyBridgeDidFinishTransaction {
    CGSize contentSize = self.contentSize;
    if (!CGSizeEqualToSize(_scrollView.contentSize, contentSize)) {
        // When contentSize is set manually, ScrollView internals will reset
        // contentOffset to  {0, 0}. Since we potentially set contentSize whenever
        // anything in the ScrollView updates, we workaround this issue by manually
        // adjusting contentOffset whenever this happens
        CGPoint newOffset = [self calculateOffsetForContentSize:contentSize];
        _scrollView.contentSize = contentSize;
        _scrollView.contentOffset = newOffset;
    }
}

- (void)didSetProps:(NSArray<NSString *> *)changedProps {
    if ([changedProps containsObject:@"contentOffset"]) {
        _didSetContentOffset = YES;
    }
}

- (void)applyLayoutDirectionIfNeeded {
    if ([self isLayoutSubviewsRTL]) {
        _scrollView.transform = CGAffineTransformRotate(CGAffineTransformIdentity, M_PI);
        _recordedScrollIndicatorSwitchValue[0] = _scrollView.showsHorizontalScrollIndicator ? 1 : 0;
        _recordedScrollIndicatorSwitchValue[1] = _scrollView.showsVerticalScrollIndicator ? 1 : 0;
        _scrollView.showsVerticalScrollIndicator = NO;
        _scrollView.showsHorizontalScrollIndicator = NO;
        _contentView.transform = CGAffineTransformRotate(CGAffineTransformIdentity, M_PI);
    } else {
        _scrollView.transform = CGAffineTransformIdentity;
        if (_recordedScrollIndicatorSwitchValue[0] > -1) {
            _scrollView.showsHorizontalScrollIndicator = _recordedScrollIndicatorSwitchValue[0];
        }
        if (_recordedScrollIndicatorSwitchValue[1] > -1) {
            _scrollView.showsVerticalScrollIndicator = _recordedScrollIndicatorSwitchValue[1];
        }
        _contentView.transform = CGAffineTransformIdentity;
    }
    [self applyContentViewFrame];
}

- (void)setConfirmedLayoutDirection:(hippy::Direction)confirmedLayoutDirection {
    [super setConfirmedLayoutDirection:confirmedLayoutDirection];
    [self applyLayoutDirectionIfNeeded];
}

- (void)applyContentViewFrame {
    CGRect frame = _contentView.frame;
    CGFloat paddingLeft = 0.f;
    if ([self isLayoutSubviewsRTL]) {
        CGFloat contentViewMaxX = CGRectGetMaxX(frame);
        paddingLeft = self.frame.size.width - contentViewMaxX;
    }
    else {
        paddingLeft = frame.origin.x;
    }
    frame.origin = CGPointMake(paddingLeft, frame.origin.y);
    _contentView.frame = frame;
}

// Note: setting several properties of UIScrollView has the effect of
// resetting its contentOffset to {0, 0}. To prevent this, we generate
// setters here that will record the contentOffset beforehand, and
// restore it after the property has been set.

#define NATIVE_RENDER_SET_AND_PRESERVE_OFFSET(setter, getter, type)     \
    -(void)setter : (type)value {                                       \
        CGPoint contentOffset = _scrollView.contentOffset;              \
        [_scrollView setter:value];                                     \
        _scrollView.contentOffset = contentOffset;                      \
    }                                                                   \
    -(type)getter {                                                     \
        return [_scrollView getter];                                    \
    }

NATIVE_RENDER_SET_AND_PRESERVE_OFFSET(setAlwaysBounceHorizontal, alwaysBounceHorizontal, BOOL)
NATIVE_RENDER_SET_AND_PRESERVE_OFFSET(setAlwaysBounceVertical, alwaysBounceVertical, BOOL)
NATIVE_RENDER_SET_AND_PRESERVE_OFFSET(setBounces, bounces, BOOL)
NATIVE_RENDER_SET_AND_PRESERVE_OFFSET(setBouncesZoom, bouncesZoom, BOOL)
NATIVE_RENDER_SET_AND_PRESERVE_OFFSET(setCanCancelContentTouches, canCancelContentTouches, BOOL)
NATIVE_RENDER_SET_AND_PRESERVE_OFFSET(setDecelerationRate, decelerationRate, CGFloat)
NATIVE_RENDER_SET_AND_PRESERVE_OFFSET(setDirectionalLockEnabled, isDirectionalLockEnabled, BOOL)
NATIVE_RENDER_SET_AND_PRESERVE_OFFSET(setIndicatorStyle, indicatorStyle, UIScrollViewIndicatorStyle)
NATIVE_RENDER_SET_AND_PRESERVE_OFFSET(setKeyboardDismissMode, keyboardDismissMode, UIScrollViewKeyboardDismissMode)
NATIVE_RENDER_SET_AND_PRESERVE_OFFSET(setMaximumZoomScale, maximumZoomScale, CGFloat)
NATIVE_RENDER_SET_AND_PRESERVE_OFFSET(setMinimumZoomScale, minimumZoomScale, CGFloat)
NATIVE_RENDER_SET_AND_PRESERVE_OFFSET(setScrollEnabled, isScrollEnabled, BOOL)
NATIVE_RENDER_SET_AND_PRESERVE_OFFSET(setPagingEnabled, isPagingEnabled, BOOL)
NATIVE_RENDER_SET_AND_PRESERVE_OFFSET(setScrollsToTop, scrollsToTop, BOOL)
NATIVE_RENDER_SET_AND_PRESERVE_OFFSET(setShowsHorizontalScrollIndicator, showsHorizontalScrollIndicator, BOOL)
NATIVE_RENDER_SET_AND_PRESERVE_OFFSET(setShowsVerticalScrollIndicator, showsVerticalScrollIndicator, BOOL)
NATIVE_RENDER_SET_AND_PRESERVE_OFFSET(setZoomScale, zoomScale, CGFloat);
NATIVE_RENDER_SET_AND_PRESERVE_OFFSET(setScrollIndicatorInsets, scrollIndicatorInsets, UIEdgeInsets);

@end
