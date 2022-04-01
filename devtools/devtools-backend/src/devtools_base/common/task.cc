//
// Copyright (c) Tencent Corporation. All rights reserved.
//

#include "devtools_base/common/task.h"

std::atomic<uint32_t> g_next_task_id{0};

namespace tdf::devtools {
inline namespace runner {
Task::Task() : Task(nullptr) {}

Task::Task(std::function<void()> exec_unit) : unit_(exec_unit) { id_ = g_next_task_id.fetch_add(1); }
}  // namespace runner
}  // namespace tdf::devtools
