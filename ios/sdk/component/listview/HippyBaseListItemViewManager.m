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

#import "HippyBaseListItemViewManager.h"
#import "HippyBaseListItemView.h"
#import "HippyVirtualNode.h"

@implementation HippyBaseListItemViewManager
HIPPY_EXPORT_MODULE(ListViewItem)

HIPPY_EXPORT_VIEW_PROPERTY(type, id)
HIPPY_EXPORT_VIEW_PROPERTY(isSticky, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(onAppear, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onDisappear, HippyDirectEventBlock)

- (UIView *)view
{
	return [HippyBaseListItemView new];
}

- (HippyVirtualNode *)node:(NSNumber *)tag name:(NSString *)name props:(NSDictionary *)props
{
	return [HippyVirtualCell createNode: tag viewName: name props: props];
}


@end
