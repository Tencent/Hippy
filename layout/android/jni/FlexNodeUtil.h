/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#ifndef com_tencent_smtt_flexbox_FlexNode_JniUtil
#define com_tencent_smtt_flexbox_FlexNode_JniUtil

#include <string.h>
#include <jni.h>

#define JNI_GENERATOR_EXPORT extern "C" __attribute__((visibility("default")))

#define CHECK_NATIVE_PTR(env, jcaller, native_ptr, method_name, ...) 

//#define FLEX_NODE_LOG_CHECK 0
#ifdef FLEX_NODE_LOG_CHECK
#define FLEX_NODE_LOG(...) __android_log_print(ANDROID_LOG_INFO, "flexnode", __VA_ARGS__)
#else
#define FLEX_NODE_LOG(...)
#endif

#endif
