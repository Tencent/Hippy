/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

#include "driver/napi/hermes/hermes_try_catch.h"

#include "footstone/logging.h"

namespace hippy {
inline namespace driver {
inline namespace napi {

using string_view = footstone::string_view;

std::shared_ptr<TryCatch> CreateTryCatchScope(bool enable, std::shared_ptr<Ctx> ctx) {
  return nullptr;
}

HermesTryCatch::HermesTryCatch(bool enable, std::shared_ptr<Ctx>& ctx) : TryCatch(enable, ctx) {}

void HermesTryCatch::ReThrow() { FOOTSTONE_UNIMPLEMENTED(); }

bool HermesTryCatch::HasCaught() { return false; }

bool HermesTryCatch::CanContinue() { return false; }

bool HermesTryCatch::HasTerminated() { return false; }

bool HermesTryCatch::IsVerbose() { return false; }

void HermesTryCatch::SetVerbose(bool is_verbose) { FOOTSTONE_UNIMPLEMENTED(); }

std::shared_ptr<CtxValue> HermesTryCatch::Exception() { return nullptr; }

string_view HermesTryCatch::GetExceptionMessage() { return ""; }

}  // namespace napi
}  // namespace driver
}  // namespace hippy
