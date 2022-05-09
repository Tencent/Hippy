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
#import <functional>
#import <string>

//class RenderVsyncManager {
//
//public:
//    static RenderVsyncManager &instance();
//    void RegisterVsyncObserver(std::function<void ()> observer);
//
//private:
//    RenderVsyncManager() = default;
//
//    CADisplayLink *display_link_;
//    static RenderVsyncManager vsync_manager_;
//    std::vector<std::function<void ()>> vsync_observers_;
//};

@interface RenderVsyncManager : NSObject

/**
 * Refresh rate. Default value is 30.
 */
@property(nonatomic, assign)NSUInteger rate;

+ (instancetype)sharedInstance;

- (void)registerVsyncObserver:(std::function<void()>)observer forKey:(const std::string &)key;

- (void)unregisterVsyncObserverForKey:(const std::string &)key;

@end
