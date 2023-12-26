/*
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
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include "vfs/vfs_manager_napi.h"
#include <sys/stat.h>
#include <any>
#include <future>
#include <memory>
#include <mutex>
#include <string>
#include <unordered_map>
#include <js_native_api.h>
#include <js_native_api_types.h>
#include "oh_napi/data_holder.h"
#include "oh_napi/oh_napi_register.h"
#include "oh_napi/ark_ts.h"
#include "footstone/check.h"
#include "footstone/deserializer.h"
#include "footstone/hippy_value.h"
#include "footstone/persistent_object_map.h"
#include "footstone/string_view_utils.h"
#include "footstone/worker_manager.h"
#include "vfs/handler/asset_handler.h"
#include "vfs/handler/file_handler.h"
#include "vfs/handler/napi_delegate_handler.h"
#include "vfs/uri_loader.h"

namespace hippy {
inline namespace framework {
inline namespace bridge {

using string_view = footstone::stringview::string_view;
using TaskRunner = footstone::runner::TaskRunner;
using Task = footstone::runner::Task;
using WorkerManager = footstone::WorkerManager;
using u8string = string_view::u8string;
using StringViewUtils = footstone::stringview::StringViewUtils;
using UriLoader = hippy::vfs::UriLoader;

constexpr char kFileSchema[] = "file";

static napi_value CreateVfs(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  auto ts_vfs_delegate_ref = arkTs.CreateReference(args[0]);
  
  auto delegate = std::make_shared<NapiDelegateHandler>(env, ts_vfs_delegate_ref);
  auto vfs_id = hippy::global_data_holder_key.fetch_add(1);
  auto loader = std::make_shared<UriLoader>();
  auto file_delegate = std::make_shared<FileHandler>();
  loader->RegisterUriHandler(kFileSchema, file_delegate);
  loader->PushDefaultHandler(delegate);

  hippy::global_data_holder.Insert(vfs_id, loader);
  return arkTs.CreateInt(static_cast<int>(vfs_id));
}

static napi_value DestroyVfs(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info, 1);
  uint32_t vfs_id = static_cast<uint32_t>(arkTs.GetInteger(args[0]));

  std::any vfs;
  auto flag = hippy::global_data_holder.Find(vfs_id, vfs);
  FOOTSTONE_CHECK(flag);
  auto vfs_object = std::any_cast<std::shared_ptr<UriLoader>>(vfs);
  vfs_object->Terminate();
  flag = hippy::global_data_holder.Erase(vfs_id);
  FOOTSTONE_DCHECK(flag);

  return arkTs.GetUndefined();
}

REGISTER_OH_NAPI("VfsManager", "VfsManager_CreateVfs", CreateVfs)
REGISTER_OH_NAPI("VfsManager", "VfsManager_DestroyVfs", DestroyVfs)

}
}
}
