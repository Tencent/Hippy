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

#import "HippyNextBaseListViewCell.h"

@interface HippyNextBaseListViewCell () {
    CellShowState _cellShowState;
    CellShowState _previousShowState;
}

@end

@implementation HippyNextBaseListViewCell

- (instancetype)initWithFrame:(CGRect)frame {
    self = [super initWithFrame:frame];
    if (self) {
        _cellShowState = CellNotShowState;
        _previousShowState = CellNotShowState;
        self.backgroundColor = [UIColor clearColor];
    }
    return self;
}

- (instancetype)initWithCoder:(NSCoder *)coder {
    self = [super initWithCoder:coder];
    if (self) {
        _cellShowState = CellNotShowState;
        _previousShowState = CellNotShowState;
        self.backgroundColor = [UIColor clearColor];
    }
    return self;
}

- (void)setCellShowState:(CellShowState)cellShowState {
    UIView<ViewAppearStateProtocol> *itemView = (UIView<ViewAppearStateProtocol> *)self.cellView;
    NSAssert(nil == itemView || [itemView conformsToProtocol:@protocol(ViewAppearStateProtocol)],
             @"list view's item view must conform to protocol 'ViewAppearStateProtocol'");
    if (itemView && ![itemView conformsToProtocol:@protocol(ViewAppearStateProtocol)]) {
        return;
    }
    if (_cellShowState != cellShowState) {
        if (CellNotShowState == cellShowState) {
            if (CellNotShowState != _cellShowState) {
                [itemView cellAppearStateChanged:CellDidDisappearState];
            }
        } else if (CellFullShowState == cellShowState) {
            if (CellFullShowState != _cellShowState) {
                [itemView cellAppearStateChanged:CellDidAppearState];
            }
        } else if (CellHalfShowState == cellShowState) {
            if (CellNotShowState == _cellShowState) {
                [itemView cellAppearStateChanged:CellWillAppearState];
            } else if (CellFullShowState == _cellShowState) {
                [itemView cellAppearStateChanged:CellWillDisappearState];
            }
        }
        _previousShowState = _cellShowState;
        _cellShowState = cellShowState;
    }
}

- (CellShowState)cellShowState {
    return _cellShowState;
}

- (void)prepareForReuse {
    [self setCellShowState:CellNotShowState];
    [super prepareForReuse];
}

@end
