package com.tencent.mtt.hippy.example.module;

import android.content.Intent;
import android.util.Log;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.annotation.HippyMethod;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.example.BaseActivity;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;

/**
 * @Description: the extend module
 * @author: edsheng
 * @date: 2018/3/22 10:51
 * @version: V1.0
 * 展示自定义module
 */

@HippyNativeModule(name = TestModule.CLASSNAME)
public class TestModule extends HippyNativeModuleBase {
    final static String CLASSNAME = "TestModule";

    public TestModule(HippyEngineContext context) {
        super(context);
    }

    @HippyMethod(name = "debug")
    public void debug(int instanceid) {
        HippyRootView hippyRootView = mContext.getInstance(instanceid);
        Intent intent = new Intent();
        intent.setClass(hippyRootView.getContext(), BaseActivity.class);
        hippyRootView.getContext().startActivity(intent);
    }


    /***
     * TestModule
     * @param log
     * 自定义了扩展了一个log的接口并且无回调
     */
    @HippyMethod(name = "log")
    public void log(String log) {
        //这里回来的参数可以为java的基础类型，和hippymap与hippyarry,但是前端调用的时候必须对应上
        Log.d("TestModule", log);
    }

    /**
     * 展示前端回来的是一个对象
     *
     * @param hippyMap
     */
    @HippyMethod(name = "helloNative")
    public void helloNative(HippyMap hippyMap) {
        //这里回来的参数可以为java的基础类型，和hippymap与hippyarry,但是前端调用的时候必须对应上
        String hello = hippyMap.getString("hello");
        Log.d("TestModule", hello);
    }

    /**
     * 展示终端需要给前端回调参数
     *
     * @param hippyMap
     */
    @HippyMethod(name = "helloNativeWithPromise")
    public void helloNativeWithPromise(HippyMap hippyMap, Promise promise) {
        //这里回来的参数可以为java的基础类型，和hippymap与hippyarry,但是前端调用的时候必须对应上
        String hello = hippyMap.getString("hello");
        Log.d("TestModule", hello);

        if (true) {
            //TODO： 如果模块这里处理成功回调resolve
            HippyMap hippyMap1 = new HippyMap();
            hippyMap1.pushInt("code", 1);
            hippyMap1.pushString("result", "hello i am from native");
            promise.resolve(hippyMap1);
        } else {
            //失败就回调reject
            HippyMap hippyMap1 = new HippyMap();
            hippyMap1.pushInt("code", -1);
            promise.reject(hippyMap1);
        }

    }
}
