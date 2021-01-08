//
//  HippyBaseListViewCell.m
//  HippyDemo
//
//  Created by ozonelmy on 2021/1/6.
//  Copyright © 2021 tencent. All rights reserved.
//

#import "HippyBaseListViewCell.h"
#import "HippyVirtualNode.h"

#define CELL_TAG 10101

@interface HippyBaseListViewCell () {
    CellShowState _cellShowState;
    CellShowState _previousShowState;
}

@end

@implementation HippyBaseListViewCell

@synthesize tableView =_tableView;
@synthesize node = _node;

- (instancetype)initWithStyle:(UITableViewCellStyle)style reuseIdentifier:(NSString *)reuseIdentifier
{
    if (self = [super initWithStyle: style reuseIdentifier: reuseIdentifier]) {
        self.backgroundColor = [UIColor clearColor];
        _cellShowState = CellNotShowState;
        _previousShowState = CellNotShowState;
    }
    return self;
}

- (UIView<ViewAppearStateProtocol> *)cellView
{
    return [self.contentView viewWithTag: CELL_TAG];
}

- (void)setCellView:(UIView<ViewAppearStateProtocol> *)cellView
{
    // simulate a hierarchical change in order to invoke -didMoveToWindow of subviews.
    UIView<ViewAppearStateProtocol> *selfCellView = [self cellView];
    [selfCellView removeFromSuperview];
    cellView.tag = CELL_TAG;
    [self.contentView addSubview: cellView];
}

- (void)setCellShowState:(CellShowState)cellShowState {
    if (_cellShowState != cellShowState) {
        if (CellNotShowState == cellShowState) {
            if (CellNotShowState != _cellShowState) {
                [self.cellView cellAppearStateChanged:CellDidDisappearState];
            }
        }
        else if (CellFullShowState == cellShowState) {
            if (CellFullShowState != _cellShowState) {
                [self.cellView cellAppearStateChanged:CellDidAppearState];
            }
        }
        else if (CellHalfShowState == cellShowState) {
            if (CellNotShowState == _cellShowState) {
                [self.cellView cellAppearStateChanged:CellWillAppearState];
            }
            else if (CellFullShowState == _cellShowState) {
                [self.cellView cellAppearStateChanged:CellWillDisappearState];
            }
        }
        _previousShowState = _cellShowState;
        _cellShowState = cellShowState;
    }
}

- (CellShowState)cellShowState {
    return _cellShowState;
}


@end
