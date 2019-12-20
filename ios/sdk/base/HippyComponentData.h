/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import <Foundation/Foundation.h>

#import "HippyComponent.h"
#import "HippyDefines.h"
#import "HippyViewManager.h"
#import "HippyVirtualNode.h"
@class HippyBridge;
@class HippyShadowView;
@class UIView;

@interface HippyComponentData : NSObject

@property (nonatomic, readonly) Class managerClass;
@property (nonatomic, copy, readonly) NSString *name;
@property (nonatomic, weak, readonly) HippyViewManager *manager;

- (instancetype)initWithManagerClass:(Class)managerClass
                              bridge:(HippyBridge *)bridge NS_DESIGNATED_INITIALIZER;

- (UIView *)createViewWithTag:(NSNumber *)tag;

/**
 为了让view在初始化的时候获取属性 mttrn:pennyli
 */
- (UIView *)createViewWithTag:(NSNumber *)tag initProps:(NSDictionary *)props;

- (HippyShadowView *)createShadowViewWithTag:(NSNumber *)tag;
- (void)setProps:(NSDictionary<NSString *, id> *)props forView:(id<HippyComponent>)view;
- (void)setProps:(NSDictionary<NSString *, id> *)props forShadowView:(HippyShadowView *)shadowView;

- (NSDictionary<NSString *, id> *)viewConfig;

- (HippyViewManagerUIBlock)uiBlockToAmendWithShadowViewRegistry:(NSDictionary<NSNumber *, HippyShadowView *> *)registry;

- (HippyVirtualNode *)createVirtualNode:(NSNumber *)tag props:(NSDictionary *)props;

@end
