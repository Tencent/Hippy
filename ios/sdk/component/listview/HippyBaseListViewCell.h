//
//  HippyBaseListViewCell.h
//  HippyDemo
//
//  Created by ozonelmy on 2021/1/6.
//  Copyright © 2021 tencent. All rights reserved.
//

#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

typedef NS_ENUM(NSUInteger, CellAppearState) {
    CellInitialState,
    CellWillAppearState,
    CellDidAppearState,
    CellWillDisappearState,
    CellDidDisappearState
};

typedef NS_ENUM(NSUInteger, CellShowState) {
    CellNotShowState,
    CellHalfShowState,
    CellFullShowState
};

@protocol ViewAppearStateProtocol <NSObject>

- (void)cellAppearStateChanged:(CellAppearState)state;

@end

@class HippyVirtualCell;

@interface HippyBaseListViewCell : UITableViewCell

@property (nonatomic, weak) UITableView *tableView;
@property (nonatomic, assign) UIView<ViewAppearStateProtocol> *cellView;
@property (nonatomic, weak) HippyVirtualCell *node;

- (void)setCellShowState:(CellShowState)cellShowState NS_REQUIRES_SUPER;
- (CellShowState)cellShowState;

@end

NS_ASSUME_NONNULL_END
