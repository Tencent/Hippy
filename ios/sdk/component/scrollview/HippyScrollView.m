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

#import "HippyScrollView.h"

#import <UIKit/UIKit.h>

#import "HippyConvert.h"
#import "HippyEventDispatcher.h"
#import "HippyUIManager.h"
#import "HippyUtils.h"
#import "UIView+Private.h"
#import "UIView+Hippy.h"
#import "HippyInvalidating.h"


@interface HippyCustomScrollView : UIScrollView<UIGestureRecognizerDelegate>

@property (nonatomic, assign) BOOL centerContent;

@end


@implementation HippyCustomScrollView

- (instancetype)initWithFrame:(CGRect)frame
{
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

- (UIView *)contentView
{
    return ((HippyScrollView *)self.superview).contentView;
}

/**
 * @return Whether or not the scroll view interaction should be blocked because
 * JS was found to be the responder.
 */
- (BOOL)_shouldDisableScrollInteraction
{
    // Since this may be called on every pan, we need to make sure to only climb
    // the hierarchy on rare occasions.
    UIView *JSResponder = [HippyUIManager JSResponder];
    if (JSResponder && JSResponder != self.superview) {
        BOOL superviewHasResponder = [self isDescendantOfView:JSResponder];
        return superviewHasResponder;
    }
    return NO;
}

- (void)handleCustomPan:(__unused UIPanGestureRecognizer *)sender
{
    if ([self _shouldDisableScrollInteraction] && ![[HippyUIManager JSResponder] isKindOfClass:[HippyScrollView class]]) {
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

- (void)scrollRectToVisible:(__unused CGRect)rect animated:(__unused BOOL)animated
{
    // noop
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
- (BOOL)touchesShouldCancelInContentView:(__unused UIView *)view
{
    //TODO: shouldn't this call super if _shouldDisableScrollInteraction returns NO?
    return ![self _shouldDisableScrollInteraction];
}

/*
 * Automatically centers the content such that if the content is smaller than the
 * ScrollView, we force it to be centered, but when you zoom or the content otherwise
 * becomes larger than the ScrollView, there is no padding around the content but it
 * can still fill the whole view.
 */
- (void)setContentOffset:(CGPoint)contentOffset
{
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
    super.contentOffset = contentOffset;
}

@end

@implementation HippyScrollView
{
    HippyCustomScrollView *_scrollView;
    UIView *_contentView;
    NSTimeInterval _lastScrollDispatchTime;
    BOOL _allowNextScrollNoMatterWhat;
    CGRect _lastClippedToRect;
    NSHashTable *_scrollListeners;
    // The last non-zero value of translationAlongAxis from scrollViewWillEndDragging.
    // Tells if user was scrolling forward or backward and is used to determine a correct
    // snap index when the user stops scrolling with a tap on the scroll view.
    CGFloat _lastNonZeroTranslationAlongAxis;
    __weak HippyRootView *_rootView;
}


- (instancetype)initWithEventDispatcher:(HippyEventDispatcher *)eventDispatcher
{
    HippyAssertParam(eventDispatcher);
    
    if ((self = [super initWithFrame:CGRectZero])) {
        _scrollView = [[HippyCustomScrollView alloc] initWithFrame:CGRectZero];
        _scrollView.delegate = self;
        _scrollView.delaysContentTouches = NO;
        _automaticallyAdjustContentInsets = YES;
        _contentInset = UIEdgeInsetsZero;
        _contentSize = CGSizeZero;
        _lastClippedToRect = CGRectNull;
        
        _scrollEventThrottle = 0.0;
        _lastScrollDispatchTime = 0;

        _scrollListeners = [NSHashTable weakObjectsHashTable];
        
        [self addSubview:_scrollView];
        
    }
    return self;
}

- (void)invalidate
{
    [_scrollListeners removeAllObjects];
}

HIPPY_NOT_IMPLEMENTED(- (instancetype)initWithFrame:(CGRect)frame)
HIPPY_NOT_IMPLEMENTED(- (instancetype)initWithCoder:(NSCoder *)aDecoder)

- (void)setRemoveClippedSubviews:(__unused BOOL)removeClippedSubviews
{
    // Does nothing
}

- (void)insertHippySubview:(UIView *)view atIndex:(NSInteger)atIndex
{
    [super insertHippySubview:view atIndex:atIndex];
    HippyAssert(_contentView == nil, @"HippyScrollView may only contain a single subview");
    _contentView = view;
    [_contentView addObserver: self forKeyPath: @"frame" options: NSKeyValueObservingOptionNew context: nil];
    [view onAttachedToWindow];
    [_scrollView addSubview:view];
}

- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(__unused NSDictionary<NSKeyValueChangeKey,id> *)change context:(__unused void *)context
{
    if ([keyPath isEqualToString: @"frame"]) {
        if (object == _contentView) {
            [self hippyBridgeDidFinishTransaction];
        }
    }
}

- (void)removeHippySubview:(UIView *)subview
{
    [super removeHippySubview:subview];
    HippyAssert(_contentView == subview, @"Attempted to remove non-existent subview");
    [_contentView removeObserver: self forKeyPath: @"frame"];
    _contentView = nil;
}

- (void)didUpdateHippySubviews
{
    // Do nothing, as subviews are managed by `insertHippySubview:atIndex:`
}

- (BOOL)centerContent
{
    return _scrollView.centerContent;
}

- (void)setCenterContent:(BOOL)centerContent
{
    _scrollView.centerContent = centerContent;
}

- (void)setClipsToBounds:(BOOL)clipsToBounds
{
    super.clipsToBounds = clipsToBounds;
    _scrollView.clipsToBounds = clipsToBounds;
}

- (void)dealloc
{
    _scrollView.delegate = nil;
    if (_contentView) {
        [_contentView removeObserver: self forKeyPath: @"frame"];
        _contentView = nil;
    }
}

- (void)layoutSubviews
{
    [super layoutSubviews];
    HippyAssert(self.subviews.count == 1, @"we should only have exactly one subview");
    HippyAssert([self.subviews lastObject] == _scrollView, @"our only subview should be a scrollview");
    
    if (_scrollView.pagingEnabled) {
        //下面计算index,currIndex的计算需要使用scrollview原contentSize除以原frame
        CGRect originFrame = CGRectEqualToRect(CGRectZero, _scrollView.frame) ? self.bounds : _scrollView.frame;
        _scrollView.frame = self.bounds;
        if (CGRectGetWidth(originFrame) > 0) {
            NSInteger currIndex = _scrollView.contentOffset.x / CGRectGetWidth(originFrame);
            //解决HippyScrollView横竖屏切换时 didScrollView没有回调onScroll的问题
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
    
    [self updateClippedSubviews];
}

- (void)updateClippedSubviews
{
    // Find a suitable view to use for clipping
    UIView *clipView = [self hippy_findClipView];
    if (!clipView) {
        return;
    }
    
    static const CGFloat leeway = 1.0;
    
    const CGSize contentSize = _scrollView.contentSize;
    const CGRect bounds = _scrollView.bounds;
    const BOOL scrollsHorizontally = contentSize.width > bounds.size.width;
    const BOOL scrollsVertically = contentSize.height > bounds.size.height;
    
    const BOOL shouldClipAgain =
    CGRectIsNull(_lastClippedToRect) ||
    !CGRectEqualToRect(_lastClippedToRect, bounds) ||
    (scrollsHorizontally && (bounds.size.width < leeway || fabs(_lastClippedToRect.origin.x - bounds.origin.x) >= leeway)) ||
    (scrollsVertically && (bounds.size.height < leeway || fabs(_lastClippedToRect.origin.y - bounds.origin.y) >= leeway));
    
    if (shouldClipAgain) {
        const CGRect clipRect = CGRectInset(clipView.bounds, -leeway, -leeway);
        [self hippy_updateClippedSubviewsWithClipRect:clipRect relativeToView:clipView];
        _lastClippedToRect = bounds;
    }
}

- (void)setContentInset:(UIEdgeInsets)contentInset
{
    if (UIEdgeInsetsEqualToEdgeInsets(contentInset, _contentInset)) {
        return;
    }
    
    CGPoint contentOffset = _scrollView.contentOffset;
    
    _contentInset = contentInset;
    [HippyView autoAdjustInsetsForView:self
                      withScrollView:_scrollView
                        updateOffset:NO];
    
    _scrollView.contentOffset = contentOffset;
}

- (void)scrollToOffset:(CGPoint)offset
{
    [self scrollToOffset:offset animated:YES];
}

- (void)scrollToOffset:(CGPoint)offset animated:(BOOL)animated
{
    if (!CGPointEqualToPoint(_scrollView.contentOffset, offset)) {
        // Ensure at least one scroll event will fire
        _allowNextScrollNoMatterWhat = YES;
        
        [self setTargetOffset:offset];
        [_scrollView setContentOffset:offset animated:animated];
    }
}

- (void)zoomToRect:(CGRect)rect animated:(BOOL)animated
{
    [_scrollView zoomToRect:rect animated:animated];
}

- (void)refreshContentInset
{
    [HippyView autoAdjustInsetsForView:self
                      withScrollView:_scrollView
                        updateOffset:YES];
}

#pragma mark - ScrollView delegate

#define HIPPY_SEND_SCROLL_EVENT(_eventName, _userData) { \
NSString *eventName = NSStringFromSelector(@selector(_eventName)); \
[self sendScrollEventWithName:eventName scrollView:_scrollView userData:_userData]; \
}

#define HIPPY_FORWARD_SCROLL_EVENT(call) \
for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollListeners) { \
if ([scrollViewListener respondsToSelector:_cmd]) { \
[scrollViewListener call]; \
} \
}

- (void)addScrollListener:(NSObject<UIScrollViewDelegate> *)scrollListener
{
    [_scrollListeners addObject:scrollListener];
}

- (void)removeScrollListener:(NSObject<UIScrollViewDelegate> *)scrollListener
{
    [_scrollListeners removeObject:scrollListener];
}

- (UIScrollView *)realScrollView
{
    return _scrollView;
}

- (NSArray *)scrollListeners {
    HippyAssert(NO, @"不应该执行[HippyScrollView scrollListeners]方法");
    return nil;
}

- (NSDictionary *)scrollEventBody
{
    NSDictionary *body = @{
                           @"contentOffset": @{
                                   @"x": @(_scrollView.contentOffset.x),
                                   @"y": @(_scrollView.contentOffset.y)
                                   },
                           @"contentInset": @{
                                   @"top": @(_scrollView.contentInset.top),
                                   @"left": @(_scrollView.contentInset.left),
                                   @"bottom": @(_scrollView.contentInset.bottom),
                                   @"right": @(_scrollView.contentInset.right)
                                   },
                           @"contentSize": @{
                                   @"width": @(_scrollView.contentSize.width),
                                   @"height": @(_scrollView.contentSize.height)
                                   },
                           @"layoutMeasurement": @{
                                   @"width": @(_scrollView.frame.size.width),
                                   @"height": @(_scrollView.frame.size.height)
                                   },
                           @"zoomScale": @(_scrollView.zoomScale ?: 1),
                           };
    
    return body;
}


- (void)scrollViewDidScroll:(UIScrollView *)scrollView
{
    [self updateClippedSubviews];
    
    NSTimeInterval now = CACurrentMediaTime();
    
    /**
     * TODO: this logic looks wrong, and it may be because it is. Currently, if _scrollEventThrottle
     * is set to zero (the default), the "didScroll" event is only sent once per scroll, instead of repeatedly
     * while scrolling as expected. However, if you "fix" that bug, ScrollView will generate repeated
     * warnings, and behave strangely (ListView works fine however), so don't fix it unless you fix that too!
     */
    NSTimeInterval ti = now - _lastScrollDispatchTime;
    BOOL flag = (_scrollEventThrottle > 0 && _scrollEventThrottle < ti);
    if (_allowNextScrollNoMatterWhat || flag) {
        if (self.onScroll) {
            self.onScroll([self scrollEventBody]);
        }
        _lastScrollDispatchTime = now;
        _allowNextScrollNoMatterWhat = NO;
    }
    HIPPY_FORWARD_SCROLL_EVENT(scrollViewDidScroll:scrollView);
}

- (void)scrollViewWillBeginDragging:(UIScrollView *)scrollView
{
    _allowNextScrollNoMatterWhat = YES; // Ensure next scroll event is recorded, regardless of throttle
    if (self.onScrollBeginDrag) {
        self.onScrollBeginDrag([self scrollEventBody]);
    }
    [[self rootView] cancelTouches];
    HIPPY_FORWARD_SCROLL_EVENT(scrollViewWillBeginDragging:scrollView);
}

- (void)scrollViewWillEndDragging:(UIScrollView *)scrollView withVelocity:(CGPoint)velocity targetContentOffset:(inout CGPoint *)targetContentOffset
{
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
        if ([self.snapToAlignment  isEqualToString: @"center"]) {
            alignmentOffset = (frameLength * 0.5f) + (snapToIntervalF * 0.5f);
        } else if ([self.snapToAlignment  isEqualToString: @"end"]) {
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
        CGFloat newTargetContentOffset = ( snapIndex * snapToIntervalF ) - alignmentOffset;
        
        // Set new targetContentOffset
        if (isHorizontal) {
            targetContentOffset->x = newTargetContentOffset;
        } else {
            targetContentOffset->y = newTargetContentOffset;
        }
    }
    
    if (self.onScrollEndDrag) {
        NSDictionary *userData = @{
                                   @"velocity": @{
                                           @"x": @(velocity.x),
                                           @"y": @(velocity.y)
                                           },
                                   @"targetContentOffset": @{
                                           @"x": @(targetContentOffset->x),
                                           @"y": @(targetContentOffset->y)
                                           }
                                   };
        NSMutableDictionary *mutableBody = [NSMutableDictionary dictionaryWithDictionary:[self scrollEventBody]];
        [mutableBody addEntriesFromDictionary:userData];
        self.onScrollEndDrag(mutableBody);
    }
    HIPPY_FORWARD_SCROLL_EVENT(scrollViewWillEndDragging:scrollView withVelocity:velocity targetContentOffset:targetContentOffset);
}

- (void)scrollViewDidEndDragging:(UIScrollView *)scrollView willDecelerate:(BOOL)decelerate
{
    HIPPY_FORWARD_SCROLL_EVENT(scrollViewDidEndDragging:scrollView willDecelerate:decelerate);
}

- (void)scrollViewWillBeginZooming:(UIScrollView *)scrollView withView:(UIView *)view
{
    if (self.onScrollBeginDrag) {
        self.onScrollBeginDrag([self scrollEventBody]);
    }
    HIPPY_FORWARD_SCROLL_EVENT(scrollViewWillBeginZooming:scrollView withView:view);
}

- (void)scrollViewDidZoom:(UIScrollView *)scrollView
{
    if (self.onScroll) {
        self.onScroll([self scrollEventBody]);
    }
    HIPPY_FORWARD_SCROLL_EVENT(scrollViewDidZoom:scrollView);
}

- (void)scrollViewDidEndZooming:(UIScrollView *)scrollView withView:(UIView *)view atScale:(CGFloat)scale
{
    if (self.onScrollEndDrag) {
        self.onScrollEndDrag([self scrollEventBody]);
    }
    HIPPY_FORWARD_SCROLL_EVENT(scrollViewDidEndZooming:scrollView withView:view atScale:scale);
}

- (void)scrollViewWillBeginDecelerating:(UIScrollView *)scrollView
{
    if (self.onMomentumScrollBegin) {
        self.onMomentumScrollBegin([self scrollEventBody]);
    }
    HIPPY_FORWARD_SCROLL_EVENT(scrollViewWillBeginDecelerating: scrollView);
}

- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView
{
    // Fire a final scroll event
    _allowNextScrollNoMatterWhat = YES;
    [self scrollViewDidScroll:scrollView];
    
    if (self.onMomentumScrollEnd) {
        self.onMomentumScrollEnd([self scrollEventBody]);
    }
    // Fire the end deceleration event
    HIPPY_FORWARD_SCROLL_EVENT(scrollViewDidEndDecelerating:scrollView);
}

- (void)scrollViewDidEndScrollingAnimation:(UIScrollView *)scrollView
{
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
    HIPPY_FORWARD_SCROLL_EVENT(scrollViewDidEndScrollingAnimation:scrollView);
}

- (BOOL)scrollViewShouldScrollToTop:(UIScrollView *)scrollView
{
    for (NSObject<UIScrollViewDelegate> *scrollListener in _scrollListeners) {
        if ([scrollListener respondsToSelector:_cmd] &&
            ![scrollListener scrollViewShouldScrollToTop:scrollView]) {
            return NO;
        }
    }
    return YES;
}

- (UIView *)viewForZoomingInScrollView:(__unused UIScrollView *)scrollView
{
    return _contentView;
}

- (HippyRootView *)rootView
{
    if (_rootView) {
        return _rootView;
    }
    
    UIView *view = [self superview];
    
    while (view && ![view isKindOfClass: [HippyRootView class]]) {
        view = [view superview];
    }
    
    if ([view isKindOfClass: [HippyRootView class]]) {
        _rootView = (HippyRootView *)view;
        return _rootView;
    } else
        return nil;
}

- (void)didMoveToSuperview
{
    _rootView = nil;
}

#pragma mark - Setters

- (CGSize)_calculateViewportSize
{
    CGSize viewportSize = self.bounds.size;
    if (_automaticallyAdjustContentInsets) {
        UIEdgeInsets contentInsets = [HippyView contentInsetsForView:self];
        viewportSize = CGSizeMake(self.bounds.size.width - contentInsets.left - contentInsets.right,
                                  self.bounds.size.height - contentInsets.top - contentInsets.bottom);
    }
    return viewportSize;
}

- (CGPoint)calculateOffsetForContentSize:(CGSize)newContentSize
{
    CGPoint oldOffset = _scrollView.contentOffset;
    CGPoint newOffset = oldOffset;
    
    CGSize oldContentSize = _scrollView.contentSize;
    CGSize viewportSize = [self _calculateViewportSize];
    
    BOOL fitsinViewportY = oldContentSize.height <= viewportSize.height && newContentSize.height <= viewportSize.height;
    if (newContentSize.height < oldContentSize.height && !fitsinViewportY) {
        CGFloat offsetHeight = oldOffset.y + viewportSize.height;
        if (oldOffset.y < 0) {
            // overscrolled on top, leave offset alone
        } else if (offsetHeight > oldContentSize.height) {
            // overscrolled on the bottom, preserve overscroll amount
            newOffset.y = MAX(0, oldOffset.y - (oldContentSize.height - newContentSize.height));
        } else if (offsetHeight > newContentSize.height) {
            // offset falls outside of bounds, scroll back to end of list
            newOffset.y = MAX(0, newContentSize.height - viewportSize.height);
        }
    }
    
    BOOL fitsinViewportX = oldContentSize.width <= viewportSize.width && newContentSize.width <= viewportSize.width;
    if (newContentSize.width < oldContentSize.width && !fitsinViewportX) {
        CGFloat offsetHeight = oldOffset.x + viewportSize.width;
        if (oldOffset.x < 0) {
            // overscrolled at the beginning, leave offset alone
        } else if (offsetHeight > oldContentSize.width && newContentSize.width > viewportSize.width) {
            // overscrolled at the end, preserve overscroll amount as much as possible
            newOffset.x = MAX(0, oldOffset.x - (oldContentSize.width - newContentSize.width));
        } else if (offsetHeight > newContentSize.width) {
            // offset falls outside of bounds, scroll back to end
            newOffset.x = MAX(0, newContentSize.width - viewportSize.width);
        }
    }
    
    // all other cases, offset doesn't change
    return newOffset;
}

/**
 * Once you set the `contentSize`, to a nonzero value, it is assumed to be
 * managed by you, and we'll never automatically compute the size for you,
 * unless you manually reset it back to {0, 0}
 */
- (CGSize)contentSize
{
    if (!CGSizeEqualToSize(_contentSize, CGSizeZero)) {
        return _contentSize;
    } else if (!_contentView) {
        return CGSizeZero;
    } else {
        CGSize singleSubviewSize = _contentView.frame.size;
        CGPoint singleSubviewPosition = _contentView.frame.origin;
        return (CGSize){
            singleSubviewSize.width + singleSubviewPosition.x,
            singleSubviewSize.height + singleSubviewPosition.y
        };
    }
}

- (void)hippyBridgeDidFinishTransaction
{
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

// Note: setting several properties of UIScrollView has the effect of
// resetting its contentOffset to {0, 0}. To prevent this, we generate
// setters here that will record the contentOffset beforehand, and
// restore it after the property has been set.

#define HIPPY_SET_AND_PRESERVE_OFFSET(setter, getter, type) \
- (void)setter:(type)value                                \
{                                                         \
CGPoint contentOffset = _scrollView.contentOffset;      \
[_scrollView setter:value];                             \
_scrollView.contentOffset = contentOffset;              \
}                                                         \
- (type)getter                                            \
{                                                         \
return [_scrollView getter];                            \
}

HIPPY_SET_AND_PRESERVE_OFFSET(setAlwaysBounceHorizontal, alwaysBounceHorizontal, BOOL)
HIPPY_SET_AND_PRESERVE_OFFSET(setAlwaysBounceVertical, alwaysBounceVertical, BOOL)
HIPPY_SET_AND_PRESERVE_OFFSET(setBounces, bounces, BOOL)
HIPPY_SET_AND_PRESERVE_OFFSET(setBouncesZoom, bouncesZoom, BOOL)
HIPPY_SET_AND_PRESERVE_OFFSET(setCanCancelContentTouches, canCancelContentTouches, BOOL)
HIPPY_SET_AND_PRESERVE_OFFSET(setDecelerationRate, decelerationRate, CGFloat)
HIPPY_SET_AND_PRESERVE_OFFSET(setDirectionalLockEnabled, isDirectionalLockEnabled, BOOL)
HIPPY_SET_AND_PRESERVE_OFFSET(setIndicatorStyle, indicatorStyle, UIScrollViewIndicatorStyle)
HIPPY_SET_AND_PRESERVE_OFFSET(setKeyboardDismissMode, keyboardDismissMode, UIScrollViewKeyboardDismissMode)
HIPPY_SET_AND_PRESERVE_OFFSET(setMaximumZoomScale, maximumZoomScale, CGFloat)
HIPPY_SET_AND_PRESERVE_OFFSET(setMinimumZoomScale, minimumZoomScale, CGFloat)
HIPPY_SET_AND_PRESERVE_OFFSET(setScrollEnabled, isScrollEnabled, BOOL)
#if !TARGET_OS_TV
HIPPY_SET_AND_PRESERVE_OFFSET(setPagingEnabled, isPagingEnabled, BOOL)
HIPPY_SET_AND_PRESERVE_OFFSET(setScrollsToTop, scrollsToTop, BOOL)
#endif
HIPPY_SET_AND_PRESERVE_OFFSET(setShowsHorizontalScrollIndicator, showsHorizontalScrollIndicator, BOOL)
HIPPY_SET_AND_PRESERVE_OFFSET(setShowsVerticalScrollIndicator, showsVerticalScrollIndicator, BOOL)
HIPPY_SET_AND_PRESERVE_OFFSET(setZoomScale, zoomScale, CGFloat);
HIPPY_SET_AND_PRESERVE_OFFSET(setScrollIndicatorInsets, scrollIndicatorInsets, UIEdgeInsets);

@end
