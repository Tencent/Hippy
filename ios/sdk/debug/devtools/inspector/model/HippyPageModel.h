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

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@class HippyUIManager;
@interface HippyPageModel : NSObject

/**
 * @brief Get Chrome Page startScreencast JSON
 * @param manager UIManager
 * @param params param objects
 * @param completion completion block
 * @return success or failure
*/
- (BOOL)startScreenCastWithUIManager:(HippyUIManager *)manager
                              params:(NSDictionary *)params
                          completion:(void (^)(NSDictionary *rspObject))completion;

/**
 * @brief Handle Chrome Page stopScreencast
 * @param manager UIManager
 */
- (void)stopScreenCastWithUIManager:(HippyUIManager *)manager;

/**
 * @brief Get Chrome Page screencastFrameAck JSON
 * @param manager UIManager
 * @param params param objects
 * @param completion completion block
 * @return success or failure
 */
- (BOOL)screencastFrameAckWithUIManager:(HippyUIManager *)manager
                                 params:(NSDictionary *)params
                             completion:(void (^)(NSDictionary *rspObject))completion;

@end

NS_ASSUME_NONNULL_END
