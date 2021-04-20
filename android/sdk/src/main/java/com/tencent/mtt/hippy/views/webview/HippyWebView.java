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
import android.graphics.Bitmap;
import android.os.Build;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.HippyViewBase;
import com.tencent.mtt.hippy.uimanager.HippyViewEvent;
import com.tencent.mtt.hippy.uimanager.NativeGestureDispatcher;
import com.tencent.mtt.hippy.utils.UrlUtils;

import java.net.URLDecoder;

public class HippyWebView extends FrameLayout implements HippyViewBase {
	protected final HippyWebViewInner mWebView;
	private HippyViewEvent mEventOnMessage = null;

	public HippyWebView(Context context)
	{
		super(context);
		mWebView = new HippyWebViewInner(context);
		addView(mWebView);
		initWebView();
	}

	private void initWebView()
	{
		mWebView.setWebViewClient(new WebViewClient() {
			final HippyViewEvent mEventOnError = new HippyViewEvent("onError");
			final HippyViewEvent mEventonLoad = new HippyViewEvent("onLoad");
			final HippyViewEvent mEventonLoadEnd = new HippyViewEvent("onLoadEnd");
			final HippyViewEvent mEventonLoadStart = new HippyViewEvent("onLoadStart");
			final String mMessageUrlPre = "hippy://postMessage?data=";

			@Override
			public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
				HippyMap event = new HippyMap();
				if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
					event.pushString("error", (String) error.getDescription());
					event.pushInt("errorCode", error.getErrorCode());
				}
				else {
					event.pushString("error", "unknown error");
					event.pushInt("errorCode", Integer.MAX_VALUE);
				}
				mEventOnError.send(HippyWebView.this, event);
				super.onReceivedError(view, request, error);
			}

			@Override
			public boolean shouldOverrideUrlLoading(WebView view, String url) {
				if (url != null)
				{
					if (url.startsWith(mMessageUrlPre)) {
						postMessage(URLDecoder.decode(url.substring(mMessageUrlPre.length())));
						return true;
					}
					else if (UrlUtils.isWebUrl(url) || UrlUtils.isFileUrl(url)) {
						view.loadUrl(url);
						return true;
					}
				}
				return super.shouldOverrideUrlLoading(view, url);
			}

			public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
				if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
					return shouldOverrideUrlLoading(view, request.getUrl().toString());
				}
				return super.shouldOverrideUrlLoading(view, request);
			}

			@Override
			public void onPageFinished(WebView view, String url) {
				// android 4.2以下，使用注入js的方式来实现hippy.onMessage。4.2及以上使用addJavaScriptInterface实现
				if (Build.VERSION.SDK_INT < 17)
					view.loadUrl("javascript:hippy={};hippy.onMessage=function(data){location.href='hippy://postMessage?data='+encodeURIComponent(data)}");
				HippyMap event = new HippyMap();
				event.pushString("url", url);
				mEventonLoad.send(HippyWebView.this, event);
				mEventonLoadEnd.send(HippyWebView.this, event);
				super.onPageFinished(view, url);
			}

			@Override
			public void onPageStarted(WebView view, String url, Bitmap favicon) {
				HippyMap event = new HippyMap();
				event.pushString("url", url);
				mEventonLoadStart.send(HippyWebView.this, event);
				super.onPageStarted(view, url, favicon);
			}
		});
		mWebView.setWebChromeClient(new WebChromeClient());
		// 避免安全隐患
		if (Build.VERSION.SDK_INT >= 17) {
			// 为了让网页端可以通过：hippy.postMessage("hello");的方式发送数据给hippy前端
			mWebView.addJavascriptInterface(new HippyWebViewBridge(this), "hippy");
		}
		if (Build.VERSION.SDK_INT < 19)
		{
			mWebView.removeJavascriptInterface("searchBoxJavaBridge_");
			mWebView.removeJavascriptInterface("accessibility");
			mWebView.removeJavascriptInterface("accessibilityTraversal");
		}
	}

	public void postMessage(String msg) {
		if (mEventOnMessage == null)
			mEventOnMessage = new HippyViewEvent("onMessage");

		HippyMap event = new HippyMap();
		event.pushString("data", msg);
		mEventOnMessage.send(this, event);
	}

	@Override
	public NativeGestureDispatcher getGestureDispatcher() {
		return null;
	}

	@Override
	public void setGestureDispatcher(NativeGestureDispatcher dispatcher) {
	}
}
