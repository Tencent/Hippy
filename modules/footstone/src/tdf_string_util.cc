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

#include "footstone/tdf_string_util.h"
#include <regex>

namespace footstone {
inline namespace utils {
constexpr char kDomainNameTdfPrefix[] = "Tdf";
constexpr char kDomainNameTDFProtocol[] = "TDF";

std::vector <std::string> TdfStringUtil::SplitString(const std::string &origin,
                                                     const std::string &split_tag) {
  if (origin.empty()) {
    return {};
  }
  std::regex regex(split_tag);
  std::sregex_token_iterator first{origin.begin(), origin.end(), regex, -1},
      last;

  return {first, last};
}

std::string TdfStringUtil::TrimmingString(const std::string &origin) {
  std::string result{origin};
  result.erase(std::remove_if(result.begin(),
                              result.end(),
                              [](unsigned char str) { return std::isspace(str); }),
               result.end());
  return result;
}

std::string TdfStringUtil::Camelize(const std::string &origin) {
  if (origin.empty()) {
    return "";
  }
  std::stringstream result_stream;
  auto string_vector = SplitString(origin, "-");
  for (auto &str: string_vector) {
    if (str != *string_vector.begin()) {
      // don't capitalize the first word of Hump
      std::transform(str.begin(), str.begin() + 1, str.begin(), ::toupper);
    }
    result_stream << str;
  }
  return result_stream.str();
}

std::string TdfStringUtil::UnCamelize(const std::string &origin) {
  if (origin.empty()) {
    return "";
  }

  static std::regex match("([A-Z])(.)");
  auto result_string = std::regex_replace(origin, match, "-$1$2");
  std::transform(result_string.begin(),
                 result_string.end(),
                 result_string.begin(),
                 ::tolower);
  return result_string;
}

std::string TdfStringUtil::AdaptProtocolName(std::string domain) {
  auto found = domain.find(kDomainNameTDFProtocol);
  if (std::string::npos != found) {
    domain = domain.replace(found,
                            strlen(kDomainNameTDFProtocol),
                            kDomainNameTdfPrefix);
  } else {  // if domain not startWith TDF, then Camel-Case CDP DOMAIN to Class Domain
    std::transform(domain.begin(), domain.end(), domain.begin(), ::tolower);
    domain[0] = static_cast<char>(toupper(domain[0]));
  }
  return domain;
}
}
}
