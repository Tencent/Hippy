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

#include "module/domain/page_domain.h"
#include "devtools_base/macros.h"
#include "module/domain_register.h"
#include "module/model/frame_poll_model.h"

namespace hippy::devtools {

constexpr char kPageEventScreencastFrame[] = "Page.screencastFrame";

PageDomain::PageDomain(std::weak_ptr<DomainDispatch> dispatch) : BaseDomain(std::move(dispatch)) {
  screen_shot_model_ = std::make_shared<ScreenShotModel>();
  frame_poll_model_ = std::make_shared<FramePollModel>(GetWorkerManager());
  frame_poll_model_->InitTask();
  screen_shot_model_->SetDataProvider(GetDataProvider());
  frame_poll_model_->SetDataProvider(GetDataProvider());
}

std::string PageDomain::GetDomainName() { return kFrontendKeyDomainNamePage; }

void PageDomain::RegisterMethods() {
  REGISTER_DOMAIN(PageDomain, StartScreencast, ScreenShotRequest);
  REGISTER_DOMAIN(PageDomain, StopScreencast, BaseRequest);
  REGISTER_DOMAIN(PageDomain, ScreencastFrameAck, BaseRequest);
}

void PageDomain::RegisterCallback() {
  RegisterFramePollCallback();
  RegisterScreenShotCallback();
}

void PageDomain::StartScreencast(const ScreenShotRequest& request) {
  screen_shot_model_->SetScreenShotRequest(request);
  frame_poll_model_->StartPoll();
  ResponseResultToFrontend(request.GetId(), "{}");
}

void PageDomain::StopScreencast(const BaseRequest& request) {
  frame_poll_model_->StopPoll();
  ResponseResultToFrontend(request.GetId(), "{}");
}

void PageDomain::ScreencastFrameAck(const BaseRequest& request) {
  ResponseResultToFrontend(request.GetId(), "{}");
}

void PageDomain::RegisterFramePollCallback() {
  frame_poll_model_->SetResponseHandler([DEVTOOLS_WEAK_THIS]() {
    DEVTOOLS_DEFINE_AND_CHECK_SELF(PageDomain)
    self->screen_shot_model_->ReqScreenShotToSendEvent();
  });
}

void PageDomain::RegisterScreenShotCallback() {
  screen_shot_model_->SetSendEventScreenShotCallback([DEVTOOLS_WEAK_THIS](const ScreenShotResponse response) {
    DEVTOOLS_DEFINE_AND_CHECK_SELF(PageDomain)
    self->SendEventToFrontend(InspectEvent(kPageEventScreencastFrame, response.ToJsonString()));
  });
}
}  // namespace hippy::devtools
