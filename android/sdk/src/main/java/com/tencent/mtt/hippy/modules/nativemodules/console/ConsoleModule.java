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
package com.tencent.mtt.hippy.modules.nativemodules.console;

import android.util.Log;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.annotation.HippyMethod;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;

/**
 * FileName: ConsoleModule
 * Description：
 * History：
 * 2019/3/5 前端输出log给终端看，通过console类。不需要调用LogUtils来控制。由前端自己控制log信息。
 * 否则sdk使用者会经常找你打debug包的。
 */
@HippyNativeModule(name= "ConsoleModule")
public class ConsoleModule extends HippyNativeModuleBase
{
	public ConsoleModule(HippyEngineContext context)
	{
		super(context);
	}

    @HippyMethod(name="log")
	public void log(String message)
    {
        Log.d("hippy_console",message);
    }

    @HippyMethod(name="warn")
    public void warn(String message)
    {
		Log.w("hippy_console",message);
    }

    @HippyMethod(name="info")
    public void info(String message)
    {
		Log.i("hippy_console",message);
    }

    @HippyMethod(name="error")
    public void error(String message)
    {
		Log.e("hippy_console",message);
    }
}
