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

#import "HippyShadowTextView.h"
#import "MTTLayout.h"
#import "x5LayoutUtil.h"
@interface HippyShadowTextView()
@property (nonatomic, strong) NSDictionary *dicAttributes;
@end

static MTTSize x5MeasureFunc (MTTNodeRef node, float width, MeasureMode widthMeasureMode,
                              __unused float height, __unused MeasureMode heightMeasureMode) {
    HippyShadowTextView *shadowText = (__bridge HippyShadowTextView *)MTTNodeGetContext(node);
    NSString *text = shadowText.text ?: shadowText.placeholder;
    if (nil == shadowText.dicAttributes) {
        if (shadowText.font == nil) {
            shadowText.font = [UIFont systemFontOfSize:16];
        }
        shadowText.dicAttributes = @{NSFontAttributeName: shadowText.font};
    }
    CGSize computedSize = [text sizeWithAttributes:shadowText.dicAttributes];
    MTTSize result;
    result.width = x5CeilPixelValue(computedSize.width);
    result.height = x5CeilPixelValue(computedSize.height);
    return result;
}

@implementation HippyShadowTextView

- (instancetype) init {
    self = [super init];
    if (self) {
        MTTNodeSetMeasureFunc(self.nodeRef, x5MeasureFunc);
    }
    return self;
}

/*
 * text类型控件会响应用户输入交互，但是并不会更新shadowText中的props属性，
 * 导致前端下发新的props属性与当前属性实际值不一致
 * 因此需要对特定属性进行判断.
 * 这个案例中是text属性
 */
- (NSDictionary *)mergeProps:(NSDictionary *)props {
    NSDictionary *newProps = [super mergeProps:props];
    BOOL oldPropsContainsText = [[props allKeys] containsObject:@"text"];
    BOOL newPropsContainsText = [[newProps allKeys] containsObject:@"text"];
    if (!newPropsContainsText && oldPropsContainsText) {
        NSDictionary *textDic = [props dictionaryWithValuesForKeys:@[@"text"]];
        NSMutableDictionary *dic = [NSMutableDictionary dictionaryWithDictionary:newProps];
        [dic addEntriesFromDictionary:textDic];
        newProps = dic;
    }
    return newProps;
}

@end
