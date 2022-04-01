//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/11/2.
//

#pragma once

#include <string>
#include <vector>
#include "api/adapter/data/serializable.h"

namespace tdf {
namespace devtools {
struct RenderDiagnosticMeta {
  std::string name_;
  std::string type_;
  std::string value_;
  RenderDiagnosticMeta(std::string name, std::string type, std::string value)
      : name_(name), type_(type), value_(value) {}
};

class RenderDiagnosticMetas : public Serializable {
 public:
  void AddMeta(const RenderDiagnosticMeta& meta);
  std::string Serialize() const override;

 private:
  std::vector<RenderDiagnosticMeta> metas_;
};
}  // namespace devtools
}  // namespace tdf
