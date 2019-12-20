//
//  HippyShadowTextView.h
//  Hippy
//
//  Created by mengyanluo on 2018/9/4.
//  Copyright © 2018年 Tencent. All rights reserved.
//

#import "HippyShadowView.h"

@interface HippyShadowTextView : HippyShadowView
@property (nonatomic, copy) NSString *text;
@property (nonatomic, copy) NSString *placeholder;

@property (nonatomic, strong) UIFont *font;
@end
