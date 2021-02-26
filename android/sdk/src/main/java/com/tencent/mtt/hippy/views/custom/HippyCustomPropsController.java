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
package com.tencent.mtt.hippy.views.custom;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyInstanceContext;
import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.mtt.hippy.uimanager.RenderNode;

import android.content.Context;
import android.view.View;

@HippyController(name = HippyCustomPropsController.CLASS_NAME)
public class HippyCustomPropsController extends HippyViewController
{
	public static final String CLASS_NAME = "CustomProps";
	public static final String DT_EBLID = "dt_elementBizLeafIdentifier";

	@Override
	protected View createViewImpl(Context context)
	{
		return null;
	}

	public void setCustomProps(View view, String methodName, Object props) {

	}

	protected void onSetDTElementBizLeafIdentifier(View view) {
		if (view == null) {
			return;
		}

		Context context = view.getContext();
		if (context instanceof HippyInstanceContext) {
			HippyEngineContext engineContext = ((HippyInstanceContext)context).getEngineContext();
			assert (engineContext != null);
			if (engineContext == null) {
				return;
			}

			RenderNode node = engineContext.getRenderManager().getRenderNode(view.getId());
			if (node != null) {
				node.mHasSetDteblId = true;
			}
		}
	}
}
