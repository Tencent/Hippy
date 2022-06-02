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
package com.tencent.mtt.hippy.utils;

public class UrlUtils {

  /**
   * @return True iff the url is an http: url.
   */
  public static boolean isHttpUrl(String url) {
    return (null != url) && (url.length() > 6) && url.substring(0, 7).equalsIgnoreCase("http://");
  }

  /**
   * @return True iff the url is an https: url.
   */
  public static boolean isHttpsUrl(String url) {
    return (null != url) && (url.length() > 7) && url.substring(0, 8).equalsIgnoreCase("https://");
  }

  /**
   * @return True iff the url is an file: url.
   */
  public static boolean isFileUrl(String url) {
    return (null != url) && (url.length() > 6) && url.substring(0, 7).equalsIgnoreCase("file://");
  }

  public static boolean isWebUrl(String url) {
    return isHttpUrl(url) || isHttpsUrl(url);
  }
}
