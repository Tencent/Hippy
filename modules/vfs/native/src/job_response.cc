/*
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
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include "vfs/job_response.h"

#include <utility>

namespace hippy {
inline namespace vfs {

JobResponse::JobResponse(RetCode code, const string_view& err_msg,
                         std::unordered_map<std::string, std::string> meta,
                         bytes&& content)
    : code_(code), err_msg_(err_msg), meta_(std::move(meta)), content_(std::move(content)) {}

JobResponse::JobResponse(JobResponse::RetCode code): JobResponse(code, "", {}, "") {}

JobResponse::JobResponse() : JobResponse(RetCode::Success) {}

JobResponse::bytes JobResponse::ReleaseContent() {
  auto ret = std::move(content_);
  content_ = "";
  return ret;
}

}
}
