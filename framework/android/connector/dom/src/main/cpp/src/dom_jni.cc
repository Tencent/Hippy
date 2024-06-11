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

#include "connector/dom_jni.h"

#include "dom/dom_manager.h"
#include "dom/root_node.h"
#include "footstone/check.h"
#include "footstone/logging.h"
#include "footstone/persistent_object_map.h"
#include "footstone/task_runner.h"
#include "footstone/worker_impl.h"
#include "jni/jni_register.h"
#include "jni/data_holder.h"
#include "jni/jni_env.h"
#include "jni/scoped_java_ref.h"

namespace hippy {
inline namespace framework {
inline namespace connector {
inline namespace dom {

REGISTER_JNI("com/openhippy/connector/DomManager", // NOLINT(cert-err58-cpp)
             "createDomManager",
             "()I",
             CreateDomManager)

REGISTER_JNI("com/openhippy/connector/DomManager", // NOLINT(cert-err58-cpp)
             "destroyDomManager",
             "(I)V",
             DestroyDomManager)

REGISTER_JNI("com/openhippy/connector/DomManager", // NOLINT(cert-err58-cpp)
             "onAttachToRenderer",
             "(II)V",
             SetRenderManager)

REGISTER_JNI("com/openhippy/connector/DomManager", // NOLINT(cert-err58-cpp)
             "createRootNode",
             "(IF)V",
             CreateRoot)

REGISTER_JNI("com/openhippy/connector/DomManager", // NOLINT(cert-err58-cpp)
             "destroyRootNode",
             "(I)V",
             DestroyRoot)

REGISTER_JNI("com/openhippy/connector/DomManager", // NOLINT(cert-err58-cpp)
             "releaseRootResources",
             "(I)V",
             ReleaseRootResources)

REGISTER_JNI("com/openhippy/connector/DomManager", // NOLINT(cert-err58-cpp)
             "setDomManager",
             "(II)V",
             SetDomManager)

using WorkerImpl = footstone::WorkerImpl;
using TaskRunner = footstone::TaskRunner;

constexpr char kDomWorkerName[] = "dom_worker";
constexpr char kDomRunnerName[] = "dom_task_runner";

void CreateRoot(JNIEnv* j_env,
                __unused jobject j_obj,
                jint j_root_id,
                jfloat j_density) {
  auto root_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_root_id);
  auto root_node = std::make_shared<hippy::RootNode>(root_id);
  auto layout = root_node->GetLayoutNode();
  layout->SetScaleFactor(static_cast<float>(j_density));
  auto& persistent_map = RootNode::PersistentMap();
  auto flag = persistent_map.Insert(root_id, root_node);
  FOOTSTONE_DCHECK(flag);
}

void DestroyRoot(JNIEnv* j_env,
                 __unused jobject j_obj,
                 jint j_root_id) {
  auto root_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_root_id);
  auto& persistent_map = RootNode::PersistentMap();
  auto flag = persistent_map.Erase(root_id);
  FOOTSTONE_DCHECK(flag);
}

void ReleaseRootResources(JNIEnv* j_env,
                          __unused jobject j_obj,
                          jint j_root_id) {
  auto root_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_root_id);
  auto& persistent_map = RootNode::PersistentMap();
  std::shared_ptr<RootNode> root_node;
  auto flag = persistent_map.Find(root_id, root_node);
  FOOTSTONE_DCHECK(flag);
  if (flag) {
    root_node->ReleaseResources();
  }
}

void SetDomManager(JNIEnv* j_env,
                   __unused jobject j_obj,
                   jint j_root_id,
                   jint j_dom_id) {
  auto root_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_root_id);
  std::shared_ptr<RootNode> root_node;
  auto& persistent_map = RootNode::PersistentMap();
  auto flag = persistent_map.Find(root_id, root_node);
  FOOTSTONE_CHECK(flag);

  auto dom_manager_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_dom_id);
  std::any dom_manager;
  flag = hippy::global_data_holder.Find(dom_manager_id, dom_manager);
  FOOTSTONE_CHECK(flag);
  auto dom_manager_object = std::any_cast<std::shared_ptr<DomManager>>(dom_manager);

  root_node->SetDomManager(dom_manager_object);
}

static void SetThreadPriority(jobject j_object) {
  auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  auto j_class = j_env->GetObjectClass(j_object);
  if (!j_class) {
    FOOTSTONE_LOG(ERROR) << "CallJavaMethod j_class error";
    return;
  }
  auto j_cb_id = j_env->GetMethodID(j_class, "setThreadPrority", "()V");
  if (!j_cb_id) {
    FOOTSTONE_LOG(ERROR) << "CallJavaMethod j_cb_id error";
    return;
  }
  j_env->CallVoidMethod(j_object, j_cb_id);
  JNIEnvironment::ClearJEnvException(j_env);
  j_env->DeleteLocalRef(j_class);
}

jint CreateDomManager(JNIEnv* j_env, jobject j_obj) {
  auto dom_manager = std::make_shared<DomManager>();
  auto dom_id = hippy::global_data_holder_key.fetch_add(1);
  hippy::global_data_holder.Insert(dom_id, dom_manager);
  auto worker = std::make_shared<WorkerImpl>(kDomWorkerName, false);
  auto callback = std::make_shared<JavaRef>(j_env, j_obj);
  worker->BeforeStart([callback]() {
    if (callback->GetObj()) SetThreadPriority(callback->GetObj());
  });
  worker->Start();
  auto runner = std::make_shared<TaskRunner>(kDomRunnerName);
  runner->SetWorker(worker);
  worker->Bind({runner});
  dom_manager->SetTaskRunner(runner);
  dom_manager->SetWorker(worker);
  return footstone::checked_numeric_cast<uint32_t, jint>(dom_id);
}

void DestroyDomManager(__unused JNIEnv* j_env, __unused jobject j_obj, jint j_dom_id) {
  auto dom_manager_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_dom_id);
  std::any dom_manager;
  auto flag = hippy::global_data_holder.Find(dom_manager_id, dom_manager);
  FOOTSTONE_CHECK(flag);
  auto dom_manager_object = std::any_cast<std::shared_ptr<DomManager>>(dom_manager);
  dom_manager_object->GetWorker()->Terminate();
  flag = hippy::global_data_holder.Erase(dom_manager_id);
  FOOTSTONE_DCHECK(flag);
}

void SetRenderManager(JNIEnv* j_env,
                      __unused jobject j_obj,
                      jint j_dom_manager_id,
                      jint j_render_id) {
  auto render_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_render_id);
  std::any render_manager;
  auto flag = hippy::global_data_holder.Find(render_id, render_manager);
  FOOTSTONE_CHECK(flag);
  auto render_manager_object = std::any_cast<std::shared_ptr<RenderManager>>(render_manager);

  auto dom_manager_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_dom_manager_id);
  std::any dom_manager;
  flag = hippy::global_data_holder.Find(dom_manager_id, dom_manager);
  FOOTSTONE_CHECK(flag);
  auto dom_manager_object = std::any_cast<std::shared_ptr<DomManager>>(dom_manager);
  dom_manager_object->SetRenderManager(render_manager_object);
}

}
}
}
}


