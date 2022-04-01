//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#include "devtools_base/tdf_string_util.h"
#include <regex>

namespace tdf {
namespace devtools {

std::vector<std::string> TDFStringUtil::SplitString(const std::string &origin, const std::string &split_tag) {
  if (origin.empty()) {
    return {};
  }
  std::regex regex(split_tag);
  std::sregex_token_iterator first{origin.begin(), origin.end(), regex, -1}, last;

  return {first, last};
}

std::string TDFStringUtil::TrimmingStringWhitespace(const std::string &origin) {
  std::string result{origin};
  result.erase(std::remove_if(result.begin(), result.end(), [](unsigned char str) { return std::isspace(str); }),
               result.end());
  return result;
}

std::string TDFStringUtil::Camelize(const std::string &origin) {
  if (origin.empty()) {
    return "";
  }
  std::stringstream result_stream;
  auto string_vector = SplitString(origin, "-");
  for (auto &str : string_vector) {
    if (str != *string_vector.begin()) {
      // 驼峰第一个单词开头不用大写
      std::transform(str.begin(), str.begin() + 1, str.begin(), ::toupper);
    }
    result_stream << str;
  }
  return result_stream.str();
}

std::string TDFStringUtil::UnCamelize(const std::string &origin) {
  if (origin.empty()) {
    return "";
  }

  static std::regex match("([A-Z])(.)");
  auto result_string = std::regex_replace(origin, match, "-$1$2");
  std::transform(result_string.begin(), result_string.end(), result_string.begin(), ::tolower);
  return result_string;
}

}  // namespace devtools
}  // namespace tdf
