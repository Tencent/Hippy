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

package com.tencent.vfs;

import androidx.annotation.Nullable;

public class UrlUtils {

    public static final String PREFIX_HTTP = "http://";
    public static final String PREFIX_HTTPS = "https://";
    public static final String PREFIX_FILE = "file://";
    public static final String PREFIX_ASSETS = "assets://";
    public static final String PREFIX_BASE64_DATA = "data:";
    public static final String PREFIX_BASE64 = ";base64,";

    /**
     * @return true if this url is an http link.
     */
    public static boolean isHttpUrl(@Nullable String url) {
        return (null != url) && (url.length() > 6) && url.substring(0, 7)
                .equalsIgnoreCase(PREFIX_HTTP);
    }

    /**
     * @return true if this url is an https link.
     */
    public static boolean isHttpsUrl(@Nullable String url) {
        return (null != url) && (url.length() > 7) && url.substring(0, 8)
                .equalsIgnoreCase(PREFIX_HTTPS);
    }

    /**
     * @return true if this url is an local file path.
     */
    public static boolean isFileUrl(@Nullable String url) {
        return (null != url) && (url.length() > 6) && url.substring(0, 7)
                .equalsIgnoreCase(PREFIX_FILE);
    }

    /**
     * @return true if this url is an remote web link.
     */
    public static boolean isWebUrl(@Nullable String url) {
        return isHttpUrl(url) || isHttpsUrl(url);
    }

    /**
     * @return true if this url is an assets file path.
     */
    public static boolean isAssetsUrl(@Nullable String url) {
        return (null != url) && url.startsWith(PREFIX_ASSETS);
    }

    /**
     * @return true if this url is an local source.
     */
    public static boolean isLocalUrl(@Nullable String url) {
        if (isFileUrl(url) || isAssetsUrl(url)) {
            return true;
        }
        return isBase64Url(url);
    }

    /**
     * @return true if this url is an base64 source.
     */
    public static boolean isBase64Url(@Nullable String url) {
        return (null != url) && url.startsWith(PREFIX_BASE64_DATA) && url.contains(PREFIX_BASE64);
    }
}
