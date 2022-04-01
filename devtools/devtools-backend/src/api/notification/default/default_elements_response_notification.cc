//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#include "api/notification/default/default_elements_response_notification.h"
#include <string>
#include "api/devtools_backend_service.h"
#include "devtools_base/logging.h"

namespace tdf {
namespace devtools {
DefaultElementsResponseAdapter::DefaultElementsResponseAdapter(DocumentUpdateHandler document_update_Handler)
    : document_update_Handler_(document_update_Handler) {}

void DefaultElementsResponseAdapter::NotifyDocumentUpdate() {
//  auto runner = DevtoolsBackendService::GetInstance().GetTaskRunner();
//  if (!runner) {
//    BACKEND_LOGE(TDF_BACKEND, "NotifyDocumentUpdate error, runner is nullptr");
//    return;
//  }
//  if (!document_update_Handler_ || !need_notify_batch_event_) {
//    BACKEND_LOGE(TDF_BACKEND, "NotifyDocumentUpdate error, handler is nullptr or not need");
//    return;
//  }
//  runner->PostTask([this] {
    document_update_Handler_();
//  });
}
}  // namespace devtools
}  // namespace tdf
