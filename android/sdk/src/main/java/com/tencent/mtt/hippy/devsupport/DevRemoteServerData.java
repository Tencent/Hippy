package com.tencent.mtt.hippy.devsupport;

import android.text.TextUtils;
import com.tencent.mtt.hippy.utils.LogUtils;
import java.net.MalformedURLException;
import java.net.URL;

public class DevRemoteServerData {

  private String host;
  private String path;
  private String versionId;

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
      host = url.getHost();
      path = url.getPath();
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

  public boolean isValid() {
    return !TextUtils.isEmpty(host) && !TextUtils.isEmpty(versionId);
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
}
