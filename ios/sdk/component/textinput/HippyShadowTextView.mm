//
//  HippyShadowTextView.m
//  Hippy
//
//  Created by mengyanluo on 2018/9/4.
//  Copyright © 2018年 Tencent. All rights reserved.
//

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
            shadowText.font = [UIFont new];
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
