/* 	Copyright (C) 2018 Tencent, Inc.
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
package com.tencent.mtt.supportui.adapters.image;

/**
 * Created by leonardgong on 2017/12/4 0004.
 */

public interface IImageRequestListener<T>
{
	/**
	 * notify image request start
	 *
	 * @param drawableTarget
	 */
	void onRequestStart(T drawableTarget);

	/**
	 * notify image request success, pass a IDrawableTarget instance
	 *
	 * @param drawableTarget
	 */
	void onRequestSuccess(T drawableTarget);

	/**
	 * notify image request fail
	 */
	void onRequestFail(Throwable cause, String source);
}
