package com.tencent.mtt.hippy.example;

import com.tencent.mtt.hippy.HippyAPIProvider;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.common.Provider;
import com.tencent.mtt.hippy.example.module.MyModule;
import com.tencent.mtt.hippy.example.module.TestModule;
import com.tencent.mtt.hippy.example.view.MyViewController;
import com.tencent.mtt.hippy.modules.javascriptmodules.HippyJavaScriptModule;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;
import com.tencent.mtt.hippy.uimanager.HippyViewController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @Description: extend module,view
 * @author: edsheng
 * @date: 2018/3/22 10:23
 * @version: V1.0
 */

public class MyAPIProvider implements HippyAPIProvider
{
	/**
	 * 接口：用来让JavaScript调用Java层的接口
	 */
	@Override
	public Map<Class<? extends HippyNativeModuleBase>, Provider<? extends HippyNativeModuleBase>> getNativeModules(final HippyEngineContext context)
	{
		Map<Class<? extends HippyNativeModuleBase>, Provider<? extends HippyNativeModuleBase>> modules = new HashMap<>();

		//regist the MyModule
		modules.put(MyModule.class, new Provider<HippyNativeModuleBase>()
		{
			@Override
			public HippyNativeModuleBase get()
			{
				return new MyModule(context);
			}
		});
    modules.put(TestModule.class, new Provider<HippyNativeModuleBase>()
    {
      @Override
      public HippyNativeModuleBase get()
      {
        return new TestModule(context);
      }
    });

		return modules;
	}

	/**
	 * 接口：Java层用来调用JavaScript里的同名接口
	 */
	@Override
	public List<Class<? extends HippyJavaScriptModule>> getJavaScriptModules()
	{
		return null;
	}

	/**
	 * 接口：用来构造各种JavaScript需要的自定义的View组件
	 */
	@Override
	public List<Class<? extends HippyViewController>> getControllers()
	{
		List<Class<? extends HippyViewController>> components = new ArrayList<>();
		//regist the MyViewController
		components.add(MyViewController.class);
		return components;
	}
}
