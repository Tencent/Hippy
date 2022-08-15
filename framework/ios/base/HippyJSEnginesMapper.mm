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

#import "HippyJSEnginesMapper.h"
#import "NativeRenderLog.h"

#include "footstone/worker_impl.h"
#include "footstone/platform/ios/looper_driver.h"

EngineResource::EngineResource() {
    auto driver = std::make_unique<footstone::LooperDriver>();
    dom_worker_ = std::make_shared<footstone::WorkerImpl>("hippy_dom", false, std::move(driver));
    dom_worker_->Start();
    auto task_runner = std::make_shared<footstone::TaskRunner>();
    dom_worker_->Bind({task_runner});
    task_runner->SetWorker(dom_worker_);
    dom_manager_ = std::make_shared<hippy::DomManager>();
    dom_manager_->SetTaskRunner(task_runner);
    engine_ = std::make_shared<hippy::Engine>(task_runner, nullptr);
}

EngineResource::~EngineResource() {
    dom_worker_->Terminate();
}

using EngineRef = std::pair<std::shared_ptr<EngineResource>, NSUInteger>;
using EngineMapper = std::unordered_map<std::string, EngineRef>;

@interface HippyJSEnginesMapper () {
    EngineMapper _engineMapper;
    std::recursive_mutex _mutex;
}

@end

@implementation HippyJSEnginesMapper

+ (instancetype)defaultInstance {
    static dispatch_once_t onceToken;
    static HippyJSEnginesMapper *instance = nil;
    dispatch_once(&onceToken, ^{
        instance = [[[self class] alloc] init];
    });
    return instance;
}

- (std::shared_ptr<EngineResource>)createJSEngineResourceForKey:(NSString *)key {
    std::lock_guard<std::recursive_mutex> lock(_mutex);
    const auto it = _engineMapper.find([key UTF8String]);
    bool findIT = (_engineMapper.end() != it);
    if (findIT) {
        EngineRef &ref = it->second;
        ref.second++;
        return ref.first;
    } else {
        std::shared_ptr<EngineResource> engineSource = std::make_shared<EngineResource>();
        [self setEngine:engineSource forKey:key];
        return engineSource;
    }
}

- (std::shared_ptr<EngineResource>)JSEngineResourceForKey:(NSString *)key {
    std::lock_guard<std::recursive_mutex> lock(_mutex);
    const auto it = _engineMapper.find([key UTF8String]);
    bool findIT = (_engineMapper.end() != it);
    if (findIT) {
        EngineRef &ref = it->second;
        return ref.first;
    } else {
        return nullptr;
    }
}

- (void)setEngine:(std::shared_ptr<EngineResource>)engineSource forKey:(NSString *)key {
    EngineRef ref { engineSource, 1 };
    std::pair<std::string, EngineRef> enginePair { [key UTF8String], ref };
    std::lock_guard<std::recursive_mutex> lock(_mutex);
    _engineMapper.insert(enginePair);
}

- (void)removeEngineResourceForKey:(NSString *)key {
    std::lock_guard<std::recursive_mutex> lock(_mutex);
    const auto it = _engineMapper.find([key UTF8String]);
    bool findIT = (_engineMapper.end() != it);
    if (findIT) {
        EngineRef &ref = it->second;
        ref.second--;
        if (0 == ref.second) {
            NativeRenderLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyJSCExecutor destroy engine %@", key);
            _engineMapper.erase(it);
        }
    }
}

@end
