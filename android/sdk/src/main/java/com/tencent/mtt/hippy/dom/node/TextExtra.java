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
package com.tencent.mtt.hippy.dom.node;

/**
 * @author: edsheng
 * @date: 2017/12/12 14:19
 * @version: V1.0
 */

public class TextExtra
{
	public Object	mExtra;
	public float	mLeftPadding;
	public float	mRightPadding;
	public float	mBottomPadding;
	public float	mTopPadding;

	public TextExtra(Object extra, float mLeftPadding, float mRightPadding, float mBottomPadding, float mTopPadding)
	{
		this.mExtra = extra;
		this.mLeftPadding = mLeftPadding;
		this.mRightPadding = mRightPadding;
		this.mBottomPadding = mBottomPadding;
		this.mTopPadding = mTopPadding;
	}


}
