/*!
 * iOS SDK
 *
 * Tencent is pleased to support the open source community by making
 * NativeRender available.
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
typedef void (^NativeRenderDirectEventBlock)(NSDictionary *body);

/**
 * Logical node in a tree of application components. Both `NativeRenderObject` and
 * `UIView` conforms to this. Allows us to write utilities that reason about
 * trees generally.
 */
@protocol NativeRenderComponentProtocol <NSObject>

@property (nonatomic, copy) NSNumber *hippyTag;
@property (nonatomic, copy) NSNumber *rootTag;
@property (nonatomic, copy) NSString *viewName;
@property (nonatomic, copy) NSString *tagName;
@property (nonatomic, copy) NSDictionary *props;
@property (nonatomic, assign) CGRect frame;
@property (nonatomic, weak) id<NativeRenderComponentProtocol> parent;

- (void)insertHippySubview:(id<NativeRenderComponentProtocol>)subview atIndex:(NSInteger)atIndex;
- (void)removeHippySubview:(id<NativeRenderComponentProtocol>)subview;
- (void)removeFromHippySuperview;
- (void)hippySetFrame:(CGRect)frame;
- (NSArray<id<NativeRenderComponentProtocol>> *)hippySubviews;
- (id<NativeRenderComponentProtocol>)hippySuperview;
- (NSNumber *)hippyTagAtPoint:(CGPoint)point;

// View/NativeRenderObjectView is a root view
- (BOOL)isHippyRootView;

@optional

/**
 * Called each time props have been set.
 * Not all props have to be set - NativeRender can set only changed ones.
 * @param changedProps String names of all set props.
 */
- (void)didSetProps:(NSArray<NSString *> *)changedProps;

/**
 * Called each time subviews have been updated
 */
- (void)didUpdateHippySubviews;

- (void)hippyComponentDidFinishTransaction;

@end

// hippy use multiple of 10 as tag of root view
static inline BOOL NativeRenderIsHippyRootView(NSNumber *hippyTag) {
    return hippyTag.integerValue % 10 == 0;
}
