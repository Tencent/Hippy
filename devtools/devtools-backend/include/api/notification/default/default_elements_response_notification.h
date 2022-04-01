//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#pragma once

#include <string>
#include "api/notification/devtools_elements_response_notification.h"

namespace tdf {
namespace devtools {
class DefaultElementsResponseAdapter : public ElementsResponseNotification {
 public:
  using DocumentUpdateHandler = std::function<void()>;
  explicit DefaultElementsResponseAdapter(DocumentUpdateHandler document_update_Handler);
  void NotifyDocumentUpdate() override;

 private:
  DocumentUpdateHandler document_update_Handler_;
};
}  // namespace devtools
}  // namespace tdf
