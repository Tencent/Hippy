//
// Copyright (c) 2021 Tencent. All rights reserved.
// Created by omegaxiao on 2021/11/26.
//
#pragma once

#include "dom_value.h"

namespace hippy {
inline namespace dom {
using DomValue = tdf::base::DomValue;
using DomValueMap = typename std::unordered_map<std::string, std::shared_ptr<DomValue>>;
using DomValueObject = typename std::unordered_map<std::string, DomValue>;
using DomValueArray = typename std::vector<DomValue>;
class DiffUtils {
 public:
  static DomValueMap DiffProps(const DomValueMap& from, const DomValueMap& to);
  static DomValueArray DiffArray(const DomValueArray& from, const DomValueArray& to);
  static DomValueObject DiffObject(const DomValueObject& from, const DomValueObject& to);
};
}  // namespace dom
}  // namespace hippy
