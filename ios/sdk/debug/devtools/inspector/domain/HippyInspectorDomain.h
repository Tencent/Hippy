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
#import "HippyInspector.h"

NS_ASSUME_NONNULL_BEGIN

@class HippyDevCommand;
@class HippyBridge;

@interface HippyInspectorDomain : NSObject

@property (nonatomic, weak) HippyInspector *inspector;

- (instancetype)initWithInspector:(HippyInspector *)inspector;

/**
 *  @brief Handle backend method request
 *
 *  @param method request method name
 *  @param rspId response id
 *  @param params request params
 *  @return handle result (success or fail)
 */
- (BOOL)HandleRequestFromBackendWithMethod:(NSString *)method
                                rspId:(NSInteger)rspId
                                params:(NSDictionary *)params;
/**
 *  @brief  dispatch the request to DOM、CSS、Page.
 *          Subclasses need to implement this method
 *
 *  @param method request method name
 *  @param rspId response id
 *  @param params request params
 *  @return handle result (success or fail)
 */
- (BOOL)HandleRequestMethod:(NSString *)method
                      rspId:(NSInteger)rspId
                     params:(NSDictionary *)params;

- (BOOL)handleRequestDevCommand:(HippyDevCommand *)command bridge:(HippyBridge *)bridge;

- (NSString *)domainName;

@end

NS_ASSUME_NONNULL_END
