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

import android.text.TextUtils;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

@SuppressWarnings({"unused"})
public class HippyHttpResponse {

  public static final Integer UNKNOWN_STATUS = -1;

  private Integer mStatusCode = UNKNOWN_STATUS;

  private String mResponseMessage;

  private Map<String, List<String>> mRspHeaderMap = null;

  private InputStream mInputStream;

  private InputStream mErrorStream;

  public Integer getStatusCode() {
    return mStatusCode != null ? mStatusCode : UNKNOWN_STATUS;
  }

  public void setStatusCode(Integer statusCode) {
    this.mStatusCode = statusCode;
  }

  public void setRspHeaderMap(Map<String, List<String>> headerMap) {
    mRspHeaderMap = headerMap;
  }

  public Map<String, List<String>> getRspHeaderMaps() {
    return mRspHeaderMap;
  }

  public List<String> getHeaderFields(String name) {
    if (TextUtils.isEmpty(name) || mRspHeaderMap == null) {
      return null;
    }

    return mRspHeaderMap.get(name);
  }

  public String getHeaderField(String name) {
    if (TextUtils.isEmpty(name) || mRspHeaderMap == null) {
      return null;
    }

    List<String> fields = mRspHeaderMap.get(name);
    return fields != null && fields.size() > 0 ? fields.get(0) : null;
  }

  public InputStream getInputStream() {
    return mInputStream;
  }

  public void setInputStream(InputStream inputStream) {
    this.mInputStream = inputStream;
  }

  public InputStream getErrorStream() {
    return mErrorStream;
  }

  public void setErrorStream(InputStream errorStream) {
    this.mErrorStream = errorStream;
  }

  public void setResponseMessage(String message) {
    this.mResponseMessage = message;
  }

  public String getResponseMessage() {
    return mResponseMessage;
  }

  public void close() {
    if (mInputStream != null) {
      try {
        mInputStream.close();
      } catch (IOException e) {
        e.printStackTrace();
      }
    }

    if (mErrorStream != null) {
      try {
        mErrorStream.close();
      } catch (IOException e) {
        e.printStackTrace();
      }
    }
  }
}
