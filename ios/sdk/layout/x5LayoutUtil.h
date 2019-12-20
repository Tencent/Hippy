//
//  x5LayoutUtil.h
//  Hippy
//
//  Created by mengyanluo on 2018/7/30.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
//#include <stdio.h>
//#include "MTTNode.h"
//#include "MTTFlex.h"
//void CSSNodeCalculateLayout(const MTTNodeRef node,
//                            const float availableWidth,
//                            const float availableHeight,
//                            const CSSDirection parentDirection);
#ifdef __cplusplus
extern "C"{
#endif
CGFloat x5CeilPixelValue(CGFloat value);
CGFloat x5RoundPixelValue(CGFloat value);
#ifdef __cplusplus
}
#endif
