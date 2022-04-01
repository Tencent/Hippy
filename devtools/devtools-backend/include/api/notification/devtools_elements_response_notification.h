//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#pragma once

#include <string>

namespace tdf {
namespace devtools {
class ElementsResponseNotification {
 public:
  /**
   * 通知 document update
   */
  virtual void NotifyDocumentUpdate() = 0;

  /**
   * 设置是否通知 batch 事件
   * @param need_notify_batch_event
   */
  void SetNeedNotifyBatchEvent(bool need_notify_batch_event) {
    need_notify_batch_event_ = need_notify_batch_event;
  }
 protected:
  bool need_notify_batch_event_ = true;
};
}  // namespace devtools
}  // namespace tdf
