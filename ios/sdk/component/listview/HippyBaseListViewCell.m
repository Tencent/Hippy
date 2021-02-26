/*!
* iOS SDK
*
* Tencent is pleased to support the open source community by making
* Hippy available.
*
* Copyright (C) 2019 THL A29 Limited, a Tencent company.
* All rights reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

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
