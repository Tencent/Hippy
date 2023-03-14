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

#include <string>

namespace hippy {
inline namespace driver {
class Engine;
}
inline namespace dom {
class DomManager;
}
}

namespace footstone {
inline namespace runner {
class Worker;
}
}

class EngineResource {
public:
    EngineResource();
    EngineResource(const std::string name);
    ~EngineResource();
    std::shared_ptr<hippy::Engine> GetEngine() {return engine_;};
    std::shared_ptr<hippy::DomManager> GetDomManager() {return dom_manager_;};
private:
    void Setup(const std::string name);
private:
    std::shared_ptr<hippy::Engine> engine_;
    std::shared_ptr<footstone::Worker> dom_worker_;
    std::shared_ptr<hippy::DomManager> dom_manager_;
};

@interface HippyJSEnginesMapper : NSObject

/**
 * Get Default instance
 *
 * @return Default instance
 */
+ (instancetype)defaultInstance;

/**
 * Get EngineResource instance from key
 *
 * @param key Key to Engine instance
 *
 * @return EngineResource instance for key
 */
- (std::shared_ptr<EngineResource>)JSEngineResourceForKey:(NSString *)key;

/**
 * Create EngineResource instance or increase reference count if the instance corresponding to the key exists,
 * and return EngineResource instance.
 *
 * @param key Key to EngineResource instance
 *
 * @return EngineResource instance for key
 */
- (std::shared_ptr<EngineResource>)createJSEngineResourceForKey:(NSString *)key;

/**
 * Decrease reference of EngineResource instance for key
 *
 * @param key Key for EngineResource instance
 */
- (void)removeEngineResourceForKey:(NSString *)key;

@end
