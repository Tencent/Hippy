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

#pragma once

#include <jni.h>
#include <sys/stat.h>
#include "core/base/file.h"
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wsign-conversion"
#include "v8/v8-profiler.h"
#pragma clang diagnostic pop

namespace hippy {
namespace bridge {
// [Heap] GetHeapStatistics
jboolean GetHeapStatistics(JNIEnv *j_env,
                           jobject j_object,
                           jlong j_runtime_id,
                           jobject j_callback);
// [Heap] GetHeapCodeStatistics
jboolean GetHeapCodeStatistics(JNIEnv *j_env,
                               jobject j_object,
                               jlong j_runtime_id,
                               jobject j_callback);
// [Heap] GetHeapSpaceStatistics
jboolean GetHeapSpaceStatistics(JNIEnv *j_env,
                                jobject j_object,
                                jlong j_runtime_id,
                                jobject j_callback);
// [Heap] WriteHeapSnapshot
// Creating a heap snapshot requires memory about twice the size of the heap at the time the snapshot is created.
// This results in the risk of OOM killers terminating the process.
jboolean WriteHeapSnapshot(JNIEnv *j_env,
                           jobject j_object,
                           jlong j_runtime_id,
                           jstring j_heap_snapshot_path,
                           jobject j_callback);
}  // namespace bridge
}  // namespace hippy
