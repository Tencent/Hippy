//
//  HippyListTableView.h
//  HippyDemo
//
//  Created by ozonelmy on 2021/1/6.
//  Copyright © 2021 tencent. All rights reserved.
//

#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@class HippyListTableView;
@protocol HippyListTableViewLayoutProtocol <NSObject>

- (void)tableViewDidLayoutSubviews:(HippyListTableView *)tableView;

@end

@interface HippyListTableView : UITableView

@property (nonatomic, weak) id<HippyListTableViewLayoutProtocol> layoutDelegate;

@end

NS_ASSUME_NONNULL_END
