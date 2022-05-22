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
             "getHeapStatistics",
             "(JLcom/tencent/mtt/hippy/common/Callback;)Z",
             GetHeapStatistics)
REGISTER_JNI("com/tencent/mtt/hippy/bridge/HippyBridgeImpl", // NOLINT(cert-err58-cpp)
             "getHeapCodeStatistics",
             "(JLcom/tencent/mtt/hippy/common/Callback;)Z",
             GetHeapCodeStatistics)
REGISTER_JNI("com/tencent/mtt/hippy/bridge/HippyBridgeImpl", // NOLINT(cert-err58-cpp)
             "getHeapSpaceStatisticsList",
             "(JLcom/tencent/mtt/hippy/common/Callback;)Z",
             GetHeapSpaceStatisticsList)
REGISTER_JNI("com/tencent/mtt/hippy/bridge/HippyBridgeImpl", // NOLINT(cert-err58-cpp)
             "writeHeapSnapshot",
             "(JLjava/lang/String;Lcom/tencent/mtt/hippy/common/Callback;)Z",
             WriteHeapSnapshot)

using unicode_string_view = tdf::base::unicode_string_view;
using V8VM = hippy::napi::V8VM;

// [Heap] GetHeapStatistics
jboolean GetHeapStatistics(__unused JNIEnv* j_env,
                           __unused jobject j_object,
                           jlong j_runtime_id,
                           jobject j_callback) {
    TDF_BASE_DLOG(INFO) << "GetHeapStatistics begin, j_runtime_id = " << j_runtime_id;
    auto runtime_id = static_cast<int32_t>(j_runtime_id);
    std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
    // callback
    jclass j_cb_class = j_env->GetObjectClass(j_callback);
    jmethodID j_cb_method = j_env->GetMethodID(j_cb_class,"callback","(Ljava/lang/Object;Ljava/lang/Throwable;)V");
    std::shared_ptr<JavaRef> cb = std::make_shared<JavaRef>(j_env, j_callback);
    j_env->DeleteLocalRef(j_cb_class);
    // j_runtime_id invalid
    if (!runtime) {
        TDF_BASE_DLOG(WARNING) << "GetHeapStatistics, j_runtime_id invalid";
        j_env->CallVoidMethod(cb->GetObj(), j_cb_method, nullptr, nullptr);
        return JNI_FALSE;
    }
    // prepare jni class
    jclass j_hs_class = j_env->FindClass("com/tencent/mtt/hippy/bridge/heap/HeapStatistics");
    jclass j_global_hs_class = (jclass)j_env->NewGlobalRef(j_hs_class);
    j_env->DeleteLocalRef(j_hs_class);
    // js task runner
    std::shared_ptr<JavaScriptTaskRunner> task_runner = runtime->GetEngine()->GetJSRunner();
    std::unique_ptr<JavaScriptTask> task = std::make_unique<JavaScriptTask>();
    // js task callback
    task->callback = [runtime, cb, j_cb_method, j_global_hs_class] {
        TDF_BASE_DLOG(INFO) << "GetHeapStatistics thread begin";
        JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
        // v8 GetHeapStatistics
        auto heap_statistics = std::make_shared<v8::HeapStatistics>();
        v8::Isolate* isolate = std::static_pointer_cast<V8VM>(runtime->GetEngine()->GetVM())->isolate_;
        v8::HandleScope handle_scope(isolate);
        isolate->GetHeapStatistics(heap_statistics.get());
        // set data
        jmethodID j_hs_constructor = j_env->GetMethodID(j_global_hs_class,"<init>","(JJJJJJJJJJJJJ)V");
        jobject j_hs_obj = j_env->NewObject(j_global_hs_class,
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
        j_env->CallVoidMethod(cb->GetObj(), j_cb_method, j_hs_obj, nullptr);
        j_env->DeleteLocalRef(j_hs_obj);
        j_env->DeleteGlobalRef(j_global_hs_class);
        TDF_BASE_DLOG(INFO) << "GetHeapStatistics thread end";
    };
    task_runner->PostTask(std::move(task));
    TDF_BASE_DLOG(INFO) << "GetHeapStatistics end";
    return JNI_TRUE;
}
// [Heap] GetHeapCodeStatistics
jboolean GetHeapCodeStatistics(__unused JNIEnv* j_env,
                               __unused jobject j_object,
                               jlong j_runtime_id,
                               jobject j_callback) {
  TDF_BASE_DLOG(INFO) << "GetHeapCodeStatistics begin, j_runtime_id = " << j_runtime_id;
  auto runtime_id = static_cast<int32_t>(j_runtime_id);
  std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
  // callback
  jclass j_cb_class = j_env->GetObjectClass(j_callback);
  jmethodID j_cb_method = j_env->GetMethodID(j_cb_class,"callback","(Ljava/lang/Object;Ljava/lang/Throwable;)V");
  std::shared_ptr<JavaRef> cb = std::make_shared<JavaRef>(j_env, j_callback);
  j_env->DeleteLocalRef(j_cb_class);
  // j_runtime_id invalid
  if (!runtime) {
      TDF_BASE_DLOG(WARNING) << "GetHeapCodeStatistics, j_runtime_id invalid";
      j_env->CallVoidMethod(cb->GetObj(), j_cb_method, nullptr, nullptr);
      return JNI_FALSE;
  }
  // prepare jni class
  jclass j_hcs_class = j_env->FindClass("com/tencent/mtt/hippy/bridge/heap/HeapCodeStatistics");
  jclass j_global_hcs_class = (jclass)j_env->NewGlobalRef(j_hcs_class);
  j_env->DeleteLocalRef(j_hcs_class);
  // js task runner
  std::shared_ptr<JavaScriptTaskRunner> task_runner = runtime->GetEngine()->GetJSRunner();
  std::unique_ptr<JavaScriptTask> task = std::make_unique<JavaScriptTask>();
  // js task callback
  task->callback = [runtime, cb, j_cb_method, j_global_hcs_class] {
      TDF_BASE_DLOG(INFO) << "GetHeapCodeStatistics thread begin";
      JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
      // v8 GetHeapCodeAndMetadataStatistics
      auto heap_code_statistics = std::make_shared<v8::HeapCodeStatistics>();
      v8::Isolate* isolate = std::static_pointer_cast<V8VM>(runtime->GetEngine()->GetVM())->isolate_;
      v8::HandleScope handle_scope(isolate);
      isolate->GetHeapCodeAndMetadataStatistics(heap_code_statistics.get());
      // set data
      jmethodID j_hcs_constructor = j_env->GetMethodID(j_global_hcs_class,"<init>","(JJJ)V");
      jobject j_hcs_obj = j_env->NewObject(j_global_hcs_class,
                                           j_hcs_constructor,
                                           (long)heap_code_statistics->code_and_metadata_size(),
                                           (long)heap_code_statistics->bytecode_and_metadata_size(),
                                           (long)heap_code_statistics->external_script_source_size());
      j_env->CallVoidMethod(cb->GetObj(), j_cb_method, j_hcs_obj, nullptr);
      j_env->DeleteLocalRef(j_hcs_obj);
      j_env->DeleteGlobalRef(j_global_hcs_class);
      TDF_BASE_DLOG(INFO) << "GetHeapCodeStatistics thread end";
  };
  task_runner->PostTask(std::move(task));
  TDF_BASE_DLOG(INFO) << "GetHeapCodeStatistics end";
  return JNI_TRUE;
}
// [Heap] GetHeapSpaceStatisticsList
jboolean GetHeapSpaceStatisticsList(__unused JNIEnv* j_env,
                                    __unused jobject j_object,
                                    jlong j_runtime_id,
                                    jobject j_callback) {
    TDF_BASE_DLOG(INFO) << "GetHeapSpaceStatisticsList begin, j_runtime_id = " << j_runtime_id;
    auto runtime_id = static_cast<int32_t>(j_runtime_id);
    std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
    // callback
    jclass j_cb_class = j_env->GetObjectClass(j_callback);
    jmethodID j_cb_method = j_env->GetMethodID(j_cb_class,"callback","(Ljava/lang/Object;Ljava/lang/Throwable;)V");
    std::shared_ptr<JavaRef> cb = std::make_shared<JavaRef>(j_env, j_callback);
    j_env->DeleteLocalRef(j_cb_class);
    // j_runtime_id invalid
    if (!runtime) {
        TDF_BASE_DLOG(WARNING) << "GetHeapSpaceStatisticsList, j_runtime_id invalid";
        j_env->CallVoidMethod(cb->GetObj(), j_cb_method, nullptr, nullptr);
        return JNI_FALSE;
    }
    // prepare jni class
    jclass j_hss_class = j_env->FindClass("com/tencent/mtt/hippy/bridge/heap/HeapSpaceStatistics");
    jclass j_global_hss_class = (jclass)j_env->NewGlobalRef(j_hss_class);
    j_env->DeleteLocalRef(j_hss_class);
    jclass j_list_class = j_env->FindClass("java/util/ArrayList");
    jclass j_global_list_class = (jclass)j_env->NewGlobalRef(j_list_class);
    j_env->DeleteLocalRef(j_list_class);
    // js task runner
    std::shared_ptr<JavaScriptTaskRunner> task_runner = runtime->GetEngine()->GetJSRunner();
    std::unique_ptr<JavaScriptTask> task = std::make_unique<JavaScriptTask>();
    // js task callback
    task->callback = [runtime, cb, j_cb_method, j_global_hss_class, j_global_list_class] {
        TDF_BASE_DLOG(INFO) << "GetHeapSpaceStatisticsList thread begin";
        // init ArrayList<HeapSpaceStatistics>
        JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
        jmethodID j_list_constructor = j_env->GetMethodID(j_global_list_class , "<init>","()V");
        jobject j_list_obj = j_env->NewObject(j_global_list_class, j_list_constructor);
        jmethodID j_list_add  = j_env->GetMethodID(j_global_list_class,"add","(Ljava/lang/Object;)Z");
        jmethodID j_hss_constructor = j_env->GetMethodID(j_global_hss_class,"<init>","(Ljava/lang/String;JJJJ)V");
        j_env->DeleteGlobalRef(j_global_list_class);
        // v8 NumberOfHeapSpaces
        v8::Isolate* isolate = std::static_pointer_cast<V8VM>(runtime->GetEngine()->GetVM())->isolate_;
        v8::HandleScope handle_scope(isolate);
        size_t space_count = isolate->NumberOfHeapSpaces();
        TDF_BASE_DLOG(INFO) << "GetHeapSpaceStatisticsList thread, space_count = " << space_count;
        std::shared_ptr<v8::HeapSpaceStatistics> heap_space_statistics;
        // set data
        for(size_t i = 0 ; i < space_count ; i++)
        {
            // v8 GetHeapSpaceStatistics
            heap_space_statistics = std::make_shared<v8::HeapSpaceStatistics>();
            isolate->GetHeapSpaceStatistics(heap_space_statistics.get(), i);
            // set HeapSpaceStatistics data
            jstring j_space_name = j_env->NewStringUTF(heap_space_statistics->space_name());
            jobject j_hss_obj = j_env->NewObject(j_global_hss_class,
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
        j_env->CallVoidMethod(cb->GetObj(), j_cb_method, j_list_obj, nullptr);
        j_env->DeleteLocalRef(j_list_obj);
        j_env->DeleteGlobalRef(j_global_hss_class);
        TDF_BASE_DLOG(INFO) << "GetHeapSpaceStatisticsList thread end";
    };
    task_runner->PostTask(std::move(task));
    TDF_BASE_DLOG(INFO) << "GetHeapSpaceStatisticsList end";
    return JNI_TRUE;
}
// [Heap] WriteHeapSnapshot
jboolean WriteHeapSnapshot(__unused JNIEnv* j_env,
                           __unused jobject j_object,
                           jlong j_runtime_id,
                           jstring j_heap_snapshot_path,
                           jobject j_callback) {
    TDF_BASE_DLOG(INFO) << "WriteHeapSnapshot begin, j_runtime_id = " << j_runtime_id;
    auto runtime_id = static_cast<int32_t>(j_runtime_id);
    std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
    // callback
    jclass j_cb_class = j_env->GetObjectClass(j_callback);
    jmethodID j_cb_method = j_env->GetMethodID(j_cb_class,"callback","(Ljava/lang/Object;Ljava/lang/Throwable;)V");
    std::shared_ptr<JavaRef> cb = std::make_shared<JavaRef>(j_env, j_callback);
    j_env->DeleteLocalRef(j_cb_class);
    // callback code
    jclass j_int_class = j_env->FindClass("java/lang/Integer");
    jmethodID j_int_constructor = j_env->GetMethodID(j_int_class,"<init>","(I)V");
    jobject j_int_obj = j_env->AllocObject(j_int_class);
    std::shared_ptr<JavaRef> ret_code_obj = std::make_shared<JavaRef>(j_env, j_int_obj);
    j_env->DeleteLocalRef(j_int_class);
    j_env->DeleteLocalRef(j_int_obj);
    // error: runtime_id invalid
    if (!runtime) {
        TDF_BASE_DLOG(WARNING) << "WriteHeapSnapshot, j_runtime_id invalid";
        j_env->CallVoidMethod(ret_code_obj->GetObj(), j_int_constructor, (int)HEAP_WRITE_ERR_RUN);
        j_env->CallVoidMethod(cb->GetObj(), j_cb_method, ret_code_obj->GetObj(), nullptr);
        return JNI_FALSE;
    }
    const unicode_string_view heap_snapshot_path = JniUtils::ToStrView(j_env, j_heap_snapshot_path);
    // js task runner
    std::shared_ptr<JavaScriptTaskRunner> task_runner = runtime->GetEngine()->GetJSRunner();
    std::unique_ptr<JavaScriptTask> task = std::make_unique<JavaScriptTask>();
    task->callback = [runtime, cb, j_cb_method, ret_code_obj, j_int_constructor, heap_snapshot_path] {
        TDF_BASE_DLOG(INFO) << "WriteHeapSnapshot thread start";
        JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
        auto heap_snapshot_stream = std::make_shared<HeapSnapshotOutputStreamAdapter>();
        int set_file_err = heap_snapshot_stream->SetFilePath(heap_snapshot_path);
        // error: file_path invalid
        if (set_file_err) {
            TDF_BASE_DLOG(WARNING) << "WriteHeapSnapshot thread, set_file_err = " << set_file_err;
            j_env->CallVoidMethod(ret_code_obj->GetObj(), j_int_constructor, (int)HEAP_WRITE_ERR_FILE);
            j_env->CallVoidMethod(cb->GetObj(), j_cb_method, ret_code_obj->GetObj(), nullptr);
            return;
        }
        // v8 TakeHeapSnapshot and Serialize
        v8::Isolate* isolate = std::static_pointer_cast<V8VM>(runtime->GetEngine()->GetVM())->isolate_;
        v8::HandleScope handle_scope(isolate);
        v8::HeapProfiler* heap_profiler = isolate->GetHeapProfiler();
        heap_profiler->TakeHeapSnapshot()->Serialize(heap_snapshot_stream.get());
        heap_profiler->DeleteAllHeapSnapshots();
        // error: save heapSnapshots error
        if (heap_snapshot_stream->save_res_ != HeapSnapshotOutputStreamAdapter::sOk) {
            TDF_BASE_DLOG(WARNING) << "WriteHeapSnapshot thread, save heapSnapshots = " << heap_snapshot_stream->save_res_;
            j_env->CallVoidMethod(ret_code_obj->GetObj(), j_int_constructor, (int)HEAP_WRITE_ERR_SAVE);
            j_env->CallVoidMethod(cb->GetObj(), j_cb_method, ret_code_obj->GetObj(), nullptr);
            return;
        }
        j_env->CallVoidMethod(ret_code_obj->GetObj(), j_int_constructor, (int)HEAP_WRITE_OK);
        TDF_BASE_DLOG(INFO) << "WriteHeapSnapshot thread end";
        j_env->CallVoidMethod(cb->GetObj(), j_cb_method, ret_code_obj->GetObj(), nullptr);
    };
    task_runner->PostTask(std::move(task));
    TDF_BASE_DLOG(INFO) << "WriteHeapSnapshot end";
    return JNI_TRUE;
}

}  // namespace bridge
}  // namespace hippy
