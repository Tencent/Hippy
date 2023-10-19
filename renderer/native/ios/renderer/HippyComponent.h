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

#import <CoreGraphics/CoreGraphics.h>
#import <Foundation/Foundation.h>

/**
 * These block types can be used for mapping input event handlers from JS to view
 * properties. Unlike JS method callbacks, these can be called multiple times.
 */
typedef void (^HippyDirectEventBlock)(NSDictionary *body);

/**
 * Logical node in a tree of application components. Both `NativeRenderObject` and
 * `UIView` conforms to this. Allows us to write utilities that reason about
 * trees generally.
 */
@protocol HippyComponent <NSObject>

@property (nonatomic, strong) NSNumber *hippyTag;
@property (nonatomic, strong) NSNumber *rootTag;
@property (nonatomic, copy) NSString *tagName;
@property (nonatomic, copy) NSString *viewName;
@property (nonatomic, copy) NSDictionary *props;
@property (nonatomic, assign) CGRect frame;

@property(nonatomic, readwrite)__kindof id<HippyComponent> parentComponent;

- (NSArray<__kindof id<HippyComponent>> *)subcomponents;

/// <#Description#>
/// - Parameters:
///   - subview: <#subview description#>
///   - atIndex: <#atIndex description#>
- (void)insertHippySubview:(id<HippyComponent>)subview atIndex:(NSInteger)atIndex;

/// <#Description#>
/// - Parameter subview: <#subview description#>
- (void)removeHippySubview:(id<HippyComponent>)subview;

/// <#Description#>
/// - Parameters:
///   - subview: <#subview description#>
///   - atIndex: <#atIndex description#>
- (void)moveHippySubview:(id<HippyComponent>)subview toIndex:(NSInteger)atIndex;

/// <#Description#>
- (void)removeFromHippySuperview;

/// <#Description#>
/// - Parameter frame: <#frame description#>
- (void)hippySetFrame:(CGRect)frame;

/// <#Description#>
/// - Parameter point: <#point description#>
- (NSNumber *)hippyTagAtPoint:(CGPoint)point;

/// View/ShadowView is a root view
- (BOOL)isHippyRootView;


@optional

/// Called each time props have been set.
/// Not all props have to be set - Hippy can set only changed ones.
/// - Parameter changedProps: String names of all set props.
- (void)didSetProps:(NSArray<NSString *> *)changedProps;

/// Called each time subviews have been updated
- (void)didUpdateHippySubviews;

/// TODO: Deprecated
/// This method is called after layout has been performed for all views known
/// to the HippyViewManager. It is only called on UIViews, not shadow views.
- (void)hippyBridgeDidFinishTransaction;

@end


/// Hippy use multiple of 10 as tag of root view
/// - Parameter hippyTag: hippy tag
static inline BOOL HippyIsHippyRootView(NSNumber *hippyTag) {
    return hippyTag.integerValue % 10 == 0;
}
