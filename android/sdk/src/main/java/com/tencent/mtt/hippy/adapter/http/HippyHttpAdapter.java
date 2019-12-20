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

/**
 * FileName: HippyHttpAdapter
 * Description：
 * History：
 */
public interface HippyHttpAdapter
{

	void sendRequest(HippyHttpRequest request, HttpTaskCallback callback);

    void destroyIfNeed();

    interface HttpTaskCallback
	{

		/**
		 * Task success notice
		 *
		 * @param request
		 * @param response
		 *            HttpURLConnection return code：mttResponse.getStatusCode()；
		 *            read data：MttInputStream inputStream =
		 *            response.getInputStream()，inputStream do not need
		 *            to close，framework will close;
		 *            get header：String header = response.getHeaderField(name);
		 *            30X get the jump address：response.getLocation();
		 */
		public void onTaskSuccess(HippyHttpRequest request, HippyHttpResponse response) throws Exception;

		/**
		 * Task fail notice
		 *
		 * @param request
		 * @param error
		 */
		public void onTaskFailed(HippyHttpRequest request, Throwable error);

	}
}
