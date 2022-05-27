//
// Copyright (c) 2022 Tencent. All rights reserved.
// Created by omegaxiao on 2022/4/14.
//
#pragma once
#include <vector>

namespace hippy {
inline namespace dom {
class DomNode;
struct DomInfo;
class DomActionInterceptor {
 public:
  virtual void OnDomNodeCreate(const std::vector<std::shared_ptr<DomInfo>>& nodes) = 0;

  virtual void OnDomNodeUpdate(const std::vector<std::shared_ptr<DomInfo>>& nodes) = 0;
  virtual void OnDomNodeMove(const std::vector<std::shared_ptr<DomInfo>>& nodes) = 0;

  virtual void OnDomNodeDelete(const std::vector<std::shared_ptr<DomInfo>>& nodes) = 0;
  virtual ~DomActionInterceptor() = default;
};
}  // namespace dom
}  // namespace hippy
