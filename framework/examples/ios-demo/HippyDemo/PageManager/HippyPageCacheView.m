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

#import "HippyPageCacheView.h"
#import "IconUtils.h"

@interface HippyPageCacheView () {
    UIButton *_addButton;
    UIButton *_deleteButton;
    UITapGestureRecognizer *_tapGesture;
    UIImageView *_snapshotView;
}

@end

@implementation HippyPageCacheView

- (instancetype)initWithFrame:(CGRect)frame {
    self = [super initWithFrame:frame];
    if (self) {
        _tapGesture = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(selfClicked)];
        [self attachButtons];
    }
    return self;
}

- (void)attachButtons {
    static dispatch_once_t onceToken;
    static UIImage *addImage = nil;
    static UIImage *deleteImage = nil;
    dispatch_once(&onceToken, ^{
        addImage = [UIImage imageFromIconName:@"add_page"];
        deleteImage = [UIImage imageFromIconName:@"delete_page"];
    });
    
    _addButton = [UIButton buttonWithType:UIButtonTypeCustom];
    [_addButton setBackgroundImage:addImage forState:UIControlStateNormal];
    [_addButton addTarget:self action:@selector(actionButtonClicked:) forControlEvents:UIControlEventTouchUpInside];
    _addButton.frame = CGRectMake(0, 0, 38, 38);
    [self addSubview:_addButton];
    
    _deleteButton = [UIButton buttonWithType:UIButtonTypeCustom];
    [_deleteButton setBackgroundImage:deleteImage forState:UIControlStateNormal];
    [_deleteButton addTarget:self action:@selector(actionButtonClicked:) forControlEvents:UIControlEventTouchUpInside];
    _deleteButton.frame = CGRectMake(0, 0, 21, 21);
    _deleteButton.hidden = YES;
    [self addSubview:_deleteButton];
    
    _snapshotView = [[UIImageView alloc] initWithFrame:CGRectZero];
    _snapshotView.hidden = YES;
    [self insertSubview:_snapshotView belowSubview:_deleteButton];
}

- (void)setSnapshot:(UIImage *)snapshot {
    if (snapshot) {
        _snapshotView.hidden = NO;
        [_snapshotView setImage:snapshot];
        _addButton.hidden = YES;
        _deleteButton.hidden = NO;
        [self addGestureRecognizer:_tapGesture];
    }
    else {
        _snapshotView.hidden = YES;
        [_snapshotView setImage:nil];
        _addButton.hidden = NO;
        _deleteButton.hidden = YES;
        [self removeGestureRecognizer:_tapGesture];
    }
}

- (void)layoutSubviews {
    [super layoutSubviews];
    
    CGFloat widht = CGRectGetWidth(self.bounds);
    CGFloat height = CGRectGetHeight(self.bounds);
    
    CGRect addButtonFrame = _addButton.frame;
    _addButton.frame = CGRectMake((widht - CGRectGetWidth(addButtonFrame)) / 2.f,
                                  (height - CGRectGetHeight(addButtonFrame)) / 2.f,
                                  CGRectGetWidth(addButtonFrame),
                                  CGRectGetHeight(addButtonFrame));
    
    CGRect deleteButtonFrame = _deleteButton.frame;
    _deleteButton.frame = CGRectMake(widht - CGRectGetWidth(deleteButtonFrame) - 10,
                                     10,
                                     CGRectGetWidth(deleteButtonFrame),
                                     CGRectGetHeight(deleteButtonFrame));
    
    _snapshotView.frame = CGRectMake(0, 0, widht, height);
}

- (void)actionButtonClicked:(UIButton *)button {
    if (_addButton == button && _addAction) {
        _addAction(self);
    }
    else if (_deleteButton == button && _deleteAction) {
        _deleteAction(self);
    }
}

- (void)selfClicked {
    if (_clickAction) {
        _clickAction(self);
    }
}

@end
