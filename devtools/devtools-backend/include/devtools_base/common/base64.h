//
// Copyright (c) Tencent Corporation. All rights reserved.
//

#pragma once
#include <string>

namespace tdf::devtools {
class Base64 {
 public:
  static std::string Encode(const uint8_t* bin, const size_t len);
  static std::string Decode(const std::string& input);
};
}  // namespace tdf::devtools

