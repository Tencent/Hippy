//
// Created on 2024/6/7.
//
// Node APIs are not fully supported. To solve the compilation error of the interface cannot be found,
// please include "napi/native_api.h".

#include <filemanagement/file_uri/oh_file_uri.h>
#include <regex>
#include "renderer/utils/hr_url_utils.h"
#include "footstone/logging.h"

namespace hippy {
inline namespace render {
inline namespace native {

static const std::string BASE64_IMAGE_PREFIX = "data:image";
static const std::string RAW_IMAGE_PREFIX = "hpfile://";
static const std::string ASSET_PREFIX = "asset:/";
static const std::string INTERNET_IMAGE_PREFIX = "http";

char *HRUrlUtils::uriPrefix_ = nullptr;

bool HRUrlUtils::IsWebUrl(std::string url) {
  std::regex regex("^https?://.+");
  return std::regex_search(url, regex);
}

std::string HRUrlUtils::ConvertAssetImageUrl(bool isRawfile, const std::string &resModuleName, const std::string &assetUrl) {
  const std::string assetPrefix = "asset:/";
  if (assetUrl.find(assetPrefix) == 0) {
    if (isRawfile) {
      std::string resourceStr = std::string("resource://RAWFILE/");
      resourceStr += assetUrl.substr(assetPrefix.size());
      return resourceStr;
    } else {
      if(uriPrefix_ == nullptr) {
        FileManagement_ErrCode err = OH_FileUri_GetUriFromPath("", 0, &uriPrefix_);
        if(err != FileManagement_ErrCode::ERR_OK) {
          return assetUrl;
        }
      }
      std::string resourceStr = std::string(uriPrefix_)
        + "/data/storage/el1/bundle/" + resModuleName + "/resources/resfile/"
        + assetUrl.substr(assetPrefix.size());
      return resourceStr;
    }
  } else {
    return assetUrl;
  }
}

std::string HRUrlUtils::ConvertRawImageUrl(std::string &bundlePath, bool isRawfile, const std::string &resModuleName, const std::string &rawUrl) {
  // hpfile://./assets/defaultSource.jpg
  if (rawUrl.find("hpfile://") == 0) {
    std::string prefix = "hpfile://./";
    auto pos = rawUrl.find(prefix);
    if (pos == 0) {
      auto relativePath = rawUrl.substr(prefix.length());
      auto theBundlePath = bundlePath;
      auto lastPos = theBundlePath.rfind("/");
      if (lastPos != std::string::npos) {
        theBundlePath = theBundlePath.substr(0, lastPos + 1);
      }
      auto fullPath = theBundlePath + relativePath;
      auto localPath = HRUrlUtils::ConvertAssetImageUrl(isRawfile, resModuleName, fullPath);
      return localPath;
    }
  }
  return rawUrl;
}

std::string HRUrlUtils::ConvertImageUrl(std::string &bundlePath, bool isRawfile, const std::string &resModuleName, const std::string &imageUrl) {
  if (imageUrl.find(BASE64_IMAGE_PREFIX) == 0) {
    return imageUrl;
  } else if (imageUrl.find(RAW_IMAGE_PREFIX) == 0) {
    return HRUrlUtils::ConvertRawImageUrl(bundlePath, isRawfile, resModuleName, imageUrl);
  } else if (HRUrlUtils::IsWebUrl(imageUrl)) {
    return imageUrl;
  } else if (imageUrl.find(ASSET_PREFIX) == 0) {
    return HRUrlUtils::ConvertAssetImageUrl(isRawfile, resModuleName, imageUrl);
  }
  return imageUrl;
}

}
}
}