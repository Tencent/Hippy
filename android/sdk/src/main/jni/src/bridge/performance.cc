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

#include "bridge/performance.h"

#include "bridge/runtime.h"
#include "jni/jni_register.h"

namespace hippy {
namespace bridge {

// [Heap]
REGISTER_JNI("com/tencent/mtt/hippy/bridge/HippyBridgeImpl", // NOLINT(cert-err58-cpp)
             "getHeapCodeStatistics",
             "(J)Lcom/tencent/mtt/hippy/bridge/heap/HeapCodeStatistics;",
             GetHeapCodeStatistics)
REGISTER_JNI("com/tencent/mtt/hippy/bridge/HippyBridgeImpl", // NOLINT(cert-err58-cpp)
             "getHeapStatistics",
             "(J)Lcom/tencent/mtt/hippy/bridge/heap/HeapStatistics;",
             GetHeapStatistics)
REGISTER_JNI("com/tencent/mtt/hippy/bridge/HippyBridgeImpl", // NOLINT(cert-err58-cpp)
             "getHeapSpaceStatisticsList",
             "(J)[Lcom/tencent/mtt/hippy/bridge/heap/HeapSpaceStatistics;",
             GetHeapSpaceStatisticsList)
REGISTER_JNI("com/tencent/mtt/hippy/bridge/HippyBridgeImpl", // NOLINT(cert-err58-cpp)
             "writeHeapSnapshot",
             "(JLjava/lang/String;)I",
             WriteHeapSnapshot)

using unicode_string_view = tdf::base::unicode_string_view;
using V8VM = hippy::napi::V8VM;

// [Heap] GetHeapCodeStatistics
jobject GetHeapCodeStatistics(__unused JNIEnv* j_env,
                             __unused jobject j_object,
                             jlong j_runtime_id) {
  TDF_BASE_DLOG(INFO) << "GetHeapCodeStatistics begin, j_runtime_id = " << j_runtime_id;
  auto runtime_id = static_cast<int32_t>(j_runtime_id);
  std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
  if (!runtime) {
      TDF_BASE_DLOG(WARNING) << "GetHeapCodeStatistics, j_runtime_id invalid";
      return nullptr;
  }
  // v8 GetHeapCodeAndMetadataStatistics
  auto heap_code_statistics = std::make_shared<v8::HeapCodeStatistics>();
  v8::Isolate* isolate = std::static_pointer_cast<V8VM>(runtime->GetEngine()->GetVM())->isolate_;
  isolate->GetHeapCodeAndMetadataStatistics(heap_code_statistics.get());
//  std::shared_ptr<Engine> engine = runtime->GetEngine();
//  std::shared_ptr<WorkerTaskRunner> task_runner = engine->GetWorkerTaskRunner();
//  std::unique_ptr<CommonTask> task = std::make_unique<CommonTask>();
//  task->func_ = [runtime, heap_code_statistics] {
//      v8::Isolate* isolate = std::static_pointer_cast<V8VM>(runtime->GetEngine()->GetVM())->isolate_;
//      isolate->GetHeapCodeAndMetadataStatistics(heap_code_statistics.get());
//  };
//  task_runner->PostTask(std::move(task));
  // set HeapCodeStatistics data
  jclass j_hcs_class = j_env->FindClass("com/tencent/mtt/hippy/bridge/heap/HeapCodeStatistics");
  jmethodID j_hcs_constructor = j_env->GetMethodID(j_hcs_class,"<init>","(JJJ)V");
  jobject j_hcs_obj = j_env->NewObject(j_hcs_class,
                                     j_hcs_constructor,
                                     (long)heap_code_statistics->code_and_metadata_size(),
                                     (long)heap_code_statistics->bytecode_and_metadata_size(),
                                     (long)heap_code_statistics->external_script_source_size());
  j_env->DeleteLocalRef(j_hcs_class);
  TDF_BASE_DLOG(INFO) << "GetHeapCodeStatistics end";
  return j_hcs_obj;
}
// [Heap] GetHeapSpaceStatisticsList
jobject GetHeapSpaceStatisticsList(__unused JNIEnv* j_env,
                                   __unused jobject j_object,
                                   jlong j_runtime_id) {
    TDF_BASE_DLOG(INFO) << "GetHeapSpaceStatisticsList begin, j_runtime_id = " << j_runtime_id;
    auto runtime_id = static_cast<int32_t>(j_runtime_id);
    std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
    if (!runtime) {
        TDF_BASE_DLOG(WARNING) << "GetHeapSpaceStatisticsList, j_runtime_id invalid";
        return nullptr;
    }
    // init ArrayList<HeapSpaceStatistics>
    jclass j_list_class = j_env->FindClass("java/util/ArrayList");
    jmethodID j_list_constructor = j_env->GetMethodID(j_list_class , "<init>","()V");
    jobject j_list_obj = j_env->NewObject(j_list_class, j_list_constructor);
    jmethodID j_list_add  = j_env->GetMethodID(j_list_class,"add","(Ljava/lang/Object;)Z");
    jclass j_hss_class = j_env->FindClass("com/tencent/mtt/hippy/bridge/heap/HeapSpaceStatistics");
    jmethodID j_hss_constructor = j_env->GetMethodID(j_hss_class,"<init>","(Ljava/lang/String;JJJJ)V");
    // v8 NumberOfHeapSpaces
    v8::Isolate* isolate = std::static_pointer_cast<V8VM>(runtime->GetEngine()->GetVM())->isolate_;
    size_t space_count = isolate->NumberOfHeapSpaces();
    TDF_BASE_DLOG(INFO) << "GetHeapSpaceStatisticsList , space_count = " << space_count;
    std::shared_ptr<v8::HeapSpaceStatistics> heap_space_statistics;
    for(size_t i = 0 ; i < space_count ; i++)
    {
        // v8 GetHeapSpaceStatistics
        heap_space_statistics = std::make_shared<v8::HeapSpaceStatistics>();
        isolate->GetHeapSpaceStatistics(heap_space_statistics.get(), i);
        // set HeapSpaceStatistics data
        jstring j_space_name = j_env->NewStringUTF(heap_space_statistics->space_name());
        jobject j_hss_obj = j_env->NewObject(j_hss_class,
                                           j_hss_constructor,
                                           j_space_name,
                                           (long)heap_space_statistics->space_size(),
                                           (long)heap_space_statistics->space_used_size(),
                                           (long)heap_space_statistics->space_available_size(),
                                           (long)heap_space_statistics->physical_space_size());
        j_env->CallBooleanMethod(j_list_obj, j_list_add, j_hss_obj);
        j_env->DeleteLocalRef(j_space_name);
        j_env->DeleteLocalRef(j_hss_obj);
    }
    j_env->DeleteLocalRef(j_list_class);
    j_env->DeleteLocalRef(j_hss_class);
    TDF_BASE_DLOG(INFO) << "GetHeapSpaceStatisticsList end";
    return j_list_obj;
}
// [Heap] GetHeapStatistics
jobject GetHeapStatistics(__unused JNIEnv* j_env,
                          __unused jobject j_object,
                          jlong j_runtime_id) {
    TDF_BASE_DLOG(INFO) << "GetHeapStatistics begin, j_runtime_id = " << j_runtime_id;
    auto runtime_id = static_cast<int32_t>(j_runtime_id);
    std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
    if (!runtime) {
        TDF_BASE_DLOG(WARNING) << "GetHeapStatistics, j_runtime_id invalid";
        return nullptr;
    }
    // v8 GetHeapStatistics
    auto heap_statistics = std::make_shared<v8::HeapStatistics>();
    v8::Isolate* isolate = std::static_pointer_cast<V8VM>(runtime->GetEngine()->GetVM())->isolate_;
    isolate->GetHeapStatistics(heap_statistics.get());
    // set HeapStatistics data
    jclass j_hs_class = j_env->FindClass("com/tencent/mtt/hippy/bridge/heap/HeapStatistics");
    jmethodID j_hs_constructor = j_env->GetMethodID(j_hs_class,"<init>","(JJJJJJJJJJJJJ)V");
    jobject j_hs_obj = j_env->NewObject(j_hs_class,
                                        j_hs_constructor,
                                        (long)heap_statistics->total_heap_size(),
                                        (long)heap_statistics->total_heap_size_executable(),
                                        (long)heap_statistics->total_physical_size(),
                                        (long)heap_statistics->total_available_size(),
                                        (long)heap_statistics->total_global_handles_size(),
                                        (long)heap_statistics->used_global_handles_size(),
                                        (long)heap_statistics->used_heap_size(),
                                        (long)heap_statistics->heap_size_limit(),
                                        (long)heap_statistics->malloced_memory(),
                                        (long)heap_statistics->external_memory(),
                                        (long)heap_statistics->peak_malloced_memory(),
                                        (long)heap_statistics->number_of_native_contexts(),
                                        (long)heap_statistics->number_of_detached_contexts());
    j_env->DeleteLocalRef(j_hs_class);
    TDF_BASE_DLOG(INFO) << "GetHeapStatistics end";
    return j_hs_obj;
}
// [Heap] WriteHeapSnapshot
jint WriteHeapSnapshot(__unused JNIEnv* j_env,
                       __unused jobject j_object,
                       jlong j_runtime_id,
                       jstring j_heap_snapshot_path) {
    TDF_BASE_DLOG(INFO) << "WriteHeapSnapshot begin, j_runtime_id = " << j_runtime_id;
    auto runtime_id = static_cast<int32_t>(j_runtime_id);
    std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
    // error: runtime_id invalid
    if (!runtime) {
        TDF_BASE_DLOG(WARNING) << "WriteHeapSnapshot, j_runtime_id invalid";
        return HEAP_WRITE_ERR_RUN;
    }
    const unicode_string_view heap_snapshot_path = JniUtils::ToStrView(j_env, j_heap_snapshot_path);
    HeapSnapshotOutputStreamAdapter heap_snapshot_stream;
    int set_file_ret = heap_snapshot_stream.SetFilePath(heap_snapshot_path);
    // error: file_path invalid
    if (set_file_ret) {
        TDF_BASE_DLOG(WARNING) << "WriteHeapSnapshot, set_file_ret = " << set_file_ret;
        return HEAP_WRITE_ERR_FILE;
    }
    // v8 TakeHeapSnapshot and Serialize
    v8::Isolate* isolate = std::static_pointer_cast<V8VM>(runtime->GetEngine()->GetVM())->isolate_;
    v8::HeapProfiler* heap_profiler = isolate->GetHeapProfiler();
    const v8::HeapSnapshot* heap_snapshot = heap_profiler->TakeHeapSnapshot();
    heap_snapshot->Serialize(&heap_snapshot_stream);
    heap_profiler->DeleteAllHeapSnapshots();
    delete heap_snapshot;
    // error: save heapSnapshots error
    if (heap_snapshot_stream.save_res_ != HeapSnapshotOutputStreamAdapter::sOk) {
        TDF_BASE_DLOG(WARNING) << "WriteHeapSnapshot, save heapSnapshots = " << heap_snapshot_stream.save_res_;
        return HEAP_WRITE_ERR_SAVE;
    }
    TDF_BASE_DLOG(INFO) << "WriteHeapSnapshot end";
    return HEAP_WRITE_OK;
}

}  // namespace bridge
}  // namespace hippy
