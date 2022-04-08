//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#include "module/domain/tdf_inspector_domain.h"
#include <utility>
#include "api/devtools_backend_service.h"
#include "devtools_base/logging.h"
#include "module/domain_register.h"

namespace tdf {
namespace devtools {

constexpr const char* kInspectorEventScreenShotUpdated = "TDFInspector.screenshotUpdated";
constexpr const char* kInspectorEventRenderTreeUpdated = "TDFInspector.renderTreeUpdated";

TDFInspectorDomain::TDFInspectorDomain(std::weak_ptr<DomainDispatch> dispatch) : BaseDomain(dispatch) {
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
  REGISTER_DOMAIN(TDFInspectorDomain, DumpDomTree, DomainBaseRequest);
  REGISTER_DOMAIN(TDFInspectorDomain, GetDomTree, DomainBaseRequest);
  REGISTER_DOMAIN(TDFInspectorDomain, GetRenderTree, DomainBaseRequest);
  REGISTER_DOMAIN(TDFInspectorDomain, GetScreenshot, ScreenShotRequest);
  REGISTER_DOMAIN(TDFInspectorDomain, GetSelectedRenderObject, SelectedRenderObjectRequest);
  REGISTER_DOMAIN(TDFInspectorDomain, GetSelectedDomNode, DomainBaseRequest);
  REGISTER_DOMAIN(TDFInspectorDomain, EnableUpdateNotification, DomainBaseRequest);
  REGISTER_DOMAIN(TDFInspectorDomain, DisableUpdateNotification, DomainBaseRequest);
}

void TDFInspectorDomain::DumpDomTree(const DomainBaseRequest& request) {
  auto dom_tree_adapter = GetDataProvider()->GetDomTreeAdapter();
  if (!dom_tree_adapter) {
    ResponseErrorToFrontend(request.GetId(), kErrorNotSupport, "dump dom tree failed, js delegate null.");
    return;
  }
  BACKEND_LOGD(TDF_BACKEND, "HandleDumpDomTree dumpDom start");
  dom_tree_adapter->GetDomTree([this, request](bool is_success, DomNodeMetas metas) {
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

void TDFInspectorDomain::GetDomTree(const DomainBaseRequest& request) {
  auto dom_tree_adapter = GetDataProvider()->GetDomTreeAdapter();
  if (!dom_tree_adapter) {
    ResponseErrorToFrontend(request.GetId(), kErrorNotSupport, "get dom tree failed, js delegate null.");
    return;
  }
  BACKEND_LOGD(TDF_BACKEND, "GetDomTree dumpDom start");
  dom_tree_adapter->GetDomTree([this, request](bool is_success, DomNodeMetas metas) {
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

void TDFInspectorDomain::GetRenderTree(const DomainBaseRequest& request) {
  auto render_tree_adapter = GetDataProvider()->GetRenderTreeAdapter();
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
    ResponseResultToFrontend(request.GetId(), std::move(response.ToJsonString()));
  });
  screen_shot_model_->SetResponseScreenShotCallback(screen_shot_callback);
  screen_shot_model_->ReqScreenShotToResponse();
}

void TDFInspectorDomain::GetSelectedRenderObject(const SelectedRenderObjectRequest& request) {
  auto render_tree_adapter = GetDataProvider()->GetRenderTreeAdapter();
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

void TDFInspectorDomain::GetSelectedDomNode(const DomainBaseRequest& request) {}

void TDFInspectorDomain::EnableUpdateNotification(const DomainBaseRequest& request) { frame_poll_model_->StartPoll(); }

void TDFInspectorDomain::DisableUpdateNotification(const DomainBaseRequest& request) { frame_poll_model_->StopPoll(); }

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
  auto render_tree_adapter = GetDataProvider()->GetRenderTreeAdapter();
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

}  // namespace devtools
}  // namespace tdf
