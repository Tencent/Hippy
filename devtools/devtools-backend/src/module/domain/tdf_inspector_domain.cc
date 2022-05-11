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

constexpr char kScreenShotUpdated[] = "TDFInspector.screenshotUpdated";
constexpr char kRenderTreeUpdated[] = "TDFInspector.renderTreeUpdated";

TDFInspectorDomain::TDFInspectorDomain(std::weak_ptr<DomainDispatch> dispatch) : BaseDomain(std::move(dispatch)) {
  tdf_inspector_model_ = std::make_shared<TDFInspectorModel>();
  frame_poll_model_ = std::make_shared<FramePollModel>();
  screen_shot_model_ = std::make_shared<ScreenShotModel>();
  screen_shot_model_->SetDataProvider(GetDataProvider());
  frame_poll_model_->SetDataProvider(GetDataProvider());
  HandleScreenShotUpdatedNotification();
  HandleFramePollModelRefreshNotification();
}

std::string TDFInspectorDomain::GetDomainName() { return kFrontendKeyDomainNameTDFInspector; }

void TDFInspectorDomain::RegisterMethods() {
  REGISTER_DOMAIN(TDFInspectorDomain, GetDomTree, BaseRequest);
  REGISTER_DOMAIN(TDFInspectorDomain, GetRenderTree, BaseRequest);
  REGISTER_DOMAIN(TDFInspectorDomain, GetScreenshot, ScreenShotRequest);
  REGISTER_DOMAIN(TDFInspectorDomain, GetSelectedRenderObject, SelectedRenderObjectRequest);
  REGISTER_DOMAIN(TDFInspectorDomain, GetSelectedDomNode, BaseRequest);
  REGISTER_DOMAIN(TDFInspectorDomain, EnableUpdateNotification, BaseRequest);
  REGISTER_DOMAIN(TDFInspectorDomain, DisableUpdateNotification, BaseRequest);
}

void TDFInspectorDomain::GetDomTree(const BaseRequest& request) {
  auto dom_tree_adapter = GetDataProvider()->dom_tree_adapter;
  if (!dom_tree_adapter) {
    ResponseErrorToFrontend(request.GetId(), kErrorNotSupport, "get dom tree failed, dom_tree_adapter null.");
    return;
  }
  BACKEND_LOGD(TDF_BACKEND, "TDFInspectorDomain::GetDomTree start");
  dom_tree_adapter->GetDomTree([this, request](bool is_success, const DomNodeMetas& metas) {
    BACKEND_LOGD(TDF_BACKEND, "TDFInspectorDomain::GetDomTree end");
    if (is_success) {
      nlohmann::json result_json = nlohmann::json::object();
      result_json[kFrontendKeyItree] = nlohmann::json::parse(metas.Serialize());
      ResponseResultToFrontend(request.GetId(), result_json.dump());
    } else {
      ResponseErrorToFrontend(request.GetId(), kErrorFailCode, "get dom tree failed, is_success false.");
    }
  });
}

void TDFInspectorDomain::GetRenderTree(const BaseRequest& request) {
  auto render_tree_adapter = GetDataProvider()->render_tree_adapter;
  if (!render_tree_adapter) {
    ResponseErrorToFrontend(request.GetId(), kErrorNotSupport, "get render tree failed, render_tree_adapter is null.");
    return;
  }
  BACKEND_LOGD(TDF_BACKEND, "GetRenderTree dumpDom start");
  render_tree_adapter->GetRenderTree([this, request](bool is_success, const RenderNodeMetas& metas) {
    BACKEND_LOGD(TDF_BACKEND, "GetRenderTree dumpDom end %d", is_success ? 1 : 0);
    if (is_success) {
      nlohmann::json result_json = nlohmann::json::object();
      result_json[kFrontendKeyRtree] = nlohmann::json::parse(metas.Serialize());
      ResponseResultToFrontend(request.GetId(), result_json.dump());
    } else {
      ResponseErrorToFrontend(request.GetId(), kErrorFailCode, "get render tree failed, is_success false.");
    }
  });
}

void TDFInspectorDomain::GetScreenshot(const ScreenShotRequest& request) {
  BACKEND_LOGD(TDF_BACKEND, "TDFInspectorDomain::GetScreenshot start");
  // use the latest GetScreenShot request params as the screenshot params
  screen_shot_model_->SetScreenShotRequest(request);
  screen_shot_model_->SetResponseScreenShotCallback([this, request](const ScreenShotResponse& response) {
    ResponseResultToFrontend(request.GetId(), response.ToJsonString());
  });
  screen_shot_model_->ReqScreenShotToResponse();
}

void TDFInspectorDomain::GetSelectedRenderObject(const SelectedRenderObjectRequest& request) {
  auto render_tree_adapter = GetDataProvider()->render_tree_adapter;
  if (!render_tree_adapter) {
    ResponseErrorToFrontend(request.GetId(), kErrorNotSupport,
                            "get selected render object failed, render_tree_adapter.");
    return;
  }
  BACKEND_LOGD(TDF_BACKEND, "GetSelectedRenderObject start");
  render_tree_adapter->GetSelectedRenderObject(
      request.GetRenderId(), [this, request](bool is_success, const RenderDiagnosticMetas& metas) {
        BACKEND_LOGD(TDF_BACKEND, "GetSelectedRenderObject response");
        if (is_success) {
          nlohmann::json result_json = nlohmann::json::object();
          result_json[kFrontendKeyRtree] = nlohmann::json::parse(metas.Serialize());
          ResponseResultToFrontend(request.GetId(), result_json.dump());
        } else {
          ResponseErrorToFrontend(request.GetId(), kErrorFailCode, "GetSelectedRenderObject failed, is_success false.");
        }
      });
}

void TDFInspectorDomain::GetSelectedDomNode(const BaseRequest& request) {}

void TDFInspectorDomain::EnableUpdateNotification(const BaseRequest& request) { frame_poll_model_->StartPoll(); }

void TDFInspectorDomain::DisableUpdateNotification(const BaseRequest& request) { frame_poll_model_->StopPoll(); }

void TDFInspectorDomain::HandleScreenShotUpdatedNotification() {
  screen_shot_model_->SetSendEventScreenShotCallback([this](const ScreenShotResponse& response) {
    SendEventToFrontend(InspectEvent(kScreenShotUpdated, response.ToJsonString()));
  });
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
  render_tree_adapter->GetRenderTree([this](bool is_success, const RenderNodeMetas& metas) {
    if (is_success) {
      SendEventToFrontend(InspectEvent(kRenderTreeUpdated, tdf_inspector_model_->GetRenderTree(metas.Serialize())));
    }
  });
}
}  // namespace hippy::devtools
