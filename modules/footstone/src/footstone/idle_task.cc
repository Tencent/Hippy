/*
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
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#include "footstone/idle_task.h"

#include <utility>

std::atomic<uint32_t> g_next_idle_task_id{0};

namespace footstone {
inline namespace runner {

IdleTask::IdleTask() :
    id_(g_next_idle_task_id.fetch_add(1)), unit_(nullptr) {}

IdleTask::IdleTask(std::function<void(const IdleCbParam &)> unit) :
    id_(g_next_idle_task_id.fetch_add(1)), unit_(std::move(unit)) {
}

} // namespace runner
} // namespace footstone
