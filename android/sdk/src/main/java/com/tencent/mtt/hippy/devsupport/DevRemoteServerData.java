package com.tencent.mtt.hippy.devsupport;

import android.text.TextUtils;
import com.tencent.mtt.hippy.utils.LogUtils;
import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.net.URLDecoder;

public class DevRemoteServerData {

  private static String KEY_DEBUG_URL = "debugUrl";
  private String scheme;  // protocol http or https
  private String host;  // host:port address
  private String path;
  private String versionId;
  private String wsUrl;  // ws debug url if remoteDebugUrl with

  public DevRemoteServerData(String remoteServerUrl) {
    parseUrl(remoteServerUrl);
  }

  /**
   * parse url in remote debugging
   * <p>url structure: http://host/versionId/index.bundle</p>
   *
   * @param remoteServerUrl remote debugging url
   */
  private void parseUrl(String remoteServerUrl) {
    if (TextUtils.isEmpty(remoteServerUrl)) {
      return;
    }
    try {
      URL url = new URL(remoteServerUrl);
      scheme = url.getProtocol();
      host = url.getHost();
      path = url.getPath();
      int port = url.getPort();
      if (port > 0) {
        host = host + ":" + port;
      }
      wsUrl = parseQueryDebugUrl(url.getQuery());
      if (path.startsWith("/")) {
        path = path.substring(1); // remove first character /
      }
      int index = path.indexOf("/");
      if (index >= 0) {
        versionId = path.substring(0, index);
      }
      LogUtils.i("Hippy DevRemoteServerData",
        String.format("parseUrl host:%s, versionId:%s", host, versionId));
    } catch (Exception e) {
      LogUtils.e("Hippy DevRemoteServerData", "parseUrl error", e);
    }
  }

  /**
   * parse the ws debug url when remoteDebugUrl with
   *
   * @param query query params
   * @return debugUrl value
   * @throws UnsupportedEncodingException not support encoding
   */
  private String parseQueryDebugUrl(String query) throws UnsupportedEncodingException {
    if (TextUtils.isEmpty(query)) {
      return null;
    }
    String[] queryList = query.split("&");
    for (String queryItem : queryList) {
      int idPosition = queryItem.indexOf("=");
      if (idPosition >= 0) {
        String findKey = queryItem.substring(0, idPosition);
        if (KEY_DEBUG_URL.equals(findKey)) {
          return URLDecoder.decode(queryItem.substring(idPosition + 1), "UTF-8");
        }
      }
    }
    return null;
  }

  public boolean isValid() {
    return !TextUtils.isEmpty(host);
  }

  public String getHost() {
    return host;
  }

  public String getVersionId() {
    return versionId;
  }

  public String getPath() {
    return path;
  }

  public String getScheme() {
    return scheme;
  }

  public String getWsUrl() {
    return wsUrl;
  }
}
