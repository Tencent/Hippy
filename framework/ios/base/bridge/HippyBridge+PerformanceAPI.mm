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

#import "HippyBridge+PerformanceAPI.h"
#import "HippyJSExecutor.h"
#import "driver/scope.h"

@implementation HippyBridge (PerformanceAPI)

- (void)updatePerfRecordsOnRootContentDidAppear {
    std::shared_ptr<hippy::Scope> scope = self.javaScriptExecutor.pScope;
    if (!scope) {
        return;
    }
    auto domManager = scope->GetDomManager().lock();
    auto performance = scope->GetPerformance();
    if (domManager && performance) {
        auto entry = performance->PerformanceNavigation(hippy::kPerfNavigationHippyInit);
        if (!entry) {
            return;
        }
        entry->SetHippyDomStart(domManager->GetDomStartTimePoint());
        entry->SetHippyDomEnd(domManager->GetDomEndTimePoint());
        entry->SetHippyFirstFrameStart(domManager->GetDomEndTimePoint());
        entry->SetHippyFirstFrameEnd(footstone::TimePoint::SystemNow());
    }
}

- (void)updatePerfRecordOnFirstContentfulPaintEnd {
    std::shared_ptr<hippy::Scope> scope = self.javaScriptExecutor.pScope;
    if (!scope) {
        return;
    }
    auto domManager = scope->GetDomManager().lock();
    auto performance = scope->GetPerformance();
    if (domManager && performance) {
        auto entry = performance->PerformanceNavigation(hippy::kPerfNavigationHippyInit);
        if (!entry) {
            return;
        }
        entry->SetHippyFirstContentfulPaintEnd(footstone::TimePoint::SystemNow());
    }
}

@end
