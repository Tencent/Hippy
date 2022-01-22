/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2021 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#ifndef HippyOCTurboModule_Inner_h
#define HippyOCTurboModule_Inner_h

#import <core/napi/jsc/js_native_turbo_jsc.h>
#import "HippyOCTurboModule.h"

@interface HippyOCTurboModule (Inner)

- (std::shared_ptr<hippy::napi::HippyTurboModule>)getTurboModule;
- (JSValueRef)getTurboHostModule;
- (void)setTurboHostModule:(JSValueRef)turboHostModule;

@end

#endif /* HippyOCTurboModule_Inner_h */
