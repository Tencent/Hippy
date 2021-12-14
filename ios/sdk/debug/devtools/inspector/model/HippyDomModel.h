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

@class HippyBridge;

@interface HippyDomModel : NSObject

/**
 * @brief Get Chrome DOM getDocument JSON
 * @param rootNode root node
 * @param completion completion block
 * @return sucess or failure
 */
- (BOOL)domGetDocumentJSONWithRootNode:(nullable HippyVirtualNode *)rootNode
                            completion:(void (^)(NSDictionary *rspObject))completion;

/**
 * @brief Get Chrome DOM getBoxModel JSON
 * @param node virtual node
 * @param completion completion block
 * @return sucess or failure
 */
- (BOOL)domGetBoxModelJSONWithNode:(nullable HippyVirtualNode *)node
                        completion:(void (^)(NSDictionary *rspObject))completion;

/**
 * @brief Get Chrome DOM getNodeForLocation JSON
 * @param manager Hippy UI Manager
 * @param location location position
 * @param completion completion block
 * @return sucess or failure
 */
- (BOOL)domGetNodeForLocationWithManager:(nullable HippyUIManager *)manager
                                location:(CGPoint)location
                              completion:(void (^)(NSDictionary *rspObject))completion;

/**
 * @brief Get NodeId JSON With Path
 * @param path node path
 * @param manager Hippy UI Manager
 * @param completion completion block
 * @return sucess or failure
 */
- (BOOL)domGetNodeIdByPath:(NSString *)path
                   manager:(nullable HippyUIManager *)manager
                completion:(void (^)(NSDictionary *rspObject))completion;

@end

NS_ASSUME_NONNULL_END
