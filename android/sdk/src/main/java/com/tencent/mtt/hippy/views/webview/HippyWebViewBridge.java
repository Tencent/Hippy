package com.tencent.mtt.hippy.views.webview;

import android.webkit.JavascriptInterface;

@SuppressWarnings({"unused"})
class HippyWebViewBridge {

  private final HippyWebView hippyView;

  public HippyWebViewBridge(HippyWebView webView) {
    hippyView = webView;
  }

  @JavascriptInterface
  public void postMessage(String msg) {
    if (hippyView != null) {
      hippyView.postMessage(msg);
    }
  }
}
