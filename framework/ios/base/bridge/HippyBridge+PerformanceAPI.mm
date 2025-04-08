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
#import "HippyJSExecutor+Internal.h"
#import "HippyLog.h"
#import "driver/scope.h"
#import "footstone/string_view_utils.h"


static NSString *const kHippyPerfKeyFP = @"FP";
static NSString *const kHippyPerfKeyFCP = @"FCP";
static NSString *const kHippyPerfKeyInit = @"NativeInit";
static NSString *const kHippyPerfKeyJSInit = @"JsEngineInit";
static NSString *const kHippyPerfKeyRunApp = @"RunApplication";
static NSString *const kHippyPerfKeyDomCreate = @"DomCreate";
static NSString *const kHippyPerfKeyFirstFrame = @"FirstFrame";


using namespace footstone;

@implementation HippyBridge (PerformanceAPI)

- (void)updatePerfRecordsOnRootContentDidAppear:(NSNumber *)rootTag  {
    std::shared_ptr<hippy::Scope> scope = self.javaScriptExecutor.pScope;
    if (!scope) {
        return;
    }
    auto domManager = scope->GetDomManager().lock();
    auto performance = scope->GetPerformance();
    if (domManager && performance) {
        uint32_t rootId = rootTag.unsignedIntValue;
        std::weak_ptr<hippy::DomManager> weak_domManager = domManager;
        std::weak_ptr<hippy::Performance> weak_performance = performance;
        TimePoint tp = footstone::TimePoint::SystemNow();
        std::vector<std::function<void()>> ops = {[rootId, weak_domManager, weak_performance, tp] {
            auto domManager = weak_domManager.lock();
            auto performance = weak_performance.lock();
            if (!domManager || !performance) {
                return;
            }
            auto entry = performance->PerformanceNavigation(hippy::kPerfNavigationHippyInit);
            if (!entry) {
                return;
            }
            entry->SetHippyRunApplicationEnd(domManager->GetDomStartTimePoint(rootId));
            entry->SetHippyDomStart(domManager->GetDomStartTimePoint(rootId));
            entry->SetHippyDomEnd(domManager->GetDomEndTimePoint(rootId));
            entry->SetHippyFirstFrameStart(domManager->GetDomEndTimePoint(rootId));
            entry->SetHippyFirstFrameEnd(tp);
#if HIPPY_DEBUG
            int64_t totalFPTime = (entry->GetHippyFirstFrameEnd() - entry->GetHippyNativeInitStart()).ToMilliseconds();
            int64_t nativeInit = (entry->GetHippyNativeInitEnd() - entry->GetHippyNativeInitStart()).ToMilliseconds();
            int64_t runApplication = (entry->GetHippyRunApplicationEnd() - entry->GetHippyRunApplicationStart()).ToMilliseconds();
            int64_t domCreate = (entry->GetHippyDomEnd() - entry->GetHippyDomStart()).ToMilliseconds();
            int64_t firstFrame = (entry->GetHippyFirstFrameEnd() - entry->GetHippyFirstFrameStart()).ToMilliseconds();
            HippyLogTrace(@"Hippy FP=%lld, detail: %lld, %lld, %lld, %lld", totalFPTime, nativeInit, runApplication, domCreate, firstFrame);
#endif /* HIPPY_DEBUG */
      }};
      domManager->PostTask(hippy::Scene(std::move(ops)));
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
        std::weak_ptr<hippy::DomManager> weak_domManager = domManager;
        std::weak_ptr<hippy::Performance> weak_performance = performance;
        TimePoint tp = footstone::TimePoint::SystemNow();
        std::vector<std::function<void()>> ops = {[weak_domManager, weak_performance, tp] {
            auto domManager = weak_domManager.lock();
            auto performance = weak_performance.lock();
            if (!domManager || !performance) {
                return;
            }
            auto entry = performance->PerformanceNavigation(hippy::kPerfNavigationHippyInit);
            if (!entry) {
                return;
            }
            entry->SetHippyFirstContentfulPaintEnd(tp);
        }};
        domManager->PostTask(hippy::Scene(std::move(ops)));
    }
}

- (NSDictionary *)getHippyInitPerformanceData {
    std::shared_ptr<hippy::Scope> scope = self.javaScriptExecutor.pScope;
    if (!scope) {
        return @{};
    }
    auto domManager = scope->GetDomManager().lock();
    auto performance = scope->GetPerformance();
    if (domManager && performance) {
        auto entry = performance->PerformanceNavigation(hippy::kPerfNavigationHippyInit);
        if (!entry) {
            return @{};
        }
        
        NSMutableDictionary *dic = [NSMutableDictionary dictionary];
        int64_t totalFPTime = (entry->GetHippyFirstFrameEnd() - entry->GetHippyNativeInitStart()).ToMilliseconds();
        int64_t nativeInit = (entry->GetHippyNativeInitEnd() - entry->GetHippyNativeInitStart()).ToMilliseconds();
        int64_t jsEngineInit = (entry->GetHippyJsEngineInitEnd() - entry->GetHippyJsEngineInitStart()).ToMilliseconds();
        int64_t runApplication = (entry->GetHippyRunApplicationEnd() - entry->GetHippyRunApplicationStart()).ToMilliseconds();
        int64_t domCreate = (entry->GetHippyDomEnd() - entry->GetHippyDomStart()).ToMilliseconds();
        int64_t firstFrame = (entry->GetHippyFirstFrameEnd() - entry->GetHippyFirstFrameStart()).ToMilliseconds();
        dic[kHippyPerfKeyFP] = @(totalFPTime);
        dic[kHippyPerfKeyInit] = @(nativeInit);
        dic[kHippyPerfKeyJSInit] = @(jsEngineInit);
        dic[kHippyPerfKeyRunApp] = @(runApplication);
        dic[kHippyPerfKeyDomCreate] = @(domCreate);
        dic[kHippyPerfKeyFirstFrame] = @(firstFrame);
        
        auto bundle_info_array = entry->GetBundleInfoArray();
        for (size_t i = 0; i < bundle_info_array.size(); ++i) {
            auto& info = bundle_info_array[i];
            auto url = StringViewUtils::ToStdString(StringViewUtils::ConvertEncoding(info.url_, string_view::Encoding::Utf8).utf8_value());
            NSString *urlStr = [NSString stringWithCString:url.c_str() encoding:[NSString defaultCStringEncoding]];
            int64_t exeTime = (info.execute_source_end_ - info.execute_source_start_).ToMilliseconds();
            [dic setObject:@(exeTime) forKey:urlStr.lastPathComponent];
        }
        return dic;
    }
    return @{};
}

- (NSDictionary *)getFCPPerformanceData {
    std::shared_ptr<hippy::Scope> scope = self.javaScriptExecutor.pScope;
    if (!scope) {
        return nil;
    }
    auto domManager = scope->GetDomManager().lock();
    auto performance = scope->GetPerformance();
    if (domManager && performance) {
        auto entry = performance->PerformanceNavigation(hippy::kPerfNavigationHippyInit);
        if (!entry) {
            return nil;
        }
        int64_t fcpTime = (entry->GetHippyFirstContentfulPaintEnd() - entry->GetHippyNativeInitStart()).ToMilliseconds();
        return @{ kHippyPerfKeyFCP : @(fcpTime) };
    }
    return nil;
}

@end
