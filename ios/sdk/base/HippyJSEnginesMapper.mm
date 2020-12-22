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
#import "HippyJavaScriptExecutor.h"

using EngineRef = std::pair<std::shared_ptr<Engine>, NSUInteger>;
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

- (std::shared_ptr<Engine>)createJSEngineForKey:(NSString *)key {
    std::lock_guard<std::recursive_mutex> lock(_mutex);
    const auto it = _engineMapper.find([key UTF8String]);
    bool findIT = (_engineMapper.end() != it);
    if (findIT) {
        EngineRef &ref = it->second;
        ref.second++;
        return ref.first;
    }
    else {
        std::shared_ptr<Engine> engine = std::make_shared<Engine>();
        [self setEngine:engine forKey:key];
        return engine;
    }
}

- (std::shared_ptr<Engine>)JSEngineForKey:(NSString *)key {
    std::lock_guard<std::recursive_mutex> lock(_mutex);
    const auto it = _engineMapper.find([key UTF8String]);
    bool findIT = (_engineMapper.end() != it);
    if (findIT) {
        EngineRef &ref = it->second;
        return ref.first;
    }
    else {
        return nullptr;
    }
}

- (void)setEngine:(std::shared_ptr<Engine>)engine forKey:(NSString *)key {
    EngineRef ref{engine, 1};
    std::pair<std::string, EngineRef> enginePair{[key UTF8String], ref};
    std::lock_guard<std::recursive_mutex> lock(_mutex);
    _engineMapper.insert(enginePair);
}

- (void)removeEngineForKey:(NSString *)key {
    std::lock_guard<std::recursive_mutex> lock(_mutex);
    const auto it = _engineMapper.find([key UTF8String]);
    bool findIT = (_engineMapper.end() != it);
    if (findIT) {
        EngineRef &ref = it->second;
        ref.second--;
        if (0 == ref.second) {
            std::shared_ptr<Engine> engine = ref.first;
            engine->TerminateRunner();
            _engineMapper.erase(it);
        }
    }
}

@end
