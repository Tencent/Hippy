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
#import "HippyComponent.h"
#import "HippyViewManager.h"

@class HippyShadowView;
@class UIView;

@interface HippyComponentData : NSObject

@property (nonatomic, readonly) Class managerClass;
/// The viewName
@property (nonatomic, copy, readonly) NSString *name;
/// The corresponding viewManager
@property (nonatomic, weak, readonly) HippyViewManager *manager;

/// Init method
/// - Parameters:
///   - viewManager: the corresponding viewManager
///   - viewName: name
- (instancetype)initWithViewManager:(HippyViewManager *)viewManager viewName:(NSString *)viewName;

/// Create a view with the given HippyTag.
/// - Parameter tag: HippyTag
- (UIView *)createViewWithTag:(NSNumber *)tag;

/// Similar to createViewWithTag, but with initialization props.
/// - Parameters:
///   - tag: hippyTag
///   - props: initial props
- (UIView *)createViewWithTag:(NSNumber *)tag initProps:(NSDictionary *)props;

/// Create a shadowView with a given tag.
/// - Parameter tag: hippyTag
- (HippyShadowView *)createShadowViewWithTag:(NSNumber *)tag;

/// Set props for given view.
/// - Parameters:
///   - props: dictionary object
///   - view: UIView object
- (void)setProps:(NSDictionary<NSString *, id> *)props forView:(id<HippyComponent>)view;

/// Set props for given shadowView.
/// - Parameters:
///   - props: dictionary object
///   - shadowView: shadowView object
- (void)setProps:(NSDictionary<NSString *, id> *)props forShadowView:(HippyShadowView *)shadowView;

- (NSDictionary<NSString *, NSString *> *)eventNameMap;



- (HippyViewManagerUIBlock)uiBlockToAmendWithShadowViewRegistry:(NSDictionary<NSNumber *, HippyShadowView *> *)registry;

@end
