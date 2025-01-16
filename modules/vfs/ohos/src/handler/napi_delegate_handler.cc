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

#include "vfs/handler/napi_delegate_handler.h"
#include "footstone/check.h"
#include "footstone/logging.h"
#include "footstone/string_view_utils.h"
#include "oh_napi/data_holder.h"
#include "oh_napi/oh_napi_register.h"
#include "oh_napi/ark_ts.h"
#include "oh_napi/oh_napi_object.h"
#include "oh_napi/oh_napi_object_builder.h"
#include "oh_napi/oh_napi_task_runner.h"
#include "vfs/uri_loader.h"
#include "vfs/handler/asset_handler.h"
#include "vfs/handler/file_handler.h"
#include "vfs/job_response.h"
#include "vfs/request_job.h"
#include "vfs/vfs_resource_holder.h"

namespace hippy {
inline namespace vfs {

NapiDelegateHandler::AsyncWrapperMap NapiDelegateHandler::wrapper_map_;
std::atomic<uint32_t> NapiDelegateHandler::request_id_ = 1;

std::atomic<uint32_t> g_delegate_id = 1;

constexpr char kCallFromKey[] = "__Hippy_call_from";
constexpr char kCallFromTsValue[] = "ts";

std::shared_ptr<UriLoader> GetUriLoader(int id) {
  std::any loader_object;
  bool flag = hippy::global_data_holder.Find(footstone::checked_numeric_cast<int, uint32_t>(id), loader_object);
  if (!flag) {
    return nullptr;
  }
  return std::any_cast<std::shared_ptr<UriLoader>>(loader_object);
}

NapiDelegateHandler::NapiDelegateHandler(napi_env env, napi_ref delegate_ref) {
  ts_env_ = env;
  ts_delegate_ref_ = delegate_ref;
}

NapiDelegateHandler::~NapiDelegateHandler() {
  ArkTS arkTs(ts_env_);
  arkTs.DeleteReference(ts_delegate_ref_);
  ts_delegate_ref_ = 0;
  ts_env_ = 0;
}

void NapiDelegateHandler::RequestUntrustedContent(
    std::shared_ptr<RequestJob> request,
    std::shared_ptr<JobResponse> response,
    std::function<std::shared_ptr<UriHandler>()> next) {
  FOOTSTONE_DCHECK(!next()) << "napi delegate must be the last handler";
  auto req_meta = request->GetMeta();
  if (req_meta[kCallFromKey] == kCallFromTsValue) { // call from ts
    response->SetRetCode(RetCode::SchemeNotRegister);
    return;
  }
  
  auto uri = request->GetUri();
  string_view::u8string uri_str = footstone::StringViewUtils::ConvertEncoding(uri, string_view::Encoding::Utf8).utf8_value();

  OhNapiTaskRunner *taskRunner = OhNapiTaskRunner::Instance(ts_env_);
  taskRunner->RunSyncTask([env = ts_env_, delegate_ref = ts_delegate_ref_, uri_str, req_meta, response]() {
    ArkTS arkTs(env);
    auto ts_uri = arkTs.CreateStringUtf8(uri_str);
    auto ts_headers_builder = arkTs.CreateObjectBuilder();
    for (auto [key, value] : req_meta) {
      ts_headers_builder.AddProperty(key.c_str(), value.c_str());
    }
    auto ts_params_builder = arkTs.CreateObjectBuilder();

    std::vector<napi_value> args = { ts_uri, ts_headers_builder.Build(), ts_params_builder.Build() };
    auto delegateObject = arkTs.GetObject(delegate_ref);
    auto ts_holder = delegateObject.Call("doLocalTraversalsSync", args);
    
    auto ts_holder_ref = arkTs.CreateReference(ts_holder);
    auto resource_holder = ResourceHolder::Create(env, ts_holder_ref);
    RetCode ret_code = resource_holder->GetCode();
    response->SetRetCode(ret_code);
    if (ret_code != RetCode::Success) {
      return;
    }
    response->SetMeta(resource_holder->GetRspMeta());
    response->SetContent(resource_holder->GetContent());
  });
}

void NapiDelegateHandler::RequestUntrustedContent(
    std::shared_ptr<RequestJob> request,
    std::function<void(std::shared_ptr<JobResponse>)> cb,
    std::function<std::shared_ptr<UriHandler>()> next) {
  FOOTSTONE_DCHECK(!next()) << "napi delegate must be the last handler";
  auto req_meta = request->GetMeta();
  if (req_meta[kCallFromKey] == kCallFromTsValue) { // call from ts
    cb(std::make_shared<JobResponse>(hippy::JobResponse::RetCode::SchemeNotRegister));
    return;
  }

  auto uri = request->GetUri();
  string_view::u8string uri_str = footstone::StringViewUtils::ConvertEncoding(uri, string_view::Encoding::Utf8).utf8_value();
  auto id = request_id_.fetch_add(1);
  auto wrapper = std::make_shared<NapiDelegateHandlerAsyncWrapper>(shared_from_this(), request, cb);
  auto flag = GetAsyncWrapperMap().Insert(id, wrapper);
  FOOTSTONE_CHECK(flag);

  OhNapiTaskRunner *taskRunner = OhNapiTaskRunner::Instance(ts_env_);
  taskRunner->RunAsyncTask([env = ts_env_, delegate_ref = ts_delegate_ref_, uri_str, req_meta, id]() {
    ArkTS arkTs(env);
    auto ts_uri = arkTs.CreateStringUtf8(uri_str);
    auto ts_headers_builder = arkTs.CreateObjectBuilder();
    for (auto [key, value] : req_meta) {
      ts_headers_builder.AddProperty(key.c_str(), value.c_str());
    }
    auto ts_params_builder = arkTs.CreateObjectBuilder();

    std::vector<napi_value> args = {
      ts_uri,
      ts_headers_builder.Build(),
      ts_params_builder.Build(),
      arkTs.CreateInt(static_cast<int>(id)),
      arkTs.CreateInt(-1)
    };
    auto delegateObject = arkTs.GetObject(delegate_ref);
    delegateObject.Call("doLocalTraversalsAsync", args);
  });
}

// call from ts
static napi_value OnJniDelegateCallback(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  auto ts_holder_ref = arkTs.CreateReference(args[0]);
  
  auto resource_holder = ResourceHolder::Create(env, ts_holder_ref);
  auto request_id = resource_holder->GetNativeId();
  std::shared_ptr<NapiDelegateHandler::NapiDelegateHandlerAsyncWrapper> wrapper;
  auto flag = NapiDelegateHandler::GetAsyncWrapperMap().Find(request_id, wrapper);
  if (!flag) {
    FOOTSTONE_LOG(WARNING) << "onTraversalsEndAsync native id error, id = " << request_id;
    return arkTs.GetUndefined();
  }
  auto weak = wrapper->delegate;
  auto delegate = weak.lock();
  if (!delegate) {
    return arkTs.GetUndefined();
  }
  auto request = wrapper->request;
  auto cb = wrapper->cb;
  FOOTSTONE_CHECK(cb);
  UriHandler::RetCode ret_code = resource_holder->GetCode();
  if (ret_code != UriHandler::RetCode::Success) {
    cb(std::make_shared<JobResponse>(ret_code));
    return arkTs.GetUndefined();
  }
  auto rsp_map = resource_holder->GetRspMeta();
  auto content = resource_holder->GetContent();
  cb(std::make_shared<JobResponse>(ret_code, "", std::move(rsp_map), std::move(content)));
  return arkTs.GetUndefined();
}

// call from ts
static napi_value OnJniDelegateInvokeProgress(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  auto callbackId = arkTs.GetInteger(args[0]);
  auto total = arkTs.GetInteger(args[1]);
  auto loaded = arkTs.GetInteger(args[2]);
  
  auto request_id = static_cast<uint32_t>(callbackId);
  std::shared_ptr<NapiDelegateHandler::NapiDelegateHandlerAsyncWrapper> wrapper;
  auto flag = NapiDelegateHandler::GetAsyncWrapperMap().Find(request_id, wrapper);
  if (!flag) {
    FOOTSTONE_LOG(WARNING) << "OnJniDelegateInvokeProgress id error, id = " << request_id;
    return arkTs.GetUndefined();
  }
  auto cb = wrapper->request->GetProgressCallback();
  if (cb) {
    cb(static_cast<int64_t>(loaded), static_cast<int64_t>(total));
  }
  return arkTs.GetUndefined();
}

// call from ts
static napi_value OnJniDelegateInvokeAsync(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  auto id = arkTs.GetInteger(args[0]);
  auto ts_holder_ref = arkTs.CreateReference(args[1]);
  auto ts_callback_ref = arkTs.CreateReference(args[2]);
  
  auto resource_holder_req = ResourceHolder::Create(env, ts_holder_ref);
  auto uri = resource_holder_req->GetUri();
  auto req_meta = resource_holder_req->GetReqMeta();
  req_meta[kCallFromKey] = kCallFromTsValue;
  auto cb = [env, ts_holder_ref, ts_callback_ref](UriLoader::RetCode code, const std::unordered_map<std::string, std::string> &rsp_meta,
                                const UriLoader::bytes &content) {
    auto resource_holder = ResourceHolder::Create(env, ts_holder_ref);
    resource_holder->SetContent(content);
    resource_holder->SetRspMeta(rsp_meta);
    resource_holder->SetCode(code);
    resource_holder->FetchComplete(ts_callback_ref);
    ArkTS arkTs(env);
    arkTs.DeleteReference(ts_callback_ref);
  };
  auto loader = GetUriLoader(id);
  if (loader == nullptr) {
    FOOTSTONE_LOG(ERROR) << "uri loader is null, uri loader id " << id;
    return arkTs.GetUndefined();
  }
  loader->RequestUntrustedContent(uri, req_meta, cb);
  return arkTs.GetUndefined();
}

// call from ts
static napi_value OnJniDelegateInvokeSync(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  auto id = arkTs.GetInteger(args[0]);
  auto ts_holder_ref = arkTs.CreateReference(args[1]);

  auto resource_holder = ResourceHolder::Create(env, ts_holder_ref);
  auto uri = resource_holder->GetUri();
  auto req_meta = resource_holder->GetReqMeta();
  UriLoader::RetCode code;
  std::unordered_map<std::string, std::string> rsp_meta;
  UriLoader::bytes content;
  req_meta[kCallFromKey] = kCallFromTsValue;
  auto loader = GetUriLoader(id);
  if (loader == nullptr) {
    FOOTSTONE_LOG(ERROR) << "uri loader is null, uri loader id " << id;
    return arkTs.GetUndefined();
  }
  loader->RequestUntrustedContent(uri, req_meta, code, rsp_meta, content);
  resource_holder->SetRspMeta(rsp_meta);
  resource_holder->SetContent(content);
  resource_holder->SetCode(code);
  return arkTs.GetUndefined();
}

REGISTER_OH_NAPI("VfsManager", "VfsManager_OnJniDelegateCallback", OnJniDelegateCallback)
REGISTER_OH_NAPI("VfsManager", "VfsManager_OnJniDelegateInvokeProgress", OnJniDelegateInvokeProgress)
REGISTER_OH_NAPI("VfsManager", "VfsManager_OnJniDelegateInvokeAsync", OnJniDelegateInvokeAsync)
REGISTER_OH_NAPI("VfsManager", "VfsManager_OnJniDelegateInvokeSync", OnJniDelegateInvokeSync)

}
}
