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
#import "HippyVirtualNode.h"

NS_ASSUME_NONNULL_BEGIN

HIPPY_EXTERN NSString *const HippyCSSKeyStyleSheetId;

@interface HippyCSSModel : NSObject

/**
 * @brief Get Chrome CSS getMatchedStyles JSON
 * @param node virtual node
 * @param completion complection block
 * @return success or failure
 */
- (BOOL)matchedStyleJSONWithNode:(nullable HippyVirtualNode *)node
                      completion:(void (^)(NSDictionary *rspObject))completion;


/**
 * @brief Get Chrome CSS getComputedStyle JSON
 * @param node virtual node
 * @param completion complection block
 * @return success or failure
 */
- (BOOL)computedStyleJSONWithNode:(nullable HippyVirtualNode *)node
                       completion:(void (^)(NSDictionary *rspObject))completion;

/**
 * @brief Get Chrome CSS getInlineStyles JSON
 * @param node virtual node
 * @param completion complection block
 * @return success or failure
 */
- (BOOL)inlineStyleJSONWithNode:(nullable HippyVirtualNode *)node
                     completion:(void (^)(NSDictionary *rspObject))completion;

/**
 * @brief Get Chrome CSS setStyleText JSON
 * @param manager Hippy UI manager
 * @param editDic edit dictionary
 * @param completion complection block
 * @return success or failure
 */
- (BOOL)styleTextJSONWithUIManager:(HippyUIManager *)manager
                           editDic:(NSDictionary *)editDic
                        completion:(void (^)(NSDictionary *rspObject))completion;

@end

NS_ASSUME_NONNULL_END
