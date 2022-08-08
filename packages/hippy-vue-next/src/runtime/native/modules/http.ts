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

import type { NeedToTyped } from '../../../config';

export interface HttpRequestParams {
  method: string;
  data?: Record<string, NeedToTyped>;
  headers: Record<string, string>;
  url: string;
}

export interface NativeRequestBaseResponse {
  success: boolean;
  code: number;
}

export interface NativeRequestSuccess extends NativeRequestBaseResponse {
  type: 'SUCCESS';
  data: {
    code: number;
    result: {
      code: number;
      data: NeedToTyped;
    }[];
  };
}

export interface NativeRequestError extends NativeRequestBaseResponse {
  type: 'ERROR';
  errorText: string;
}

export type NativeRequestResponse = NativeRequestSuccess | NativeRequestError;

export interface Http {
  request: (
    params: HttpRequestParams,
    callback: (res: NativeRequestResponse) => void,
  ) => void;
}
