package com.tencent.mtt.hippy.example.module;

import android.content.Intent;
import android.text.TextUtils;
import android.util.Log;
import android.view.ViewGroup;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.annotation.HippyMethod;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.example.BaseActivity;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;

@SuppressWarnings({"unused", "deprecation"})
@HippyNativeModule(name = TestModule.CLASSNAME, names = {"TestModuleA", "TestModuleB"})
public class TestModule extends HippyNativeModuleBase {
    final static String CLASSNAME = "TestModule";

    public TestModule(HippyEngineContext context) {
        super(context);
    }

    @HippyMethod(name = "debug")
    public void debug(int instanceid) {
        ViewGroup hippyRootView = mContext.getRootView();
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

    @HippyMethod(name = "helloNative")
    public void helloNative(HippyMap hippyMap) {
        //这里回来的参数可以为java的基础类型，和hippymap与hippyarry,但是前端调用的时候必须对应上
        String hello = hippyMap.getString("hello");
        Log.d("TestModule", hello);
    }

    @HippyMethod(name = "helloNativeWithPromise")
    public void helloNativeWithPromise(HippyMap hippyMap, Promise promise) {
        //这里回来的参数可以为java的基础类型，和hippymap与hippyarry,但是前端调用的时候必须对应上
        String hello = hippyMap.getString("hello");
        Log.d("TestModule", hello);

        if (!TextUtils.isEmpty(hello)) {
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
