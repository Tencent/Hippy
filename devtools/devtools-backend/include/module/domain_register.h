//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#pragma once

#include <stdio.h>
#include <memory>
#include <mutex>
#include <string>
#include <unordered_map>
#include "devtools_base/logging.h"
#include "module/domain/base_domain.h"
#include "module/request/domain_base_request.h"

#define REGISTER_DOMAIN(Domain, Function, Request)                                                \
  auto __##Domain##Function##__ = [] {                                                            \
    DomainRegister::Instance()->RegisterDomain(&Domain::Function, #Domain, #Function, Request()); \
    return 0;                                                                                     \
  }();

class DomainRegister {
 public:
  using InvokerHandler =
      std::function<void(std::shared_ptr<tdf::devtools::BaseDomain> instance, int32_t id, const std::string& params)>;
  using MethodMap = std::unordered_map<std::string, InvokerHandler>;
  using DomainMap = std::unordered_map<std::string, MethodMap>;
  DomainMap global_domains_{};

  static DomainRegister* Instance() {
    static DomainRegister* _in = nullptr;
    static std::once_flag flag;
    std::call_once(flag, [] { _in = new DomainRegister(); });
    return _in;
  }

  template <typename Domain, typename Function, typename Request,
            class = typename std::enable_if<std::is_base_of<tdf::devtools::DomainBaseRequest, Request>::value>::type>
  void RegisterDomain(Function Domain::*member_fn, const std::string& domain_name, const std::string& function_name,
                      Request request) {
    InvokerHandler invoker = [member_fn, function_name, request](std::shared_ptr<tdf::devtools::BaseDomain> baseDomain,
                                                                 int32_t id, const std::string& params) mutable {
      request.SetId(id);
      request.RefreshParams(params);
      Domain* domain = reinterpret_cast<Domain*>(baseDomain.get());
      (std::mem_fn(member_fn))(domain, request);
    };
    global_domains_[domain_name][function_name] = invoker;
  }

  const InvokerHandler GetMethod(const std::string& domain_name, const std::string& function_name) {
    return global_domains_[domain_name][function_name];
  }

 private:
  DomainRegister() = default;
};
