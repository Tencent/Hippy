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
package com.tencent.mtt.hippy.utils;

import android.util.Log;

import com.tencent.mtt.hippy.BuildConfig;

/**
 * 1.0 xiandongluo on 2017/11/14
 */
public class LogUtils
{
	private static boolean DEBUG_ENABLE = BuildConfig.DEBUG;

    public static void enableDebugLog(boolean debuggable)
    {
        DEBUG_ENABLE = debuggable;
    }

	public static int d(String tag, String msg)
	{
		if (DEBUG_ENABLE)
		{
			return Log.d(tag, msg);
		}
		else
		{
			return 0;
		}
	}

    public static int l(String tag, String msg)
    {
        if (DEBUG_ENABLE)
        {
            int index = 0; // 当前位置
            int max = 3800;// 需要截取的最大长度,别用4000
            String sub; // 进行截取操作的string
            while (index < msg.length())
            {
                if (msg.length() < max)
                { // 如果长度比最大长度小
                    max = msg.length(); // 最大长度设为length,全部截取完成.
                    sub = msg.substring(index, max);
                }
                else
                {
                    sub = msg.substring(index, max);
                }
                Log.i(tag, sub);
                index = max;
                max += 3800;
            }
            return 0;
        }
        else
        {
            return 0;
        }
    }

	public static  int d(String tag,String msg,Throwable throwable)
    {
        if (DEBUG_ENABLE)
        {
            return Log.d(tag, msg,throwable);
        }
        else
        {
            return 0;
        }
    }

    public static int w(String tag, String msg)
    {
        if (DEBUG_ENABLE)
        {
            return Log.w(tag, msg);
        }
        else
        {
            return 0;
        }
    }

    public static int i(String tag, String msg)
    {
        if (DEBUG_ENABLE)
        {
            return Log.i(tag, msg);
        }
        else
        {
            return 0;
        }
    }

    public static int v(String tag, String msg)
    {
        if (DEBUG_ENABLE)
        {
            return Log.v(tag, msg);
        }
        else
        {
            return 0;
        }
    }

    public static int e(String tag, String msg)
    {
        return Log.e(tag, msg);
    }

    public static int e(String tag, String msg,Throwable e)
    {
        return Log.e(tag, msg,e);
    }
}
