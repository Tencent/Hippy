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
import List from '@ohos.util.List';

export class HippyHttpResponse {
  public static UNKNOWN_STATUS: number = -1;
  public static HTTP_RESPONSE_STATUS_CODE: string = "statusCode";
  public static HTTP_RESPONSE_RESPONSE_MESSAGE: string = "responseMessage";
  public result: string | null = null
  private mStatusCode: number = HippyHttpResponse.UNKNOWN_STATUS;
  private mResponseMessage: string = ""
  private mRspHeaderMap: Object | null = null

  public getStatusCode(): number {
    return this.mStatusCode != null ? this.mStatusCode : HippyHttpResponse.UNKNOWN_STATUS;
  }

  public setStatusCode(statusCode: number) {
    this.mStatusCode = statusCode;
  }

  public setRspHeaderMap(headerMap: Object) {
    this.mRspHeaderMap = headerMap;
  }

  public getRspHeaderMaps(): Object | null {
    return this.mRspHeaderMap;
  }

  public setResponseMessage(message: string) {
    this.mResponseMessage = message;
  }

  public getResponseMessage(): string {
    return this.mResponseMessage;
  }
}
