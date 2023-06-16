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

package com.tencent.mtt.hippy.devsupport.inspector.domain;

import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.view.MotionEvent;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.devsupport.inspector.Inspector;
import com.tencent.mtt.hippy.utils.LogUtils;
import org.json.JSONException;
import org.json.JSONObject;

public class InputDomain extends InspectorDomain {

    private static final String TAG = "InputDomain";
    private static final String DOMAIN_NAME = "Input";
    private static final String METHOD_EMULATE_TOUCH_FROM_MOUSE_EVENT =
        "emulateTouchFromMouseEvent";
    private final Handler handler;

    public InputDomain(Inspector inspector) {
        super(inspector);
        handler = new Handler(Looper.getMainLooper());
    }

    @Override
    public String getDomainName() {
        return DOMAIN_NAME;
    }

    @Override
    protected boolean handleRequest(HippyEngineContext context, String method, int id,
        JSONObject paramsObj) {
        if (METHOD_EMULATE_TOUCH_FROM_MOUSE_EVENT.equals(method)) {
            handleEmulateTouchFromMouseEvent(context, id, paramsObj);
            return true;
        }
        return false;
    }

    private void handleEmulateTouchFromMouseEvent(HippyEngineContext context, int id,
        JSONObject paramsObj) {
        try {
            String type = paramsObj.getString("type");
            int x = paramsObj.getInt("x");
            int y = paramsObj.getInt("y");
            String button = paramsObj.getString("button");
            int modifiers = paramsObj.optInt("modifiers", 0);
            long time = SystemClock.uptimeMillis();
            if ("mouseWheel".equals(type) && modifiers == 0) {
                int deltaX = paramsObj.getInt("deltaX");
                int deltaY = paramsObj.getInt("deltaY");
                MotionEvent down = MotionEvent.obtain(time, time, MotionEvent.ACTION_DOWN, x, y, 0);
                handler.post(() -> dispatchTouchEvent(context, down));
                MotionEvent move = MotionEvent.obtain(time, time, MotionEvent.ACTION_MOVE,
                    x + deltaX, y + deltaY, 0);
                handler.post(() -> dispatchTouchEvent(context, move));
                MotionEvent up = MotionEvent.obtain(time, time, MotionEvent.ACTION_UP, x + deltaX,
                    y + deltaY, 0);
                handler.post(() -> dispatchTouchEvent(context, up));
            } else if ("left".equals(button) && modifiers == 0) {
                int action;
                switch (type) {
                    case "mousePressed":
                        action = MotionEvent.ACTION_DOWN;
                        break;
                    case "mouseMoved":
                        action = MotionEvent.ACTION_MOVE;
                        break;
                    case "mouseReleased":
                    default:
                        action = MotionEvent.ACTION_UP;
                        break;
                }
                MotionEvent event = MotionEvent.obtain(0, 0, action, x, y, 0);
                handler.post(() -> dispatchTouchEvent(context, event));
            }
        } catch (JSONException e) {
            LogUtils.d(TAG, "parse error", e);
        }
        sendRspToFrontend(id, new JSONObject());
    }

    private void dispatchTouchEvent(HippyEngineContext context, MotionEvent event) {
        try {
            HippyRootView rootView = context.getInstance();
            if (rootView != null) {
                rootView.dispatchTouchEvent(event);
            }
        } finally {
            event.recycle();
        }
    }
}
