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

export class HttpHeaderRequest {
  public static ACCEPT: string = "Accept"
  public static HOST: string = "Host";
  public static ACCEPT_LANGUAGE: string = "Accept-Language";
  public static ACCEPT_ENCODING: string = "Accept-Encoding";
  public static CONTENT_LENGTH: string = "Content-Length";
  public static CONTENT_TYPE: string = "Content-Type";
  public static USER_AGENT: string = "User-Agent";
  public static REFERER: string = "Referer";
  public static RANGE: string = "Range";
  public static CONNECTION: string = "Connection";
  public static COOKIE: string = "Cookie";
}

export class HttpHeaderResponse {
  public static LOCATION: string = "Location";
  public static SET_COOKIE: string = "Set-Cookie";
  public static SET_COOKIE2: string = "Set-Cookie2";
  public static SERVER: string = "Server";
  public static CONTENT_TYPE: string = "Content-Type";
  public static CONTENT_LENGTH: string = "Content-Length";
  public static CONTENT_ENCODING: string = "Content-Encoding";
  public static CHARSET: string = "Charset";
  public static TRANSFER_ENCODING: string = "Transfer-Encoding";
  public static LAST_MODIFY: string = "Last-Modified";
  public static BYTE_RANGES: string = "Byte-Ranges";
  public static CACHE_CONTROL: string = "Cache-Control";
  public static CONNECTION: string = "Connection";
  public static CONTENT_RANGE: string = "Content-Range";
  public static CONTENT_DISPOSITION: string = "Content-Disposition";
  public static ETAG: string = "ETag";
  public static RETRY_AFTER: string = "Retry-After";
}
