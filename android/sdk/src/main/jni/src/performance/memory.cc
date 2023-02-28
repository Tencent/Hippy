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

#include "performance/memory.h"

#include "bridge/runtime.h"
#include "jni/jni_env.h"
#include "jni/jni_register.h"
#include "jni/jni_utils.h"

namespace hippy {
namespace bridge {

// [Heap]
REGISTER_JNI("com/tencent/mtt/hippy/v8/V8", // NOLINT(cert-err58-cpp)
             "getHeapStatistics",
             "(JLcom/tencent/mtt/hippy/common/Callback;)Z",
             GetHeapStatistics)
REGISTER_JNI("com/tencent/mtt/hippy/v8/V8", // NOLINT(cert-err58-cpp)
             "getHeapCodeStatistics",
             "(JLcom/tencent/mtt/hippy/common/Callback;)Z",
             GetHeapCodeStatistics)
REGISTER_JNI("com/tencent/mtt/hippy/v8/V8", // NOLINT(cert-err58-cpp)
             "getHeapSpaceStatistics",
             "(JLcom/tencent/mtt/hippy/common/Callback;)Z",
             GetHeapSpaceStatistics)
REGISTER_JNI("com/tencent/mtt/hippy/v8/V8", // NOLINT(cert-err58-cpp)
             "writeHeapSnapshot",
             "(JLjava/lang/String;Lcom/tencent/mtt/hippy/common/Callback;)Z",
             WriteHeapSnapshot)

jint ThrowNoSuchMethodError(JNIEnv* j_env, const char* msg){
  auto j_class = j_env->FindClass("java/lang/NoSuchMethodException" );
  TDF_BASE_CHECK(j_class);
  return j_env->ThrowNew(j_class, msg);
}

using unicode_string_view = tdf::base::unicode_string_view;
using V8VM = hippy::vm::V8VM;

#ifndef V8_X5_LITE

// [Heap] write result code
enum HEAP_WRITE : int8_t {
  HEAP_WRITE_OK = 0,
  HEAP_WRITE_ERR_RUN = -1,
  HEAP_WRITE_ERR_FILE = -2,
  HEAP_WRITE_ERR_SAVE = -3
};

// [Heap] HeapSnapshot OutputStream
class HeapSnapshotOutputStreamAdapter : public v8::OutputStream {
 private:
  std::ofstream file_;
 public:
  static constexpr uint16_t kChunkSize = 1024;
  enum SaveResult : int8_t {
    kInit = 0,
    kOk = 1,
    kError = 2
  };
  SaveResult save_res_ = kInit;
  void EndOfStream() override {
    save_res_ = kOk;
    file_.close();
  }
  int GetChunkSize() override {
    return kChunkSize;
  }
  WriteResult WriteAsciiChunk(char *data, int size) override {
    if (file_.is_open()) {
      file_.write(data, size);
    }
    return kContinue;
  }
  WriteResult WriteHeapStatsChunk(v8::HeapStatsUpdate *data, int count) override {
    save_res_ = kError;
    return kAbort;
  }

  int SetFilePath(const tdf::base::unicode_string_view &snapshot_file_path) {
    TDF_BASE_DLOG(INFO) << "HeapSnapshotOutputStreamAdapter SetFilePath heap_snapshot_file_path = "
                        << snapshot_file_path;
    int result_code = 0;
    size_t pos = base::StringViewUtils::FindLastOf(snapshot_file_path, EXTEND_LITERAL('/'));
    tdf::base::unicode_string_view
        snapshot_parent_dir = base::StringViewUtils::SubStr(snapshot_file_path, 0, pos);
    int check_parent_dir_code = base::HippyFile::CheckDir(snapshot_parent_dir, F_OK);
    // no file or no permission
    if (check_parent_dir_code) {
      TDF_BASE_DLOG(INFO)
      << "HeapSnapshotOutputStreamAdapter SetFilePath check_heap_snapshot_parent_dir_code = "
      << check_parent_dir_code;
      result_code = base::HippyFile::CreateDir(snapshot_parent_dir, S_IRWXU);
    }
    if (result_code) {
      save_res_ = kError;
    } else {
      save_res_ = kInit;
      TDF_BASE_DLOG(INFO) << "HeapSnapshotOutputStreamAdapter open file " << snapshot_file_path;
      tdf::base::unicode_string_view owner(""_u8s);
      const char *path = base::StringViewUtils::ToConstCharPointer(snapshot_file_path, owner);
      file_.open(path, std::ios::out | std::ios::ate | std::ios::binary);
    }
    TDF_BASE_DLOG(INFO) << "HeapSnapshotOutputStreamAdapter SetFilePath result " << result_code;
    return result_code;
  }
};
#endif

// [Heap] GetHeapStatistics
jboolean GetHeapStatistics(__unused JNIEnv *j_env,
                           __unused jobject j_object,
                           jlong j_runtime_id,
                           jobject j_callback) {
  TDF_BASE_DLOG(INFO) << "GetHeapStatistics begin, j_runtime_id = " << j_runtime_id;
  auto runtime = Runtime::Find(hippy::base::checked_numeric_cast<jlong, int32_t>(j_runtime_id));
  // callback
  jclass j_cb_class = j_env->GetObjectClass(j_callback);
  jmethodID j_cb_method =
      j_env->GetMethodID(j_cb_class, "callback", "(Ljava/lang/Object;Ljava/lang/Throwable;)V");
  std::shared_ptr<JavaRef> cb = std::make_shared<JavaRef>(j_env, j_callback);
  j_env->DeleteLocalRef(j_cb_class);
  // j_runtime_id invalid
  if (!runtime) {
    TDF_BASE_DLOG(WARNING) << "GetHeapStatistics, j_runtime_id invalid";
    j_env->CallVoidMethod(cb->GetObj(), j_cb_method, nullptr, nullptr);
    JNIEnvironment::ClearJEnvException(j_env);
    return JNI_FALSE;
  }
  // prepare jni class
  jclass j_hs_class = j_env->FindClass("com/tencent/mtt/hippy/v8/memory/V8HeapStatistics");
  std::shared_ptr<JavaRef> hs_class = std::make_shared<JavaRef>(j_env, j_hs_class);
  j_env->DeleteLocalRef(j_hs_class);

  TDF_BASE_DLOG(INFO) << "GetHeapStatistics thread begin";
  // v8 GetHeapStatistics
  auto heap_statistics = std::make_shared<v8::HeapStatistics>();
  v8::Isolate *isolate = std::static_pointer_cast<V8VM>(runtime->GetEngine()->GetVM())->isolate_;
  v8::HandleScope handle_scope(isolate);
  isolate->GetHeapStatistics(heap_statistics.get());
  // set data
  jmethodID j_hs_constructor =
      j_env->GetMethodID(reinterpret_cast<jclass>(hs_class->GetObj()), "<init>", "(JJJJJJJJJJJJJ)V");
  std::shared_ptr<JavaRef> hs_obj = std::make_shared<JavaRef>(j_env,
                                                              j_env->NewObject(
                                                                  reinterpret_cast<jclass>(hs_class->GetObj()),
                                                                  j_hs_constructor,
                                                                  heap_statistics->total_heap_size(),
                                                                  heap_statistics->total_heap_size_executable(),
                                                                  heap_statistics->total_physical_size(),
                                                                  heap_statistics->total_available_size(),
#if (V8_MAJOR_VERSION == 9 && V8_MINOR_VERSION == 8 && V8_BUILD_NUMBER >= 124) || (V8_MAJOR_VERSION == 9 && V8_MINOR_VERSION > 8) || (V8_MAJOR_VERSION > 9)
                                                                  heap_statistics->total_global_handles_size(),
                                                                  heap_statistics->used_global_handles_size(),
#else
                                                                  -1,
                                                                  -1,
#endif
                                                                  heap_statistics->used_heap_size(),
                                                                  heap_statistics->heap_size_limit(),
                                                                  heap_statistics->malloced_memory(),
                                                                  heap_statistics->external_memory(),
                                                                  heap_statistics->peak_malloced_memory(),
                                                                  heap_statistics->number_of_native_contexts(),
                                                                  heap_statistics->number_of_detached_contexts()));
  j_env->CallVoidMethod(cb->GetObj(), j_cb_method, hs_obj->GetObj(), nullptr);
  JNIEnvironment::ClearJEnvException(j_env);
  TDF_BASE_DLOG(INFO) << "GetHeapStatistics thread end";
  return JNI_TRUE;
}
// [Heap] GetHeapCodeStatistics
jboolean GetHeapCodeStatistics(__unused JNIEnv *j_env,
                               __unused jobject j_object,
                               jlong j_runtime_id,
                               jobject j_callback) {
  TDF_BASE_DLOG(INFO) << "GetHeapCodeStatistics begin, j_runtime_id = " << j_runtime_id;
  auto runtime = Runtime::Find(hippy::base::checked_numeric_cast<jlong, int32_t>(j_runtime_id));
  // callback
  jclass j_cb_class = j_env->GetObjectClass(j_callback);
  jmethodID j_cb_method =
      j_env->GetMethodID(j_cb_class, "callback", "(Ljava/lang/Object;Ljava/lang/Throwable;)V");
  std::shared_ptr<JavaRef> cb = std::make_shared<JavaRef>(j_env, j_callback);
  j_env->DeleteLocalRef(j_cb_class);
  // j_runtime_id invalid
  if (!runtime) {
    TDF_BASE_DLOG(WARNING) << "GetHeapCodeStatistics, j_runtime_id invalid";
    j_env->CallVoidMethod(cb->GetObj(), j_cb_method, nullptr, nullptr);
    JNIEnvironment::ClearJEnvException(j_env);
    return JNI_FALSE;
  }
  // prepare jni class
  jclass j_hcs_class = j_env->FindClass("com/tencent/mtt/hippy/v8/memory/V8HeapCodeStatistics");
  std::shared_ptr<JavaRef> hcs_class = std::make_shared<JavaRef>(j_env, j_hcs_class);
  j_env->DeleteLocalRef(j_hcs_class);

  TDF_BASE_DLOG(INFO) << "GetHeapCodeStatistics thread begin";
  // v8 GetHeapCodeAndMetadataStatistics
  auto heap_code_statistics = std::make_shared<v8::HeapCodeStatistics>();
  v8::Isolate *isolate = std::static_pointer_cast<V8VM>(runtime->GetEngine()->GetVM())->isolate_;
  v8::HandleScope handle_scope(isolate);
  isolate->GetHeapCodeAndMetadataStatistics(heap_code_statistics.get());
  // set data
  jmethodID j_hcs_constructor =
      j_env->GetMethodID(reinterpret_cast<jclass>(hcs_class->GetObj()), "<init>", "(JJJ)V");
  std::shared_ptr<JavaRef> hcs_obj = std::make_shared<JavaRef>(j_env,
                                                               j_env->NewObject(
                                                                   reinterpret_cast<jclass>(hcs_class->GetObj()),
                                                                   j_hcs_constructor,
                                                                   heap_code_statistics->code_and_metadata_size(),
                                                                   heap_code_statistics->bytecode_and_metadata_size(),
                                                                   heap_code_statistics->external_script_source_size()));
  j_env->CallVoidMethod(cb->GetObj(), j_cb_method, hcs_obj->GetObj(), nullptr);
  JNIEnvironment::ClearJEnvException(j_env);
  TDF_BASE_DLOG(INFO) << "GetHeapCodeStatistics thread end";
  return JNI_TRUE;
}
// [Heap] GetHeapSpaceStatistics
jboolean GetHeapSpaceStatistics(__unused JNIEnv *j_env,
                                __unused jobject j_object,
                                jlong j_runtime_id,
                                jobject j_callback) {
  TDF_BASE_DLOG(INFO) << "GetHeapSpaceStatistics begin, j_runtime_id = " << j_runtime_id;
  auto runtime = Runtime::Find(hippy::base::checked_numeric_cast<jlong, int32_t>(j_runtime_id));
  // callback
  jclass j_cb_class = j_env->GetObjectClass(j_callback);
  jmethodID j_cb_method =
      j_env->GetMethodID(j_cb_class, "callback", "(Ljava/lang/Object;Ljava/lang/Throwable;)V");
  std::shared_ptr<JavaRef> cb = std::make_shared<JavaRef>(j_env, j_callback);
  j_env->DeleteLocalRef(j_cb_class);
  // j_runtime_id invalid
  if (!runtime) {
    TDF_BASE_DLOG(WARNING) << "GetHeapSpaceStatistics, j_runtime_id invalid";
    j_env->CallVoidMethod(cb->GetObj(), j_cb_method, nullptr, nullptr);
    JNIEnvironment::ClearJEnvException(j_env);
    return JNI_FALSE;
  }
  // prepare jni class
  jclass j_hss_class = j_env->FindClass("com/tencent/mtt/hippy/v8/memory/V8HeapSpaceStatistics");
  std::shared_ptr<JavaRef> hss_class = std::make_shared<JavaRef>(j_env, j_hss_class);
  j_env->DeleteLocalRef(j_hss_class);
  jclass j_list_class = j_env->FindClass("java/util/ArrayList");
  std::shared_ptr<JavaRef> list_class = std::make_shared<JavaRef>(j_env, j_list_class);
  j_env->DeleteLocalRef(j_list_class);

  TDF_BASE_DLOG(INFO) << "GetHeapSpaceStatistics thread begin";
  // init ArrayList<HeapSpaceStatistics>
  jmethodID j_list_constructor =
      j_env->GetMethodID(reinterpret_cast<jclass>(list_class->GetObj()), "<init>", "()V");
  std::shared_ptr<JavaRef> list_obj = std::make_shared<JavaRef>(j_env,
                                                                j_env->NewObject(
                                                                    reinterpret_cast<jclass>(list_class->GetObj()),
                                                                    j_list_constructor));
  jmethodID j_list_add = j_env->GetMethodID(reinterpret_cast<jclass>(list_class->GetObj()),
                                            "add",
                                            "(Ljava/lang/Object;)Z");
  jmethodID j_hss_constructor = j_env->GetMethodID(reinterpret_cast<jclass>(hss_class->GetObj()),
                                                   "<init>",
                                                   "(Ljava/lang/String;JJJJ)V");
  // v8 NumberOfHeapSpaces
  v8::Isolate *isolate = std::static_pointer_cast<V8VM>(runtime->GetEngine()->GetVM())->isolate_;
  v8::HandleScope handle_scope(isolate);
  size_t space_count = isolate->NumberOfHeapSpaces();
  TDF_BASE_DLOG(INFO) << "GetHeapSpaceStatistics thread, space_count = " << space_count;
  std::shared_ptr<v8::HeapSpaceStatistics> heap_space_statistics;
  // set data
  for (size_t i = 0; i < space_count; i++) {
    // v8 getHeapSpaceStatistics
    heap_space_statistics = std::make_shared<v8::HeapSpaceStatistics>();
    isolate->GetHeapSpaceStatistics(heap_space_statistics.get(), i);
    // set HeapSpaceStatistics data
    jstring j_space_name = j_env->NewStringUTF(heap_space_statistics->space_name());
    std::shared_ptr<JavaRef> hss_obj = std::make_shared<JavaRef>(j_env,
                                                                 j_env->NewObject(
                                                                     reinterpret_cast<jclass>(hss_class->GetObj()),
                                                                     j_hss_constructor,
                                                                     j_space_name,
                                                                     heap_space_statistics->space_size(),
                                                                     heap_space_statistics->space_used_size(),
                                                                     heap_space_statistics->space_available_size(),
                                                                     heap_space_statistics->physical_space_size()));
    j_env->CallBooleanMethod(list_obj->GetObj(), j_list_add, hss_obj->GetObj());
    JNIEnvironment::ClearJEnvException(j_env);
    j_env->DeleteLocalRef(j_space_name);
  }
  j_env->CallVoidMethod(cb->GetObj(), j_cb_method, list_obj->GetObj(), nullptr);
  JNIEnvironment::ClearJEnvException(j_env);
  TDF_BASE_DLOG(INFO) << "GetHeapSpaceStatistics thread end";
  return JNI_TRUE;
}
// [Heap] WriteHeapSnapshot
jboolean WriteHeapSnapshot(__unused JNIEnv *j_env,
                           __unused jobject j_object,
                           jlong j_runtime_id,
                           jstring j_heap_snapshot_path,
                           jobject j_callback) {
#ifndef V8_X5_LITE
  TDF_BASE_DLOG(INFO) << "WriteHeapSnapshot begin, j_runtime_id = " << j_runtime_id;
  auto runtime = Runtime::Find(hippy::base::checked_numeric_cast<jlong, int32_t>(j_runtime_id));
  // callback
  jclass j_cb_class = j_env->GetObjectClass(j_callback);
  jmethodID j_cb_method =
      j_env->GetMethodID(j_cb_class, "callback", "(Ljava/lang/Object;Ljava/lang/Throwable;)V");
  std::shared_ptr<JavaRef> cb = std::make_shared<JavaRef>(j_env, j_callback);
  j_env->DeleteLocalRef(j_cb_class);
  // callback code
  jclass j_int_class = j_env->FindClass("java/lang/Integer");
  jmethodID j_int_constructor = j_env->GetMethodID(j_int_class, "<init>", "(I)V");
  std::shared_ptr<JavaRef>
      int_obj = std::make_shared<JavaRef>(j_env, j_env->AllocObject(j_int_class));
  std::shared_ptr<JavaRef> ret_code_obj = std::make_shared<JavaRef>(j_env, int_obj->GetObj());
  j_env->DeleteLocalRef(j_int_class);
  // error: runtime_id invalid
  if (!runtime) {
    TDF_BASE_DLOG(WARNING) << "WriteHeapSnapshot, j_runtime_id invalid";
    j_env->CallVoidMethod(ret_code_obj->GetObj(),
                          j_int_constructor,
                          static_cast<jint>(HEAP_WRITE_ERR_RUN));
    JNIEnvironment::ClearJEnvException(j_env);
    j_env->CallVoidMethod(cb->GetObj(), j_cb_method, ret_code_obj->GetObj(), nullptr);
    JNIEnvironment::ClearJEnvException(j_env);
    return JNI_FALSE;
  }
  const unicode_string_view heap_snapshot_path = JniUtils::ToStrView(j_env, j_heap_snapshot_path);
  TDF_BASE_DLOG(INFO) << "WriteHeapSnapshot thread start";
  auto heap_snapshot_stream = std::make_shared<HeapSnapshotOutputStreamAdapter>();
  int set_file_err = heap_snapshot_stream->SetFilePath(heap_snapshot_path);
  // error: file_path invalid
  if (set_file_err) {
    TDF_BASE_DLOG(WARNING) << "WriteHeapSnapshot thread, set_file_err = " << set_file_err;
    j_env->CallVoidMethod(ret_code_obj->GetObj(),
                          j_int_constructor,
                          static_cast<jint>(HEAP_WRITE_ERR_FILE));
    JNIEnvironment::ClearJEnvException(j_env);
    j_env->CallVoidMethod(cb->GetObj(), j_cb_method, ret_code_obj->GetObj(), nullptr);
    JNIEnvironment::ClearJEnvException(j_env);
    return JNI_FALSE;
  }
  v8::Isolate *isolate = std::static_pointer_cast<V8VM>(runtime->GetEngine()->GetVM())->isolate_;
  v8::HandleScope handle_scope(isolate);
  // v8 TakeHeapSnapshot and Serialize
  auto heap_snapshot = isolate->GetHeapProfiler()->TakeHeapSnapshot();
  heap_snapshot->Serialize(heap_snapshot_stream.get());
  const_cast<v8::HeapSnapshot *>(heap_snapshot)->Delete();
  // error: save heapSnapshots error
  if (heap_snapshot_stream->save_res_ != HeapSnapshotOutputStreamAdapter::kOk) {
    TDF_BASE_DLOG(WARNING) << "WriteHeapSnapshot RequestInterrupt, save heapSnapshots = "
                           << heap_snapshot_stream->save_res_;
    j_env->CallVoidMethod(ret_code_obj->GetObj(),
                          j_int_constructor,
                          static_cast<jint>(HEAP_WRITE_ERR_SAVE));
    JNIEnvironment::ClearJEnvException(j_env);
    j_env->CallVoidMethod(cb->GetObj(), j_cb_method, ret_code_obj->GetObj(), nullptr);
    JNIEnvironment::ClearJEnvException(j_env);
    return JNI_FALSE;
  }
  j_env->CallVoidMethod(ret_code_obj->GetObj(),
                        j_int_constructor,
                        static_cast<jint>(HEAP_WRITE_OK));
  JNIEnvironment::ClearJEnvException(j_env);
  j_env->CallVoidMethod(cb->GetObj(), j_cb_method, ret_code_obj->GetObj(), nullptr);
  JNIEnvironment::ClearJEnvException(j_env);
  TDF_BASE_DLOG(INFO) << "WriteHeapSnapshot thread end";
  return JNI_TRUE;
#else
  ThrowNoSuchMethodError(j_env, "X5 lite has no WriteHeapSnapshot method");
  return JNI_FALSE;
#endif
}

//#endif

}  // namespace bridge
}  // namespace hippy
