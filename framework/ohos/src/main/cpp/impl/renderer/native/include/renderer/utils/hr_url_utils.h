//
// Created on 2024/6/7.
//
// Node APIs are not fully supported. To solve the compilation error of the interface cannot be found,
// please include "napi/native_api.h".

#pragma once

#include <string>

namespace hippy {
inline namespace render {
inline namespace native {

class HRUrlUtils {
public:
  static bool IsWebUrl(std::string url);
  static std::string ConvertAssetImageUrl(bool isRawfile, const std::string &resModuleName, const std::string &assetUrl);
  static std::string ConvertRawImageUrl(std::string &bundlePath, bool isRawfile, const std::string &resModuleName, const std::string &rawUrl);
  static std::string ConvertImageUrl(std::string &bundlePath, bool isRawfile, const std::string &resModuleName, const std::string &imageUrl);
  
private:
  static char *uriPrefix_;
};

} // namespace native
} // namespace render
} // namespace hippy