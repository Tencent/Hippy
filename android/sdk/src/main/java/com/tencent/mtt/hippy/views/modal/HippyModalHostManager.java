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
package com.tencent.mtt.hippy.views.modal;

import android.content.Context;
import android.content.DialogInterface;
import android.view.View;

import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.dom.node.StyleNode;
import com.tencent.mtt.hippy.uimanager.HippyGroupController;

@HippyController(name = HippyModalHostManager.HIPPY_CLASS)
public class HippyModalHostManager extends HippyGroupController<HippyModalHostView>
{

	public static final String	HIPPY_CLASS	= "Modal";

	@Override
	protected View createViewImpl(Context context)
	{
		final HippyModalHostView hippyModalHostView = createModalHostView(context);

		hippyModalHostView.setOnRequestCloseListener(new HippyModalHostView.OnRequestCloseListener()
		{
			@Override
			public void onRequestClose(DialogInterface dialog)
			{
				new RequestCloseEvent().send(hippyModalHostView, null);
			}
		});
		hippyModalHostView.setOnShowListener(new DialogInterface.OnShowListener()
		{
			@Override
			public void onShow(DialogInterface dialog)
			{
				new ShowEvent().send(hippyModalHostView, null);
			}
		});
		return hippyModalHostView;
	}

	protected HippyModalHostView createModalHostView(Context context)
	{
		return new HippyModalHostView(context);
	}

	@Override
	protected StyleNode createNode(boolean isVirtual)
	{
		return new ModalStyleNode();
	}

	@Override
	public void onViewDestroy(HippyModalHostView hippyModalHostView)
	{
		super.onViewDestroy(hippyModalHostView);
		hippyModalHostView.onInstanceDestroy(hippyModalHostView.getId());
	}

	@HippyControllerProps(name = "animationType", defaultType = HippyControllerProps.STRING, defaultString = "none")
	public void setAnimationType(HippyModalHostView view, String animationType)
	{
		view.setAnimationType(animationType);
	}
    @HippyControllerProps(name = "immersionStatusBar", defaultType = HippyControllerProps.BOOLEAN)
    public void setEnterImmersionStatusBar(HippyModalHostView view, boolean fullScreen)
    {
        view.setEnterImmersionStatusBar(fullScreen);
    }
	@HippyControllerProps(name = "darkStatusBarText", defaultType = HippyControllerProps.BOOLEAN)
	public void setImmersionStatusBarTextDarkColor(HippyModalHostView view, boolean fullScreen)
	{
		view.setImmersionStatusBarTextDarkColor(fullScreen);
	}

	@HippyControllerProps(name = "transparent", defaultType = HippyControllerProps.BOOLEAN)
	public void setTransparent(HippyModalHostView view, boolean transparent)
	{
		view.setTransparent(transparent);
	}

	@Override
	public void onAfterUpdateProps(HippyModalHostView v)
	{
		super.onAfterUpdateProps(v);
		v.showOrUpdate();
	}

}
