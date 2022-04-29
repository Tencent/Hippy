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

#pragma once

#include <core/base/file.h>
#include <jni.h>
#include <sys/stat.h>
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wsign-conversion"
#include "v8/v8-profiler.h"
#pragma clang diagnostic pop
#include "jni/jni_utils.h"

#define HSOSA_FILE_OK 0
#define WRITE_HEAP_OK 0
#define WRITE_HEAP_ERR_RUN -1
#define WRITE_HEAP_ERR_FILE -2
#define WRITE_HEAP_ERR_SAVE -3

namespace hippy {
namespace bridge {
using unicode_string_view = tdf::base::unicode_string_view;

void setNativeLogHandler(JNIEnv* j_env, __unused jobject j_object, jobject j_logger);

jlong InitInstance(JNIEnv* j_env,
                   jobject j_object,
                   jbyteArray j_global_config,
                   jboolean j_single_thread_mode,
                   jboolean j_bridge_param_json,
                   jboolean j_is_dev_module,
                   jobject j_callback,
                   jlong j_group_id,
                   jobject j_vm_init_param);

void DestroyInstance(JNIEnv* j_env,
                     jobject j_object,
                     jlong j_runtime_id,
                     jboolean j_single_thread_mode,
                     jobject j_callback);

jboolean RunScriptFromUri(JNIEnv* j_env,
                          __unused jobject j_obj,
                          jstring j_uri,
                          jobject j_aasset_manager,
                          jboolean j_can_use_code_cache,
                          jstring j_code_cache_dir,
                          jlong j_runtime_id,
                          jobject j_cb);

// [Heap]
jobject GetHeapCodeStatistics(JNIEnv* j_env,
                              jobject j_object,
                              jlong j_runtime_id);
jobject GetHeapSpaceStatisticsList(JNIEnv* j_env,
                                   jobject j_object,
                                   jlong j_runtime_id);
jobject GetHeapStatistics(JNIEnv* j_env,
                          jobject j_object,
                          jlong j_runtime_id);
// Creating a heap snapshot requires memory about twice the size of the heap at the time the snapshot is created.
// This results in the risk of OOM killers terminating the process.
jint WriteHeapSnapshot(JNIEnv* j_env,
                       jobject j_object,
                       jlong j_runtime_id,
                       jstring j_heap_snapshot_path);
// [Heap] HeapSnapshot OutputStream
class HeapSnapshotOutputStreamAdapter : public v8::OutputStream {
private:
    unicode_string_view m_file_path;
public:
    enum SaveResult {
        sInit = 0,
        sOk = 1,
        sError = 2
    };
    SaveResult save_res_ = sInit;
    void EndOfStream(){
        save_res_ = sOk;
        return;
    }
    int GetChunkSize(){
        return 1024;
    }
    WriteResult WriteAsciiChunk(char* data, int size) {
        if (!base::StringViewUtils::IsEmpty(m_file_path)) {
            // save to file
            std::string heap_snapshot_chunk_data =
                    base::StringViewUtils::ToU8StdStr(data);
            bool save_file_ret =
                    base::HippyFile::SaveFile(m_file_path, heap_snapshot_chunk_data, std::ios::app);
            if (!save_file_ret) {
                TDF_BASE_DLOG(WARNING) << "HeapSnapshotOutputStreamAdapter save file error";
                save_res_ = sError;
                return kAbort;
            }
        }
        return kContinue;
    }
    WriteResult WriteHeapStatsChunk(v8::HeapStatsUpdate* data, int count) {
        save_res_ = sError;
        return kAbort;
    }

    int SetFilePath(const unicode_string_view& snapshot_file_path) {
        TDF_BASE_DLOG(INFO) << "HeapSnapshotOutputStreamAdapter SetFilePath heap_snapshot_file_path = " << snapshot_file_path;
        int result = HSOSA_FILE_OK;
        size_t pos =
                base::StringViewUtils::FindLastOf(snapshot_file_path, EXTEND_LITERAL('/'));
        unicode_string_view snapshot_parent_dir =
                base::StringViewUtils::SubStr(snapshot_file_path, 0, pos);
        int check_parent_dir_ret =
                base::HippyFile::CheckDir(snapshot_parent_dir, F_OK);
        // no file or no permission
        if (check_parent_dir_ret) {
            TDF_BASE_DLOG(INFO) << "HeapSnapshotOutputStreamAdapter SetFilePath check_heap_snapshot_parent_dir_ret = " << check_parent_dir_ret;
            result = base::HippyFile::CreateDir(snapshot_parent_dir, S_IRWXU);
        }
        if (!result) {
            save_res_ = sInit;
            m_file_path = snapshot_file_path;
        } else {
            save_res_ = sError;
        }
        TDF_BASE_DLOG(INFO) << "HeapSnapshotOutputStreamAdapter SetFilePath result = " << result;
        return result;
    }
};

}  // namespace bridge
}  // namespace hippy
