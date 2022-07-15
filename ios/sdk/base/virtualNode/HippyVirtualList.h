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

#import "HippyVirtualNode.h"

@interface HippyVirtualCell: HippyVirtualNode

@property (nonatomic, copy) NSString *itemViewType;
@property (nonatomic, assign) BOOL sticky;
@property (nonatomic, weak) UIView *cell;
@property (nonatomic, weak) HippyVirtualList *listNode;

@end

@interface HippyVirtualList: HippyVirtualNode

/// Indicates whether need reload, default NO
@property (nonatomic, assign, readonly) BOOL isDirty;

/// Indicates whether it can \c not be partially reload
/// Default is NO, means that we can partially reload when dirtyCellIndexes is available
/// YES means that we can not do partially reload (e.g. number of datasources has changed)
@property (nonatomic, assign, readonly) BOOL noPartialReload;
/// Cell indexes that need to be partially reloaded
@property (nonatomic, strong) NSMutableIndexSet *dirtyCellIndexes;

/// Mark the list as dirty (needing to reload)
- (void)markAsDirty;

/// Mark the list as clean
- (void)markAsCleanAfterUIFlush;

@end
