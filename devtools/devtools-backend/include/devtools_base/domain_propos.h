/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
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

#pragma once

namespace tdf {
namespace devtools {

constexpr const char *kFrontendKeyDomainNameCSS = "CSS";
constexpr const char *kFrontendKeyDomainNameDOM = "DOM";
constexpr const char *kFrontendKeyDomainNamePage = "Page";
constexpr const char *kFrontendKeyDomainNameTDF = "TDF";
constexpr const char *kFrontendKeyDomainNameNetwork = "Network";
constexpr const char *kFrontendKeyDomainNameTDFInspector = "TDFInspector";
constexpr const char *kFrontendKeyDomainNameTDFMemory = "TDFMemory";
constexpr const char *kFrontendKeyDomainNameTDFPerformance = "TDFPerformance";
constexpr const char *kFrontendKeyDomainNameTDFRuntime = "TDFRuntime";

// Event
constexpr const char *kLogEventName = "TDFLog.getLog";


}  // namespace devtools
}  // namespace tdf
