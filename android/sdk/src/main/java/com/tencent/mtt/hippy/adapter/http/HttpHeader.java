/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.tencent.mtt.hippy.adapter.http;

@SuppressWarnings({"unused"})
public class HttpHeader {

  public static final class REQ {

    public static final String ACCEPT = "Accept";
    public static final String HOST = "Host";
    public static final String ACCEPT_LANGUAGE = "Accept-Language";
    public static final String ACCEPT_ENCODING = "Accept-Encoding";
    public static final String CONTENT_LENGTH = "Content-Length";
    public static final String CONTENT_TYPE = "Content-Type";
    public static final String USER_AGENT = "User-Agent";
    public static final String REFERER = "Referer";
    public static final String RANGE = "Range";
    public static final String CONNECTION = "Connection";
    public static final String COOKIE = "Cookie";
    public static final String QCOOKIE = "QCookie";
    public static final String QUA = "Q-UA";
    public static final String QGUID = "Q-GUID";
    public static final String QAUTH = "Q-Auth";
    public static final String X_ONLINE_HOST = "X-Online-Host";
    public static final String QUA2 = "Q-UA2";

    public static final String QENCRYPT = "QQ-S-Encrypt";
    public static final String QSZIP = "QQ-S-ZIP";
    public static final String QEXTINFO = "Q-EXT-INF";

    public static final String Content_Encrypt_KEY = "qbkey";
    public static final String Q_TOKEN = "Q-Token";
  }

  public static final class RSP {

    /* version */
    /* status code */
    public static final String LOCATION = "Location";
    public static final String SET_COOKIE = "Set-Cookie";
    public static final String SET_COOKIE2 = "Set-Cookie2";
    public static final String SERVER = "Server";
    public static final String CONTENT_TYPE = "Content-Type";
    public static final String CONTENT_LENGTH = "Content-Length";
    public static final String CONTENT_ENCODING = "Content-Encoding";
    public static final String CHARSET = "Charset";
    public static final String TRANSFER_ENCODING = "Transfer-Encoding";
    public static final String LAST_MODIFY = "Last-Modified";
    public static final String BYTE_RNAGES = "Byte-Ranges";
    public static final String CACHE_CONTROL = "Cache-Control";
    public static final String CONNECTION = "Connection";
    public static final String CONTENT_RANGE = "Content-Range";
    public static final String CONTENT_DISPOSITION = "Content-Disposition";
    public static final String ETAG = "ETag";
    public static final String RETRY_AFTER = "Retry-After";

    public static final String QENCRYPT = "QQ-S-Encrypt";
    public static final String QSZIP = "QQ-S-ZIP";
    public static final String QTOKEN = "tk";
    public static final String TOKEN_EXPIRE_SPAN = "maxage";
    public static final String WUP_ENV = "env";
  }
}
