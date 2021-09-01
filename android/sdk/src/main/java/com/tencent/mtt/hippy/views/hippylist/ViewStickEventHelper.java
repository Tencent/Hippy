package com.tencent.mtt.hippy.views.hippylist;

import android.view.View;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.HippyViewEvent;
import com.tencent.mtt.nxeasy.recyclerview.helper.skikcy.StickViewListener;

/**
 * Created by niuniuyang on 2021/8/24.
 * Description
 * 吸顶事件分发器
 */
public class ViewStickEventHelper implements StickViewListener {

    public static final String ON_VIEW_SUSPEND_LISTENER = "onViewSuspendListener";
    public static final String IS_SHOW = "isShow";
    private View view;

    public ViewStickEventHelper(View view) {
        this.view = view;
    }

    @Override
    public void onStickAttached(int stickyPosition) {
        notifyStickEvent(true);
    }

    @Override
    public void onStickDetached(int stickyPosition) {
        notifyStickEvent(false);
    }

    private void notifyStickEvent(boolean isStickViewShown) {
        HippyMap map = new HippyMap();
        map.pushBoolean(IS_SHOW, isStickViewShown);
        new HippyViewEvent(ON_VIEW_SUSPEND_LISTENER).send(view, map);
    }
}
