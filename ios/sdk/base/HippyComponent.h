/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import <CoreGraphics/CoreGraphics.h>

#import <Foundation/Foundation.h>

/**
 * These block types can be used for mapping input event handlers from JS to view
 * properties. Unlike JS method callbacks, these can be called multiple times.
 */
typedef void (^HippyDirectEventBlock)(NSDictionary *body);
typedef void (^HippyBubblingEventBlock)(NSDictionary *body);

/**
 * Logical node in a tree of application components. Both `ShadowView` and
 * `UIView` conforms to this. Allows us to write utilities that reason about
 * trees generally.
 */
@protocol HippyComponent <NSObject>

@property (nonatomic, copy) NSNumber *hippyTag;
@property (nonatomic, copy) NSNumber *rootTag;
@property (nonatomic, copy) NSString *viewName;
@property (nonatomic, copy) NSDictionary *props;
@property (nonatomic, assign) CGRect frame;
@property (nonatomic, weak) id <HippyComponent> parent;

- (void)insertHippySubview:(id<HippyComponent>)subview atIndex:(NSInteger)atIndex;
- (void)removeHippySubview:(id<HippyComponent>)subview;
- (void)hippySetFrame:(CGRect)frame;
- (NSArray<id<HippyComponent>> *)hippySubviews;
- (id<HippyComponent>)hippySuperview;
- (NSNumber *)hippyTagAtPoint:(CGPoint)point;

// View/ShadowView is a root view
- (BOOL)isHippyRootView;

@optional

/**
 * Called each time props have been set.
 * Not all props have to be set - Hippy can set only changed ones.
 * @param changedProps String names of all set props.
 */
- (void)didSetProps:(NSArray<NSString *> *)changedProps;

/**
 * Called each time subviews have been updated
 */
- (void)didUpdateHippySubviews;

// TODO: Deprecate this
// This method is called after layout has been performed for all views known
// to the HippyViewManager. It is only called on UIViews, not shadow views.
- (void)hippyBridgeDidFinishTransaction;

@end

// TODO: this is kinda dumb - let's come up with a
// better way of identifying root Hippy views please!
static inline BOOL HippyIsHippyRootView(NSNumber *hippyTag)
{
    return hippyTag.integerValue % 10 == 0;
}
