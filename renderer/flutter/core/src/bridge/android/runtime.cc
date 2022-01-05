/*****************************************************************************
 * @copyright Copyright (C), 1998-2020, Tencent Tech. Co., Ltd.
 * @file     Runtime.cc
 * @brief
 * @author   skindhu
 * @version  1.0.0
 * @date     2021/8/11
 *****************************************************************************/
#include "runtime.h"

#include <mutex>
#include <unordered_map>
#include <utility>

static std::unordered_map<int64_t, std::shared_ptr<Runtime>> RuntimeMap;
static std::unordered_map<int64_t, std::shared_ptr<int64_t>> RuntimeKeyMap;
static std::mutex mutex;

static std::atomic<int64_t> global_runtime_key{0};

Runtime::Runtime(std::shared_ptr<PlatformRuntime> platform_runtime, bool enable_v8_serialization, bool is_dev)
  : enable_v8_serialization_(enable_v8_serialization), is_debug_(is_dev), platform_runtime_(std::move(platform_runtime))
{
  id_ = global_runtime_key.fetch_add(1);
}

void Runtime::Insert(const std::shared_ptr<Runtime>& runtime) {
  std::lock_guard<std::mutex> lock(mutex);
  int64_t id = runtime->id_;
  RuntimeKeyMap[id] = std::make_shared<int64_t>(id);
  RuntimeMap[id] = runtime;
}

std::shared_ptr<Runtime> Runtime::Find(int64_t id) {
  std::lock_guard<std::mutex> lock(mutex);
  const auto it = RuntimeMap.find(id);
  if (it == RuntimeMap.end()) {
    return nullptr;
  }

  return it->second;
}

bool Runtime::Erase(int64_t id) {
  std::lock_guard<std::mutex> lock(mutex);
  const auto it = RuntimeMap.find(id);
  if (it == RuntimeMap.end()) {
    return false;
  }

  RuntimeMap.erase(it);
  return true;
}

bool Runtime::Erase(const std::shared_ptr<Runtime>& runtime) {
  return Runtime::Erase(runtime->id_);
}

std::shared_ptr<int64_t> Runtime::GetKey(const std::shared_ptr<Runtime>& runtime) {
  std::lock_guard<std::mutex> lock(mutex);
  const auto it = RuntimeKeyMap.find(runtime->id_);
  if (it == RuntimeKeyMap.end()) {
    return nullptr;
  }

  return it->second;
}

bool Runtime::ReleaseKey(int64_t id) {
  std::lock_guard<std::mutex> lock(mutex);
  const auto it = RuntimeKeyMap.find(id);
  if (it == RuntimeKeyMap.end()) {
    return false;
  }

  RuntimeKeyMap.erase(it);
  return true;
}