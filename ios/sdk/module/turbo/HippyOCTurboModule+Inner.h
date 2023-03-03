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
#ifdef __cplusplus

#import "HippyOCTurboModule.h"
#include <memory>
#include "core/napi/jsc/jsc_ctx.h"
#include "core/napi/jsc/jsc_ctx_value.h"

struct TurboWrapper;

@interface HippyOCTurboModule (Inner)

- (JSValueRef)getTurboHostModule;
- (void)setTurboHostModule:(JSValueRef)turboHostModule;

- (void)saveTurboWrapper:(std::shared_ptr<hippy::napi::CtxValue>)name
                   turbo:(std::unique_ptr<TurboWrapper>)wrapper;

- (std::shared_ptr<hippy::napi::CtxValue>)invokeOCMethod:(const std::shared_ptr<hippy::napi::Ctx>&) ctx                                                            this_val:(const std::shared_ptr<hippy::napi::CtxValue>&)this_val
                                                    args:(const std::shared_ptr<hippy::napi::CtxValue>*) args
                                                   count:(size_t) count;

@end

struct TurboWrapper {
  HippyOCTurboModule* module;
  std::shared_ptr<hippy::napi::CtxValue> name;

  TurboWrapper(HippyOCTurboModule* module, const std::shared_ptr<hippy::napi::CtxValue>& name) {
    this->module = module;
    this->name = name;
  }
};


#endif /* __cplusplus */
#endif /* HippyOCTurboModule_Inner_h */
