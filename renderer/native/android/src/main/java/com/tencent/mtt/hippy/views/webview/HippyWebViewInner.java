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
package com.tencent.mtt.hippy.views.webview;

import android.content.Context;
import android.view.KeyEvent;
import android.webkit.WebSettings;
import android.webkit.WebView;

@SuppressWarnings({"unused"})
class HippyWebViewInner extends WebView {

  public HippyWebViewInner(Context context) {
    super(context);
    // 启用支持javascript
    WebSettings settings = getSettings();
    settings.setJavaScriptEnabled(true);
    settings.setBuiltInZoomControls(true);
    // 不显示webview缩放按钮
    settings.setDisplayZoomControls(false);
    settings.setDomStorageEnabled(true);
    // 支持缩放
    settings.setSupportZoom(true);
    // 设置可以访问文件
    settings.setAllowFileAccess(true);
    //地理位置相关
    settings.setGeolocationEnabled(true);
    settings.setDatabaseEnabled(true);
    settings.setLoadWithOverviewMode(true);
    settings.setUseWideViewPort(true);
    settings.setAppCacheEnabled(false);
    settings.setSupportMultipleWindows(false);
    settings.setAppCachePath(context.getDir("hwebview_appcache", 0).getPath());
    settings.setDatabasePath(context.getDir("hwebview_databases", 0).getPath());
    settings.setGeolocationDatabasePath(context.getDir("hwebview_geolocation", 0).getPath());
    settings.setLoadsImagesAutomatically(true);
    settings.setAllowContentAccess(false);
    settings.setDatabaseEnabled(true);
    settings.setDomStorageEnabled(true);
    settings.setLoadWithOverviewMode(true);
    settings.setUseWideViewPort(true);
    settings.setBuiltInZoomControls(true);
    settings.setDisplayZoomControls(false);
    settings.setSupportZoom(true);
    settings.setRenderPriority(WebSettings.RenderPriority.HIGH);
    if (android.os.Build.VERSION.SDK_INT >= 26) {
      settings.setSafeBrowsingEnabled(true);
    }
  }

  // 改写物理按键——返回的逻辑
  @Override
  public boolean onKeyDown(int keyCode, KeyEvent event) {
    if (keyCode == KeyEvent.KEYCODE_BACK) {
      if (canGoBack()) {
        // 返回上一页面
        goBack();
        return true;
      }
    }
    return super.onKeyDown(keyCode, event);
  }
}
