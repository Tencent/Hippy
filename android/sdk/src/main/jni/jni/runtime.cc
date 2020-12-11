#include "jni/runtime.h"

#include <mutex>
#include <unordered_map>

static std::unordered_map<int64_t, std::shared_ptr<Runtime>> RuntimeMap;
static std::unordered_map<int64_t, std::shared_ptr<int64_t>> RuntimeKeyMap;
static std::mutex mutex;

static std::atomic<int64_t> global_runtime_key{0};

Runtime::Runtime(std::shared_ptr<JavaRef> bridge, bool is_json, bool is_dev)
    : is_json_(is_json), is_debug_(is_dev), bridge_(bridge) {
  id_ = global_runtime_key.fetch_add(1);
}

void Runtime::Insert(std::shared_ptr<Runtime> runtime) {
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

bool Runtime::Erase(std::shared_ptr<Runtime> runtime) {
  return Runtime::Erase(runtime->id_);
}

std::shared_ptr<int64_t> Runtime::GetKey(
    std::shared_ptr<Runtime> runtime) {
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
