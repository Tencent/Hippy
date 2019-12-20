//
//  HippyBaseTextInput.m
//  Hippy
//
//  Created by 万致远 on 2018/9/4.
//  Copyright © 2018年 Tencent. All rights reserved.
//

#import "HippyBaseTextInput.h"

@implementation HippyBaseTextInput
- (void)focus
{
    //base method, should be override
}
- (void)blur
{
    //base method, should be override
}
- (void)clearText
{
    //base method, should be override
}
- (void)keyboardWillShow:(NSNotification *)aNotification
{
    //base method, should be override
}

    
/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect {
    // Drawing code
}
*/

@end
