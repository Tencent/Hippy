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

#ifndef HippyBridge_Private_h
#define HippyBridge_Private_h

#import "HippyBridge.h"
#include "footstone/time_point.h"
#include <memory>

class VFSUriLoader;

namespace hippy {
inline namespace dom {
class DomManager;
class RootNode;
};
};


@protocol HippyBridgeInternal <NSObject>

/// URI Loader
@property (nonatomic, assign) std::weak_ptr<VFSUriLoader> vfsUriLoader;

/// Start time of hippyBridge, for performance api.
@property (nonatomic, assign) footstone::TimePoint startTime;

@end


@interface HippyBridge (Private) <HippyBridgeInternal>

/**
 * Set basic configuration for native render
 * @param domManager DomManager
 * @param rootNode RootNode
 */
- (void)setupDomManager:(std::shared_ptr<hippy::DomManager>)domManager
               rootNode:(std::weak_ptr<hippy::RootNode>)rootNode;

@end



#endif /* HippyBridge_Private_h */
