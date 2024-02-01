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

import androidx.annotation.NonNull;
import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.uimanager.HippyGroupController;
import com.tencent.renderer.NativeRendererManager;
import com.tencent.renderer.utils.EventUtils;

import static com.tencent.renderer.utils.EventUtils.EVENT_MODAL_REQUEST_CLOSE;
import static com.tencent.renderer.utils.EventUtils.EVENT_MODAL_SHOW;

@HippyController(name = HippyModalHostManager.CLASS_NAME, dispatchWithStandardType = true)
public class HippyModalHostManager extends HippyGroupController<HippyModalHostView> {

    public static final String CLASS_NAME = "Modal";

    @Override
    protected View createViewImpl(Context context) {
        final HippyModalHostView modalHostView = createModalHostView(context);
        modalHostView.setOnRequestCloseListener(new HippyModalHostView.OnRequestCloseListener() {
            @Override
            public void onRequestClose(DialogInterface dialog) {
                EventUtils.sendComponentEvent(modalHostView, EVENT_MODAL_REQUEST_CLOSE, null);
            }
        });
        modalHostView.setOnShowListener(new DialogInterface.OnShowListener() {
            @Override
            public void onShow(DialogInterface dialog) {
                EventUtils.sendComponentEvent(modalHostView, EVENT_MODAL_SHOW, null);
            }
        });
        return modalHostView;
    }

    protected HippyModalHostView createModalHostView(Context context) {
        return new HippyModalHostView(context);
    }

    @Override
    public void onViewDestroy(HippyModalHostView hippyModalHostView) {
        super.onViewDestroy(hippyModalHostView);
        int rootId = NativeRendererManager.getRootId(hippyModalHostView.getContext());
        hippyModalHostView.onInstanceDestroy(rootId);
    }

    @HippyControllerProps(name = "animationType", defaultType = HippyControllerProps.STRING,
            defaultString = "none")
    public void setAnimationType(HippyModalHostView view, String animationType) {
        view.setAnimationType(animationType);
    }

    @HippyControllerProps(name = "autoHideStatusBar", defaultType = HippyControllerProps.BOOLEAN)
    public void autoHideStatusBar(HippyModalHostView view, boolean fullScreen) {
        view.autoHideStatusBar(fullScreen);
    }

    @HippyControllerProps(name = "autoHideNavigationBar", defaultType = HippyControllerProps.BOOLEAN)
    public void autoHideNavigationBar(HippyModalHostView view, boolean fullScreen) {
        view.autoHideNavigationBar(fullScreen);
    }

    @HippyControllerProps(name = "immersionStatusBar", defaultType = HippyControllerProps.BOOLEAN)
    public void setEnterImmersionStatusBar(HippyModalHostView view, boolean fullScreen) {
        view.setEnterImmersionStatusBar(fullScreen);
    }

    @HippyControllerProps(name = "darkStatusBarText", defaultType = HippyControllerProps.BOOLEAN)
    public void setImmersionStatusBarTextDarkColor(HippyModalHostView view, boolean fullScreen) {
        view.setImmersionStatusBarTextDarkColor(fullScreen);
    }

    @HippyControllerProps(name = "transparent", defaultType = HippyControllerProps.BOOLEAN)
    public void setTransparent(HippyModalHostView view, boolean transparent) {
        view.setTransparent(transparent);
    }

    @Override
    public void onAfterUpdateProps(@NonNull HippyModalHostView v) {
        super.onAfterUpdateProps(v);
        v.showOrUpdate();
    }

}
