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
import { HippyHttpRequest } from './HippyHttpRequest'
import { HippyHttpResponse } from './HippyHttpResponse';
import { ProcessorCallback } from '../../../vfs/ProcessorCallback';
import { ResourceDataHolder } from '../../../vfs/ResourceDataHolder';
import { HippyException } from '../../../support/common/HippyException';
import { http } from '@kit.NetworkKit';
import { HippyModulePromise } from '../../modules/HippyModulePromise';

export interface HippyHttpAdapter {

  sendRequest(request: HippyHttpRequest, callback: HttpTaskCallback): void

  fetch(holder: ResourceDataHolder, nativeParams: Map<string, Object>, callback: ProcessorCallback): void

  getCookie(url: string, promise: HippyModulePromise): void

  setCookie(url: string, keyValue: string, expires: string): void
}

export interface HttpTaskCallback {

  onTaskSuccess(request: HippyHttpRequest, response: HippyHttpResponse): void

  onTaskFailed(request: HippyHttpRequest, error: HippyException): void
}
