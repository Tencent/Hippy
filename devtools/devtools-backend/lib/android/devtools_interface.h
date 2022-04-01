/**
 * Copyright (c) 2020 Tencent Corporation. All rights reserved.
 * @brief 对外暴露给core / hippy 层的devtools协议
 * @details CoreDelegate 和 HippyDelegate
 */
#ifndef DEVTOOLS_BACKEND_INCLUDE_DEVTOOLS_BACKEND_DEVTOOLS_INTERFACE_H_
#define DEVTOOLS_BACKEND_INCLUDE_DEVTOOLS_BACKEND_DEVTOOLS_INTERFACE_H_

namespace tdf {
namespace devtools {
class CoreDelegate {
 public:
  using BackendLogCallBack = std::function<void(
      const std::string& log_module, const std::string& log_level, const std::string& log_message)>;
  using CoreMemoryUsageCallBack =
      std::function<void(const std::string& memoryModule, const std::string& heap_meta)>;
  using DumpDomTreeCallBack = std::function<void(const std::string tree)>;
  using UpdateDomTreeCallback = std::function<void()>;
  using CoreTimelineCallBack =
      std::function<void(const std::string& timeline_module, const std::string& time_line)>;
  using CoreFrameTimingsCallBack =
      std::function<void(const std::string& frametimings_module, const std::string& frame_timings)>;
  virtual void setOnLogCallBack(BackendLogCallBack callBack) = 0;
  virtual void setOnMemoryCallBack(CoreMemoryUsageCallBack callBack) = 0;
  virtual void DumpDomTree(DumpDomTreeCallBack callBack) = 0;
  virtual void UpdateDomTree(std::string treeData, UpdateDomTreeCallback callback) = 0;
  virtual void SendMsgToV8(std::string data, std::function<void()> callback) = 0;
  virtual void SetOnReceiveResponseFromV8(std::function<void(std::string)> listener) = 0;
  virtual void setTimeline(CoreTimelineCallBack callBack) = 0;
  virtual void setFrameTimings(CoreFrameTimingsCallBack callBack) = 0;
};

class HippyDelegate {
 public:
};
}  // namespace devtools
}  // namespace tdf
#endif  // DEVTOOLS_BACKEND_INCLUDE_DEVTOOLS_BACKEND_DEVTOOLS_INTERFACE_H_
