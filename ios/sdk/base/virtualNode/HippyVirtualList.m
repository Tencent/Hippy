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

#import "HippyVirtualList.h"

@implementation HippyVirtualList

- (void)insertHippySubview:(id<HippyComponent>)subview atIndex:(__unused NSInteger)atIndex
{
    self.isDirty = YES;
    [super insertHippySubview: subview atIndex: atIndex];
}

- (void)removeHippySubview:(id<HippyComponent>)subview
{
    self.isDirty = YES;
    [super removeHippySubview: subview];
}

- (UIView *)createView:(HippyCreateViewForShadow)createBlock insertChildrens:(HippyInsertViewForShadow)insertChildrens {
    UIView *view = [super createView:createBlock insertChildrens:insertChildrens];
    self.isDirty = YES;
    return view;
}

@end

@implementation HippyVirtualCell

- (NSString *)description
{
    return [NSString stringWithFormat: @"hippyTag: %@, viewName: %@, props:%@ type: %@ frame:%@", self.hippyTag, self.viewName, self.props, self.itemViewType
                    , NSStringFromCGRect(self.frame)];
}

- (instancetype)initWithTag:(NSNumber *)tag
                   viewName:(NSString *)viewName
                      props:(NSDictionary *)props
{
    if (self = [super initWithTag: tag viewName: viewName props: props]) {
        self.itemViewType = [NSString stringWithFormat: @"%@", props[@"type"]];
        self.sticky = [props[@"sticky"] boolValue];
    }
    return self;
}


- (void)setProps:(NSDictionary *)props
{
    [super setProps: props];
    
    self.itemViewType = [NSString stringWithFormat: @"%@", props[@"type"]];
    self.sticky = [props[@"sticky"] boolValue];
}

- (HippyVirtualList *)listNode {
    HippyVirtualList *list = [self parent];
    while (![list isKindOfClass:[HippyVirtualList class]] && list) {
        list = [list parent];
    }
    return list;
}

- (void)hippySetFrame:(CGRect)frame
{
    if (!CGSizeEqualToSize(self.frame.size, CGSizeZero) && !CGSizeEqualToSize(self.frame.size, frame.size)) {
        self.listNode.isDirty = YES;
    }
    [super hippySetFrame: frame];
}

- (BOOL)createViewLazily {
    return YES;
}

- (BOOL)isLazilyLoadType {
    return YES;
}

@end


