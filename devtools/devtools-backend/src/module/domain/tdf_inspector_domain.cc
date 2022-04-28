/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
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

#include "module/domain/tdf_inspector_domain.h"
#include <utility>
#include "api/devtools_backend_service.h"
#include "devtools_base/logging.h"
#include "module/domain_register.h"

namespace hippy::devtools {

constexpr char kInspectorEventScreenShotUpdated[] = "TDFInspector.screenshotUpdated";
constexpr char kInspectorEventRenderTreeUpdated[] = "TDFInspector.renderTreeUpdated";

TDFInspectorDomain::TDFInspectorDomain(std::weak_ptr<DomainDispatch> dispatch) : BaseDomain(std::move(dispatch)) {
  tdf_inspector_model_ = std::make_shared<TDFInspectorModel>();
  frame_poll_model_ = std::make_shared<FramePollModel>();
  screen_shot_model_ = std::make_shared<ScreenShotModel>();
  screen_shot_model_->SetDataProvider(GetDataProvider());
  frame_poll_model_->SetDataProvider(GetDataProvider());
  HandleScreenShotUpdatedNotification();
  HandleFramePollModelRefreshNotification();
}

std::string_view TDFInspectorDomain::GetDomainName() { return kFrontendKeyDomainNameTDFInspector; }

void TDFInspectorDomain::RegisterMethods() {
  REGISTER_DOMAIN(TDFInspectorDomain, DumpDomTree, Deserializer);
  REGISTER_DOMAIN(TDFInspectorDomain, GetDomTree, Deserializer);
  REGISTER_DOMAIN(TDFInspectorDomain, GetRenderTree, Deserializer);
  REGISTER_DOMAIN(TDFInspectorDomain, GetScreenshot, ScreenShotRequest);
  REGISTER_DOMAIN(TDFInspectorDomain, GetSelectedRenderObject, SelectedRenderObjectRequest);
  REGISTER_DOMAIN(TDFInspectorDomain, GetSelectedDomNode, Deserializer);
  REGISTER_DOMAIN(TDFInspectorDomain, EnableUpdateNotification, Deserializer);
  REGISTER_DOMAIN(TDFInspectorDomain, DisableUpdateNotification, Deserializer);
}

void TDFInspectorDomain::DumpDomTree(const Deserializer& request) {
  auto dom_tree_adapter = GetDataProvider()->dom_tree_adapter;
  if (!dom_tree_adapter) {
    ResponseErrorToFrontend(request.GetId(), kErrorNotSupport, "dump dom tree failed, js delegate null.");
    return;
  }
  BACKEND_LOGD(TDF_BACKEND, "HandleDumpDomTree dumpDom start");
  dom_tree_adapter->GetDomTree([this, request](bool is_success, const DomNodeMetas& metas) {
    BACKEND_LOGD(TDF_BACKEND, "HandleDumpDomTree dumpDom end");
    nlohmann::json tree_json = nlohmann::json::parse(metas.Serialize());
    json result_json = json::object();
    result_json[kFrontendKeyItree] = tree_json;
    BACKEND_LOGD(TDF_BACKEND, "HandleDumpDomTree restore end");
    if (is_success) {
      ResponseResultToFrontend(request.GetId(), result_json.dump());
    } else {
      ResponseErrorToFrontend(request.GetId(), kErrorFailCode, "dump dom tree failed, no tree data.");
    }
  });
}

void TDFInspectorDomain::GetDomTree(const Deserializer& request) {
  auto dom_tree_adapter = GetDataProvider()->dom_tree_adapter;
  if (!dom_tree_adapter) {
    ResponseErrorToFrontend(request.GetId(), kErrorNotSupport, "get dom tree failed, js delegate null.");
    return;
  }
  BACKEND_LOGD(TDF_BACKEND, "GetDomTree dumpDom start");
  dom_tree_adapter->GetDomTree([this, request](bool is_success, const DomNodeMetas& metas) {
    BACKEND_LOGD(TDF_BACKEND, "GetDomTree dumpDom end");
    nlohmann::json tree_json = nlohmann::json::parse(metas.Serialize());
    json result_json = json::object();
    result_json[kFrontendKeyItree] = std::move(tree_json);
    if (is_success) {
      ResponseResultToFrontend(request.GetId(), result_json.dump());
    } else {
      ResponseErrorToFrontend(request.GetId(), kErrorFailCode, "get dom tree failed, no tree data.");
    }
  });
}

void TDFInspectorDomain::GetRenderTree(const Deserializer& request) {
  auto render_tree_adapter = GetDataProvider()->render_tree_adapter;
  if (!render_tree_adapter) {
    ResponseErrorToFrontend(request.GetId(), kErrorNotSupport, "get render tree failed, js delegate null.");
    return;
  }
  BACKEND_LOGD(TDF_BACKEND, "GetRenderTree dumpDom start");
  render_tree_adapter->GetRenderTree([this, request](bool is_success, const RenderNodeMetas& metas) {
    BACKEND_LOGD(TDF_BACKEND, "GetRenderTree dumpDom end %d", is_success ? 1 : 0);
    if (is_success) {
      json result_json = json::object();
      result_json[kFrontendKeyRtree] = json::parse(metas.Serialize());
      ResponseResultToFrontend(request.GetId(), result_json.dump());
    } else {
      ResponseErrorToFrontend(request.GetId(), kErrorFailCode, "get render tree failed, no tree data.");
    }
  });
}

void TDFInspectorDomain::GetScreenshot(const ScreenShotRequest& request) {
  BACKEND_LOGD(TDF_BACKEND, "TDFInspectorDomain::HandleGetScreenShot start");
  // 用最近一次 GetScreenShot 事件的参数，作为截屏更新监听的参数
  screen_shot_model_->SetScreenShotRequest(request);
  auto screen_shot_callback = ScreenShotModel::ScreenShotCallback([this, request](ScreenShotResponse&& response) {
    ResponseResultToFrontend(request.GetId(), response.ToJsonString());
  });
  screen_shot_model_->SetResponseScreenShotCallback(screen_shot_callback);
  screen_shot_model_->ReqScreenShotToResponse();
}

void TDFInspectorDomain::GetSelectedRenderObject(const SelectedRenderObjectRequest& request) {
  auto render_tree_adapter = GetDataProvider()->render_tree_adapter;
  if (!render_tree_adapter) {
    ResponseErrorToFrontend(request.GetId(), kErrorNotSupport, "dump render tree failed, js delegate null.");
    return;
  }
  BACKEND_LOGD(TDF_BACKEND, "GetSelectedRenderObject start");
  render_tree_adapter->GetSelectedRenderObject(
      request.GetRenderId(), [this, request](bool is_success, const RenderDiagnosticMetas& metas) {
        BACKEND_LOGD(TDF_BACKEND, "GetSelectedRenderObject response");
        if (is_success) {
          json result_json = json::object();
          result_json[kFrontendKeyRtree] = json::parse(metas.Serialize());
          ResponseResultToFrontend(request.GetId(), result_json.dump());
        } else {
          ResponseErrorToFrontend(request.GetId(), kErrorFailCode, "GetSelectedRenderObject failed, no tree data.");
        }
      });
}

void TDFInspectorDomain::GetSelectedDomNode(const Deserializer& request) {}

void TDFInspectorDomain::EnableUpdateNotification(const Deserializer& request) { frame_poll_model_->StartPoll(); }

void TDFInspectorDomain::DisableUpdateNotification(const Deserializer& request) { frame_poll_model_->StopPoll(); }

void TDFInspectorDomain::HandleScreenShotUpdatedNotification() {
  auto screen_shot_callback = ScreenShotModel::ScreenShotCallback([this](ScreenShotResponse&& response) {
    SendEventToFrontend(InspectEvent(kInspectorEventScreenShotUpdated, std::move(response.ToJsonString())));
  });
  screen_shot_model_->SetSendEventScreenShotCallback(screen_shot_callback);
}

void TDFInspectorDomain::HandleFramePollModelRefreshNotification() {
  frame_poll_model_->SetResponseHandler([this]() {
    screen_shot_model_->ReqScreenShotToSendEvent();
    SendRenderTreeUpdatedEvent();
  });
}

void TDFInspectorDomain::SendRenderTreeUpdatedEvent() {
  auto render_tree_adapter = GetDataProvider()->render_tree_adapter;
  if (!render_tree_adapter) {
    return;
  }
  BACKEND_LOGD(TDF_BACKEND, "GetRenderTree dumpDom start");
  render_tree_adapter->GetRenderTree([this](bool is_success, const RenderNodeMetas& metas) {
    BACKEND_LOGD(TDF_BACKEND, "GetRenderTree dumpDom end %d", is_success ? 1 : 0);
    if (!is_success) {
      return;
    }
    auto result_string = tdf_inspector_model_->GetRenderTree(metas.Serialize());
    SendEventToFrontend(InspectEvent(kInspectorEventRenderTreeUpdated, std::move(result_string)));
  });
}

}  // namespace hippy::devtools
