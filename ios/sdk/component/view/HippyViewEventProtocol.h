//
//  HPViewEventProtocol.h
//  Hippy
//
//  Created by pennyli on 2017/12/29.
//  Copyright © 2017年 pennyli. All rights reserved.
//

#ifndef HPViewEventProtocol_h
#define HPViewEventProtocol_h

#import <Foundation/Foundation.h>
#import "HippyComponent.h"

@protocol HippyViewEventProtocol

@property (nonatomic, copy) HippyDirectEventBlock onClick;
@property (nonatomic, copy) HippyDirectEventBlock onLongClick;
@property (nonatomic, copy) HippyDirectEventBlock onPressIn;
@property (nonatomic, copy) HippyDirectEventBlock onPressOut;

@property (nonatomic, copy) HippyDirectEventBlock onTouchDown;
@property (nonatomic, copy) HippyDirectEventBlock onTouchMove;
@property (nonatomic, copy) HippyDirectEventBlock onTouchEnd;
@property (nonatomic, copy) HippyDirectEventBlock onTouchCancel;
@property (nonatomic, copy) HippyDirectEventBlock onAttachedToWindow;
@property (nonatomic, copy) HippyDirectEventBlock onDetachedFromWindow;

@property (nonatomic, assign) BOOL onInterceptTouchEvent;

@end

@protocol HippyViewTouchHandlerProtocol

- (BOOL)interceptTouchEvent;

@end


#endif /* HPViewEventProtocol_h */
