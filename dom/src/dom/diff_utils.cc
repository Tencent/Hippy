//
// Copyright (c) 2021 Tencent. All rights reserved.
// Created by omegaxiao on 2021/11/26.
//

#include "dom/diff_utils.h"
#include "base/logging.h"
#include "dom/node_props.h"
namespace hippy {
inline namespace dom {
DomValueMap DiffUtils::DiffProps(const DomValueMap& from, const DomValueMap& to) {
  DomValueMap diff_props;
  for (const auto& kv : from) {
    auto from_value = from.find(kv.first);  // old
    auto to_value = to.find(kv.first);      // new
    if (to_value == to.end() || to_value->second == nullptr) {
      continue;
    }
    if (from_value->second == nullptr) {
      if (to_value->second) {
        diff_props[kv.first] = to_value->second;
      }
      continue;
    }
    if (from_value->second->IsBoolean()) {
      if (to_value->second && to_value->second->ToBoolean() != from_value->second->ToBoolean()) {
        diff_props[kv.first] = to_value->second;
      }
    } else if (from_value->second->IsNumber()) {
      if (to_value->second && to_value->second->ToDouble() != from_value->second->ToDouble()) {
        diff_props[kv.first] = to_value->second;
      }
    } else if (from_value->second->IsString()) {
      if (to_value->second && to_value->second->ToString() != from_value->second->ToString()) {
        diff_props[kv.first] = to_value->second;
      }
    } else if (from_value->second->IsArray()) {
      if (to_value->second && to_value->second->IsArray()) {
        DomValueArray result = DiffArray(from_value->second->ToArray(), to_value->second->ToArray());
        if (!result.empty()) {
          diff_props[kv.first] = std::make_shared<DomValue>(result);
        }
      } else {
        diff_props[kv.first] = to_value->second;
      }
    } else if (from_value->second->IsObject()) {
      if (to_value->second && to_value->second->IsObject()) {
        DomValueObject result = DiffObject(to_value->second->ToObject(), to_value->second->ToObject());
        if (!result.empty()) {
          diff_props[kv.first] = to_value->second;
        }
      } else {
        diff_props[kv.first] = std::make_shared<DomValue>(DomValue::Null());
      }
    } else if (from_value->second->IsNull()) {
      if (to_value->second && !to_value->second->IsNull()) {
        diff_props[kv.first] = to_value->second;
      }
    } else {
      TDF_BASE_NOTREACHED();
    }
  }
  for (const auto& kv : to) {
    if (from.find(kv.first) != from.end()) {
      continue;
    }
    diff_props[kv.first] = kv.second;
  }

  return diff_props;
}

DomValueArray DiffUtils::DiffArray(const DomValueArray& from, const DomValueArray& to) {
  if (from.size() != to.size()) {
    return to;
  }
  DomValueArray diff_array;
  for (int i = 0; i < from.size(); i++) {
    auto from_value = from[i];
    auto to_value = to[i];
    if (from_value.IsBoolean()) {
      if (from_value.ToBoolean() != to_value.ToBoolean()) {
        return to;
      }
    } else if (from_value.IsNumber()) {
      if (from_value.ToDouble() != from_value.ToDouble()) {
        return to;
      }
    } else if (from_value.IsString()) {
      if (from_value.ToString() != from_value.ToString()) {
        return to;
      }
    } else if (from_value.IsArray()) {
      if (!to_value.IsArray() || DiffArray(from_value.ToArray(), to_value.ToArray()).empty()) {
        return to;
      }
    } else if (from_value.IsObject()) {
      if (!to_value.IsObject() || DiffObject(from_value.ToObject(), to_value.ToObject()).empty()) {
        return to;
      }
    } else if (from_value.IsNull()) {
      if (!to_value.IsNull()) {
        return to;
      }
    } else {
      TDF_BASE_NOTREACHED();
    }
  }
  return diff_array;
}

DomValueObject DiffUtils::DiffObject(const DomValueObject& from, const DomValueObject& to) {
  DomValueObject diff_props;
  for (const auto& kv : from) {
    auto from_value = from.find(kv.first);  // old
    auto to_value = to.find(kv.first);      // new
    if (from_value->second.IsBoolean()) {
      if (to_value != to.end() && to_value->second.ToBoolean() != from_value->second.ToBoolean()) {
        diff_props[kv.first] = to_value->second;
      }
    } else if (from_value->second.IsNumber()) {
      if (to_value != to.end() && to_value->second.ToDouble() != from_value->second.ToDouble()) {
        diff_props[kv.first] = to_value->second;
      }
    } else if (from_value->second.IsString()) {
      if (to_value != to.end() && to_value->second.ToString() != from_value->second.ToString()) {
        diff_props[kv.first] = to_value->second;
      }
    } else if (from_value->second.IsArray()) {
      if (to_value != to.end() && to_value->second.IsArray()) {
        DomValueArray result = DiffArray(from_value->second.ToArray(), to_value->second.ToArray());
        if (!result.empty()) {
          diff_props[kv.first] = result;
        }
      } else {
        diff_props[kv.first] = DomValue::Null();
      }
    } else if (from_value->second.IsObject()) {
      if (to_value != to.end() && to_value->second.IsObject()) {
        DomValueObject result = DiffObject(to_value->second.ToObject(), to_value->second.ToObject());
        if (!result.empty()) {
          diff_props[kv.first] = to_value->second;
        }
      } else {
        diff_props[kv.first] = DomValue::Null();
      }
    } else if (from_value->second.IsNull()) {
      if (to_value != to.end() && !to_value->second.IsNull()) {
        diff_props[kv.first] = to_value->second;
      }
    } else {
      TDF_BASE_NOTREACHED();
    }
  }
  for (const auto& kv : to) {
    if (from.find(kv.first) != from.end()) {
      continue;
    }
    diff_props[kv.first] = kv.second;
  }
  return diff_props;
}

}  // namespace dom
}  // namespace hippy
