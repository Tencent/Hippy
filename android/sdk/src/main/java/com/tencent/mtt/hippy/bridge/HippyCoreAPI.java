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
package com.tencent.mtt.hippy.bridge;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyAPIProvider;
import com.tencent.mtt.hippy.common.Provider;
import com.tencent.mtt.hippy.modules.javascriptmodules.Dimensions;
import com.tencent.mtt.hippy.modules.javascriptmodules.EventDispatcher;
import com.tencent.mtt.hippy.modules.javascriptmodules.HippyJavaScriptModule;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;
import com.tencent.mtt.hippy.modules.nativemodules.animation.AnimationFrameModule;
import com.tencent.mtt.hippy.modules.nativemodules.animation.AnimationModule;
import com.tencent.mtt.hippy.modules.nativemodules.audio.AudioPlayerModule;
import com.tencent.mtt.hippy.modules.nativemodules.clipboard.ClipboardModule;
import com.tencent.mtt.hippy.modules.nativemodules.console.ConsoleModule;
import com.tencent.mtt.hippy.modules.nativemodules.deviceevent.DeviceEventModule;
import com.tencent.mtt.hippy.modules.nativemodules.exception.ExceptionModule;
import com.tencent.mtt.hippy.modules.nativemodules.image.ImageLoaderModule;
import com.tencent.mtt.hippy.modules.nativemodules.netinfo.NetInfoModule;
import com.tencent.mtt.hippy.modules.nativemodules.network.NetworkModule;
import com.tencent.mtt.hippy.modules.nativemodules.network.WebSocketModule;
import com.tencent.mtt.hippy.modules.nativemodules.storage.StorageModule;
import com.tencent.mtt.hippy.modules.nativemodules.timer.TimerModule;
import com.tencent.mtt.hippy.modules.nativemodules.uimanager.UIManagerModule;
import com.tencent.mtt.hippy.modules.nativemodules.utils.UtilsModule;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.mtt.hippy.views.audioview.AudioViewController;
import com.tencent.mtt.hippy.views.image.HippyImageViewController;
import com.tencent.mtt.hippy.views.list.HippyListItemViewController;
import com.tencent.mtt.hippy.views.list.HippyListViewController;
import com.tencent.mtt.hippy.views.modal.HippyModalHostManager;
import com.tencent.mtt.hippy.views.navigator.NavigatorController;
import com.tencent.mtt.hippy.views.refresh.HippyPullFooterViewController;
import com.tencent.mtt.hippy.views.refresh.HippyPullHeaderViewController;
import com.tencent.mtt.hippy.views.refresh.RefreshWrapperController;
import com.tencent.mtt.hippy.views.refresh.RefreshWrapperItemController;
import com.tencent.mtt.hippy.views.scroll.HippyScrollViewController;
import com.tencent.mtt.hippy.views.text.HippyTextViewController;
import com.tencent.mtt.hippy.views.textinput.HippyTextInputController;
import com.tencent.mtt.hippy.views.videoview.VideoHippyViewController;
import com.tencent.mtt.hippy.views.view.HippyViewGroupController;
import com.tencent.mtt.hippy.views.viewpager.HippyViewPagerController;
import com.tencent.mtt.hippy.views.viewpager.HippyViewPagerItemController;
import com.tencent.mtt.hippy.views.webview.HippyWebViewController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class HippyCoreAPI implements HippyAPIProvider
{
	@Override
	public Map<Class<? extends HippyNativeModuleBase>, Provider<? extends HippyNativeModuleBase>> getNativeModules(final HippyEngineContext context)
	{
		Map<Class<? extends HippyNativeModuleBase>, Provider<? extends HippyNativeModuleBase>> modules = new HashMap<>();
		modules.put(TimerModule.class, new Provider<TimerModule>()
		{
			@Override
			public TimerModule get()
			{
				return new TimerModule(context);
			}
		});
		modules.put(ConsoleModule.class, new Provider<ConsoleModule>()
		{
			@Override
			public ConsoleModule get()
			{
				return new ConsoleModule(context);
			}
		});
		modules.put(ExceptionModule.class, new Provider<HippyNativeModuleBase>()
		{
			@Override
			public HippyNativeModuleBase get()
			{
				return new ExceptionModule(context);
			}
		});
		modules.put(UIManagerModule.class, new Provider<HippyNativeModuleBase>()
		{
			@Override
			public HippyNativeModuleBase get()
			{
				return new UIManagerModule(context);
			}
		});
		modules.put(AnimationModule.class, new Provider<HippyNativeModuleBase>()
		{
			@Override
			public HippyNativeModuleBase get()
			{
				return new AnimationModule(context);
			}
		});
		modules.put(StorageModule.class, new Provider<HippyNativeModuleBase>()
		{
			@Override
			public HippyNativeModuleBase get()
			{
				return new StorageModule(context);
			}
		});
		modules.put(NetInfoModule.class, new Provider<HippyNativeModuleBase>()
		{
			@Override
			public HippyNativeModuleBase get()
			{
				return new NetInfoModule(context);
			}
		});
		modules.put(AnimationFrameModule.class, new Provider<HippyNativeModuleBase>()
		{
			@Override
			public HippyNativeModuleBase get()
			{
				return new AnimationFrameModule(context);
			}
		});
		modules.put(ImageLoaderModule.class, new Provider<HippyNativeModuleBase>()
		{
			@Override
			public HippyNativeModuleBase get()
			{
				return new ImageLoaderModule(context);
			}
		});
		modules.put(NetworkModule.class, new Provider<HippyNativeModuleBase>()
		{
			@Override
			public HippyNativeModuleBase get()
			{
				return new NetworkModule(context);
			}
		});
		modules.put(DeviceEventModule.class, new Provider<HippyNativeModuleBase>()
		{
			@Override
			public HippyNativeModuleBase get()
			{
				return new DeviceEventModule(context);
			}
		});
		modules.put(WebSocketModule.class, new Provider<HippyNativeModuleBase>()
		{
			@Override
			public HippyNativeModuleBase get()
			{
				return new WebSocketModule(context);
			}
		});
		modules.put(UtilsModule.class, new Provider<HippyNativeModuleBase>()
		{
			@Override
			public HippyNativeModuleBase get()
			{
				return new UtilsModule(context);
			}
		});
		modules.put(ClipboardModule.class, new Provider<HippyNativeModuleBase>()
		{
			@Override
			public HippyNativeModuleBase get()
			{
				return new ClipboardModule(context);
			}
		});
		modules.put(AudioPlayerModule.class, new Provider<HippyNativeModuleBase>()
		{
        	@Override
			public HippyNativeModuleBase get()
			{
                return new AudioPlayerModule(context);
            }
        });
		return modules;
	}

	@Override
	public List<Class<? extends HippyJavaScriptModule>> getJavaScriptModules()
	{
		List<Class<? extends HippyJavaScriptModule>> jsModules = new ArrayList<>();
		jsModules.add(EventDispatcher.class);
		jsModules.add(Dimensions.class);
		return jsModules;
	}

	@Override
	public List<Class<? extends HippyViewController>> getControllers()
	{
		List<Class<? extends HippyViewController>> components = new ArrayList<>();
		components.add(HippyTextViewController.class);
		components.add(HippyViewGroupController.class);
		components.add(HippyImageViewController.class);
		components.add(HippyListViewController.class);
		components.add(HippyListItemViewController.class);
		components.add(HippyTextInputController.class);
		components.add(HippyScrollViewController.class);
		components.add(HippyViewPagerController.class);
		components.add(HippyViewPagerItemController.class);
		components.add(HippyModalHostManager.class);
		components.add(RefreshWrapperController.class);
		components.add(RefreshWrapperItemController.class);
		components.add(HippyPullHeaderViewController.class);
		components.add(HippyPullFooterViewController.class);
		components.add(NavigatorController.class);
		components.add(HippyWebViewController.class);
		components.add(AudioViewController.class);
		components.add(VideoHippyViewController.class);
		return components;
	}
}
