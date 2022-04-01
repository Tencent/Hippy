//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by ivanfanwu on 2021/7/16.
//

#pragma once

#include <map>
#include <memory>
#include <string>
#include "module/request/network_response_body_request.h"
#include "module/domain/base_domain.h"
#include "module/model/frame_poll_model.h"
#include "module/model/screen_shot_model.h"
#include "module/request/domain_base_request.h"

namespace tdf {
namespace devtools {

/**
 * CDP 网络模块的协议实现
 */
class NetworkDomain : public BaseDomain {
 public:
  explicit NetworkDomain(std::weak_ptr<DomainDispatch> dispatch);
  std::string_view GetDomainName() override;
  void RegisterMethods() override;

 private:
  void GetResponseBody(const NetworkResponseBodyRequest& request);
  std::shared_ptr<ScreenShotModel> screen_shot_model_;
};

}  // namespace devtools
}  // namespace tdf
