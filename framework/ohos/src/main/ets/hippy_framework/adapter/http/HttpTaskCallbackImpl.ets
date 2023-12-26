/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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
import { HttpTaskCallback } from './HippyHttpAdapter';
import { HippyHttpRequest } from './HippyHttpRequest';
import { HippyHttpResponse } from './HippyHttpResponse';
import { ProcessorCallback } from '../../../vfs/ProcessorCallback';
import { ResourceDataHolder } from '../../../vfs/ResourceDataHolder';
import { FetchResultCode } from '../../HippyResourceLoader';
import { HippyException } from '../../../support/common/HippyException';
import { LogUtils } from '../../../support/utils/LogUtils';

const HTTP_TASK_CALLBACK_IMPL_TAG = "HttpTaskCallbackImpl"

export class HttpTaskCallbackImpl implements HttpTaskCallback {
  private mCallback: ProcessorCallback;
  private mDataHolder: ResourceDataHolder;

  constructor(holder: ResourceDataHolder, callback: ProcessorCallback) {
    this.mCallback = callback;
    this.mDataHolder = holder;
  }

  onTaskSuccess(request: HippyHttpRequest, response: HippyHttpResponse) {
    this.mDataHolder.resultCode = FetchResultCode.OK.valueOf();
    this.mDataHolder.addResponseHeaderProperty(HippyHttpResponse.HTTP_RESPONSE_STATUS_CODE, response.getStatusCode().toString());
    if (response.getStatusCode() != 200) {
      this.mDataHolder.errorMessage = "request status code is: " + response.getStatusCode();
      this.mCallback.onHandleCompleted();
      return;
    }
    let headers = response.getRspHeaderMaps();
    if (headers) {
      Object.entries(headers as Record<string, string>).forEach((item) => {
        this.mDataHolder.addResponseHeaderProperty(item[0], item[1])
      })
    }
    this.mDataHolder.requestResult = response.result ?? "";
    this.mCallback.onHandleCompleted();
  }


  onTaskFailed(request: HippyHttpRequest, error: HippyException) {
    this.mDataHolder.resultCode = FetchResultCode.ERR_REMOTE_REQUEST_FAILED.valueOf();
    if (error != null) {
      this.mDataHolder.errorMessage = error.message;
      LogUtils.d(HTTP_TASK_CALLBACK_IMPL_TAG, "error : " + this.mDataHolder.errorMessage)
    }
    this.mCallback.onHandleCompleted();
  }
}
