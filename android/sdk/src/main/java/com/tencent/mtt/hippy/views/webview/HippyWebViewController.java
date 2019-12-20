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
import android.text.TextUtils;
import android.view.View;

import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.HippyViewController;

/**
 * @Description: WebView控件共js业务使用
 * @author: harryguo
 * @date: 2019/1/8
 */

@HippyController(name = HippyWebViewController.CLASS_NAME)
public class HippyWebViewController extends HippyViewController<HippyWebView>
{
	public static final String CLASS_NAME = "WebView";

	@HippyControllerProps(name = "url", defaultType = HippyControllerProps.STRING, defaultString = "")
	public void loadUrl(HippyWebView view, String url)
	{
		if (!TextUtils.isEmpty(url))
			view.mWebView.loadUrl(url);
	}

	@Override
	public void dispatchFunction(HippyWebView view, String functionName, HippyArray var)
	{
		super.dispatchFunction(view, functionName, var);
		switch (functionName)
		{
			case "loadUrl":
				if (var != null)
				{
					String url = var.getString(0);
					loadUrl(view, url);
				}
				break;
		}
	}

	@Override
	protected View createViewImpl(Context context)
	{
		return new HippyWebView(context);
	}

	@HippyControllerProps(name = "source", defaultType = HippyControllerProps.MAP)
	public void source(HippyWebView webView, HippyMap info)
	{
		if (info != null) {
			String userAgent = info.getString("userAgent");
			if (!TextUtils.isEmpty(userAgent))
				webView.mWebView.getSettings().setUserAgentString(userAgent);
			String uri = info.getString("uri");
			if (!TextUtils.isEmpty(uri)) {
				String method = info.getString("method");
				if ("POST".equalsIgnoreCase(method)) {
					String body = info.getString("body");
					webView.mWebView.postUrl(uri, body == null ? null : body.getBytes());
				} else {
					webView.mWebView.loadUrl(uri);
				}
			} else {
				String html = info.getString("html");
				if (!TextUtils.isEmpty(html)) {
					String baseUrl = info.getString("baseUrl");
					if (!TextUtils.isEmpty(baseUrl))
						webView.mWebView.loadDataWithBaseURL(baseUrl, html, "text/html; charset=utf-8", "UTF-8", null);
					else
						webView.mWebView.loadData(html, "text/html; charset=utf-8", "UTF-8");
				}
			}
		}
	}

	public void onViewDestroy(HippyWebView webView)
	{
		webView.mWebView.destroy();
	}

	@Override
	protected boolean handleGestureBySelf()
	{
		return true;
	}
}
