/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
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

#include "ohos/jsh_get_url_connection.h"
#include "footstone/logging.h"
#include <asio/ip/tcp.hpp>
#include <iostream>
#include "nlohmann/json.hpp"
#include "tunnel/ws/web_socket_channel.h"

#define JSVM_INSPECTOR_PORT_STRING "9225"

namespace hippy::devtools {

using asio::ip::tcp;

bool JSHGetUrlConnection::DoRequestJsonBody(std::string &body) {
  try {
    asio::ip::tcp::iostream s;
    s.expires_after(asio::chrono::seconds(60));
    s.connect("localhost", JSVM_INSPECTOR_PORT_STRING);
    if (!s) {
      FOOTSTONE_LOG(ERROR) << "JSH debug request json, unable to connect: " << s.error().message();
      return false;
    }

    // Send the request. We specify the "Connection: close" header so that the
    // server will close the socket after transmitting the response. This will
    // allow us to treat all data up until the EOF as the content.
    s << "GET " << "/json" << " HTTP/1.0\r\n";
    s << "Host: " << "localhost" << "\r\n";
    s << "Accept: */*\r\n";
    s << "Connection: close\r\n\r\n";

    // By default, the stream is tied with itself. This means that the stream
    // automatically flush the buffered output before attempting a read. It is
    // not necessary not explicitly flush the stream at this point.

    // Check that response is OK.
    std::string http_version;
    s >> http_version;
    unsigned int status_code = 0;
    s >> status_code;
    std::string status_message;
    std::getline(s, status_message);
    if (!s || http_version.substr(0, 5) != "HTTP/") {
      FOOTSTONE_LOG(ERROR) << "JSH debug request json, invalid response.";
      return false;
    }
    if (status_code != 200) {
      FOOTSTONE_LOG(ERROR) << "JSH debug request json, response returned with status code:" << status_code;
      return false;
    }

    // Process the response headers, which are terminated by a blank line.
    std::string header;
    while (std::getline(s, header) && header != "\r") {
      FOOTSTONE_LOG(INFO) << "JSH debug request json, http header: " << header;
    }

    std::string bodyLine;
    while (std::getline(s, bodyLine) && bodyLine != "\n" && bodyLine != "") {
      FOOTSTONE_LOG(INFO) << "JSH debug request json, http body: " << bodyLine;
      body += bodyLine;
    }
  }
  catch (std::exception& e) {
    FOOTSTONE_LOG(ERROR) << "JSH debug request json, exception: " << e.what();
    return false;
  }
  return body.size() > 0 ? true : false;
}

// body是类似如下的json串：
//[
//  {
//    "description": "node.js instance",
//    "devtoolsFrontendUrl": "devtools://devtools/bundled/js_app.html?v8only=true&ws=localhost:9229/cb3fcc9f-fc0f-403e-8aec-f60e859435a5",
//    "devtoolsFrontendUrlCompat": "devtools://devtools/bundled/inspector.html?v8only=true&ws=localhost:9229/cb3fcc9f-fc0f-403e-8aec-f60e859435a5",
//    "faviconUrl": "https://nodejs.org/static/images/favicons/favicon.ico",
//    "id": "cb3fcc9f-fc0f-403e-8aec-f60e859435a5",
//    "title": "Node.js[4035]",
//    "type": "node",
//    "url": "file://",
//    "webSocketDebuggerUrl": "ws://localhost:9229/cb3fcc9f-fc0f-403e-8aec-f60e859435a5"
//  }
//]
bool JSHGetUrlConnection::ParseWsUrlFromBody(std::string &body, std::string &retWsUrl) {
  nlohmann::json data_json = nlohmann::json::parse(body, nullptr, false);
  if (data_json.is_array() && data_json.size() > 0) {
    nlohmann::json obj_json = data_json[0];
    if (obj_json.is_object()) {
      const char* devUrlKey = "devtoolsFrontendUrl";
      if (obj_json.contains(devUrlKey)) {
        std::string devUrl = obj_json[devUrlKey].get<std::string>();
        FOOTSTONE_LOG(INFO) << "JSH debug request json, devtoolsFrontendUrl: " << devUrl;
        
        std::string wsUrlKey = "ws=";
        auto wsPos = devUrl.find(wsUrlKey);
        if (wsPos != std::string::npos) {
          wsPos += wsUrlKey.length();
          auto pathPos = devUrl.find("/", wsPos);
          if (pathPos != std::string::npos) {
            pathPos += 1;
            std::string wsPath = devUrl.substr(pathPos);
            retWsUrl = "ws://127.0.0.1:";
            retWsUrl += JSVM_INSPECTOR_PORT_STRING;
            retWsUrl += "/";
            retWsUrl += wsPath;
            return true;
          }
        }
      }
    }
  }
  return false;
}

} // namespace hippy::devtools
