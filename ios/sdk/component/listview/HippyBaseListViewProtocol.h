//
//  HippyBaseListViewProtocol.h
//  QBCommonRNLib
//
//  Created by pennyli on 2018/4/16.
//  Copyright © 2018年 刘海波. All rights reserved.
//

#ifndef HippyBaseListViewProtocol_h
#define HippyBaseListViewProtocol_h

#import "HippyVirtualNode.h"

@protocol HippyBaseListViewProtocol <NSObject>

- (BOOL)flush;

@property (nonatomic, strong) HippyVirtualList *node;

@end


#endif /* HippyBaseListViewProtocol_h */
