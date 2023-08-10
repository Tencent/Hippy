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

#import <Foundation/Foundation.h>
#import "HippyBridge.h"

NS_ASSUME_NONNULL_BEGIN

/// Class that records the binding relationship between
/// target's property and the animation
@interface HippyNextAnimationViewParams : NSObject

/// HippyTag, id of animation target
@property (nonatomic, readonly) NSNumber *hippyTag;

/// RootTag of the target
@property (nonatomic, readonly) NSNumber *rootTag;

/// The original parameters
@property (nonatomic, strong) NSDictionary *originParams;

/// Updated parameters
@property (nonatomic, readonly) NSDictionary *updateParams;

/// Map of Prop-AnimationId
@property (nonatomic, readonly) NSDictionary<NSString *, NSNumber *> *animationIdWithPropDictionary;

/// Init method
/// - Parameters:
///   - params: target props
///   - viewTag: target view's tag
///   - rootTag: rootView's tag
- (instancetype)initWithParams:(NSDictionary *)params
                       viewTag:(NSNumber *)viewTag
                       rootTag:(NSNumber *)rootTag;

/// Parse originParams and get bind relationship
- (void)parse;

/// Get value for prop
/// - Parameter prop: prop key
- (id)valueForProp:(NSString *)prop;

/// Set value for prop
/// - Parameters:
///   - value: id
///   - prop: prop key
- (void)setValue:(id)value forProp:(NSString *)prop;


@end

NS_ASSUME_NONNULL_END
