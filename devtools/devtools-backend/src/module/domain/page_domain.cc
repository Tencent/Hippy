//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by ivanfanwu on 2021/7/16.
//

#include "module/domain/page_domain.h"
#include "devtools_base/logging.h"
#include "module/domain_register.h"
#include "module/model/frame_poll_model.h"

namespace tdf {
namespace devtools {

constexpr const char* kPageEventScreencastFrame = "Page.screencastFrame";

PageDomain::PageDomain(std::weak_ptr<DomainDispatch> dispatch) : BaseDomain(dispatch) {
  screen_shot_model_ = std::make_shared<ScreenShotModel>();
  frame_poll_model_ = std::make_shared<FramePollModel>();
  screen_shot_model_->SetDataProvider(GetDataProvider());
  frame_poll_model_->SetDataProvider(GetDataProvider());
  HandleScreenShotUpdatedNotification();
  HandleFramePollModelRefreshNotification();
}

std::string_view PageDomain::GetDomainName() { return kFrontendKeyDomainNamePage; }

void PageDomain::RegisterMethods() {
  REGISTER_DOMAIN(PageDomain, StartScreencast, ScreenShotRequest);
  REGISTER_DOMAIN(PageDomain, StopScreencast, DomainBaseRequest);
  REGISTER_DOMAIN(PageDomain, ScreencastFrameAck, DomainBaseRequest);
}

void PageDomain::StartScreencast(const ScreenShotRequest& request) {
  BACKEND_LOGD(TDF_BACKEND, "HandleStartScreencast");
  screen_shot_model_->SetScreenShotRequest(request);
  frame_poll_model_->StartPoll();
  ResponseResultToFrontend(request.GetId(), "{}");
}

void PageDomain::StopScreencast(const DomainBaseRequest& request) {
  BACKEND_LOGD(TDF_BACKEND, "HandleStopScreencast");
  frame_poll_model_->StopPoll();
  ResponseResultToFrontend(request.GetId(), "{}");
}

void PageDomain::ScreencastFrameAck(const DomainBaseRequest& request) {
  BACKEND_LOGD(TDF_BACKEND, "HandleScreencastFrameAck");
  ResponseResultToFrontend(request.GetId(), "{}");
}

void PageDomain::HandleFramePollModelRefreshNotification() {
  frame_poll_model_->SetResponseHandler([this]() { screen_shot_model_->ReqScreenShotToSendEvent(); });
}

void PageDomain::HandleScreenShotUpdatedNotification() {
  auto screen_shot_callback = ScreenShotModel::ScreenShotCallback([this](ScreenShotResponse&& response) {
    SendEventToFrontend(InspectEvent(kPageEventScreencastFrame, std::move(response.ToJsonString())));
  });
  screen_shot_model_->SetSendEventScreenShotCallback(screen_shot_callback);
}

}  // namespace devtools
}  // namespace tdf
