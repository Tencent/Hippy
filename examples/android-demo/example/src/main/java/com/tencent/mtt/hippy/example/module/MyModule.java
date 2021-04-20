package com.tencent.mtt.hippy.example.module;

import android.util.Log;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.annotation.HippyMethod;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;
import com.tencent.mtt.hippy.utils.LogUtils;

@HippyNativeModule(name = MyModule.CLASSNAME)
public class MyModule extends HippyNativeModuleBase
{
	final static String	CLASSNAME	= "MyModule";

	public MyModule(HippyEngineContext context)
	{
		super(context);
	}

	//if you want to use android context ,the first param can be HippyRootView
    @HippyMethod(name = "show")
	public void show(String message)
	{
		LogUtils.d(CLASSNAME, message);
		// Toast.makeText(hippyRootView.getContext(), message, Toast.LENGTH_SHORT).show();
	}

	//Promise can send message to js
    @HippyMethod(name = "callMeWithPromise")
    public void callMeWithPromise(HippyMap message, Promise promise)
    {
        Log.d(CLASSNAME,message.toString());
        HippyMap hippyMap = new HippyMap();
        hippyMap.pushString("result","this is from callMeWithPromise");
        promise.resolve(hippyMap);
    }
}
