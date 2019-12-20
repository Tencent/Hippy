//
//  HippyBaseTextInput.h
//  Hippy
//
//  Created by 万致远 on 2018/9/4.
//  Copyright © 2018年 Tencent. All rights reserved.
//

#import "HippyView.h"

@interface HippyBaseTextInput : HippyView
@property (nonatomic, strong) UIFont *font;
@property (nonatomic, assign) UIEdgeInsets contentInset;
@property (nonatomic, copy) NSString* value;

- (void)focus;
- (void)blur;
- (void)clearText;
- (void)keyboardWillShow:(NSNotification *)aNotification;

@end
