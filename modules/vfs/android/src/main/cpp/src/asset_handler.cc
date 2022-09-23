#include "android_vfs/asset_handler.h"

#include "android_vfs/uri.h"
#include "footstone/check.h"
#include "footstone/logging.h"
#include "footstone/string_view_utils.h"

using string_view = footstone::string_view;
using StringViewUtils = footstone::StringViewUtils;

namespace hippy {
inline namespace vfs {

bool ReadAsset(const string_view& path,
               AAssetManager* aasset_manager,
               UriHandler::bytes& bytes,
               bool is_auto_fill) {
  auto file_path = StringViewUtils::ToStdString(
      StringViewUtils::ConvertEncoding(path, string_view::Encoding::Utf8).utf8_value());
  const char* asset_path = file_path.c_str();
  if (file_path.length() > 0 && file_path[0] == '/') {
    file_path = file_path.substr(1);
    asset_path = file_path.c_str();
  }
  FOOTSTONE_DLOG(INFO) << "asset_path = " << asset_path;
  auto asset = AAssetManager_open(aasset_manager, asset_path, AASSET_MODE_STREAMING);
  if (asset) {
    auto size = AAsset_getLength(asset);
    if (is_auto_fill) {
      size += 1;
    }
    size_t file_size;
    auto flag = footstone::numeric_cast(size, file_size);
    if (!flag) {
      return false;
    }
    bytes.resize(file_size);
    uint64_t offset = 0;
    uint64_t read_bytes;
    while ((read_bytes = static_cast<uint64_t>(
        AAsset_read(asset, &bytes[0] + offset, bytes.size() - offset))) > 0) {
      offset += read_bytes;
    }
    if (is_auto_fill) {
      bytes.back() = '\0';
    }
    AAsset_close(asset);
    FOOTSTONE_DLOG(INFO) << "path = " << path << ", len = " << bytes.length()
                         << ", file_data = "
                         << reinterpret_cast<const char*>(bytes.c_str());
    return true;
  }
  FOOTSTONE_DLOG(INFO) << "ReadFile fail, file_path = " << file_path;
  return false;
}

void AssetHandler::RequestUntrustedContent(
    std::shared_ptr<SyncContext> ctx,
    std::function<std::shared_ptr<UriHandler>()> next) {
  string_view uri = ctx->uri;
  std::shared_ptr<Uri> uri_obj = Uri::Create(uri);
  string_view path = uri_obj->GetPath();
  if (path.encoding() == string_view::Encoding::Unknown) {
    ctx->code = UriHandler::RetCode::PathError;
    return;
  }
  bool ret = ReadAsset(path, aasset_manager_, ctx->content, false);
  if (ret) {
    ctx->code = UriHandler::RetCode::Success;
  } else {
    ctx->code = UriHandler::RetCode::Failed;
  }
  auto next_handler = next();
  if (next_handler) {
    next_handler->RequestUntrustedContent(ctx, next);
  }
}

void AssetHandler::RequestUntrustedContent(
    std::shared_ptr<ASyncContext> ctx,
    std::function<std::shared_ptr<UriHandler>()> next) {
  string_view uri = ctx->uri;
  std::shared_ptr<Uri> uri_obj = Uri::Create(uri);
  string_view path = uri_obj->GetPath();
  if (path.encoding() == string_view::Encoding::Unknown) {
    ctx->cb(UriHandler::RetCode::PathError, {}, UriHandler::bytes());
    return;
  }
  auto new_cb = [orig_cb = ctx->cb](RetCode code , std::unordered_map<std::string, std::string> meta, bytes content) {
    orig_cb(code, std::move(meta), std::move(content));
  };
  ctx->cb = new_cb;
  LoadByAsset(path, ctx, next);
}

void AssetHandler::LoadByAsset(const string_view& path,
                               std::shared_ptr<ASyncContext> ctx,
                               std::function<std::shared_ptr<UriHandler>()> next,
                               bool is_auto_fill) {
  FOOTSTONE_DLOG(INFO) << "ReadAssetFile file_path = " << path;
  auto runner = runner_.lock();
  if (!runner) {
    ctx->cb(UriHandler::RetCode::DelegateError, {}, UriHandler::bytes());
    return;
  }
  runner->PostTask([path, aasset_manager = aasset_manager_, is_auto_fill, ctx] {
    UriHandler::bytes content;
    bool ret = ReadAsset(path, aasset_manager, content, is_auto_fill);
    if (ret) {
      ctx->cb(UriHandler::RetCode::Success, {}, std::move(content));
    } else {
      ctx->cb(UriHandler::RetCode::Failed, {}, std::move(content));
    }
  });
}

}
}
